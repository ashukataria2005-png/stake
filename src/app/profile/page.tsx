"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Shield,
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Check,
  AlertCircle,
  RefreshCw,
  Copy,
  Wallet,
  Smartphone,
  Mail,
  ExternalLink,
  ChevronRight,
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

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, openAuthModal, openWalletModal, realBalance, formatDisplayBalance } = useGame();

  const [activeTab, setActiveTab] = useState<"transactions" | "details">("transactions");
  const [filterType, setFilterType] = useState<"ALL" | "DEPOSIT" | "WITHDRAWAL">("ALL");
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const displayInfo = formatDisplayBalance(realBalance);

  // Load and merge transactions
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
      console.error("[ProfilePage] Failed to fetch server transactions:", err);
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

    merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setTransactions(merged);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    sounds.playClick();
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType === "DEPOSIT" && tx.type !== "DEPOSIT") return false;
    if (filterType === "WITHDRAWAL" && tx.type !== "WITHDRAWAL") return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#1a2c38] text-white py-6 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
      {/* Top Banner & Profile Overview */}
      <div className="rounded-2xl bg-[#0f212e] border border-[#213743] p-5 sm:p-7 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#1475e1]/15 text-[#1475e1] border border-[#1475e1]/30 flex items-center justify-center font-black text-2xl shadow-inner">
            {user?.name?.[0]?.toUpperCase() || <User className="w-8 h-8" />}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {user?.username || user?.name || "Player"}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#00e701]/10 text-[#00e701] border border-[#00e701]/30 text-xs font-black uppercase tracking-wider">
                {user?.role || "VIP LEVEL 1"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#b1bad3]">
              {user?.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#557086]" />
                  <span>{user.email}</span>
                </span>
              )}
              {user?.phone && (
                <span className="flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-[#557086]" />
                  <span>+91 {user.phone}</span>
                </span>
              )}
              <span className="text-[#557086]">• Active Player</span>
            </div>
          </div>
        </div>

        {/* Balance Card & Quick Recharge */}
        <div className="flex items-center gap-4 bg-[#14232f] p-4 rounded-xl border border-[#213743] shrink-0 justify-between md:justify-end">
          <div>
            <div className="text-[11px] font-bold text-[#b1bad3] uppercase tracking-wider">
              Total Balance
            </div>
            <div className="text-lg sm:text-xl font-black font-mono text-[#00e701]">
              {displayInfo.symbol}{displayInfo.amount} {displayInfo.code}
            </div>
          </div>
          <button
            type="button"
            onClick={openWalletModal}
            className="px-4 py-2.5 rounded-xl bg-[#00e701] text-black font-black text-xs hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Deposit</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#213743] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("transactions")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "transactions"
              ? "bg-[#213743] text-white shadow-sm"
              : "text-[#b1bad3] hover:text-white"
          }`}
        >
          <Receipt className="w-4 h-4 text-[#1475e1]" />
          <span>Transactions History</span>
          <span className="ml-1 px-2 py-0.2 rounded-full bg-[#14232e] text-[11px] text-[#b1bad3]">
            {transactions.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("details")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "details"
              ? "bg-[#213743] text-white shadow-sm"
              : "text-[#b1bad3] hover:text-white"
          }`}
        >
          <Shield className="w-4 h-4 text-[#00e701]" />
          <span>Security & Details</span>
        </button>
      </div>

      {/* Tab Content: Transactions History */}
      {activeTab === "transactions" && (
        <div className="space-y-4">
          {/* Sub Filter Toolbar */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 p-1 bg-[#0f212e] rounded-xl border border-[#213743]">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setFilterType("ALL");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterType === "ALL"
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
                  setFilterType("DEPOSIT");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterType === "DEPOSIT"
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
                  setFilterType("WITHDRAWAL");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterType === "WITHDRAWAL"
                    ? "bg-[#213743] text-[#1475e1] shadow-sm"
                    : "text-[#b1bad3] hover:text-white"
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Withdrawals</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                fetchTransactions();
              }}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0f212e] border border-[#213743] hover:border-[#2f4553] text-xs font-bold text-[#b1bad3] hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#1475e1]" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Transaction Cards List */}
          {filteredTransactions.length === 0 ? (
            <div className="rounded-2xl bg-[#0f212e] border border-[#213743] p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#1a2c38] border border-[#213743] flex items-center justify-center text-[#557086] mx-auto">
                <Receipt className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-white">No transactions recorded yet</p>
              <p className="text-xs text-[#b1bad3] max-w-sm mx-auto">
                Once you submit a deposit or request a withdrawal, all real-time transaction updates will be displayed here.
              </p>
              <button
                type="button"
                onClick={openWalletModal}
                className="mt-2 px-4 py-2 rounded-xl bg-[#1475e1] hover:bg-[#1268c7] text-white text-xs font-bold transition-all cursor-pointer"
              >
                Make a Deposit
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((tx) => {
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
                    className="p-4 sm:p-5 rounded-2xl bg-[#0f212e] border border-[#213743] hover:border-[#2f4553] transition-all space-y-3 shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
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
                            <span className="font-bold text-sm sm:text-base text-white">
                              {isDeposit ? "Deposit" : "Withdrawal"}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#1a2c38] text-[#b1bad3] border border-[#213743] font-semibold">
                              {tx.method}
                            </span>
                          </div>
                          <div className="text-xs text-[#7a889b] mt-0.5">{formattedDate}</div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <div
                          className={`font-mono font-black text-base sm:text-lg ${
                            isDeposit ? "text-[#00e701]" : "text-white"
                          }`}
                        >
                          {isDeposit ? "+" : "-"} ₹{tx.amount.toLocaleString("en-IN")}
                        </div>

                        {/* Status Badges */}
                        {tx.status === "APPROVED" ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-[#00e701] border border-[#00e701]/30 text-xs font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Approved</span>
                          </span>
                        ) : tx.status === "REJECTED" ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-bold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Rejected</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 animate-pulse" />
                            <span>Pending</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Metadata Strip */}
                    <div className="pt-2.5 border-t border-[#1a2c38] flex flex-wrap items-center justify-between gap-2 text-xs text-[#b1bad3]">
                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        <span className="text-[#557086]">Ref ID:</span>
                        <span className="text-[#b1bad3] truncate max-w-[180px] sm:max-w-[260px]">
                          {tx.orderId || tx.id}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(tx.orderId || tx.id, tx.id)}
                          className="text-[#557086] hover:text-white p-0.5 cursor-pointer"
                          title="Copy Reference"
                        >
                          {copiedId === tx.id ? (
                            <Check className="w-3.5 h-3.5 text-[#00e701]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {tx.utrNumber && (
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          <span className="text-[#557086]">UTR:</span>
                          <span className="text-[#00e701] font-bold">{tx.utrNumber}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(tx.utrNumber || "", `utr_${tx.id}`)}
                            className="text-[#557086] hover:text-white p-0.5 cursor-pointer"
                            title="Copy UTR"
                          >
                            {copiedId === `utr_${tx.id}` ? (
                              <Check className="w-3.5 h-3.5 text-[#00e701]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}

                      {tx.destination && (
                        <div className="text-xs text-[#b1bad3]">
                          <span className="text-[#557086]">Destination:</span> {tx.destination}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Details & Security */}
      {activeTab === "details" && (
        <div className="rounded-2xl bg-[#0f212e] border border-[#213743] p-6 space-y-5">
          <h2 className="text-base font-bold text-white">Account Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#14232f] border border-[#213743] space-y-1">
              <span className="text-[#557086] font-semibold">User ID</span>
              <p className="font-mono font-bold text-white">{user?.id || "N/A"}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#14232f] border border-[#213743] space-y-1">
              <span className="text-[#557086] font-semibold">Username</span>
              <p className="font-bold text-white">{user?.username || user?.name || "Player"}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#14232f] border border-[#213743] space-y-1">
              <span className="text-[#557086] font-semibold">Registered Email</span>
              <p className="font-bold text-white">{user?.email || "Not linked"}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#14232f] border border-[#213743] space-y-1">
              <span className="text-[#557086] font-semibold">Mobile Number</span>
              <p className="font-bold text-white">{user?.phone ? `+91 ${user.phone}` : "Not linked"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
