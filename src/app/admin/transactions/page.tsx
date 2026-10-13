"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  CreditCard,
  RefreshCw,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Copy,
  Check,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  ArrowRight,
  TrendingUp,
  Percent,
  AlertCircle,
  X,
  FileCheck,
} from "lucide-react";

interface TransactionRow {
  id: string;
  userId: string;
  type: "DEPOSIT" | "WITHDRAWAL";
  amount: number;
  currency: string;
  utrNumber: string | null;
  screenshotUrl: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  approvedBy: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  isLateSubmission: boolean;
  method: string;
  txHash: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    email: string | null;
    phone: string | null;
    currentBalance: number;
    currency: string;
  };
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [counts, setCounts] = useState<{ pending: number; total: number }>({ pending: 0, total: 0 });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [activeTab, setActiveTab] = useState<"PENDING" | "APPROVED" | "REJECTED" | "ALL">("PENDING");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "DEPOSIT" | "WITHDRAWAL">("DEPOSIT");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals & Actions
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [confirmApproveTx, setConfirmApproveTx] = useState<TransactionRow | null>(null);
  const [rejectTx, setRejectTx] = useState<TransactionRow | null>(null);
  const [rejectReason, setRejectReason] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch transactions from API
  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (activeTab !== "ALL") params.append("status", activeTab);
      if (typeFilter !== "ALL") params.append("type", typeFilter);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`/api/admin/transactions?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load transactions.");
      }

      setTransactions(data.transactions || []);
      setCounts(data.counts || { pending: 0, total: 0 });
    } catch (err: any) {
      console.error("Fetch transactions error:", err);
      setError(err.message || "Failed to fetch transactions.");
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, typeFilter, searchQuery]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Copy to clipboard helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 1-Click Approve handler
  const handleApprove = async () => {
    if (!confirmApproveTx) return;
    setIsProcessing(true);

    try {
      const res = await fetch("/api/admin/transactions/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: confirmApproveTx.id }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Approval failed.");
      }

      setActionSuccessMessage(
        `Success: Transaction ₹${Number(confirmApproveTx.amount).toLocaleString("en-IN")} for @${confirmApproveTx.user.username} has been APPROVED and credited.`
      );
      setTimeout(() => setActionSuccessMessage(null), 5000);

      setConfirmApproveTx(null);
      await fetchTransactions();
    } catch (err: any) {
      alert("Error approving transaction: " + (err.message || "Unknown error"));
    } finally {
      setIsProcessing(false);
    }
  };

  // Reject handler
  const handleReject = async () => {
    if (!rejectTx) return;
    setIsProcessing(true);

    try {
      const res = await fetch("/api/admin/transactions/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId: rejectTx.id,
          reason: rejectReason.trim() || "Rejected by administrator review",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Rejection failed.");
      }

      setActionSuccessMessage(
        `Transaction ${rejectTx.id.slice(-6)} marked as REJECTED.`
      );
      setTimeout(() => setActionSuccessMessage(null), 4000);

      setRejectTx(null);
      setRejectReason("");
      await fetchTransactions();
    } catch (err: any) {
      alert("Error rejecting transaction: " + (err.message || "Unknown error"));
    } finally {
      setIsProcessing(false);
    }
  };

  // Compute decision stats
  const totalInList = transactions.length;
  const approvedInList = transactions.filter((t) => t.status === "APPROVED").length;
  const decisionRatio = totalInList > 0 ? Math.round((approvedInList / totalInList) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Financial Verification Desk
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono">
              Live Gateway
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Audit player payment receipts, inspect late UTR submissions, zoom payment screenshots & credit wallets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchTransactions()}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#131722] hover:bg-[#1c2233] text-slate-200 text-xs font-semibold rounded-xl border border-[#1e2433] transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh Ledger</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {actionSuccessMessage && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-semibold animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
          <button
            onClick={() => setActionSuccessMessage(null)}
            className="text-emerald-400/70 hover:text-emerald-400 text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* Decision Ratio & Quick Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#131722] border border-[#1e2433] rounded-xl p-3.5">
          <span className="text-[10px] font-mono uppercase text-slate-400">Pending Review</span>
          <p className="text-lg font-bold text-amber-400 font-mono mt-0.5">
            {counts.pending} Queued
          </p>
        </div>
        <div className="bg-[#131722] border border-[#1e2433] rounded-xl p-3.5">
          <span className="text-[10px] font-mono uppercase text-slate-400">Total In Filter</span>
          <p className="text-lg font-bold text-white font-mono mt-0.5">
            {transactions.length} Records
          </p>
        </div>
        <div className="bg-[#131722] border border-[#1e2433] rounded-xl p-3.5">
          <span className="text-[10px] font-mono uppercase text-slate-400">Decision Ratio</span>
          <p className="text-lg font-bold text-cyan-400 font-mono mt-0.5">
            {decisionRatio}% Approval
          </p>
        </div>
        <div className="bg-[#131722] border border-[#1e2433] rounded-xl p-3.5">
          <span className="text-[10px] font-mono uppercase text-slate-400">Gateway Status</span>
          <p className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
            ● Atomic Sync
          </p>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-[#131722] border border-[#1e2433] rounded-2xl p-4 space-y-4 shadow-md">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1e2433] pb-3">
          <div className="flex flex-wrap gap-1.5 bg-[#0e1017] p-1 rounded-xl border border-[#1e2433]">
            {[
              { id: "PENDING", label: "Pending Approval", badge: counts.pending },
              { id: "APPROVED", label: "Approved" },
              { id: "REJECTED", label: "Rejected" },
              { id: "ALL", label: "All Records", badge: counts.total },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                        tab.id === "PENDING"
                          ? "bg-amber-500 text-black font-extrabold"
                          : "bg-slate-700 text-slate-300"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Type Toggle (Deposit / Withdrawal) */}
          <div className="flex items-center gap-1 bg-[#0e1017] p-1 rounded-xl border border-[#1e2433]">
            {[
              { id: "DEPOSIT", label: "Recharges (Deposits)" },
              { id: "WITHDRAWAL", label: "Withdrawals" },
              { id: "ALL", label: "Both" },
            ].map((t) => {
              const isSelected = typeFilter === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTypeFilter(t.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-[#1e2433] text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by UTR Number, Username, Phone, or Transaction ID..."
            className="w-full pl-10 pr-4 py-2 bg-[#0e1017] border border-[#1e2433] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 font-mono"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#131722] border border-[#1e2433] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#0e1017] border-b border-[#1e2433] text-slate-400 font-mono uppercase text-[11px]">
                <th className="py-3 px-4">TX ID & Date</th>
                <th className="py-3 px-4">Player Details</th>
                <th className="py-3 px-4">Amount & Type</th>
                <th className="py-3 px-4">UTR / Method</th>
                <th className="py-3 px-4">Receipt Proof</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2433]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin text-amber-400 mx-auto mb-2" />
                    <p className="font-mono text-xs">Loading transaction records...</p>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-mono">
                    No transactions matching your current criteria.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#181d2b]/60 transition-colors">
                    {/* 1. TX ID & Date */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center gap-1.5 font-bold text-slate-200">
                        <span>#{tx.id.slice(-8)}</span>
                        <button
                          onClick={() => handleCopy(tx.id, `tx-${tx.id}`)}
                          className="text-slate-500 hover:text-slate-300"
                        >
                          {copiedId === `tx-${tx.id}` ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>

                    {/* 2. Player Details */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{tx.user?.username || "Player"}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {tx.user?.phone || tx.user?.email || "No contact"}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                        Bal: ₹{Number(tx.user?.currentBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </div>
                    </td>

                    {/* 3. Amount & Type */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="text-sm font-black text-white">
                        ₹{Number(tx.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </div>
                      <span
                        className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold mt-0.5 ${
                          tx.type === "DEPOSIT"
                            ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                            : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>

                    {/* 4. UTR / Method */}
                    <td className="py-3.5 px-4 font-mono">
                      {tx.utrNumber ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-amber-300 bg-[#0e1017] px-2 py-0.5 rounded border border-[#1e2433]">
                            {tx.utrNumber}
                          </span>
                          <button
                            onClick={() => handleCopy(tx.utrNumber || "", `utr-${tx.id}`)}
                            className="text-slate-500 hover:text-slate-300"
                          >
                            {copiedId === `utr-${tx.id}` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}

                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] text-slate-400 uppercase">
                          {tx.method || "UPI"}
                        </span>
                        {tx.isLateSubmission && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Late UTR
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 5. Screenshot Proof */}
                    <td className="py-3.5 px-4">
                      {tx.screenshotUrl ? (
                        <button
                          onClick={() => {
                            setPreviewImage(tx.screenshotUrl);
                            setZoomLevel(1);
                          }}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0e1017] hover:bg-[#1c2233] text-cyan-300 border border-cyan-500/30 text-[11px] font-semibold transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Proof</span>
                        </button>
                      ) : (
                        <span className="text-slate-600 font-mono text-[11px]">No Upload</span>
                      )}
                    </td>

                    {/* 6. Status Badge */}
                    <td className="py-3.5 px-4">
                      {tx.status === "PENDING" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                      {tx.status === "APPROVED" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle className="w-3 h-3" />
                          Approved
                        </span>
                      )}
                      {tx.status === "REJECTED" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                          <XCircle className="w-3 h-3" />
                          Rejected
                        </span>
                      )}
                    </td>

                    {/* 7. Action Buttons */}
                    <td className="py-3.5 px-4 text-right">
                      {tx.status === "PENDING" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setConfirmApproveTx(tx)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold transition-all active:scale-95 shadow-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setRejectTx(tx);
                              setRejectReason("");
                            }}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-[11px] font-bold transition-all active:scale-95 shadow-sm"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] font-mono text-slate-500">
                          Resolved
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================
          MODAL: SCREENSHOT LIGHTBOX
          ======================================================== */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative max-w-2xl w-full bg-[#131722] border border-[#1e2433] rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-[#1e2433]">
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Payment Screenshot Inspection
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
                  className="p-1.5 rounded-lg bg-[#0e1017] border border-[#1e2433] text-slate-300 hover:text-white"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
                  className="p-1.5 rounded-lg bg-[#0e1017] border border-[#1e2433] text-slate-300 hover:text-white"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e2433]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4 flex items-center justify-center max-h-[70vh] overflow-auto bg-[#090a0f]">
              <img
                src={previewImage}
                alt="Payment proof screenshot"
                style={{ transform: `scale(${zoomLevel})` }}
                className="max-h-[60vh] object-contain rounded-lg transition-transform"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: CONFIRM APPROVAL (1-CLICK ATOMIC WALLET CREDIT)
          ======================================================== */}
      {confirmApproveTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative max-w-md w-full bg-[#131722] border border-emerald-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Confirm Deposit Approval</h3>
                <p className="text-xs text-slate-400 font-mono">
                  Atomic wallet ledger transaction
                </p>
              </div>
            </div>

            <div className="bg-[#0e1017] p-3.5 rounded-xl border border-[#1e2433] space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Player:</span>
                <span className="font-bold text-white">@{confirmApproveTx.user.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Credit Amount:</span>
                <span className="font-black text-emerald-400 text-sm">
                  ₹{Number(confirmApproveTx.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">UTR / Ref:</span>
                <span className="text-amber-300 font-bold">{confirmApproveTx.utrNumber || "N/A"}</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Approving will immediately credit <span className="text-white font-bold">₹{confirmApproveTx.amount}</span> into the player's active wallet balance and mark this transaction as Approved.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmApproveTx(null)}
                disabled={isProcessing}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-[#0e1017] hover:bg-[#1a2030] text-slate-300 border border-[#1e2433] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={isProcessing}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Confirm & Credit</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: REJECT TRANSACTION
          ======================================================== */}
      {rejectTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative max-w-md w-full bg-[#131722] border border-rose-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Reject Transaction</h3>
                <p className="text-xs text-slate-400 font-mono">
                  #{rejectTx.id.slice(-8)} • ₹{rejectTx.amount}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Reason for Rejection
              </label>
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Invalid UTR number, Amount mismatch, Duplicate slip..."
                className="w-full px-3.5 py-2.5 bg-[#0e1017] border border-[#1e2433] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/60 font-mono"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectTx(null)}
                disabled={isProcessing}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-[#0e1017] hover:bg-[#1a2030] text-slate-300 border border-[#1e2433] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={isProcessing}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Rejecting...</span>
                  </>
                ) : (
                  <span>Confirm Reject</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
