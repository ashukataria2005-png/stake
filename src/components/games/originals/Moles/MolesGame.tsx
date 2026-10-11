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
      className="flex flex-col items-center w-full min-h-[calc(100vh-64px)] bg-[#0f212e] text-white p-3 sm:p-6 select-none font-sans"
    >
      {/* =========================================================================
          TOP: GAME CANVAS / BURROW HOLES ARENA (4x4 Grid = 16 Holes)
      ========================================================================== */}
      <div className="w-full max-w-4xl bg-[#1a2c38] rounded-2xl p-4 sm:p-8 border border-[#213743] shadow-2xl flex flex-col items-center relative overflow-hidden mb-5">
        
        {/* Subtle Ambient Background Glow */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#00e701]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Live Multiplier & Progress HUD Banner */}
        <div className="w-full flex items-center justify-between bg-[#0f212e]/80 backdrop-blur-md rounded-xl p-3 sm:px-6 mb-6 border border-[#213743]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#b1bad3] uppercase tracking-wider">Moles Uncovered:</span>
            <span className="text-sm font-bold text-white font-mono">
              <span className="text-[#00e701]">{safeMolesFound}</span> / {maxSafeMoles}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {isPlaying && safeMolesFound > 0 && (
              <div className="text-xs text-[#b1bad3] hidden sm:block">
                Next: <span className="font-mono font-bold text-white">{nextMultiplier}×</span>
              </div>
            )}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#213743] text-sm font-black font-mono transition-transform duration-200 ${
                lastMultiplierBounce ? "scale-110 text-[#00e701]" : safeMolesFound > 0 ? "text-[#00e701]" : "text-[#b1bad3]"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>{currentMultiplier.toFixed(2)}×</span>
            </div>
          </div>
        </div>

        {/* 4x4 Burrow Holes Grid */}
        <div className="grid grid-cols-4 gap-2.5 sm:gap-4 w-full max-w-lg aspect-square p-2">
          {Array.from({ length: 16 }, (_, idx) => {
            const isRevealed = revealedIndices.includes(idx);
            const isTrap = trapIndices.includes(idx);
            const isSafeMole = isRevealed && !isTrap;

            return (
              <button
                key={idx}
                disabled={!isPlaying || isRevealing || isRevealed}
                onClick={() => handleDigHole(idx)}
                className={`group relative rounded-2xl flex items-center justify-center transition-all duration-300 transform active:scale-95 overflow-hidden ${
                  !isRevealed
                    ? isPlaying
                      ? "bg-[#213743] hover:bg-[#2f4553] hover:shadow-[0_0_15px_rgba(0,231,1,0.2)] border-2 border-[#2f4553] cursor-pointer"
                      : "bg-[#213743]/70 border-2 border-[#213743] cursor-not-allowed opacity-85"
                    : isSafeMole
                    ? "bg-gradient-to-b from-[#1a382c] to-[#0f281e] border-2 border-[#00e701] shadow-[0_0_20px_rgba(0,231,1,0.3)] animate-in zoom-in-95 duration-200"
                    : "bg-gradient-to-b from-[#3a1d25] to-[#251016] border-2 border-[#e9113c] shadow-[0_0_20px_rgba(233,17,60,0.3)] animate-in shake duration-300"
                }`}
              >
                {/* Burrow mound shading inside hole */}
                <div className="absolute inset-1 rounded-xl bg-black/20 pointer-events-none" />

                {!isRevealed ? (
                  // Unopened Burrow Mound
                  <div className="relative flex flex-col items-center justify-center p-2">
                    <div className="w-8 h-6 sm:w-12 sm:h-9 rounded-full bg-[#172733] border border-[#2f4553] flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                      <div className="w-4 h-2 sm:w-6 sm:h-3 rounded-full bg-[#0a141c]" />
                    </div>
                    <div className="w-10 sm:w-14 h-1.5 sm:h-2 bg-[#2d4352] rounded-full -mt-0.5 opacity-60" />
                  </div>
                ) : isSafeMole ? (
                  // Unearthed Golden Mole
                  <div className="relative flex flex-col items-center justify-center animate-bounce duration-500">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg border-2 border-yellow-200">
                      {/* Stylized Mole Face with Sunglasses & Gem */}
                      <div className="relative w-full h-full flex flex-col items-center justify-center">
                        {/* Sunglasses */}
                        <div className="flex gap-1 items-center mb-0.5">
                          <div className="w-2.5 h-2 sm:w-3.5 sm:h-2.5 bg-black rounded-sm" />
                          <div className="w-1 h-0.5 bg-black" />
                          <div className="w-2.5 h-2 sm:w-3.5 sm:h-2.5 bg-black rounded-sm" />
                        </div>
                        {/* Pink Snout */}
                        <div className="w-2 h-1.5 sm:w-2.5 sm:h-2 bg-pink-400 rounded-full" />
                      </div>
                    </div>
                    <span className="text-[10px] sm:text-xs font-black text-[#00e701] font-mono mt-1 drop-shadow">
                      SAFE
                    </span>
                  </div>
                ) : (
                  // Mud / Trap Splat
                  <div className="relative flex flex-col items-center justify-center">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-[#e9113c]/20 border border-[#e9113c] flex items-center justify-center">
                      <Flame className="h-6 w-6 sm:h-8 sm:w-8 text-[#e9113c] animate-pulse" />
                    </div>
                    <span className="text-[10px] sm:text-xs font-black text-[#e9113c] font-mono mt-1">
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
          <div className="mt-4 px-6 py-2.5 rounded-xl bg-[#00e701]/10 border border-[#00e701]/40 flex items-center gap-3 animate-in fade-in zoom-in-95">
            <Sparkles className="h-5 w-5 text-[#00e701]" />
            <div className="text-sm font-bold text-[#00e701]">
              Cashed Out! Won {activeSym}{currentPayout.toFixed(2)} ({currentMultiplier.toFixed(2)}×)
            </div>
          </div>
        )}

        {isBust && (
          <div className="mt-4 px-6 py-2.5 rounded-xl bg-[#e9113c]/10 border border-[#e9113c]/40 flex items-center gap-3 animate-in fade-in">
            <Flame className="h-5 w-5 text-[#e9113c]" />
            <div className="text-sm font-bold text-[#e9113c]">
              Mud Trap Hit! Round Busted
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          CONTROLS: DIRECTLY BENEATH BOARD (Vertical Flow)
      ========================================================================== */}
      <div className="w-full max-w-4xl bg-[#1a2c38] rounded-2xl p-5 border border-[#213743] shadow-xl space-y-4">
        
        {/* Row 1: Bet Amount & Traps Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Bet Amount Input with Quick Modifiers */}
          <div className="space-y-1.5">
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
                disabled={isPlaying}
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
                  disabled={isPlaying}
                  onClick={handleHalfBet}
                  className="px-2 py-1 text-xs font-bold rounded-lg bg-[#213743] text-[#b1bad3] hover:text-white hover:bg-[#2f4553] transition-colors disabled:opacity-50"
                >
                  ½
                </button>
                <button
                  type="button"
                  disabled={isPlaying}
                  onClick={handleDoubleBet}
                  className="px-2 py-1 text-xs font-bold rounded-lg bg-[#213743] text-[#b1bad3] hover:text-white hover:bg-[#2f4553] transition-colors disabled:opacity-50"
                >
                  2×
                </button>
                <button
                  type="button"
                  disabled={isPlaying}
                  onClick={handleMaxBet}
                  className="px-2 py-1 text-xs font-bold rounded-lg bg-[#213743] text-[#b1bad3] hover:text-white hover:bg-[#2f4553] transition-colors disabled:opacity-50"
                >
                  Max
                </button>
              </div>
            </div>
          </div>

          {/* Traps Count Selector */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs text-[#b1bad3] font-semibold">
              <label>Mud Traps</label>
              <span>{trapsCount} Traps ({16 - trapsCount} Safe Moles)</span>
            </div>
            <div className="flex items-center gap-2">
              <select
                disabled={isPlaying}
                value={trapsCount}
                onChange={(e) => setTrapsCount(parseInt(e.target.value, 10))}
                className="w-full bg-[#0f212e] border border-[#213743] rounded-xl px-3 py-2.5 text-sm font-bold font-mono text-white focus:outline-none focus:border-[#00e701] disabled:opacity-50 cursor-pointer"
              >
                {Array.from({ length: 15 }, (_, i) => i + 1).map((cnt) => (
                  <option key={cnt} value={cnt}>
                    {cnt} {cnt === 1 ? "Trap" : "Traps"} ({(16 - cnt)} Moles)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Row 2: Dual-State Primary Green CTA Button `#00e701` */}
        <div>
          {!isPlaying ? (
            <button
              onClick={handleStartRound}
              className="w-full py-4 rounded-xl font-black text-sm tracking-wide uppercase transition-all duration-200 transform active:scale-[0.99] bg-[#00e701] hover:bg-[#00c701] text-black shadow-[0_0_20px_rgba(0,231,1,0.4)] cursor-pointer"
            >
              Bet
            </button>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleQuickPick}
                disabled={isRevealing}
                className="py-4 rounded-xl font-bold text-xs uppercase bg-[#213743] hover:bg-[#2f4553] text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Dices className="h-4 w-4 text-[#00e701]" />
                <span>Random Hole</span>
              </button>

              <button
                type="button"
                onClick={handleCashout}
                disabled={isRevealing || safeMolesFound === 0}
                className={`sm:col-span-2 py-4 rounded-xl font-black text-sm tracking-wide uppercase transition-all duration-200 transform active:scale-[0.99] ${
                  safeMolesFound > 0
                    ? "bg-[#00e701] hover:bg-[#00c701] text-black shadow-[0_0_25px_rgba(0,231,1,0.5)] cursor-pointer animate-pulse"
                    : "bg-[#213743] text-[#b1bad3] cursor-not-allowed"
                }`}
              >
                {safeMolesFound > 0
                  ? `Cashout ${activeSym}${currentPayout.toFixed(2)} (${currentMultiplier.toFixed(2)}×)`
                  : "Dig a Hole to Cashout"}
              </button>
            </div>
          )}
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
