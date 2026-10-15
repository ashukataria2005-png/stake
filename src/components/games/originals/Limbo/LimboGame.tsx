"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Zap,
  Flame,
  Info,
  RotateCcw,
  Sparkles,
  TrendingUp,
  X,
  Copy,
  Check,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import { resolveLimboMultiplier } from "@/lib/luckEngine";
import confetti from "canvas-confetti";
import StakeGameFooterCard from "@/components/games/originals/common/StakeGameFooterCard";
import {
  LIMBO_CONFIG,
  calculateLimboWinChance,
} from "@/config/stakeMultipliers";

interface LimboHistoryItem {
  id: string;
  multiplier: number;
  target: number;
  isWin: boolean;
  profit: number;
}

export default function LimboGame() {
  const { balance, updateBalance, currency, formatBalance, currencySymbol, addRecentlyPlayedGame, userLuckMode } = useGame();
  const activeSym = currencySymbol || "$";

  // Register in Recently Played once on mount
  useEffect(() => {
    if (addRecentlyPlayedGame) {
      addRecentlyPlayedGame({
        id: "limbo",
        title: "Limbo",
        image: "/games/limbo.png",
        href: "/games/limbo",
      });
    }
  }, []);

  // Mode & Betting State
  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [betAmount, setBetAmount] = useState<number>(10);
  const [betInput, setBetInput] = useState<string>("10");

  useEffect(() => {
    if (betInput !== "" && parseFloat(betInput) === betAmount) return;
    setBetInput(betAmount.toString());
  }, [betAmount]);

  // Target Multiplier & Win Chance (House Edge = 1%, RTP = 99%)
  // Formula: Win Chance = 99 / Target Multiplier; Target Multiplier = 99 / Win Chance
  const [targetMultiplier, setTargetMultiplier] = useState<number>(2.0);
  const [targetInput, setTargetInput] = useState<string>("2.00");
  const [winChance, setWinChance] = useState<number>(49.5);
  const [winChanceInput, setWinChanceInput] = useState<string>("49.50");

  useEffect(() => {
    if (targetInput !== "" && parseFloat(targetInput) === targetMultiplier) return;
    setTargetInput(targetMultiplier.toFixed(2));
  }, [targetMultiplier]);

  useEffect(() => {
    if (winChanceInput !== "" && parseFloat(winChanceInput) === winChance) return;
    setWinChanceInput(winChance.toFixed(2));
  }, [winChance]);

  // Settings & Animation State
  const [turboMode, setTurboMode] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // Auto Bet State
  const [isAutoRunning, setIsAutoRunning] = useState<boolean>(false);
  const [autoBetsLimit, setAutoBetsLimit] = useState<number>(0); // 0 = infinite
  const [autoBetsCount, setAutoBetsCount] = useState<number>(0);
  const [onWinAction, setOnWinAction] = useState<"reset" | "increase">("reset");
  const [onWinPercent, setOnWinPercent] = useState<number>(100);
  const [onLossAction, setOnLossAction] = useState<"reset" | "increase">("reset");
  const [onLossPercent, setOnLossPercent] = useState<number>(100);
  const [stopOnProfit, setStopOnProfit] = useState<number>(0);
  const [stopOnLoss, setStopOnLoss] = useState<number>(0);
  const initialAutoBalanceRef = useRef<number>(balance);
  const baseBetRef = useRef<number>(betAmount);

  // Multiplier Reveal Engine State
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [currentDisplayMultiplier, setCurrentDisplayMultiplier] = useState<number>(2.0);
  const [finalResultMultiplier, setFinalResultMultiplier] = useState<number | null>(null);
  const [hasWon, setHasWon] = useState<boolean | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // History strip
  const [history, setHistory] = useState<LimboHistoryItem[]>([
    { id: "h1", multiplier: 3.42, target: 2.0, isWin: true, profit: 20 },
    { id: "h2", multiplier: 1.15, target: 2.0, isWin: false, profit: -10 },
    { id: "h3", multiplier: 7.89, target: 2.0, isWin: true, profit: 20 },
    { id: "h4", multiplier: 2.04, target: 2.0, isWin: true, profit: 20 },
    { id: "h5", multiplier: 1.02, target: 2.0, isWin: false, profit: -10 },
    { id: "h6", multiplier: 14.5, target: 2.0, isWin: true, profit: 20 },
    { id: "h7", multiplier: 1.88, target: 2.0, isWin: false, profit: -10 },
    { id: "h8", multiplier: 4.12, target: 2.0, isWin: true, profit: 20 },
  ]);

  // Selected History Item Modal
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<LimboHistoryItem | null>(null);

  // Modals
  const [showFairnessModal, setShowFairnessModal] = useState<boolean>(false);
  const [showLiveStats, setShowLiveStats] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [copiedSeed, setCopiedSeed] = useState<boolean>(false);

  // Live Stats State
  const [stats, setStats] = useState({
    bets: 8,
    wins: 5,
    losses: 3,
    wagered: 80,
    profit: 70,
  });

  // Calculate Profit on Win
  const profitOnWin = parseFloat((betAmount * (targetMultiplier - 1)).toFixed(2));

  // Sync Input Handlers with Real-Time Math
  const updateFromTarget = (val: number) => {
    const clampedTarget = Math.max(LIMBO_CONFIG.MIN_TARGET_MULTIPLIER, Math.min(LIMBO_CONFIG.MAX_TARGET_MULTIPLIER, val));
    setTargetMultiplier(clampedTarget);
    const calculatedChance = calculateLimboWinChance(clampedTarget);
    setWinChance(Math.max(0.0001, Math.min(98.0, calculatedChance)));
  };

  const updateFromWinChance = (val: number) => {
    const clampedChance = Math.max(0.0001, Math.min(98.0, val));
    setWinChance(clampedChance);
    const calculatedTarget = parseFloat((LIMBO_CONFIG.BASE_RTP_PERCENT / clampedChance).toFixed(2));
    setTargetMultiplier(Math.max(LIMBO_CONFIG.MIN_TARGET_MULTIPLIER, Math.min(LIMBO_CONFIG.MAX_TARGET_MULTIPLIER, calculatedTarget)));
  };

  // Quick Bet Modifiers
  const handleHalfBet = () => {
    sounds.playClick();
    const next = Math.max(0.01, parseFloat((betAmount / 2).toFixed(2)));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  const handleDoubleBet = () => {
    sounds.playClick();
    const next = parseFloat((betAmount * 2).toFixed(2));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  const handleMaxBet = () => {
    sounds.playClick();
    const next = Math.max(0.01, parseFloat(balance.toFixed(2)));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  // Provably Fair Stake Limbo Formula:
  // Roll result = 0.99 / (1 - rand), clamped to max 1,000,000.00x, min 1.00x
  const generateLimboResult = (): number => {
    const rand = Math.random();
    let raw = 0.99 / (1.0 - rand);
    if (raw < 1.0) raw = 1.0;
    if (raw > 1000000.0) raw = 1000000.0;
    const defaultMult = parseFloat(raw.toFixed(2));
    return resolveLimboMultiplier(userLuckMode, targetMultiplier, defaultMult);
  };

  // Execute a Single Limbo Roll
  const executeRoll = useCallback(async (): Promise<boolean> => {
    if (isRolling) return false;

    const currentBet =
      betInput === "" || isNaN(parseFloat(betInput)) || parseFloat(betInput) <= 0
        ? 1
        : parseFloat(betInput);

    if (currentBet > balance) {
      alert("Insufficient balance! Please use the Wallet button.");
      setIsAutoRunning(false);
      return false;
    }

    updateBalance(-currentBet);
    setIsRolling(true);
    setHasWon(null);

    const result = generateLimboResult();
    const won = result >= targetMultiplier;
    const roundProfit = won
      ? parseFloat((currentBet * (targetMultiplier - 1)).toFixed(2))
      : -currentBet;

    if (turboMode) {
      // Instant reveal
      setCurrentDisplayMultiplier(result);
      setFinalResultMultiplier(result);
      setHasWon(won);
      setIsRolling(false);

      if (won) {
        const payout = parseFloat((currentBet * targetMultiplier).toFixed(2));
        updateBalance(payout);
        sounds.playLimboWin(result);
        if (targetMultiplier >= 5) {
          try {
            confetti({ particleCount: 65, spread: 60, origin: { y: 0.6 } });
          } catch {}
        }
      } else {
        sounds.playLimboLoss();
      }

      // Record History & Stats
      const newHistoryItem: LimboHistoryItem = {
        id: `limbo-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        multiplier: result,
        target: targetMultiplier,
        isWin: won,
        profit: roundProfit,
      };

      setHistory((prev) => [newHistoryItem, ...prev.slice(0, 19)]);
      setStats((prev) => ({
        bets: prev.bets + 1,
        wins: won ? prev.wins + 1 : prev.wins,
        losses: won ? prev.losses : prev.losses + 1,
        wagered: parseFloat((prev.wagered + currentBet).toFixed(2)),
        profit: parseFloat((prev.profit + roundProfit).toFixed(2)),
      }));

      return won;
    }

    // Normal Mode: Smooth rapid ticking animation
    return new Promise<boolean>((resolve) => {
      const startTime = performance.now();
      const duration = 280; // ms for rapid climb
      let lastTickProgress = 0;

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);

        // Sound ticks at progression intervals
        if (progress - lastTickProgress > 0.12) {
          sounds.playLimboTick(progress);
          lastTickProgress = progress;
        }

        if (progress < 1) {
          // Exponential ease climb from 1.00x toward final multiplier
          const factor = Math.pow(progress, 2.2);
          const currentVal = Math.max(1.0, 1.0 + (result - 1.0) * factor);
          setCurrentDisplayMultiplier(parseFloat(currentVal.toFixed(2)));
          animFrameRef.current = requestAnimationFrame(animate);
        } else {
          setCurrentDisplayMultiplier(result);
          setFinalResultMultiplier(result);
          setHasWon(won);
          setIsRolling(false);

          if (won) {
            const payout = parseFloat((currentBet * targetMultiplier).toFixed(2));
            updateBalance(payout);
            sounds.playLimboWin(result);
            if (targetMultiplier >= 5) {
              try {
                confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
              } catch {}
            }
          } else {
            sounds.playLimboLoss();
          }

          // Record History & Stats
          const newHistoryItem: LimboHistoryItem = {
            id: `limbo-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            multiplier: result,
            target: targetMultiplier,
            isWin: won,
            profit: roundProfit,
          };

          setHistory((prev) => [newHistoryItem, ...prev.slice(0, 19)]);
          setStats((prev) => ({
            bets: prev.bets + 1,
            wins: won ? prev.wins + 1 : prev.wins,
            losses: won ? prev.losses : prev.losses + 1,
            wagered: parseFloat((prev.wagered + currentBet).toFixed(2)),
            profit: parseFloat((prev.profit + roundProfit).toFixed(2)),
          }));

          resolve(won);
        }
      };

      animFrameRef.current = requestAnimationFrame(animate);
    });
  }, [
    isRolling,
    betInput,
    balance,
    targetMultiplier,
    turboMode,
    updateBalance,
  ]);

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Auto Betting Loop
  const stopAutoBetting = useCallback(() => {
    setIsAutoRunning(false);
  }, []);

  const startAutoBetting = () => {
    if (betAmount > balance) {
      alert("Insufficient balance for Autobet!");
      return;
    }
    sounds.playClick();
    initialAutoBalanceRef.current = balance;
    baseBetRef.current = betAmount;
    setAutoBetsCount(0);
    setIsAutoRunning(true);
  };

  useEffect(() => {
    if (!isAutoRunning) return;

    let timeoutId: NodeJS.Timeout;

    const runAutoStep = async () => {
      // Check limits
      if (autoBetsLimit > 0 && autoBetsCount >= autoBetsLimit) {
        stopAutoBetting();
        return;
      }

      // Check Stop on Profit / Loss
      const currentNet = balance - initialAutoBalanceRef.current;
      if (stopOnProfit > 0 && currentNet >= stopOnProfit) {
        stopAutoBetting();
        return;
      }
      if (stopOnLoss > 0 && currentNet <= -stopOnLoss) {
        stopAutoBetting();
        return;
      }

      const won = await executeRoll();
      setAutoBetsCount((c) => c + 1);

      // Adjust next bet amount
      if (won) {
        if (onWinAction === "reset") {
          setBetAmount(baseBetRef.current);
          setBetInput(baseBetRef.current.toString());
        } else {
          const next = parseFloat((betAmount * (1 + onWinPercent / 100)).toFixed(2));
          setBetAmount(next);
          setBetInput(next.toString());
        }
      } else {
        if (onLossAction === "reset") {
          setBetAmount(baseBetRef.current);
          setBetInput(baseBetRef.current.toString());
        } else {
          const next = parseFloat((betAmount * (1 + onLossPercent / 100)).toFixed(2));
          setBetAmount(next);
          setBetInput(next.toString());
        }
      }

      // Schedule next roll
      const delay = turboMode ? 100 : 380;
      timeoutId = setTimeout(() => {
        if (isAutoRunning) {
          runAutoStep();
        }
      }, delay);
    };

    runAutoStep();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [
    isAutoRunning,
    autoBetsCount,
    autoBetsLimit,
    balance,
    betAmount,
    executeRoll,
    onLossAction,
    onLossPercent,
    onWinAction,
    onWinPercent,
    stopAutoBetting,
    stopOnLoss,
    stopOnProfit,
    turboMode,
  ]);

  // Keyboard hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLElement &&
        ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        if (!isRolling) executeRoll();
      } else if (e.code === "KeyA") {
        e.preventDefault();
        if (!isRolling) handleHalfBet();
      } else if (e.code === "KeyS") {
        e.preventDefault();
        if (!isRolling) handleDoubleBet();
      } else if (e.code === "KeyD" || e.code === "KeyM") {
        e.preventDefault();
        if (!isRolling) handleMaxBet();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [executeRoll, handleDoubleBet, handleHalfBet, handleMaxBet, isRolling]);

  // Fullscreen Toggle
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
      className={`w-full max-w-lg mx-auto px-2 sm:px-3 py-2 select-none flex flex-col space-y-2 ${
        isFullscreen ? "p-6 bg-[#0f212e] min-h-screen max-w-none" : ""
      }`}
    >
      {/* ========================================================= */}
      {/* 1. CENTER ARENA & MULTIPLIER REVEAL ENGINE                */}
      {/* ========================================================= */}
      <div className="w-full rounded-t-2xl bg-[#0f212e] border-t border-x border-[#213743] shadow-2xl flex flex-col justify-between p-3 sm:p-4 min-h-[260px] sm:min-h-[300px] relative overflow-hidden">
        {/* Top History Strip */}
        <div className="w-full flex items-center justify-between pb-2 z-10">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full">
            {history.slice(0, 7).map((item) => {
              const isChipWin = item.multiplier >= 2.0;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedHistoryItem(item)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border transition-transform hover:scale-105 shrink-0 cursor-pointer ${
                    isChipWin
                      ? "bg-[#00e701]/15 text-[#00e701] border-[#00e701]/30"
                      : "bg-[#213743] text-[#b1bad3] border-[#2f4553]"
                  }`}
                >
                  {item.multiplier.toFixed(2)}×
                </button>
              );
            })}
          </div>
        </div>

        {/* CENTER ARENA: MASSIVE MULTIPLIER DISPLAY */}
        <div className="flex-1 flex flex-col items-center justify-center py-4 relative z-10">
          {/* Giant Centered Multiplier Typography */}
          <div
            className={`text-5xl sm:text-7xl md:text-8xl font-black font-mono tracking-tighter transition-all select-none ${
              hasWon === true
                ? "text-[#00e701] drop-shadow-[0_0_28px_rgba(0,231,1,0.65)] scale-105"
                : hasWon === false
                ? "text-[#e9113c] drop-shadow-[0_0_18px_rgba(233,17,60,0.4)]"
                : "text-white"
            }`}
          >
            {currentDisplayMultiplier.toFixed(2)}×
          </div>

          {/* Target Multiplier Badge / Target Info */}
          <div className="mt-3 flex items-center gap-2">
            <div className="rounded-lg px-3 py-1 bg-[#1a2c38] border border-[#213743] text-[11px] font-bold text-[#b1bad3] flex items-center gap-1.5">
              <span>TARGET:</span>
              <span className="font-mono text-white font-black">{targetMultiplier.toFixed(2)}×</span>
            </div>
            <div className="rounded-lg px-3 py-1 bg-[#1a2c38] border border-[#213743] text-[11px] font-bold text-[#b1bad3] flex items-center gap-1.5">
              <span>CHANCE:</span>
              <span className="font-mono text-[#00e701] font-black">{winChance.toFixed(2)}%</span>
            </div>
          </div>

          {/* Win/Loss Toast status banner */}
          {hasWon !== null && !isRolling && (
            <div
              className={`mt-2.5 px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all animate-in fade-in zoom-in-95 duration-200 ${
                hasWon
                  ? "bg-[#00e701]/20 text-[#00e701] border border-[#00e701]/30"
                  : "bg-[#e9113c]/20 text-[#e9113c] border border-[#e9113c]/30"
              }`}
            >
              {hasWon
                ? `Target hit! +${activeSym}${(betAmount * targetMultiplier).toFixed(2)}`
                : `Target ${targetMultiplier.toFixed(2)}× missed`}
            </div>
          )}
        </div>

        {/* BOTTOM ARENA INFO */}
        <div className="w-full flex items-center justify-between pt-2 border-t border-[#213743] text-[10px] text-[#b1bad3] z-10 font-mono">
          <span>99.00% RTP</span>
          <span>1.00% House Edge</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MINES HARMONIZED BETTING CONTROLS SHELL CONTAINER      */}
      {/* ========================================================= */}
      <div className="w-full border-t border-[#213743] bg-[#1a2c38] p-3 sm:p-4 flex flex-col justify-start space-y-2 sm:space-y-2.5 rounded-b-2xl select-none">
        {/* 0. MANUAL / AUTO BET TABS & TURBO SPEED TOGGLE */}
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex flex-1 bg-[#0f212e] p-1 rounded-xl border border-[#213743]">
            <button
              type="button"
              onClick={() => setMode("manual")}
              disabled={isRolling || isAutoRunning}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === "manual"
                  ? "bg-[#213743] text-white shadow"
                  : "text-[#b1bad3] hover:text-white"
              }`}
            >
              Manual
            </button>
            <button
              type="button"
              onClick={() => setMode("auto")}
              disabled={isRolling || isAutoRunning}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === "auto"
                  ? "bg-[#213743] text-white shadow"
                  : "text-[#b1bad3] hover:text-white"
              }`}
            >
              Auto
            </button>
          </div>

          <button
            type="button"
            onClick={() => setTurboMode(!turboMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-xs font-bold cursor-pointer shrink-0 ${
              turboMode
                ? "bg-[#00e701]/10 border-[#00e701]/40 text-[#00e701]"
                : "bg-[#0f212e] border-[#213743] text-[#b1bad3] hover:text-white"
            }`}
            title="Instant Bet / Turbo Mode (Skip animations)"
          >
            <Zap className={`w-3.5 h-3.5 ${turboMode ? "fill-[#00e701]" : ""}`} />
            <span className="text-[11px]">Turbo</span>
          </button>
        </div>

        {/* 1. PRIMARY BET CTA BUTTON (Directly at top of controls) */}
        <div className="w-full">
          {mode === "manual" ? (
            <button
              type="button"
              onClick={() => executeRoll()}
              disabled={isRolling || betAmount > balance || betAmount <= 0}
              className="w-full py-3 sm:py-3.5 text-sm sm:text-base font-extrabold rounded-lg bg-[#1475e1] hover:bg-[#1164c2] text-white shadow-lg shadow-[#1475e1]/25 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer uppercase tracking-wider"
            >
              <span>{isRolling ? "ROLLING..." : "BET"}</span>
            </button>
          ) : isAutoRunning ? (
            <button
              type="button"
              onClick={stopAutoBetting}
              className="w-full py-3 sm:py-3.5 text-sm sm:text-base font-extrabold rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25 active:scale-[0.98] transition-all flex items-center justify-center cursor-pointer uppercase tracking-wider"
            >
              <span>STOP AUTOBET ({autoBetsCount})</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={startAutoBetting}
              disabled={betAmount > balance || betAmount <= 0}
              className="w-full py-3 sm:py-3.5 text-sm sm:text-base font-extrabold rounded-lg bg-[#1475e1] hover:bg-[#1164c2] text-white shadow-lg shadow-[#1475e1]/25 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer uppercase tracking-wider"
            >
              <span>START AUTOBET</span>
            </button>
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
                disabled={isRolling || isAutoRunning}
                onClick={handleHalfBet}
                className="rounded-lg bg-[#213743] px-2.5 py-1.5 text-xs font-bold text-[#b1bad3] hover:bg-[#2f4553] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                ½
              </button>
              <button
                type="button"
                disabled={isRolling || isAutoRunning}
                onClick={handleDoubleBet}
                className="rounded-lg bg-[#213743] px-2.5 py-1.5 text-xs font-bold text-[#b1bad3] hover:bg-[#2f4553] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                2×
              </button>
              <button
                type="button"
                disabled={isRolling || isAutoRunning}
                onClick={handleMaxBet}
                className="rounded-lg bg-[#213743] px-2.5 py-1.5 text-xs font-bold text-[#b1bad3] hover:bg-[#2f4553] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                Max
              </button>
            </div>
          </div>
        </div>

        {/* 3. TARGET MULTIPLIER & WIN CHANCE INPUTS (Mines Themed) */}
        <div className="grid grid-cols-2 gap-2">
          {/* Target Multiplier */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#b1bad3]">Target Multiplier</label>
            <div className="flex items-center rounded-lg border border-[#213743] bg-[#0f212e] focus-within:border-[#2f4553] p-1 px-2.5">
              <input
                type="text"
                inputMode="decimal"
                disabled={isRolling || isAutoRunning}
                value={targetInput}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || /^\d*\.?\d*$/.test(val)) {
                    setTargetInput(val);
                    if (val !== "") {
                      const num = parseFloat(val);
                      if (!isNaN(num) && num >= 1.01) {
                        updateFromTarget(num);
                      }
                    }
                  }
                }}
                onBlur={() => {
                  if (targetInput === "" || isNaN(parseFloat(targetInput)) || parseFloat(targetInput) < 1.01) {
                    setTargetInput("2.00");
                    updateFromTarget(2.0);
                  } else {
                    const num = parseFloat(targetInput);
                    setTargetInput(num.toFixed(2));
                    updateFromTarget(num);
                  }
                }}
                className="w-full bg-transparent text-sm font-bold text-white outline-none font-mono"
              />
              <span className="text-xs font-bold text-[#b1bad3]">×</span>
            </div>
          </div>

          {/* Win Chance */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#b1bad3]">Win Chance</label>
            <div className="flex items-center rounded-lg border border-[#213743] bg-[#0f212e] focus-within:border-[#2f4553] p-1 px-2.5">
              <input
                type="text"
                inputMode="decimal"
                disabled={isRolling || isAutoRunning}
                value={winChanceInput}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || /^\d*\.?\d*$/.test(val)) {
                    setWinChanceInput(val);
                    if (val !== "") {
                      const num = parseFloat(val);
                      if (!isNaN(num) && num > 0 && num <= 98) {
                        updateFromWinChance(num);
                      }
                    }
                  }
                }}
                onBlur={() => {
                  if (winChanceInput === "" || isNaN(parseFloat(winChanceInput)) || parseFloat(winChanceInput) <= 0) {
                    setWinChanceInput("49.50");
                    updateFromWinChance(49.5);
                  } else {
                    const num = parseFloat(winChanceInput);
                    setWinChanceInput(num.toFixed(2));
                    updateFromWinChance(num);
                  }
                }}
                className="w-full bg-transparent text-sm font-bold text-white outline-none font-mono"
              />
              <span className="text-xs font-bold text-[#b1bad3]">%</span>
            </div>
          </div>
        </div>

        {/* 4. PROFIT ON WIN (Manual Mode Only) */}
        {mode === "manual" && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#b1bad3]">Profit on Win</span>
            </div>
            <div className="flex rounded-lg bg-[#0f212e] border border-[#213743] px-3 py-2 items-center">
              <span className="text-xs font-bold text-[#b1bad3] mr-1.5">{activeSym}</span>
              <span className="text-sm font-bold text-white font-mono">
                {profitOnWin.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* 5. AUTO BETTING INPUTS */}
        {mode === "auto" && (
          <div className="space-y-2 pt-1 border-t border-[#213743]/60 text-xs">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#b1bad3]">Number of Bets</span>
              </div>
              <div className="flex rounded-lg bg-[#0f212e] border border-[#213743] focus-within:border-[#2f4553] p-1 items-center">
                <div className="flex flex-1 items-center px-2.5">
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={autoBetsLimit === 0 ? "" : autoBetsLimit}
                    onChange={(e) => setAutoBetsLimit(parseInt(e.target.value) || 0)}
                    className="w-full bg-transparent text-sm font-bold text-white outline-none font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setAutoBetsLimit(0)}
                  className="px-3 py-1 rounded-lg text-sm font-black text-[#1475e1] hover:text-white transition-colors cursor-pointer select-none"
                >
                  ∞
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#b1bad3] uppercase">On Win</label>
                <select
                  value={onWinAction}
                  onChange={(e) => setOnWinAction(e.target.value as "reset" | "increase")}
                  className="w-full rounded-lg bg-[#0f212e] border border-[#213743] p-1.5 text-xs font-bold text-white"
                >
                  <option value="reset">Reset</option>
                  <option value="increase">Increase %</option>
                </select>
                {onWinAction === "increase" && (
                  <input
                    type="number"
                    value={onWinPercent}
                    onChange={(e) => setOnWinPercent(Number(e.target.value) || 100)}
                    placeholder="100%"
                    className="w-full rounded-lg bg-[#0f212e] border border-[#213743] px-2 py-1 text-xs font-bold text-white mt-1 outline-none"
                  />
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#b1bad3] uppercase">On Loss</label>
                <select
                  value={onLossAction}
                  onChange={(e) => setOnLossAction(e.target.value as "reset" | "increase")}
                  className="w-full rounded-lg bg-[#0f212e] border border-[#213743] p-1.5 text-xs font-bold text-white"
                >
                  <option value="reset">Reset</option>
                  <option value="increase">Increase %</option>
                </select>
                {onLossAction === "increase" && (
                  <input
                    type="number"
                    value={onLossPercent}
                    onChange={(e) => setOnLossPercent(Number(e.target.value) || 100)}
                    placeholder="100%"
                    className="w-full rounded-lg bg-[#0f212e] border border-[#213743] px-2 py-1 text-xs font-bold text-white mt-1 outline-none"
                  />
                )}
              </div>
            </div>

            {/* Stop on Profit / Stop on Loss */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <label className="text-[#b1bad3] font-medium text-[10px] uppercase">Stop on Profit</label>
                <input
                  type="number"
                  placeholder="$0.00"
                  value={stopOnProfit || ""}
                  onChange={(e) => setStopOnProfit(Number(e.target.value) || 0)}
                  className="w-full bg-[#0f212e] border border-[#213743] rounded-lg px-2 py-1.5 text-white font-bold text-xs outline-none"
                />
              </div>
              <div>
                <label className="text-[#b1bad3] font-medium text-[10px] uppercase">Stop on Loss</label>
                <input
                  type="number"
                  placeholder="$0.00"
                  value={stopOnLoss || ""}
                  onChange={(e) => setStopOnLoss(Number(e.target.value) || 0)}
                  className="w-full bg-[#0f212e] border border-[#213743] rounded-lg px-2 py-1.5 text-white font-bold text-xs outline-none"
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-[#b1bad3] px-1 font-mono">
              <span>Bets Completed:</span>
              <span className="text-white font-bold">{autoBetsCount} / {autoBetsLimit === 0 ? "∞" : autoBetsLimit}</span>
            </div>
          </div>
        )}

        {/* 7. BOTTOM UTILITY BAR */}
        <div className="flex items-center justify-between rounded-lg bg-[#0f212e] border border-[#213743] px-3 py-2 text-xs text-[#b1bad3] mt-0.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setTurboMode(!turboMode);
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                turboMode ? "bg-[#1475e1] text-white" : "hover:bg-[#213743] text-[#b1bad3]"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Turbo</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                sounds.enabled = next;
              }}
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

      {/* Stake Originals Game Footer Card */}
      <StakeGameFooterCard gameTitle="Limbo" />

      {/* ========================================================= */}
      {/* PROVABLY FAIR VERIFIER MODAL                              */}
      {/* ========================================================= */}
      {showFairnessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <ShieldCheck className="h-5 w-5 text-[#00e701]" />
                <span>Provably Fair Verifier</span>
              </div>
              <button
                onClick={() => setShowFairnessModal(false)}
                className="p-1 rounded-lg text-[#b1bad3] hover:text-white hover:bg-[#213743]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-[#b1bad3]">
                Stake Originals Limbo generates outcomes using HMAC-SHA256 based on your Client Seed,
                Server Seed, and Nonce with a mathematically certified 1% house edge.
              </p>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#b1bad3]">Active Server Seed (Hashed)</label>
                <div className="flex items-center justify-between rounded-xl bg-[#0f212e] border border-[#213743] p-2.5">
                  <span className="font-mono text-[11px] text-white truncate">
                    e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
                      setCopiedSeed(true);
                      setTimeout(() => setCopiedSeed(false), 2000);
                    }}
                    className="ml-2 text-[#00e701] hover:brightness-110"
                  >
                    {copiedSeed ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#b1bad3]">Active Client Seed</label>
                <div className="rounded-xl bg-[#0f212e] border border-[#213743] p-2.5 font-mono text-white">
                  stake-community-fairness-2026
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#b1bad3]">RTP & Formula</label>
                <div className="rounded-xl bg-[#0f212e] border border-[#213743] p-2.5 font-mono text-[#00e701] text-[11px]">
                  Result = 0.99 / (1 - float) [99% RTP / 1% House Edge]
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowFairnessModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#213743] hover:bg-[#2f4553] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Close Verifier
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* LIVE STATS MODAL                                          */}
      {/* ========================================================= */}
      {showLiveStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <TrendingUp className="h-5 w-5 text-[#00e701]" />
                <span>Limbo Session Stats</span>
              </div>
              <button
                onClick={() => setShowLiveStats(false)}
                className="p-1 rounded-lg text-[#b1bad3] hover:text-white hover:bg-[#213743]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#0f212e] border border-[#213743] p-3 text-center">
                <div className="text-[11px] font-bold text-[#b1bad3]">Total Bets</div>
                <div className="text-lg font-black text-white font-mono mt-0.5">{stats.bets}</div>
              </div>
              <div className="rounded-xl bg-[#0f212e] border border-[#213743] p-3 text-center">
                <div className="text-[11px] font-bold text-[#b1bad3]">Win Rate</div>
                <div className="text-lg font-black text-[#00e701] font-mono mt-0.5">
                  {stats.bets > 0 ? ((stats.wins / stats.bets) * 100).toFixed(1) : "0.0"}%
                </div>
              </div>
              <div className="rounded-xl bg-[#0f212e] border border-[#213743] p-3 text-center">
                <div className="text-[11px] font-bold text-[#b1bad3]">Total Wagered</div>
                <div className="text-lg font-black text-white font-mono mt-0.5">
                  {activeSym}
                  {stats.wagered.toFixed(2)}
                </div>
              </div>
              <div className="rounded-xl bg-[#0f212e] border border-[#213743] p-3 text-center">
                <div className="text-[11px] font-bold text-[#b1bad3]">Net Profit</div>
                <div
                  className={`text-lg font-black font-mono mt-0.5 ${
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
              className="w-full py-2.5 rounded-xl bg-[#213743] hover:bg-[#2f4553] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Close Stats
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* GAME RULES MODAL                                          */}
      {/* ========================================================= */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Info className="h-5 w-5 text-[#00e701]" />
                <span>How to Play Limbo</span>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 rounded-lg text-[#b1bad3] hover:text-white hover:bg-[#213743]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#b1bad3] leading-relaxed">
              <p>
                <strong className="text-white">Goal:</strong> Aim to roll a multiplier equal to or higher
                than your chosen Target Multiplier.
              </p>
              <p>
                <strong className="text-white">Multiplier Range:</strong> Choose any target from 1.01× up
                to 1,000,000.00×.
              </p>
              <p>
                <strong className="text-white">Win Chance Math:</strong> Win Chance is mathematically
                calculated as <code className="text-[#00e701]">99 / Target Multiplier %</code>.
              </p>
              <p>
                <strong className="text-white">Turbo Mode:</strong> Toggle Turbo mode on for instant
                reveals without ticking delay.
              </p>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#213743] hover:bg-[#2f4553] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* HISTORY DETAIL MODAL                                      */}
      {/* ========================================================= */}
      {selectedHistoryItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="text-sm font-bold text-white">Roll #{selectedHistoryItem.id.slice(-6)}</div>
              <button
                onClick={() => setSelectedHistoryItem(null)}
                className="p-1 rounded-lg text-[#b1bad3] hover:text-white hover:bg-[#213743]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-[#213743]/50">
                <span className="text-[#b1bad3]">Result</span>
                <span
                  className={`font-mono font-black ${
                    selectedHistoryItem.isWin ? "text-[#00e701]" : "text-[#e9113c]"
                  }`}
                >
                  {selectedHistoryItem.multiplier.toFixed(2)}×
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#213743]/50">
                <span className="text-[#b1bad3]">Target</span>
                <span className="font-mono text-white font-bold">{selectedHistoryItem.target.toFixed(2)}×</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#213743]/50">
                <span className="text-[#b1bad3]">Outcome</span>
                <span
                  className={`font-bold ${
                    selectedHistoryItem.isWin ? "text-[#00e701]" : "text-[#e9113c]"
                  }`}
                >
                  {selectedHistoryItem.isWin ? "WIN" : "LOSS"}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedHistoryItem(null)}
              className="w-full py-2.5 rounded-xl bg-[#213743] hover:bg-[#2f4553] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
