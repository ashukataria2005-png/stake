"use client";

import React, { useState, useEffect } from "react";
import { Flag, Trophy, Clock, ChevronRight, X, Sparkles, Award } from "lucide-react";

export default function RacesAndRafflesWidget() {
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(22 * 3600 + 21 * 60 + 45);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 24 * 3600));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;

  const topRacers = [
    { rank: 1, name: "WhaleKing", prize: "$25,000", wagered: "$1,420,890", medal: "🥇" },
    { rank: 2, name: "CryptoValkyrie", prize: "$12,500", wagered: "$980,450", medal: "🥈" },
    { rank: 3, name: "ApexRoll", prize: "$7,500", wagered: "$650,120", medal: "🥉" },
    { rank: 4, name: "NeonViper", prize: "$4,000", wagered: "$412,800", medal: "4th" },
    { rank: 5, name: "DiamondHands", prize: "$3,000", wagered: "$325,400", medal: "5th" },
    { rank: 6, name: "Satoshi_88", prize: "$2,000", wagered: "$240,100", medal: "6th" },
    { rank: 7, name: "GoldRush99", prize: "$1,500", wagered: "$195,300", medal: "7th" },
    { rank: 8, name: "LuckyCat", prize: "$1,000", wagered: "$162,000", medal: "8th" },
    { rank: 9, name: "ZeusMaster", prize: "$800", wagered: "$134,500", medal: "9th" },
    { rank: 10, name: "AlphaWolf", prize: "$600", wagered: "$118,200", medal: "10th" },
  ];

  return (
    <>
      <section className="my-6">
        <div className="rounded-2xl border border-[#213743] bg-gradient-to-br from-[#1a2c38] via-[#14232d] to-[#0f212e] p-4 sm:p-5 shadow-lg relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -right-8 -top-8 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Row: Title, Prize Badge, Circular/Timer Countdown */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#213743] pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 shrink-0">
                <Flag className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-white">
                    $100,000 Daily Race
                  </h3>
                  <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-black text-amber-400">
                    DAILY
                  </span>
                </div>
                <p className="text-xs text-[#b1bad3]">
                  Every bet placed climbs the leaderboard. Top 5,000 share $100,000!
                </p>
              </div>
            </div>

            {/* Circular Countdown & Timer Status */}
            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              <div className="flex items-center gap-1.5 rounded-lg bg-[#0f212e] border border-[#213743] px-3 py-1.5 text-xs font-mono font-bold text-white shadow-inner">
                <Clock className="h-3.5 w-3.5 text-amber-400 animate-spin" style={{ animationDuration: "8s" }} />
                <span>Ends in {hours}h {minutes}m {seconds < 10 ? `0${seconds}` : seconds}s</span>
              </div>

              {/* Status Pill */}
              <span className="rounded-lg bg-[#213743] border border-[#2f4553] px-2.5 py-1 text-[11px] font-semibold text-[#b1bad3]">
                Not entered yet
              </span>
            </div>
          </div>

          {/* Bottom Row: Top Podium & Leaderboard Button */}
          <div className="mt-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Top 3 Racer preview */}
            <div className="flex items-center gap-4 text-xs w-full sm:w-auto overflow-x-auto no-scrollbar py-1">
              {topRacers.slice(0, 3).map((racer) => (
                <div key={racer.rank} className="flex items-center gap-2 rounded-xl bg-[#0f212e] border border-[#213743] px-3 py-1.5 shrink-0">
                  <span className="text-sm">{racer.medal}</span>
                  <div>
                    <div className="font-bold text-white text-xs">{racer.name}</div>
                    <div className="text-[10px] text-[#00e701] font-mono font-semibold">{racer.prize}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Leaderboard Button */}
            <button
              onClick={() => setIsLeaderboardOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-[#213743] hover:bg-[#2a4555] border border-[#2f4553] px-4 py-2 text-xs font-bold text-white transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Trophy className="h-3.5 w-3.5 text-amber-400" />
              <span>Leaderboard</span>
              <ChevronRight className="h-3.5 w-3.5 text-[#b1bad3]" />
            </button>
          </div>
        </div>
      </section>

      {/* Leaderboard Modal */}
      {isLeaderboardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-[#213743] bg-[#1a2c38] p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#213743] pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                  <Trophy className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">$100,000 Daily Race Leaderboard</h3>
                  <p className="text-xs text-[#b1bad3]">Ends in {hours}h {minutes}m {seconds}s</p>
                </div>
              </div>
              <button
                onClick={() => setIsLeaderboardOpen(false)}
                className="rounded-lg p-1 text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Leaderboard Table List */}
            <div className="overflow-y-auto space-y-2 pr-1 flex-1">
              {topRacers.map((racer) => (
                <div
                  key={racer.rank}
                  className={`flex items-center justify-between rounded-xl border p-2.5 text-xs transition-colors ${
                    racer.rank <= 3
                      ? "bg-[#0f212e] border-[#2f4553]"
                      : "bg-[#14232d] border-[#213743]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-bold text-amber-400">
                      {racer.medal}
                    </span>
                    <div>
                      <div className="font-bold text-white">{racer.name}</div>
                      <div className="text-[10px] text-[#b1bad3] font-mono">Wagered: {racer.wagered}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-[#00e701]">{racer.prize}</span>
                    <div className="text-[10px] text-[#b1bad3]">Prize</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsLeaderboardOpen(false)}
              className="w-full shrink-0 rounded-xl bg-[#1475e1] hover:bg-[#1268c7] py-2.5 text-xs font-bold text-white transition-all cursor-pointer"
            >
              Close Leaderboard
            </button>
          </div>
        </div>
      )}
    </>
  );
}
