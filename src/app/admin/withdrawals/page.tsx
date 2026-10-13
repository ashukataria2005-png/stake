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
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
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

      setToastMessage(`Withdrawal of ₹${confirmApproveTx.amount} for @${confirmApproveTx.user.username} approved.`);
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

      setToastMessage(`Withdrawal rejected and refunded back to @${rejectTx.user.username}'s wallet.`);
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
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Withdrawal Requests Desk
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono">
              Payout Dispatch
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Audit player withdrawal requests, dispatch bank transfers, or reject and refund locked balance.
          </p>
        </div>

        <button
          onClick={() => fetchWithdrawals()}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#131722] hover:bg-[#1c2233] text-slate-200 text-xs font-semibold rounded-xl border border-[#1e2433] transition-all shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Control Toolbar */}
      <div className="bg-[#131722] border border-[#1e2433] rounded-2xl p-4 space-y-4 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1e2433] pb-3">
          <div className="flex flex-wrap gap-1.5 bg-[#0e1017] p-1 rounded-xl border border-[#1e2433]">
            {[
              { id: "PENDING", label: "Pending Payout", badge: pendingCount },
              { id: "APPROVED", label: "Dispatched (Approved)" },
              { id: "REJECTED", label: "Refunded (Rejected)" },
              { id: "ALL", label: "All Withdrawals" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-black">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <Link
            href="/admin/transactions"
            className="text-xs text-amber-400 hover:text-amber-300 font-mono flex items-center gap-1"
          >
            <span>Switch to Deposits Desk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Username, Phone, or Transaction ID..."
            className="w-full pl-10 pr-4 py-2 bg-[#0e1017] border border-[#1e2433] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 font-mono"
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
                <th className="py-3 px-4">Player</th>
                <th className="py-3 px-4">Payout Amount</th>
                <th className="py-3 px-4">Remaining Balance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2433]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mx-auto mb-2" />
                    <p className="font-mono text-xs">Loading withdrawal requests...</p>
                  </td>
                </tr>
              ) : withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-mono">
                    No withdrawal requests matching filter.
                  </td>
                </tr>
              ) : (
                withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-[#181d2b]/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-slate-200">#{w.id.slice(-8)}</div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(w.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{w.user?.username}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {w.user?.phone || w.user?.email || "No phone"}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <div className="text-sm font-black text-rose-400">
                        ₹{Number(w.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </div>
                      <span className="text-[10px] text-slate-400">{w.method || "BANK_TRANSFER"}</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      ₹{Number(w.user?.currentBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3.5 px-4">
                      {w.status === "PENDING" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          <Clock className="w-3 h-3" />
                          Pending Dispatch
                        </span>
                      )}
                      {w.status === "APPROVED" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle className="w-3 h-3" />
                          Dispatched
                        </span>
                      )}
                      {w.status === "REJECTED" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                          <RotateCcw className="w-3 h-3" />
                          Refunded
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {w.status === "PENDING" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setConfirmApproveTx(w)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold"
                          >
                            Dispatch
                          </button>
                          <button
                            onClick={() => {
                              setRejectTx(w);
                              setRejectReason("");
                            }}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-[11px] font-bold"
                          >
                            Refund
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] font-mono text-slate-500">Completed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmApproveTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative max-w-md w-full bg-[#131722] border border-emerald-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Confirm Bank Payout Dispatch</h3>
            <p className="text-xs text-slate-400">
              Confirm you have transferred <span className="text-emerald-400 font-bold">₹{confirmApproveTx.amount}</span> to player @{confirmApproveTx.user.username}.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setConfirmApproveTx(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-[#0e1017] text-slate-300 border border-[#1e2433]"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={isProcessing}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold uppercase bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg"
              >
                {isProcessing ? "Processing..." : "Confirm Dispatch"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject & Refund Modal */}
      {rejectTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative max-w-md w-full bg-[#131722] border border-rose-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Reject & Refund Withdrawal</h3>
            <p className="text-xs text-slate-400">
              Rejecting will automatically refund <span className="text-emerald-400 font-bold">₹{rejectTx.amount}</span> back into player @{rejectTx.user.username}'s balance.
            </p>
            <input
              type="text"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason (e.g. Invalid bank IFSC / account number)..."
              className="w-full px-3.5 py-2.5 bg-[#0e1017] border border-[#1e2433] rounded-xl text-xs text-white placeholder-slate-500 font-mono"
            />
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setRejectTx(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-[#0e1017] text-slate-300 border border-[#1e2433]"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold uppercase bg-rose-500 hover:bg-rose-400 text-white shadow-lg"
              >
                {isProcessing ? "Refunding..." : "Confirm Refund"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
