"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  ShieldCheck,
  RotateCw,
  Settings,
  BarChart2,
  Check,
  Copy,
  X,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

interface RollHistoryItem {
  id: string;
  roll: number;
  isWin: boolean;
}

export default function DiceGame() {
  const { balance, updateBalance, currencySymbol, addRecentlyPlayedGame } = useGame();
  const activeSym = currencySymbol || "$";

  // Mode & Betting State
  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [betAmount, setBetAmount] = useState<number>(10);
  const [betInput, setBetInput] = useState<string>("10.00");
  const [isRollOver, setIsRollOver] = useState<boolean>(true);
  const [target, setTarget] = useState<number>(50.5);

  // Derived 99% RTP Math State (House edge = 1%)
  // Roll Over: winChance = 100 - target
  // Roll Under: winChance = target
  // multiplier = 99 / winChance
  const winChance = useMemo(() => {
    return isRollOver
      ? parseFloat((100.0 - target).toFixed(4))
      : parseFloat(target.toFixed(4));
  }, [isRollOver, target]);

  const multiplier = useMemo(() => {
    if (winChance <= 0) return 99.0;
    return parseFloat((99.0 / winChance).toFixed(4));
  }, [winChance]);

  // Roll Execution State
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [hasWon, setHasWon] = useState<boolean | null>(null);
  const [displayRoll, setDisplayRoll] = useState<number>(50.5);

  // Auto Bet State
  const [isAutoRunning, setIsAutoRunning] = useState<boolean>(false);
  const [autoBetsLimit, setAutoBetsLimit] = useState<number>(0); // 0 = infinite
  const [autoBetsCount, setAutoBetsCount] = useState<number>(0);
  const [isAdvancedAuto, setIsAdvancedAuto] = useState<boolean>(false);
  const [onWinAction, setOnWinAction] = useState<"reset" | "increase">("reset");
  const [onWinPercent, setOnWinPercent] = useState<number>(100);
  const [onLossAction, setOnLossAction] = useState<"reset" | "increase">("reset");
  const [onLossPercent, setOnLossPercent] = useState<number>(100);
  const [stopOnProfit, setStopOnProfit] = useState<number>(0);
  const [stopOnLoss, setStopOnLoss] = useState<number>(0);
  const initialAutoBalanceRef = useRef<number>(balance);
  const baseBetRef = useRef<number>(betAmount);

  // History strip
  const [history, setHistory] = useState<RollHistoryItem[]>([
    { id: "h1", roll: 64.21, isWin: true },
    { id: "h2", roll: 12.05, isWin: false },
    { id: "h3", roll: 88.94, isWin: true },
    { id: "h4", roll: 51.3, isWin: true },
  ]);

  // Modals & Sound Settings
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFairnessOpen, setIsFairnessOpen] = useState<boolean>(false);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [hotkeysEnabled, setHotkeysEnabled] = useState<boolean>(true);

  // Stats
  const [stats, setStats] = useState({
    totalBets: 0,
    totalWagered: 0,
    totalWon: 0,
    netProfit: 0,
    bestRoll: 0,
  });

  // Fairness Seeds
  const [serverSeedHash] = useState<string>(
    "9c1e7a4b08d2f53e61a8b940c72e1f3a58d69b0c2e4f7a1b3d5c8e9f0a2b4c6e"
  );
  const [clientSeed, setClientSeed] = useState<string>("stake_dice_7721b");
  const [nonce, setNonce] = useState<number>(429);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Register in Recently Played
  useEffect(() => {
    addRecentlyPlayedGame({
      id: "dice",
      slug: "dice",
      title: "Dice",
      href: "/games/dice",
      playersCount: 4890,
    });
  }, [addRecentlyPlayedGame]);

  // Toggle Roll Over <-> Roll Under with smooth target swap
  const toggleRollMode = useCallback(() => {
    sounds.playClick();
    setIsRollOver((prev) => {
      const nextMode = !prev;
      setTarget((t) => {
        const inverted = parseFloat((100.0 - t).toFixed(2));
        return Math.max(2.0, Math.min(98.0, inverted));
      });
      return nextMode;
    });
  }, []);

  // Update target directly with clamping
  const updateTargetValue = (newTarget: number) => {
    const clamped = Math.max(2.0, Math.min(98.0, parseFloat(newTarget.toFixed(2))));
    setTarget(clamped);
  };

  // Quick Bet math modifiers
  const handleHalfBet = () => {
    if (isRolling) return;
    sounds.playClick();
    const next = Math.max(0.01, parseFloat((betAmount / 2).toFixed(2)));
    setBetAmount(next);
    setBetInput(next.toFixed(2));
  };

  const handleDoubleBet = () => {
    if (isRolling) return;
    sounds.playClick();
    const next = parseFloat((betAmount * 2).toFixed(2));
    const capped = Math.min(next, Math.max(1, parseFloat(balance.toFixed(2))));
    setBetAmount(capped);
    setBetInput(capped.toFixed(2));
  };

  // Execute Roll
  const rollDice = useCallback(() => {
    const effectiveBet =
      betInput === "" || isNaN(parseFloat(betInput)) || parseFloat(betInput) <= 0
        ? 1
        : parseFloat(betInput);

    if (betInput === "" || isNaN(parseFloat(betInput))) {
      setBetInput(effectiveBet.toFixed(2));
      setBetAmount(effectiveBet);
    }

    if (effectiveBet > balance) {
      setIsAutoRunning(false);
      return;
    }
    if (effectiveBet <= 0) return;

    setIsRolling(true);
    setHasWon(null);

    // Deduct wager
    updateBalance(-effectiveBet);
    setNonce((n) => n + 1);

    setStats((prev) => ({
      ...prev,
      totalBets: prev.totalBets + 1,
      totalWagered: prev.totalWagered + effectiveBet,
      netProfit: prev.netProfit - effectiveBet,
    }));

    sounds.playDiceRoll();

    // Generate fair cryptographic roll [0.00 to 100.00]
    const finalRoll = parseFloat((Math.random() * 100.0).toFixed(2));

    // Staggered roll tick animation
    let tickCount = 0;
    const maxTicks = 12;
    const interval = setInterval(() => {
      tickCount++;
      const randomDisplay = parseFloat((Math.random() * 100.0).toFixed(2));
      setDisplayRoll(randomDisplay);

      if (tickCount >= maxTicks) {
        clearInterval(interval);
        setDisplayRoll(finalRoll);
        setLastRoll(finalRoll);
        setIsRolling(false);

        const won = isRollOver ? finalRoll > target : finalRoll < target;
        setHasWon(won);

        if (won) {
          const payout = parseFloat((effectiveBet * multiplier).toFixed(2));
          updateBalance(payout);
          sounds.playDiceWin();

          setStats((prev) => ({
            ...prev,
            totalWon: prev.totalWon + payout,
            netProfit: prev.netProfit + payout,
            bestRoll: Math.max(prev.bestRoll, finalRoll),
          }));

          if (multiplier >= 4) {
            try {
              confetti({
                particleCount: multiplier >= 10 ? 70 : 40,
                spread: 60,
                origin: { y: 0.65 },
                colors: ["#1475e1", "#00e701", "#ffffff"],
              });
            } catch {}
          }
        } else {
          sounds.playDiceLoss();
        }

        // Add to history
        setHistory((prev) => [
          { id: `h-${Date.now()}`, roll: finalRoll, isWin: won },
          ...prev.slice(0, 9),
        ]);

        // Auto betting progression if running
        if (isAutoRunning) {
          setAutoBetsCount((c) => {
            const next = c + 1;
            if (autoBetsLimit > 0 && next >= autoBetsLimit) {
              setIsAutoRunning(false);
            }
            return next;
          });

          if (isAdvancedAuto) {
            if (won) {
              if (onWinAction === "increase") {
                const nextBet = parseFloat(
                  (betAmount * (1 + onWinPercent / 100)).toFixed(2)
                );
                setBetAmount(nextBet);
                setBetInput(nextBet.toFixed(2));
              } else {
                setBetAmount(baseBetRef.current);
                setBetInput(baseBetRef.current.toFixed(2));
              }
            } else {
              if (onLossAction === "increase") {
                const nextBet = parseFloat(
                  (betAmount * (1 + onLossPercent / 100)).toFixed(2)
                );
                setBetAmount(nextBet);
                setBetInput(nextBet.toFixed(2));
              } else {
                setBetAmount(baseBetRef.current);
                setBetInput(baseBetRef.current.toFixed(2));
              }
            }

            const currentNet = balance - initialAutoBalanceRef.current;
            if (stopOnProfit > 0 && currentNet >= stopOnProfit) setIsAutoRunning(false);
            if (stopOnLoss > 0 && -currentNet >= stopOnLoss) setIsAutoRunning(false);
          }
        }
      }
    }, 25);
  }, [
    autoBetsLimit,
    balance,
    betAmount,
    betInput,
    isAdvancedAuto,
    isAutoRunning,
    isRollOver,
    multiplier,
    onLossAction,
    onLossPercent,
    onWinAction,
    onWinPercent,
    stopOnLoss,
    stopOnProfit,
    target,
    updateBalance,
  ]);

  // Auto Bet Loop
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isAutoRunning && !isRolling) {
      timer = setTimeout(() => {
        rollDice();
      }, 350);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isAutoRunning, isRolling, rollDice]);

  // Spacebar Hotkey
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        hotkeysEnabled &&
        e.code === "Space" &&
        e.target instanceof HTMLElement &&
        e.target.tagName !== "INPUT" &&
        e.target.tagName !== "SELECT"
      ) {
        e.preventDefault();
        rollDice();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hotkeysEnabled, rollDice]);

  // Copy helper
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1800);
  };

  // Calculated Profit on Win
  const profitOnWin = useMemo(() => {
    return parseFloat((betAmount * (multiplier - 1)).toFixed(2));
  }, [betAmount, multiplier]);

  return (
    <div className="w-full max-w-lg mx-auto px-2 sm:px-3 py-2 select-none flex flex-col space-y-2">
      {/* ========================================================= */}
      {/* 1. SLIDER CARD CONTAINER (Compact Capsule)                */}
      {/* ========================================================= */}
      <div className="w-full rounded-lg bg-[#0f212e] border border-[#213743] shadow-2xl p-3 sm:p-4 flex flex-col items-center justify-between relative overflow-hidden">
        {/* Central Result Display Box (Compact height) */}
        <div className="w-full flex flex-col items-center justify-center my-1 sm:my-2 z-10">
          <div
            className={`rounded-xl border-2 px-5 py-2 bg-[#1a2c38] shadow-lg transition-all duration-200 min-w-[170px] text-center ${
              hasWon === true
                ? "border-[#00e701] shadow-[#00e701]/25"
                : hasWon === false
                ? "border-[#e9113c] shadow-[#e9113c]/25"
                : "border-[#213743]"
            }`}
          >
            <div
              className={`text-4xl sm:text-5xl font-black font-mono tracking-tight transition-colors ${
                hasWon === true
                  ? "text-[#00e701] drop-shadow-[0_0_12px_rgba(0,231,1,0.5)]"
                  : hasWon === false
                  ? "text-[#e9113c] drop-shadow-[0_0_12px_rgba(233,17,60,0.5)]"
                  : "text-white"
              }`}
            >
              {displayRoll.toFixed(2)}
            </div>
            <div className="mt-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#87909e]">
              {hasWon === true
                ? `Won +${activeSym}${profitOnWin.toFixed(2)}`
                : hasWon === false
                ? "Loss"
                : `Target: ${isRollOver ? ">" : "<"} ${target.toFixed(2)}`}
            </div>
          </div>
        </div>

        {/* ======================================================= */}
        {/* SLIDER BAR TRACK & THUMB (Sleek h-2.5 & tight scale)     */}
        {/* ======================================================= */}
        <div className="w-full px-1 sm:px-2 z-10 my-1">
          {/* Numbers scale: "0", "25", "50", "75", "100" tightly aligned above track */}
          <div className="flex justify-between px-1 text-[11px] font-mono font-semibold text-[#b1bad3] select-none mb-1">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>

          {/* Slider Bar Track & Thumb */}
          <div className="relative flex flex-col items-center">
            {/* Rolled Result Pointer on Track */}
            {lastRoll !== null && (
              <div
                className="absolute -top-6 z-30 transition-all duration-300 pointer-events-none transform -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${Math.min(98, Math.max(2, lastRoll))}%` }}
              >
                <div
                  className={`rounded-md px-1 py-0.2 text-[9px] font-black font-mono shadow-md ${
                    hasWon ? "bg-[#00e701] text-[#0f212e]" : "bg-[#e9113c] text-white"
                  }`}
                >
                  {lastRoll.toFixed(2)}
                </div>
                <div
                  className={`w-0 h-0 border-x-3 border-x-transparent border-t-3 ${
                    hasWon ? "border-t-[#00e701]" : "border-t-[#e9113c]"
                  }`}
                />
              </div>
            )}

            {/* Sleek slim track height: h-2 sm:h-2.5 with 250ms dynamic inversion animation */}
            <div className="relative w-full h-2 sm:h-2.5 rounded-full bg-[#07131b] border border-[#213743] overflow-hidden shadow-inner flex select-none">
              {/* Left Segment: Red in Roll Over, Green in Roll Under */}
              <div
                className={`h-full transition-all duration-[250ms] ease-in-out ${
                  isRollOver ? "bg-[#e9113c]" : "bg-[#00e701]"
                }`}
                style={{ width: `${target}%` }}
              />
              {/* Right Segment: Green in Roll Over, Red in Roll Under */}
              <div
                className={`h-full transition-all duration-[250ms] ease-in-out ${
                  isRollOver ? "bg-[#00e701]" : "bg-[#e9113c]"
                }`}
                style={{ width: `${100 - target}%` }}
              />
            </div>

            {/* Draggable thumb: Compact pill (w-8 h-7) with 3 slim vertical lines (|||) */}
            <div
              className="absolute top-1/2 -translate-y-1/2 z-20 pointer-events-none transform -translate-x-1/2 transition-[left] duration-75"
              style={{ left: `${target}%` }}
            >
              <div className="flex h-7 w-8 sm:h-7.5 sm:w-8.5 items-center justify-center rounded-md bg-[#1475e1] text-white shadow-md border border-white/80 active:scale-105 transition-transform">
                <div className="flex items-center gap-[2px]">
                  <span className="w-[1.5px] h-3 bg-white/70 rounded-full" />
                  <span className="w-[1.5px] h-3 bg-white/70 rounded-full" />
                  <span className="w-[1.5px] h-3 bg-white/70 rounded-full" />
                </div>
              </div>
            </div>

            {/* Range Slider for Touch & Drag */}
            <input
              type="range"
              min="2.00"
              max="98.00"
              step="0.01"
              disabled={isRolling}
              value={target}
              onChange={(e) => updateTargetValue(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
            />
          </div>
        </div>

        {/* ======================================================= */}
        {/* 2. 3-METRIC STATS BOXES (Slim & Clean, max height 40px) */}
        {/* ======================================================= */}
        <div className="w-full grid grid-cols-3 gap-2 mt-2 z-10">
          {/* Multiplier Box */}
          <div className="rounded-md bg-[#1a2c38] border border-[#2f4553] py-1.5 px-2.5 flex flex-col justify-center min-h-[38px] max-h-[42px]">
            <span className="text-[10px] uppercase font-semibold text-[#87909e] leading-none">
              Multiplier
            </span>
            <div className="text-sm font-bold font-mono text-white mt-0.5 truncate leading-tight">
              {multiplier.toFixed(4)} ×
            </div>
          </div>

          {/* Roll Target Box with circular swap icon */}
          <div className="rounded-md bg-[#1a2c38] border border-[#2f4553] py-1.5 px-2.5 flex flex-col justify-center min-h-[38px] max-h-[42px] relative">
            <span className="text-[10px] uppercase font-semibold text-[#87909e] leading-none">
              {isRollOver ? "Roll Over" : "Roll Under"}
            </span>
            <div className="flex items-center justify-between mt-0.5 leading-tight">
              <span className="text-sm font-bold font-mono text-white">
                {target.toFixed(2)}
              </span>
              <button
                type="button"
                onClick={toggleRollMode}
                title="Toggle Roll Over / Roll Under"
                className="p-0.5 text-[#87909e] hover:text-white transition-colors cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5 transition-transform active:rotate-180" />
              </button>
            </div>
          </div>

          {/* Win Chance Box */}
          <div className="rounded-md bg-[#1a2c38] border border-[#2f4553] py-1.5 px-2.5 flex flex-col justify-center min-h-[38px] max-h-[42px]">
            <span className="text-[10px] uppercase font-semibold text-[#87909e] leading-none">
              Win Chance
            </span>
            <div className="text-sm font-bold font-mono text-white mt-0.5 truncate leading-tight">
              {winChance.toFixed(4)} %
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. BETTING CONTROLS (Mines Pattern, gap-2 compact layout) */}
      {/* ========================================================= */}
      <div className="w-full rounded-lg bg-[#0f212e] sm:bg-[#1a2c38] border border-[#213743] p-3 sm:p-4 flex flex-col gap-2 shadow-xl">
        {/* 1. Primary CTA Bet Button (Strict height h-11 / h-12 max) */}
        <button
          onClick={() => {
            if (mode === "auto") {
              if (isAutoRunning) {
                setIsAutoRunning(false);
              } else {
                initialAutoBalanceRef.current = balance;
                baseBetRef.current = betAmount;
                setAutoBetsCount(0);
                setIsAutoRunning(true);
              }
            } else {
              rollDice();
            }
          }}
          disabled={isRolling || betAmount > balance || betAmount <= 0}
          className={`w-full h-11 sm:h-12 rounded-md font-bold text-sm text-white tracking-wide transition-all active:scale-[0.99] shadow-lg shadow-[#1475e1]/20 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
            isAutoRunning
              ? "bg-rose-600 hover:bg-rose-700"
              : "bg-[#1475e1] hover:bg-[#1165c4]"
          }`}
        >
          {isAutoRunning
            ? "Stop Autobet"
            : mode === "auto"
            ? "Start Autobet"
            : isRolling
            ? "Rolling..."
            : "Bet"}
        </button>

        {/* 2. Bet Amount Section (No Flag, Dynamic Balance, h-10 to h-11) */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs text-[#b1bad3] px-0.5">
            <span>Bet Amount</span>
            <span className="font-mono text-[11px] text-[#87909e]">
              {activeSym}{balance.toFixed(2)}
            </span>
          </div>

          <div className="h-10 sm:h-11 flex items-center rounded-md bg-[#0f212e] border border-[#2f4553] px-3 focus-within:border-[#1475e1] transition-colors">
            {/* Active Currency Symbol Prefix (No Flag) */}
            <span className="text-xs font-bold text-[#b1bad3] mr-2 select-none shrink-0">
              {activeSym}
            </span>

            {/* Input Field */}
            <input
              type="text"
              inputMode="decimal"
              disabled={isRolling || isAutoRunning}
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
                if (
                  betInput === "" ||
                  isNaN(parseFloat(betInput)) ||
                  parseFloat(betInput) <= 0
                ) {
                  setBetInput("1.00");
                  setBetAmount(1);
                } else {
                  const num = parseFloat(betInput);
                  setBetAmount(num);
                  setBetInput(num.toFixed(2));
                }
              }}
              className="w-full bg-transparent text-sm font-bold text-white focus:outline-none font-mono py-0.5"
            />

            {/* Right Divider & Compact ½ / 2× Buttons */}
            <div className="h-5 border-l border-[#2f4553] mx-1.5 shrink-0" />
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                disabled={isRolling || isAutoRunning}
                onClick={handleHalfBet}
                className="px-2.5 py-1 rounded hover:bg-[#213743] text-[#b1bad3] hover:text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                ½
              </button>
              <button
                type="button"
                disabled={isRolling || isAutoRunning}
                onClick={handleDoubleBet}
                className="px-2.5 py-1 rounded hover:bg-[#213743] text-[#b1bad3] hover:text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                2×
              </button>
            </div>
          </div>
        </div>

        {/* 3. Profit on Win Section (Manual Mode Only, No Flag, h-10 to h-11) */}
        {mode === "manual" && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs text-[#b1bad3] px-0.5">
              <span>Profit on Win</span>
              <span className="font-mono text-[11px] text-[#87909e]">
                {activeSym}{balance.toFixed(2)}
              </span>
            </div>

            <div className="h-10 sm:h-11 flex items-center rounded-md bg-[#0f212e] border border-[#2f4553] px-3">
              <span className="text-xs font-bold text-[#b1bad3] mr-2 select-none shrink-0">
                {activeSym}
              </span>
              <span className="text-sm font-bold text-white font-mono">
                {profitOnWin.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* 4. Auto Mode Specific Inputs (Auto Mode Only) */}
        {mode === "auto" && (
          <div className="flex flex-col gap-2">
            {/* Number of Bets */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-[#b1bad3] px-0.5">Number of Bets</label>
              <div className="h-10 sm:h-11 flex items-center rounded-md bg-[#0f212e] border border-[#2f4553] px-3 focus-within:border-[#1475e1] transition-colors">
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={autoBetsLimit === 0 ? "" : autoBetsLimit}
                  onChange={(e) => setAutoBetsLimit(parseInt(e.target.value) || 0)}
                  className="w-full bg-transparent text-xs font-bold text-white font-mono focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setAutoBetsLimit(0)}
                  title="Infinite Bets"
                  className="px-2 text-sm font-black text-[#1475e1] hover:text-white transition-colors cursor-pointer select-none"
                >
                  ∞
                </button>
              </div>
            </div>

            {/* Advanced Toggle Switch Row */}
            <div className="flex items-center justify-between px-0.5 py-0.5">
              <span className="text-xs text-[#b1bad3]">Advanced</span>
              <button
                type="button"
                onClick={() => setIsAdvancedAuto(!isAdvancedAuto)}
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                  isAdvancedAuto ? "bg-[#1475e1]" : "bg-[#213743]"
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    isAdvancedAuto ? "right-0.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Advanced On Win / On Loss Settings */}
            {isAdvancedAuto && (
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#2f4553]/50">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#87909e] uppercase">On Win</label>
                  <select
                    value={onWinAction}
                    onChange={(e) => setOnWinAction(e.target.value as "reset" | "increase")}
                    className="w-full rounded-md bg-[#0f212e] border border-[#2f4553] p-1.5 text-xs font-bold text-white"
                  >
                    <option value="reset">Reset</option>
                    <option value="increase">Increase %</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#87909e] uppercase">On Loss</label>
                  <select
                    value={onLossAction}
                    onChange={(e) => setOnLossAction(e.target.value as "reset" | "increase")}
                    className="w-full rounded-md bg-[#0f212e] border border-[#2f4553] p-1.5 text-xs font-bold text-white"
                  >
                    <option value="reset">Reset</option>
                    <option value="increase">Increase %</option>
                  </select>
                </div>
              </div>
            )}

            {isAutoRunning && (
              <div className="flex justify-between items-center text-[10px] text-[#87909e] px-1 font-mono">
                <span>Bets Dropped:</span>
                <span className="text-white font-bold">
                  {autoBetsCount} / {autoBetsLimit === 0 ? "∞" : autoBetsLimit}
                </span>
              </div>
            )}
          </div>
        )}

        {/* 5. Mode Selector: Pill toggle Manual / Auto with script icon */}
        <div className="flex items-center gap-1.5 rounded-md bg-[#0f212e] p-1 border border-[#2f4553]">
          <div className="grid grid-cols-2 flex-1">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setMode("manual");
                setIsAutoRunning(false);
              }}
              className={`py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                mode === "manual"
                  ? "bg-[#213743] text-white shadow-sm"
                  : "text-[#87909e] hover:text-white"
              }`}
            >
              Manual
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setMode("auto");
              }}
              className={`py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                mode === "auto"
                  ? "bg-[#213743] text-white shadow-sm"
                  : "text-[#87909e] hover:text-white"
              }`}
            >
              Auto
            </button>
          </div>
          <button
            type="button"
            title="Script / Strategy Mode"
            onClick={() => sounds.playClick()}
            className="px-2 py-1.5 rounded-md bg-[#1a2c38] hover:bg-[#213743] text-[#87909e] hover:text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>A</span>
            <Zap className="w-3.5 h-3.5 text-[#1475e1]" />
          </button>
        </div>

        {/* 6. Bottom Utility Bar (Settings, Stats, Clean Subtle Fairness Pill) */}
        <div className="flex items-center justify-between rounded-md bg-[#0f212e] border border-[#2f4553] px-3 py-1.5 text-xs text-[#87909e] mt-0.5">
          {/* Left: Settings gear & Live Stats chart icons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-1 rounded-md hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors cursor-pointer"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setIsStatsOpen(true)}
              className="p-1 rounded-md hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors cursor-pointer"
              title="Live Stats"
            >
              <BarChart2 className="w-5 h-5" />
            </button>
          </div>

          {/* Right: Clean Subtle Dark-Pill Fairness Button */}
          <button
            type="button"
            onClick={() => setIsFairnessOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#2f4553]/60 hover:bg-[#2f4553] text-[#b1bad3] hover:text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-[#b1bad3]" />
            <span>Fairness</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* PROVABLY FAIR VERIFIER MODAL                              */}
      {/* ========================================================= */}
      {isFairnessOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-[#2f4553] bg-[#1a2c38] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2f4553] pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <ShieldCheck className="w-5 h-5 text-[#b1bad3]" />
                <span>Provably Fair Verification</span>
              </div>
              <button
                onClick={() => setIsFairnessOpen(false)}
                className="p-1 text-[#87909e] hover:text-white rounded-md hover:bg-[#213743]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#b1bad3]">
              <div>
                <label className="text-[11px] font-bold text-white block mb-1">
                  Active Server Seed (Hashed)
                </label>
                <div className="flex items-center justify-between p-2.5 rounded-md bg-[#0f212e] font-mono text-[11px] text-white border border-[#2f4553]">
                  <span className="truncate">{serverSeedHash}</span>
                  <button
                    onClick={() => copyToClipboard(serverSeedHash, "server")}
                    className="p-1 text-[#87909e] hover:text-white"
                  >
                    {copiedField === "server" ? (
                      <Check className="w-3.5 h-3.5 text-[#00e701]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-white block mb-1">Client Seed</label>
                <div className="p-2.5 rounded-md bg-[#0f212e] font-mono text-[11px] text-white border border-[#2f4553]">
                  {clientSeed}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-white block mb-1">Nonce</label>
                <div className="p-2.5 rounded-md bg-[#0f212e] font-mono text-[11px] text-white border border-[#2f4553]">
                  {nonce}
                </div>
              </div>

              <div className="p-2.5 rounded-md bg-[#0f212e] text-[11px] space-y-1 border border-[#2f4553]">
                <div className="font-bold text-white">Dice Formula:</div>
                <div className="font-mono text-[#00e701]">
                  Roll = (Hash(ServerSeed, ClientSeed, Nonce) % 10001) / 100
                </div>
                <div>RTP: 99.00% (1.00% House Edge).</div>
              </div>
            </div>

            <button
              onClick={() => setIsFairnessOpen(false)}
              className="w-full py-2.5 rounded-md bg-[#213743] hover:bg-[#2f4553] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* LIVE STATS MODAL                                          */}
      {/* ========================================================= */}
      {isStatsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-[#2f4553] bg-[#1a2c38] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2f4553] pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <BarChart2 className="w-5 h-5 text-[#1475e1]" />
                <span>Live Dice Statistics</span>
              </div>
              <button
                onClick={() => setIsStatsOpen(false)}
                className="p-1 text-[#87909e] hover:text-white rounded-md hover:bg-[#213743]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-md bg-[#0f212e] border border-[#2f4553] text-center">
                <div className="text-[11px] font-semibold text-[#87909e]">Total Bets</div>
                <div className="text-lg font-black text-white font-mono mt-0.5">
                  {stats.totalBets}
                </div>
              </div>
              <div className="p-3 rounded-md bg-[#0f212e] border border-[#2f4553] text-center">
                <div className="text-[11px] font-semibold text-[#87909e]">Best Roll</div>
                <div className="text-lg font-black text-[#1475e1] font-mono mt-0.5">
                  {stats.bestRoll.toFixed(2)}
                </div>
              </div>
              <div className="p-3 rounded-md bg-[#0f212e] border border-[#2f4553] text-center">
                <div className="text-[11px] font-semibold text-[#87909e]">Total Wagered</div>
                <div className="text-lg font-black text-white font-mono mt-0.5">
                  {activeSym}{stats.totalWagered.toFixed(2)}
                </div>
              </div>
              <div className="p-3 rounded-md bg-[#0f212e] border border-[#2f4553] text-center">
                <div className="text-[11px] font-semibold text-[#87909e]">Net Profit</div>
                <div
                  className={`text-lg font-black font-mono mt-0.5 ${
                    stats.netProfit >= 0 ? "text-[#00e701]" : "text-[#e9113c]"
                  }`}
                >
                  {stats.netProfit >= 0 ? "+" : ""}{activeSym}{stats.netProfit.toFixed(2)}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsStatsOpen(false)}
              className="w-full py-2.5 rounded-md bg-[#213743] hover:bg-[#2f4553] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* GAME SETTINGS MODAL                                       */}
      {/* ========================================================= */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl border border-[#2f4553] bg-[#1a2c38] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2f4553] pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Settings className="w-5 h-5 text-[#87909e]" />
                <span>Dice Settings</span>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 text-[#87909e] hover:text-white rounded-md hover:bg-[#213743]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Sound Toggle */}
              <div className="flex items-center justify-between p-2.5 rounded-md bg-[#0f212e] border border-[#2f4553]">
                <div className="flex items-center gap-2 text-white font-bold">
                  {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-[#00e701]" />}
                  <span>Sound Effects</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !isMuted;
                    setIsMuted(next);
                    sounds.enabled = !next;
                  }}
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                    !isMuted ? "bg-[#1475e1]" : "bg-[#213743]"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                      !isMuted ? "right-0.5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Hotkeys Toggle */}
              <div className="flex items-center justify-between p-2.5 rounded-md bg-[#0f212e] border border-[#2f4553]">
                <div className="flex items-center gap-2 text-white font-bold">
                  <span>Spacebar Hotkey</span>
                </div>
                <button
                  type="button"
                  onClick={() => setHotkeysEnabled(!hotkeysEnabled)}
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                    hotkeysEnabled ? "bg-[#1475e1]" : "bg-[#213743]"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                      hotkeysEnabled ? "right-0.5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsSettingsOpen(false)}
              className="w-full py-2.5 rounded-md bg-[#213743] hover:bg-[#2f4553] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
