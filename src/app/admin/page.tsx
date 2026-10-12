"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { RefreshCw, ExternalLink } from "lucide-react";

interface MetricsData {
  totalUsers: number;
  todayUsers: number;
  pendingDepositsCount: number;
  pendingWithdrawalsCount: number;
  pendingTotalCount: number;
  totalDepositsVolume: number;
  todayDepositsVolume: number;
  totalWithdrawalsVolume: number;
  todayWithdrawalsVolume: number;
  totalWalletsBalance: number;
}

interface RecentTx {
  id: string;
  username: string;
  email: string | null;
  phone: string | null;
  type: "DEPOSIT" | "WITHDRAWAL";
  amount: number;
  currency: string;
  utrNumber: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  method: string;
  isLateSubmission: boolean;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [recentTx, setRecentTx] = useState<RecentTx[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/metrics");
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load dashboard metrics");
      }
      setMetrics(data.metrics);
      setRecentTx(data.recentTransactions || []);
    } catch (err: any) {
      console.error("Dashboard metrics error:", err);
      setError(err.message || "Failed to fetch metrics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const todayFormattedDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* ========================================================
          1. HEADER (Exact replica: Hi, Welcome DEVELOPER 0!)
          ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Hi, Welcome DEVELOPER 0!
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            {todayFormattedDate}
          </p>
        </div>

        <button
          onClick={fetchMetrics}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#1f2124] hover:bg-[#282b30] text-slate-200 text-xs font-semibold rounded border border-[#333] transition-colors self-start sm:self-auto shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#007bff]" : ""}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* ========================================================
          2. DASHBOARD BOXES (Exact replica from dashboard.php)
          ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Box 1: Today User Join */}
        <div className="bg-[#131414] border border-[#23272b] rounded-lg p-5 flex flex-col justify-between shadow">
          <div className="title">
            <p className="text-xs font-semibold text-slate-400 text-left">Today User Join</p>
            <h4 className="text-2xl font-bold text-white text-left mt-2 tracking-wide">
              {isLoading ? "..." : metrics?.todayUsers.toLocaleString() || "0"}
            </h4>
          </div>
        </div>

        {/* Box 2: Today's Recharge */}
        <div className="bg-[#131414] border border-[#23272b] rounded-lg p-5 flex flex-col justify-between shadow">
          <div className="title">
            <p className="text-xs font-semibold text-slate-400 text-left">Today&apos;s Recharge</p>
            <h4 className="text-2xl font-bold text-[#00e701] text-left mt-2 tracking-wide">
              ₹{isLoading ? "..." : (metrics?.todayDepositsVolume || 0).toLocaleString()}
            </h4>
          </div>
        </div>

        {/* Box 3: Today's Withdrawal */}
        <div className="bg-[#131414] border border-[#23272b] rounded-lg p-5 flex flex-col justify-between shadow">
          <div className="title">
            <p className="text-xs font-semibold text-slate-400 text-left">Today&apos;s Withdrawal</p>
            <h4 className="text-2xl font-bold text-white text-left mt-2 tracking-wide">
              ₹{isLoading ? "..." : (metrics?.todayWithdrawalsVolume || 0).toLocaleString()}
            </h4>
          </div>
        </div>

        {/* Box 4: User Balance */}
        <div className="bg-[#131414] border border-[#23272b] rounded-lg p-5 flex flex-col justify-between shadow">
          <div className="title">
            <p className="text-xs font-semibold text-slate-400 text-left">User Balance</p>
            <h4 className="text-2xl font-bold text-amber-300 text-left mt-2 tracking-wide">
              ₹{isLoading ? "..." : (metrics?.totalWalletsBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h4>
          </div>
          <Link href="/admin/users" className="mt-4 pt-3 border-t border-[#23272b] block text-left">
            <span className="text-xs text-[#007bff] hover:underline font-semibold">See in Detail</span>
          </Link>
        </div>

        {/* Box 5: Total Users */}
        <div className="bg-[#131414] border border-[#23272b] rounded-lg p-5 flex flex-col justify-between shadow">
          <div className="title">
            <p className="text-xs font-semibold text-slate-400 text-left">Total Users</p>
            <h4 className="text-2xl font-bold text-white text-left mt-2 tracking-wide">
              {isLoading ? "..." : metrics?.totalUsers.toLocaleString() || "0"}
            </h4>
          </div>
          <Link href="/admin/users" className="mt-4 pt-3 border-t border-[#23272b] block text-left">
            <span className="text-xs text-[#007bff] hover:underline font-semibold">See in Detail</span>
          </Link>
        </div>

        {/* Box 6: Pending Recharge */}
        <div className="bg-[#131414] border border-[#23272b] rounded-lg p-5 flex flex-col justify-between shadow">
          <div className="title">
            <p className="text-xs font-semibold text-slate-400 text-left">Pending Recharge</p>
            <h4 className="text-2xl font-bold text-amber-400 text-left mt-2 tracking-wide">
              {isLoading ? "..." : metrics?.pendingDepositsCount || 0}
            </h4>
          </div>
          <Link href="/admin/transactions" className="mt-4 pt-3 border-t border-[#23272b] block text-left">
            <span className="text-xs text-[#007bff] hover:underline font-semibold">See in Detail</span>
          </Link>
        </div>

        {/* Box 7: Success Recharge */}
        <div className="bg-[#131414] border border-[#23272b] rounded-lg p-5 flex flex-col justify-between shadow">
          <div className="title">
            <p className="text-xs font-semibold text-slate-400 text-left">Success Recharge</p>
            <h4 className="text-2xl font-bold text-[#00e701] text-left mt-2 tracking-wide">
              ₹{isLoading ? "..." : (metrics?.totalDepositsVolume || 0).toLocaleString()}
            </h4>
          </div>
          <Link href="/admin/transactions" className="mt-4 pt-3 border-t border-[#23272b] block text-left">
            <span className="text-xs text-[#007bff] hover:underline font-semibold">See in Detail</span>
          </Link>
        </div>

        {/* Box 8: Total Withdrawal */}
        <div className="bg-[#131414] border border-[#23272b] rounded-lg p-5 flex flex-col justify-between shadow">
          <div className="title">
            <p className="text-xs font-semibold text-slate-400 text-left">Total Withdrawal</p>
            <h4 className="text-2xl font-bold text-white text-left mt-2 tracking-wide">
              ₹{isLoading ? "..." : (metrics?.totalWithdrawalsVolume || 0).toLocaleString()}
            </h4>
          </div>
          <Link href="/admin/withdrawals" className="mt-4 pt-3 border-t border-[#23272b] block text-left">
            <span className="text-xs text-[#007bff] hover:underline font-semibold">See in Detail</span>
          </Link>
        </div>

        {/* Box 9: Withdrawal Requests */}
        <div className="bg-[#131414] border border-[#23272b] rounded-lg p-5 flex flex-col justify-between shadow">
          <div className="title">
            <p className="text-xs font-semibold text-slate-400 text-left">Withdrawal Requests</p>
            <h4 className="text-2xl font-bold text-purple-400 text-left mt-2 tracking-wide">
              {isLoading ? "..." : metrics?.pendingWithdrawalsCount || 0}
            </h4>
          </div>
          <Link href="/admin/withdrawals" className="mt-4 pt-3 border-t border-[#23272b] block text-left">
            <span className="text-xs text-[#007bff] hover:underline font-semibold">See in Detail</span>
          </Link>
        </div>

        {/* Box 10: Today's Total Bet Volume */}
        <div className="bg-[#131414] border border-[#23272b] rounded-lg p-5 flex flex-col justify-between shadow">
          <div className="title">
            <p className="text-xs font-semibold text-slate-400 text-left">Today&apos;s total bet</p>
            <h4 className="text-2xl font-bold text-white text-left mt-2 tracking-wide">
              {isLoading ? "..." : "₹0.00"}
            </h4>
          </div>
          <div className="mt-4 pt-3 border-t border-[#23272b] block text-left">
            <span className="text-xs text-slate-500 font-semibold">Live Game Bets</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. PAYMENT UPDATE / TRANSACTIONS TABLE (DataTable Replica)
          ======================================================== */}
      <div className="bg-[#131414] border border-[#23272b] rounded-lg p-5 shadow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#23272b] pb-4 mb-4">
          <div>
            <h4 className="font-bold text-white text-base">Payment Update</h4>
            <p className="text-xs text-slate-400 mt-0.5">Real-time deposit and withdrawal verification ledger from Neon DB.</p>
          </div>
          <Link
            href="/admin/transactions"
            className="px-4 py-2 bg-[#007bff] hover:bg-[#0056b3] text-white text-xs font-bold rounded transition-colors self-start sm:self-auto"
          >
            Open Full Desk →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-[#23272b] text-xs">
            <thead>
              <tr className="bg-[#1a1d20] text-slate-300 font-bold border-b border-[#23272b]">
                <th className="py-3 px-3.5 border-r border-[#23272b]">#</th>
                <th className="py-3 px-3.5 border-r border-[#23272b]">User ID</th>
                <th className="py-3 px-3.5 border-r border-[#23272b]">Mobile / Username</th>
                <th className="py-3 px-3.5 border-r border-[#23272b]">Reference Number (UTR)</th>
                <th className="py-3 px-3.5 border-r border-[#23272b]">Amount</th>
                <th className="py-3 px-3.5 border-r border-[#23272b]">Order ID</th>
                <th className="py-3 px-3.5 border-r border-[#23272b]">Date</th>
                <th className="py-3 px-3.5 border-r border-[#23272b]">Status</th>
                <th className="py-3 px-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#23272b] text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#007bff]" />
                    <span>Loading payment update records...</span>
                  </td>
                </tr>
              ) : recentTx.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                recentTx.map((tx, idx) => {
                  const dateStr = new Date(tx.createdAt).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  return (
                    <tr key={tx.id} className="hover:bg-[#1a1c1e] transition-colors">
                      <td className="py-3 px-3.5 border-r border-[#23272b] font-mono text-[11px]">{idx + 1}</td>
                      <td className="py-3 px-3.5 border-r border-[#23272b] font-mono text-[11px] text-slate-400">
                        {tx.id.slice(-6)}
                      </td>
                      <td className="py-3 px-3.5 border-r border-[#23272b]">
                        <span className="font-bold text-white">@{tx.username}</span>
                        {tx.phone && <div className="text-[10px] text-slate-400">{tx.phone}</div>}
                      </td>
                      <td className="py-3 px-3.5 border-r border-[#23272b]">
                        {tx.utrNumber ? (
                          <span className="font-mono text-[#00e701] font-bold bg-[#0c0d0e] px-2 py-0.5 rounded border border-[#23272b]">
                            {tx.utrNumber}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 border-r border-[#23272b] font-bold text-white">
                        ₹{tx.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-3.5 border-r border-[#23272b] font-mono text-[11px] text-slate-400">
                        {tx.id.slice(-8)}
                      </td>
                      <td className="py-3 px-3.5 border-r border-[#23272b] text-[11px] text-slate-400">
                        {dateStr}
                      </td>
                      <td className="py-3 px-3.5 border-r border-[#23272b]">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            tx.status === "APPROVED"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : tx.status === "REJECTED"
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-center">
                        <Link
                          href={tx.type === "DEPOSIT" ? "/admin/transactions" : "/admin/withdrawals"}
                          className="px-3 py-1 bg-[#007bff] hover:bg-[#0056b3] text-white text-[11px] font-semibold rounded transition-colors inline-block"
                        >
                          Audit
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
