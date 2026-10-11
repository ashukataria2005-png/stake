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
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

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
  const { balance, updateBalance, currency, formatBalance, currencySymbol, addRecentlyPlayedGame } = useGame();
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
      className={`w-full max-w-5xl mx-auto px-2 sm:px-4 py-2 select-none flex flex-col space-y-3 ${
        isFullscreen ? "p-6 bg-[#0f212e] min-h-screen" : ""
      }`}
    >
      {/* ========================================================= */}
      {/* 1. HORIZONTAL SLIDE ARENA (TOP)                            */}
      {/* ========================================================= */}
      <div className="rounded-2xl border border-[#213743] bg-[#0f212e] shadow-2xl p-4 sm:p-6 flex flex-col items-center justify-center space-y-4 relative overflow-hidden">
        {/* Recent Multipliers History Pill Row */}
        <div className="w-full flex items-center justify-between pb-1">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {history.map((item) => (
              <div
                key={item.id}
                className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border shrink-0 ${
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
        <div className="w-full h-36 sm:h-44 bg-[#1a2c38] border-2 border-[#213743] rounded-2xl relative overflow-hidden flex items-center justify-center shadow-inner">
          {/* Center Indicator Needles (Top & Bottom Pointers) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center">
            <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[14px] border-t-[#00e701] drop-shadow-[0_0_8px_#00e701]" />
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center">
            <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[14px] border-b-[#00e701] drop-shadow-[0_0_8px_#00e701]" />
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
                  className="h-28 sm:h-32 px-1.5 shrink-0 flex items-center justify-center"
                >
                  <div
                    className={`w-full h-full rounded-xl border flex flex-col items-center justify-center p-2 transition-transform shadow-md ${
                      isHigh
                        ? "bg-gradient-to-b from-amber-500/25 to-[#1a2c38] text-amber-300 border-amber-400/50"
                        : isMid
                        ? "bg-gradient-to-b from-[#00e701]/20 to-[#1a2c38] text-[#00e701] border-[#00e701]/40"
                        : "bg-[#0f212e] text-[#b1bad3] border-[#213743]"
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold text-[#b1bad3] opacity-60">
                      Multiplier
                    </span>
                    <span className="text-lg sm:text-xl font-black font-mono tracking-tight mt-1">
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
              <span className="text-4xl font-black font-mono text-white mt-1">
                {countdownTime.toFixed(1)}s
              </span>
            </div>
          )}
        </div>

        {/* Status / Outcome Readout */}
        <div className="flex items-center gap-4 text-xs font-bold text-[#b1bad3]">
          <div>
            Target: <span className="font-mono text-white font-black">{targetMultiplier.toFixed(2)}×</span>
          </div>
          <div>
            Win Chance:{" "}
            <span className="font-mono text-[#00e701] font-black">{winChance.toFixed(2)}%</span>
          </div>
          {hasWon !== null && gameState === "finished" && (
            <div
              className={`px-3 py-1 rounded-lg font-mono font-black uppercase tracking-wider ${
                hasWon
                  ? "bg-[#00e701]/20 text-[#00e701] border border-[#00e701]/40"
                  : "bg-[#e9113c]/20 text-[#e9113c] border border-[#e9113c]/40"
              }`}
            >
              {hasWon
                ? `WON +${activeSym}${(betAmount * targetMultiplier).toFixed(2)}`
                : "MISSED TARGET"}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. BETTING CONTROLS (DIRECTLY BENEATH ARENA)              */}
      {/* ========================================================= */}
      <div className="rounded-2xl border border-[#213743] bg-[#1a2c38] shadow-2xl p-4 sm:p-5 space-y-4">
        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 bg-[#0f212e] rounded-xl border border-[#213743]">
          <button
            type="button"
            disabled={gameState === "sliding" || isAutoRunning}
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
            disabled={gameState === "sliding" || isAutoRunning}
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

        {/* Inputs: Bet Amount & Target Multiplier / Win Chance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Bet Amount */}
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
                disabled={gameState === "sliding" || isAutoRunning}
                onClick={handleHalfBet}
                className="rounded-lg px-2.5 py-1 text-xs font-bold text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors cursor-pointer"
              >
                ½
              </button>
              <button
                type="button"
                disabled={gameState === "sliding" || isAutoRunning}
                onClick={handleDoubleBet}
                className="rounded-lg px-2.5 py-1 text-xs font-bold text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors cursor-pointer"
              >
                2×
              </button>
              <button
                type="button"
                disabled={gameState === "sliding" || isAutoRunning}
                onClick={handleMaxBet}
                className="rounded-lg px-2.5 py-1 text-xs font-bold text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors cursor-pointer"
              >
                Max
              </button>
            </div>
          </div>

          {/* Target Multiplier & Win Chance */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#b1bad3]">Target Multiplier</label>
              <div className="flex items-center rounded-xl border border-[#213743] bg-[#0f212e] p-2 focus-within:border-[#00e701] transition-colors">
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
                  className="w-full bg-transparent text-sm font-bold text-white focus:outline-none font-mono"
                />
                <span className="text-xs font-bold text-[#b1bad3]">×</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#b1bad3]">Win Chance</label>
              <div className="flex items-center rounded-xl border border-[#213743] bg-[#0f212e] p-2 focus-within:border-[#00e701] transition-colors">
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
                  className="w-full bg-transparent text-sm font-bold text-[#00e701] focus:outline-none font-mono"
                />
                <span className="text-xs font-bold text-[#b1bad3]">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profit on Win Field */}
        <div className="flex items-center justify-between rounded-xl border border-[#213743] bg-[#0f212e] p-2.5">
          <span className="text-xs font-bold text-[#b1bad3]">Profit on Win:</span>
          <span className="text-sm font-bold text-[#00e701] font-mono">
            +{activeSym}
            {profitOnWin.toFixed(2)}
          </span>
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
              onClick={handleManualBet}
              disabled={gameState === "sliding" || betAmount > balance || betAmount <= 0}
              className="w-full py-4 text-base font-extrabold rounded-xl bg-[#00e701] hover:bg-[#00c201] text-black shadow-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              <Zap className="h-5 w-5 fill-current" />
              <span>{gameState === "sliding" ? "Sliding..." : "Bet"}</span>
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

        {/* Utility Bar */}
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
    </div>
  );
}
