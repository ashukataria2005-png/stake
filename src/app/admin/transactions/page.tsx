"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ArrowDownCircle,
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
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Approve Transaction Handler
  const handleApproveConfirm = async () => {
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
        `Successfully approved ${confirmApproveTx.type} of ₹${confirmApproveTx.amount.toLocaleString()} for @${confirmApproveTx.user.username}!`
      );
      setTimeout(() => setActionSuccessMessage(null), 4000);

      setConfirmApproveTx(null);
      await fetchTransactions();
    } catch (err: any) {
      alert("Error approving transaction: " + (err.message || "Unknown error"));
    } finally {
      setIsProcessing(false);
    }
  };

  // Reject Transaction Handler
  const handleRejectConfirm = async () => {
    if (!rejectTx) return;
    setIsProcessing(true);
    try {
      const res = await fetch("/api/admin/transactions/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId: rejectTx.id,
          reason: rejectReason.trim() || undefined,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-wide">
              Deposit Requests Desk (deposite.php)
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#131b24] text-[#00e701] border border-[#00e701]/30">
              Live Ledger
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Replicated from legacy deposite.php and admin_deposit_req.php. Audit payment receipts, UTR entries & credit wallets instantly.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchTransactions()}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#1f2c3a] hover:bg-[#28384a] text-white text-xs font-semibold rounded-xl border border-[#2d4054] transition-all self-start sm:self-auto shadow"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#00e701]" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {actionSuccessMessage && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4" />
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

      {/* Filter and Control Bar */}
      <div className="bg-[#131b24] border border-[#212f3d] rounded-2xl p-4 space-y-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#212f3d] pb-3">
          <div className="flex flex-wrap gap-1.5 bg-[#0a0f14] p-1 rounded-xl border border-[#212f3d]">
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
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? "bg-[#253545] text-white shadow border border-[#374c60]"
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

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Type:</span>
            <div className="flex gap-1 bg-[#0a0f14] p-1 rounded-xl border border-[#212f3d]">
              {[
                { id: "DEPOSIT", label: "Deposits Only" },
                { id: "WITHDRAWAL", label: "Withdrawals Only" },
                { id: "ALL", label: "All Types" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTypeFilter(t.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    typeFilter === t.id
                      ? "bg-[#253545] text-[#00e701] border border-[#374c60]"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Username, Mobile, UTR Number, or Order ID..."
            className="w-full bg-[#0a0f14] border border-[#263747] rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00e701] transition-colors"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="bg-[#131b24] border border-[#212f3d] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#17222d] border-b border-[#212f3d] text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">User / Mobile</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">UTR / Reference Number</th>
                <th className="py-3.5 px-4">Receipt Screenshot</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#212f3d]/60 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#00e701]" />
                    <div>Loading deposit ledger from Neon DB...</div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-rose-400">
                    <p className="font-semibold">Failed to fetch transactions</p>
                    <p className="text-xs text-slate-400 mt-1">{error}</p>
                    <button
                      onClick={() => fetchTransactions()}
                      className="mt-3 px-3 py-1.5 bg-[#1f2c3a] text-white text-xs rounded-lg hover:bg-[#28384a]"
                    >
                      Try Again
                    </button>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No transactions matching your current selection.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isDeposit = tx.type === "DEPOSIT";
                  const dateObj = new Date(tx.createdAt);
                  const formattedDate = dateObj.toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                  const formattedTime = dateObj.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-[#1a2530]/50 transition-colors group"
                    >
                      {/* Date & Time */}
                      <td className="py-3.5 px-4 text-slate-300 whitespace-nowrap">
                        <div className="font-semibold text-white">{formattedDate}</div>
                        <div className="text-[10px] text-slate-400">{formattedTime}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          ID: {tx.id.slice(-8)}
                        </div>
                      </td>

                      {/* Player Details */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>@{tx.user.username}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {tx.user.phone || tx.user.email || "No phone/email"}
                        </div>
                        <div className="text-[11px] text-emerald-400/90 font-medium mt-0.5">
                          Balance: ₹{tx.user.currentBalance.toLocaleString()}
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold ${
                            isDeposit
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                          }`}
                        >
                          {isDeposit ? "📥 Deposit" : "📤 Withdrawal"}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1 uppercase">
                          {tx.method || "UPI"}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-base font-black text-white tracking-wide">
                          ₹{tx.amount.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">
                          {tx.currency}
                        </div>
                      </td>

                      {/* UTR / Reference */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {tx.utrNumber ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[#00e701] font-bold bg-[#0a0f14] px-2 py-1 rounded border border-[#212f3d]">
                              {tx.utrNumber}
                            </span>
                            <button
                              onClick={() => handleCopy(tx.utrNumber || "", `utr_${tx.id}`)}
                              title="Copy UTR Number"
                              className="p-1 rounded hover:bg-[#202d3b] text-slate-400 hover:text-white transition-colors text-xs"
                            >
                              {copiedId === `utr_${tx.id}` ? "✅" : "📋"}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">
                            {tx.txHash ? `Ref: ${tx.txHash.slice(0, 16)}...` : "No UTR provided"}
                          </span>
                        )}

                        {/* Late UTR Submitted Badge */}
                        {tx.isLateSubmission && (
                          <div className="mt-1.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              ⚡ Late UTR Submitted
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Receipt Screenshot Preview */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {tx.screenshotUrl ? (
                          <div className="relative group/thumb inline-block">
                            <button
                              onClick={() => {
                                setPreviewImage(tx.screenshotUrl);
                                setZoomLevel(1);
                              }}
                              className="relative overflow-hidden rounded-lg border border-[#212f3d] hover:border-[#00e701] transition-all block focus:outline-none"
                            >
                              <img
                                src={tx.screenshotUrl}
                                alt="Payment proof receipt"
                                className="w-14 h-14 object-cover hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
                                🔍 Zoom
                              </div>
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px] italic">No receipt</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${
                            tx.status === "APPROVED"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                              : tx.status === "REJECTED"
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse"
                          }`}
                        >
                          {tx.status === "APPROVED" && "✓ Approved"}
                          {tx.status === "REJECTED" && "✕ Rejected"}
                          {tx.status === "PENDING" && "⏳ Pending"}
                        </span>
                        {tx.approvedBy && (
                          <div className="text-[10px] text-slate-400 mt-1">
                            by {tx.approvedBy}
                          </div>
                        )}
                        {tx.rejectionReason && (
                          <div className="text-[10px] text-rose-400/90 mt-0.5 max-w-[140px] truncate" title={tx.rejectionReason}>
                            Reason: {tx.rejectionReason}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {tx.status === "PENDING" ? (
                          <div className="flex items-center justify-end gap-2">
                            {/* Approve Button */}
                            <button
                              onClick={() => setConfirmApproveTx(tx)}
                              className="px-3 py-1.5 bg-[#00e701] hover:bg-[#00c701] text-black text-xs font-black rounded-lg uppercase tracking-wider transition-all shadow hover:scale-105 active:scale-95"
                            >
                              Approve
                            </button>

                            {/* Reject Button */}
                            <button
                              onClick={() => {
                                setRejectTx(tx);
                                setRejectReason("");
                              }}
                              className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 text-xs font-bold rounded-lg uppercase tracking-wider transition-all"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-500 font-medium">
                            Processed {tx.approvedAt ? new Date(tx.approvedAt).toLocaleTimeString() : ""}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* LIGHTBOX PREVIEW MODAL */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-[#131b24] border border-[#212f3d] rounded-2xl overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#212f3d] bg-[#0a0f14]">
              <div className="flex items-center gap-3">
                <span className="text-white font-bold text-sm">Receipt Image Preview</span>
                <div className="flex items-center gap-1 bg-[#1f2b38] px-2 py-0.5 rounded text-xs text-slate-300">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
                    className="px-1.5 hover:text-white font-bold"
                  >
                    -
                  </button>
                  <span>{Math.round(zoomLevel * 100)}%</span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
                    className="px-1.5 hover:text-white font-bold"
                  >
                    +
                  </button>
                  <button
                    onClick={() => setZoomLevel(1)}
                    className="ml-1 text-[10px] text-slate-400 hover:text-white underline"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={previewImage}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 bg-[#1f2b38] hover:bg-[#28384a] text-xs font-semibold text-white rounded-lg transition-colors"
                >
                  Open Original
                </a>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="w-8 h-8 rounded-lg bg-[#1f2b38] hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 flex items-center justify-center transition-colors text-base"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Image Container */}
            <div className="p-6 overflow-auto flex items-center justify-center bg-[#0a0f14]/50 min-h-[300px]">
              <img
                src={previewImage}
                alt="Payment receipt full zoom"
                style={{ transform: `scale(${zoomLevel})` }}
                className="max-h-[75vh] object-contain rounded-lg transition-transform duration-150 origin-center"
              />
            </div>
          </div>
        </div>
      )}

      {/* APPROVE CONFIRMATION MODAL */}
      {confirmApproveTx && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => !isProcessing && setConfirmApproveTx(null)}
        >
          <div
            className="w-full max-w-md bg-[#131b24] border border-[#212f3d] rounded-2xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-[#00e701] border border-emerald-500/40 flex items-center justify-center text-2xl font-black mb-4 mx-auto">
              ✓
            </div>

            <h3 className="text-lg font-bold text-white text-center mb-1">
              Confirm Deposit Approval
            </h3>
            <p className="text-xs text-slate-400 text-center mb-5">
              Atomic credit will update Neon PostgreSQL Wallet balance immediately.
            </p>

            <div className="bg-[#0a0f14] rounded-xl p-4 border border-[#212f3d] space-y-2.5 text-xs mb-6">
              <div className="flex justify-between">
                <span className="text-slate-400">Player:</span>
                <span className="text-white font-bold">@{confirmApproveTx.user.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Transaction Type:</span>
                <span className="text-white font-semibold uppercase">{confirmApproveTx.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount:</span>
                <span className="text-[#00e701] font-black text-sm">
                  ₹{confirmApproveTx.amount.toLocaleString()} {confirmApproveTx.currency}
                </span>
              </div>
              {confirmApproveTx.utrNumber && (
                <div className="flex justify-between">
                  <span className="text-slate-400">UTR Number:</span>
                  <span className="font-mono text-[#00e701] font-bold">{confirmApproveTx.utrNumber}</span>
                </div>
              )}
              <div className="border-t border-[#212f3d] pt-2 flex justify-between">
                <span className="text-slate-400">Current Balance:</span>
                <span className="text-slate-300 font-medium">
                  ₹{confirmApproveTx.user.currentBalance.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-400">New Balance After:</span>
                <span className="text-[#00e701] font-bold">
                  ₹
                  {(
                    confirmApproveTx.user.currentBalance +
                    (confirmApproveTx.type === "DEPOSIT" ? confirmApproveTx.amount : 0)
                  ).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmApproveTx(null)}
                disabled={isProcessing}
                className="flex-1 py-2.5 bg-[#1f2c3a] hover:bg-[#28384a] text-white text-xs font-semibold rounded-xl border border-[#2d4054] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApproveConfirm}
                disabled={isProcessing}
                className="flex-1 py-2.5 bg-[#00e701] hover:bg-[#00c701] text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Approving...</span>
                  </>
                ) : (
                  <span>Confirm & Credit</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectTx && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => !isProcessing && setRejectTx(null)}
        >
          <div
            className="w-full max-w-md bg-[#131b24] border border-[#212f3d] rounded-2xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center text-2xl font-black mb-4 mx-auto">
              ✕
            </div>

            <h3 className="text-lg font-bold text-white text-center mb-1">
              Reject Transaction
            </h3>
            <p className="text-xs text-slate-400 text-center mb-5">
              {rejectTx.type === "WITHDRAWAL"
                ? "Rejecting a withdrawal will immediately refund the amount back to the user's wallet."
                : "Rejecting a deposit marks it as unapproved without crediting balance."}
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Rejection Reason (Optional):
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Invalid UTR, Duplicate payment receipt, Mismatched amount..."
                  rows={3}
                  className="w-full bg-[#0a0f14] border border-[#263747] rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRejectTx(null)}
                disabled={isProcessing}
                className="flex-1 py-2.5 bg-[#1f2c3a] hover:bg-[#28384a] text-white text-xs font-semibold rounded-xl border border-[#2d4054] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectConfirm}
                disabled={isProcessing}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Rejecting...</span>
                  </>
                ) : (
                  <span>Confirm Rejection</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
