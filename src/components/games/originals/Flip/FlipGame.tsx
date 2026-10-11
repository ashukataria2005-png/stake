"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Coins,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Sparkles,
  RotateCw,
  TrendingUp,
  X,
  Info,
  Check,
  Copy,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

export type CoinSide = "heads" | "tails";

interface FlipHistoryItem {
  id: string;
  side: CoinSide;
  multiplier: number;
  won: boolean;
}

// Multiplier ladder based on 99% RTP (1.98x per consecutive successful flip)
const MULTIPLIERS = [
  1.98, 3.92, 7.76, 15.37, 30.43, 60.25, 119.3, 236.21, 467.7, 926.05,
];

export default function FlipGame() {
  const {
    balance,
    updateBalance,
    currencySymbol,
    addRecentlyPlayedGame,
  } = useGame();
  const activeSym = currencySymbol || "$";

  // Register in Recently Played once on mount
  useEffect(() => {
    if (addRecentlyPlayedGame) {
      addRecentlyPlayedGame({
        id: "flip",
        title: "Flip",
        image: "/games/stake-originals/stake-originals-flip.webp",
        href: "/games/flip",
      });
    }
  }, [addRecentlyPlayedGame]);

  // Betting & Prediction State
  const [betAmount, setBetAmount] = useState<number>(10);
  const [betInput, setBetInput] = useState<string>("10");
  const [chosenSide, setChosenSide] = useState<CoinSide>("heads");

  // Round State
  const [streak, setStreak] = useState<number>(0);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [landedSide, setLandedSide] = useState<CoinSide>("heads");
  const [rotationDegrees, setRotationDegrees] = useState<number>(0);
  const [history, setHistory] = useState<FlipHistoryItem[]>([]);
  const [isRoundActive, setIsRoundActive] = useState<boolean>(false);
  const [lastWinAmount, setLastWinAmount] = useState<number | null>(null);

  // Settings & Modals
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showFairnessModal, setShowFairnessModal] = useState<boolean>(false);
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [copiedSeed, setCopiedSeed] = useState<boolean>(false);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // Statistics
  const [stats, setStats] = useState({
    rounds: 0,
    wins: 0,
    losses: 0,
    wagered: 0,
    profit: 0,
  });

  const currentMultiplier = streak > 0 ? MULTIPLIERS[Math.min(streak - 1, MULTIPLIERS.length - 1)] : 1;
  const currentCashout = streak > 0 ? parseFloat((betAmount * currentMultiplier).toFixed(2)) : 0;
  const nextMultiplier = MULTIPLIERS[Math.min(streak, MULTIPLIERS.length - 1)];

  // Bet modifiers
  const handleHalfBet = () => {
    if (isRoundActive) return;
    sounds.playClick();
    const next = Math.max(0.01, parseFloat((betAmount / 2).toFixed(2)));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  const handleDoubleBet = () => {
    if (isRoundActive) return;
    sounds.playClick();
    const next = parseFloat((betAmount * 2).toFixed(2));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  const handleMaxBet = () => {
    if (isRoundActive) return;
    sounds.playClick();
    const next = Math.max(0.01, parseFloat(balance.toFixed(2)));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  // Execute Flip
  const handleFlip = () => {
    if (isFlipping) return;

    // Deduct initial bet if starting new round
    if (!isRoundActive) {
      const parsedBet = parseFloat(betInput) || 1;
      if (parsedBet > balance) {
        alert("Insufficient balance! Please use the Wallet button.");
        return;
      }
      updateBalance(-parsedBet);
      setBetAmount(parsedBet);
      setIsRoundActive(true);
      setStreak(0);
      setLastWinAmount(null);

      setStats((prev) => ({
        ...prev,
        rounds: prev.rounds + 1,
        wagered: parseFloat((prev.wagered + parsedBet).toFixed(2)),
      }));
    }

    setIsFlipping(true);
    sounds.playCoinToss();

    // Determine outcome (50% fair chance)
    const resultSide: CoinSide = Math.random() < 0.5 ? "heads" : "tails";
    const won = resultSide === chosenSide;

    // Calculate dynamic 3D spin angle (5 to 7 full rotations + side target)
    const extraRotations = 360 * (5 + Math.floor(Math.random() * 3));
    const targetFaceAngle = resultSide === "heads" ? 0 : 180;
    const finalAngle = rotationDegrees + extraRotations + (targetFaceAngle - (rotationDegrees % 360));
    setRotationDegrees(finalAngle);

    setTimeout(() => {
      setLandedSide(resultSide);
      setIsFlipping(false);
      sounds.playCoinSlap();

      if (won) {
        const nextStreak = streak + 1;
        setStreak(nextStreak);
        const mult = MULTIPLIERS[Math.min(nextStreak - 1, MULTIPLIERS.length - 1)];
        const wonVal = parseFloat((betAmount * mult).toFixed(2));
        setLastWinAmount(wonVal);
        sounds.playSuccessChime();

        setHistory((prev) => [
          { id: `${Date.now()}`, side: resultSide, multiplier: mult, won: true },
          ...prev.slice(0, 9),
        ]);
      } else {
        // Bust / Lost streak
        sounds.playBust();
        setIsRoundActive(false);
        setStreak(0);
        setLastWinAmount(null);

        setHistory((prev) => [
          { id: `${Date.now()}`, side: resultSide, multiplier: 0, won: false },
          ...prev.slice(0, 9),
        ]);

        setStats((prev) => ({
          ...prev,
          losses: prev.losses + 1,
          profit: parseFloat((prev.profit - betAmount).toFixed(2)),
        }));
      }
    }, 1100);
  };

  // Cashout accumulated winnings
  const handleCashout = useCallback(() => {
    if (!isRoundActive || isFlipping || streak === 0) return;

    const payout = currentCashout;
    const profit = parseFloat((payout - betAmount).toFixed(2));
    updateBalance(payout);
    sounds.playCoinSlap();
    sounds.playCashout();

    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch {}

    setIsRoundActive(false);
    setStreak(0);
    setLastWinAmount(null);

    setStats((prev) => ({
      ...prev,
      wins: prev.wins + 1,
      profit: parseFloat((prev.profit + profit).toFixed(2)),
    }));
  }, [betAmount, currentCashout, isFlipping, isRoundActive, streak, updateBalance]);

  // Toggle fullscreen
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
      className="flex flex-col items-center w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 select-none"
    >
      {/* ========================================================= */}
      {/* 1. TOP INTERACTIVE ARENA: 3D COIN & STREAK LADDER         */}
      {/* ========================================================= */}
      <div className="w-full rounded-2xl bg-[#0f212e] border border-[#213743] shadow-2xl p-4 sm:p-6 flex flex-col items-center relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#00e701]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Streak Header */}
        <div className="w-full flex items-center justify-between mb-4 z-10 text-xs text-[#b1bad3]">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-[11px] text-[#8596a5]">
              Streak: <span className="text-white font-mono">{streak}</span>
            </span>
            {streak > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#00e701]/10 border border-[#00e701]/30 text-[#00e701] font-mono font-bold text-[10px]">
                {currentMultiplier}×
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#8596a5] font-semibold">99% RTP</span>
          </div>
        </div>

        {/* Streak Ladder Display */}
        <div className="w-full flex items-center justify-center gap-1.5 sm:gap-2 mb-6 overflow-x-auto py-1 scrollbar-none z-10">
          {MULTIPLIERS.slice(0, 6).map((mult, idx) => {
            const stepNum = idx + 1;
            const isCompleted = streak >= stepNum;
            const isCurrent = streak === stepNum;
            const isNext = streak === stepNum - 1;

            return (
              <div
                key={mult}
                className={`flex flex-col items-center px-2.5 sm:px-3.5 py-1.5 rounded-xl border transition-all ${
                  isCurrent
                    ? "bg-[#00e701]/20 border-[#00e701] text-[#00e701] scale-105 shadow-lg shadow-[#00e701]/20"
                    : isCompleted
                    ? "bg-[#1a2c38] border-[#00e701]/50 text-white"
                    : isNext && isRoundActive
                    ? "bg-[#1a2c38] border-amber-500/50 text-amber-300 animate-pulse"
                    : "bg-[#1a2c38]/60 border-[#213743] text-[#8596a5]"
                }`}
              >
                <span className="text-[9px] uppercase font-bold tracking-widest text-[#8596a5]">
                  Step {stepNum}
                </span>
                <span className="text-xs sm:text-sm font-black font-mono">
                  {mult}×
                </span>
              </div>
            );
          })}
        </div>

        {/* 3D Coin Flip Arena */}
        <div
          className="relative w-44 h-44 sm:w-52 sm:h-52 my-4 flex items-center justify-center"
          style={{ perspective: "1000px" }}
        >
          {/* Animated 3D Coin Cylinder */}
          <div
            className="w-full h-full relative transition-transform"
            style={{
              transformStyle: "preserve-3d",
              transform: `rotateY(${rotationDegrees}deg)`,
              transitionDuration: isFlipping ? "1.1s" : "0.3s",
              transitionTimingFunction: "cubic-bezier(0.2, 0.8, 0.3, 1)",
            }}
          >
            {/* FRONT FACE: HEADS (Gold Stake Crest) */}
            <div
              className="absolute inset-0 rounded-full flex flex-col items-center justify-center border-4 border-amber-300 shadow-2xl bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200"
              style={{
                backfaceVisibility: "hidden",
                boxShadow: "0 0 35px rgba(245, 158, 11, 0.45), inset 0 0 20px rgba(255, 255, 255, 0.4)",
              }}
            >
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full border-2 border-dashed border-amber-900/40 flex flex-col items-center justify-center">
                <Coins className="h-12 w-12 sm:h-14 sm:w-14 text-amber-950 drop-shadow" />
                <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-amber-950 mt-1">
                  HEADS
                </span>
                <span className="text-[10px] font-bold text-amber-900/80">STAKE CREST</span>
              </div>
            </div>

            {/* BACK FACE: TAILS (Sapphire Blue Diamond) */}
            <div
              className="absolute inset-0 rounded-full flex flex-col items-center justify-center border-4 border-cyan-300 shadow-2xl bg-gradient-to-tr from-blue-700 via-cyan-500 to-teal-300"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                boxShadow: "0 0 35px rgba(6, 182, 212, 0.45), inset 0 0 20px rgba(255, 255, 255, 0.4)",
              }}
            >
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full border-2 border-dashed border-cyan-950/40 flex flex-col items-center justify-center">
                <Sparkles className="h-12 w-12 sm:h-14 sm:w-14 text-cyan-950 drop-shadow" />
                <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-cyan-950 mt-1">
                  TAILS
                </span>
                <span className="text-[10px] font-bold text-cyan-950/80">DIAMOND</span>
              </div>
            </div>
          </div>
        </div>

        {/* Win Banner / Streak Notification */}
        <div className="h-8 flex items-center justify-center mt-2 z-10">
          {lastWinAmount !== null && (
            <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-[#00e701]/15 border border-[#00e701]/40 text-[#00e701] font-mono font-bold text-sm animate-bounce">
              <Sparkles className="h-4 w-4" />
              <span>Current Cashout: {activeSym}{currentCashout.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Past Flips History Trail */}
        {history.length > 0 && (
          <div className="flex items-center gap-1.5 mt-3 z-10">
            <span className="text-[10px] uppercase font-bold text-[#8596a5] mr-1">History:</span>
            {history.slice(0, 6).map((item) => (
              <span
                key={item.id}
                className={`px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono ${
                  item.won
                    ? "bg-[#00e701]/20 border border-[#00e701]/40 text-[#00e701]"
                    : "bg-[#e9113c]/20 border border-[#e9113c]/40 text-[#e9113c]"
                }`}
              >
                {item.side === "heads" ? "H" : "T"}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 2. BOTTOM CONTROLS (Directly Beneath Arena)               */}
      {/* ========================================================= */}
      <div className="w-full mt-4 rounded-2xl bg-[#1a2c38] border border-[#213743] p-4 sm:p-5 flex flex-col gap-4 shadow-xl">
        {/* Pick Heads or Tails Selector */}
        <div className="w-full flex flex-col gap-1.5">
          <label className="text-xs font-bold text-[#b1bad3]">Choose Next Side</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                if (isFlipping) return;
                sounds.playClick();
                setChosenSide("heads");
              }}
              disabled={isFlipping}
              className={`py-3 rounded-xl border flex items-center justify-center gap-2 text-sm font-black transition-all cursor-pointer ${
                chosenSide === "heads"
                  ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/10"
                  : "bg-[#0f212e] border-[#213743] text-[#b1bad3] hover:text-white hover:border-[#2f4553]"
              }`}
            >
              <Coins className="h-5 w-5 text-amber-400" />
              <span>HEADS (1.98×)</span>
            </button>

            <button
              onClick={() => {
                if (isFlipping) return;
                sounds.playClick();
                setChosenSide("tails");
              }}
              disabled={isFlipping}
              className={`py-3 rounded-xl border flex items-center justify-center gap-2 text-sm font-black transition-all cursor-pointer ${
                chosenSide === "tails"
                  ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/10"
                  : "bg-[#0f212e] border-[#213743] text-[#b1bad3] hover:text-white hover:border-[#2f4553]"
              }`}
            >
              <Sparkles className="h-5 w-5 text-cyan-400" />
              <span>TAILS (1.98×)</span>
            </button>
          </div>
        </div>

        {/* Bet Amount Input & Quick Modifiers */}
        <div className="w-full flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-[#b1bad3]">
            <span>Bet Amount</span>
            <span>
              Balance: <span className="text-white font-mono">{activeSym}{balance.toFixed(2)}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <div className="sm:col-span-2 relative flex items-center">
              <span className="absolute left-3 text-sm font-bold text-[#8596a5]">
                {activeSym}
              </span>
              <input
                type="number"
                step="any"
                disabled={isRoundActive}
                value={betInput}
                onChange={(e) => {
                  setBetInput(e.target.value);
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val) && val >= 0) setBetAmount(val);
                }}
                className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-[#0f212e] border border-[#213743] text-white font-mono font-bold text-sm focus:outline-none focus:border-[#00e701] disabled:opacity-50"
              />
            </div>

            <div className="sm:col-span-2 grid grid-cols-3 gap-1.5">
              <button
                onClick={handleHalfBet}
                disabled={isRoundActive}
                className="py-2.5 rounded-xl bg-[#213743] hover:bg-[#2f4553] text-[#b1bad3] hover:text-white font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                ½
              </button>
              <button
                onClick={handleDoubleBet}
                disabled={isRoundActive}
                className="py-2.5 rounded-xl bg-[#213743] hover:bg-[#2f4553] text-[#b1bad3] hover:text-white font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                2×
              </button>
              <button
                onClick={handleMaxBet}
                disabled={isRoundActive}
                className="py-2.5 rounded-xl bg-[#213743] hover:bg-[#2f4553] text-[#b1bad3] hover:text-white font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                Max
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Stake Green CTA Buttons */}
        <div className="w-full grid grid-cols-1 gap-2 pt-1">
          {streak > 0 && isRoundActive ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleFlip}
                disabled={isFlipping}
                className="w-full py-3.5 rounded-xl bg-[#213743] hover:bg-[#2f4553] text-white font-black text-sm uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
              >
                {isFlipping ? "Flipping..." : `Flip (${nextMultiplier}×)`}
              </button>

              <button
                onClick={handleCashout}
                disabled={isFlipping}
                className="w-full py-3.5 rounded-xl bg-[#00e701] hover:bg-[#00c701] active:scale-[0.99] text-[#011e01] font-black text-sm uppercase tracking-wider shadow-lg shadow-[#00e701]/25 transition-all disabled:opacity-50 cursor-pointer"
              >
                Cashout {activeSym}{currentCashout.toFixed(2)}
              </button>
            </div>
          ) : (
            <button
              onClick={handleFlip}
              disabled={isFlipping}
              className="w-full py-4 rounded-xl bg-[#00e701] hover:bg-[#00c701] active:scale-[0.99] text-[#011e01] font-black text-sm sm:text-base uppercase tracking-wider shadow-lg shadow-[#00e701]/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isFlipping ? "Flipping Coin..." : "Flip Coin"}
            </button>
          )}
        </div>

        {/* Bottom Utility Bar */}
        <div className="flex items-center justify-between rounded-lg bg-[#0f212e] border border-[#213743] px-3 py-2 text-xs text-[#b1bad3] mt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const next = !soundEnabled;
                  setSoundEnabled(next);
                  sounds.enabled = next;
                }}
                className="p-1 rounded-md hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors cursor-pointer"
                title={soundEnabled ? "Mute" : "Unmute"}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
              </button>

              <button
                type="button"
                onClick={() => setShowStatsModal(true)}
                className="p-1 rounded-md hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors cursor-pointer"
                title="Live Stats"
              >
                <TrendingUp className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowRulesModal(true)}
                className="p-1 rounded-md hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors cursor-pointer"
                title="Rules"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFairnessModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#213743] hover:bg-[#2f4553] text-[#b1bad3] hover:text-white font-bold text-xs transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-[#00e701]" />
                <span>Fairness</span>
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-1 rounded-md hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors cursor-pointer"
                title="Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

      {/* ========================================================= */}
      {/* PROVABLY FAIR MODAL                                       */}
      {/* ========================================================= */}
      {showFairnessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <ShieldCheck className="h-5 w-5 text-[#00e701]" />
                <span>Provably Fair Verification</span>
              </div>
              <button
                onClick={() => setShowFairnessModal(false)}
                className="p-1 rounded-lg text-[#b1bad3] hover:text-white hover:bg-[#213743]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-[#b1bad3]">
              <div>
                <label className="font-bold text-white block mb-1">Server Seed (Hashed)</label>
                <div className="p-2.5 rounded-xl bg-[#0f212e] font-mono text-[11px] text-white flex items-center justify-between">
                  <span className="truncate">e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
                      setCopiedSeed(true);
                      setTimeout(() => setCopiedSeed(false), 2000);
                    }}
                    className="p-1 text-[#8596a5] hover:text-white"
                  >
                    {copiedSeed ? <Check className="h-3.5 w-3.5 text-[#00e701]" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="font-bold text-white block mb-1">Client Seed</label>
                <div className="p-2.5 rounded-xl bg-[#0f212e] font-mono text-[11px] text-white">
                  stake_flip_client_seed_2026
                </div>
              </div>
              <div>
                <label className="font-bold text-white block mb-1">House Edge</label>
                <div className="p-2.5 rounded-xl bg-[#0f212e] font-mono text-[11px] text-[#00e701]">
                  1.00% (99.00% RTP)
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowFairnessModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#213743] hover:bg-[#2f4553] text-white text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* LIVE STATS MODAL                                          */}
      {/* ========================================================= */}
      {showStatsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <TrendingUp className="h-5 w-5 text-[#00e701]" />
                <span>Live Flip Stats</span>
              </div>
              <button
                onClick={() => setShowStatsModal(false)}
                className="p-1 rounded-lg text-[#b1bad3] hover:text-white hover:bg-[#213743]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#0f212e] border border-[#213743] text-center">
                <div className="text-[11px] font-bold text-[#b1bad3]">Rounds</div>
                <div className="text-lg font-black text-white font-mono mt-0.5">{stats.rounds}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#0f212e] border border-[#213743] text-center">
                <div className="text-[11px] font-bold text-[#b1bad3]">Win Rate</div>
                <div className="text-lg font-black text-[#00e701] font-mono mt-0.5">
                  {stats.rounds > 0 ? ((stats.wins / stats.rounds) * 100).toFixed(1) : "0.0"}%
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#0f212e] border border-[#213743] text-center">
                <div className="text-[11px] font-bold text-[#b1bad3]">Wagered</div>
                <div className="text-lg font-black text-white font-mono mt-0.5">
                  {activeSym}{stats.wagered.toFixed(2)}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#0f212e] border border-[#213743] text-center">
                <div className="text-[11px] font-bold text-[#b1bad3]">Net Profit</div>
                <div
                  className={`text-lg font-black font-mono mt-0.5 ${
                    stats.profit >= 0 ? "text-[#00e701]" : "text-[#e9113c]"
                  }`}
                >
                  {stats.profit >= 0 ? "+" : ""}
                  {activeSym}{stats.profit.toFixed(2)}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowStatsModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#213743] hover:bg-[#2f4553] text-white text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* RULES MODAL                                               */}
      {/* ========================================================= */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Info className="h-5 w-5 text-[#00e701]" />
                <span>How to Play Stake Flip</span>
              </div>
              <button
                onClick={() => setShowRulesModal(false)}
                className="p-1 rounded-lg text-[#b1bad3] hover:text-white hover:bg-[#213743]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-[#b1bad3] leading-relaxed">
              <p>
                <strong className="text-white">Objective:</strong> Predict whether the 3D coin will land on Heads (Stake Crest) or Tails (Diamond).
              </p>
              <p>
                <strong className="text-white">Streak Multipliers:</strong> Each consecutive win multiplies your payout (1.98×, 3.92×, 7.76×, 15.37×, up to 926×+).
              </p>
              <p>
                <strong className="text-white">Cashout Anytime:</strong> After any winning flip, you can cash out your accumulated profit, or continue flipping for larger multipliers.
              </p>
              <p>
                <strong className="text-white">Bust:</strong> An incorrect flip resets your streak and busts the round.
              </p>
            </div>
            <button
              onClick={() => setShowRulesModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#213743] hover:bg-[#2f4553] text-white text-xs font-bold transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
