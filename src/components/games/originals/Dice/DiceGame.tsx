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
import { resolveDiceRoll } from "@/lib/luckEngine";
import confetti from "canvas-confetti";
import StakeGameFooterCard from "@/components/games/originals/common/StakeGameFooterCard";

import {
  calculateDiceMultiplier,
  calculateDiceWinChance,
  DICE_CONFIG,
} from "@/config/stakeMultipliers";

interface RollHistoryItem {
  id: string;
  roll: number;
  isWin: boolean;
}

export default function DiceGame() {
  const { balance, updateBalance, currencySymbol, addRecentlyPlayedGame, userLuckMode } = useGame();
  const activeSym = currencySymbol || "$";

  // Mode & Betting State
  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [instantBet, setInstantBet] = useState<boolean>(false);
  const [betAmount, setBetAmount] = useState<number>(10);
  const [betInput, setBetInput] = useState<string>("10.00");
  const [isRollOver, setIsRollOver] = useState<boolean>(true);
  const [target, setTarget] = useState<number>(50.5);

  // Derived 99% RTP Math State (House edge = 1% from centralized config)
  const winChance = useMemo(() => {
    return calculateDiceWinChance(target, isRollOver);
  }, [isRollOver, target]);

  const multiplier = useMemo(() => {
    return calculateDiceMultiplier(winChance);
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

  const updateTargetValue = (newTarget: number) => {
    const clamped = Math.max(2.0, Math.min(98.0, parseFloat(newTarget.toFixed(2))));
    setTarget(clamped);
  };

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

  const handleMaxBet = () => {
    if (isRolling) return;
    sounds.playClick();
    const next = Math.max(0.01, parseFloat(balance.toFixed(2)));
    setBetAmount(next);
    setBetInput(next.toFixed(2));
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

    updateBalance(-effectiveBet);
    setNonce((n) => n + 1);

    setStats((prev) => ({
      ...prev,
      totalBets: prev.totalBets + 1,
      totalWagered: prev.totalWagered + effectiveBet,
      netProfit: prev.netProfit - effectiveBet,
    }));

    sounds.playDiceRoll();

    const defaultRoll = parseFloat((Math.random() * 100.0).toFixed(2));
    const finalRoll = resolveDiceRoll(userLuckMode, target, isRollOver, defaultRoll);

    let tickCount = instantBet ? 12 : 0;
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

        setHistory((prev) => [
          { id: `h-${Date.now()}`, roll: finalRoll, isWin: won },
          ...prev.slice(0, 9),
        ]);

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
    instantBet,
  ]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isAutoRunning && !isRolling) {
      timer = setTimeout(() => {
        rollDice();
      }, instantBet ? 80 : 350);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [instantBet, isAutoRunning, isRolling, rollDice]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        !hotkeysEnabled ||
        (e.target instanceof HTMLElement &&
          ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName))
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        rollDice();
      } else if (e.code === "KeyA") {
        e.preventDefault();
        handleHalfBet();
      } else if (e.code === "KeyS") {
        e.preventDefault();
        handleDoubleBet();
      } else if (e.code === "KeyD" || e.code === "KeyM") {
        e.preventDefault();
        handleMaxBet();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleDoubleBet, handleHalfBet, handleMaxBet, hotkeysEnabled, rollDice]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const profitOnWin = useMemo(() => {
    return parseFloat((betAmount * (multiplier - 1)).toFixed(2));
  }, [betAmount, multiplier]);

  return (
    <div className="w-full max-w-lg mx-auto px-2 sm:px-3 py-2 select-none flex flex-col space-y-2">
      {/* ========================================================= */}
      {/* 1. SLIDER CARD ARENA                                      */}
      {/* ========================================================= */}
      <div className="w-full rounded-t-2xl bg-[#0f212e] border-t border-x border-[#213743] shadow-2xl p-3 sm:p-4 flex flex-col items-center justify-between relative overflow-hidden">
        {/* Central Result Display Box */}
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

        {/* Slider Bar Track & Thumb */}
        <div className="w-full px-1 sm:px-2 z-10 my-1">
          <div className="flex justify-between px-1 text-[11px] font-mono font-semibold text-[#b1bad3] select-none mb-1">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>

          <div className="relative flex flex-col items-center">
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

            <div className="relative w-full h-2 sm:h-2.5 rounded-full bg-[#07131b] border border-[#213743] overflow-hidden shadow-inner flex select-none">
              <div
                className={`h-full transition-all duration-[250ms] ease-in-out ${
                  isRollOver ? "bg-[#e9113c]" : "bg-[#00e701]"
                }`}
                style={{ width: `${target}%` }}
              />
              <div
                className={`h-full transition-all duration-[250ms] ease-in-out ${
                  isRollOver ? "bg-[#00e701]" : "bg-[#e9113c]"
                }`}
                style={{ width: `${100 - target}%` }}
              />
            </div>

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

        {/* 3-METRIC STATS BOXES */}
        <div className="w-full grid grid-cols-3 gap-2 mt-2 z-10">
          <div className="rounded-lg bg-[#1a2c38] border border-[#213743] py-1.5 px-2.5 flex flex-col justify-center min-h-[38px] max-h-[42px]">
            <span className="text-[10px] uppercase font-semibold text-[#87909e] leading-none">
              Multiplier
            </span>
            <div className="text-sm font-bold font-mono text-white mt-0.5 truncate leading-tight">
              {multiplier.toFixed(4)} ×
            </div>
          </div>

          <div className="rounded-lg bg-[#1a2c38] border border-[#213743] py-1.5 px-2.5 flex flex-col justify-center min-h-[38px] max-h-[42px] relative">
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

          <div className="rounded-lg bg-[#1a2c38] border border-[#213743] py-1.5 px-2.5 flex flex-col justify-center min-h-[38px] max-h-[42px]">
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
      {/* 2. MINES HARMONIZED BETTING CONTROLS SHELL CONTAINER      */}
      {/* ========================================================= */}
      <div className="w-full border-t border-[#213743] bg-[#1a2c38] p-3 sm:p-4 flex flex-col justify-start space-y-2 sm:space-y-2.5 rounded-b-2xl select-none">
        {/* 0. MANUAL / AUTO BET TABS & INSTANT SPEED TOGGLE */}
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
            onClick={() => setInstantBet(!instantBet)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-xs font-bold cursor-pointer shrink-0 ${
              instantBet
                ? "bg-[#00e701]/10 border-[#00e701]/40 text-[#00e701]"
                : "bg-[#0f212e] border-[#213743] text-[#b1bad3] hover:text-white"
            }`}
            title="Instant Bet / Turbo Mode (Skip animations)"
          >
            <Zap className={`w-3.5 h-3.5 ${instantBet ? "fill-[#00e701]" : ""}`} />
            <span className="text-[11px]">Instant</span>
          </button>
        </div>

        {/* 1. PRIMARY BET CTA BUTTON (Directly at top of controls) */}
        <div className="w-full">
          <button
            type="button"
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
            className={`w-full py-3 sm:py-3.5 text-sm sm:text-base font-extrabold rounded-lg text-white shadow-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer uppercase tracking-wider ${
              isAutoRunning
                ? "bg-red-600 hover:bg-red-700 shadow-red-500/25"
                : "bg-[#1475e1] hover:bg-[#1164c2] shadow-[#1475e1]/25"
            }`}
          >
            <span>
              {isAutoRunning
                ? "STOP AUTOBET"
                : mode === "auto"
                ? "START AUTOBET"
                : isRolling
                ? "ROLLING..."
                : "BET"}
            </span>
          </button>
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

        {/* 3. PROFIT ON WIN (Manual Mode Only, Exact Mines Aesthetic) */}
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

        {/* 4. AUTO MODE SPECIFIC INPUTS */}
        {mode === "auto" && (
          <div className="space-y-2">
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
                  title="Infinite Bets"
                  className="px-3 py-1 rounded-lg text-sm font-black text-[#1475e1] hover:text-white transition-colors cursor-pointer select-none"
                >
                  ∞
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-0.5 py-0.5">
              <span className="text-xs font-bold text-[#b1bad3]">Advanced Conditions</span>
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

            {isAdvancedAuto && (
              <div className="space-y-2 pt-1 border-t border-[#213743]">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#87909e] uppercase">On Win</label>
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
                    <label className="text-[10px] font-bold text-[#87909e] uppercase">On Loss</label>
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

        {/* 6. BOTTOM UTILITY BAR */}
        <div className="flex items-center justify-between rounded-lg bg-[#0f212e] border border-[#213743] px-3 py-2 text-xs text-[#b1bad3] mt-0.5">
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

          <button
            type="button"
            onClick={() => setIsFairnessOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#213743] hover:bg-[#2f4553] text-[#b1bad3] hover:text-white font-bold text-xs transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-[#00e701]" />
            <span>Fairness</span>
          </button>
        </div>
      </div>

      {/* Stake Originals Game Footer Card */}
      <StakeGameFooterCard gameTitle="Dice" />

      {/* PROVABLY FAIR VERIFIER MODAL */}
      {isFairnessOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#213743] bg-[#1a2c38] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <ShieldCheck className="w-5 h-5 text-[#00e701]" />
                <span>Provably Fair Verification</span>
              </div>
              <button
                onClick={() => setIsFairnessOpen(false)}
                className="p-1 text-[#b1bad3] hover:text-white rounded-lg hover:bg-[#213743]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#b1bad3]">
              <div>
                <label className="text-[11px] font-bold text-white block mb-1">
                  Active Server Seed (Hashed)
                </label>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0f212e] font-mono text-[11px] text-white border border-[#213743]">
                  <span className="truncate">{serverSeedHash}</span>
                  <button
                    onClick={() => copyToClipboard(serverSeedHash, "server")}
                    className="p-1 text-[#b1bad3] hover:text-white"
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
                <div className="p-2.5 rounded-lg bg-[#0f212e] font-mono text-[11px] text-white border border-[#213743]">
                  {clientSeed}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-white block mb-1">Nonce</label>
                <div className="p-2.5 rounded-lg bg-[#0f212e] font-mono text-[11px] text-white border border-[#213743]">
                  {nonce}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0f212e] text-[11px] space-y-1 border border-[#213743]">
                <div className="font-bold text-white">Dice Formula:</div>
                <div className="font-mono text-[#00e701]">
                  Roll = (Hash(ServerSeed, ClientSeed, Nonce) % 10001) / 100
                </div>
                <div>RTP: 99.00% (1.00% House Edge).</div>
              </div>
            </div>

            <button
              onClick={() => setIsFairnessOpen(false)}
              className="w-full py-2.5 rounded-lg bg-[#213743] hover:bg-[#2f4553] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* LIVE STATS MODAL */}
      {isStatsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#213743] bg-[#1a2c38] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <BarChart2 className="w-5 h-5 text-[#1475e1]" />
                <span>Live Dice Statistics</span>
              </div>
              <button
                onClick={() => setIsStatsOpen(false)}
                className="p-1 text-[#b1bad3] hover:text-white rounded-lg hover:bg-[#213743]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-lg bg-[#0f212e] border border-[#213743] text-center">
                <div className="text-[11px] font-semibold text-[#b1bad3]">Total Bets</div>
                <div className="text-lg font-black text-white font-mono mt-0.5">
                  {stats.totalBets}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[#0f212e] border border-[#213743] text-center">
                <div className="text-[11px] font-semibold text-[#b1bad3]">Best Roll</div>
                <div className="text-lg font-black text-[#1475e1] font-mono mt-0.5">
                  {stats.bestRoll.toFixed(2)}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[#0f212e] border border-[#213743] text-center">
                <div className="text-[11px] font-semibold text-[#b1bad3]">Total Wagered</div>
                <div className="text-lg font-black text-white font-mono mt-0.5">
                  {activeSym}{stats.totalWagered.toFixed(2)}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[#0f212e] border border-[#213743] text-center">
                <div className="text-[11px] font-semibold text-[#b1bad3]">Net Profit</div>
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
              className="w-full py-2.5 rounded-lg bg-[#213743] hover:bg-[#2f4553] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* GAME SETTINGS MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-[#213743] bg-[#1a2c38] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Settings className="w-5 h-5 text-[#b1bad3]" />
                <span>Dice Settings</span>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 text-[#b1bad3] hover:text-white rounded-lg hover:bg-[#213743]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0f212e] border border-[#213743]">
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

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0f212e] border border-[#213743]">
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
              className="w-full py-2.5 rounded-lg bg-[#213743] hover:bg-[#2f4553] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
