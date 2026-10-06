"use client";

import React, { useState } from "react";
import { Trophy, Info, ChevronRight, X, Shield, Award, Sparkles, Gift } from "lucide-react";
import { useGame } from "@/context/GameContext";

export default function VIPProgressCard() {
  const { user } = useGame();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // VIP Progress state
  const username = user?.name ? `${user.name}08` : "AshuKataria08";
  const progressPercent = "0.00%";

  return (
    <>
      <section className="space-y-2.5 my-4">
        {/* Section Header: Trophy icon + "VIP Progress >" */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 group cursor-pointer text-left focus:outline-none"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
              <Trophy className="h-4 w-4" />
            </div>
            <h2 className="text-base sm:text-lg font-black text-white group-hover:text-amber-400 transition-colors flex items-center gap-1">
              <span>VIP Progress</span>
              <ChevronRight className="h-4 w-4 text-[#b1bad3] group-hover:translate-x-0.5 transition-transform" />
            </h2>
          </button>
        </div>

        {/* Card Container */}
        <div
          onClick={() => setIsModalOpen(true)}
          className="bg-[#1a2c38] border border-[#213743] hover:border-[#2f4553] rounded-xl p-4 transition-all duration-200 cursor-pointer shadow-sm group"
        >
          {/* Row 1: Username on left, progress percentage on right */}
          <div className="flex items-center justify-between text-xs sm:text-sm mb-2.5">
            <div className="flex items-center gap-1 font-bold text-white group-hover:text-amber-400 transition-colors">
              <span>{username}</span>
              <ChevronRight className="h-3.5 w-3.5 text-[#b1bad3]" />
            </div>

            <div className="flex items-center gap-1.5 font-bold text-[#b1bad3]">
              <span className="font-mono text-white">{progressPercent}</span>
              <Info className="h-3.5 w-3.5 text-[#b1bad3] hover:text-white" />
            </div>
          </div>

          {/* Progress bar: dark tracking bar with subtle progress indicator */}
          <div className="w-full h-2 rounded-full bg-[#0f212e] border border-[#213743] overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-slate-500 to-slate-400 rounded-full transition-all duration-500"
              style={{ width: "2%" }}
            />
          </div>

          {/* Row 2: "Unranked" on bottom-left, "Bronze" on bottom-right */}
          <div className="flex items-center justify-between mt-2.5 text-[11px] font-semibold text-[#b1bad3]">
            <span className="text-[#b1bad3]">Unranked</span>
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <span>🥉</span>
              <span>Bronze</span>
            </span>
          </div>
        </div>
      </section>

      {/* VIP Level Info Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-[#213743] bg-[#1a2c38] p-5 shadow-2xl space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                  <Trophy className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Stake VIP Club</h3>
                  <p className="text-xs text-[#b1bad3]">Track your path to elite rewards</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Current Level Status */}
            <div className="rounded-xl border border-[#213743] bg-[#0f212e] p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#b1bad3]">Current Tier</span>
                <span className="font-bold text-white">Unranked (0.00%)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#b1bad3]">Next Target</span>
                <span className="font-bold text-amber-400">Bronze ($10,000 Wager)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#1a2c38] border border-[#213743] overflow-hidden mt-1">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: "2%" }} />
              </div>
            </div>

            {/* Bronze Perks Preview */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                Bronze Tier Unlocks
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 rounded-lg bg-[#0f212e] border border-[#213743] p-2.5 text-[#b1bad3]">
                  <Sparkles className="h-4 w-4 text-[#00e701] shrink-0" />
                  <span>Instant Rakeback</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-[#0f212e] border border-[#213743] p-2.5 text-[#b1bad3]">
                  <Gift className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>Weekly Boost</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-[#0f212e] border border-[#213743] p-2.5 text-[#b1bad3]">
                  <Award className="h-4 w-4 text-blue-400 shrink-0" />
                  <span>Monthly Bonus</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-[#0f212e] border border-[#213743] p-2.5 text-[#b1bad3]">
                  <Shield className="h-4 w-4 text-purple-400 shrink-0" />
                  <span>Level Up Bonus</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full rounded-xl bg-[#1475e1] hover:bg-[#1268c7] py-2.5 text-xs font-bold text-white transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
