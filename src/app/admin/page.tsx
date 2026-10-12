"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Clock,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Coins,
  AlertTriangle,
} from "lucide-react";

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

  const todayDateString = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-7">
      {/* Welcome Banner (Replicating dashboard.php 'Hi, Welcome DEVELOPER 0!') */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#131b24] to-[#17222e] p-6 rounded-2xl border border-[#212f3d] shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-[#00e701]/20 text-[#00e701] border border-[#00e701]/30">
              Live Operations
            </span>
            <span className="text-xs text-slate-400 font-mono">Neon PostgreSQL Cloud</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide">
            Welcome to Betting Operations Console
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            System Date: <span className="text-slate-200 font-medium">{todayDateString}</span> • Real-time database synchronisation active.
          </p>
        </div>

        <button
          onClick={fetchMetrics}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1f2c3a] hover:bg-[#28384a] text-white text-xs font-semibold rounded-xl border border-[#2d4054] transition-all self-start sm:self-auto shadow"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#00e701]" : ""}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* METRIC CARDS GRID (Replicating dashboard.php metric boxes) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today User Join / Total Users */}
        <div className="bg-[#131414] border border-[#23272b] rounded-2xl p-5 flex flex-col justify-between hover:border-[#384149] transition-all shadow-md group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today User Join</span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <UserPlus className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white tracking-tight mb-1">
              {isLoading ? "..." : metrics?.todayUsers.toLocaleString() || "0"}
            </div>
            <p className="text-[11px] text-slate-400">
              Total platform accounts: <span className="text-white font-bold">{metrics?.totalUsers || 0}</span>
            </p>
          </div>
          <Link
            href="/admin/users"
            className="mt-4 pt-3 border-t border-[#23272b] flex items-center justify-between text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span>See in Detail</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Card 2: Today's Recharge / Total Recharge */}
        <div className="bg-[#131414] border border-[#23272b] rounded-2xl p-5 flex flex-col justify-between hover:border-[#384149] transition-all shadow-md group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today&apos;s Recharge</span>
              <div className="w-8 h-8 rounded-lg bg-[#00e701]/10 text-[#00e701] flex items-center justify-center">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#00e701] tracking-tight mb-1">
              ₹{isLoading ? "..." : (metrics?.todayDepositsVolume || 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400">
              Total all-time deposits: <span className="text-white font-bold">₹{(metrics?.totalDepositsVolume || 0).toLocaleString()}</span>
            </p>
          </div>
          <Link
            href="/admin/transactions"
            className="mt-4 pt-3 border-t border-[#23272b] flex items-center justify-between text-xs font-bold text-[#00e701] hover:text-[#00c701] transition-colors"
          >
            <span>See in Detail</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Card 3: Today's Withdrawal / Total Withdrawal */}
        <div className="bg-[#131414] border border-[#23272b] rounded-2xl p-5 flex flex-col justify-between hover:border-[#384149] transition-all shadow-md group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today&apos;s Withdrawal</span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white tracking-tight mb-1">
              ₹{isLoading ? "..." : (metrics?.todayWithdrawalsVolume || 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400">
              Total all-time paid: <span className="text-slate-300 font-bold">₹{(metrics?.totalWithdrawalsVolume || 0).toLocaleString()}</span>
            </p>
          </div>
          <Link
            href="/admin/withdrawals"
            className="mt-4 pt-3 border-t border-[#23272b] flex items-center justify-between text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors"
          >
            <span>See in Detail</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Card 4: Total User Balance Volume */}
        <div className="bg-[#131414] border border-[#23272b] rounded-2xl p-5 flex flex-col justify-between hover:border-[#384149] transition-all shadow-md group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">User Wallet Balance</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-300 tracking-tight mb-1">
              ₹{isLoading ? "..." : (metrics?.totalWalletsBalance || 0).toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400">
              Sum of active player wallets in Neon DB
            </p>
          </div>
          <Link
            href="/admin/users"
            className="mt-4 pt-3 border-t border-[#23272b] flex items-center justify-between text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>Manage Balances</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* ACTION HUBS & PENDING DESK SHORTCUTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Deposit Desk Quick Card */}
        <div className="bg-[#131b24] border border-[#212f3d] rounded-2xl p-6 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Deposit Requests Desk</span>
              {metrics?.pendingDepositsCount ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-black">
                  {metrics.pendingDepositsCount} PENDING
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1d2936] text-slate-400">
                  All Cleared
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Inspect UTR proofs, verify receipts & release instant wallet deposits.
            </p>
          </div>
          <Link
            href="/admin/transactions"
            className="px-4 py-2.5 bg-[#00e701] hover:bg-[#00c701] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow shrink-0"
          >
            Open Desk →
          </Link>
        </div>

        {/* Withdrawal Desk Quick Card */}
        <div className="bg-[#131b24] border border-[#212f3d] rounded-2xl p-6 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Withdrawal Approval Desk</span>
              {metrics?.pendingWithdrawalsCount ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white">
                  {metrics.pendingWithdrawalsCount} PENDING
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1d2936] text-slate-400">
                  All Cleared
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Process bank payouts, manage UPI releases & audit payout balances.
            </p>
          </div>
          <Link
            href="/admin/withdrawals"
            className="px-4 py-2.5 bg-[#253545] hover:bg-[#2d4054] text-white font-bold text-xs uppercase tracking-wider rounded-xl border border-[#31455a] transition-all shrink-0"
          >
            Open Desk →
          </Link>
        </div>
      </div>

      {/* RECENT TRANSACTIONS AUDIT TABLE */}
      <div className="bg-[#131b24] border border-[#212f3d] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-[#212f3d] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0f171f]">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Live Transaction Stream</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1d2936] text-slate-300">
                Neon DB Realtime
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Latest incoming deposit attempts and withdrawal applications.
            </p>
          </div>
          <Link
            href="/admin/transactions"
            className="text-xs font-bold text-[#00e701] hover:underline flex items-center gap-1"
          >
            <span>View Full Ledger</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#17222d] text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-[#212f3d]">
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">UTR / Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#212f3d]/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#00e701]" />
                    <span>Loading latest records from Neon DB...</span>
                  </td>
                </tr>
              ) : recentTx.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No transactions recorded yet in database.
                  </td>
                </tr>
              ) : (
                recentTx.map((tx) => {
                  const isDeposit = tx.type === "DEPOSIT";
                  const dateStr = new Date(tx.createdAt).toLocaleString("en-IN", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  return (
                    <tr key={tx.id} className="hover:bg-[#1a2530]/60 transition-colors">
                      <td className="py-3 px-4 text-slate-300 font-mono text-[11px] whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-bold text-white">@{tx.username}</span>
                        {tx.phone && <div className="text-[10px] text-slate-400">{tx.phone}</div>}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isDeposit
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                          }`}
                        >
                          {isDeposit ? "📥 Deposit" : "📤 Withdrawal"}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-bold text-white text-sm">
                          ₹{tx.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {tx.utrNumber ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[#00e701] font-bold text-[11px] bg-[#0d131a] px-2 py-0.5 rounded border border-[#212f3d]">
                              {tx.utrNumber}
                            </span>
                            {tx.isLateSubmission && (
                              <span className="text-[9px] font-black bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded border border-amber-500/40">
                                LATE
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px] uppercase">{tx.method || "UPI"}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            tx.status === "APPROVED"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : tx.status === "REJECTED"
                              ? "bg-rose-500/20 text-rose-400"
                              : "bg-amber-500/20 text-amber-300 animate-pulse"
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <Link
                          href={isDeposit ? "/admin/transactions" : "/admin/withdrawals"}
                          className="px-2.5 py-1 rounded bg-[#202d3b] hover:bg-[#2b3c4e] text-slate-300 hover:text-white text-[11px] font-semibold border border-[#2d4054] transition-colors"
                        >
                          Audit →
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
