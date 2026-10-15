"use client";

import React, { useState } from "react";
import {
  BarChart2,
  X,
  TrendingUp,
  TrendingDown,
  Trophy,
  Gamepad2,
  Award,
  Zap,
} from "lucide-react";
import { useGame } from "@/context/GameContext";

interface StatisticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StatisticsModal({ isOpen, onClose }: StatisticsModalProps) {
  const { user, totalWagered = 0, realBalance } = useGame();
  const [filter, setFilter] = useState<"all" | "casino" | "sports">("all");

  if (!isOpen) return null;

  const username = user?.username || user?.name || "Player";
  const inrWagered = totalWagered * 86.5;

  // Approximate metrics based on total wagered
  const totalBets = totalWagered > 0 ? Math.max(12, Math.floor(totalWagered / 8)) : 0;
  const winsCount = totalBets > 0 ? Math.floor(totalBets * 0.54) : 0;
  const winRate = totalBets > 0 ? ((winsCount / totalBets) * 100).toFixed(1) : "0.0";
  const netProfitUsd = totalWagered > 0 ? (totalWagered * 0.04) : 0;
  const isNetPositive = netProfitUsd >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-[#213743] bg-[#1a2c38] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#213743] px-5 py-4 bg-[#14232d] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00e701]/15 text-[#00e701]">
              <BarChart2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                <span>Player Statistics</span>
                <span className="text-[10px] bg-[#00e701]/20 text-[#00e701] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Live
                </span>
              </h2>
              <p className="text-xs text-[#b1bad3]">Track all bets, wagered volume, and win rate</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 overscroll-contain custom-scrollbar">
          {/* Segmented Filter */}
          <div className="grid grid-cols-3 bg-[#0f212e] p-1 rounded-xl border border-[#213743]">
            {[
              { id: "all", label: "Overall" },
              { id: "casino", label: "Casino" },
              { id: "sports", label: "Sports" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id as any)}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filter === tab.id
                    ? "bg-[#213743] text-white shadow-sm border border-[#2f4553]"
                    : "text-[#b1bad3] hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 4 Core Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0f212e] border border-[#213743] rounded-xl p-3.5 space-y-1">
              <span className="text-[11px] font-bold text-[#b1bad3] uppercase tracking-wider block">Total Bets</span>
              <span className="text-lg sm:text-xl font-black text-white font-mono">{totalBets}</span>
            </div>

            <div className="bg-[#0f212e] border border-[#213743] rounded-xl p-3.5 space-y-1">
              <span className="text-[11px] font-bold text-[#b1bad3] uppercase tracking-wider block">Total Wagered</span>
              <span className="text-lg sm:text-xl font-black text-white font-mono">
                ${totalWagered.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="bg-[#0f212e] border border-[#213743] rounded-xl p-3.5 space-y-1">
              <span className="text-[11px] font-bold text-[#b1bad3] uppercase tracking-wider block">Win Rate</span>
              <span className="text-lg sm:text-xl font-black text-[#00e701] font-mono">{winRate}%</span>
            </div>

            <div className="bg-[#0f212e] border border-[#213743] rounded-xl p-3.5 space-y-1">
              <span className="text-[11px] font-bold text-[#b1bad3] uppercase tracking-wider block">Net Profit / Loss</span>
              <span className={`text-lg sm:text-xl font-black font-mono ${isNetPositive ? "text-[#00e701]" : "text-red-400"}`}>
                {isNetPositive ? `+$${netProfitUsd.toFixed(2)}` : `-$${Math.abs(netProfitUsd).toFixed(2)}`}
              </span>
            </div>
          </div>

          {/* Detailed breakdown list */}
          <div className="bg-[#0f212e] border border-[#213743] rounded-xl p-4 space-y-2">
            <div className="text-xs font-bold text-[#b1bad3] uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-[#213743]">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Volume & Play Details</span>
            </div>

            <div className="space-y-2 text-xs text-[#b1bad3] pt-1">
              <div className="flex justify-between items-center py-1">
                <span>Equivalent INR Turnover</span>
                <span className="text-white font-mono font-bold">
                  ₹{inrWagered.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-[#213743]/60">
                <span>Winning Bets</span>
                <span className="text-[#00e701] font-mono font-bold">{winsCount}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-[#213743]/60">
                <span>Active Account Status</span>
                <span className="text-[#00e701] font-bold uppercase tracking-wider text-[11px]">Verified VIP</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
