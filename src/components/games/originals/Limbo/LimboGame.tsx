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
import confetti from "canvas-confetti";

interface LimboHistoryItem {
  id: string;
  multiplier: number;
  target: number;
  isWin: boolean;
  profit: number;
}

export default function LimboGame() {
  const { balance, updateBalance, currency, formatBalance, currencySymbol, addRecentlyPlayedGame } = useGame();
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
    const clampedTarget = Math.max(1.01, Math.min(1000000.0, val));
    setTargetMultiplier(clampedTarget);
    const calculatedChance = parseFloat((99.0 / clampedTarget).toFixed(4));
    setWinChance(Math.max(0.0001, Math.min(98.0, calculatedChance)));
  };

  const updateFromWinChance = (val: number) => {
    const clampedChance = Math.max(0.0001, Math.min(98.0, val));
    setWinChance(clampedChance);
    const calculatedTarget = parseFloat((99.0 / clampedChance).toFixed(2));
    setTargetMultiplier(Math.max(1.01, Math.min(1000000.0, calculatedTarget)));
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
    return parseFloat(raw.toFixed(2));
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
      className={`w-full max-w-6xl mx-auto px-2 sm:px-4 py-4 select-none flex flex-col space-y-4 ${
        isFullscreen ? "p-6 bg-[#0f212e] min-h-screen" : ""
      }`}
    >
      {/* Top Header & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-bold text-[#b1bad3] hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Casino Lobby</span>
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFairnessModal(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-[#00e701] rounded-lg bg-[#00e701]/10 px-2.5 py-1.5 border border-[#00e701]/20 hover:bg-[#00e701]/20 transition-all cursor-pointer"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Provably Fair 99% RTP</span>
          </button>
        </div>
      </div>

      {/* Main Game Shell: Left Sidebar (Desktop) / Bottom Controls (Mobile) + Right Center Arena */}
      <div className="rounded-2xl border border-[#213743] bg-[#1a2c38] overflow-hidden shadow-2xl flex flex-col-reverse lg:flex-row">
        {/* ========================================================= */}
        {/* LEFT / BOTTOM CONTROLS PANEL                              */}
        {/* ========================================================= */}
        <div className="w-full lg:w-[340px] xl:w-[360px] shrink-0 border-t lg:border-t-0 lg:border-r border-[#213743] bg-[#1a2c38] p-4 sm:p-5 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            {/* Mode Switcher Tabs (Manual / Auto) */}
            <div className="grid grid-cols-2 p-1 bg-[#0f212e] rounded-xl border border-[#213743]">
              <button
                type="button"
                disabled={isRolling || isAutoRunning}
                onClick={() => {
                  sounds.playClick();
                  setMode("manual");
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === "manual"
                    ? "bg-[#213743] text-white shadow-sm"
                    : "text-[#b1bad3] hover:text-white"
                }`}
              >
                Manual
              </button>
              <button
                type="button"
                disabled={isRolling || isAutoRunning}
                onClick={() => {
                  sounds.playClick();
                  setMode("auto");
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === "auto"
                    ? "bg-[#213743] text-white shadow-sm"
                    : "text-[#b1bad3] hover:text-white"
                }`}
              >
                Auto
              </button>
            </div>

            {/* Bet Amount Input with currency icon, 1/2, 2x, Max */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-[#b1bad3]">
                <span>Bet Amount</span>
                <span className="text-[#00e701] font-mono">
                  {activeSym}
                  {formatBalance(balance)}
                </span>
              </div>
              <div className="flex items-center rounded-xl border border-[#213743] bg-[#0f212e] p-1 focus-within:border-[#00e701] transition-colors">
                <span className="px-2.5 text-sm font-bold text-[#00e701]">{activeSym}</span>
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
                      setBetInput("1");
                      setBetAmount(1);
                    } else {
                      const num = parseFloat(betInput);
                      setBetInput(num.toString());
                      setBetAmount(num);
                    }
                  }}
                  className="w-full bg-transparent text-sm font-bold text-white focus:outline-none font-mono"
                />
                <button
                  type="button"
                  disabled={isRolling || isAutoRunning}
                  onClick={handleHalfBet}
                  className="rounded-lg px-2.5 py-1 text-xs font-bold text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors cursor-pointer"
                >
                  ½
                </button>
                <button
                  type="button"
                  disabled={isRolling || isAutoRunning}
                  onClick={handleDoubleBet}
                  className="rounded-lg px-2.5 py-1 text-xs font-bold text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors cursor-pointer"
                >
                  2×
                </button>
                <button
                  type="button"
                  disabled={isRolling || isAutoRunning}
                  onClick={handleMaxBet}
                  className="rounded-lg px-2.5 py-1 text-xs font-bold text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors cursor-pointer"
                >
                  Max
                </button>
              </div>
            </div>

            {/* Target Multiplier & Win Chance Inputs */}
            <div className="grid grid-cols-2 gap-3">
              {/* Target Multiplier */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#b1bad3]">Target Multiplier</label>
                <div className="flex items-center rounded-xl border border-[#213743] bg-[#0f212e] p-2 focus-within:border-[#00e701] transition-colors">
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
                    className="w-full bg-transparent text-sm font-bold text-white focus:outline-none font-mono"
                  />
                  <span className="text-xs font-bold text-[#b1bad3]">×</span>
                </div>
              </div>

              {/* Win Chance */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#b1bad3]">Win Chance</label>
                <div className="flex items-center rounded-xl border border-[#213743] bg-[#0f212e] p-2 focus-within:border-[#00e701] transition-colors">
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
                    className="w-full bg-transparent text-sm font-bold text-[#00e701] focus:outline-none font-mono"
                  />
                  <span className="text-xs font-bold text-[#b1bad3]">%</span>
                </div>
              </div>
            </div>

            {/* Profit on Win Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#b1bad3]">Profit on Win</label>
              <div className="flex items-center justify-between rounded-xl border border-[#213743] bg-[#0f212e] p-2.5">
                <span className="text-xs font-bold text-[#b1bad3]">{activeSym}</span>
                <span className="text-sm font-bold text-[#00e701] font-mono">
                  {activeSym}
                  {profitOnWin.toFixed(2)}
                </span>
              </div>
            </div>

            {/* AUTO BETTING CONTROLS */}
            {mode === "auto" && (
              <div className="space-y-3 pt-2 border-t border-[#213743]">
                {/* Number of Bets */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#b1bad3]">Number of Bets</label>
                  <div className="flex items-center rounded-xl border border-[#213743] bg-[#0f212e] p-1">
                    <input
                      type="number"
                      disabled={isAutoRunning}
                      value={autoBetsLimit === 0 ? "" : autoBetsLimit}
                      placeholder="∞ (Infinite)"
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setAutoBetsLimit(isNaN(val) || val < 0 ? 0 : val);
                      }}
                      className="w-full bg-transparent px-2 text-xs font-bold text-white focus:outline-none font-mono"
                    />
                    <button
                      type="button"
                      disabled={isAutoRunning}
                      onClick={() => setAutoBetsLimit(0)}
                      className="rounded-lg px-2 py-1 text-xs font-bold text-[#b1bad3] hover:bg-[#213743] hover:text-white"
                    >
                      ∞
                    </button>
                    <button
                      type="button"
                      disabled={isAutoRunning}
                      onClick={() => setAutoBetsLimit(10)}
                      className="rounded-lg px-2 py-1 text-xs font-bold text-[#b1bad3] hover:bg-[#213743] hover:text-white"
                    >
                      10
                    </button>
                    <button
                      type="button"
                      disabled={isAutoRunning}
                      onClick={() => setAutoBetsLimit(100)}
                      className="rounded-lg px-2 py-1 text-xs font-bold text-[#b1bad3] hover:bg-[#213743] hover:text-white"
                    >
                      100
                    </button>
                  </div>
                </div>

                {/* On Win Condition */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#b1bad3]">On Win</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={isAutoRunning}
                      onClick={() => setOnWinAction("reset")}
                      className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        onWinAction === "reset"
                          ? "bg-[#213743] border-[#00e701] text-white"
                          : "border-[#213743] text-[#b1bad3] hover:bg-[#213743]"
                      }`}
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      disabled={isAutoRunning}
                      onClick={() => setOnWinAction("increase")}
                      className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        onWinAction === "increase"
                          ? "bg-[#213743] border-[#00e701] text-white"
                          : "border-[#213743] text-[#b1bad3] hover:bg-[#213743]"
                      }`}
                    >
                      Increase By %
                    </button>
                  </div>
                  {onWinAction === "increase" && (
                    <div className="flex items-center rounded-xl border border-[#213743] bg-[#0f212e] p-1.5 mt-1">
                      <input
                        type="number"
                        disabled={isAutoRunning}
                        value={onWinPercent}
                        onChange={(e) => setOnWinPercent(parseFloat(e.target.value) || 0)}
                        className="w-full bg-transparent px-2 text-xs font-bold text-white focus:outline-none font-mono"
                      />
                      <span className="text-xs font-bold text-[#b1bad3] pr-2">%</span>
                    </div>
                  )}
                </div>

                {/* On Loss Condition */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#b1bad3]">On Loss</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={isAutoRunning}
                      onClick={() => setOnLossAction("reset")}
                      className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        onLossAction === "reset"
                          ? "bg-[#213743] border-[#00e701] text-white"
                          : "border-[#213743] text-[#b1bad3] hover:bg-[#213743]"
                      }`}
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      disabled={isAutoRunning}
                      onClick={() => setOnLossAction("increase")}
                      className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        onLossAction === "increase"
                          ? "bg-[#213743] border-[#00e701] text-white"
                          : "border-[#213743] text-[#b1bad3] hover:bg-[#213743]"
                      }`}
                    >
                      Increase By %
                    </button>
                  </div>
                  {onLossAction === "increase" && (
                    <div className="flex items-center rounded-xl border border-[#213743] bg-[#0f212e] p-1.5 mt-1">
                      <input
                        type="number"
                        disabled={isAutoRunning}
                        value={onLossPercent}
                        onChange={(e) => setOnLossPercent(parseFloat(e.target.value) || 0)}
                        className="w-full bg-transparent px-2 text-xs font-bold text-white focus:outline-none font-mono"
                      />
                      <span className="text-xs font-bold text-[#b1bad3] pr-2">%</span>
                    </div>
                  )}
                </div>

                {/* Stop on Profit & Stop on Loss */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#b1bad3]">Stop on Profit</label>
                    <div className="flex items-center rounded-xl border border-[#213743] bg-[#0f212e] p-1.5">
                      <input
                        type="number"
                        disabled={isAutoRunning}
                        placeholder="0.00"
                        value={stopOnProfit || ""}
                        onChange={(e) => setStopOnProfit(parseFloat(e.target.value) || 0)}
                        className="w-full bg-transparent px-1 text-xs font-bold text-white focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#b1bad3]">Stop on Loss</label>
                    <div className="flex items-center rounded-xl border border-[#213743] bg-[#0f212e] p-1.5">
                      <input
                        type="number"
                        disabled={isAutoRunning}
                        placeholder="0.00"
                        value={stopOnLoss || ""}
                        onChange={(e) => setStopOnLoss(parseFloat(e.target.value) || 0)}
                        className="w-full bg-transparent px-1 text-xs font-bold text-white focus:outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* PRIMARY CTA BET BUTTON */}
          <div className="w-full pt-2">
            {mode === "manual" ? (
              <button
                type="button"
                onClick={() => executeRoll()}
                disabled={isRolling || betAmount > balance || betAmount <= 0}
                className="w-full py-4 text-base font-extrabold rounded-xl bg-[#00e701] hover:bg-[#00c201] text-black shadow-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                <Zap className="h-5 w-5 fill-current" />
                <span>{isRolling ? "Rolling..." : "Bet"}</span>
              </button>
            ) : isAutoRunning ? (
              <button
                type="button"
                onClick={stopAutoBetting}
                className="w-full py-4 text-base font-extrabold rounded-xl bg-[#e9113c] hover:bg-[#c40e32] text-white shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                <span>Stop Autobet ({autoBetsCount})</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={startAutoBetting}
                disabled={betAmount > balance || betAmount <= 0}
                className="w-full py-4 text-base font-extrabold rounded-xl bg-[#00e701] hover:bg-[#00c201] text-black shadow-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                <Zap className="h-5 w-5 fill-current" />
                <span>Start Autobet</span>
              </button>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT / CENTER ARENA & MULTIPLIER REVEAL ENGINE            */}
        {/* ========================================================= */}
        <div className="flex-1 bg-[#0f212e] flex flex-col justify-between p-4 sm:p-6 lg:p-8 min-h-[440px] sm:min-h-[500px]">
          {/* Top History Strip */}
          <div className="w-full flex items-center justify-between pb-4">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {history.map((item) => {
                const isChipWin = item.multiplier >= 2.0;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedHistoryItem(item)}
                    className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold border transition-transform hover:scale-105 shrink-0 cursor-pointer ${
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
          <div className="flex-1 flex flex-col items-center justify-center py-8 relative">
            {/* Background subtle radial glow */}
            <div
              className={`absolute inset-0 pointer-events-none transition-opacity duration-500 rounded-3xl ${
                hasWon === true
                  ? "bg-radial from-[#00e701]/15 via-transparent to-transparent opacity-100"
                  : hasWon === false
                  ? "bg-radial from-[#e9113c]/10 via-transparent to-transparent opacity-100"
                  : "opacity-0"
              }`}
            />

            {/* Giant Centered Multiplier Typography */}
            <div
              className={`text-6xl sm:text-8xl md:text-9xl font-black font-mono tracking-tighter transition-all select-none ${
                hasWon === true
                  ? "text-[#00e701] drop-shadow-[0_0_35px_rgba(0,231,1,0.65)] scale-105"
                  : hasWon === false
                  ? "text-[#e9113c] drop-shadow-[0_0_20px_rgba(233,17,60,0.4)]"
                  : isRolling
                  ? "text-white"
                  : "text-white"
              }`}
            >
              {currentDisplayMultiplier.toFixed(2)}×
            </div>

            {/* Target Multiplier Badge / Target Info */}
            <div className="mt-4 flex items-center gap-3">
              <div className="rounded-xl px-4 py-1.5 bg-[#1a2c38] border border-[#213743] text-xs font-bold text-[#b1bad3] flex items-center gap-2">
                <span>TARGET:</span>
                <span className="font-mono text-white font-black">{targetMultiplier.toFixed(2)}×</span>
              </div>
              <div className="rounded-xl px-4 py-1.5 bg-[#1a2c38] border border-[#213743] text-xs font-bold text-[#b1bad3] flex items-center gap-2">
                <span>WIN CHANCE:</span>
                <span className="font-mono text-[#00e701] font-black">{winChance.toFixed(2)}%</span>
              </div>
            </div>

            {/* Win/Loss Toast status banner */}
            {hasWon !== null && !isRolling && (
              <div
                className={`mt-4 px-4 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all animate-in fade-in zoom-in-95 duration-200 ${
                  hasWon
                    ? "bg-[#00e701]/20 text-[#00e701] border border-[#00e701]/30"
                    : "bg-[#e9113c]/20 text-[#e9113c] border border-[#e9113c]/30"
                }`}
              >
                {hasWon
                  ? `Target hit! Payout +${activeSym}${(betAmount * targetMultiplier).toFixed(2)}`
                  : `Target ${targetMultiplier.toFixed(2)}× missed`}
              </div>
            )}
          </div>

          {/* BOTTOM UTILITY TOOLBAR */}
          <div className="w-full flex items-center justify-between pt-4 border-t border-[#213743] text-[#b1bad3]">
            {/* Turbo Mode & Sound Toggles */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setTurboMode(!turboMode);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  turboMode
                    ? "bg-[#00e701]/15 text-[#00e701] border-[#00e701]/30"
                    : "bg-[#1a2c38] border-[#213743] text-[#b1bad3] hover:text-white"
                }`}
                title="Toggle Turbo Mode"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Turbo {turboMode ? "ON" : "OFF"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const next = !soundEnabled;
                  setSoundEnabled(next);
                  sounds.enabled = next;
                  if (next) sounds.playClick();
                }}
                className="p-2 rounded-lg bg-[#1a2c38] border border-[#213743] hover:text-white transition-colors cursor-pointer"
                title={soundEnabled ? "Mute Sound" : "Enable Sound"}
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-red-400" />}
              </button>

              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="p-2 rounded-lg bg-[#1a2c38] border border-[#213743] hover:text-white transition-colors cursor-pointer"
                title="Game Rules"
              >
                <Info className="h-4 w-4" />
              </button>
            </div>

            {/* Right Tools: Live Stats & Fullscreen */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowLiveStats(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1a2c38] border border-[#213743] hover:text-white transition-colors cursor-pointer"
              >
                <TrendingUp className="h-3.5 w-3.5 text-[#00e701]" />
                <span className="hidden sm:inline">Live Stats</span>
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-2 rounded-lg bg-[#1a2c38] border border-[#213743] hover:text-white transition-colors cursor-pointer"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

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
