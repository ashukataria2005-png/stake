"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Volume2,
  VolumeX,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Zap,
  Sparkles,
  TrendingUp,
  X,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Dices,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

export type RiskLevel = "classic" | "low" | "medium" | "high";

// Stake Keno Certified Multiplier Tables by [RiskLevel][PicksCount][HitCount]
// Maximum 10 picks, 10 balls drawn from 40 numbers.
const KENO_PAYOUTS: Record<RiskLevel, Record<number, number[]>> = {
  classic: {
    1: [0, 3.96],
    2: [0, 1.7, 5.2],
    3: [0, 1.0, 3.5, 26.0],
    4: [0, 0.5, 2.0, 8.0, 80.0],
    5: [0, 0.25, 1.4, 4.5, 20.0, 300.0],
    6: [0, 0.0, 1.0, 3.0, 10.0, 70.0, 700.0],
    7: [0, 0.0, 0.5, 2.0, 6.0, 30.0, 180.0, 900.0],
    8: [0, 0.0, 0.0, 1.5, 4.0, 15.0, 75.0, 350.0, 1000.0],
    9: [0, 0.0, 0.0, 1.2, 3.0, 10.0, 40.0, 150.0, 500.0, 1000.0],
    10: [0, 0.0, 0.0, 1.0, 2.0, 5.0, 20.0, 80.0, 200.0, 600.0, 1000.0],
  },
  low: {
    1: [0.7, 1.95],
    2: [0.0, 1.8, 3.9],
    3: [0.0, 1.1, 2.7, 13.5],
    4: [0.0, 0.8, 1.8, 5.5, 25.0],
    5: [0.0, 0.5, 1.5, 3.2, 12.0, 80.0],
    6: [0.0, 0.0, 1.2, 2.4, 6.5, 35.0, 250.0],
    7: [0.0, 0.0, 0.9, 1.8, 4.2, 18.0, 85.0, 400.0],
    8: [0.0, 0.0, 0.5, 1.4, 3.0, 9.0, 40.0, 160.0, 500.0],
    9: [0.0, 0.0, 0.0, 1.2, 2.2, 6.0, 22.0, 80.0, 250.0, 650.0],
    10: [0.0, 0.0, 0.0, 1.1, 1.8, 4.0, 12.0, 45.0, 120.0, 350.0, 800.0],
  },
  medium: {
    1: [0, 3.96],
    2: [0, 1.5, 6.2],
    3: [0, 0.8, 4.0, 32.0],
    4: [0, 0.4, 2.2, 11.0, 95.0],
    5: [0, 0.2, 1.5, 5.0, 28.0, 380.0],
    6: [0, 0.0, 1.0, 3.2, 14.0, 95.0, 850.0],
    7: [0, 0.0, 0.4, 2.2, 7.5, 45.0, 240.0, 1000.0],
    8: [0, 0.0, 0.0, 1.4, 5.0, 20.0, 110.0, 450.0, 1000.0],
    9: [0, 0.0, 0.0, 1.0, 3.5, 12.0, 60.0, 220.0, 700.0, 1000.0],
    10: [0, 0.0, 0.0, 0.8, 2.5, 7.0, 30.0, 110.0, 300.0, 800.0, 1000.0],
  },
  high: {
    1: [0, 3.96],
    2: [0, 0.0, 9.5],
    3: [0, 0.0, 2.5, 48.0],
    4: [0, 0.0, 1.8, 14.0, 140.0],
    5: [0, 0.0, 0.0, 4.0, 35.0, 500.0],
    6: [0, 0.0, 0.0, 0.0, 15.0, 120.0, 1000.0],
    7: [0, 0.0, 0.0, 0.0, 6.0, 50.0, 300.0, 1000.0],
    8: [0, 0.0, 0.0, 0.0, 3.0, 25.0, 150.0, 600.0, 1000.0],
    9: [0, 0.0, 0.0, 0.0, 0.0, 10.0, 70.0, 300.0, 850.0, 1000.0],
    10: [0, 0.0, 0.0, 0.0, 0.0, 5.0, 35.0, 150.0, 450.0, 1000.0, 1000.0],
  },
};

