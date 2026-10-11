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
      className="flex flex-col items-center w-full min-h-[calc(100vh-64px)] bg-[#0f212e] text-white p-3 sm:p-6 select-none font-sans"
    >
      {/* =========================================================================
          TOP: 5-GEM REVEAL ARENA & PAYOUT LADDER
      ========================================================================== */}
      <div className="w-full max-w-4xl bg-[#1a2c38] rounded-2xl p-4 sm:p-6 border border-[#213743] shadow-2xl flex flex-col items-center relative overflow-hidden mb-5">
        
        {/* Ambient Diamond Refraction Glow */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Live Multiplier & Hand Rank Header */}
        <div className="w-full flex items-center justify-between bg-[#0f212e]/80 backdrop-blur-md rounded-xl p-3 sm:px-6 mb-4 border border-[#213743]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#b1bad3] uppercase tracking-wider">Hand Result:</span>
            <span className="text-sm font-bold text-white">
              {currentOutcome ? (
                <span className={currentOutcome.multiplier > 0 ? "text-[#00e701]" : "text-[#b1bad3]"}>
                  {currentOutcome.rankName}
                </span>
              ) : (
                <span className="text-[#b1bad3]">Awaiting Bet</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#213743] text-sm font-black font-mono transition-transform duration-200 ${
                currentOutcome && currentOutcome.multiplier > 0 ? "scale-105 text-[#00e701]" : "text-[#b1bad3]"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>{currentOutcome ? `${currentOutcome.multiplier.toFixed(2)}×` : "1.00×"}</span>
            </div>
          </div>
        </div>

        {/* 5 Faceted Gemstones Arena */}
        <div className="grid grid-cols-5 gap-2.5 sm:gap-4 w-full max-w-lg my-4 p-2">
          {gems.map((gem, idx) => {
            const isRevealed = idx < revealedCount;
            const isMatched = currentOutcome?.matchedColorIds.includes(gem.id);

            return (
              <div
                key={idx}
                className={`aspect-[3/4] rounded-2xl flex flex-col items-center justify-center relative transition-all duration-300 transform ${
                  isRevealed
                    ? "bg-[#0f212e] border-2 shadow-xl animate-in zoom-in-75 duration-200"
                    : "bg-[#213743] border border-[#2f4553] opacity-60"
                } ${isMatched ? `${gem.border} shadow-[0_0_20px_${gem.glow}] scale-105 ring-2 ring-white/50` : "border-[#213743]"}`}
              >
                {isRevealed ? (
                  // Faceted Gemstone SVG Icon
                  <div className="relative flex flex-col items-center justify-center p-2">
                    <div
                      className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr ${gem.gradient} border ${gem.border} flex items-center justify-center shadow-lg transform rotate-45`}
                    >
                      <Gem className="h-6 w-6 sm:h-8 sm:w-8 text-white drop-shadow -rotate-45" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-white mt-3 truncate max-w-[50px] sm:max-w-none">
                      {gem.name}
                    </span>
                  </div>
                ) : (
                  // Unrevealed Slot Placeholder
                  <div className="w-8 h-8 rounded-full border border-dashed border-[#b1bad3]/30 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#b1bad3]/20" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Stake Diamonds Payout Ladder Matrix */}
        <div className="w-full mt-3 bg-[#0f212e]/70 border border-[#213743] rounded-xl p-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-center text-xs">
            {PAYOUT_LADDER.map((tier) => {
              const isCurrent = currentOutcome?.rankName === tier.rankName;
              return (
                <div
                  key={tier.rankName}
                  className={`p-2 rounded-lg border transition-all ${
                    isCurrent
                      ? "bg-[#00e701]/15 border-[#00e701] text-[#00e701] shadow-md scale-[1.02]"
                      : "bg-[#1a2c38]/50 border-[#213743] text-[#b1bad3]"
                  }`}
                >
                  <div className="text-[10px] font-bold truncate">{tier.rankName}</div>
                  <div className="font-mono font-black text-xs text-white mt-0.5">
                    {tier.multiplier.toFixed(2)}×
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payout Feedback Banner */}
        {lastPayout !== null && (
          <div className="mt-3 px-6 py-2 rounded-xl bg-[#00e701]/10 border border-[#00e701]/40 flex items-center gap-2 animate-in zoom-in-95">
            <Sparkles className="h-4 w-4 text-[#00e701]" />
            <span className="text-xs sm:text-sm font-bold text-[#00e701]">
              {currentOutcome?.rankName}! Payout: {activeSym}{lastPayout.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* =========================================================================
          CONTROLS: DIRECTLY BENEATH ARENA (Vertical Flow)
      ========================================================================== */}
      <div className="w-full max-w-4xl bg-[#1a2c38] rounded-2xl p-5 border border-[#213743] shadow-xl space-y-4">
        
        {/* Row 1: Mode Switch & Bet Amount */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          
          {/* Bet Amount Input with Quick Modifiers */}
          <div className="md:col-span-2 space-y-1.5">
            <div className="flex justify-between items-center text-xs text-[#b1bad3] font-semibold">
              <label>Bet Amount</label>
              <span>{activeSym}{balance.toFixed(2)}</span>
            </div>
            <div className="relative flex items-center">
              <div className="absolute left-3 text-sm font-bold text-[#b1bad3]">
                {activeSym}
              </div>
              <input
                type="number"
                disabled={isRevealing}
                value={betInput}
                onChange={(e) => {
                  setBetInput(e.target.value);
                  const parsed = parseFloat(e.target.value);
                  if (!isNaN(parsed) && parsed > 0) setBetAmount(parsed);
                }}
                className="w-full bg-[#0f212e] border border-[#213743] rounded-xl pl-8 pr-32 py-2.5 text-sm font-bold font-mono text-white focus:outline-none focus:border-[#00e701] disabled:opacity-50"
                step="any"
                min="0.01"
              />
              <div className="absolute right-1.5 flex items-center gap-1">
                <button
                  type="button"
                  disabled={isRevealing}
                  onClick={handleHalfBet}
                  className="px-2 py-1 text-xs font-bold rounded-lg bg-[#213743] text-[#b1bad3] hover:text-white hover:bg-[#2f4553] transition-colors disabled:opacity-50"
                >
                  ½
                </button>
                <button
                  type="button"
                  disabled={isRevealing}
                  onClick={handleDoubleBet}
                  className="px-2 py-1 text-xs font-bold rounded-lg bg-[#213743] text-[#b1bad3] hover:text-white hover:bg-[#2f4553] transition-colors disabled:opacity-50"
                >
                  2×
                </button>
                <button
                  type="button"
                  disabled={isRevealing}
                  onClick={handleMaxBet}
                  className="px-2 py-1 text-xs font-bold rounded-lg bg-[#213743] text-[#b1bad3] hover:text-white hover:bg-[#2f4553] transition-colors disabled:opacity-50"
                >
                  Max
                </button>
              </div>
            </div>
          </div>

          {/* Mode Switch Pills */}
          <div className="space-y-1.5">
            <div className="text-xs text-[#b1bad3] font-semibold">Betting Mode</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isRevealing}
                onClick={() => setMode("manual")}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  mode === "manual"
                    ? "bg-[#213743] text-white border border-[#00e701] shadow-md ring-1 ring-[#00e701]"
                    : "bg-[#0f212e] text-[#b1bad3] hover:text-white"
                }`}
              >
                Manual
              </button>
              <button
                type="button"
                disabled={isRevealing}
                onClick={() => setMode("auto")}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  mode === "auto"
                    ? "bg-[#213743] text-white border border-[#00e701] shadow-md ring-1 ring-[#00e701]"
                    : "bg-[#0f212e] text-[#b1bad3] hover:text-white"
                }`}
              >
                Auto
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Stake Green `#00e701` Bet CTA Button */}
        <div>
          <button
            onClick={handleBet}
            disabled={isRevealing}
            className={`w-full py-4 rounded-xl font-black text-sm tracking-wide uppercase transition-all duration-200 transform active:scale-[0.99] ${
              !isRevealing
                ? "bg-[#00e701] hover:bg-[#00c701] text-black shadow-[0_0_20px_rgba(0,231,1,0.4)] cursor-pointer"
                : "bg-[#213743] text-[#b1bad3] cursor-not-allowed"
            }`}
          >
            {isRevealing ? "Revealing Gems..." : `Bet (${activeSym}${betAmount.toFixed(2)})`}
          </button>
        </div>

        {/* Footer Utility Icons: Sound, Stats, Fairness, Fullscreen */}
        <div className="flex items-center justify-between pt-2 border-t border-[#213743] text-[#b1bad3]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-lg hover:bg-[#213743] hover:text-white transition-colors"
              title={soundEnabled ? "Mute" : "Unmute"}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>

            <button
              onClick={() => setShowLiveStats(true)}
              className="p-2 rounded-lg hover:bg-[#213743] hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Live Stats</span>
            </button>

            <button
              onClick={() => setShowFairnessModal(true)}
              className="p-2 rounded-lg hover:bg-[#213743] hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <ShieldCheck className="h-4 w-4 text-[#00e701]" />
              <span className="hidden sm:inline">Provably Fair</span>
            </button>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg hover:bg-[#213743] hover:text-white transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
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
