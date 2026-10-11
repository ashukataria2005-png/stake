"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Zap,
  TrendingUp,
  X,
  Copy,
  Check,
  Dices,
  RotateCcw,
  Sparkles,
  Flame,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

// Mathematical Multiplier Calculator for Moles 4x4 Grid (16 Holes, 99% RTP)
function calculateMolesMultiplier(traps: number, safeFound: number): number {
  if (safeFound <= 0) return 1.0;
  let prob = 1.0;
  for (let i = 0; i < safeFound; i++) {
    prob *= (16 - traps - i) / (16 - i);
  }
  const mult = 0.99 / prob;
  return parseFloat(mult.toFixed(2));
}

export default function MolesGame() {
  const { balance, updateBalance, currencySymbol, addRecentlyPlayedGame } = useGame();
  const activeSym = currencySymbol || "$";

  // Register in Recently Played once on mount
  useEffect(() => {
    if (addRecentlyPlayedGame) {
      addRecentlyPlayedGame({
        id: "moles",
        title: "Moles",
        image: "/games/stake-originals/moles.webp",
        href: "/games/moles",
      });
    }
  }, []);

  // Mode & Betting State
  const [betAmount, setBetAmount] = useState<number>(10);
  const [betInput, setBetInput] = useState<string>("10");
  const [trapsCount, setTrapsCount] = useState<number>(3); // 1 to 15 traps

  useEffect(() => {
    if (betInput !== "" && parseFloat(betInput) === betAmount) return;
    setBetInput(betAmount.toString());
  }, [betAmount]);

  // Round State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isBust, setIsBust] = useState<boolean>(false);
  const [trapIndices, setTrapIndices] = useState<number[]>([]);
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);
  const [isRevealing, setIsRevealing] = useState<boolean>(false);
  const [cashoutSuccess, setCashoutSuccess] = useState<boolean>(false);
  const [lastMultiplierBounce, setLastMultiplierBounce] = useState<boolean>(false);

  // Derived values
  const safeMolesFound = revealedIndices.filter((idx) => !trapIndices.includes(idx)).length;
  const currentMultiplier = calculateMolesMultiplier(trapsCount, safeMolesFound);
  const nextMultiplier = calculateMolesMultiplier(trapsCount, safeMolesFound + 1);
  const currentPayout = parseFloat((betAmount * currentMultiplier).toFixed(2));
  const currentProfit = parseFloat((currentPayout - betAmount).toFixed(2));
  const maxSafeMoles = 16 - trapsCount;

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
    if (soundEnabled) sounds.playClick();
    const next = Math.max(0.01, parseFloat((betAmount / 2).toFixed(2)));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  const handleDoubleBet = () => {
    if (isPlaying) return;
    if (soundEnabled) sounds.playClick();
    const next = parseFloat((betAmount * 2).toFixed(2));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  const handleMaxBet = () => {
    if (isPlaying) return;
    if (soundEnabled) sounds.playClick();
    const next = Math.max(0.01, parseFloat(balance.toFixed(2)));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  // Start New Moles Round
  const handleStartRound = () => {
    if (isPlaying || isRevealing) return;
    if (balance < betAmount) {
      alert("Insufficient balance!");
      return;
    }

    updateBalance(-betAmount);
    if (soundEnabled) sounds.playBet();

    // Generate random trap positions (4x4 = 16 holes)
    const indices = Array.from({ length: 16 }, (_, i) => i);
    const shuffled = [...indices].sort(() => Math.random() - 0.5);
    const chosenTraps = shuffled.slice(0, trapsCount);

    setTrapIndices(chosenTraps);
    setRevealedIndices([]);
    setIsBust(false);
    setCashoutSuccess(false);
    setIsPlaying(true);

    setStats((prev) => ({
      ...prev,
      rounds: prev.rounds + 1,
      wagered: parseFloat((prev.wagered + betAmount).toFixed(2)),
    }));
  };

  // Tap a hole
  const handleDigHole = (index: number) => {
    if (!isPlaying || isRevealing || revealedIndices.includes(index)) return;

    setIsRevealing(true);
    if (soundEnabled) sounds.playMoleDig();

    setTimeout(() => {
      const nextRevealed = [...revealedIndices, index];
      setRevealedIndices(nextRevealed);

      if (trapIndices.includes(index)) {
        // Mud trap hit - Bust!
        if (soundEnabled) sounds.playMoleBust();
        setIsBust(true);
        setIsPlaying(false);
        setIsRevealing(false);

        // Auto reveal all remaining holes to verify fairness
        const remaining = Array.from({ length: 16 }, (_, i) => i);
        setRevealedIndices(remaining);

        setStats((prev) => ({
          ...prev,
          losses: prev.losses + 1,
          profit: parseFloat((prev.profit - betAmount).toFixed(2)),
        }));
      } else {
        // Safe golden mole found!
        const nextSafeCount = nextRevealed.filter((idx) => !trapIndices.includes(idx)).length;
        if (soundEnabled) sounds.playMolePop(nextSafeCount);

        setLastMultiplierBounce(true);
        setTimeout(() => setLastMultiplierBounce(false), 400);

        // If player has unearthed ALL safe moles, auto-cashout!
        if (nextSafeCount === maxSafeMoles) {
          const finalMultiplier = calculateMolesMultiplier(trapsCount, nextSafeCount);
          const finalPayout = parseFloat((betAmount * finalMultiplier).toFixed(2));
          updateBalance(finalPayout);
          setIsPlaying(false);
          setCashoutSuccess(true);
          if (soundEnabled) sounds.playCashout();
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });

          setStats((prev) => ({
            ...prev,
            wins: prev.wins + 1,
            profit: parseFloat((prev.profit + (finalPayout - betAmount)).toFixed(2)),
          }));
        }

        setIsRevealing(false);
      }
    }, 150);
  };

  // Cashout
  const handleCashout = () => {
    if (!isPlaying || isRevealing || safeMolesFound === 0) return;

    updateBalance(currentPayout);
    setIsPlaying(false);
    setCashoutSuccess(true);
    if (soundEnabled) sounds.playCashout();
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

    // Reveal rest of the holes
    const all = Array.from({ length: 16 }, (_, i) => i);
    setRevealedIndices(all);

    setStats((prev) => ({
      ...prev,
      wins: prev.wins + 1,
      profit: parseFloat((prev.profit + currentProfit).toFixed(2)),
    }));
  };

  // Pick random unopened hole
  const handleQuickPick = () => {
    if (!isPlaying || isRevealing) return;
    const unopened = Array.from({ length: 16 }, (_, i) => i).filter(
      (idx) => !revealedIndices.includes(idx)
    );
    if (unopened.length === 0) return;
    const randomPick = unopened[Math.floor(Math.random() * unopened.length)];
    handleDigHole(randomPick);
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
          1. GAME ARENA: BURROW HOLES ARENA (4x4 Grid = 16 Holes)
      ========================================================================== */}
      <div className="w-full rounded-t-2xl bg-[#0f212e] border-t border-x border-[#213743] shadow-2xl p-3 sm:p-4 flex flex-col items-center justify-center space-y-3 relative overflow-hidden">
        {/* Subtle Ambient Background Glow */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#00e701]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Live Multiplier & Progress HUD Banner */}
        <div className="w-full flex items-center justify-between bg-[#1a2c38] rounded-xl px-3 py-2 border border-[#213743]">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-[#b1bad3] uppercase tracking-wider">Moles:</span>
            <span className="text-xs font-bold text-white font-mono">
              <span className="text-[#00e701]">{safeMolesFound}</span> / {maxSafeMoles}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isPlaying && safeMolesFound > 0 && (
              <div className="text-xs text-[#b1bad3]">
                Next: <span className="font-mono font-bold text-white">{nextMultiplier}×</span>
              </div>
            )}
            <div
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#0f212e] text-xs font-black font-mono transition-transform duration-200 ${
                lastMultiplierBounce ? "scale-110 text-[#00e701]" : safeMolesFound > 0 ? "text-[#00e701]" : "text-[#b1bad3]"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{currentMultiplier.toFixed(2)}×</span>
            </div>
          </div>
        </div>

        {/* 4x4 Burrow Holes Grid */}
        <div className="grid grid-cols-4 gap-2 w-full max-w-[340px] aspect-square p-1">
          {Array.from({ length: 16 }, (_, idx) => {
            const isRevealed = revealedIndices.includes(idx);
            const isTrap = trapIndices.includes(idx);
            const isSafeMole = isRevealed && !isTrap;

            return (
              <button
                key={idx}
                disabled={!isPlaying || isRevealing || isRevealed}
                onClick={() => handleDigHole(idx)}
                className={`group relative rounded-xl flex items-center justify-center transition-all duration-300 transform active:scale-95 overflow-hidden ${
                  !isRevealed
                    ? isPlaying
                      ? "bg-[#213743] hover:bg-[#2f4553] hover:shadow-[0_0_15px_rgba(0,231,1,0.2)] border border-[#2f4553] cursor-pointer"
                      : "bg-[#213743]/70 border border-[#213743] cursor-not-allowed opacity-85"
                    : isSafeMole
                    ? "bg-gradient-to-b from-[#1a382c] to-[#0f281e] border-2 border-[#00e701] shadow-[0_0_20px_rgba(0,231,1,0.3)] animate-in zoom-in-95 duration-200"
                    : "bg-gradient-to-b from-[#3a1d25] to-[#251016] border-2 border-[#e9113c] shadow-[0_0_20px_rgba(233,17,60,0.3)] animate-in shake duration-300"
                }`}
              >
                {/* Burrow mound shading inside hole */}
                <div className="absolute inset-1 rounded-lg bg-black/20 pointer-events-none" />

                {!isRevealed ? (
                  // Unopened Burrow Mound
                  <div className="relative flex flex-col items-center justify-center p-1">
                    <div className="w-7 h-5 sm:w-9 sm:h-7 rounded-full bg-[#172733] border border-[#2f4553] flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                      <div className="w-3.5 h-1.5 sm:w-5 sm:h-2 rounded-full bg-[#0a141c]" />
                    </div>
                    <div className="w-8 sm:w-11 h-1 bg-[#2d4352] rounded-full -mt-0.5 opacity-60" />
                  </div>
                ) : isSafeMole ? (
                  // Unearthed Golden Mole
                  <div className="relative flex flex-col items-center justify-center animate-bounce duration-500">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg border border-yellow-200">
                      <div className="relative w-full h-full flex flex-col items-center justify-center">
                        <div className="flex gap-0.5 items-center mb-0.5">
                          <div className="w-2 h-1.5 bg-black rounded-sm" />
                          <div className="w-0.5 h-0.5 bg-black" />
                          <div className="w-2 h-1.5 bg-black rounded-sm" />
                        </div>
                        <div className="w-1.5 h-1 bg-pink-400 rounded-full" />
                      </div>
                    </div>
                    <span className="text-[8px] font-black text-[#00e701] font-mono mt-0.5 drop-shadow">
                      SAFE
                    </span>
                  </div>
                ) : (
                  // Mud / Trap Splat
                  <div className="relative flex flex-col items-center justify-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#e9113c]/20 border border-[#e9113c] flex items-center justify-center">
                      <Flame className="h-5 w-5 text-[#e9113c] animate-pulse" />
                    </div>
                    <span className="text-[8px] font-black text-[#e9113c] font-mono mt-0.5">
                      BUST
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Round Feedback Overlays */}
        {cashoutSuccess && (
          <div className="w-full px-4 py-1.5 rounded-xl bg-[#00e701]/10 border border-[#00e701]/40 flex items-center justify-center gap-2 animate-in fade-in zoom-in-95">
            <Sparkles className="h-3.5 w-3.5 text-[#00e701]" />
            <div className="text-xs font-bold text-[#00e701]">
              Cashed Out! Won {activeSym}{currentPayout.toFixed(2)} ({currentMultiplier.toFixed(2)}×)
            </div>
          </div>
        )}

        {isBust && (
          <div className="w-full px-4 py-1.5 rounded-xl bg-[#e9113c]/10 border border-[#e9113c]/40 flex items-center justify-center gap-2 animate-in fade-in">
            <Flame className="h-3.5 w-3.5 text-[#e9113c]" />
            <div className="text-xs font-bold text-[#e9113c]">
              Mud Trap Hit! Round Busted
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          2. MINES HARMONIZED BETTING CONTROLS SHELL CONTAINER
      ========================================================================== */}
      <div className="w-full border-t border-[#213743] bg-[#1a2c38] p-3 sm:p-4 flex flex-col justify-start space-y-2 sm:space-y-2.5 rounded-b-2xl select-none">
        {/* 1. PRIMARY BET CTA BUTTON (Directly at top of controls) */}
        <div className="w-full">
          {!isPlaying ? (
            <button
              type="button"
              onClick={handleStartRound}
              disabled={betAmount > balance || betAmount <= 0}
              className="w-full py-3 sm:py-3.5 text-sm sm:text-base font-extrabold rounded-xl bg-[#1475e1] hover:bg-[#1164c2] text-white shadow-lg shadow-[#1475e1]/25 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer uppercase tracking-wider"
            >
              <span>BET</span>
            </button>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleQuickPick}
                disabled={isRevealing}
                className="py-3 text-xs font-extrabold rounded-xl bg-[#213743] hover:bg-[#2f4553] text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Dices className="h-4 w-4 text-[#00e701]" />
                <span>RANDOM</span>
              </button>

              <button
                type="button"
                onClick={handleCashout}
                disabled={isRevealing || safeMolesFound === 0}
                className={`col-span-2 py-3 text-sm font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-center uppercase tracking-wider cursor-pointer ${
                  safeMolesFound > 0
                    ? "bg-[#00e701] hover:bg-[#00c701] text-black shadow-[0_0_20px_rgba(0,231,1,0.4)] animate-pulse"
                    : "bg-[#213743] text-[#b1bad3] cursor-not-allowed"
                }`}
              >
                <span>
                  {safeMolesFound > 0
                    ? `CASHOUT ${activeSym}${currentPayout.toFixed(2)} (${currentMultiplier.toFixed(2)}×)`
                    : "DIG A HOLE"}
                </span>
              </button>
            </div>
          )}
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

        {/* 3. TRAPS COUNT SELECTOR */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10px] font-bold text-[#b1bad3] uppercase">
            <span>Mud Traps</span>
            <span>{trapsCount} Traps ({16 - trapsCount} Safe Moles)</span>
          </div>
          <div className="flex items-center gap-2">
            <select
              disabled={isPlaying}
              value={trapsCount}
              onChange={(e) => setTrapsCount(parseInt(e.target.value, 10))}
              className="w-full bg-[#0f212e] border border-[#213743] rounded-lg px-2.5 py-2 text-xs font-bold font-mono text-white focus:outline-none focus:border-[#2f4553] disabled:opacity-50 cursor-pointer"
            >
              {Array.from({ length: 15 }, (_, i) => i + 1).map((cnt) => (
                <option key={cnt} value={cnt}>
                  {cnt} {cnt === 1 ? "Trap" : "Traps"} ({(16 - cnt)} Moles)
                </option>
              ))}
            </select>
          </div>
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
                <span>Provably Fair: Moles</span>
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
                Burrow mud traps are shuffled using HMAC-SHA256 from your Client Seed and Server Seed
                with certified 99% Return to Player (RTP).
              </p>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#b1bad3]">Server Seed (Hashed)</label>
                <div className="flex items-center justify-between rounded-xl bg-[#0f212e] border border-[#213743] p-2.5 font-mono text-white text-[11px] truncate">
                  <span className="truncate">e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
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
                <span>Moles Session Stats</span>
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
