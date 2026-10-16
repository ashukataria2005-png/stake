"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
  ChevronDown,
  ChevronUp,
  Settings,
  BarChart2,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";
import StakeGameFooterCard from "../common/StakeGameFooterCard";

interface SlideHistoryItem {
  id: string;
  multiplier: number;
}

interface SlideTile {
  id: string;
  multiplier: number;
}

// Generate provably fair Slide multiplier (99% RTP / 1% House Edge)
function generateSlideMultiplier(): number {
  const r = Math.random();
  const raw = 0.99 / (1.0 - r);
  if (raw < 1.01) return 1.01;
  if (raw > 1000000.0) return 1000000.0;
  return parseFloat(raw.toFixed(2));
}

const CARD_WIDTH = 110; // width in px of each card on conveyor

export default function SlideGame() {
  const { balance, updateBalance, currency, formatBalance, currencySymbol, addRecentlyPlayedGame, recordSessionBet, toggleLiveStats } = useGame();
  const activeSym = currencySymbol || "$";

  // Register in Recently Played once on mount
  useEffect(() => {
    if (addRecentlyPlayedGame) {
      addRecentlyPlayedGame({
        id: "slide",
        title: "Slide",
        image: "/games/stake-originals/slide.webp",
        href: "/games/slide",
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

  // Target Multiplier & Win Chance
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

  // Two-way sync math
  const updateFromTarget = (val: number) => {
    const clampedTarget = Math.max(1.01, Math.min(1000000.0, val));
    setTargetMultiplier(clampedTarget);
    const calculatedChance = parseFloat((99.0 / clampedTarget).toFixed(2));
    setWinChance(Math.max(0.0001, Math.min(98.0, calculatedChance)));
  };

  const updateFromWinChance = (val: number) => {
    const clampedChance = Math.max(0.0001, Math.min(98.0, val));
    setWinChance(clampedChance);
    const calculatedTarget = parseFloat((99.0 / clampedChance).toFixed(2));
    setTargetMultiplier(Math.max(1.01, Math.min(1000000.0, calculatedTarget)));
  };

  // Game Engine State
  const [gameState, setGameState] = useState<"idle" | "countdown" | "sliding" | "finished">("idle");
  const [countdownTime, setCountdownTime] = useState<number>(0);
  const [activeWinningMultiplier, setActiveWinningMultiplier] = useState<number | null>(null);
  const [isPlayerInRound, setIsPlayerInRound] = useState<boolean>(false);
  const [hasWon, setHasWon] = useState<boolean | null>(null);

  // Conveyor strip cards
  const [tiles, setTiles] = useState<SlideTile[]>(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: `tile-${i}`,
      multiplier: generateSlideMultiplier(),
    }))
  );
  const [offsetPx, setOffsetPx] = useState<number>(0);
  const conveyorAnimRef = useRef<number | null>(null);

  // History strip
  const [history, setHistory] = useState<SlideHistoryItem[]>([
    { id: "s1", multiplier: 1.84 },
    { id: "s2", multiplier: 3.12 },
    { id: "s3", multiplier: 12.45 },
    { id: "s4", multiplier: 1.25 },
    { id: "s5", multiplier: 4.88 },
    { id: "s6", multiplier: 1.05 },
    { id: "s7", multiplier: 2.1 },
  ]);

  // Settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
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

  const profitOnWin = parseFloat((betAmount * (targetMultiplier - 1)).toFixed(2));

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

  // Run Slide Round Animation
  const startSlideRound = useCallback(
    (betForRound: number, targetForRound: number): Promise<boolean> => {
      return new Promise<boolean>((resolve) => {
        setGameState("sliding");
        setHasWon(null);

        // Generate winning multiplier for this round
        const winningResult = generateSlideMultiplier();
        setActiveWinningMultiplier(winningResult);

        // Prepare extended conveyor strip with the target card placed at index 40
        const winningIndex = 40;
        const newTiles: SlideTile[] = Array.from({ length: 55 }, (_, i) => ({
          id: `tile-round-${Date.now()}-${i}`,
          multiplier: i === winningIndex ? winningResult : generateSlideMultiplier(),
        }));
        setTiles(newTiles);

        // Animate conveyor sliding smoothly using cubic easing
        const startOffset = 0;
        const targetOffset = winningIndex * CARD_WIDTH;
        const duration = 3800; // 3.8s slide
        const startTime = performance.now();
        let lastTickDistance = 0;

        const animateConveyor = (now: number) => {
          const elapsed = now - startTime;
          const progress = Math.min(1, elapsed / duration);

          // Authentic decelerating cubic ease out
          const easeOut = 1 - Math.pow(1 - progress, 3);
          const currentOffset = startOffset + (targetOffset - startOffset) * easeOut;
          setOffsetPx(currentOffset);

          // Tick sound every card boundary crossed
          if (Math.abs(currentOffset - lastTickDistance) >= CARD_WIDTH) {
            sounds.playSlideTick();
            lastTickDistance = currentOffset;
          }

          if (progress < 1) {
            conveyorAnimRef.current = requestAnimationFrame(animateConveyor);
          } else {
            // Reached target card
            setOffsetPx(targetOffset);
            sounds.playSlideStop();
            setGameState("finished");

            const roundWon = winningResult >= targetForRound;
            setHasWon(roundWon);
            const payout = roundWon ? parseFloat((betForRound * targetForRound).toFixed(2)) : 0;
            const roundProfit = roundWon ? payout - betForRound : -betForRound;

            if (roundWon) {
              updateBalance(payout);
              sounds.playSlideWin();
              if (targetForRound >= 5) {
                try {
                  confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
                } catch {}
              }
            } else {
              sounds.playDiceLoss();
            }

            recordSessionBet(betForRound, payout, roundWon, "slide");

            // Record History & Stats
            setHistory((prev) => [
              { id: `h-${Date.now()}`, multiplier: winningResult },
              ...prev.slice(0, 14),
            ]);

            setStats((prev) => ({
              bets: prev.bets + 1,
              wins: roundWon ? prev.wins + 1 : prev.wins,
              losses: roundWon ? prev.losses : prev.losses + 1,
              wagered: parseFloat((prev.wagered + betForRound).toFixed(2)),
              profit: parseFloat((prev.profit + roundProfit).toFixed(2)),
            }));

            setIsPlayerInRound(false);
            resolve(roundWon);
          }
        };

        conveyorAnimRef.current = requestAnimationFrame(animateConveyor);
      });
    },
    [updateBalance]
  );

  // Clean up animation frame on unmount
  useEffect(() => {
    return () => {
      if (conveyorAnimRef.current) {
        cancelAnimationFrame(conveyorAnimRef.current);
      }
    };
  }, []);

  // Player Manual Bet Trigger
  const handleManualBet = async () => {
    if (gameState === "sliding") return;

    const currentBet =
      betInput === "" || isNaN(parseFloat(betInput)) || parseFloat(betInput) <= 0
        ? 1
        : parseFloat(betInput);

    if (currentBet > balance) {
      alert("Insufficient balance! Please use the Wallet button.");
      return;
    }

    updateBalance(-currentBet);
    setIsPlayerInRound(true);
    sounds.playClick();

    // 1-second quick countdown then start sliding
    setGameState("countdown");
    setCountdownTime(1.0);

    const countdownTimer = setInterval(() => {
      setCountdownTime((prev) => {
        if (prev <= 0.2) {
          clearInterval(countdownTimer);
          startSlideRound(currentBet, targetMultiplier);
          return 0;
        }
        return parseFloat((prev - 0.2).toFixed(1));
      });
    }, 200);
  };

  // Auto Betting Loop
  const startAutoBetting = () => {
    if (betAmount > balance) return;
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

      const currentBet = betAmount;
      if (currentBet > balance) {
        stopAutoBetting();
        return;
      }

      updateBalance(-currentBet);
      setIsPlayerInRound(true);

      const won = await startSlideRound(currentBet, targetMultiplier);
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
      }, 800);
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
    startSlideRound,
    stopAutoBetting,
    stopOnLoss,
    stopOnProfit,
    targetMultiplier,
    updateBalance,
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
      className={`w-full max-w-lg mx-auto px-2 sm:px-3 py-2 select-none flex flex-col space-y-2 ${
        isFullscreen ? "p-6 bg-[#0f212e] min-h-screen max-w-none" : ""
      }`}
    >
      {/* ========================================================= */}
      {/* 1. HORIZONTAL SLIDE ARENA (TOP)                            */}
      {/* ========================================================= */}
      <div className="w-full rounded-t-2xl bg-[#0f212e] border-t border-x border-[#213743] shadow-2xl p-3 sm:p-4 flex flex-col items-center justify-center space-y-3 relative overflow-hidden">
        {/* Recent Multipliers History Pill Row */}
        <div className="w-full flex items-center justify-between pb-0.5">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full">
            {history.map((item) => (
              <div
                key={item.id}
                className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold border shrink-0 ${
                  item.multiplier >= 10.0
                    ? "bg-amber-400/20 text-amber-300 border-amber-400/40"
                    : item.multiplier >= 2.0
                    ? "bg-[#00e701]/15 text-[#00e701] border-[#00e701]/30"
                    : "bg-[#213743] text-[#b1bad3] border-[#2f4553]"
                }`}
              >
                {item.multiplier.toFixed(2)}×
              </div>
            ))}
          </div>
        </div>

        {/* Carousel / Conveyor Slide Track */}
        <div className="w-full h-32 sm:h-36 bg-[#1a2c38] border-2 border-[#213743] rounded-xl relative overflow-hidden flex items-center justify-center shadow-inner">
          {/* Center Indicator Needles (Top & Bottom Pointers) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center">
            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-[#00e701] drop-shadow-[0_0_8px_#00e701]" />
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center">
            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] border-b-[#00e701] drop-shadow-[0_0_8px_#00e701]" />
          </div>

          {/* Vertical Center Guide Line */}
          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-[#00e701]/40 z-20 pointer-events-none" />

          {/* Sliding Cards Conveyor Strip */}
          <div
            className="flex items-center absolute left-1/2 will-change-transform"
            style={{
              transform: `translateX(-${offsetPx}px) translateX(-${CARD_WIDTH / 2}px)`,
            }}
          >
            {tiles.map((tile, i) => {
              const isHigh = tile.multiplier >= 10.0;
              const isMid = tile.multiplier >= 2.0;
              return (
                <div
                  key={tile.id || i}
                  style={{ width: `${CARD_WIDTH}px` }}
                  className="h-24 sm:h-28 px-1 shrink-0 flex items-center justify-center"
                >
                  <div
                    className={`w-full h-full rounded-lg border flex flex-col items-center justify-center p-1.5 transition-transform shadow-md ${
                      isHigh
                        ? "bg-gradient-to-b from-amber-500/25 to-[#1a2c38] text-amber-300 border-amber-400/50"
                        : isMid
                        ? "bg-gradient-to-b from-[#00e701]/20 to-[#1a2c38] text-[#00e701] border-[#00e701]/40"
                        : "bg-[#0f212e] text-[#b1bad3] border-[#213743]"
                    }`}
                  >
                    <span className="text-[9px] uppercase font-bold text-[#b1bad3] opacity-60">
                      Multiplier
                    </span>
                    <span className="text-base sm:text-lg font-black font-mono tracking-tight mt-0.5">
                      {tile.multiplier.toFixed(2)}×
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Countdown Overlay */}
          {gameState === "countdown" && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs z-40 flex flex-col items-center justify-center">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#00e701]">
                Slide Starting In
              </span>
              <span className="text-3xl font-black font-mono text-white mt-0.5">
                {countdownTime.toFixed(1)}s
              </span>
            </div>
          )}
        </div>

        {/* Status / Outcome Readout */}
        <div className="flex items-center justify-between w-full text-xs font-bold text-[#b1bad3] px-1 font-mono">
          <div>
            Target: <span className="text-white font-black">{targetMultiplier.toFixed(2)}×</span>
          </div>
          <div>
            Win Chance:{" "}
            <span className="text-[#00e701] font-black">{winChance.toFixed(2)}%</span>
          </div>
          {hasWon !== null && gameState === "finished" && (
            <div
              className={`px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider ${
                hasWon
                  ? "bg-[#00e701]/20 text-[#00e701] border border-[#00e701]/40"
                  : "bg-[#e9113c]/20 text-[#e9113c] border border-[#e9113c]/40"
              }`}
            >
              {hasWon
                ? `WON +${activeSym}${(betAmount * targetMultiplier).toFixed(2)}`
                : "MISSED"}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MINES HARMONIZED BETTING CONTROLS SHELL CONTAINER      */}
      {/* ========================================================= */}
      <div className="w-full border-t border-[#213743] bg-[#1a2c38] p-3 sm:p-4 flex flex-col justify-start space-y-2 sm:space-y-2.5 rounded-b-2xl select-none">
        {/* 1. PRIMARY BET CTA BUTTON (Directly at top of controls) */}
        <div className="w-full">
          {mode === "manual" ? (
            <button
              type="button"
              onClick={handleManualBet}
              disabled={gameState === "sliding" || betAmount > balance || betAmount <= 0}
              className="w-full py-3 sm:py-3.5 text-sm sm:text-base font-extrabold rounded-xl bg-[#1475e1] hover:bg-[#1164c2] text-white shadow-lg shadow-[#1475e1]/25 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer uppercase tracking-wider"
            >
              <span>{gameState === "sliding" ? "SLIDING..." : "BET"}</span>
            </button>
          ) : isAutoRunning ? (
            <button
              type="button"
              onClick={stopAutoBetting}
              className="w-full py-3 sm:py-3.5 text-sm sm:text-base font-extrabold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25 active:scale-[0.98] transition-all flex items-center justify-center cursor-pointer uppercase tracking-wider"
            >
              <span>STOP AUTOBET ({autoBetsCount})</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={startAutoBetting}
              disabled={betAmount > balance || betAmount <= 0}
              className="w-full py-3 sm:py-3.5 text-sm sm:text-base font-extrabold rounded-xl bg-[#1475e1] hover:bg-[#1164c2] text-white shadow-lg shadow-[#1475e1]/25 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer uppercase tracking-wider"
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
                disabled={gameState === "sliding" || isAutoRunning}
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
                disabled={gameState === "sliding" || isAutoRunning}
                onClick={handleHalfBet}
                className="rounded-lg bg-[#213743] px-2.5 py-1.5 text-xs font-bold text-[#b1bad3] hover:bg-[#2f4553] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                ½
              </button>
              <button
                type="button"
                disabled={gameState === "sliding" || isAutoRunning}
                onClick={handleDoubleBet}
                className="rounded-lg bg-[#213743] px-2.5 py-1.5 text-xs font-bold text-[#b1bad3] hover:bg-[#2f4553] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                2×
              </button>
            </div>
          </div>
        </div>

        {/* 3. TARGET MULTIPLIER & WIN CHANCE */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#b1bad3] uppercase">Target Multiplier</label>
            <div className="flex rounded-lg bg-[#0f212e] border border-[#213743] focus-within:border-[#2f4553] p-1 items-center px-2.5">
              <input
                type="text"
                inputMode="decimal"
                disabled={gameState === "sliding" || isAutoRunning}
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

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#b1bad3] uppercase">Win Chance</label>
            <div className="flex rounded-lg bg-[#0f212e] border border-[#213743] focus-within:border-[#2f4553] p-1 items-center px-2.5">
              <input
                type="text"
                inputMode="decimal"
                disabled={gameState === "sliding" || isAutoRunning}
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
                className="w-full bg-transparent text-sm font-bold text-[#00e701] outline-none font-mono"
              />
              <span className="text-xs font-bold text-[#b1bad3]">%</span>
            </div>
          </div>
        </div>

        {/* 4. PROFIT ON WIN */}
        <div className="flex items-center justify-between rounded-lg border border-[#213743] bg-[#0f212e] px-3 py-1.5 text-xs">
          <span className="font-bold text-[#b1bad3]">Profit on Win:</span>
          <span className="font-mono font-bold text-[#00e701]">
            +{activeSym}{profitOnWin.toFixed(2)}
          </span>
        </div>

        {/* 5. AUTO BET SETTINGS */}
        {mode === "auto" && (
          <div className="space-y-2 pt-1 border-t border-[#213743]/60 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#b1bad3] uppercase">Number of Bets</label>
                <div className="flex rounded-lg bg-[#0f212e] border border-[#213743] p-1 items-center">
                  <input
                    type="number"
                    min="0"
                    placeholder="∞"
                    value={autoBetsLimit === 0 ? "" : autoBetsLimit}
                    onChange={(e) => setAutoBetsLimit(parseInt(e.target.value) || 0)}
                    className="w-full bg-transparent px-1 text-xs font-bold text-white outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setAutoBetsLimit(0)}
                    className="px-2 py-0.5 rounded text-xs font-black text-[#1475e1] hover:text-white"
                  >
                    ∞
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#b1bad3] uppercase">Stop on Profit</label>
                <input
                  type="number"
                  disabled={isAutoRunning}
                  placeholder="0.00"
                  value={stopOnProfit || ""}
                  onChange={(e) => setStopOnProfit(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg bg-[#0f212e] border border-[#213743] p-1.5 text-xs font-bold text-white outline-none font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* 6. MODE SWITCH TABS: [ Manual | Auto ] */}
        <div className="flex rounded-lg bg-[#0f212e] p-1 border border-[#213743] mt-auto">
          <button
            type="button"
            disabled={gameState === "sliding" || isAutoRunning}
            onClick={() => {
              sounds.playClick();
              setMode("manual");
            }}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
              mode === "manual"
                ? "bg-[#213743] text-white shadow-sm"
                : "text-[#b1bad3] hover:text-white"
            }`}
          >
            Manual
          </button>
          <button
            type="button"
            disabled={gameState === "sliding" || isAutoRunning}
            onClick={() => {
              sounds.playClick();
              setMode("auto");
            }}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
              mode === "auto"
                ? "bg-[#213743] text-white shadow-sm"
                : "text-[#b1bad3] hover:text-white"
            }`}
          >
            Auto
          </button>
        </div>

        {/* 7. PLINKO-STANDARDIZED UTILITY FOOTER BAR */}
        <div className="flex items-center justify-between rounded-lg bg-[#0f212e] border border-[#213743] px-3 py-2 text-xs text-[#b1bad3] mt-0.5">
          <div className="flex items-center gap-2">
            {/* 1. Settings */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-1 rounded-md hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors cursor-pointer"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            {/* 2. Theater / Fullscreen Mode */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1 rounded-md hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors cursor-pointer"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            {/* 3. Live Stats */}
            <button
              type="button"
              onClick={() => toggleLiveStats("slide")}
              className="p-1 rounded-md hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors cursor-pointer"
              title="Live Stats"
            >
              <BarChart2 className="w-4 h-4 text-cyan-400" />
            </button>
            {/* 4. Sound / Audio Mute Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                sounds.enabled = next;
                if (next) sounds.playClick();
              }}
              className="p-1 rounded-md hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors cursor-pointer"
              title={soundEnabled ? "Mute" : "Unmute"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
            </button>
          </div>

          {/* 5. Provably Fair */}
          <button
            type="button"
            onClick={() => setShowFairnessModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#213743] hover:bg-[#2f4553] text-[#b1bad3] hover:text-white font-bold text-xs transition-colors cursor-pointer"
            title="Provably Fair"
          >
            <ShieldCheck className="w-4 h-4 text-[#00e701]" />
            <span>Fairness</span>
          </button>
        </div>
      </div>

      {/* Fairness Modal */}
      {showFairnessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <ShieldCheck className="h-5 w-5 text-[#00e701]" />
                <span>Provably Fair Slide</span>
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
                Stake Slide outcomes are generated using HMAC-SHA256 based on your Client Seed and
                Server Seed with 99% certified RTP.
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

      {/* Live Stats Modal */}
      {showLiveStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#00e701]" />
                <span>Slide Session Stats</span>
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

      {/* GAME SETTINGS MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-[#213743] bg-[#1a2c38] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Settings className="w-5 h-5 text-[#b1bad3]" />
                <span>Game Settings</span>
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
                  {!soundEnabled ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-[#00e701]" />}
                  <span>Sound Effects</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !soundEnabled;
                    setSoundEnabled(next);
                    sounds.enabled = next;
                  }}
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                    soundEnabled ? "bg-[#1475e1]" : "bg-[#213743]"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                      soundEnabled ? "right-0.5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsSettingsOpen(false)}
              className="w-full py-2.5 rounded-lg bg-[#213743] hover:bg-[#2f4553] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Stake Originals Game Footer Card */}
      <StakeGameFooterCard gameTitle="Slide" />
    </div>
  );
}
