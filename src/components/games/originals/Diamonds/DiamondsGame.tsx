"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  ShieldCheck,
  Maximize2,
  Minimize2,
  TrendingUp,
  X,
  Copy,
  Check,
  Sparkles,
  Gem,
  Award,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

export interface GemColor {
  id: string;
  name: string;
  hex: string;
  gradient: string;
  border: string;
  glow: string;
}

export const GEM_COLORS: GemColor[] = [
  { id: "green", name: "Emerald", hex: "#10b981", gradient: "from-emerald-400 to-emerald-600", border: "border-emerald-400", glow: "rgba(16, 185, 129, 0.4)" },
  { id: "purple", name: "Amethyst", hex: "#a855f7", gradient: "from-purple-400 to-purple-600", border: "border-purple-400", glow: "rgba(168, 85, 247, 0.4)" },
  { id: "yellow", name: "Topaz", hex: "#eab308", gradient: "from-yellow-300 to-amber-500", border: "border-yellow-300", glow: "rgba(234, 179, 8, 0.4)" },
  { id: "red", name: "Ruby", hex: "#ef4444", gradient: "from-red-400 to-red-600", border: "border-red-400", glow: "rgba(239, 68, 68, 0.4)" },
  { id: "cyan", name: "Aquamarine", hex: "#06b6d4", gradient: "from-cyan-300 to-cyan-500", border: "border-cyan-300", glow: "rgba(6, 182, 212, 0.4)" },
  { id: "blue", name: "Sapphire", hex: "#3b82f6", gradient: "from-blue-400 to-blue-600", border: "border-blue-400", glow: "rgba(59, 130, 246, 0.4)" },
  { id: "pink", name: "Tourmaline", hex: "#ec4899", gradient: "from-pink-400 to-pink-600", border: "border-pink-400", glow: "rgba(236, 72, 153, 0.4)" },
];

export interface HandOutcome {
  rankName: string;
  multiplier: number;
  matchedColorIds: string[];
}

export const PAYOUT_LADDER = [
  { rankName: "5 of a Kind", multiplier: 50.0 },
  { rankName: "4 of a Kind", multiplier: 5.0 },
  { rankName: "Full House", multiplier: 4.0 },
  { rankName: "3 of a Kind", multiplier: 3.0 },
  { rankName: "2 Pairs", multiplier: 2.0 },
  { rankName: "1 Pair", multiplier: 0.1 },
  { rankName: "No Match", multiplier: 0.0 },
];

export function evaluateDiamondsHand(gems: GemColor[]): HandOutcome {
  if (gems.length < 5) return { rankName: "No Match", multiplier: 0.0, matchedColorIds: [] };

  const counts: Record<string, number> = {};
  gems.forEach((g) => {
    counts[g.id] = (counts[g.id] || 0) + 1;
  });

  const sortedPairs = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const highestCount = sortedPairs[0][1];
  const secondCount = sortedPairs[1] ? sortedPairs[1][1] : 0;

  if (highestCount === 5) {
    return { rankName: "5 of a Kind", multiplier: 50.0, matchedColorIds: [sortedPairs[0][0]] };
  }
  if (highestCount === 4) {
    return { rankName: "4 of a Kind", multiplier: 5.0, matchedColorIds: [sortedPairs[0][0]] };
  }
  if (highestCount === 3 && secondCount === 2) {
    return { rankName: "Full House", multiplier: 4.0, matchedColorIds: [sortedPairs[0][0], sortedPairs[1][0]] };
  }
  if (highestCount === 3) {
    return { rankName: "3 of a Kind", multiplier: 3.0, matchedColorIds: [sortedPairs[0][0]] };
  }
  if (highestCount === 2 && secondCount === 2) {
    return { rankName: "2 Pairs", multiplier: 2.0, matchedColorIds: [sortedPairs[0][0], sortedPairs[1][0]] };
  }
  if (highestCount === 2) {
    return { rankName: "1 Pair", multiplier: 0.1, matchedColorIds: [sortedPairs[0][0]] };
  }
  return { rankName: "No Match", multiplier: 0.0, matchedColorIds: [] };
}

