"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Dice5,
  Volume2,
  VolumeX,
  ShieldCheck,
  Maximize2,
  Minimize2,
  ArrowRightLeft,
  Sparkles,
  RefreshCw,
  X,
  Copy,
  Check,
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
  const { balance, updateBalance, currency, formatBalance, currencySymbol, addRecentlyPlayedGame } = useGame();
  const activeSym = currencySymbol || "$";

  // Mode & Betting State
  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [betAmount, setBetAmount] = useState<number>(10);
  const [betInput, setBetInput] = useState<string>("10");

  useEffect(() => {
    if (betInput !== "" && parseFloat(betInput) === betAmount) return;
    setBetInput(betAmount.toString());
  }, [betAmount]);

  const [isRollOver, setIsRollOver] = useState<boolean>(true);
  const [target, setTarget] = useState<number>(50.5);

  // Derived 99% RTP Math State (House edge = 1%)
  const [multiplier, setMultiplier] = useState<number>(2.0);
  const [winChance, setWinChance] = useState<number>(49.5);
  const [multInput, setMultInput] = useState<string>("2.0000");
  const [targetInput, setTargetInput] = useState<string>("50.50");
  const [winChanceInput, setWinChanceInput] = useState<string>("49.50");

  useEffect(() => {
    if (multInput !== "" && parseFloat(multInput) === multiplier) return;
    setMultInput(multiplier.toString());
  }, [multiplier]);

  useEffect(() => {
    if (targetInput !== "" && parseFloat(targetInput) === target) return;
    setTargetInput(target.toString());
  }, [target]);

  useEffect(() => {
    if (winChanceInput !== "" && parseFloat(winChanceInput) === winChance) return;
    setWinChanceInput(winChance.toString());
  }, [winChance]);

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

  // Roll Execution State
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [hasWon, setHasWon] = useState<boolean | null>(null);
  const [displayRoll, setDisplayRoll] = useState<number>(50.5);

  // History strip of last 10 rolls
  const [history, setHistory] = useState<RollHistoryItem[]>([
    { id: "h1", roll: 64.21, isWin: true },
    { id: "h2", roll: 12.05, isWin: false },
    { id: "h3", roll: 88.94, isWin: true },
    { id: "h4", roll: 51.3, isWin: true },
    { id: "h5", roll: 3.42, isWin: false },
    { id: "h6", roll: 77.16, isWin: true },
    { id: "h7", roll: 29.88, isWin: false },
    { id: "h8", roll: 92.4, isWin: true },
  ]);

  // Audio & Fullscreen state
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Provably Fair Modal
  const [isFairnessOpen, setIsFairnessOpen] = useState<boolean>(false);
  const [serverSeedHash] = useState<string>(
    "9c1e7a4b08d2f53e61a8b940c72e1f3a58d69b0c2e4f7a1b3d5c8e9f0a2b4c6e"
  );
  const [clientSeed, setClientSeed] = useState<string>("stake_dice_7721b");
  const [nonce, setNonce] = useState<number>(429);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Register in recently played games once on mount
  useEffect(() => {
    addRecentlyPlayedGame({
      id: "dice",
      slug: "dice",
      title: "Dice",
      href: "/games/dice",
      playersCount: 4890,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sound toggle
  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    sounds.enabled = !next;
  };

  // Math recalculators (99% RTP / 1% House Edge)
  const updateFromTarget = useCallback(
    (newTarget: number, rollOverMode: boolean) => {
      const clamped = Math.max(2.0, Math.min(98.0, parseFloat(newTarget.toFixed(2))));
      setTarget(clamped);

      const calculatedChance = rollOverMode
        ? parseFloat((100.0 - clamped).toFixed(2))
        : parseFloat(clamped.toFixed(2));
      setWinChance(calculatedChance);

      const calculatedMultiplier = parseFloat((99.0 / calculatedChance).toFixed(4));
      setMultiplier(calculatedMultiplier);
    },
    []
  );

  const updateFromMultiplier = (newMultiplier: number) => {
    const clampedMult = Math.max(1.0102, Math.min(49.5, newMultiplier));
    setMultiplier(clampedMult);

    const calculatedChance = parseFloat((99.0 / clampedMult).toFixed(2));
    setWinChance(calculatedChance);

    const calculatedTarget = isRollOver
      ? parseFloat((100.0 - calculatedChance).toFixed(2))
      : calculatedChance;
    setTarget(Math.max(2.0, Math.min(98.0, calculatedTarget)));
  };

  const updateFromWinChance = (newChance: number) => {
    const clampedChance = Math.max(2.0, Math.min(98.0, newChance));
    setWinChance(clampedChance);

    const calculatedMultiplier = parseFloat((99.0 / clampedChance).toFixed(4));
    setMultiplier(calculatedMultiplier);

    const calculatedTarget = isRollOver
      ? parseFloat((100.0 - clampedChance).toFixed(2))
      : clampedChance;
    setTarget(Math.max(2.0, Math.min(98.0, calculatedTarget)));
  };

  // Toggle Roll Over / Roll Under (Inverts condition while preserving Win Chance)
  const toggleRollMode = () => {
    sounds.playClick();
    const nextMode = !isRollOver;
    setIsRollOver(nextMode);
    const newTarget = parseFloat((100.0 - target).toFixed(2));
    updateFromTarget(newTarget, nextMode);
  };

  // Quick Bet Math Actions
  const handleHalfBet = () => {
    sounds.playClick();
    const next = Math.max(0.01, parseFloat((betAmount / 2).toFixed(2)));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  const handleDoubleBet = () => {
    sounds.playClick();
    const next = parseFloat((betAmount * 2).toFixed(2));
    const capped = Math.min(next, Math.max(1, parseFloat(balance.toFixed(2))));
    setBetAmount(capped);
    setBetInput(capped.toString());
  };

  const handleMaxBet = () => {
    sounds.playClick();
    const next = Math.max(1, parseFloat(balance.toFixed(2)));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  // Roll Dice Execution
  const rollDice = useCallback(() => {
    if (isRolling) return;
    const effectiveBet =
      betInput === "" || isNaN(parseFloat(betInput)) || parseFloat(betInput) <= 0
        ? 1
        : parseFloat(betInput);

    if (betInput === "" || isNaN(parseFloat(betInput))) {
      setBetInput(effectiveBet.toString());
      setBetAmount(effectiveBet);
    }

    if (effectiveBet > balance) {
      setIsAutoRunning(false);
      return;
    }
    if (effectiveBet <= 0) return;

    // Deduct bet amount immediately
    updateBalance(-effectiveBet);
    setNonce((n) => n + 1);
    setIsRolling(true);
    setHasWon(null);

    sounds.playDiceRoll();

    // Rapid shuffle animation for 200ms
    const shuffleStart = performance.now();
    const interval = setInterval(() => {
      setDisplayRoll(parseFloat((Math.random() * 100).toFixed(2)));
      if (performance.now() - shuffleStart > 200) {
        clearInterval(interval);

        // Final random roll outcome (0.00 to 100.00)
        const finalRoll = parseFloat((Math.random() * 100).toFixed(2));
        setDisplayRoll(finalRoll);
        setLastRoll(finalRoll);

        const won = isRollOver ? finalRoll > target : finalRoll < target;
        setHasWon(won);
        setIsRolling(false);

        if (won) {
          const payout = parseFloat((effectiveBet * multiplier).toFixed(2));
          updateBalance(payout);
          sounds.playDiceWin();

          if (multiplier >= 5) {
            try {
              confetti({
                particleCount: 60,
                spread: 60,
                origin: { y: 0.6 },
                colors: ["#00e701", "#ffffff", "#facc15"],
              });
            } catch {
              // ignore
            }
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

          if (won) {
            if (onWinAction === "increase") {
              setBetAmount((b) => parseFloat((b * (1 + onWinPercent / 100)).toFixed(2)));
            } else {
              setBetAmount(baseBetRef.current);
            }
          } else {
            if (onLossAction === "increase") {
              setBetAmount((b) => parseFloat((b * (1 + onLossPercent / 100)).toFixed(2)));
            } else {
              setBetAmount(baseBetRef.current);
            }
          }

          const currentNet = balance - initialAutoBalanceRef.current;
          if (stopOnProfit > 0 && currentNet >= stopOnProfit) setIsAutoRunning(false);
          if (stopOnLoss > 0 && -currentNet >= stopOnLoss) setIsAutoRunning(false);
        }
      }
    }, 25);
  }, [
    autoBetsLimit,
    balance,
    betInput,
    isAutoRunning,
    isRolling,
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

  // Spacebar hotkey
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
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
  }, [rollDice]);

  // Copy helper
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1800);
  };

  return (
    <div
      className={`w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-3 select-none space-y-3 relative z-0 pointer-events-auto ${
        isFullscreen ? "fixed inset-0 z-40 bg-[#0f212e] overflow-y-auto p-4 pb-6 max-w-none" : ""
      }`}
    >
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-bold text-[#b1bad3] hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Casino Lobby</span>
        </Link>

        {/* Live Roll History Strip (Last 10 Rolls) */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[11px] font-bold text-[#b1bad3] uppercase tracking-wider hidden sm:inline mr-1">
            History:
          </span>
          {history.map((h) => (
            <span
              key={h.id}
              className={`rounded-lg px-2 py-0.5 text-xs font-mono font-black border transition-colors shrink-0 ${
                h.isWin
                  ? "bg-[#00e701]/15 text-[#00e701] border-[#00e701]/30 shadow-sm"
                  : "bg-[#213743] text-[#b1bad3] border-[#2f4553]"
              }`}
            >
              {h.roll.toFixed(2)}
            </span>
          ))}
        </div>
      </div>

      {/* Main 2-Panel Game Container: Left Controls & Right Slider Arena */}
      <div className="rounded-2xl border border-[#213743] bg-[#1a2c38] shadow-2xl overflow-hidden flex flex-col-reverse lg:flex-row">
        {/* ======================================================== */}
        {/* 1. BETTING CONTROLS (Left Panel on Desktop)             */}
        {/* ======================================================== */}
        <div className="w-full lg:w-[320px] xl:w-[340px] shrink-0 border-t lg:border-t-0 lg:border-r border-[#213743] bg-[#1a2c38] p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* Mode Switch Tabs: Manual vs Auto */}
            <div className="grid grid-cols-2 rounded-xl bg-[#0f212e] p-1 border border-[#213743]">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setMode("manual");
                  setIsAutoRunning(false);
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

            {/* Bet Amount Input with Quick Math Buttons */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-[#b1bad3]">
                <span>Bet Amount</span>
                <span className="font-mono text-[#00e701]">
                  {activeSym}{formatBalance(balance)}
                </span>
              </div>
              <div className="flex items-center rounded-xl border border-[#213743] bg-[#0f212e] p-1 focus-within:border-[#00e701] transition-colors">
                <span className="px-2 text-sm font-bold text-[#b1bad3]">{activeSym}</span>
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
                  className="w-full bg-transparent text-sm font-bold text-white focus:outline-none font-mono"
                />
                <button
                  type="button"
                  disabled={isRolling}
                  onClick={handleHalfBet}
                  className="rounded-lg px-2.5 py-1 text-xs font-bold text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors cursor-pointer"
                >
                  ½
                </button>
                <button
                  type="button"
                  disabled={isRolling}
                  onClick={handleDoubleBet}
                  className="rounded-lg px-2.5 py-1 text-xs font-bold text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors cursor-pointer"
                >
                  2×
                </button>
                <button
                  type="button"
                  disabled={isRolling}
                  onClick={handleMaxBet}
                  className="rounded-lg px-2.5 py-1 text-xs font-bold text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors cursor-pointer"
                >
                  Max
                </button>
              </div>
            </div>

            {/* Profit on Win Display */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-[#b1bad3]">
                <span>Profit on Win</span>
                <span className="font-mono text-[#00e701]">
                  +{activeSym}{(betAmount * (multiplier - 1)).toFixed(2)} {currency}
                </span>
              </div>
              <div className="flex items-center rounded-xl border border-[#213743] bg-[#0f212e] px-3 py-2 text-sm font-mono font-bold text-white">
                {activeSym}{(betAmount * multiplier).toFixed(2)}
              </div>
            </div>

            {/* Auto Mode Configuration Inputs */}
            {mode === "auto" && (
              <div className="space-y-3 pt-2 border-t border-[#213743]/60 text-xs">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#b1bad3]">Number of Bets</label>
                  <div className="flex items-center rounded-xl border border-[#213743] bg-[#0f212e] px-3 py-1.5">
                    <input
                      type="number"
                      min="0"
                      placeholder="∞"
                      value={autoBetsLimit === 0 ? "" : autoBetsLimit}
                      onChange={(e) => setAutoBetsLimit(parseInt(e.target.value) || 0)}
                      className="w-full bg-transparent text-xs font-bold text-white font-mono focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setAutoBetsLimit(0)}
                      className="text-[11px] font-bold text-[#00e701] hover:underline cursor-pointer"
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
                      className="w-full rounded-lg bg-[#0f212e] border border-[#213743] p-1.5 text-xs text-white"
                    >
                      <option value="reset">Reset</option>
                      <option value="increase">Increase %</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#b1bad3] uppercase">On Loss</label>
                    <select
                      value={onLossAction}
                      onChange={(e) => setOnLossAction(e.target.value as "reset" | "increase")}
                      className="w-full rounded-lg bg-[#0f212e] border border-[#213743] p-1.5 text-xs text-white"
                    >
                      <option value="reset">Reset</option>
                      <option value="increase">Increase %</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] text-[#b1bad3] px-1 font-mono">
                  <span>Bets Completed:</span>
                  <span className="text-white font-bold">{autoBetsCount} / {autoBetsLimit === 0 ? "∞" : autoBetsLimit}</span>
                </div>
              </div>
            )}
          </div>

          {/* PRIMARY CTA: Full-Width Vibrant Stake Green Button */}
          <div className="pt-2">
            {mode === "auto" ? (
              <button
                type="button"
                onClick={() => {
                  if (isAutoRunning) {
                    setIsAutoRunning(false);
                  } else {
                    initialAutoBalanceRef.current = balance;
                    baseBetRef.current = betAmount;
                    setAutoBetsCount(0);
                    setIsAutoRunning(true);
                  }
                }}
                className={`w-full py-4 text-base font-black rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isAutoRunning
                    ? "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25"
                    : "bg-[#00e701] hover:bg-[#00c201] text-[#0f212e] shadow-[0_0_20px_rgba(0,231,1,0.25)]"
                }`}
              >
                {isAutoRunning ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span>Stop Auto Bet</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 fill-current" />
                    <span>Start Auto Bet</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={rollDice}
                disabled={isRolling || betAmount > balance || betAmount <= 0}
                className="w-full py-4 text-base font-black rounded-xl bg-[#00e701] hover:bg-[#00c201] text-[#0f212e] shadow-[0_0_20px_rgba(0,231,1,0.25)] hover:shadow-[0_0_28px_rgba(0,231,1,0.4)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                <Dice5 className={`h-5 w-5 ${isRolling ? "animate-spin" : ""}`} />
                <span>{isRolling ? "Rolling..." : "Bet"}</span>
              </button>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. DICE SLIDER ARENA (Right Panel on Desktop)            */}
        {/* ======================================================== */}
        <div className="flex-1 bg-[#0f212e] p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-between min-h-[440px] sm:min-h-[540px] relative overflow-hidden">
          {/* Top Status Bar in Arena */}
          <div className="w-full flex items-center justify-between z-10">
            <div className="flex items-center gap-2 text-xs font-bold text-[#b1bad3]">
              <span className="flex h-2 w-2 rounded-full bg-[#00e701] animate-pulse" />
              <span>Provably Fair 99% RTP</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleRollMode}
                className="flex items-center gap-2 rounded-xl border border-[#213743] bg-[#1a2c38] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#213743] hover:border-[#2f4553] transition-colors cursor-pointer"
              >
                <ArrowRightLeft className="h-3.5 w-3.5 text-[#00e701]" />
                <span>Mode: {isRollOver ? "Roll Over" : "Roll Under"}</span>
              </button>

              <button
                type="button"
                onClick={toggleSound}
                title={isMuted ? "Unmute Audio" : "Mute Audio"}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1a2c38] border border-[#213743] text-[#b1bad3] hover:text-white transition-colors cursor-pointer"
              >
                {isMuted ? (
                  <VolumeX className="h-3.5 w-3.5 text-red-400" />
                ) : (
                  <Volume2 className="h-3.5 w-3.5 text-[#00e701]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1a2c38] border border-[#213743] text-[#b1bad3] hover:text-white transition-colors cursor-pointer"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-3.5 w-3.5" />
                ) : (
                  <Maximize2 className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Central Result Display Box */}
          <div className="my-auto flex flex-col items-center text-center space-y-3 z-10">
            <div
              className={`rounded-2xl border-2 px-8 py-5 bg-[#1a2c38] shadow-2xl transition-all duration-200 min-w-[220px] ${
                hasWon === true
                  ? "border-[#00e701] shadow-[#00e701]/30 animate-in zoom-in-95"
                  : hasWon === false
                  ? "border-[#e9113c] shadow-[#e9113c]/30 animate-bomb-shake"
                  : "border-[#213743]"
              }`}
            >
              <div
                className={`text-5xl sm:text-7xl font-black font-mono tracking-tight transition-colors ${
                  hasWon === true
                    ? "text-[#00e701] drop-shadow-[0_0_20px_rgba(0,231,1,0.6)]"
                    : hasWon === false
                    ? "text-[#e9113c] drop-shadow-[0_0_20px_rgba(233,17,60,0.6)]"
                    : "text-white"
                }`}
              >
                {displayRoll.toFixed(2)}
              </div>
              <div className="mt-1 text-xs font-extrabold uppercase tracking-widest text-[#b1bad3]">
                {hasWon === true
                  ? `Won +$${(betAmount * (multiplier - 1)).toFixed(2)}`
                  : hasWon === false
                  ? "Loss"
                  : `Target: ${isRollOver ? ">" : "<"} ${target.toFixed(2)}`}
              </div>
            </div>
          </div>

          {/* Interactive Slider & Target Track */}
          <div className="w-full max-w-2xl px-2 sm:px-6 space-y-3 z-10 my-4">
            <div className="relative flex flex-col items-center">
              {/* Rolled Result Pointer on the Track */}
              {lastRoll !== null && (
                <div
                  className="absolute -top-8 z-30 transition-all duration-300 pointer-events-none transform -translate-x-1/2 flex flex-col items-center"
                  style={{ left: `${Math.min(98, Math.max(2, lastRoll))}%` }}
                >
                  <div
                    className={`rounded-md px-2 py-0.5 text-[11px] font-black font-mono shadow-md ${
                      hasWon ? "bg-[#00e701] text-[#0f212e]" : "bg-[#e9113c] text-white"
                    }`}
                  >
                    {lastRoll.toFixed(2)}
                  </div>
                  <div
                    className={`w-0 h-0 border-x-4 border-x-transparent border-t-4 ${
                      hasWon ? "border-t-[#00e701]" : "border-t-[#e9113c]"
                    }`}
                  />
                </div>
              )}

              {/* Two-Tone Colored Track: Loss Zone vs Win Zone */}
              <div className="relative w-full h-4 rounded-full overflow-hidden bg-[#213743] shadow-inner">
                {isRollOver ? (
                  <>
                    {/* Loss Zone (0 to Target) */}
                    <div
                      className="absolute top-0 bottom-0 left-0 bg-[#e9113c] transition-all duration-75"
                      style={{ width: `${target}%` }}
                    />
                    {/* Win Zone (Target to 100) */}
                    <div
                      className="absolute top-0 bottom-0 right-0 bg-[#00e701] transition-all duration-75"
                      style={{ width: `${100 - target}%` }}
                    />
                  </>
                ) : (
                  <>
                    {/* Win Zone (0 to Target) */}
                    <div
                      className="absolute top-0 bottom-0 left-0 bg-[#00e701] transition-all duration-75"
                      style={{ width: `${target}%` }}
                    />
                    {/* Loss Zone (Target to 100) */}
                    <div
                      className="absolute top-0 bottom-0 right-0 bg-[#e9113c] transition-all duration-75"
                      style={{ width: `${100 - target}%` }}
                    />
                  </>
                )}
              </div>

              {/* Real HTML Range Input for Seamless Drag & Touch */}
              <input
                type="range"
                min="2.00"
                max="98.00"
                step="0.01"
                disabled={isRolling}
                value={target}
                onChange={(e) => updateFromTarget(parseFloat(e.target.value), isRollOver)}
                className="absolute inset-0 w-full h-4 opacity-0 cursor-ew-resize z-20"
              />

              {/* Stake Diamond Handle Indicator */}
              <div
                className="absolute top-1/2 -translate-y-1/2 z-10 pointer-events-none transform -translate-x-1/2 transition-transform duration-75"
                style={{ left: `${target}%` }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-[#0f212e] shadow-xl border-2 border-[#1a2c38] transform hover:scale-110">
                  <span className="text-xs font-black select-none">◆</span>
                </div>
              </div>
            </div>

            {/* Slider Scale Markers: 0, 25, 50, 75, 100 */}
            <div className="flex justify-between px-1 text-xs font-mono font-bold text-[#b1bad3] select-none">
              <span>0</span>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100</span>
            </div>
          </div>

          {/* Bottom 3 Synchronized Value Input Strip (Multiplier, Target, Win Chance) */}
          <div className="w-full max-w-2xl grid grid-cols-3 gap-3 border-t border-[#213743] pt-3 z-10">
            {/* Multiplier Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#b1bad3]">
                Multiplier
              </label>
              <div className="flex items-center rounded-xl border border-[#213743] bg-[#1a2c38] px-3 py-1.5 focus-within:border-[#00e701] transition-colors">
                <input
                  type="text"
                  inputMode="decimal"
                  disabled={isRolling}
                  value={multInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || /^\d*\.?\d*$/.test(val)) {
                      setMultInput(val);
                      if (val !== "") {
                        const num = parseFloat(val);
                        if (!isNaN(num) && num >= 1.0102) {
                          updateFromMultiplier(num);
                        }
                      }
                    }
                  }}
                  onBlur={() => {
                    if (multInput === "" || parseFloat(multInput) < 1.0102 || isNaN(parseFloat(multInput))) {
                      updateFromMultiplier(2.0);
                      setMultInput("2.0000");
                    } else {
                      const num = parseFloat(multInput);
                      updateFromMultiplier(num);
                      setMultInput(num.toString());
                    }
                  }}
                  className="w-full bg-transparent text-xs font-mono font-bold text-white focus:outline-none"
                />
                <span className="text-xs font-bold text-[#b1bad3]">×</span>
              </div>
            </div>

            {/* Target Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#b1bad3]">
                {isRollOver ? "Roll Over" : "Roll Under"}
              </label>
              <div className="flex items-center rounded-xl border border-[#213743] bg-[#1a2c38] px-3 py-1.5 focus-within:border-[#00e701] transition-colors">
                <input
                  type="text"
                  inputMode="decimal"
                  disabled={isRolling}
                  value={targetInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || /^\d*\.?\d*$/.test(val)) {
                      setTargetInput(val);
                      if (val !== "") {
                        const num = parseFloat(val);
                        if (!isNaN(num) && num >= 2 && num <= 98) {
                          updateFromTarget(num, isRollOver);
                        }
                      }
                    }
                  }}
                  onBlur={() => {
                    if (targetInput === "" || isNaN(parseFloat(targetInput))) {
                      updateFromTarget(50.0, isRollOver);
                      setTargetInput("50.00");
                    } else {
                      const num = parseFloat(targetInput);
                      updateFromTarget(num, isRollOver);
                      setTargetInput(num.toString());
                    }
                  }}
                  className="w-full bg-transparent text-xs font-mono font-bold text-white focus:outline-none"
                />
                <span className="text-xs font-bold text-[#b1bad3]">
                  {isRollOver ? ">" : "<"}
                </span>
              </div>
            </div>

            {/* Win Chance Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#b1bad3]">
                Win Chance
              </label>
              <div className="flex items-center rounded-xl border border-[#213743] bg-[#1a2c38] px-3 py-1.5 focus-within:border-[#00e701] transition-colors">
                <input
                  type="text"
                  inputMode="decimal"
                  disabled={isRolling}
                  value={winChanceInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || /^\d*\.?\d*$/.test(val)) {
                      setWinChanceInput(val);
                      if (val !== "") {
                        const num = parseFloat(val);
                        if (!isNaN(num) && num >= 2 && num <= 98) {
                          updateFromWinChance(num);
                        }
                      }
                    }
                  }}
                  onBlur={() => {
                    if (winChanceInput === "" || isNaN(parseFloat(winChanceInput))) {
                      updateFromWinChance(49.5);
                      setWinChanceInput("49.50");
                    } else {
                      const num = parseFloat(winChanceInput);
                      updateFromWinChance(num);
                      setWinChanceInput(num.toString());
                    }
                  }}
                  className="w-full bg-transparent text-xs font-mono font-bold text-[#00e701] focus:outline-none"
                />
                <span className="text-xs font-bold text-[#b1bad3]">%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. PROVABLY FAIR VERIFIER MODAL                          */}
      {/* ======================================================== */}
      {isFairnessOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsFairnessOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
          <div className="w-full max-w-lg rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 shadow-2xl space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-[#213743] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00e701]/15 text-[#00e701]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black">Dice Provably Fair</h3>
                  <p className="text-xs text-[#b1bad3]">
                    100% cryptographic SHA-256 verification of dice roll result
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFairnessOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#b1bad3] hover:bg-[#213743] hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-[#b1bad3]">
              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-[10px]">
                  Server Seed (SHA-256 Hash)
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-[#213743] bg-[#0f212e] px-3 py-2">
                  <span className="font-mono text-white text-[11px] truncate flex-1">
                    {serverSeedHash}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(serverSeedHash, "server")}
                    className="text-[#b1bad3] hover:text-[#00e701] cursor-pointer"
                  >
                    {copiedField === "server" ? (
                      <Check className="h-3.5 w-3.5 text-[#00e701]" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-[10px]">
                  Client Seed
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-[#213743] bg-[#0f212e] px-3 py-2">
                  <input
                    type="text"
                    value={clientSeed}
                    onChange={(e) => setClientSeed(e.target.value)}
                    className="font-mono text-white text-xs bg-transparent focus:outline-none flex-1"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setClientSeed(`stake_${Math.random().toString(36).substring(2, 9)}`)
                    }
                    title="Generate Random Client Seed"
                    className="text-[#b1bad3] hover:text-[#00e701] cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wider text-[10px]">
                  Nonce (Roll Counter)
                </label>
                <div className="rounded-xl border border-[#213743] bg-[#0f212e] px-3 py-2 font-mono text-white font-bold">
                  {nonce}
                </div>
              </div>

              <div className="rounded-xl border border-[#213743] bg-[#0f212e] p-3 text-[11px] space-y-1">
                <div className="font-bold text-white">Dice Roll Formula:</div>
                <div className="font-mono text-[#00e701]">
                  Roll = (Hash(ServerSeed, ClientSeed, Nonce) % 10001) / 100
                </div>
                <div>Where House Edge = 1.00% (99.00% RTP).</div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#213743]">
              <button
                type="button"
                onClick={() => setIsFairnessOpen(false)}
                className="w-full py-2.5 rounded-xl bg-[#00e701] hover:bg-[#00c201] text-[#0f212e] font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
