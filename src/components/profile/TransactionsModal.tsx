"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Check,
  AlertCircle,
  RefreshCw,
  Copy,
  ExternalLink,
  Search,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";

interface TransactionItem {
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
}

export default function TransactionsModal({ isOpen, onClose }: TransactionsModalProps) {
  const { user, updateBalance } = useGame();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"ALL" | "DEPOSIT" | "WITHDRAWAL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);

  // Re-verify pending state inside Transactions modal
  const [reverifyOrderId, setReverifyOrderId] = useState<string | null>(null);
  const [reverifyUtr, setReverifyUtr] = useState("");
  const [reverifyError, setReverifyError] = useState("");
  const [isReverifying, setIsReverifying] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Load and merge transactions from Neon PostgreSQL API and Local Storage
  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    const merged: TransactionItem[] = [];

    // 1. Fetch from Neon DB API
    try {
      const activeUserId = user?.id || user?.username || "";
      const res = await fetch(`/api/wallet/transactions?userId=${encodeURIComponent(activeUserId)}`);
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
            status: tx.status === "APPROVED" ? "APPROVED" : tx.status === "REJECTED" ? "REJECTED" : "PENDING",
            createdAt: tx.createdAt,
            orderId: tx.id,
          });
        });
      }
    } catch (err) {
      console.error("[TransactionsModal] Failed to fetch server transactions:", err);
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

  const handleReverifySubmit = async (item: TransactionItem) => {
    const cleanUtr = reverifyUtr.replace(/\D/g, "").slice(0, 12);
    if (cleanUtr.length !== 12) {
      setReverifyError("Please enter a valid 12-digit numeric UTR.");
      return;
    }

    setReverifyError("");
    setIsReverifying(true);
    sounds.playClick();

    try {
      // Credit balance
      const creditedUsd = item.amount / 86.5;
      updateBalance(creditedUsd, true);

      // Post to deposit API
      await fetch("/api/wallet/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: item.amount,
          currency: item.currency,
          utrNumber: cleanUtr,
          orderId: item.orderId || item.id,
          method: item.method || "UPI",
          autoCredit: true,
          isLateSubmission: true,
        }),
      });

      // Update local storage
      const localDeposits = localStorage.getItem("stake_deposit_orders");
      if (localDeposits) {
        const parsed = JSON.parse(localDeposits);
        const updated = parsed.map((o: any) =>
          o.orderId === item.orderId || o.orderId === item.id
            ? { ...o, status: "Success", utr: cleanUtr }
            : o
        );
        localStorage.setItem("stake_deposit_orders", JSON.stringify(updated));
      }

      sounds.playSuccessChime();
      setIsReverifying(false);
      setReverifyOrderId(null);
      setReverifyUtr("");
      fetchTransactions();
    } catch (err) {
      console.error("Reverify error:", err);
      setReverifyError("Verification failed. Please try again.");
      setIsReverifying(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const filteredTransactions = transactions.filter((tx) => {
    if (activeTab === "DEPOSIT" && tx.type !== "DEPOSIT") return false;
    if (activeTab === "WITHDRAWAL" && tx.type !== "WITHDRAWAL") return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchUtr = tx.utrNumber?.toLowerCase().includes(q);
      const matchId = tx.id.toLowerCase().includes(q) || tx.orderId?.toLowerCase().includes(q);
      const matchDest = tx.destination?.toLowerCase().includes(q);
      const matchMethod = tx.method.toLowerCase().includes(q);
      if (!matchUtr && !matchId && !matchDest && !matchMethod) return false;
    }
    return true;
  });

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overscroll-contain animate-in fade-in duration-200"
      style={{ overscrollBehavior: "contain" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-[#1a2c38] border border-[#213743] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] overscroll-contain animate-in zoom-in-95 duration-200"
        style={{ overscrollBehavior: "contain" }}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#213743] bg-[#14232f] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1475e1]/15 text-[#1475e1] border border-[#1475e1]/30 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Transactions History</h3>
              <p className="text-xs text-[#b1bad3]">
                Past deposits and withdrawals with real-time status badges
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sounds.playClick();
                fetchTransactions();
              }}
              disabled={isLoading}
              className="p-2 rounded-lg text-[#b1bad3] hover:text-white hover:bg-[#213743] transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh Transactions"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#1475e1]" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[#b1bad3] hover:text-white hover:bg-[#213743] transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Navigation & Search Bar */}
        <div className="px-5 py-3 border-b border-[#213743] bg-[#1a2c38] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          {/* Tabs: All / Deposits / Withdrawals */}
          <div className="flex items-center gap-1.5 p-1 bg-[#0f212e] rounded-xl border border-[#213743]">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab("ALL");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "ALL"
                  ? "bg-[#213743] text-white shadow-sm"
                  : "text-[#b1bad3] hover:text-white"
              }`}
            >
              All ({transactions.length})
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab("DEPOSIT");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "DEPOSIT"
                  ? "bg-[#213743] text-[#00e701] shadow-sm"
                  : "text-[#b1bad3] hover:text-white"
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Deposits</span>
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab("WITHDRAWAL");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "WITHDRAWAL"
                  ? "bg-[#213743] text-[#1475e1] shadow-sm"
                  : "text-[#b1bad3] hover:text-white"
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Withdrawals</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative flex-1 sm:max-w-[220px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search UTR / ID..."
              className="w-full bg-[#0f212e] border border-[#213743] focus:border-[#1475e1] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white outline-none placeholder:text-[#557086] transition-colors"
            />
            <Search className="w-3.5 h-3.5 text-[#557086] absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div
          className="p-5 overflow-y-auto flex-1 space-y-3 overscroll-contain"
          style={{ overscrollBehavior: "contain" }}
        >
          {filteredTransactions.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0f212e] border border-[#213743] flex items-center justify-center text-[#557086]">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">No transactions found</p>
                <p className="text-xs text-[#b1bad3] mt-0.5">
                  {searchQuery
                    ? "Try adjusting your search criteria"
                    : "Your deposit and withdrawal activity will appear here"}
                </p>
              </div>
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const isDeposit = tx.type === "DEPOSIT";
              const formattedDate = new Date(tx.createdAt).toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={tx.id}
                  className="p-4 rounded-xl bg-[#0f212e] border border-[#213743] hover:border-[#2f4553] transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Left: Icon & Type & Date */}
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isDeposit
                            ? "bg-[#00e701]/10 text-[#00e701] border border-[#00e701]/20"
                            : "bg-[#1475e1]/10 text-[#1475e1] border border-[#1475e1]/20"
                        }`}
                      >
                        {isDeposit ? (
                          <ArrowDownLeft className="w-5 h-5" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">
                            {isDeposit ? "Deposit" : "Withdrawal"}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#1a2c38] text-[#b1bad3] border border-[#213743] font-semibold">
                            {tx.method}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#7a889b] mt-0.5">
                          {formattedDate}
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount & Status Badge */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <div
                        className={`font-mono font-black text-sm sm:text-base ${
                          isDeposit ? "text-[#00e701]" : "text-white"
                        }`}
                      >
                        {isDeposit ? "+" : "-"} ₹{tx.amount.toLocaleString("en-IN")}
                      </div>

                      {/* Status Badge (Pending / Approved / Rejected) */}
                      {tx.status === "APPROVED" ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-[#00e701] border border-[#00e701]/30 text-[11px] font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Approved</span>
                        </span>
                      ) : tx.status === "REJECTED" ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 text-[11px] font-bold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>Rejected</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3 animate-pulse" />
                          <span>Pending</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metadata Row: Reference ID / UTR Number / Destination */}
                  <div className="pt-2 border-t border-[#1a2c38] flex flex-wrap items-center justify-between gap-2 text-xs text-[#b1bad3]">
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <span className="text-[#557086]">Ref:</span>
                      <span className="text-[#b1bad3] truncate max-w-[150px] sm:max-w-[200px]">
                        {tx.orderId || tx.id}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(tx.orderId || tx.id, tx.id)}
                        className="text-[#557086] hover:text-white p-0.5"
                        title="Copy Reference"
                      >
                        {copiedId === tx.id ? (
                          <Check className="w-3 h-3 text-[#00e701]" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    {tx.utrNumber && (
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <span className="text-[#557086]">UTR:</span>
                        <span className="text-[#00e701] font-bold">{tx.utrNumber}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(tx.utrNumber || "", `utr_${tx.id}`)}
                          className="text-[#557086] hover:text-white p-0.5"
                          title="Copy UTR"
                        >
                          {copiedId === `utr_${tx.id}` ? (
                            <Check className="w-3 h-3 text-[#00e701]" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    )}

                    {tx.destination && (
                      <div className="text-[11px] text-[#b1bad3]">
                        <span className="text-[#557086]">To:</span> {tx.destination}
                      </div>
                    )}

                    {/* Pending Deposit Re-verify Action */}
                    {isDeposit && tx.status === "PENDING" && !tx.utrNumber && (
                      <button
                        type="button"
                        onClick={() => {
                          setReverifyOrderId(reverifyOrderId === tx.id ? null : tx.id);
                          setReverifyUtr("");
                          setReverifyError("");
                        }}
                        className="text-[11px] text-[#1475e1] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span>Verify UTR</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Inline Re-verify drawer for pending item */}
                  {reverifyOrderId === tx.id && (
                    <div className="mt-2 p-3 rounded-lg bg-[#14232e] border border-amber-500/30 space-y-2 animate-in fade-in">
                      <p className="text-[11px] text-amber-300 font-semibold">
                        Enter 12-digit UTR to immediately credit ₹{tx.amount}:
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={12}
                          value={reverifyUtr}
                          onChange={(e) =>
                            setReverifyUtr(e.target.value.replace(/\D/g, "").slice(0, 12))
                          }
                          placeholder="4278XXXXXXXX"
                          className="flex-1 bg-[#1a2c38] border border-[#213743] rounded-lg px-3 py-1.5 text-xs font-mono text-white outline-none focus:border-[#1475e1]"
                        />
                        <button
                          type="button"
                          disabled={isReverifying}
                          onClick={() => handleReverifySubmit(tx)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#00e701] text-black font-extrabold text-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                        >
                          {isReverifying ? "Verifying..." : "Credit Now"}
                        </button>
                      </div>
                      {reverifyError && (
                        <p className="text-[10px] text-red-400 font-semibold">{reverifyError}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
