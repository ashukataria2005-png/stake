"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertTriangle,
  ShieldAlert,
  Gamepad2,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
} from "lucide-react";

interface FinancialDeskData {
  totalGrossDeposits: number;
  totalGrossWithdrawals: number;
  netPlatformProfit: number;
  netProfitMargin: number;
  totalWalletsBalance: number;
  totalTurnover: number;
  gameStats: {
    gameSlug: string;
    turnover: number;
    payout: number;
    houseProfit: number;
    margin: number;
    betsCount: number;
  }[];
  playerRiskList: {
    id: string;
    username: string;
    phone: string | null;
    totalDeposited: number;
    totalWithdrawn: number;
    currentBalance: number;
    netGain: number;
    isFlagged: boolean;
    riskLevel: string;
  }[];
}

export default function AdminFinancePage() {
  const [data, setData] = useState<FinancialDeskData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFinance = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/finance");
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
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

  const totalGrossDeposits = data?.totalGrossDeposits || 0;
  const totalGrossWithdrawals = data?.totalGrossWithdrawals || 0;
  const netPlatformProfit = data?.netPlatformProfit || 0;
  const netProfitMargin = data?.netProfitMargin || 0;

  return (
    <div className="space-y-6">
      {/* Header: Clean & direct, no redundant banners */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">
            Comprehensive Financial Desk
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Realtime revenue margins, game-level P&L breakdowns, and high-margin player risk auditing.
          </p>
        </div>

        <button
          onClick={fetchFinance}
          disabled={isLoading}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#131722] hover:bg-[#1c2233] text-slate-200 text-xs font-semibold rounded-xl border border-[#1e2433] transition-all shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh Desk</span>
        </button>
      </div>

      {/* 4 Core Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Platform Revenue */}
        <div className="bg-[#131722] border border-[#1e2433] rounded-2xl p-5 shadow-lg">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Total Platform Revenue</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-2">
            ₹{totalGrossDeposits.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Gross Inflows Settled</div>
        </div>

        {/* Gross Deposits */}
        <div className="bg-[#131722] border border-emerald-500/25 rounded-2xl p-5 shadow-lg">
          <div className="text-[11px] font-mono text-emerald-400 uppercase font-semibold">Gross Deposits</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 mt-2">
            ₹{totalGrossDeposits.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-500/80 mt-1 flex items-center gap-1">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Verified UPI / Crypto In</span>
          </div>
        </div>

        {/* Gross Withdrawals */}
        <div className="bg-[#131722] border border-rose-500/25 rounded-2xl p-5 shadow-lg">
          <div className="text-[11px] font-mono text-rose-400 uppercase font-semibold">Gross Withdrawals</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-rose-400 mt-2">
            ₹{totalGrossWithdrawals.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-rose-500/80 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Dispatched Payouts Out</span>
          </div>
        </div>

        {/* Net Platform Profit / Margin */}
        <div className={`bg-[#131722] border rounded-2xl p-5 shadow-lg ${
          netPlatformProfit >= 0 ? "border-cyan-500/30" : "border-rose-500/40"
        }`}>
          <div className="text-[11px] font-mono text-cyan-400 uppercase font-semibold">
            Net Profit & Margin
          </div>
          <div className={`text-xl sm:text-2xl font-bold font-mono mt-2 ${
            netPlatformProfit >= 0 ? "text-cyan-400" : "text-rose-400"
          }`}>
            ₹{netPlatformProfit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Platform Margin: <span className="font-bold text-white">{netProfitMargin}%</span>
          </div>
        </div>
      </div>

      {/* Game-Wise Turnover & Profit Breakdown Table */}
      <div className="bg-[#131722] border border-[#1e2433] rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#1e2433] pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-cyan-400" />
              <span>Game-wise Financial Breakdown</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Turnover, player payout disbursements, and house profit margins by title.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#0e1017] border-b border-[#1e2433] text-slate-400 font-mono uppercase text-[11px]">
                <th className="py-3 px-4">Game Title</th>
                <th className="py-3 px-4">Total Bets</th>
                <th className="py-3 px-4">Wagered Turnover</th>
                <th className="py-3 px-4">Total Payout</th>
                <th className="py-3 px-4">House P/L</th>
                <th className="py-3 px-4 text-right">House Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2433] font-mono">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-cyan-400 mb-1" />
                    <span>Loading financial telemetry...</span>
                  </td>
                </tr>
              ) : !data?.gameStats || data.gameStats.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500">
                    No game bets recorded yet.
                  </td>
                </tr>
              ) : (
                data.gameStats.map((g) => (
                  <tr key={g.gameSlug} className="hover:bg-[#181d2b]/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{g.gameSlug}</td>
                    <td className="py-3 px-4 text-slate-300">{g.betsCount}</td>
                    <td className="py-3 px-4 text-slate-200">
                      ₹{g.turnover.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-slate-200">
                      ₹{g.payout.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`py-3 px-4 font-bold ${g.houseProfit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {g.houseProfit >= 0 ? "+" : ""}₹{g.houseProfit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        g.margin >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                      }`}>
                        {g.margin}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Player Risk / Imbalance Desk */}
      <div className="bg-[#131722] border border-[#1e2433] rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#1e2433] pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Player Risk & Imbalance Surveillance</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Audits players with low deposit history but disproportionately high withdrawals or balances.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#0e1017] border-b border-[#1e2433] text-slate-400 font-mono uppercase text-[11px]">
                <th className="py-3 px-4">Player</th>
                <th className="py-3 px-4">Total Deposited</th>
                <th className="py-3 px-4">Total Withdrawn</th>
                <th className="py-3 px-4">Active Balance</th>
                <th className="py-3 px-4">Net Player Gain</th>
                <th className="py-3 px-4 text-right">Risk Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2433] font-mono">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-amber-400 mb-1" />
                    <span>Auditing player balance ratios...</span>
                  </td>
                </tr>
              ) : !data?.playerRiskList || data.playerRiskList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500">
                    No risk flags detected.
                  </td>
                </tr>
              ) : (
                data.playerRiskList.map((p) => (
                  <tr key={p.id} className={`hover:bg-[#181d2b]/60 transition-colors ${
                    p.isFlagged ? "bg-amber-500/5" : ""
                  }`}>
                    <td className="py-3 px-4 font-bold text-white">
                      <div>@{p.username}</div>
                      <div className="text-[10px] text-slate-500">{p.phone || "No phone"}</div>
                    </td>
                    <td className="py-3 px-4 text-emerald-400">
                      ₹{p.totalDeposited.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-rose-400">
                      ₹{p.totalWithdrawn.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-cyan-400">
                      ₹{p.currentBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`py-3 px-4 font-bold ${p.netGain > 0 ? "text-amber-400" : "text-slate-400"}`}>
                      {p.netGain > 0 ? "+" : ""}₹{p.netGain.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {p.isFlagged ? (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          ⚠️ High-Margin Winner
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400">
                          Normal Ratio
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
    </div>
  );
}
