"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Zap, Trophy, Play, Star, Sparkles } from "lucide-react";
import { TRENDING_SPORTS, SportItem } from "@/data/trendingSports";
import SportArtwork from "@/components/sports/SportArtwork";
import { sounds } from "@/utils/audio";
import { useGame } from "@/context/GameContext";

interface MatchEvent {
  id: string;
  homeTeam: string;
  awayTeam: string;
  league: string;
  time: string;
  score?: string;
  isLive: boolean;
  odds: {
    home: number;
    draw?: number;
    away: number;
  };
}

export default function SportCategoryPage() {
  const params = useParams();
  const categorySlug = (params?.category as string) || "soccer";
  const { balance, updateBalance, currency } = useGame();

  const [selectedBet, setSelectedBet] = useState<{ matchId: string; pick: string; odd: number } | null>(null);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [betSuccessMsg, setBetSuccessMsg] = useState<string | null>(null);

  const sport: SportItem =
    TRENDING_SPORTS.find((s) => s.id === categorySlug || s.slug === categorySlug) ||
    TRENDING_SPORTS[0];

  // Mock authentic matches for this sport
  const sampleMatches: MatchEvent[] = [
    {
      id: "m-1",
      homeTeam: `${sport.name} Premier XI`,
      awayTeam: `Global ${sport.name} United`,
      league: `Championship League • Round 16`,
      time: "48'",
      score: "1 - 0",
      isLive: true,
      odds: { home: 1.85, draw: 3.40, away: 4.20 },
    },
    {
      id: "m-2",
      homeTeam: "Apex Titans",
      awayTeam: "Shadow Vanguard",
      league: `World Series Cup 2026`,
      time: "72'",
      score: "2 - 2",
      isLive: true,
      odds: { home: 2.10, draw: 3.10, away: 3.25 },
    },
    {
      id: "m-3",
      homeTeam: "Storm Royals",
      awayTeam: "Northern Knights",
      league: `Continental Invitational`,
      time: "Today, 19:30",
      isLive: false,
      odds: { home: 1.55, draw: 4.00, away: 5.50 },
    },
    {
      id: "m-4",
      homeTeam: "Red Dragons",
      awayTeam: "Iron Legion",
      league: `Grand Masters Series`,
      time: "Tomorrow, 21:00",
      isLive: false,
      odds: { home: 2.40, draw: 3.30, away: 2.70 },
    },
  ];

  const handlePlaceBet = () => {
    if (!selectedBet) return;
    if (betAmount > balance) {
      alert("Insufficient balance!");
      return;
    }
    updateBalance(-betAmount);
    sounds.playDiceWin();
    setBetSuccessMsg(`Bet Placed: $${betAmount} on ${selectedBet.pick} @ ${selectedBet.odd.toFixed(2)}x`);
    setTimeout(() => setBetSuccessMsg(null), 3500);
  };

  return (
    <div className="space-y-6 pb-12 pt-2">
      {/* Back button */}
      <div className="flex items-center gap-3">
        <Link
          href="/sports"
          className="inline-flex items-center gap-2 rounded-xl bg-[#1a2c38] border border-[#213743] px-3.5 py-2 text-xs font-bold text-[#b1bad3] hover:text-white hover:bg-[#213743] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Sports</span>
        </Link>
      </div>

      {/* Sport Banner Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#071829] via-[#0d2a4a] to-[#0f212e] border border-[#213743] p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-[#00e701]">
            <span className="w-2 h-2 rounded-full bg-[#00e701] animate-pulse" />
            <span>{sport.liveMatches} Live Matches Available</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <span>{sport.emoji}</span>
            <span>{sport.name}</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#b1bad3]">
            Live odds, moneyline bets, handicap lines, and over/under totals for {sport.name}.
          </p>
        </div>

        <div className="w-24 sm:w-28 aspect-[3/4] shrink-0 rounded-xl overflow-hidden border border-[#213743] shadow-lg">
          <SportArtwork sportId={sport.id} />
        </div>
      </div>

      {betSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-[#00e701]/15 border border-[#00e701]/40 text-[#00e701] text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Sparkles className="h-4 w-4 shrink-0" />
          <span>{betSuccessMsg}</span>
        </div>
      )}

      {/* Match Listings */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-[#b1bad3]">
          Featured {sport.name} Matches
        </div>

        <div className="space-y-2.5">
          {sampleMatches.map((m) => (
            <div
              key={m.id}
              className="rounded-2xl border border-[#213743] bg-[#1a2c38] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#2f4553] transition-colors"
            >
              {/* Teams & Status */}
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 text-[11px] font-bold text-[#b1bad3]">
                  <span>{m.league}</span>
                  {m.isLive ? (
                    <span className="rounded bg-[#00e701]/10 text-[#00e701] px-1.5 py-0.5 text-[9px] font-black border border-[#00e701]/30">
                      LIVE {m.time}
                    </span>
                  ) : (
                    <span className="text-[#b1bad3]">{m.time}</span>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-start gap-4">
                  <span className="font-extrabold text-sm text-white">{m.homeTeam}</span>
                  {m.isLive && (
                    <span className="font-mono text-sm font-black text-[#00e701] bg-[#0f212e] px-2 py-0.5 rounded-lg border border-[#213743]">
                      {m.score}
                    </span>
                  )}
                  <span className="font-extrabold text-sm text-white">{m.awayTeam}</span>
                </div>
              </div>

              {/* Odds Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setSelectedBet({ matchId: m.id, pick: m.homeTeam, odd: m.odds.home })}
                  className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    selectedBet?.matchId === m.id && selectedBet.pick === m.homeTeam
                      ? "bg-[#00e701] text-[#0f212e] border-[#00e701] font-black shadow-md shadow-[#00e701]/20"
                      : "bg-[#0f212e] text-[#b1bad3] hover:text-white border-[#213743] hover:bg-[#213743]"
                  }`}
                >
                  <div className="text-[10px] opacity-70">1</div>
                  <div className="font-mono font-black">{m.odds.home.toFixed(2)}</div>
                </button>

                {m.odds.draw && (
                  <button
                    onClick={() => setSelectedBet({ matchId: m.id, pick: "Draw", odd: m.odds.draw! })}
                    className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      selectedBet?.matchId === m.id && selectedBet.pick === "Draw"
                        ? "bg-[#00e701] text-[#0f212e] border-[#00e701] font-black shadow-md shadow-[#00e701]/20"
                        : "bg-[#0f212e] text-[#b1bad3] hover:text-white border-[#213743] hover:bg-[#213743]"
                    }`}
                  >
                    <div className="text-[10px] opacity-70">X</div>
                    <div className="font-mono font-black">{m.odds.draw.toFixed(2)}</div>
                  </button>
                )}

                <button
                  onClick={() => setSelectedBet({ matchId: m.id, pick: m.awayTeam, odd: m.odds.away })}
                  className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    selectedBet?.matchId === m.id && selectedBet.pick === m.awayTeam
                      ? "bg-[#00e701] text-[#0f212e] border-[#00e701] font-black shadow-md shadow-[#00e701]/20"
                      : "bg-[#0f212e] text-[#b1bad3] hover:text-white border-[#213743] hover:bg-[#213743]"
                  }`}
                >
                  <div className="text-[10px] opacity-70">2</div>
                  <div className="font-mono font-black">{m.odds.away.toFixed(2)}</div>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Bet Slip (if a selection is active) */}
      {selectedBet && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 w-[90vw] sm:w-80 rounded-2xl border border-[#213743] bg-[#1a2c38] shadow-2xl p-4 space-y-3 animate-in slide-in-from-bottom-6">
          <div className="flex items-center justify-between border-b border-[#213743] pb-2">
            <span className="text-xs font-black uppercase tracking-wider text-white">Active Bet Slip</span>
            <button
              onClick={() => setSelectedBet(null)}
              className="text-xs text-[#b1bad3] hover:text-white"
            >
              Clear
            </button>
          </div>

          <div className="text-xs text-[#b1bad3]">
            Pick: <span className="font-bold text-white">{selectedBet.pick}</span> @ <span className="font-mono text-[#00e701] font-black">{selectedBet.odd.toFixed(2)}x</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-xl border border-[#213743] bg-[#0f212e] px-2.5 py-1.5 flex-1">
              <span className="text-xs text-[#00e701] mr-1">$</span>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(1, parseFloat(e.target.value) || 0))}
                className="w-full bg-transparent text-xs font-bold text-white focus:outline-none font-mono"
              />
            </div>
            <button
              onClick={handlePlaceBet}
              className="rounded-xl bg-[#00e701] hover:bg-[#00c701] px-4 py-2 text-xs font-black text-[#0f212e] active:scale-95 transition-all shadow-md"
            >
              Place Bet (${(betAmount * selectedBet.odd).toFixed(2)})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
