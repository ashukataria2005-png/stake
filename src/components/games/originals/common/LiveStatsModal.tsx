"use client";

import React from "react";
import { BarChart2, RotateCcw, X, TrendingUp, TrendingDown } from "lucide-react";
import { useGame } from "@/context/GameContext";

interface LiveStatsModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function LiveStatsModal({ isOpen, onClose }: LiveStatsModalProps) {
  const {
    sessionWagered,
    sessionProfit,
    sessionWins,
    sessionLosses,
    resetSessionStats,
    isLiveStatsOpen,
    setIsLiveStatsOpen,
    currencySymbol,
  } = useGame();

  const show = isOpen !== undefined ? isOpen : isLiveStatsOpen;
  const handleClose = onClose || (() => setIsLiveStatsOpen(false));

  if (!show) return null;

  const totalBets = sessionWins + sessionLosses;
  const winRate = totalBets > 0 ? (sessionWins / totalBets) * 100 : 0;
  const isProfitable = sessionProfit >= 0;
  const activeSym = currencySymbol || "₹";

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150 select-none"
    >
      <div className="w-[320px] sm:w-[360px] bg-[#1a2c38] border border-[#2f4553] rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#213743] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#213743] text-cyan-400">
              <BarChart2 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-extrabold tracking-wide">Live Stats</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={resetSessionStats}
              title="Reset Session Stats"
              className="p-1.5 rounded-lg bg-[#213743] hover:bg-[#2f4553] text-[#b1bad3] hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-lg text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors cursor-pointer text-sm font-semibold"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="space-y-3">
          {/* 1. Profit / Loss */}
          <div className="bg-[#0f212e] border border-[#213743] rounded-xl p-3 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-[#b1bad3] uppercase tracking-wider">
                Profit / Loss
              </span>
              <div
                className={`text-lg font-black font-mono tracking-tight flex items-center gap-1 ${
                  isProfitable ? "text-[#00e701]" : "text-[#e9113c]"
                }`}
              >
                {isProfitable ? (
                  <TrendingUp className="w-4 h-4 shrink-0" />
                ) : (
                  <TrendingDown className="w-4 h-4 shrink-0" />
                )}
                <span>
                  {sessionProfit >= 0 ? "+" : ""}
                  {activeSym}
                  {sessionProfit.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#b1bad3]/70 uppercase tracking-wider block">
                Session Status
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                  isProfitable
                    ? "bg-[#00e701]/15 text-[#00e701] border border-[#00e701]/30"
                    : "bg-[#e9113c]/15 text-[#e9113c] border border-[#e9113c]/30"
                }`}
              >
                {isProfitable ? "IN PROFIT" : "IN LOSS"}
              </span>
            </div>
          </div>

          {/* 2. Total Wagered */}
          <div className="bg-[#0f212e] border border-[#213743] rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#b1bad3] uppercase tracking-wider">
                Total Wagered
              </span>
              <div className="text-base font-black font-mono text-white mt-0.5">
                {activeSym}
                {sessionWagered.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#b1bad3]/70 uppercase tracking-wider block">
                Total Bets
              </span>
              <span className="font-mono text-sm font-bold text-white">{totalBets}</span>
            </div>
          </div>

          {/* 3. Wins vs Losses Breakdown */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#0f212e] border border-[#213743] rounded-xl p-2.5">
              <span className="text-[10px] font-bold text-[#b1bad3] uppercase tracking-wider block mb-1">
                Wins
              </span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-black text-[#00e701]">{sessionWins}</span>
                <span className="text-[10px] font-bold bg-[#00e701]/20 text-[#00e701] px-1.5 py-0.5 rounded border border-[#00e701]/30">
                  {winRate.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="bg-[#0f212e] border border-[#213743] rounded-xl p-2.5">
              <span className="text-[10px] font-bold text-[#b1bad3] uppercase tracking-wider block mb-1">
                Losses
              </span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-black text-[#e9113c]">{sessionLosses}</span>
                <span className="text-[10px] font-bold bg-[#e9113c]/20 text-[#e9113c] px-1.5 py-0.5 rounded border border-[#e9113c]/30">
                  {(100 - winRate).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Mini Graph / Visual Win/Loss Ratio Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[11px] font-semibold text-[#b1bad3]">
              <span>Win Rate Ratio</span>
              <span className="font-mono font-bold text-white">{winRate.toFixed(1)}%</span>
            </div>
            <div className="w-full h-2.5 bg-[#213743] rounded-full overflow-hidden flex">
              <div
                style={{ width: `${totalBets === 0 ? 50 : winRate}%` }}
                className="bg-[#00e701] h-full transition-all duration-300"
              />
              <div
                style={{ width: `${totalBets === 0 ? 50 : 100 - winRate}%` }}
                className="bg-[#e9113c] h-full transition-all duration-300"
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#b1bad3]/60 font-mono">
              <span>{sessionWins} W</span>
              <span>{sessionLosses} L</span>
            </div>
          </div>
        </div>

        {/* Footer info & close */}
        <button
          type="button"
          onClick={handleClose}
          className="w-full py-2.5 rounded-xl bg-[#1475e1] hover:bg-[#1164c2] text-white font-bold text-xs transition-colors shadow-sm cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
}
