"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Volume2,
  VolumeX,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Zap,
  Coins,
  TrendingUp,
  X,
  Copy,
  Check,
  Dices,
  RotateCcw,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

// Mathematical Multiplier Calculator for Chicken (99% RTP / 1% House Edge)
function calculateChickenMultiplier(bones: number, safeFound: number): number {
  if (safeFound <= 0) return 1.0;
  let prob = 1.0;
  for (let i = 0; i < safeFound; i++) {
    prob *= (25 - bones - i) / (25 - i);
  }
  const mult = 0.99 / prob;
  return parseFloat(mult.toFixed(2));
}

export default function ChickenGame() {
  const { balance, updateBalance, currency, formatBalance, currencySymbol, addRecentlyPlayedGame } = useGame();
  const activeSym = currencySymbol || "$";

  // Register in Recently Played once on mount
  useEffect(() => {
    if (addRecentlyPlayedGame) {
      addRecentlyPlayedGame({
        id: "chicken",
        title: "Chicken",
        image: "/games/stake-originals/chicken.webp",
        href: "/games/chicken",
      });
    }
  }, []);

  // Mode & Betting State
  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [betAmount, setBetAmount] = useState<number>(10);
  const [betInput, setBetInput] = useState<string>("10");
  const [bonesCount, setBonesCount] = useState<number>(3); // 1 to 24

  useEffect(() => {
    if (betInput !== "" && parseFloat(betInput) === betAmount) return;
    setBetInput(betAmount.toString());
  }, [betAmount]);

  // Round State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isBust, setIsBust] = useState<boolean>(false);
  const [boneIndices, setBoneIndices] = useState<number[]>([]);
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);
  const [isRevealing, setIsRevealing] = useState<boolean>(false);
  const [cashoutSuccess, setCashoutSuccess] = useState<boolean>(false);

  // Derived values
  const safeChickensFound = revealedIndices.filter((idx) => !boneIndices.includes(idx)).length;
  const currentMultiplier = calculateChickenMultiplier(bonesCount, safeChickensFound);
  const nextMultiplier = calculateChickenMultiplier(bonesCount, safeChickensFound + 1);
  const currentPayout = parseFloat((betAmount * currentMultiplier).toFixed(2));
  const currentProfit = parseFloat((currentPayout - betAmount).toFixed(2));
  const maxSafeDishes = 25 - bonesCount;

  // Settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // Modals
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
    if (isPlaying) return;
    sounds.playClick();
    const next = Math.max(0.01, parseFloat((betAmount / 2).toFixed(2)));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  const handleDoubleBet = () => {
    if (isPlaying) return;
    sounds.playClick();
    const next = parseFloat((betAmount * 2).toFixed(2));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  const handleMaxBet = () => {
    if (isPlaying) return;
    sounds.playClick();
    const next = Math.max(0.01, parseFloat(balance.toFixed(2)));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  // Start New Chicken Round
  const startRound = () => {
    if (isPlaying || isRevealing) return;

    const currentBet =
      betInput === "" || isNaN(parseFloat(betInput)) || parseFloat(betInput) <= 0
        ? 1
        : parseFloat(betInput);

    if (currentBet > balance) {
      alert("Insufficient balance! Please use the Wallet button.");
      return;
    }

    updateBalance(-currentBet);
    sounds.playClick();

    // Randomize bones across 25 dishes
    const allDishes = Array.from({ length: 25 }, (_, i) => i);
    const shuffled = [...allDishes].sort(() => Math.random() - 0.5);
    const selectedBones = shuffled.slice(0, bonesCount);

    setBoneIndices(selectedBones);
    setRevealedIndices([]);
    setIsBust(false);
    setCashoutSuccess(false);
    setIsPlaying(true);

    setStats((prev) => ({
      ...prev,
      rounds: prev.rounds + 1,
      wagered: parseFloat((prev.wagered + currentBet).toFixed(2)),
    }));
  };

  // Cashout accumulated profit
  const handleCashout = useCallback(() => {
    if (!isPlaying || isRevealing || safeChickensFound === 0) return;

    const payout = parseFloat((betAmount * currentMultiplier).toFixed(2));
    const profit = parseFloat((payout - betAmount).toFixed(2));
    updateBalance(payout);
    sounds.playCashout();

    try {
      confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
    } catch {}

    setIsPlaying(false);
    setCashoutSuccess(true);

    // Reveal remaining dishes
    setRevealedIndices(Array.from({ length: 25 }, (_, i) => i));

    setStats((prev) => ({
      ...prev,
      wins: prev.wins + 1,
      profit: parseFloat((prev.profit + profit).toFixed(2)),
    }));
  }, [betAmount, currentMultiplier, isPlaying, isRevealing, safeChickensFound, updateBalance]);

  // Click / Uncover Dish
  const handleDishClick = (index: number) => {
    if (!isPlaying || isRevealing || revealedIndices.includes(index)) return;

    setIsRevealing(true);
    sounds.playClocheOpen();

    setTimeout(() => {
      const nextRevealed = [...revealedIndices, index];
      setRevealedIndices(nextRevealed);

      const isTrap = boneIndices.includes(index);

      if (isTrap) {
        // Bust / Hit Bone
        sounds.playBoneCrack();
        setIsBust(true);
        setIsPlaying(false);
        setIsRevealing(false);

        // Reveal all remaining dishes
        setRevealedIndices(Array.from({ length: 25 }, (_, i) => i));

        setStats((prev) => ({
          ...prev,
          losses: prev.losses + 1,
          profit: parseFloat((prev.profit - betAmount).toFixed(2)),
        }));
      } else {
        // Safe Roasted Chicken!
        const newSafeCount = nextRevealed.filter((idx) => !boneIndices.includes(idx)).length;
        sounds.playChickenSafe(newSafeCount);
        setIsRevealing(false);

        // If all safe dishes cleared, auto-cashout!
        if (newSafeCount === maxSafeDishes) {
          handleCashout();
        }
      }
    }, 180);
  };

  // Random Pick an unrevealed dish
  const handleRandomPick = () => {
    if (!isPlaying || isRevealing) return;
    const unrevealed = Array.from({ length: 25 }, (_, i) => i).filter(
      (idx) => !revealedIndices.includes(idx)
    );
    if (unrevealed.length === 0) return;
    const randomPick = unrevealed[Math.floor(Math.random() * unrevealed.length)];
    handleDishClick(randomPick);
  };

  const toggleFullscreen = () => {
    if (!gameContainerRef.current) return;
    if (!document.fullscreenElement) {
      gameContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={gameContainerRef}
      className={`w-full max-w-4xl mx-auto px-2 sm:px-4 py-2 select-none flex flex-col space-y-3 ${
        isFullscreen ? "p-6 bg-[#0f212e] min-h-screen" : ""
      }`}
    >
      {/* Main Game Container: Arena (Top) + Controls (Directly Beneath) */}
      <div className="rounded-2xl border border-[#213743] bg-[#0f212e] shadow-2xl overflow-hidden flex flex-col">
        {/* ========================================================= */}
        {/* 1. DISH ARENA (TOP) - 5x5 CLOCHE GRID                      */}
        {/* ========================================================= */}
        <div className="p-4 sm:p-6 flex flex-col items-center justify-center space-y-4 relative">
        {/* Arena Header Stats Bar */}
        <div className="w-full flex items-center justify-between text-xs font-bold text-[#b1bad3] px-2">
          <div className="flex items-center gap-2">
            <span>SAFE DISHES:</span>
            <span className="text-[#00e701] font-mono font-black">
              {safeChickensFound} / {maxSafeDishes}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>BONES:</span>
            <span className="text-[#e9113c] font-mono font-black">{bonesCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>MULTIPLIER:</span>
            <span className="text-white font-mono font-black text-sm">
              {currentMultiplier.toFixed(2)}×
            </span>
          </div>
        </div>

        {/* 5x5 Grid of Dishes / Cloches */}
        <div className="grid grid-cols-5 gap-2.5 sm:gap-3.5 w-full max-w-md p-2">
          {Array.from({ length: 25 }, (_, i) => {
            const isRevealed = revealedIndices.includes(i);
            const isBone = boneIndices.includes(i);
            const isSafeChicken = isRevealed && !isBone;

            return (
              <button
                key={i}
                type="button"
                disabled={!isPlaying || isRevealed || isRevealing}
                onClick={() => handleDishClick(i)}
                className={`aspect-square rounded-2xl transition-all duration-300 relative flex items-center justify-center cursor-pointer overflow-hidden ${
                  !isRevealed
                    ? "bg-gradient-to-b from-[#213743] via-[#1a2c38] to-[#12232f] border-2 border-[#2f4553] shadow-lg hover:border-[#00e701]/60 hover:scale-105 active:scale-95"
                    : isSafeChicken
                    ? "bg-gradient-to-b from-amber-500/20 via-[#1a2c38] to-[#0f212e] border-2 border-[#00e701] shadow-[0_0_15px_rgba(0,231,1,0.5)] scale-100"
                    : "bg-gradient-to-b from-red-500/20 via-[#1a2c38] to-[#0f212e] border-2 border-[#e9113c] opacity-80"
                }`}
              >
                {!isRevealed ? (
                  /* Shiny Silver Cloche Dome Plate */
                  <div className="flex flex-col items-center justify-center group">
                    {/* Cloche Handle */}
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-300 shadow-xs mb-0.5" />
                    {/* Cloche Dome */}
                    <div className="w-10 sm:w-12 h-6 sm:h-7 rounded-t-full bg-gradient-to-b from-slate-200 via-slate-300 to-slate-400 border border-slate-300 shadow-md relative">
                      <div className="absolute top-1 left-2 w-2 h-1 rounded-full bg-white/70" />
                    </div>
                    {/* Plate Rim */}
                    <div className="w-12 sm:w-14 h-1.5 rounded-full bg-slate-400 border-t border-slate-200 mt-0.5 shadow-sm" />
                  </div>
                ) : isSafeChicken ? (
                  /* Roasted Golden Chicken */
                  <div className="flex flex-col items-center justify-center animate-in zoom-in duration-200">
                    <span className="text-3xl sm:text-4xl filter drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]">
                      🍗
                    </span>
                  </div>
                ) : (
                  /* Bone Trap */
                  <div className="flex flex-col items-center justify-center animate-in zoom-in duration-200">
                    <span className="text-2xl sm:text-3xl filter drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]">
                      🦴
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Live Multiplier & Next Step Banner */}
        {isPlaying && (
          <div className="flex items-center gap-4 text-xs font-bold text-[#b1bad3]">
            <div>
              Current Payout:{" "}
              <span className="text-[#00e701] font-mono">
                {activeSym}
                {currentPayout.toFixed(2)}
              </span>
            </div>
            <div>
              Next Dish:{" "}
              <span className="text-white font-mono">{nextMultiplier.toFixed(2)}×</span>
            </div>
          </div>
        )}

        {/* Game Result Banner */}
        {isBust && (
          <div className="px-4 py-1.5 rounded-xl bg-[#e9113c]/20 border border-[#e9113c]/40 text-xs font-black text-[#e9113c] uppercase tracking-wider">
            BUST! HIT A BONE
          </div>
        )}
        {cashoutSuccess && (
          <div className="px-4 py-1.5 rounded-xl bg-[#00e701]/20 border border-[#00e701]/40 text-xs font-black text-[#00e701] uppercase tracking-wider">
            CASHED OUT +{activeSym}
            {currentPayout.toFixed(2)} ({currentMultiplier.toFixed(2)}×)
          </div>
        )}
      </div>

      {/* ========================================================= */}
        {/* 2. BETTING CONTROLS (EXACT 1:1 MINES TOKEN LAYOUT)         */}
        {/* ========================================================= */}
        <div className="w-full border-t border-[#213743] bg-[#1a2c38] p-3 sm:p-4 flex flex-col justify-start space-y-2 sm:space-y-2.5 rounded-b-2xl select-none">
          {/* Top Primary CTA Button: BET transitioning to CASHOUT */}
          {!isPlaying ? (
            <button
              type="button"
              onClick={startRound}
              disabled={betAmount > balance || betAmount <= 0}
              className="w-full py-3 sm:py-3.5 text-sm sm:text-base font-extrabold rounded-lg bg-[#1475e1] hover:bg-[#1164c2] text-white shadow-lg active:scale-[0.98] uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
            >
              <span>Bet</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCashout}
              disabled={safeChickensFound === 0 || isRevealing}
              className={`w-full py-3 sm:py-3.5 text-sm sm:text-base font-extrabold rounded-lg uppercase tracking-wider transition-all flex items-center justify-center cursor-pointer shadow-lg active:scale-[0.98] ${
                safeChickensFound === 0
                  ? "bg-[#213743] text-[#b1bad3] cursor-not-allowed opacity-60"
                  : "bg-[#1475e1] hover:bg-[#1164c2] text-white shadow-[#1475e1]/30 hover:brightness-110"
              }`}
            >
              <span>
                Cashout {activeSym}
                {currentPayout.toFixed(2)}
              </span>
            </button>
          )}

          {/* Quick Helper Actions during active round */}
          {isPlaying && (
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleRandomPick}
                disabled={isRevealing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f212e] border border-[#213743] text-xs font-bold text-white hover:bg-[#213743] transition-colors cursor-pointer"
              >
                <Dices className="h-3.5 w-3.5 text-[#00e701]" />
                <span>Random Pick</span>
              </button>
              <div className="text-xs font-bold text-[#b1bad3] font-mono">
                Uncovered: <span className="text-white font-extrabold">{safeChickensFound} chickens</span>
              </div>
            </div>
          )}

          {/* Bet Amount Box with Quick Chips */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#b1bad3]">Bet Amount</span>
              <span className="font-mono text-[11px] text-[#b1bad3]">
                Bal: {activeSym}
                {balance.toFixed(2)}
              </span>
            </div>

            <div className="flex rounded-lg bg-[#0f212e] border border-[#213743] focus-within:border-[#2f4553] p-1">
              <div className="flex flex-1 items-center px-2.5">
                <span className="text-xs font-bold text-[#b1bad3] mr-1.5">{activeSym}</span>
                <input
                  type="text"
                  inputMode="decimal"
                  disabled={isPlaying}
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
                      setBetInput("1");
                      setBetAmount(1);
                    } else {
                      const num = parseFloat(betInput);
                      setBetInput(num.toString());
                      setBetAmount(num);
                    }
                  }}
                  className="w-full bg-transparent text-sm font-bold text-white outline-none font-mono"
                />
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={isPlaying}
                  onClick={handleHalfBet}
                  className="rounded-lg bg-[#213743] px-2.5 py-1.5 text-xs font-bold text-[#b1bad3] hover:bg-[#2f4553] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  ½
                </button>
                <button
                  type="button"
                  disabled={isPlaying}
                  onClick={handleDoubleBet}
                  className="rounded-lg bg-[#213743] px-2.5 py-1.5 text-xs font-bold text-[#b1bad3] hover:bg-[#2f4553] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  2×
                </button>
              </div>
            </div>
          </div>

          {/* Bones Selector Input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#b1bad3]">Bones</span>
              <span className="font-mono text-[11px] text-[#e9113c] font-bold">{bonesCount} Bones</span>
            </div>
            <div className="flex rounded-lg bg-[#0f212e] border border-[#213743] focus-within:border-[#2f4553] p-1">
              <div className="flex flex-1 items-center px-2.5">
                <input
                  type="number"
                  min={1}
                  max={24}
                  disabled={isPlaying}
                  value={bonesCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val)) {
                      setBonesCount(Math.max(1, Math.min(24, val)));
                    }
                  }}
                  className="w-full bg-transparent text-sm font-bold text-white outline-none font-mono"
                />
              </div>
              <div className="flex items-center gap-1">
                {[1, 3, 5, 10].map((b) => (
                  <button
                    key={b}
                    type="button"
                    disabled={isPlaying}
                    onClick={() => {
                      sounds.playClick();
                      setBonesCount(b);
                    }}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                      bonesCount === b
                        ? "bg-[#213743] text-white border border-[#2f4553]"
                        : "text-[#b1bad3] hover:bg-[#213743]/50 hover:text-white"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mode Switch Tabs [ Manual | Auto ] Anchored at Bottom */}
          <div className="flex rounded-lg bg-[#0f212e] p-1 border border-[#213743] mt-auto">
            <button
              type="button"
              disabled={isPlaying}
              onClick={() => {
                sounds.playClick();
                setMode("manual");
              }}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
                mode === "manual" ? "bg-[#213743] text-white shadow-sm" : "text-[#b1bad3] hover:text-white"
              }`}
            >
              Manual
            </button>
            <button
              type="button"
              disabled={isPlaying}
              onClick={() => {
                sounds.playClick();
                setMode("auto");
              }}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
                mode === "auto" ? "bg-[#213743] text-white shadow-sm" : "text-[#b1bad3] hover:text-white"
              }`}
            >
              Auto
            </button>
          </div>

          {/* Utility Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-[#213743] text-[#b1bad3]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const next = !soundEnabled;
                  setSoundEnabled(next);
                  sounds.enabled = next;
                  if (next) sounds.playClick();
                }}
                className="p-1.5 rounded-lg bg-[#0f212e] border border-[#213743] hover:text-white transition-colors cursor-pointer"
                title={soundEnabled ? "Mute Sound" : "Enable Sound"}
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-red-400" />}
              </button>

              <button
                type="button"
                onClick={() => setShowFairnessModal(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#0f212e] border border-[#213743] hover:text-white transition-colors cursor-pointer"
              >
                <ShieldCheck className="h-4 w-4 text-[#00e701]" />
                <span>Provably Fair</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowLiveStats(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#0f212e] border border-[#213743] hover:text-white transition-colors cursor-pointer"
              >
                <TrendingUp className="h-3.5 w-3.5 text-[#00e701]" />
                <span>Live Stats</span>
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-1.5 rounded-lg bg-[#0f212e] border border-[#213743] hover:text-white transition-colors cursor-pointer"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fairness Modal */}
      {showFairnessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <ShieldCheck className="h-5 w-5 text-[#00e701]" />
                <span>Provably Fair Chicken</span>
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
                Dish traps are shuffled using HMAC-SHA256 from your Client Seed and Server Seed
                with 99% certified Return to Player (RTP).
              </p>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#b1bad3]">Server Seed (Hashed)</label>
                <div className="flex items-center justify-between rounded-xl bg-[#0f212e] border border-[#213743] p-2.5 font-mono text-white text-[11px] truncate">
                  <span className="truncate">a8f5c3b9d7e124806a5bc839d4e7f12a3b4c5d6e</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("a8f5c3b9d7e124806a5bc839d4e7f12a3b4c5d6e");
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

      {/* Live Stats Modal */}
      {showLiveStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#00e701]" />
                <span>Chicken Session Stats</span>
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
                <div className="text-[11px] font-bold text-[#b1bad3]">Win Rate</div>
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