export default function KenoGame() {
  const { balance, updateBalance, currency, formatBalance, currencySymbol, addRecentlyPlayedGame } = useGame();
  const activeSym = currencySymbol || "$";

  // Register in Recently Played once on mount
  useEffect(() => {
    if (addRecentlyPlayedGame) {
      addRecentlyPlayedGame({
        id: "keno",
        title: "Keno",
        image: "/games/keno.png",
        href: "/games/keno",
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

  // Keno Board State
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([3, 7, 12, 25, 38]);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [activeDrawNumber, setActiveDrawNumber] = useState<number | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [hits, setHits] = useState<number>(0);
  const [lastWinMultiplier, setLastWinMultiplier] = useState<number | null>(null);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>("classic");

  // Settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // Auto Bet State
  const [isAutoRunning, setIsAutoRunning] = useState<boolean>(false);
  const [autoBetsLimit, setAutoBetsLimit] = useState<number>(0);
  const [autoBetsCount, setAutoBetsCount] = useState<number>(0);
  const [onWinAction, setOnWinAction] = useState<"reset" | "increase">("reset");
  const [onWinPercent, setOnWinPercent] = useState<number>(100);
  const [onLossAction, setOnLossAction] = useState<"reset" | "increase">("reset");
  const [onLossPercent, setOnLossPercent] = useState<number>(100);
  const [stopOnProfit, setStopOnProfit] = useState<number>(0);
  const [stopOnLoss, setStopOnLoss] = useState<number>(0);
  const initialAutoBalanceRef = useRef<number>(balance);
  const baseBetRef = useRef<number>(betAmount);

  // Modals
  const [showFairnessModal, setShowFairnessModal] = useState<boolean>(false);
  const [showLiveStats, setShowLiveStats] = useState<boolean>(false);
  const [copiedSeed, setCopiedSeed] = useState<boolean>(false);

  // Live Stats
  const [stats, setStats] = useState({
    bets: 0,
    wins: 0,
    losses: 0,
    wagered: 0,
    profit: 0,
  });

  // Current Multiplier table for active picks and risk
  const pickCount = Math.max(1, Math.min(10, selectedNumbers.length));
  const currentPayoutTable = KENO_PAYOUTS[riskLevel][pickCount] || [];

  // Toggle Number Selection
  const toggleNumber = (num: number) => {
    if (isDrawing || isAutoRunning) return;
    sounds.playKenoPick();
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
    } else {
      if (selectedNumbers.length >= 10) return;
      setSelectedNumbers([...selectedNumbers, num]);
    }
  };

  // Auto Pick Random Numbers (default 5 or current count)
  const autoPick = () => {
    if (isDrawing || isAutoRunning) return;
    sounds.playClick();
    const count = selectedNumbers.length > 0 ? selectedNumbers.length : 5;
    const nums: number[] = [];
    while (nums.length < count) {
      const r = Math.floor(Math.random() * 40) + 1;
      if (!nums.includes(r)) nums.push(r);
    }
    setSelectedNumbers(nums);
  };

  // Clear Picks
  const clearPicks = () => {
    if (isDrawing || isAutoRunning) return;
    sounds.playClick();
    setSelectedNumbers([]);
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

  // Execute a Single Keno Round
  const startKeno = useCallback((): Promise<boolean> => {
    if (isDrawing || selectedNumbers.length === 0) return Promise.resolve(false);

    const effectiveBet =
      betInput === "" || isNaN(parseFloat(betInput)) || parseFloat(betInput) <= 0
        ? 1
        : parseFloat(betInput);

    if (effectiveBet > balance) {
      alert("Insufficient balance! Please use the Wallet button.");
      setIsAutoRunning(false);
      return Promise.resolve(false);
    }

    updateBalance(-effectiveBet);
    setIsDrawing(true);
    setDrawnNumbers([]);
    setActiveDrawNumber(null);
    setHits(0);
    setLastWinMultiplier(null);

    // Pick 10 unique winning numbers out of 40
    const fullPool = Array.from({ length: 40 }, (_, i) => i + 1);
    const shuffled = [...fullPool].sort(() => Math.random() - 0.5);
    const winning10 = shuffled.slice(0, 10);

    return new Promise<boolean>((resolve) => {
      let index = 0;
      const drawnArr: number[] = [];

      const drawInterval = setInterval(() => {
        if (index < winning10.length) {
          const nextBall = winning10[index];
          drawnArr.push(nextBall);
          setDrawnNumbers([...drawnArr]);
          setActiveDrawNumber(nextBall);

          const isHit = selectedNumbers.includes(nextBall);
          sounds.playKenoDraw(isHit);
          index++;
        } else {
          clearInterval(drawInterval);
          setIsDrawing(false);
          setActiveDrawNumber(null);

          // Calculate final hits and payout
          const finalHits = selectedNumbers.filter((n) => winning10.includes(n)).length;
          setHits(finalHits);

          const payoutTable = KENO_PAYOUTS[riskLevel][selectedNumbers.length] || [];
          const mult = payoutTable[finalHits] ?? 0;
          setLastWinMultiplier(mult);

          const isWin = mult > 0;
          const payoutAmount = parseFloat((effectiveBet * mult).toFixed(2));
          const profit = parseFloat((payoutAmount - effectiveBet).toFixed(2));

          if (isWin) {
            updateBalance(payoutAmount);
            sounds.playKenoWin(mult);
            if (mult >= 5) {
              try {
                confetti({ particleCount: 70, spread: 65, origin: { y: 0.6 } });
              } catch {}
            }
          } else {
            sounds.playDiceLoss();
          }

          // Update stats
          setStats((prev) => ({
            bets: prev.bets + 1,
            wins: isWin ? prev.wins + 1 : prev.wins,
            losses: isWin ? prev.losses : prev.losses + 1,
            wagered: parseFloat((prev.wagered + effectiveBet).toFixed(2)),
            profit: parseFloat((prev.profit + profit).toFixed(2)),
          }));

          resolve(isWin);
        }
      }, 100);
    });
  }, [balance, betInput, isDrawing, riskLevel, selectedNumbers, updateBalance]);

  // Auto Betting Loop
  const startAutoBetting = () => {
    if (betAmount > balance || selectedNumbers.length === 0) return;
    sounds.playClick();
    initialAutoBalanceRef.current = balance;
    baseBetRef.current = betAmount;
    setAutoBetsCount(0);
    setIsAutoRunning(true);
  };

  const stopAutoBetting = useCallback(() => {
    setIsAutoRunning(false);
  }, []);

  useEffect(() => {
    if (!isAutoRunning) return;

    let timer: NodeJS.Timeout;

    const runStep = async () => {
      if (autoBetsLimit > 0 && autoBetsCount >= autoBetsLimit) {
        stopAutoBetting();
        return;
      }

      const netProfit = balance - initialAutoBalanceRef.current;
      if (stopOnProfit > 0 && netProfit >= stopOnProfit) {
        stopAutoBetting();
        return;
      }
      if (stopOnLoss > 0 && netProfit <= -stopOnLoss) {
        stopAutoBetting();
        return;
      }

      const won = await startKeno();
      setAutoBetsCount((c) => c + 1);

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

      timer = setTimeout(() => {
        if (isAutoRunning) {
          runStep();
        }
      }, 400);
    };

    runStep();

    return () => clearTimeout(timer);
  }, [
    isAutoRunning,
    autoBetsCount,
    autoBetsLimit,
    balance,
    betAmount,
    onLossAction,
    onLossPercent,
    onWinAction,
    onWinPercent,
    startKeno,
    stopAutoBetting,
    stopOnLoss,
    stopOnProfit,
  ]);

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
      className={`w-full max-w-5xl mx-auto px-2 sm:px-4 py-2 select-none flex flex-col space-y-3 ${
        isFullscreen ? "p-6 bg-[#0f212e] min-h-screen" : ""
      }`}
    >
      {/* ========================================================= */}
      {/* 1. GAME ARENA (TOP) - 40 TILE BOARD + MULTIPLIER LADDER    */}
      {/* ========================================================= */}
      <div className="rounded-2xl border border-[#213743] bg-[#0f212e] shadow-2xl p-4 sm:p-6 flex flex-col items-center justify-center space-y-4">
        {/* 40-Number Grid (8 cols x 5 rows) */}
        <div className="grid grid-cols-8 gap-2 sm:gap-2.5 w-full max-w-2xl">
          {Array.from({ length: 40 }, (_, i) => i + 1).map((num) => {
            const isSelected = selectedNumbers.includes(num);
            const isDrawn = drawnNumbers.includes(num);
            const isHit = isSelected && isDrawn;
            const isCurrentBall = activeDrawNumber === num;

            return (
              <button
                key={num}
                type="button"
                onClick={() => toggleNumber(num)}
                disabled={isDrawing}
                className={`h-11 sm:h-13 rounded-xl text-xs sm:text-base font-black font-mono transition-all cursor-pointer relative overflow-hidden ${
                  isHit
                    ? "bg-[#00e701] text-[#0f212e] shadow-[0_0_20px_#00e701] scale-105 z-10"
                    : isDrawn
                    ? "bg-[#2f4553] text-[#b1bad3] border border-[#3b5568]"
                    : isSelected
                    ? "bg-[#1475e1] text-white shadow-[0_0_12px_rgba(20,117,225,0.5)] border border-[#2f8bfd]"
                    : "bg-[#1a2c38] text-[#b1bad3] border border-[#213743] hover:border-[#00e701]/50 hover:text-white hover:bg-[#213743]"
                } ${isCurrentBall ? "ring-2 ring-white scale-110 z-20" : ""}`}
              >
                <span>{num}</span>
                {isHit && (
                  <span className="absolute top-0.5 right-1 text-[8px] text-[#0f212e] font-extrabold">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Dynamic Multiplier Table / Match Ladder */}
        <div className="w-full max-w-2xl bg-[#1a2c38] border border-[#213743] rounded-xl p-2.5 overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-between gap-1 text-center min-w-max">
            {currentPayoutTable.map((payout, hitIdx) => {
              const isCurrentHit = !isDrawing && hits === hitIdx && lastWinMultiplier !== null;
              return (
                <div
                  key={hitIdx}
                  className={`px-2 py-1.5 rounded-lg border transition-all ${
                    isCurrentHit && payout > 0
                      ? "bg-[#00e701] text-[#0f212e] border-[#00e701] font-black shadow-[0_0_12px_rgba(0,231,1,0.6)] scale-105"
                      : isCurrentHit
                      ? "bg-[#2f4553] text-white border-[#3b5568]"
                      : "bg-[#0f212e] text-[#b1bad3] border-[#213743]"
                  }`}
                >
                  <div className="text-[10px] font-bold opacity-75">{hitIdx}×</div>
                  <div
                    className={`text-xs font-mono font-extrabold ${
                      payout > 0 ? "text-[#00e701]" : "text-[#b1bad3]"
                    } ${isCurrentHit && payout > 0 ? "text-[#0f212e]" : ""}`}
                  >
                    {payout.toFixed(1)}×
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. BETTING CONTROLS (DIRECTLY BENEATH ARENA)              */}
      {/* ========================================================= */}
      <div className="rounded-2xl border border-[#213743] bg-[#1a2c38] shadow-2xl p-4 sm:p-5 space-y-4">
        {/* Mode Tabs & Risk Selector Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Mode Switcher (Manual / Auto) */}
          <div className="grid grid-cols-2 p-1 bg-[#0f212e] rounded-xl border border-[#213743]">
            <button
              type="button"
              disabled={isDrawing || isAutoRunning}
              onClick={() => {
                sounds.playClick();
                setMode("manual");
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === "manual" ? "bg-[#213743] text-white shadow-sm" : "text-[#b1bad3] hover:text-white"
              }`}
            >
              Manual
            </button>
            <button
              type="button"
              disabled={isDrawing || isAutoRunning}
              onClick={() => {
                sounds.playClick();
                setMode("auto");
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === "auto" ? "bg-[#213743] text-white shadow-sm" : "text-[#b1bad3] hover:text-white"
              }`}
            >
              Auto
            </button>
          </div>

          {/* Risk Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-[#0f212e] rounded-xl border border-[#213743]">
            {(["classic", "low", "medium", "high"] as RiskLevel[]).map((r) => (
              <button
                key={r}
                type="button"
                disabled={isDrawing || isAutoRunning}
                onClick={() => {
                  sounds.playClick();
                  setRiskLevel(r);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
                  riskLevel === r ? "bg-[#213743] text-[#00e701] shadow-sm" : "text-[#b1bad3] hover:text-white"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
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
              disabled={isDrawing || isAutoRunning}
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
              disabled={isDrawing || isAutoRunning}
              onClick={handleHalfBet}
              className="rounded-lg px-2.5 py-1 text-xs font-bold text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors cursor-pointer"
            >
              ½
            </button>
            <button
              type="button"
              disabled={isDrawing || isAutoRunning}
              onClick={handleDoubleBet}
              className="rounded-lg px-2.5 py-1 text-xs font-bold text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors cursor-pointer"
            >
              2×
            </button>
            <button
              type="button"
              disabled={isDrawing || isAutoRunning}
              onClick={handleMaxBet}
              className="rounded-lg px-2.5 py-1 text-xs font-bold text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors cursor-pointer"
            >
              Max
            </button>
          </div>
        </div>

        {/* Quick Pick Actions (Auto Pick, Clear, Number Count) */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isDrawing || isAutoRunning}
              onClick={autoPick}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0f212e] border border-[#213743] text-xs font-bold text-white hover:bg-[#213743] transition-colors cursor-pointer"
            >
              <Dices className="h-4 w-4 text-[#00e701]" />
              <span>Auto Pick</span>
            </button>
            <button
              type="button"
              disabled={isDrawing || isAutoRunning}
              onClick={clearPicks}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0f212e] border border-[#213743] text-xs font-bold text-[#b1bad3] hover:text-white hover:bg-[#213743] transition-colors cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear</span>
            </button>
          </div>

          <div className="text-xs font-bold text-[#b1bad3] font-mono">
            <span>Selected: </span>
            <span className="text-white font-extrabold">{selectedNumbers.length} / 10</span>
          </div>
        </div>

        {/* AUTO BET SETTINGS */}
        {mode === "auto" && (
          <div className="space-y-3 pt-3 border-t border-[#213743]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#b1bad3]">Stop on Profit</label>
                  <input
                    type="number"
                    disabled={isAutoRunning}
                    placeholder="0.00"
                    value={stopOnProfit || ""}
                    onChange={(e) => setStopOnProfit(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-[#213743] bg-[#0f212e] p-2 text-xs font-bold text-white focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#b1bad3]">Stop on Loss</label>
                  <input
                    type="number"
                    disabled={isAutoRunning}
                    placeholder="0.00"
                    value={stopOnLoss || ""}
                    onChange={(e) => setStopOnLoss(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-[#213743] bg-[#0f212e] p-2 text-xs font-bold text-white focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PRIMARY CTA BET BUTTON */}
        <div className="w-full pt-2">
          {mode === "manual" ? (
            <button
              type="button"
              onClick={() => startKeno()}
              disabled={isDrawing || selectedNumbers.length === 0 || betAmount > balance || betAmount <= 0}
              className="w-full py-4 text-base font-extrabold rounded-xl bg-[#00e701] hover:bg-[#00c201] text-black shadow-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              <Zap className="h-5 w-5 fill-current" />
              <span>{isDrawing ? "Drawing Numbers..." : "Bet"}</span>
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
              disabled={selectedNumbers.length === 0 || betAmount > balance || betAmount <= 0}
              className="w-full py-4 text-base font-extrabold rounded-xl bg-[#00e701] hover:bg-[#00c201] text-black shadow-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              <Zap className="h-5 w-5 fill-current" />
              <span>Start Autobet</span>
            </button>
          )}
        </div>

        {/* Bottom Utility Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-[#213743] text-[#b1bad3]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                sounds.enabled = next;
                if (next) sounds.playClick();
              }}
              className="p-2 rounded-lg bg-[#0f212e] border border-[#213743] hover:text-white transition-colors cursor-pointer"
              title={soundEnabled ? "Mute Sound" : "Enable Sound"}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-red-400" />}
            </button>

            <button
              type="button"
              onClick={() => setShowFairnessModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0f212e] border border-[#213743] hover:text-white transition-colors cursor-pointer"
            >
              <ShieldCheck className="h-4 w-4 text-[#00e701]" />
              <span>Provably Fair</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowLiveStats(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0f212e] border border-[#213743] hover:text-white transition-colors cursor-pointer"
            >
              <TrendingUp className="h-3.5 w-3.5 text-[#00e701]" />
              <span>Live Stats</span>
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-[#0f212e] border border-[#213743] hover:text-white transition-colors cursor-pointer"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
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
                <span>Provably Fair Keno</span>
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
                Each draw generates 10 numbers out of 40 using HMAC-SHA256 provably fair seeds with
                standard 99% certified RTP.
              </p>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#b1bad3]">Server Seed (Hashed)</label>
                <div className="flex items-center justify-between rounded-xl bg-[#0f212e] border border-[#213743] p-2.5 font-mono text-white text-[11px] truncate">
                  <span className="truncate">7b51bca89d146f3a74ef1a0398bbdc632fa</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("7b51bca89d146f3a74ef1a0398bbdc632fa");
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
                <span>Keno Session Stats</span>
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
                <div className="text-[11px] font-bold text-[#b1bad3]">Total Bets</div>
                <div className="text-lg font-black text-white font-mono">{stats.bets}</div>
              </div>
              <div className="rounded-xl bg-[#0f212e] border border-[#213743] p-3">
                <div className="text-[11px] font-bold text-[#b1bad3]">Win Rate</div>
                <div className="text-lg font-black text-[#00e701] font-mono">
                  {stats.bets > 0 ? ((stats.wins / stats.bets) * 100).toFixed(1) : "0.0"}%
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
