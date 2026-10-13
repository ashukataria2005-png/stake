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
  DollarSign,
  Plus,
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
    <div className="space-y-6 sm:space-y-7 max-w-6xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#213743]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
            Stake Administration
          </h1>
          <p className="text-xs text-[#b1bad3] mt-0.5">
            Mission Control performance metrics and operational hub.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchMetrics}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#213743] hover:bg-[#2a4454] text-white text-xs font-semibold rounded-xl border border-[#2f4553] transition-all active:scale-95 shadow-sm"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-amber-400 ${isLoading ? "animate-spin" : ""}`}
            />
            <span>Refresh Metrics</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          PART A: TOP CONTAINER (Today's Performance)
          Unified outer container with 2 Rows x 3 Columns Grid (6 boxes)
          ======================================================== */}
      <div className="bg-[#1a2c38] border border-[#213743] rounded-2xl p-3.5 sm:p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#213743]">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-[#00e701] animate-pulse" />
            <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
              Today's Performance
            </h2>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-mono text-[#b1bad3]">
            <div className="flex items-center gap-1 px-2 py-0.5 bg-[#0f212e] border border-[#213743] rounded-md">
              <Calendar className="w-2.5 h-2.5 text-amber-400" />
              <span>{todayFormattedDate}</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 bg-[#0f212e] border border-[#213743] rounded-md text-amber-300 font-bold">
              <Clock className="w-2.5 h-2.5 text-amber-400" />
              <span>{currentTime || "12:00:00 PM"}</span>
            </div>
          </div>
        </div>

        {/* Strictly 2 Rows x 3 Columns (6 Compact Boxes) */}
        <div className="grid grid-cols-3 grid-rows-2 gap-3">
          {/* Box 1: Today's Revenue (₹) */}
          <div className="bg-[#0f212e] border border-[#213743] hover:border-amber-500/40 rounded-xl p-3 sm:p-3.5 transition-colors shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 font-mono">
                Today's Revenue
              </span>
              <div className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-black text-white font-mono tracking-tight">
              ₹{(metrics?.todayDepositsVolume ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Box 2: Today's Profit (₹) */}
          <div className="bg-[#0f212e] border border-[#213743] hover:border-emerald-500/40 rounded-xl p-3 sm:p-3.5 transition-colors shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                Today's Profit
              </span>
              <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono tracking-tight">
              ₹{(metrics?.todayRevenue ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Box 3: Today's New Members (Count) */}
          <div className="bg-[#0f212e] border border-[#213743] hover:border-cyan-500/40 rounded-xl p-3 sm:p-3.5 transition-colors shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
                Today's New Members
              </span>
              <div className="w-6 h-6 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
                <UserPlus className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-black text-white font-mono tracking-tight">
              +{metrics?.todayUsers ?? 0}
            </div>
          </div>

          {/* Box 4: Today's Deposit (₹) */}
          <div className="bg-[#0f212e] border border-[#213743] hover:border-violet-500/40 rounded-xl p-3 sm:p-3.5 transition-colors shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-violet-400 font-mono">
                Today's Deposit
              </span>
              <div className="w-6 h-6 rounded-lg bg-violet-500/15 text-violet-400 flex items-center justify-center">
                <ArrowDownCircle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-black text-white font-mono tracking-tight">
              ₹{(metrics?.todayDepositsVolume ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] text-amber-400 font-mono mt-1">
              {metrics?.pendingDepositsCount ?? 0} Pending approvals
            </p>
          </div>

          {/* Box 5: Today's Withdrawals (₹) */}
          <div className="bg-[#0f212e] border border-[#213743] hover:border-rose-500/40 rounded-xl p-3 sm:p-3.5 transition-colors shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 font-mono">
                Today's Withdrawals
              </span>
              <div className="w-6 h-6 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-black text-white font-mono tracking-tight">
              ₹{(metrics?.todayWithdrawalsVolume ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] text-amber-400 font-mono mt-1">
              {metrics?.pendingWithdrawalsCount ?? 0} Awaiting dispatch
            </p>
          </div>

          {/* Box 6: Empty Placeholder Box */}
          <div className="border border-dashed border-[#2f4553] bg-[#0f212e]/50 rounded-xl flex flex-col items-center justify-center p-3 text-center transition-colors">
            <Plus className="w-5 h-5 text-[#2f4553] mb-1" />
            <span className="text-[11px] font-mono text-[#b1bad3]/60">
              — Reserved Metric Slot —
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================
          PART B: MIDDLE SECTION (Administration Hub)
          Full-width single-column rows (ultra-compact minimal height)
          ======================================================== */}
      <div className="space-y-2.5">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
            Administrative Navigation Hub
          </h2>
          <p className="text-xs text-[#b1bad3]">
            Full-width operational modules and administrative consoles.
          </p>
        </div>

        <div className="space-y-1.5">
          {/* Row 1: Payments & Verify Desk */}
          <Link
            href="/admin/transactions"
            className="w-full h-11 sm:h-12 px-3 sm:px-4 rounded-xl bg-[#1a2c38] hover:bg-[#213743] border border-[#213743] hover:border-[#2f4553] flex items-center justify-between transition-all group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-violet-500/15 text-violet-400 flex items-center justify-center shrink-0">
                <CreditCard className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-white group-hover:text-violet-300 transition-colors">
                Payments & Verify Desk
              </span>
              {metrics?.pendingDepositsCount ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {metrics.pendingDepositsCount} Pending
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#b1bad3] group-hover:text-white">
              <span className="hidden sm:inline text-[11px]">UTR verification & 1-click approvals</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Row 2: User Directory & Balances */}
          <Link
            href="/admin/users"
            className="w-full h-11 sm:h-12 px-3 sm:px-4 rounded-xl bg-[#1a2c38] hover:bg-[#213743] border border-[#213743] hover:border-[#2f4553] flex items-center justify-between transition-all group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
                <Users className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                User Directory & Balances
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/20">
                {metrics?.totalUsers ?? 0} Users
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#b1bad3] group-hover:text-white">
              <span className="hidden sm:inline text-[11px]">Balance adjust (+/- INR) & Luck Mode</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Row 3: Games & RTP Luck Control */}
          <Link
            href="/admin/luck-control"
            className="w-full h-11 sm:h-12 px-3 sm:px-4 rounded-xl bg-[#1a2c38] hover:bg-[#213743] border border-[#213743] hover:border-[#2f4553] flex items-center justify-between transition-all group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                <Sliders className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                Games & RTP Luck Control
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/20">
                RTP Desk
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#b1bad3] group-hover:text-white">
              <span className="hidden sm:inline text-[11px]">House edge margins & multipliers</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Row 4: Promos & Rewards */}
          <Link
            href="/admin/promotions"
            className="w-full h-11 sm:h-12 px-3 sm:px-4 rounded-xl bg-[#1a2c38] hover:bg-[#213743] border border-[#213743] hover:border-[#2f4553] flex items-center justify-between transition-all group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
                <Gift className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-white group-hover:text-rose-300 transition-colors">
                Promos & Rewards
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#b1bad3] group-hover:text-white">
              <span className="hidden sm:inline text-[11px]">Voucher codes & campaign drops</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Row 5: Finance & Ledger */}
          <Link
            href="/admin/finance"
            className="w-full h-11 sm:h-12 px-3 sm:px-4 rounded-xl bg-[#1a2c38] hover:bg-[#213743] border border-[#213743] hover:border-[#2f4553] flex items-center justify-between transition-all group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                <Landmark className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                Finance & Ledger
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#b1bad3] group-hover:text-white">
              <span className="hidden sm:inline text-[11px]">Cashflow balance & reserve coverage</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Row 6: Admin Team & Security */}
          <Link
            href="/admin/security"
            className="w-full h-11 sm:h-12 px-3 sm:px-4 rounded-xl bg-[#1a2c38] hover:bg-[#213743] border border-[#213743] hover:border-[#2f4553] flex items-center justify-between transition-all group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                Admin Team & Security
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#b1bad3] group-hover:text-white">
              <span className="hidden sm:inline text-[11px]">Access permissions & security keys</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Row 7: Platform Settings */}
          <Link
            href="/admin/settings"
            className="w-full h-11 sm:h-12 px-3 sm:px-4 rounded-xl bg-[#1a2c38] hover:bg-[#213743] border border-[#213743] hover:border-[#2f4553] flex items-center justify-between transition-all group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-slate-500/15 text-slate-300 flex items-center justify-center shrink-0">
                <Settings className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-white group-hover:text-slate-200 transition-colors">
                Platform Settings
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#b1bad3] group-hover:text-white">
              <span className="hidden sm:inline text-[11px]">Database health & payment receiver config</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Row 8: Withdrawal Requests Desk */}
          <Link
            href="/admin/withdrawals"
            className="w-full h-11 sm:h-12 px-3 sm:px-4 rounded-xl bg-[#1a2c38] hover:bg-[#213743] border border-[#213743] hover:border-[#2f4553] flex items-center justify-between transition-all group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                Withdrawal Requests Desk
              </span>
              {metrics?.pendingWithdrawalsCount ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {metrics.pendingWithdrawalsCount} Payouts
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#b1bad3] group-hover:text-white">
              <span className="hidden sm:inline text-[11px]">Bank transfer dispatch & refunds</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Row 9: Live Player Gaming Lobby */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-11 sm:h-12 px-3 sm:px-4 rounded-xl bg-[#1a2c38] hover:bg-[#213743] border border-[#213743] hover:border-[#2f4553] flex items-center justify-between transition-all group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                Player Gaming Lobby
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/20">
                Live Frontend
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#b1bad3] group-hover:text-white">
              <span className="hidden sm:inline text-[11px]">Launch client viewport</span>
              <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </a>
        </div>
      </div>

      {/* ========================================================
          PART C: BOTTOM CONTAINER (Total / Overall Overview)
          Unified outer container with 2 Rows x 3 Columns Grid (6 boxes)
          ======================================================== */}
      <div className="bg-[#1a2c38] border border-[#213743] rounded-2xl p-3.5 sm:p-4 shadow-lg space-y-3">
        <div className="pb-2 border-b border-[#213743]">
          <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
            Overall Platform Overview
          </h2>
        </div>

        {/* Strictly 2 Rows x 3 Columns (6 Compact Boxes) */}
        <div className="grid grid-cols-3 grid-rows-2 gap-3">
          {/* Box 1: Total Revenue (₹) */}
          <div className="bg-[#0f212e] border border-[#213743] hover:border-amber-500/40 rounded-xl p-3 sm:p-3.5 transition-colors shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 font-mono">
                Total Revenue
              </span>
              <div className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-black text-white font-mono tracking-tight">
              ₹{(metrics?.totalDepositsVolume ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Box 2: Total Profit (₹) */}
          <div className="bg-[#0f212e] border border-[#213743] hover:border-emerald-500/40 rounded-xl p-3 sm:p-3.5 transition-colors shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                Total Profit
              </span>
              <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-black text-emerald-400 font-mono tracking-tight">
              ₹{(metrics?.totalRevenue ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Box 3: Total Members (Count) */}
          <div className="bg-[#0f212e] border border-[#213743] hover:border-cyan-500/40 rounded-xl p-3 sm:p-3.5 transition-colors shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
                Total Members
              </span>
              <div className="w-6 h-6 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-black text-white font-mono tracking-tight">
              {metrics?.totalUsers ?? 0}
            </div>
          </div>

          {/* Box 4: Total Deposit (₹) */}
          <div className="bg-[#0f212e] border border-[#213743] hover:border-violet-500/40 rounded-xl p-3 sm:p-3.5 transition-colors shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-violet-400 font-mono">
                Total Deposit
              </span>
              <div className="w-6 h-6 rounded-lg bg-violet-500/15 text-violet-400 flex items-center justify-center">
                <ArrowDownCircle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-black text-white font-mono tracking-tight">
              ₹{(metrics?.totalDepositsVolume ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Box 5: Total Withdrawals (₹) */}
          <div className="bg-[#0f212e] border border-[#213743] hover:border-rose-500/40 rounded-xl p-3 sm:p-3.5 transition-colors shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 font-mono">
                Total Withdrawals
              </span>
              <div className="w-6 h-6 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-black text-white font-mono tracking-tight">
              ₹{(metrics?.totalWithdrawalsVolume ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Box 6: Empty Placeholder Box */}
          <div className="border border-dashed border-[#2f4553] bg-[#0f212e]/50 rounded-xl flex flex-col items-center justify-center p-3 text-center transition-colors">
            <Plus className="w-5 h-5 text-[#2f4553] mb-1" />
            <span className="text-[11px] font-mono text-[#b1bad3]/60">
              — Reserved Metric Slot —
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
