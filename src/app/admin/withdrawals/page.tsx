"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowUpCircle,
  RefreshCw,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  Filter,
} from "lucide-react";

interface WithdrawalRow {
  id: string;
  userId: string;
  type: "WITHDRAWAL";
  amount: number;
  currency: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  approvedBy: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  method: string;
  txHash: string | null;
  createdAt: string;
  user: {
    id: string;
    username: string;
    email: string | null;
    phone: string | null;
    currentBalance: number;
    currency: string;
  };
}

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRow[]>([]);
  const [activeTab, setActiveTab] = useState<"PENDING" | "APPROVED" | "REJECTED" | "ALL">("PENDING");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals & Action Confirmation
  const [confirmApproveTx, setConfirmApproveTx] = useState<WithdrawalRow | null>(null);
  const [rejectTx, setRejectTx] = useState<WithdrawalRow | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchWithdrawals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append("type", "WITHDRAWAL");
      if (activeTab !== "ALL") params.append("status", activeTab);
      if (searchQuery.trim()) params.append("search", searchQuery.trim());

      const res = await fetch(`/api/admin/transactions?${params.toString()}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load withdrawal requests");
      }
      setWithdrawals(data.transactions || []);
    } catch (err: any) {
      console.error("Fetch withdrawals error:", err);
      setError(err.message || "Failed to fetch withdrawals");
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, searchQuery]);

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

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
      if (!res.ok || !data.success) throw new Error(data.error || "Approval failed");

      setToastMessage(`Withdrawal of ₹${confirmApproveTx.amount} for @${confirmApproveTx.user.username} successfully approved.`);
      setTimeout(() => setToastMessage(null), 4000);

      setConfirmApproveTx(null);
      await fetchWithdrawals();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectTx) return;
    setIsProcessing(true);
    try {
      const res = await fetch("/api/admin/transactions/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId: rejectTx.id,
          reason: rejectReason.trim() || "Rejected by administrator",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Rejection failed");

      setToastMessage(`Withdrawal rejected. Amount has been refunded back to @${rejectTx.user.username}'s wallet.`);
      setTimeout(() => setToastMessage(null), 4000);

      setRejectTx(null);
      setRejectReason("");
      await fetchWithdrawals();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const pendingCount = withdrawals.filter((w) => w.status === "PENDING").length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-wide">
              Withdrawal Requests Desk
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#131b24] text-slate-300 border border-[#212f3d]">
              Payouts
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Replicated from legacy manage_withdraw.php. Verify payout bank details and approve or refund locked withdrawals.
          </p>
        </div>

        <button
          onClick={() => fetchWithdrawals()}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#1f2c3a] hover:bg-[#28384a] text-white text-xs font-semibold rounded-xl border border-[#2d4054] transition-all self-start sm:self-auto shadow"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#00e701]" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400/80 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Filter and Tab Bar */}
      <div className="bg-[#131b24] border border-[#212f3d] rounded-2xl p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#212f3d] pb-3">
          <div className="flex flex-wrap gap-1.5 bg-[#0a0f14] p-1 rounded-xl border border-[#212f3d]">
            {[
              { id: "PENDING", label: "Pending Payouts" },
              { id: "APPROVED", label: "Approved / Sent" },
              { id: "REJECTED", label: "Rejected / Refunded" },
              { id: "ALL", label: "All Payout Records" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? "bg-[#253545] text-white shadow border border-[#374c60]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Username, Mobile, Bank Account, or Order ID..."
            className="w-full bg-[#0a0f14] border border-[#263747] rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00e701]"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
        </div>
      </div>

      {/* Withdrawals Table (Replicating manage_withdraw.php table) */}
      <div className="bg-[#131b24] border border-[#212f3d] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#17222d] text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-[#212f3d]">
                <th className="py-3 px-4">Sr.No & Date</th>
                <th className="py-3 px-4">User Mobile / Username</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payout Method</th>
                <th className="py-3 px-4">Bank Account / Order ID</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#212f3d]/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-400" />
                    <span>Loading withdrawal requests from Neon DB...</span>
                  </td>
                </tr>
              ) : withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No withdrawal requests found.
                  </td>
                </tr>
              ) : (
                withdrawals.map((w, idx) => {
                  const reqDate = new Date(w.createdAt).toLocaleString("en-IN", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr key={w.id} className="hover:bg-[#1a2530]/50 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-white">#{idx + 1}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{reqDate}</div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-white">@{w.user.username}</div>
                        <div className="text-[11px] text-slate-400">{w.user.phone || "No Mobile"}</div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-base font-black text-purple-400">
                          ₹{w.amount.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">
                          {w.currency}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1d2936] text-slate-300 border border-[#2b3c4d] uppercase">
                          {w.method || "BANK"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono text-slate-300 bg-[#0a0f14] px-2 py-0.5 rounded border border-[#212f3d]">
                          {w.txHash || `ID: ${w.id.slice(-8)}`}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            w.status === "APPROVED"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : w.status === "REJECTED"
                              ? "bg-rose-500/20 text-rose-400"
                              : "bg-amber-500/20 text-amber-300 animate-pulse"
                          }`}
                        >
                          {w.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {w.status === "PENDING" ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setConfirmApproveTx(w)}
                              className="px-3 py-1.5 bg-[#00e701] hover:bg-[#00c701] text-black font-extrabold text-[11px] rounded-lg uppercase tracking-wider"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setRejectTx(w);
                                setRejectReason("");
                              }}
                              className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 font-bold text-[11px] rounded-lg uppercase tracking-wider"
                            >
                              Reject & Refund
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-medium">
                            Processed {w.approvedAt ? new Date(w.approvedAt).toLocaleDateString() : ""}
                          </span>
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

      {/* Approve Confirmation Modal */}
      {confirmApproveTx && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => !isProcessing && setConfirmApproveTx(null)}
        >
          <div
            className="w-full max-w-md bg-[#131b24] border border-[#212f3d] rounded-2xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-white mb-2">Confirm Withdrawal Payout</h3>
            <p className="text-xs text-slate-400 mb-4">
              Mark ₹{confirmApproveTx.amount} payout as processed for @{confirmApproveTx.user.username}?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmApproveTx(null)}
                className="flex-1 py-2 rounded-xl bg-[#1f2b38] text-white font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={isProcessing}
                className="flex-1 py-2 rounded-xl bg-[#00e701] text-black font-black text-xs uppercase"
              >
                {isProcessing ? "Processing..." : "Confirm Release"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal with Reason */}
      {rejectTx && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => !isProcessing && setRejectTx(null)}
        >
          <div
            className="w-full max-w-md bg-[#131b24] border border-[#212f3d] rounded-2xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-white mb-1">Reject & Refund Withdrawal</h3>
            <p className="text-xs text-slate-400 mb-4">
              This will automatically credit ₹{rejectTx.amount} back to @{rejectTx.user.username}&apos;s wallet balance.
            </p>
            <textarea
              rows={2}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason (e.g. Invalid bank IFSC, account name mismatch)..."
              className="w-full bg-[#0a0f14] border border-[#263747] rounded-xl p-3 text-xs text-white placeholder-slate-500 mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setRejectTx(null)}
                className="flex-1 py-2 rounded-xl bg-[#1f2b38] text-white font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-white font-black text-xs uppercase"
              >
                {isProcessing ? "Processing..." : "Confirm & Refund"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