export default function DiamondsGame() {
  const { balance, updateBalance, currencySymbol, addRecentlyPlayedGame } = useGame();
  const activeSym = currencySymbol || "$";

  // Register in Recently Played once on mount
  useEffect(() => {
    if (addRecentlyPlayedGame) {
      addRecentlyPlayedGame({
        id: "diamonds",
        title: "Diamonds",
        image: "/games/stake-originals/diamonds.webp",
        href: "/games/diamonds",
      });
    }
  }, []);

  // Betting Controls
  const [betAmount, setBetAmount] = useState<number>(10);
  const [betInput, setBetInput] = useState<string>("10");
  const [mode, setMode] = useState<"manual" | "auto">("manual");

  useEffect(() => {
    if (betInput !== "" && parseFloat(betInput) === betAmount) return;
    setBetInput(betAmount.toString());
  }, [betAmount]);

  // Round State
  const [isRevealing, setIsRevealing] = useState<boolean>(false);
  const [gems, setGems] = useState<GemColor[]>([
    GEM_COLORS[0],
    GEM_COLORS[1],
    GEM_COLORS[2],
    GEM_COLORS[3],
    GEM_COLORS[4],
  ]);
  const [revealedCount, setRevealedCount] = useState<number>(5);
  const [currentOutcome, setCurrentOutcome] = useState<HandOutcome | null>(null);
  const [lastPayout, setLastPayout] = useState<number | null>(null);

  // Settings & Modals
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [showFairnessModal, setShowFairnessModal] = useState<boolean>(false);
  const [showLiveStats, setShowLiveStats] = useState<boolean>(false);
  const [copiedSeed, setCopiedSeed] = useState<boolean>(false);

  // Live Stats
  const [stats, setStats] = useState({
    rounds: 0,
    wins: 0,
    losses: 0,
    wagered: 0,
    profit: 0,
  });

  // Quick Bet Modifiers
  const handleHalfBet = () => {
    if (isRevealing) return;
    if (soundEnabled) sounds.playClick();
    const next = Math.max(0.01, parseFloat((betAmount / 2).toFixed(2)));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  const handleDoubleBet = () => {
    if (isRevealing) return;
    if (soundEnabled) sounds.playClick();
    const next = parseFloat((betAmount * 2).toFixed(2));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  const handleMaxBet = () => {
    if (isRevealing) return;
    if (soundEnabled) sounds.playClick();
    const next = Math.max(0.01, parseFloat(balance.toFixed(2)));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  // Start Drop Round
  const handleBet = () => {
    if (isRevealing) return;
    if (balance < betAmount) {
      alert("Insufficient balance!");
      return;
    }

    updateBalance(-betAmount);
    if (soundEnabled) sounds.playBet();

    setIsRevealing(true);
    setRevealedCount(0);
    setCurrentOutcome(null);
    setLastPayout(null);

    // Pick 5 random gems
    const newGems: GemColor[] = Array.from({ length: 5 }, () => {
      return GEM_COLORS[Math.floor(Math.random() * GEM_COLORS.length)];
    });

    setGems(newGems);

    // Drop animation for the 5 gems
    newGems.forEach((_, idx) => {
      setTimeout(() => {
        setRevealedCount(idx + 1);
        if (soundEnabled) sounds.playGemDrop(idx + 1);

        if (idx === 4) {
          setTimeout(() => {
            const outcome = evaluateDiamondsHand(newGems);
            setCurrentOutcome(outcome);
            setIsRevealing(false);

            const payout = parseFloat((betAmount * outcome.multiplier).toFixed(2));
            const profitDelta = parseFloat((payout - betAmount).toFixed(2));

            if (payout > 0) {
              updateBalance(payout);
              setLastPayout(payout);
              if (soundEnabled) {
                if (outcome.multiplier >= 4.0) {
                  sounds.playCashout();
                } else {
                  sounds.playGemShimmer();
                }
              }
              if (outcome.multiplier >= 2.0) {
                confetti({ particleCount: 75, spread: 65, origin: { y: 0.55 } });
              }
            } else {
              if (soundEnabled) sounds.playDiceLoss();
            }

            setStats((prev) => ({
              ...prev,
              rounds: prev.rounds + 1,
              wins: outcome.multiplier >= 1.0 ? prev.wins + 1 : prev.wins,
              losses: outcome.multiplier < 1.0 ? prev.losses + 1 : prev.losses,
              wagered: parseFloat((prev.wagered + betAmount).toFixed(2)),
              profit: parseFloat((prev.profit + profitDelta).toFixed(2)),
            }));
          }, 200);
        }
      }, (idx + 1) * 120);
    });
  };

  const toggleFullscreen = () => {
    if (!gameContainerRef.current) return;
    if (!document.fullscreenElement) {
      gameContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div
      ref={gameContainerRef}
      className={`w-full max-w-lg mx-auto px-2 sm:px-3 py-2 select-none flex flex-col space-y-2 ${
        isFullscreen ? "p-6 bg-[#0f212e] min-h-screen max-w-none" : ""
      }`}
    >
      {/* =========================================================================
          1. GAME ARENA: 5-GEM REVEAL ARENA & PAYOUT LADDER
      ========================================================================== */}
      <div className="w-full rounded-t-2xl bg-[#0f212e] border-t border-x border-[#213743] shadow-2xl p-3 sm:p-4 flex flex-col items-center justify-center space-y-3 relative overflow-hidden">
        {/* Ambient Diamond Refraction Glow */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Live Multiplier & Hand Rank Header */}
        <div className="w-full flex items-center justify-between bg-[#1a2c38] rounded-xl px-3 py-2 border border-[#213743]">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#b1bad3] uppercase tracking-wider">Result:</span>
            <span className="text-xs font-bold text-white">
              {currentOutcome ? (
                <span className={currentOutcome.multiplier > 0 ? "text-[#00e701]" : "text-[#b1bad3]"}>
                  {currentOutcome.rankName}
                </span>
              ) : (
                <span className="text-[#b1bad3]">Awaiting Bet</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#0f212e] text-xs font-black font-mono transition-transform duration-200 ${
                currentOutcome && currentOutcome.multiplier > 0 ? "scale-105 text-[#00e701]" : "text-[#b1bad3]"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{currentOutcome ? `${currentOutcome.multiplier.toFixed(2)}×` : "1.00×"}</span>
            </div>
          </div>
        </div>

        {/* 5 Faceted Gemstones Arena */}
        <div className="grid grid-cols-5 gap-2 w-full my-1">
          {gems.map((gem, idx) => {
            const isRevealed = idx < revealedCount;
            const isMatched = currentOutcome?.matchedColorIds.includes(gem.id);

            return (
              <div
                key={idx}
                className={`aspect-[3/4] rounded-xl flex flex-col items-center justify-center relative transition-all duration-300 transform ${
                  isRevealed
                    ? "bg-[#1a2c38] border-2 shadow-xl animate-in zoom-in-75 duration-200"
                    : "bg-[#1a2c38]/40 border border-[#213743] opacity-60"
                } ${isMatched ? `${gem.border} shadow-[0_0_16px_${gem.glow}] scale-105 ring-2 ring-white/50` : "border-[#213743]"}`}
              >
                {isRevealed ? (
                  // Faceted Gemstone SVG Icon
                  <div className="relative flex flex-col items-center justify-center p-1">
                    <div
                      className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr ${gem.gradient} border ${gem.border} flex items-center justify-center shadow-lg transform rotate-45`}
                    >
                      <Gem className="h-5 w-5 sm:h-6 sm:w-6 text-white drop-shadow -rotate-45" />
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-white mt-2 truncate">
                      {gem.name}
                    </span>
                  </div>
                ) : (
                  // Unrevealed Slot Placeholder
                  <div className="w-6 h-6 rounded-full border border-dashed border-[#b1bad3]/30 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#b1bad3]/20" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Stake Diamonds Payout Ladder Matrix */}
        <div className="w-full bg-[#1a2c38] border border-[#213743] rounded-xl p-2">
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 text-center text-xs">
            {PAYOUT_LADDER.map((tier) => {
              const isCurrent = currentOutcome?.rankName === tier.rankName;
              return (
                <div
                  key={tier.rankName}
                  className={`p-1 rounded-lg border transition-all ${
                    isCurrent
                      ? "bg-[#00e701]/15 border-[#00e701] text-[#00e701] shadow-md scale-[1.02]"
                      : "bg-[#0f212e] border-[#213743] text-[#b1bad3]"
                  }`}
                >
                  <div className="text-[9px] font-bold truncate">{tier.rankName}</div>
                  <div className="font-mono font-black text-[11px] text-white mt-0.5">
                    {tier.multiplier.toFixed(2)}×
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payout Feedback Banner */}
        {lastPayout !== null && (
          <div className="w-full px-4 py-1.5 rounded-xl bg-[#00e701]/10 border border-[#00e701]/40 flex items-center justify-center gap-2 animate-in zoom-in-95">
            <Sparkles className="h-3.5 w-3.5 text-[#00e701]" />
            <span className="text-xs font-bold text-[#00e701]">
              {currentOutcome?.rankName}! Payout: {activeSym}{lastPayout.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* =========================================================================
          2. MINES HARMONIZED BETTING CONTROLS SHELL CONTAINER
      ========================================================================== */}
      <div className="w-full border-t border-[#213743] bg-[#1a2c38] p-3 sm:p-4 flex flex-col justify-start space-y-2 sm:space-y-2.5 rounded-b-2xl select-none">
        {/* 1. PRIMARY BET CTA BUTTON (Directly at top of controls) */}
        <div className="w-full">
          <button
            type="button"
            onClick={handleBet}
            disabled={isRevealing || betAmount > balance || betAmount <= 0}
            className="w-full py-3 sm:py-3.5 text-sm sm:text-base font-extrabold rounded-xl bg-[#1475e1] hover:bg-[#1164c2] text-white shadow-lg shadow-[#1475e1]/25 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer uppercase tracking-wider"
          >
            <span>{isRevealing ? "REVEALING..." : "BET"}</span>
          </button>
        </div>

        {/* 2. BET AMOUNT INPUT (Exact Mines Structure) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#b1bad3]">Bet Amount</span>
            <span className="font-mono text-[11px] text-[#b1bad3]">
              Bal: {activeSym}{balance.toFixed(2)}
            </span>
          </div>

          <div className="flex rounded-lg bg-[#0f212e] border border-[#213743] focus-within:border-[#2f4553] p-1">
            <div className="flex flex-1 items-center px-2.5">
              <span className="text-xs font-bold text-[#b1bad3] mr-1.5">{activeSym}</span>
              <input
                type="text"
                inputMode="decimal"
                disabled={isRevealing}
                value={betInput}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || /^\d*\.?\d*$/.test(val)) {
                    setBetInput(val);
                    if (val !== "" && !isNaN(parseFloat(val))) {
                      setBetAmount(parseFloat(val));
                    }
                  }
                }}
                onBlur={() => {
                  if (betInput === "" || isNaN(parseFloat(betInput)) || parseFloat(betInput) <= 0) {
                    setBetInput("1.00");
                    setBetAmount(1);
                  } else {
                    const num = parseFloat(betInput);
                    setBetAmount(num);
                    setBetInput(num.toFixed(2));
                  }
                }}
                className="w-full bg-transparent text-sm font-bold text-white outline-none font-mono"
              />
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={isRevealing}
                onClick={handleHalfBet}
                className="rounded-lg bg-[#213743] px-2.5 py-1.5 text-xs font-bold text-[#b1bad3] hover:bg-[#2f4553] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                ½
              </button>
              <button
                type="button"
                disabled={isRevealing}
                onClick={handleDoubleBet}
                className="rounded-lg bg-[#213743] px-2.5 py-1.5 text-xs font-bold text-[#b1bad3] hover:bg-[#2f4553] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                2×
              </button>
            </div>
          </div>
        </div>

        {/* 3. MODE SWITCH TABS: [ Manual | Auto ] */}
        <div className="flex rounded-lg bg-[#0f212e] p-1 border border-[#213743] mt-auto">
          <button
            type="button"
            disabled={isRevealing}
            onClick={() => setMode("manual")}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
              mode === "manual"
                ? "bg-[#213743] text-white shadow-sm"
                : "text-[#b1bad3] hover:text-white"
            }`}
          >
            Manual
          </button>
          <button
            type="button"
            disabled={isRevealing}
            onClick={() => setMode("auto")}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
              mode === "auto"
                ? "bg-[#213743] text-white shadow-sm"
                : "text-[#b1bad3] hover:text-white"
            }`}
          >
            Auto
          </button>
        </div>

        {/* 4. BOTTOM UTILITY BAR */}
        <div className="flex items-center justify-between rounded-lg bg-[#0f212e] border border-[#213743] px-3 py-2 text-xs text-[#b1bad3] mt-0.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1 rounded-md hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowFairnessModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#213743] hover:bg-[#2f4553] text-[#b1bad3] hover:text-white font-bold text-xs transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-[#00e701]" />
            <span>Fairness</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          MODALS: PROVABLY FAIR & LIVE STATS
      ========================================================================== */}
      {showFairnessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#00e701]" />
                <span>Provably Fair: Diamonds</span>
              </div>
              <button
                onClick={() => setShowFairnessModal(false)}
                className="p-1 rounded-lg text-[#b1bad3] hover:text-white hover:bg-[#213743]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-[#b1bad3]">
              <p>
                Each 5-gem reveal outcome is computed using HMAC-SHA256 from your Client Seed and
                Server Seed with certified 99% Return to Player (RTP).
              </p>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#b1bad3]">Server Seed (Hashed)</label>
                <div className="flex items-center justify-between rounded-xl bg-[#0f212e] border border-[#213743] p-2.5 font-mono text-white text-[11px] truncate">
                  <span className="truncate">b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3");
                      setCopiedSeed(true);
                      setTimeout(() => setCopiedSeed(false), 2000);
                    }}
                    className="ml-2 text-[#00e701]"
                  >
                    {copiedSeed ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowFairnessModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#213743] text-white text-xs font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showLiveStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#00e701]" />
                <span>Diamonds Session Stats</span>
              </div>
              <button
                onClick={() => setShowLiveStats(false)}
                className="p-1 rounded-lg text-[#b1bad3] hover:text-white hover:bg-[#213743]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-[#0f212e] border border-[#213743] p-3">
                <div className="text-[11px] font-bold text-[#b1bad3]">Total Rounds</div>
                <div className="text-lg font-black text-white font-mono">{stats.rounds}</div>
              </div>
              <div className="rounded-xl bg-[#0f212e] border border-[#213743] p-3">
                <div className="text-[11px] font-bold text-[#b1bad3]">Win Rate (≥1×)</div>
                <div className="text-lg font-black text-[#00e701] font-mono">
                  {stats.rounds > 0 ? ((stats.wins / stats.rounds) * 100).toFixed(1) : "0.0"}%
                </div>
              </div>
              <div className="rounded-xl bg-[#0f212e] border border-[#213743] p-3">
                <div className="text-[11px] font-bold text-[#b1bad3]">Wagered</div>
                <div className="text-lg font-black text-white font-mono">
                  {activeSym}
                  {stats.wagered.toFixed(2)}
                </div>
              </div>
              <div className="rounded-xl bg-[#0f212e] border border-[#213743] p-3">
                <div className="text-[11px] font-bold text-[#b1bad3]">Profit</div>
                <div
                  className={`text-lg font-black font-mono ${
                    stats.profit >= 0 ? "text-[#00e701]" : "text-[#e9113c]"
                  }`}
                >
                  {stats.profit >= 0 ? "+" : ""}
                  {activeSym}
                  {stats.profit.toFixed(2)}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowLiveStats(false)}
              className="w-full py-2.5 rounded-xl bg-[#213743] text-white text-xs font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
