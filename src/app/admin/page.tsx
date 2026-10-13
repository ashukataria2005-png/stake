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
  CheckCircle,
  AlertCircle,
  XCircle,
  Radio,
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
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ========================================================
          1. SECTION HEADER WITH CATEGORY FILTER PILLS
          ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Administration — Mission Control Dashboard
            </h1>
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-amber-500/15 border border-amber-500/40 text-amber-400">
              LIVE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Realtime performance metrics, payment queues, and platform infrastructure.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {/* Time Filter Pills */}
          <div className="flex items-center bg-[#131722] border border-[#1e2433] rounded-xl p-1">
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
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
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
          2. 4 BENTO STAT CARDS (Gold, Cyan, Violet, Emerald)
          ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Revenue (Gold) */}
        <div className="bg-[#131722] border border-amber-500/30 rounded-2xl p-5 relative overflow-hidden shadow-lg group hover:border-amber-500/50 transition-all">
          <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
              Today's Net Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
              ₹{(metrics?.todayRevenue ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="text-emerald-400 font-semibold font-mono">
                Deposits - Payouts
              </span>
              <span>• Live Net Margin</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#1e2433] flex items-center justify-between text-[11px] text-slate-400">
            <span>All-Time Gross:</span>
            <span className="font-mono font-bold text-white">
              ₹{(metrics?.totalRevenue ?? 0).toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Card 2: Platform Turnover (Cyan) */}
        <div className="bg-[#131722] border border-cyan-500/30 rounded-2xl p-5 relative overflow-hidden shadow-lg group hover:border-cyan-500/50 transition-all">
          <div className="absolute top-0 right-0 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
              Platform Turnover
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
              ₹{(metrics?.totalTurnover ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="text-cyan-400 font-semibold font-mono">
                {metrics?.totalBetsCount ?? 0}
              </span>
              <span>total game wagers processed</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#1e2433] flex items-center justify-between text-[11px] text-slate-400">
            <span>Active Games:</span>
            <span className="font-mono font-bold text-cyan-300">
              {metrics?.activeGamesCount ?? 12} Titles Online
            </span>
          </div>
        </div>

        {/* Card 3: Recharge Volume (Violet) */}
        <div className="bg-[#131722] border border-violet-500/30 rounded-2xl p-5 relative overflow-hidden shadow-lg group hover:border-violet-500/50 transition-all">
          <div className="absolute top-0 right-0 w-28 h-28 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-400 font-mono">
              Recharge Volume
            </span>
            <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/30 text-violet-400 flex items-center justify-center">
              <ArrowDownCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
              ₹{(metrics?.todayDepositsVolume ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="text-violet-400 font-semibold font-mono">
                {metrics?.pendingDepositsCount ?? 0} Pending
              </span>
              <span>in review queue</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#1e2433] flex items-center justify-between text-[11px] text-slate-400">
            <span>Total Approved:</span>
            <span className="font-mono font-bold text-white">
              ₹{(metrics?.totalDepositsVolume ?? 0).toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Card 4: Paid Withdrawals (Emerald) */}
        <div className="bg-[#131722] border border-emerald-500/30 rounded-2xl p-5 relative overflow-hidden shadow-lg group hover:border-emerald-500/50 transition-all">
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
              Paid Withdrawals
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
              ₹{(metrics?.todayWithdrawalsVolume ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="text-emerald-400 font-semibold font-mono">
                {metrics?.pendingWithdrawalsCount ?? 0} Awaiting
              </span>
              <span>bank payout dispatch</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#1e2433] flex items-center justify-between text-[11px] text-slate-400">
            <span>Total Dispatched:</span>
            <span className="font-mono font-bold text-white">
              ₹{(metrics?.totalWithdrawalsVolume ?? 0).toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. "TODAY'S PERFORMANCE" ACTIVE WINDOW TIMER CARD
          ======================================================== */}
      <div className="bg-[#131722] border border-[#1e2433] rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Today's Performance & Terminal Window
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono">
                  ● ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Live Server Synchronized • High Performance Processing Window
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0e1017] border border-[#1e2433] rounded-xl text-xs font-mono text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>{todayFormattedDate}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0e1017] border border-[#1e2433] rounded-xl text-xs font-mono text-amber-300 font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentTime || "12:00:00 PM"}</span>
            </div>
          </div>
        </div>

        {/* Mini stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-[#1e2433]">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500">New Users Today</span>
            <p className="text-lg font-bold text-white font-mono mt-0.5">
              +{metrics?.todayUsers ?? 0}
            </p>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500">Pending Approvals</span>
            <p className="text-lg font-bold text-amber-400 font-mono mt-0.5">
              {metrics?.pendingTotalCount ?? 0}
            </p>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500">Player Balances Liability</span>
            <p className="text-lg font-bold text-cyan-400 font-mono mt-0.5">
              ₹{(metrics?.totalWalletsBalance ?? 0).toLocaleString("en-IN")}
            </p>
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-500">System State</span>
            <p className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
              Healthy • 99.99%
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================
          4. "ADMINISTRATIVE NAVIGATION HUB" (Bento Shortcut Cards)
          ======================================================== */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
              Administrative Navigation Hub
            </h2>
            <p className="text-xs text-slate-400">
              One-click jump controls into all Mission-Control operational modules.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Module 1: Payments & Verify */}
          <Link
            href="/admin/transactions"
            className="bg-[#131722] border border-[#1e2433] hover:border-violet-500/50 rounded-2xl p-5 flex flex-col justify-between group transition-all shadow-md hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                {metrics?.pendingDepositsCount ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {metrics.pendingDepositsCount} Pending
                  </span>
                ) : null}
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-violet-400 transition-colors">
                Payments & Verify
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Deposit receipts, UTR verification, screenshot inspection & withdrawal payout desks.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#1e2433] flex items-center justify-between text-xs font-semibold text-violet-400">
              <span>Open Desk</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Module 2: User Directory */}
          <Link
            href="/admin/users"
            className="bg-[#131722] border border-[#1e2433] hover:border-cyan-500/50 rounded-2xl p-5 flex flex-col justify-between group transition-all shadow-md hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/20">
                  {metrics?.totalUsers ?? 0} Accounts
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                User Directory
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                All players, manual wallet balance edit (+/- INR with remarks) & per-user Luck Mode.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#1e2433] flex items-center justify-between text-xs font-semibold text-cyan-400">
              <span>Inspect Users</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Module 3: Games & RTP Luck Control */}
          <Link
            href="/admin/luck-control"
            className="bg-[#131722] border border-[#1e2433] hover:border-emerald-500/50 rounded-2xl p-5 flex flex-col justify-between group transition-all shadow-md hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <Sliders className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/20">
                  RTP Engine
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                Games & RTP Luck Control
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Configure global house edge, forced win multipliers & per-title win/loss probabilities.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#1e2433] flex items-center justify-between text-xs font-semibold text-emerald-400">
              <span>Adjust RTP</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Module 4: Promos & Rewards */}
          <Link
            href="/admin/promotions"
            className="bg-[#131722] border border-[#1e2433] hover:border-rose-500/50 rounded-2xl p-5 flex flex-col justify-between group transition-all shadow-md hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                  <Gift className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-rose-300 bg-rose-500/10 border border-rose-500/20">
                  Bonus Drops
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors">
                Promos & Rewards
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Generate coupon codes, deposit reload matchers, public drop links and voucher limits.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#1e2433] flex items-center justify-between text-xs font-semibold text-rose-400">
              <span>Manage Rewards</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Module 5: Finance & Ledger */}
          <Link
            href="/admin/finance"
            className="bg-[#131722] border border-[#1e2433] hover:border-amber-500/50 rounded-2xl p-5 flex flex-col justify-between group transition-all shadow-md hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <Landmark className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/20">
                  Ledger
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                Finance & Ledger
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Cashflow breakdown, total liabilities vs reserves, payout audit and daily balances.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#1e2433] flex items-center justify-between text-xs font-semibold text-amber-400">
              <span>View Ledger</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Module 6: Admin Team & Security */}
          <Link
            href="/admin/security"
            className="bg-[#131722] border border-[#1e2433] hover:border-cyan-500/50 rounded-2xl p-5 flex flex-col justify-between group transition-all shadow-md hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/20">
                  Super Admin
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                Admin Team & Security
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Manage administrative accounts, update security passwords, roles and clearance scopes.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#1e2433] flex items-center justify-between text-xs font-semibold text-cyan-400">
              <span>Security Hub</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Module 7: Platform Settings */}
          <Link
            href="/admin/settings"
            className="bg-[#131722] border border-[#1e2433] hover:border-slate-400/50 rounded-2xl p-5 flex flex-col justify-between group transition-all shadow-md hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-slate-500/10 border border-slate-500/30 text-slate-300 flex items-center justify-center">
                  <Settings className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-slate-300 bg-slate-500/10 border border-slate-500/20">
                  PostgreSQL
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-slate-200 transition-colors">
                Platform Settings
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Neon database connection status, UPI QR receiver settings and system environment.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#1e2433] flex items-center justify-between text-xs font-semibold text-slate-400">
              <span>Settings</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Module 8: Live Game Client */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#131722] border border-[#1e2433] hover:border-amber-500/50 rounded-2xl p-5 flex flex-col justify-between group transition-all shadow-md hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <ExternalLink className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/20">
                  Frontend
                </span>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                Player Gaming Lobby
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Launch production player viewport in a new tab to test games, deposit and withdraw live.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#1e2433] flex items-center justify-between text-xs font-semibold text-amber-400">
              <span>Launch Lobby</span>
              <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </a>
        </div>
      </div>

      {/* ========================================================
          5. "ALL-TIME PLATFORM SUMMARY" CARDS
          ======================================================== */}
      <div>
        <h2 className="text-base sm:text-lg font-bold text-white mb-3 tracking-wide">
          All-Time Platform Summary
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#131722] border border-[#1e2433] rounded-2xl p-4 shadow-sm">
            <span className="text-[11px] font-mono uppercase text-slate-400">Registered Users</span>
            <p className="text-xl sm:text-2xl font-black text-white font-mono mt-1">
              {metrics?.totalUsers ?? 0}
            </p>
          </div>
          <div className="bg-[#131722] border border-[#1e2433] rounded-2xl p-4 shadow-sm">
            <span className="text-[11px] font-mono uppercase text-slate-400">Platform Turnover</span>
            <p className="text-xl sm:text-2xl font-black text-cyan-400 font-mono mt-1">
              ₹{(metrics?.totalTurnover ?? 0).toLocaleString("en-IN")}
            </p>
          </div>
          <div className="bg-[#131722] border border-[#1e2433] rounded-2xl p-4 shadow-sm">
            <span className="text-[11px] font-mono uppercase text-slate-400">Active Game Titles</span>
            <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-1">
              {metrics?.activeGamesCount ?? 12}
            </p>
          </div>
          <div className="bg-[#131722] border border-[#1e2433] rounded-2xl p-4 shadow-sm">
            <span className="text-[11px] font-mono uppercase text-slate-400">Total Bets Logged</span>
            <p className="text-xl sm:text-2xl font-black text-amber-400 font-mono mt-1">
              {metrics?.totalBetsCount ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================
          6. RECENT TRANSACTIONS STREAM TABLE
          ======================================================== */}
      <div className="bg-[#131722] border border-[#1e2433] rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
              Live Transactions Stream
            </h3>
            <p className="text-xs text-slate-400">
              Latest payment events recorded in Neon PostgreSQL.
            </p>
          </div>

          <Link
            href="/admin/transactions"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0e1017] hover:bg-[#1a2030] text-amber-400 border border-amber-500/30 rounded-xl text-xs font-semibold transition-colors self-start sm:self-auto"
          >
            <span>Open Verification Desk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1e2433] text-slate-400 font-mono text-[11px] uppercase">
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Player</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">UTR / Ref</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2433]">
              {recentTx.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-mono">
                    No recent transactions in database.
                  </td>
                </tr>
              ) : (
                recentTx.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#181d2b]/60 transition-colors">
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                          tx.type === "DEPOSIT"
                            ? "bg-violet-500/15 text-violet-300 border border-violet-500/30"
                            : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{tx.username}</div>
                      {tx.phone && (
                        <div className="text-[10px] text-slate-500 font-mono">{tx.phone}</div>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-white">
                      ₹{tx.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">
                      {tx.utrNumber ? (
                        <span className="bg-[#0e1017] px-2 py-0.5 rounded border border-[#1e2433]">
                          {tx.utrNumber}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {tx.status === "PENDING" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <AlertCircle className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                      {tx.status === "APPROVED" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle className="w-3 h-3" />
                          Approved
                        </span>
                      )}
                      {tx.status === "REJECTED" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          <XCircle className="w-3 h-3" />
                          Rejected
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                      {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href="/admin/transactions"
                        className="px-2.5 py-1 rounded-lg bg-[#0e1017] hover:bg-[#1a2030] text-amber-400 border border-amber-500/20 text-[11px] font-semibold transition-colors"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
