"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Activity,
  ArrowDownCircle,
  ArrowUpRight,
  Clock,
  Calendar,
  CreditCard,
  Users,
  Sliders,
  Gift,
  Landmark,
  ShieldCheck,
  Settings,
  RefreshCw,
  ArrowRight,
  ExternalLink,
  Radio,
  UserPlus,
  Coins,
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
  totalTurnover: number;
  totalRevenue: number;
  todayRevenue: number;
  totalBetsCount: number;
  activeGamesCount: number;
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<"ALL" | "TODAY" | "THIS_WEEK" | "THIS_MONTH">("TODAY");

  // Realtime clock
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/metrics");
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load Mission-Control metrics");
      }
      setMetrics(data.metrics);
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
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-6 sm:space-y-7">
      {/* ========================================================
          PAGE TOP HEADER & FILTERS
          ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-1 border-b border-[#1e2433]/70">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-black text-white tracking-wide">
              Stake Administration — Mission Control Dashboard
            </h1>
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-amber-500/15 border border-amber-500/40 text-amber-400 font-mono">
              LIVE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Realtime performance metrics, payment queues, and platform infrastructure.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {/* Time Filter Pills */}
          <div className="flex items-center bg-[#131722] border border-[#1e2433] rounded-xl p-0.5">
            {(["ALL", "TODAY", "THIS_WEEK", "THIS_MONTH"] as const).map((filter) => {
              const label =
                filter === "ALL"
                  ? "All"
                  : filter === "TODAY"
                  ? "Today"
                  : filter === "THIS_WEEK"
                  ? "This Week"
                  : "This Month";
              const isSelected = timeFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchMetrics}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#131722] hover:bg-[#1c2233] text-slate-200 text-xs font-semibold rounded-xl border border-[#1e2433] transition-all active:scale-95 shadow-sm"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-amber-400 ${isLoading ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          SEQUENCE ORDER 1: "TODAY'S PERFORMANCE" (Compact 3-Column Grid)
          ======================================================== */}
      <section className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
              Today's Performance
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono">
              ● ACTIVE WINDOW
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#131722] border border-[#1e2433] rounded-lg">
              <Calendar className="w-3 h-3 text-amber-400" />
              <span>{todayFormattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#131722] border border-[#1e2433] rounded-lg text-amber-300 font-bold">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>{currentTime || "12:00:00 PM"}</span>
            </div>
          </div>
        </div>

        {/* 6 Compact Performance Boxes in 3-Columns (1 Line me 3 Items) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Box 1: Today's Net Revenue (Gold) */}
          <div className="bg-[#131722] border border-amber-500/30 rounded-xl p-4 shadow relative overflow-hidden group hover:border-amber-500/50 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 font-mono">
                Today's Net Revenue
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight font-mono">
              ₹{(metrics?.todayRevenue ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-2 pt-2 border-t border-[#1e2433] flex items-center justify-between text-[11px] text-slate-400">
              <span>Deposits - Payouts</span>
              <span className="text-emerald-400 font-mono font-semibold">Net Profit</span>
            </div>
          </div>

          {/* Box 2: Today's Recharge Volume (Violet) */}
          <div className="bg-[#131722] border border-violet-500/30 rounded-xl p-4 shadow relative overflow-hidden group hover:border-violet-500/50 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-violet-400 font-mono">
                Today's Recharges
              </span>
              <div className="w-7 h-7 rounded-lg bg-violet-500/15 border border-violet-500/30 text-violet-400 flex items-center justify-center">
                <ArrowDownCircle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight font-mono">
              ₹{(metrics?.todayDepositsVolume ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-2 pt-2 border-t border-[#1e2433] flex items-center justify-between text-[11px] text-slate-400">
              <span>Pending Review:</span>
              <span className="text-amber-400 font-mono font-bold">
                {metrics?.pendingDepositsCount ?? 0} Queued
              </span>
            </div>
          </div>

          {/* Box 3: Today's Paid Withdrawals (Emerald) */}
          <div className="bg-[#131722] border border-emerald-500/30 rounded-xl p-4 shadow relative overflow-hidden group hover:border-emerald-500/50 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                Today's Withdrawals
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight font-mono">
              ₹{(metrics?.todayWithdrawalsVolume ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-2 pt-2 border-t border-[#1e2433] flex items-center justify-between text-[11px] text-slate-400">
              <span>Pending Payouts:</span>
              <span className="text-amber-400 font-mono font-bold">
                {metrics?.pendingWithdrawalsCount ?? 0} Awaiting
              </span>
            </div>
          </div>

          {/* Box 4: Platform Turnover (Cyan) */}
          <div className="bg-[#131722] border border-cyan-500/30 rounded-xl p-4 shadow relative overflow-hidden group hover:border-cyan-500/50 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
                Platform Turnover
              </span>
              <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                <Activity className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight font-mono">
              ₹{(metrics?.totalTurnover ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-2 pt-2 border-t border-[#1e2433] flex items-center justify-between text-[11px] text-slate-400">
              <span>Bets Wagered:</span>
              <span className="text-cyan-300 font-mono font-bold">
                {metrics?.totalBetsCount ?? 0} Rounds
              </span>
            </div>
          </div>

          {/* Box 5: Today's Joined Users (Amber) */}
          <div className="bg-[#131722] border border-[#1e2433] rounded-xl p-4 shadow relative overflow-hidden group hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 font-mono">
                Joined Users Today
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <UserPlus className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-400 tracking-tight font-mono">
              +{metrics?.todayUsers ?? 0}
            </div>
            <div className="mt-2 pt-2 border-t border-[#1e2433] flex items-center justify-between text-[11px] text-slate-400">
              <span>Total Roster:</span>
              <span className="text-white font-mono font-bold">
                {metrics?.totalUsers ?? 0} Users
              </span>
            </div>
          </div>

          {/* Box 6: User Wallet Liability */}
          <div className="bg-[#131722] border border-[#1e2433] rounded-xl p-4 shadow relative overflow-hidden group hover:border-blue-500/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 font-mono">
                Wallet Liabilities
              </span>
              <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                <Coins className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white tracking-tight font-mono">
              ₹{(metrics?.totalWalletsBalance ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-2 pt-2 border-t border-[#1e2433] flex items-center justify-between text-[11px] text-slate-400">
              <span>Platform Backing:</span>
              <span className="text-emerald-400 font-mono font-bold">100% Reserves</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SEQUENCE ORDER 2: "ADMINISTRATIVE NAVIGATION HUB" (Compact 3-Column Grid)
          ======================================================== */}
      <section className="space-y-3.5">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
            Administrative Navigation Hub
          </h2>
          <p className="text-xs text-slate-400">
            One-click direct jump controls into all operational desks.
          </p>
        </div>

        {/* 9 Compact Bento Cards (3 Rows × 3 Columns on Desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* 1. Payments & Verify */}
          <Link
            href="/admin/transactions"
            className="bg-[#131722] border border-[#1e2433] hover:border-violet-500/50 rounded-xl p-4 flex flex-col justify-between group transition-all shadow hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/30 text-violet-400 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                {metrics?.pendingDepositsCount ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {metrics.pendingDepositsCount} Pending
                  </span>
                ) : null}
              </div>
              <h3 className="text-xs font-bold text-white group-hover:text-violet-400 transition-colors">
                Payments & Verify
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                Deposit receipts, UTR verification, screenshot zoom & 1-click credit.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#1e2433] flex items-center justify-between text-xs font-semibold text-violet-400">
              <span>Open Desk</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* 2. User Directory */}
          <Link
            href="/admin/users"
            className="bg-[#131722] border border-[#1e2433] hover:border-cyan-500/50 rounded-xl p-4 flex flex-col justify-between group transition-all shadow hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/20">
                  {metrics?.totalUsers ?? 0} Users
                </span>
              </div>
              <h3 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                User Directory
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                All players, manual balance editor (+/- INR with remarks) & Luck Mode.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#1e2433] flex items-center justify-between text-xs font-semibold text-cyan-400">
              <span>Manage Users</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* 3. Games & RTP Luck Control */}
          <Link
            href="/admin/luck-control"
            className="bg-[#131722] border border-[#1e2433] hover:border-emerald-500/50 rounded-xl p-4 flex flex-col justify-between group transition-all shadow hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/20">
                  RTP
                </span>
              </div>
              <h3 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                Games & RTP Luck Control
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                Configure house edge margins, forced win multipliers & algorithms.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#1e2433] flex items-center justify-between text-xs font-semibold text-emerald-400">
              <span>Adjust RTP</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* 4. Promos & Rewards */}
          <Link
            href="/admin/promotions"
            className="bg-[#131722] border border-[#1e2433] hover:border-rose-500/50 rounded-xl p-4 flex flex-col justify-between group transition-all shadow hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                  <Gift className="w-4 h-4" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-rose-300 bg-rose-500/10 border border-rose-500/20">
                  Drops
                </span>
              </div>
              <h3 className="text-xs font-bold text-white group-hover:text-rose-400 transition-colors">
                Promos & Rewards
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                Generate coupon codes, deposit reload matchers & gift drop limits.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#1e2433] flex items-center justify-between text-xs font-semibold text-rose-400">
              <span>Manage Promos</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* 5. Finance & Ledger */}
          <Link
            href="/admin/finance"
            className="bg-[#131722] border border-[#1e2433] hover:border-amber-500/50 rounded-xl p-4 flex flex-col justify-between group transition-all shadow hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <Landmark className="w-4 h-4" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/20">
                  Ledger
                </span>
              </div>
              <h3 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                Finance & Ledger
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                Cashflow breakdown, total liabilities vs reserves & payout audit.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#1e2433] flex items-center justify-between text-xs font-semibold text-amber-400">
              <span>View Ledger</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* 6. Admin Team & Security */}
          <Link
            href="/admin/security"
            className="bg-[#131722] border border-[#1e2433] hover:border-cyan-500/50 rounded-xl p-4 flex flex-col justify-between group transition-all shadow hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/20">
                  Roles
                </span>
              </div>
              <h3 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                Admin Team & Security
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                Manage administrative accounts, update security passwords & scopes.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#1e2433] flex items-center justify-between text-xs font-semibold text-cyan-400">
              <span>Security Hub</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* 7. Platform Settings */}
          <Link
            href="/admin/settings"
            className="bg-[#131722] border border-[#1e2433] hover:border-slate-400/50 rounded-xl p-4 flex flex-col justify-between group transition-all shadow hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-500/10 border border-slate-500/30 text-slate-300 flex items-center justify-center">
                  <Settings className="w-4 h-4" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-slate-300 bg-slate-500/10 border border-slate-500/20">
                  Core
                </span>
              </div>
              <h3 className="text-xs font-bold text-white group-hover:text-slate-200 transition-colors">
                Platform Settings
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                Neon database connection status, UPI QR receiver settings & env.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#1e2433] flex items-center justify-between text-xs font-semibold text-slate-400">
              <span>Settings</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* 8. Withdrawal Requests Desk */}
          <Link
            href="/admin/withdrawals"
            className="bg-[#131722] border border-[#1e2433] hover:border-emerald-500/50 rounded-xl p-4 flex flex-col justify-between group transition-all shadow hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                {metrics?.pendingWithdrawalsCount ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {metrics.pendingWithdrawalsCount} Payouts
                  </span>
                ) : null}
              </div>
              <h3 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                Withdrawal Requests
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                Audit player payout requests, dispatch bank transfers & refunds.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#1e2433] flex items-center justify-between text-xs font-semibold text-emerald-400">
              <span>Withdrawal Desk</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* 9. Live Player Gaming Lobby */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#131722] border border-[#1e2433] hover:border-amber-500/50 rounded-xl p-4 flex flex-col justify-between group transition-all shadow hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/20">
                  Lobby
                </span>
              </div>
              <h3 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                Player Gaming Lobby
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                Launch production casino lobby in a new tab to test games & payouts.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#1e2433] flex items-center justify-between text-xs font-semibold text-amber-400">
              <span>Launch Lobby</span>
              <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </a>
        </div>
      </section>

      {/* ========================================================
          SEQUENCE ORDER 3: "OVERALL PLATFORM PERFORMANCE" (Compact 3-Column Grid)
          ======================================================== */}
      <section className="space-y-3.5">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
            Overall Platform Performance
          </h2>
          <p className="text-xs text-slate-400">
            Cumulative all-time platform volume and registered accounts in Neon DB.
          </p>
        </div>

        {/* 3 Compact All-Time Boxes (1 Line me 3 Items) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="bg-[#131722] border border-[#1e2433] rounded-xl p-4 shadow">
            <span className="text-[11px] font-mono uppercase text-slate-400">
              Total Registered Users
            </span>
            <p className="text-xl sm:text-2xl font-black text-white font-mono mt-1">
              {metrics?.totalUsers ?? 0}
            </p>
            <p className="text-[10px] text-slate-500 mt-1 font-mono">
              Accounts in database
            </p>
          </div>

          <div className="bg-[#131722] border border-[#1e2433] rounded-xl p-4 shadow">
            <span className="text-[11px] font-mono uppercase text-slate-400">
              Total Platform Turnover
            </span>
            <p className="text-xl sm:text-2xl font-black text-cyan-400 font-mono mt-1">
              ₹{(metrics?.totalTurnover ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-slate-500 mt-1 font-mono">
              Wagers processed
            </p>
          </div>

          <div className="bg-[#131722] border border-[#1e2433] rounded-xl p-4 shadow">
            <span className="text-[11px] font-mono uppercase text-slate-400">
              Total Bets Logged
            </span>
            <p className="text-xl sm:text-2xl font-black text-amber-400 font-mono mt-1">
              {metrics?.totalBetsCount ?? 0}
            </p>
            <p className="text-[10px] text-slate-500 mt-1 font-mono">
              Rounds recorded
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
