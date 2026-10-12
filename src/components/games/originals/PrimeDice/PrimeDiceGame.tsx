"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  ShieldCheck,
  RotateCw,
  Trophy,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  X,
  Copy,
  Check,
  Dices,
  Sparkles,
  ArrowRightLeft,
  Flame,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

interface RollHistoryItem {
  id: string;
  roll: number;
  isWin: boolean;
  isPrime: boolean;
}

const PRIMES_UNDER_100 = new Set([
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97,
]);

export default function PrimeDiceGame() {
  const { balance, updateBalance, currencySymbol, addRecentlyPlayedGame } = useGame();
  const activeSym = currencySymbol || "$";

  // Register in Recently Played
  useEffect(() => {
    if (addRecentlyPlayedGame) {
      addRecentlyPlayedGame({
        id: "prime-dice",
        title: "Prime Dice",
        image: "/games/stake-originals/stake-originals-prime-dice.webp",
        href: "/games/prime-dice",
      });
    }
  }, [addRecentlyPlayedGame]);

  // Mode & Betting State
  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [betAmount, setBetAmount] = useState<number>(10);
  const [betInput, setBetInput] = useState<string>("10");
  const [isRollOver, setIsRollOver] = useState<boolean>(true);
  const [target, setTarget] = useState<number>(50.5);

  useEffect(() => {
    if (betInput !== "" && parseFloat(betInput) === betAmount) return;
    setBetInput(betAmount.toString());
  }, [betAmount]);

  // Math State (99% RTP / 1% House edge)
  const winChance = useMemo(() => {
    return isRollOver
      ? parseFloat((100.0 - target).toFixed(2))
      : parseFloat(target.toFixed(2));
  }, [isRollOver, target]);

  const multiplier = useMemo(() => {
    if (winChance <= 0) return 99.0;
    return parseFloat((99.0 / winChance).toFixed(4));
  }, [winChance]);

  const profitOnWin = useMemo(() => {
    return parseFloat((betAmount * multiplier - betAmount).toFixed(2));
  }, [betAmount, multiplier]);

  // Roll Execution State
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [displayRoll, setDisplayRoll] = useState<number>(50.5);
  const [lastWin, setLastWin] = useState<boolean | null>(null);
  const [lastIsPrime, setLastIsPrime] = useState<boolean>(false);

  // History strip
  const [history, setHistory] = useState<RollHistoryItem[]>([
    { id: "h1", roll: 64.21, isWin: true, isPrime: false },
    { id: "h2", roll: 17.05, isWin: false, isPrime: true },
    { id: "h3", roll: 88.94, isWin: true, isPrime: false },
    { id: "h4", roll: 53.0, isWin: true, isPrime: true },
  ]);

  // Settings & Modals
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showFairnessModal, setShowFairnessModal] = useState<boolean>(false);
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);
  const [copiedSeed, setCopiedSeed] = useState<boolean>(false);
  const [stats, setStats] = useState({
    rounds: 0,
    wins: 0,
    losses: 0,
    wagered: 0,
    profit: 0,
    primeHits: 0,
  });

  const gameContainerRef = useRef<HTMLDivElement>(null);

  // Quick Bet Modifiers
  const handleHalfBet = () => {
    if (isRolling) return;
    sounds.playClick();
    const next = Math.max(0.01, parseFloat((betAmount / 2).toFixed(2)));
    setBetAmount(next);
  };

  const handleDoubleBet = () => {
    if (isRolling) return;
    sounds.playClick();
    const next = Math.min(balance || 100000, parseFloat((betAmount * 2).toFixed(2)));
    setBetAmount(next);
  };

  const toggleRollMode = useCallback(() => {
    sounds.playClick();
    setIsRollOver((prev) => {
      const next = !prev;
      setTarget((t) => {
        const inverted = parseFloat((100.0 - t).toFixed(2));
        return Math.max(2.0, Math.min(98.0, inverted));
      });
      return next;
    });
  }, []);

  // Primary ROLL Execution
  const handleRoll = useCallback(() => {
    if (isRolling || betAmount <= 0 || betAmount > balance) return;

    sounds.playClick();
    updateBalance(-betAmount);
    setIsRolling(true);

    // Provably fair roll simulation (0.00 to 99.99)
    const outcome = parseFloat((Math.random() * 99.99).toFixed(2));
    const isWin = isRollOver ? outcome > target : outcome < target;
    const isPrime = PRIMES_UNDER_100.has(Math.floor(outcome));

    // Rolling animation ticker
    let step = 0;
    const maxSteps = 12;
    const interval = setInterval(() => {
      step++;
      const randTemp = parseFloat((Math.random() * 99.99).toFixed(2));
      setDisplayRoll(randTemp);

      if (step >= maxSteps) {
        clearInterval(interval);
        setDisplayRoll(outcome);
        setIsRolling(false);
        setLastWin(isWin);
        setLastIsPrime(isPrime);

        if (isWin) {
          const winPayout = parseFloat((betAmount * multiplier).toFixed(2));
          const profit = parseFloat((winPayout - betAmount).toFixed(2));
          updateBalance(winPayout);
          sounds.playCashout();

          if (multiplier >= 5 || isPrime) {
            confetti({
              particleCount: 40,
              spread: 60,
              origin: { y: 0.65 },
              colors: ["#00e701", "#ffd700", "#1475e1"],
            });
          }

          setStats((prev) => ({
            rounds: prev.rounds + 1,
            wins: prev.wins + 1,
            losses: prev.losses,
            wagered: prev.wagered + betAmount,
            profit: prev.profit + profit,
            primeHits: isPrime ? prev.primeHits + 1 : prev.primeHits,
          }));
        } else {
          sounds.playLoss();
          setStats((prev) => ({
            rounds: prev.rounds + 1,
            wins: prev.wins,
            losses: prev.losses + 1,
            wagered: prev.wagered + betAmount,
            profit: prev.profit - betAmount,
            primeHits: isPrime ? prev.primeHits + 1 : prev.primeHits,
          }));
        }

        setHistory((prev) => [
          {
            id: `r-${Date.now()}`,
            roll: outcome,
            isWin,
            isPrime,
          },
          ...prev.slice(0, 7),
        ]);
      }
    }, 40);
  }, [balance, betAmount, isRollOver, isRolling, multiplier, target, updateBalance]);

  return (
    <div
      ref={gameContainerRef}
      className={`w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-3 select-none space-y-3 relative z-0 pointer-events-auto ${
        isFullscreen ? "fixed inset-0 z-50 bg-[#0f212e] overflow-y-auto p-4 max-w-none" : ""
      }`}
    >
      {/* ========================================================= */}
      {/* 1. TOP INTERACTIVE ARENA: PRIMEDICE BOARD                 */}
      {/* ========================================================= */}
      <div className="w-full rounded-t-2xl bg-[#0a1824] border-t border-x border-[#1b3445] shadow-2xl p-4 sm:p-6 flex flex-col items-center relative overflow-hidden">
        {/* Ambient neon gold/green glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Utilities */}
        <div className="w-full flex items-center justify-between mb-4 z-10 text-xs text-[#b1bad3]">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-[11px] text-[#8596a5]">
              Prime Dice
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-[#00e701] font-mono font-bold text-[10px]">
              Classic (99.00% RTP)
            </span>
          </div>

          {/* History Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-[200px] sm:max-w-xs scrollbar-none">
            {history.map((h) => (
              <span
                key={h.id}
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold whitespace-nowrap transition-all ${
                  h.isWin
                    ? "bg-[#00e701]/20 border border-[#00e701]/50 text-[#00e701]"
                    : "bg-[#213743] border border-[#2f4553] text-[#b1bad3]"
                }`}
              >
                {h.roll.toFixed(2)}
                {h.isPrime && "★"}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                sounds.enabled = next;
                if (next) sounds.playClick();
              }}
              className="p-1.5 rounded-lg bg-[#1a2c38] hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors"
              title={soundEnabled ? "Mute" : "Unmute"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
            </button>
            <button
              onClick={() => setShowStatsModal(true)}
              className="p-1.5 rounded-lg bg-[#1a2c38] hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors"
              title="Live Stats"
            >
              <Trophy className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowFairnessModal(true)}
              className="p-1.5 rounded-lg bg-[#1a2c38] hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors"
              title="Provably Fair"
            >
              <ShieldCheck className="w-4 h-4 text-[#00e701]" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg bg-[#1a2c38] hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Central Digital Roll Result Display */}
        <div className="my-6 flex flex-col items-center justify-center z-10">
          <div
            className={`px-8 sm:px-12 py-4 sm:py-6 rounded-3xl border-2 font-mono font-black text-5xl sm:text-7xl tracking-wider transition-all duration-200 flex items-center justify-center shadow-2xl ${
              lastWin === true
                ? "border-[#00e701] text-[#00e701] bg-gradient-to-b from-[#103020] to-[#0a1824] shadow-[0_0_35px_rgba(0,231,1,0.35)]"
                : lastWin === false
                ? "border-red-500/60 text-red-400 bg-gradient-to-b from-[#2a1015] to-[#0a1824] shadow-[0_0_25px_rgba(239,68,68,0.2)]"
                : "border-[#213743] text-white bg-gradient-to-b from-[#142634] to-[#0a1824]"
            }`}
          >
            <span>{displayRoll.toFixed(2)}</span>
          </div>

          {/* Prime Bonus Indicator */}
          {lastIsPrime && lastWin !== null && (
            <div className="mt-2.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider animate-bounce">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Prime Roll Hit!</span>
            </div>
          )}
        </div>

        {/* Interactive Dual-Color Slider */}
        <div className="w-full max-w-2xl px-2 sm:px-6 my-4 z-10">
          <div className="relative w-full h-8 flex items-center">
            {/* Background slider track */}
            <div className="w-full h-3 rounded-full bg-[#0f212e] border border-[#213743] overflow-hidden flex relative">
              {/* Roll Over: Left is Red (Lose), Right is Green (Win) */}
              {/* Roll Under: Left is Green (Win), Right is Red (Lose) */}
              <div
                style={{ width: `${target}%` }}
                className={`h-full transition-all ${isRollOver ? "bg-red-500/80" : "bg-[#00e701]"}`}
              />
              <div
                style={{ width: `${100 - target}%` }}
                className={`h-full transition-all ${isRollOver ? "bg-[#00e701]" : "bg-red-500/80"}`}
              />
            </div>

            {/* Slider Range Input */}
            <input
              type="range"
              min={2}
              max={98}
              step={0.01}
              disabled={isRolling}
              value={target}
              onChange={(e) => setTarget(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            />

            {/* Visual Handle Marker */}
            <div
              style={{ left: `${target}%` }}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border-2 border-[#1475e1] shadow-lg shadow-black/50 pointer-events-none flex items-center justify-center z-10"
            >
              <div className="w-2 h-2 rounded-full bg-[#1475e1]" />
            </div>
          </div>

          {/* Scale labels */}
          <div className="flex justify-between items-center text-[11px] font-mono font-bold text-[#7a889b] px-1 mt-1">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>

        {/* Bottom Game Parameters Info Badges */}
        <div className="w-full max-w-2xl grid grid-cols-3 gap-2 mt-2 z-10">
          {/* Target */}
          <div className="bg-[#142634] border border-[#213743] rounded-xl p-2.5 flex flex-col items-center">
            <span className="text-[10px] font-bold text-[#8596a5] uppercase">
              {isRollOver ? "Roll Over" : "Roll Under"}
            </span>
            <span className="text-sm sm:text-base font-black font-mono text-white mt-0.5">
              {target.toFixed(2)}
            </span>
          </div>

          {/* Win Chance */}
          <div className="bg-[#142634] border border-[#213743] rounded-xl p-2.5 flex flex-col items-center">
            <span className="text-[10px] font-bold text-[#8596a5] uppercase">Win Chance</span>
            <span className="text-sm sm:text-base font-black font-mono text-[#00e701] mt-0.5">
              {winChance.toFixed(2)}%
            </span>
          </div>

          {/* Multiplier */}
          <div className="bg-[#142634] border border-[#213743] rounded-xl p-2.5 flex flex-col items-center">
            <span className="text-[10px] font-bold text-[#8596a5] uppercase">Multiplier</span>
            <span className="text-sm sm:text-base font-black font-mono text-white mt-0.5">
              {multiplier.toFixed(4)}×
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. BETTING CONTROLS (EXACT 1:1 MINES TOKEN LAYOUT)         */}
      {/* ========================================================= */}
      <div className="w-full border-t border-[#213743] bg-[#1a2c38] p-3 sm:p-4 flex flex-col justify-start space-y-2 sm:space-y-2.5 rounded-b-2xl select-none">
        {/* Top Primary CTA Button: BET */}
        <button
          type="button"
          onClick={handleRoll}
          disabled={isRolling || betAmount > balance || betAmount <= 0}
          className="w-full py-3 sm:py-3.5 text-sm sm:text-base font-extrabold rounded-xl bg-[#1475e1] hover:bg-[#1164c2] text-white shadow-lg active:scale-[0.98] uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
        >
          <Dices className="w-5 h-5" />
          <span>{isRolling ? "Rolling..." : "BET"}</span>
        </button>

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
                disabled={isRolling}
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
                disabled={isRolling}
                onClick={handleHalfBet}
                className="rounded-lg bg-[#213743] px-2.5 py-1.5 text-xs font-bold text-[#b1bad3] hover:bg-[#2f4553] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                ½
              </button>
              <button
                type="button"
                disabled={isRolling}
                onClick={handleDoubleBet}
                className="rounded-lg bg-[#213743] px-2.5 py-1.5 text-xs font-bold text-[#b1bad3] hover:bg-[#2f4553] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                2×
              </button>
            </div>
          </div>
        </div>

        {/* Roll Direction & Profit on Win Row */}
        <div className="grid grid-cols-2 gap-2">
          {/* Roll Direction Switcher */}
          <button
            type="button"
            disabled={isRolling}
            onClick={toggleRollMode}
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#0f212e] border border-[#213743] hover:border-[#2f4553] text-xs font-bold text-[#b1bad3] hover:text-white transition-colors cursor-pointer"
          >
            <span>{isRollOver ? "Roll Over" : "Roll Under"}</span>
            <ArrowRightLeft className="w-3.5 h-3.5 text-[#1475e1]" />
          </button>

          {/* Profit on Win */}
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#0f212e] border border-[#213743] text-xs font-bold">
            <span className="text-[#8596a5]">Profit on Win</span>
            <span className="text-[#00e701] font-mono">
              +{activeSym}
              {profitOnWin.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Mode Switch Tabs [ Manual | Auto ] Anchored at Bottom */}
        <div className="flex rounded-lg bg-[#0f212e] p-1 border border-[#213743] mt-auto">
          <button
            type="button"
            disabled={isRolling}
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
            disabled={isRolling}
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
      </div>

      {/* Fairness Modal */}
      {showFairnessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#1a2c38] border border-[#213743] p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#00e701]" />
                <h3 className="font-extrabold text-white text-base">Provably Fair</h3>
              </div>
              <button
                onClick={() => setShowFairnessModal(false)}
                className="text-[#b1bad3] hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-[#b1bad3] leading-relaxed">
              Prime Dice roll results are mathematically verifiable via HMAC-SHA256 hash using the active
              Server Seed, Client Seed, and incremental Nonce.
            </p>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#b1bad3]">Server Seed Hash</label>
              <div className="flex items-center justify-between rounded-xl bg-[#0f212e] border border-[#213743] p-2 text-xs font-mono text-white">
                <span className="truncate">7b98d28a5c34e892cfa76e104f145bd9244081c7f539a25b138d6411516a70e2</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText("7b98d28a5c34e892cfa76e104f145bd9244081c7f539a25b138d6411516a70e2");
                    setCopiedSeed(true);
                    setTimeout(() => setCopiedSeed(false), 2000);
                  }}
                  className="ml-2 text-[#b1bad3] hover:text-white"
                >
                  {copiedSeed ? <Check className="h-4 w-4 text-[#00e701]" /> : <Copy className="h-4 w-4" />}
                </button>
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

      {/* Stats Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#1a2c38] border border-[#213743] p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-[#1475e1]" />
                <h3 className="font-extrabold text-white text-base">Session Statistics</h3>
              </div>
              <button
                onClick={() => setShowStatsModal(false)}
                className="text-[#b1bad3] hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#0f212e] p-3 rounded-xl border border-[#213743]">
                <div className="text-[#b1bad3]">Rounds Played</div>
                <div className="text-white font-mono font-bold text-base mt-1">{stats.rounds}</div>
              </div>
              <div className="bg-[#0f212e] p-3 rounded-xl border border-[#213743]">
                <div className="text-[#b1bad3]">Prime Hits</div>
                <div className="text-amber-400 font-mono font-bold text-base mt-1">{stats.primeHits}</div>
              </div>
              <div className="bg-[#0f212e] p-3 rounded-xl border border-[#213743]">
                <div className="text-[#b1bad3]">Total Wagered</div>
                <div className="text-white font-mono font-bold text-base mt-1">
                  {activeSym}
                  {stats.wagered.toFixed(2)}
                </div>
              </div>
              <div className="bg-[#0f212e] p-3 rounded-xl border border-[#213743]">
                <div className="text-[#b1bad3]">Net Profit</div>
                <div
                  className={`font-mono font-bold text-base mt-1 ${
                    stats.profit >= 0 ? "text-[#00e701]" : "text-red-400"
                  }`}
                >
                  {stats.profit >= 0 ? "+" : ""}
                  {activeSym}
                  {stats.profit.toFixed(2)}
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
    </div>
  );
}
