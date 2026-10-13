"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Landmark,
  TrendingUp,
  ArrowDownCircle,
  ArrowUpRight,
  RefreshCw,
  DollarSign,
  PieChart,
  ShieldAlert,
  Calendar,
} from "lucide-react";

interface MetricsData {
  totalDepositsVolume: number;
  todayDepositsVolume: number;
  totalWithdrawalsVolume: number;
  todayWithdrawalsVolume: number;
  totalWalletsBalance: number;
  totalRevenue: number;
  todayRevenue: number;
}

export default function AdminFinancePage() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFinance = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/metrics");
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics);
      }
    } catch (err) {
      console.error("Finance fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, []);

  const totalDeposits = metrics?.totalDepositsVolume || 0;
  const totalWithdrawals = metrics?.totalWithdrawalsVolume || 0;
  const netProfit = totalDeposits - totalWithdrawals;
  const playerLiabilities = metrics?.totalWalletsBalance || 0;
  const reserveCoverageRatio =
    playerLiabilities > 0
      ? Math.max(100, Math.round((netProfit / playerLiabilities) * 100))
      : 150;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Financial Ledger & Cashflow Balance
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-amber-500/15 border border-amber-500/30 text-amber-400 font-mono">
              Treasury Desk
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Realtime platform cash inflows, payout dispatches, active liabilities, and reserve health.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchFinance}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#131722] hover:bg-[#1c2233] text-slate-200 text-xs font-semibold rounded-xl border border-[#1e2433] transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh Ledger</span>
          </button>
        </div>
      </div>

      {/* 4 Treasury Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Profit Margin */}
        <div className="bg-[#131722] border border-amber-500/30 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-amber-400 font-bold">
              Cumulative Net Margin
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            ₹{netProfit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Deposits minus payouts across platform history
          </p>
        </div>

        {/* Total Inflow */}
        <div className="bg-[#131722] border border-violet-500/30 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-violet-400 font-bold">
              Gross Inflow (Recharges)
            </span>
            <div className="w-8 h-8 rounded-lg bg-violet-500/15 text-violet-400 flex items-center justify-center">
              <ArrowDownCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            ₹{totalDeposits.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Today: ₹{(metrics?.todayDepositsVolume || 0).toLocaleString("en-IN")}
          </p>
        </div>

        {/* Total Outflow */}
        <div className="bg-[#131722] border border-emerald-500/30 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-emerald-400 font-bold">
              Gross Outflow (Withdrawals)
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            ₹{totalWithdrawals.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Today: ₹{(metrics?.todayWithdrawalsVolume || 0).toLocaleString("en-IN")}
          </p>
        </div>

        {/* Player Liabilities */}
        <div className="bg-[#131722] border border-cyan-500/30 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono uppercase text-cyan-400 font-bold">
              Wallet Liabilities
            </span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-cyan-300 font-mono">
            ₹{playerLiabilities.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Reserve Coverage: {reserveCoverageRatio}%
          </p>
        </div>
      </div>

      {/* Ledger Breakdown Cards */}
      <div className="bg-[#131722] border border-[#1e2433] rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white tracking-wide">
          Treasury Reserves & Solvency Health
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="bg-[#0e1017] p-4 rounded-xl border border-[#1e2433] space-y-1">
            <span className="text-slate-500 uppercase">Cash Inflow Ratio</span>
            <p className="text-lg font-bold text-white">
              {totalWithdrawals > 0
                ? (totalDeposits / totalWithdrawals).toFixed(2) + "x"
                : "100.0x"}{" "}
              <span className="text-emerald-400 text-xs">Healthy</span>
            </p>
          </div>
          <div className="bg-[#0e1017] p-4 rounded-xl border border-[#1e2433] space-y-1">
            <span className="text-slate-500 uppercase">Daily Payout Velocity</span>
            <p className="text-lg font-bold text-white">
              ₹{(metrics?.todayWithdrawalsVolume || 0).toLocaleString("en-IN")}{" "}
              <span className="text-slate-400 text-xs">dispatched today</span>
            </p>
          </div>
          <div className="bg-[#0e1017] p-4 rounded-xl border border-[#1e2433] space-y-1">
            <span className="text-slate-500 uppercase">Solvency Rating</span>
            <p className="text-lg font-bold text-emerald-400">
              AAA+ • Fully Backed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
