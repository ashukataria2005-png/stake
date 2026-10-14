"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
  Gift,
  Ticket,
  Trophy,
  Lock,
  FileText,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Info,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  Upload,
  RefreshCw,
  ExternalLink,
  ClipboardList,
  Check,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";

export type TransactionCategory =
  | "CATEGORIES"
  | "DEPOSITS"
  | "WITHDRAWALS"
  | "BONUSES"
  | "RAFFLES"
  | "RACES"
  | "VAULT"
  | "OTHER";

export interface TransactionItem {
  id: string;
  type: "DEPOSIT" | "WITHDRAWAL";
  amount: number;
  currency: string;
  utrNumber?: string | null;
  method: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  destination?: string;
  orderId?: string;
}

interface TransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: TransactionCategory;
}

export default function TransactionsModal({
  isOpen,
  onClose,
  initialCategory = "CATEGORIES",
}: TransactionsModalProps) {
  const { user, openWalletModal } = useGame();
  const [mounted, setMounted] = useState(false);
  const [currentView, setCurrentView] = useState<TransactionCategory>(initialCategory);
  const [currencyMode, setCurrencyMode] = useState<"LOCAL" | "CRYPTO">("LOCAL");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Tap-on-status / Enquiry modal
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);
  const [enquiryUtr, setEnquiryUtr] = useState("");
  const [enquiryProofFile, setEnquiryProofFile] = useState<string | null>(null);
  const [enquiryError, setEnquiryError] = useState("");
  const [enquirySuccess, setEnquirySuccess] = useState("");
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync initialCategory when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentView(initialCategory);
      setIsCategoryDropdownOpen(false);
      setSelectedTx(null);
      setCurrentPage(1);
    }
  }, [isOpen, initialCategory]);

  // Background scroll lock
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow || "unset";
      };
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        if (selectedTx) {
          setSelectedTx(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedTx, onClose]);

  // Fetch transactions from Neon DB API and localStorage
  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    const merged: TransactionItem[] = [];

    // 1. Fetch from Neon DB API
    try {
      const activeUserId = user?.id || user?.username || "";
      const res = await fetch(
        `/api/wallet/transactions?userId=${encodeURIComponent(activeUserId)}`
      );
      const data = await res.json();
      if (data?.success && Array.isArray(data.transactions)) {
        data.transactions.forEach((tx: any) => {
          merged.push({
            id: tx.id,
            type: tx.type === "WITHDRAWAL" ? "WITHDRAWAL" : "DEPOSIT",
            amount: Number(tx.amount),
            currency: tx.currency || "INR",
            utrNumber: tx.utrNumber,
            method: tx.method || "UPI",
            status:
              tx.status === "APPROVED"
                ? "APPROVED"
                : tx.status === "REJECTED"
                ? "REJECTED"
                : "PENDING",
            createdAt: tx.createdAt,
            orderId: tx.id,
          });
        });
      }
    } catch (err) {
      console.error("[TransactionsModal] API fetch failed:", err);
    }

    // 2. Merge local storage deposit orders
    try {
      const localDeposits = localStorage.getItem("stake_deposit_orders");
      if (localDeposits) {
        const parsed = JSON.parse(localDeposits);
        if (Array.isArray(parsed)) {
          parsed.forEach((ord: any) => {
            const exists = merged.some(
              (m) => m.orderId === ord.orderId || (ord.utr && m.utrNumber === ord.utr)
            );
            if (!exists) {
              merged.push({
                id: ord.orderId || `dep_${Date.now()}`,
                orderId: ord.orderId,
                type: "DEPOSIT",
                amount: Number(ord.amountINR || 500),
                currency: "INR",
                utrNumber: ord.utr || null,
                method: "UPI",
                status: ord.status === "Success" ? "APPROVED" : "PENDING",
                createdAt: ord.date || new Date().toISOString(),
              });
            }
          });
        }
      }
    } catch {}

    // 3. Merge local storage withdrawals
    try {
      const localWithdrawals = localStorage.getItem("stake_withdrawals");
      if (localWithdrawals) {
        const parsed = JSON.parse(localWithdrawals);
        if (Array.isArray(parsed)) {
          parsed.forEach((wd: any) => {
            const exists = merged.some((m) => m.id === wd.id);
            if (!exists) {
              merged.push({
                id: wd.id || `wd_${Date.now()}`,
                orderId: wd.id,
                type: "WITHDRAWAL",
                amount: Number(wd.amountINR || 500),
                currency: "INR",
                destination: wd.destination,
                method: wd.destination?.includes("@") ? "UPI" : "Bank Transfer",
                status: wd.status === "Approved" ? "APPROVED" : "PENDING",
                createdAt: wd.date || new Date().toISOString(),
              });
            }
          });
        }
      }
    } catch {}

    // Sort descending by date
    merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setTransactions(merged);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      fetchTransactions();
    }
  }, [isOpen, fetchTransactions]);

  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    sounds.playClick();
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Submit enquiry / late UTR
  const handleEnquirySubmit = async () => {
    if (!selectedTx) return;
    const cleanUtr = enquiryUtr.replace(/\D/g, "").slice(0, 12);
    if (cleanUtr.length !== 12) {
      setEnquiryError("Please enter a valid 12-digit numeric UTR reference number.");
      return;
    }

    setEnquiryError("");
    setIsSubmittingEnquiry(true);
    sounds.playClick();

    try {
      await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: selectedTx.amount,
          currency: selectedTx.currency,
          utrNumber: cleanUtr,
          orderId: selectedTx.orderId || selectedTx.id,
          method: selectedTx.method || "UPI",
          autoCredit: true,
          isLateSubmission: true,
          screenshotProof: enquiryProofFile,
        }),
      });

      // Update local storage
      const localDeposits = localStorage.getItem("stake_deposit_orders");
      if (localDeposits) {
        const parsed = JSON.parse(localDeposits);
        const updated = parsed.map((o: any) =>
          o.orderId === selectedTx.orderId || o.orderId === selectedTx.id
            ? { ...o, status: "Success", utr: cleanUtr }
            : o
        );
        localStorage.setItem("stake_deposit_orders", JSON.stringify(updated));
      }

      sounds.playSuccessChime();
      setEnquirySuccess("Enquiry submitted successfully! Verification in progress.");
      setIsSubmittingEnquiry(false);
      setTimeout(() => {
        setSelectedTx(null);
        setEnquirySuccess("");
        setEnquiryUtr("");
        setEnquiryProofFile(null);
        fetchTransactions();
      }, 1500);
    } catch (err) {
      console.error("[TransactionsModal] Enquiry error:", err);
      setEnquiryError("Failed to submit enquiry. Please try again.");
      setIsSubmittingEnquiry(false);
    }
  };

  // Download Statement as CSV
  const handleDownloadStatement = () => {
    sounds.playClick();
    const rows = [
      ["Date", "Type", "Amount", "Currency", "Status", "Method", "UTR / Ref", "Order ID"],
    ];

    const currentList =
      currentView === "DEPOSITS"
        ? transactions.filter((t) => t.type === "DEPOSIT")
        : currentView === "WITHDRAWALS"
        ? transactions.filter((t) => t.type === "WITHDRAWAL")
        : transactions;

    currentList.forEach((tx) => {
      rows.push([
        new Date(tx.createdAt).toLocaleDateString(),
        tx.type,
        tx.amount.toFixed(2),
        tx.currency,
        tx.status,
        tx.method,
        tx.utrNumber || "N/A",
        tx.orderId || tx.id,
      ]);
    });

    const csvContent =
      "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `stake_${currentView.toLowerCase()}_statement_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered deposits & withdrawals
  const depositsList = useMemo(() => {
    return transactions.filter((t) => t.type === "DEPOSIT");
  }, [transactions]);

  const withdrawalsList = useMemo(() => {
    return transactions.filter((t) => t.type === "WITHDRAWAL");
  }, [transactions]);

  // Paginated active list
  const activeList = currentView === "DEPOSITS" ? depositsList : withdrawalsList;
  const totalPages = Math.max(1, Math.ceil(activeList.length / itemsPerPage));
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return activeList.slice(start, start + itemsPerPage);
  }, [activeList, currentPage]);

  if (!isOpen || !mounted) return null;

  const categories = [
    {
      id: "DEPOSITS" as TransactionCategory,
      title: "Deposits",
      icon: ArrowDownLeft,
      iconColor: "text-[#00e701] bg-[#00e701]/10",
      count: depositsList.length,
    },
    {
      id: "WITHDRAWALS" as TransactionCategory,
      title: "Withdrawals",
      icon: ArrowUpRight,
      iconColor: "text-amber-400 bg-amber-500/10",
      count: withdrawalsList.length,
    },
    {
      id: "BONUSES" as TransactionCategory,
      title: "Bonuses",
      icon: Gift,
      iconColor: "text-purple-400 bg-purple-500/10",
      count: 0,
    },
    {
      id: "RAFFLES" as TransactionCategory,
      title: "Raffles",
      icon: Ticket,
      iconColor: "text-cyan-400 bg-cyan-500/10",
      count: 0,
    },
    {
      id: "RACES" as TransactionCategory,
      title: "Races",
      icon: Trophy,
      iconColor: "text-yellow-400 bg-yellow-500/10",
      count: 0,
    },
    {
      id: "VAULT" as TransactionCategory,
      title: "Vault",
      icon: Lock,
      iconColor: "text-blue-400 bg-blue-500/10",
      count: 0,
    },
    {
      id: "OTHER" as TransactionCategory,
      title: "Other",
      icon: FileText,
      iconColor: "text-[#879097] bg-[#213743]",
      count: 0,
    },
  ];

  const categoryTitles: Record<TransactionCategory, string> = {
    CATEGORIES: "Transactions",
    DEPOSITS: "Deposits",
    WITHDRAWALS: "Withdrawals",
    BONUSES: "Bonuses",
    RAFFLES: "Raffles",
    RACES: "Races",
    VAULT: "Vault",
    OTHER: "Other",
  };

  return createPortal(
    <div className="fixed inset-0 z-[9990] flex items-center justify-center sm:p-4 select-none">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={() => {
          sounds.playClick();
          onClose();
        }}
      />

      {/* Modal / Drawer Card */}
      <div className="relative w-full sm:max-w-md md:max-w-lg h-full sm:h-auto sm:max-h-[92vh] flex flex-col bg-[#0f212e] sm:border sm:border-[#213743] sm:rounded-2xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* ========================================================= */}
        {/* TOP HEADER */}
        {/* ========================================================= */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#213743] bg-[#0f212e] shrink-0">
          {currentView === "CATEGORIES" ? (
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#213743] text-white">
                <Receipt className="h-4.5 w-4.5 text-[#00e701]" />
              </div>
              <h2 className="text-base font-black text-white tracking-wide">Transactions</h2>
            </div>
          ) : (
            <div className="flex items-center gap-2 relative">
              {/* Back to Categories Arrow */}
              <button
                onClick={() => {
                  sounds.playClick();
                  setCurrentView("CATEGORIES");
                  setIsCategoryDropdownOpen(false);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#213743] text-[#b1bad3] hover:text-white hover:bg-[#2a4454] transition-colors cursor-pointer"
                title="Back to Categories"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* Category Selector Pill with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsCategoryDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#213743] hover:bg-[#2a4454] text-white text-sm font-black transition-colors cursor-pointer"
                >
                  <span>{categoryTitles[currentView]}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-[#879097] transition-transform duration-200 ${
                      isCategoryDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isCategoryDropdownOpen && (
                  <div className="absolute left-0 top-full mt-1.5 w-44 rounded-xl bg-[#1a2c38] border border-[#2f4553] shadow-2xl py-1 z-30 animate-in fade-in zoom-in-95 duration-100">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          sounds.playClick();
                          setCurrentView(cat.id);
                          setCurrentPage(1);
                          setIsCategoryDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs font-bold flex items-center justify-between hover:bg-[#213743] transition-colors cursor-pointer ${
                          currentView === cat.id ? "text-[#00e701]" : "text-[#b1bad3] hover:text-white"
                        }`}
                      >
                        <span>{cat.title}</span>
                        {currentView === cat.id && <Check className="h-3.5 w-3.5" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#879097] hover:text-white hover:bg-[#213743] transition-colors cursor-pointer"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ========================================================= */}
        {/* BODY CONTAINER */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
          {/* ------------------------------------------------------- */}
          {/* 1. MAIN CATEGORIES NAVIGATION LIST (Screenshot 178) */}
          {/* ------------------------------------------------------- */}
          {currentView === "CATEGORIES" && (
            <div className="space-y-1.5 py-0.5">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      sounds.playClick();
                      setCurrentView(cat.id);
                      setCurrentPage(1);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#1a2c38] hover:bg-[#213743] border border-[#213743] hover:border-[#2f4553] transition-all cursor-pointer group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg ${cat.iconColor}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-bold text-white group-hover:text-white">
                        {cat.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {cat.count > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-[#14232d] text-[#b1bad3] text-[11px] font-bold">
                          {cat.count}
                        </span>
                      )}
                      <ChevronRight className="h-4 w-4 text-[#879097] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* ------------------------------------------------------- */}
          {/* 2. DEPOSITS SUB-VIEW (Screenshots 179, 180, 181) */}
          {/* ------------------------------------------------------- */}
          {currentView === "DEPOSITS" && (
            <div className="space-y-3.5">
              {/* Currency Segmented Toggle */}
              <div className="grid grid-cols-2 p-1 rounded-xl bg-[#0f212e] border border-[#213743]">
                <button
                  onClick={() => {
                    sounds.playClick();
                    setCurrencyMode("CRYPTO");
                  }}
                  className={`py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                    currencyMode === "CRYPTO"
                      ? "bg-[#213743] text-white shadow-sm"
                      : "text-[#879097] hover:text-white"
                  }`}
                >
                  Crypto
                </button>
                <button
                  onClick={() => {
                    sounds.playClick();
                    setCurrencyMode("LOCAL");
                  }}
                  className={`py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                    currencyMode === "LOCAL"
                      ? "bg-[#213743] text-white shadow-sm"
                      : "text-[#879097] hover:text-white"
                  }`}
                >
                  Local Currency
                </button>
              </div>

              {/* Exact Info Banner (Screenshot 180) */}
              <div className="rounded-xl bg-[#142634] border border-[#1d3d54] p-3.5 flex items-start gap-3 text-left">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 mt-0.5">
                  <Info className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-white tracking-wide">
                    New Update : Tap the Status
                  </span>
                  <p className="text-[11px] text-[#b1bad3] mt-0.5 leading-relaxed">
                    You can now tap on a transaction status to view its details or raise an enquiry.
                  </p>
                </div>
              </div>

              {/* Deposits Table */}
              <div className="rounded-xl bg-[#0f212e] border border-[#213743] overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-4 px-3 py-2 bg-[#1a2c38] border-b border-[#213743] text-[10px] font-black uppercase tracking-wider text-[#879097]">
                  <div>Date</div>
                  <div>Amount</div>
                  <div>Status</div>
                  <div className="text-right">ID</div>
                </div>

                {/* Table Body */}
                {paginatedList.length === 0 ? (
                  <div className="py-10 flex flex-col items-center justify-center text-center px-4">
                    <ClipboardList className="h-10 w-10 text-[#2f4553] mb-2" />
                    <p className="text-sm font-bold text-white">No Deposits Found</p>
                    <p className="text-xs text-[#879097] mt-1 max-w-xs">
                      You haven&apos;t made any deposit requests in this currency mode yet.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#213743]/50">
                    {paginatedList.map((tx) => {
                      const isPending = tx.status === "PENDING";
                      const isApproved = tx.status === "APPROVED";
                      const dateObj = new Date(tx.createdAt);
                      const formattedDate = dateObj.toLocaleDateString("en-US", {
                        month: "2-digit",
                        day: "2-digit",
                        year: "numeric",
                      });
                      const displayId = (tx.orderId || tx.id).slice(-8);

                      return (
                        <div
                          key={tx.id}
                          onClick={() => {
                            sounds.playClick();
                            setSelectedTx(tx);
                            setEnquiryUtr(tx.utrNumber || "");
                            setEnquiryError("");
                            setEnquirySuccess("");
                          }}
                          className="grid grid-cols-4 px-3 py-2 items-center text-xs hover:bg-[#1a2c38] transition-colors cursor-pointer group"
                        >
                          {/* Date */}
                          <div className="text-[#b1bad3] font-medium truncate">
                            {formattedDate}
                          </div>

                          {/* Amount with Indian Flag Badge */}
                          <div className="flex items-center gap-1 font-black text-white">
                            <span>₹{tx.amount.toFixed(2)}</span>
                            <span className="text-xs" title="INR">
                              🇮🇳
                            </span>
                          </div>

                          {/* Interactive Status Badge */}
                          <div>
                            {isPending ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-black group-hover:scale-105 transition-transform">
                                <Clock className="h-2.5 w-2.5 animate-pulse" />
                                Pending
                              </span>
                            ) : isApproved ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#00e701]/15 border border-[#00e701]/30 text-[#00e701] text-[10px] font-black group-hover:scale-105 transition-transform">
                                <CheckCircle2 className="h-2.5 w-2.5" />
                                Success
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/15 border border-red-500/30 text-red-400 text-[10px] font-black group-hover:scale-105 transition-transform">
                                <AlertCircle className="h-2.5 w-2.5" />
                                Failed
                              </span>
                            )}
                          </div>

                          {/* ID with Copy Icon */}
                          <div className="flex items-center justify-end gap-1 text-[#879097] font-mono text-[11px] group-hover:text-white">
                            <span className="truncate max-w-[70px]">{displayId}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(tx.orderId || tx.id, tx.id);
                              }}
                              className="p-1 hover:text-white text-[#879097] rounded cursor-pointer"
                              title="Copy ID"
                            >
                              {copiedId === tx.id ? (
                                <Check className="h-3 w-3 text-[#00e701]" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bottom Pagination & Download Actions */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between px-1 text-xs">
                  <span className="text-[#879097] font-bold">
                    {activeList.length} results | Page {currentPage} of {totalPages}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={currentPage <= 1}
                      onClick={() => {
                        sounds.playClick();
                        setCurrentPage((prev) => Math.max(1, prev - 1));
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#213743] hover:bg-[#2a4454] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Previous
                    </button>
                    <button
                      disabled={currentPage >= totalPages}
                      onClick={() => {
                        sounds.playClick();
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#213743] hover:bg-[#2a4454] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>

                {/* Full-width Download Button */}
                <button
                  onClick={handleDownloadStatement}
                  className="w-full py-3 rounded-xl bg-[#213743] hover:bg-[#2a4454] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.99]"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------- */}
          {/* 3. WITHDRAWALS SUB-VIEW (Screenshot 182) */}
          {/* ------------------------------------------------------- */}
          {currentView === "WITHDRAWALS" && (
            <div className="space-y-3.5">
              {/* Currency Segmented Toggle */}
              <div className="grid grid-cols-2 p-1 rounded-xl bg-[#0f212e] border border-[#213743]">
                <button
                  onClick={() => {
                    sounds.playClick();
                    setCurrencyMode("CRYPTO");
                  }}
                  className={`py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                    currencyMode === "CRYPTO"
                      ? "bg-[#213743] text-white shadow-sm"
                      : "text-[#879097] hover:text-white"
                  }`}
                >
                  Crypto
                </button>
                <button
                  onClick={() => {
                    sounds.playClick();
                    setCurrencyMode("LOCAL");
                  }}
                  className={`py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                    currencyMode === "LOCAL"
                      ? "bg-[#213743] text-white shadow-sm"
                      : "text-[#879097] hover:text-white"
                  }`}
                >
                  Local Currency
                </button>
              </div>

              {withdrawalsList.length === 0 ? (
                /* Empty Clipboard Illustration (Screenshot 182) */
                <div className="py-14 flex flex-col items-center justify-center text-center px-4 rounded-xl bg-[#14232d] border border-[#213743]">
                  {/* Styled Clipboard Icon with soft cyan/blue accent */}
                  <div className="relative mb-3 flex items-center justify-center">
                    <div className="h-20 w-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shadow-lg shadow-cyan-500/5">
                      <ClipboardList className="h-10 w-10 text-cyan-400 stroke-[1.5]" />
                    </div>
                  </div>

                  <h3 className="text-base font-black text-white">No Withdrawals</h3>
                  <p className="text-xs text-[#879097] mt-1.5 max-w-xs leading-relaxed">
                    You have not made any withdrawal requests yet.
                  </p>

                  <button
                    onClick={() => {
                      sounds.playClick();
                      onClose();
                      openWalletModal();
                    }}
                    className="mt-5 px-5 py-2.5 rounded-xl bg-[#00e701] hover:bg-[#00c801] text-[#0f212e] font-black text-xs transition-transform active:scale-95 cursor-pointer shadow-lg shadow-[#00e701]/20"
                  >
                    Withdraw Funds
                  </button>
                </div>
              ) : (
                /* Table of Withdrawals */
                <>
                  <div className="rounded-xl bg-[#0f212e] border border-[#213743] overflow-hidden">
                    <div className="grid grid-cols-5 px-3 py-2 bg-[#1a2c38] border-b border-[#213743] text-[10px] font-black uppercase tracking-wider text-[#879097]">
                      <div>Date</div>
                      <div>Amount</div>
                      <div>Type</div>
                      <div>Status</div>
                      <div className="text-right">ID</div>
                    </div>

                    <div className="divide-y divide-[#213743]/50">
                      {paginatedList.map((tx) => (
                        <div
                          key={tx.id}
                          onClick={() => {
                            sounds.playClick();
                            setSelectedTx(tx);
                          }}
                          className="grid grid-cols-5 px-3 py-2 items-center text-xs hover:bg-[#1a2c38] transition-colors cursor-pointer"
                        >
                          <div className="text-[#b1bad3]">
                            {new Date(tx.createdAt).toLocaleDateString("en-US", {
                              month: "2-digit",
                              day: "2-digit",
                            })}
                          </div>
                          <div className="font-black text-white">₹{tx.amount.toFixed(2)}</div>
                          <div className="text-[#879097] text-[11px] truncate">{tx.method}</div>
                          <div>
                            {tx.status === "APPROVED" ? (
                              <span className="px-1.5 py-0.5 rounded bg-[#00e701]/15 text-[#00e701] text-[10px] font-black">
                                Success
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 text-[10px] font-black">
                                Pending
                              </span>
                            )}
                          </div>
                          <div className="text-right text-[#879097] font-mono text-[11px]">
                            {tx.id.slice(-6)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions & Pagination */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between px-1 text-xs text-[#879097] font-bold">
                      <span>
                        {withdrawalsList.length} results | Page {currentPage} of {totalPages}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          disabled={currentPage <= 1}
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          className="px-3 py-1.5 rounded-lg bg-[#213743] hover:bg-[#2a4454] disabled:opacity-40 text-white text-xs font-bold"
                        >
                          Previous
                        </button>
                        <button
                          disabled={currentPage >= totalPages}
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          className="px-3 py-1.5 rounded-lg bg-[#213743] hover:bg-[#2a4454] disabled:opacity-40 text-white text-xs font-bold"
                        >
                          Next
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleDownloadStatement}
                      className="w-full py-3 rounded-xl bg-[#213743] hover:bg-[#2a4454] text-white font-bold text-xs flex items-center justify-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ------------------------------------------------------- */}
          {/* 4. OTHER VIEWS (Bonuses, Raffles, Races, Vault, Other) */}
          {/* ------------------------------------------------------- */}
          {!["CATEGORIES", "DEPOSITS", "WITHDRAWALS"].includes(currentView) && (
            <div className="py-16 flex flex-col items-center justify-center text-center px-4 rounded-xl bg-[#14232d] border border-[#213743]">
              <div className="h-16 w-16 rounded-2xl bg-[#213743] flex items-center justify-center mb-3 text-[#879097]">
                <Receipt className="h-8 w-8" />
              </div>
              <h3 className="text-base font-black text-white">No {categoryTitles[currentView]}</h3>
              <p className="text-xs text-[#879097] mt-1 max-w-xs leading-relaxed">
                You do not have any recorded transactions under this category.
              </p>
              <button
                onClick={() => {
                  sounds.playClick();
                  setCurrentView("CATEGORIES");
                }}
                className="mt-5 px-4 py-2 rounded-xl bg-[#213743] hover:bg-[#2a4454] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Back to Transactions
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* DETAILS / LATE UTR ENQUIRY MODAL (Screenshot 181) */}
      {/* ========================================================= */}
      {selectedTx && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#1a2c38] border border-[#2f4553] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#213743] bg-[#14232d]">
              <div className="flex items-center gap-2">
                <Receipt className="h-4.5 w-4.5 text-cyan-400" />
                <h3 className="text-sm font-black text-white">
                  {selectedTx.type === "DEPOSIT" ? "Deposit Details" : "Withdrawal Details"}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1 rounded-lg text-[#879097] hover:text-white hover:bg-[#213743] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 text-xs">
              {/* Summary Card */}
              <div className="rounded-xl bg-[#14232d] border border-[#213743] p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[#879097]">Amount</span>
                  <span className="text-base font-black text-white flex items-center gap-1">
                    ₹{selectedTx.amount.toFixed(2)} 🇮🇳
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#879097]">Status</span>
                  {selectedTx.status === "PENDING" ? (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Pending Verification
                    </span>
                  ) : selectedTx.status === "APPROVED" ? (
                    <span className="px-2 py-0.5 rounded-md bg-[#00e701]/15 border border-[#00e701]/30 text-[#00e701] font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Approved & Credited
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-red-500/15 border border-red-500/30 text-red-400 font-bold flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> Verification Failed
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#879097]">Order Reference</span>
                  <div className="flex items-center gap-1 font-mono text-white">
                    <span>{selectedTx.orderId || selectedTx.id}</span>
                    <button
                      onClick={() => handleCopy(selectedTx.orderId || selectedTx.id, "ref_modal")}
                      className="p-0.5 hover:text-cyan-400 text-[#879097] cursor-pointer"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#879097]">Date & Time</span>
                  <span className="text-[#b1bad3]">
                    {new Date(selectedTx.createdAt).toLocaleString()}
                  </span>
                </div>

                {selectedTx.utrNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#879097]">UTR Reference</span>
                    <span className="font-mono text-cyan-400 font-bold">
                      {selectedTx.utrNumber}
                    </span>
                  </div>
                )}
              </div>

              {/* Late UTR Submission / Raise Enquiry (Screenshot 181) */}
              {selectedTx.status === "PENDING" && selectedTx.type === "DEPOSIT" && (
                <div className="rounded-xl bg-[#142634] border border-[#1d3d54] p-3.5 space-y-3">
                  <div className="flex items-center gap-2 text-cyan-400 font-black text-xs">
                    <Info className="h-4 w-4" />
                    <span>Raise Enquiry / Submit UTR Proof</span>
                  </div>

                  <p className="text-[11px] text-[#b1bad3] leading-relaxed">
                    If you transferred the funds but haven&apos;t received credit, enter your bank
                    12-digit UTR below to speed up instant reconciliation:
                  </p>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#879097] uppercase">
                      12-Digit UTR / Reference No.
                    </label>
                    <input
                      type="text"
                      maxLength={12}
                      value={enquiryUtr}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 12);
                        setEnquiryUtr(val);
                        setEnquiryError("");
                      }}
                      placeholder="e.g. 428190382910"
                      className="w-full px-3 py-2.5 rounded-lg bg-[#0f212e] border border-[#213743] focus:border-cyan-400 text-white font-mono text-sm tracking-wider outline-none"
                    />
                  </div>

                  {/* Screenshot proof upload simulator */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#879097] uppercase">
                      Payment Screenshot Proof (Optional)
                    </label>
                    <label className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-dashed border-[#2f4553] hover:border-cyan-400/50 bg-[#0f212e]/50 text-[#879097] hover:text-white cursor-pointer transition-colors text-xs">
                      <Upload className="h-4 w-4" />
                      <span>{enquiryProofFile ? "Screenshot Attached ✓" : "Upload receipt / screenshot"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setEnquiryProofFile(file.name);
                            sounds.playClick();
                          }
                        }}
                      />
                    </label>
                  </div>

                  {enquiryError && (
                    <p className="text-[11px] font-bold text-red-400">{enquiryError}</p>
                  )}
                  {enquirySuccess && (
                    <p className="text-[11px] font-bold text-[#00e701]">{enquirySuccess}</p>
                  )}

                  <button
                    onClick={handleEnquirySubmit}
                    disabled={isSubmittingEnquiry || enquiryUtr.length !== 12}
                    className="w-full py-2.5 rounded-xl bg-[#00e701] hover:bg-[#00c801] disabled:opacity-40 disabled:cursor-not-allowed text-[#0f212e] font-black text-xs transition-all cursor-pointer shadow-lg shadow-[#00e701]/20 flex items-center justify-center gap-2"
                  >
                    {isSubmittingEnquiry ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <span>Submit Enquiry / Update UTR</span>
                    )}
                  </button>
                </div>
              )}

              {/* Status Note for Approved/Rejected */}
              {selectedTx.status === "APPROVED" && (
                <div className="p-3 rounded-xl bg-[#00e701]/10 border border-[#00e701]/20 text-[#00e701] text-center text-xs font-bold">
                  ✓ This payment was successfully verified and added to your balance.
                </div>
              )}
              {selectedTx.status === "REJECTED" && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-center text-xs font-medium space-y-1">
                  <p className="font-bold">Verification was rejected by automated banking gateway.</p>
                  <p className="text-[11px] text-[#b1bad3]">
                    Please contact 24/7 Live Support with your payment slip.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
