"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  TrendingUp,
  Volume2,
  VolumeX,
  ShieldCheck,
  Maximize2,
  Minimize2,
  X,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Zap,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

interface HistoryItem {
  id: string;
  multiplier: number;
}

interface TrailParticle {
  x: number;
  y: number;
  alpha: number;
  size: number;
  vx: number;
  vy: number;
}

export default function CrashPage() {
  const { balance, updateBalance, currency, formatBalance } = useGame();

  // Mode: Manual or Auto
  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [betAmount, setBetAmount] = useState<number>(10);
  const [autoCashout, setAutoCashout] = useState<number>(2.0);
  const [autoCashoutEnabled, setAutoCashoutEnabled] = useState<boolean>(true);

  // Round Phases: "countdown" | "flying" | "crashed"
  const [phase, setPhase] = useState<"countdown" | "flying" | "crashed">("countdown");
  const [countdownSeconds, setCountdownSeconds] = useState<number>(5.0);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1.0);
  const [crashPoint, setCrashPoint] = useState<number>(2.0);

  // User Bet State for current round
  const [hasBetNextRound, setHasBetNextRound] = useState<boolean>(false);
  const [activeBetAmount, setActiveBetAmount] = useState<number>(0);
  const [hasCashedOut, setHasCashedOut] = useState<boolean>(false);
  const [cashedOutMultiplier, setCashedOutMultiplier] = useState<number | null>(null);

  // Last 7 round multipliers history
  const [history, setHistory] = useState<HistoryItem[]>([
    { id: "h1", multiplier: 2.45 },
    { id: "h2", multiplier: 1.15 },
    { id: "h3", multiplier: 14.8 },
    { id: "h4", multiplier: 1.98 },
    { id: "h5", multiplier: 3.2 },
    { id: "h6", multiplier: 1.05 },
    { id: "h7", multiplier: 4.62 },
  ]);

  // Audio & Fullscreen state
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Provably Fair Modal
  const [isFairnessOpen, setIsFairnessOpen] = useState<boolean>(false);
  const [serverSeedHash, setServerSeedHash] = useState<string>(
    "5c89f1a23e78b409cd83a129f104d5e9b72a4c198e3b5a76cf921d45a9e38f12"
  );
  const [clientSeed, setClientSeed] = useState<string>("stake_crash_68fa1");
  const [nonce, setNonce] = useState<number>(284);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Refs for Canvas & Animation Loop
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const flightStartTimeRef = useRef<number>(0);
  const lastTickTimeRef = useRef<number>(0);
  const particlesRef = useRef<TrailParticle[]>([]);

  // Calculate live running profit
  const liveProfit =
    activeBetAmount > 0 && !hasCashedOut
      ? parseFloat((activeBetAmount * (currentMultiplier - 1)).toFixed(2))
      : 0;

  // Sound toggle
  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    sounds.enabled = !next;
  };

  // Math action buttons
  const handleHalfBet = () => {
    sounds.playClick();
    setBetAmount((prev) => Math.max(1, parseFloat((prev / 2).toFixed(2))));
  };

  const handleDoubleBet = () => {
    sounds.playClick();
    setBetAmount((prev) => {
      const next = parseFloat((prev * 2).toFixed(2));
      return Math.min(next, Math.max(1, parseFloat(balance.toFixed(2))));
    });
  };

  const handleMaxBet = () => {
    sounds.playClick();
    setBetAmount(Math.max(1, parseFloat(balance.toFixed(2))));
  };

  // Queue or toggle bet for next round
  const toggleBetForNextRound = () => {
    sounds.playClick();
    if (hasBetNextRound) {
      // Cancel queued bet
      setHasBetNextRound(false);
    } else {
      if (betAmount > balance) {
        alert("Insufficient balance! Please use the Wallet button to top up.");
        return;
      }
      if (betAmount <= 0) return;
      setHasBetNextRound(true);
    }
  };

  // Cashout during flight
  const cashout = useCallback(
    (forcedMult?: number) => {
      if (hasCashedOut || activeBetAmount <= 0 || phase !== "flying") return;

      const mult = forcedMult || currentMultiplier;
      sounds.playCashout();
      setHasCashedOut(true);
      setCashedOutMultiplier(mult);

      const winPayout = parseFloat((activeBetAmount * mult).toFixed(2));
      updateBalance(winPayout);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.55 },
          colors: ["#00e701", "#ffffff", "#1475e1", "#facc15"],
        });
      } catch {
        // ignore
      }
    },
    [activeBetAmount, currentMultiplier, hasCashedOut, phase, updateBalance]
  );

  // Auto cashout listener during flight
  useEffect(() => {
    if (
      phase === "flying" &&
      activeBetAmount > 0 &&
      !hasCashedOut &&
      autoCashoutEnabled &&
      autoCashout > 1.0 &&
      currentMultiplier >= autoCashout
    ) {
      cashout(autoCashout);
    }
  }, [currentMultiplier, phase, activeBetAmount, hasCashedOut, autoCashoutEnabled, autoCashout, cashout]);

  // Generate random crash point with 1% house edge
  const generateCrashPoint = (): number => {
    const rand = Math.random();
    let point = parseFloat((0.99 / (1 - rand)).toFixed(2));
    if (point < 1.01) point = 1.01;
    if (point > 150.0) point = 150.0;
    return point;
  };

  // -------------------------------------------------------------
  // GAME LOOP STATE MACHINE (Countdown -> Flying -> Crashed -> Loop)
  // -------------------------------------------------------------
  useEffect(() => {
    let timerId: NodeJS.Timeout;

    if (phase === "countdown") {
      setCurrentMultiplier(1.0);
      setHasCashedOut(false);
      setCashedOutMultiplier(null);
      particlesRef.current = [];

      const targetDuration = 5.0;
      const startTime = performance.now();

      const countdownInterval = setInterval(() => {
        const elapsed = (performance.now() - startTime) / 1000;
        const remaining = Math.max(0, targetDuration - elapsed);
        setCountdownSeconds(parseFloat(remaining.toFixed(1)));

        if (remaining <= 0) {
          clearInterval(countdownInterval);

          // Transition to Flying Phase
          const nextPoint = generateCrashPoint();
          setCrashPoint(nextPoint);
          setNonce((n) => n + 1);

          // If user bet was queued, deduct from balance now
          if (hasBetNextRound) {
            updateBalance(-betAmount);
            setActiveBetAmount(betAmount);
            setHasBetNextRound(false);
          } else {
            setActiveBetAmount(0);
          }

          setPhase("flying");
          flightStartTimeRef.current = performance.now();
          lastTickTimeRef.current = performance.now();
        }
      }, 50);

      return () => clearInterval(countdownInterval);
    } else if (phase === "crashed") {
      sounds.playCrash();

      // Display crashed point for 3.2s, then restart countdown
      timerId = setTimeout(() => {
        setPhase("countdown");
      }, 3200);

      return () => clearTimeout(timerId);
    }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // -------------------------------------------------------------
  // 60 FPS HTML5 CANVAS RENDERING ENGINE
  // -------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isRunning = true;

    const render = (time: number) => {
      if (!isRunning) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = rect.width;
      const height = rect.height;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // 1. Clear background
      ctx.fillStyle = "#0f212e";
      ctx.fillRect(0, 0, width, height);

      // 2. Subtle Grid Lines (Axes & Coordinates)
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#21374355";
      const gridRows = 5;
      const gridCols = 6;
      for (let r = 1; r < gridRows; r++) {
        const y = (height / gridRows) * r;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      for (let c = 1; c < gridCols; c++) {
        const x = (width / gridCols) * c;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // 3. Dynamic Progress / Multiplier Math during Flight
      if (phase === "flying") {
        const elapsedSec = (time - flightStartTimeRef.current) / 1000;
        // Stake exponential curve: M(t) = e^(0.06 * t)
        const mult = parseFloat(Math.exp(0.065 * elapsedSec).toFixed(2));

        if (mult >= crashPoint) {
          // Crash trigger!
          setCurrentMultiplier(crashPoint);
          setPhase("crashed");
          setHistory((prev) => [
            { id: `h-${Date.now()}`, multiplier: crashPoint },
            ...prev.slice(0, 6),
          ]);
        } else {
          setCurrentMultiplier(mult);

          // Audio ticking feedback
          if (time - lastTickTimeRef.current > Math.max(120, 450 - mult * 30)) {
            sounds.playTick(mult);
            lastTickTimeRef.current = time;
          }
        }
      }

      // 4. Draw Exponential Curve Trajectory
      const originX = 24;
      const originY = height - 28;
      const maxX = width - 40;
      const maxY = 40;

      if (phase === "flying" || phase === "crashed") {
        const durationEst = Math.log(Math.max(crashPoint, 2.0)) / 0.065;
        const currentElapsed =
          phase === "crashed"
            ? durationEst
            : (time - flightStartTimeRef.current) / 1000;

        const progress = Math.min(1.0, currentElapsed / Math.max(durationEst, 1.0));

        // Tip position
        const tipX = originX + (maxX - originX) * Math.min(progress, 0.95);
        const curveNormalized = Math.pow(Math.min(progress, 0.95), 1.6);
        const tipY = originY - (originY - maxY) * curveNormalized;

        // Path gradient & stroke
        const isCrashed = phase === "crashed";
        const strokeColor = isCrashed ? "#ef4444" : "#00e701";
        const glowColor = isCrashed ? "rgba(239,68,68,0.4)" : "rgba(0,231,1,0.4)";

        // Curve Area Fill
        const gradient = ctx.createLinearGradient(0, maxY, 0, originY);
        gradient.addColorStop(0, isCrashed ? "rgba(239,68,68,0.25)" : "rgba(0,231,1,0.25)");
        gradient.addColorStop(1, "rgba(15,33,46,0)");

        ctx.beginPath();
        ctx.moveTo(originX, originY);
        const steps = 30;
        for (let i = 1; i <= steps; i++) {
          const tStep = (i / steps) * Math.min(progress, 0.95);
          const px = originX + (maxX - originX) * tStep;
          const py = originY - (originY - maxY) * Math.pow(tStep, 1.6);
          ctx.lineTo(px, py);
        }
        ctx.lineTo(tipX, originY);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Curve Stroke
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        for (let i = 1; i <= steps; i++) {
          const tStep = (i / steps) * Math.min(progress, 0.95);
          const px = originX + (maxX - originX) * tStep;
          const py = originY - (originY - maxY) * Math.pow(tStep, 1.6);
          ctx.lineTo(px, py);
        }
        ctx.lineWidth = 4;
        ctx.strokeStyle = strokeColor;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 14;
        ctx.stroke();
        ctx.shadowBlur = 0; // reset

        // Particle Trail update
        if (phase === "flying") {
          particlesRef.current.push({
            x: tipX,
            y: tipY,
            alpha: 1.0,
            size: Math.random() * 3 + 2,
            vx: (Math.random() - 0.7) * 2,
            vy: (Math.random() - 0.2) * 2,
          });
        }

        // Render & age particles
        for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const p = particlesRef.current[i];
          p.x += p.vx;
          p.y += p.vy;
          p.alpha -= 0.035;
          if (p.alpha <= 0) {
            particlesRef.current.splice(i, 1);
            continue;
          }
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = isCrashed
            ? `rgba(239, 68, 68, ${p.alpha})`
            : `rgba(0, 231, 1, ${p.alpha})`;
          ctx.fill();
        }

        // Glowing Dot/Rocket at Curve Tip
        ctx.beginPath();
        ctx.arc(tipX, tipY, 7, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = strokeColor;
        ctx.shadowBlur = 16;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.beginPath();
        ctx.arc(tipX, tipY, 11, 0, Math.PI * 2);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.restore();
      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [phase, crashPoint]);

  // Copy helper
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1800);
  };

  return (
    <div
      className={`w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 select-none space-y-4 ${
        isFullscreen ? "fixed inset-0 z-50 bg-[#0f212e] overflow-y-auto p-4 max-w-none" : ""
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

        {/* Live Multiplier History Strip (Last 7 Rounds) */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[11px] font-bold text-[#b1bad3] uppercase tracking-wider hidden sm:inline mr-1">
            History:
          </span>
          {history.map((h) => {
            const isHigh = h.multiplier >= 2.0;
            return (
              <span
                key={h.id}
                className={`rounded-lg px-2 py-0.5 text-xs font-mono font-bold border transition-colors ${
                  isHigh
                    ? "bg-[#00e701]/15 text-[#00e701] border-[#00e701]/30 shadow-sm"
                    : "bg-[#213743] text-[#b1bad3] border-[#2f4553]"
                }`}
              >
                {h.multiplier.toFixed(2)}x
              </span>
            );
          })}
        </div>
      </div>

      {/* Main 2-Panel Game Container */}
      <div className="rounded-2xl border border-[#213743] bg-[#1a2c38] shadow-2xl overflow-hidden flex flex-col-reverse lg:flex-row">
        {/* ======================================================== */}
        {/* 1. BETTING CONTROLS (Left Panel on Desktop / Bottom on Mobile) */}
        {/* ======================================================== */}
        <div className="w-full lg:w-[320px] shrink-0 border-t lg:border-t-0 lg:border-r border-[#213743] bg-[#1a2c38] p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* Mode Switch Tabs: Manual vs Auto */}
            <div className="flex rounded-xl bg-[#0f212e] p-1 border border-[#213743]">
              <button
                onClick={() => {
                  sounds.playClick();
                  setMode("manual");
                }}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                  mode === "manual"
                    ? "bg-[#213743] text-white shadow-sm"
                    : "text-[#b1bad3] hover:text-white"
                }`}
              >
                Manual
              </button>
              <button
                onClick={() => {
                  sounds.playClick();
                  setMode("auto");
                }}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
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
                  ${formatBalance(balance)} {currency}
                </span>
              </div>
              <div className="flex items-center rounded-xl border border-[#213743] bg-[#0f212e] p-1 focus-within:border-[#00e701] transition-colors">
                <span className="px-2 text-sm font-bold text-[#00e701]">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  disabled={phase === "flying" && activeBetAmount > 0}
                  value={betAmount}
                  onChange={(e) =>
                    setBetAmount(Math.max(0, parseFloat(e.target.value) || 0))
                  }
                  className="w-full bg-transparent text-sm font-bold text-white focus:outline-none font-mono"
                />
                <button
                  type="button"
                  disabled={phase === "flying" && activeBetAmount > 0}
                  onClick={handleHalfBet}
                  className="rounded-lg px-2 py-1 text-xs font-bold text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors"
                >
                  ½
                </button>
                <button
                  type="button"
                  disabled={phase === "flying" && activeBetAmount > 0}
                  onClick={handleDoubleBet}
                  className="rounded-lg px-2 py-1 text-xs font-bold text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors"
                >
                  2×
                </button>
                <button
                  type="button"
                  disabled={phase === "flying" && activeBetAmount > 0}
                  onClick={handleMaxBet}
                  className="rounded-lg px-2 py-1 text-xs font-bold text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors"
                >
                  Max
                </button>
              </div>
            </div>

            {/* Auto Cashout Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-[#b1bad3]">
                <label className="cursor-pointer flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={autoCashoutEnabled}
                    onChange={(e) => setAutoCashoutEnabled(e.target.checked)}
                    className="rounded accent-[#00e701] cursor-pointer"
                  />
                  <span>Auto Cashout</span>
                </label>
                <span className="text-white font-mono">{autoCashout.toFixed(2)}x</span>
              </div>
              <div className="flex items-center rounded-xl border border-[#213743] bg-[#0f212e] p-2">
                <input
                  type="number"
                  step="0.1"
                  min="1.01"
                  disabled={!autoCashoutEnabled}
                  value={autoCashout}
                  onChange={(e) =>
                    setAutoCashout(Math.max(1.01, parseFloat(e.target.value) || 1.01))
                  }
                  className="w-full bg-transparent text-sm font-bold text-white focus:outline-none font-mono disabled:opacity-50"
                />
                <span className="text-xs font-bold text-[#b1bad3]">x</span>
              </div>
            </div>

            {/* Live Profit Preview Box (if in flight with bet) */}
            {phase === "flying" && activeBetAmount > 0 && !hasCashedOut && (
              <div className="rounded-xl border border-[#213743] bg-[#0f212e] p-3 space-y-1 animate-in fade-in duration-150">
                <div className="flex justify-between text-xs text-[#b1bad3]">
                  <span>Active Bet</span>
                  <span className="font-mono text-white font-bold">${activeBetAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-[#b1bad3]">
                  <span>Current Profit</span>
                  <span className="font-mono font-black text-[#00e701]">
                    +${liveProfit.toFixed(2)} {currency}
                  </span>
                </div>
              </div>
            )}

            {/* Cashed Out Banner */}
            {hasCashedOut && cashedOutMultiplier && (
              <div className="rounded-xl border border-[#00e701]/40 bg-[#00e701]/10 p-3 text-center space-y-0.5">
                <div className="text-xs font-bold text-[#00e701]">
                  Cashed out @ {cashedOutMultiplier.toFixed(2)}x
                </div>
                <div className="text-sm font-black text-white font-mono">
                  +${(activeBetAmount * cashedOutMultiplier).toFixed(2)} {currency}
                </div>
              </div>
            )}
          </div>

          {/* Action Button: Bet (Next Round) or Cashout */}
          <div className="pt-2">
            {phase === "flying" && activeBetAmount > 0 && !hasCashedOut ? (
              <button
                onClick={() => cashout()}
                className="w-full rounded-xl bg-[#00e701] py-4 text-sm font-extrabold text-[#0f212e] shadow-lg shadow-[#00e701]/30 transition-all hover:bg-[#00c701] active:scale-95 flex items-center justify-center gap-2"
              >
                <Zap className="h-4 w-4 fill-current" />
                <span>
                  Cashout ${(activeBetAmount * currentMultiplier).toFixed(2)}
                </span>
              </button>
            ) : hasBetNextRound ? (
              <button
                onClick={toggleBetForNextRound}
                className="w-full rounded-xl border border-[#213743] bg-[#213743] py-4 text-sm font-extrabold text-white transition-all hover:bg-[#2f4553] flex items-center justify-center gap-2"
              >
                <span>Queued (${betAmount.toFixed(2)}) - Click to Cancel</span>
              </button>
            ) : (
              <button
                onClick={toggleBetForNextRound}
                disabled={betAmount > balance || betAmount <= 0}
                className="w-full rounded-xl bg-[#00e701] py-4 text-sm font-extrabold text-[#0f212e] shadow-lg shadow-[#00e701]/25 transition-all hover:bg-[#00c701] hover:shadow-[#00e701]/40 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4 w-4 fill-current" />
                <span>Bet (Next Round)</span>
              </button>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. LIVE CANVAS ARENA (Right Panel on Desktop / Top on Mobile) */}
        {/* ======================================================== */}
        <div
          ref={containerRef}
          className="flex-1 bg-[#0f212e] p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-between min-h-[380px] sm:min-h-[520px] relative overflow-hidden"
        >
          {/* Top Status Indicators inside Arena */}
          <div className="w-full flex items-center justify-between z-10">
            <div className="flex items-center gap-2 text-xs font-bold text-[#b1bad3]">
              <span
                className={`flex h-2 w-2 rounded-full ${
                  phase === "flying"
                    ? "bg-[#00e701] animate-ping"
                    : phase === "countdown"
                    ? "bg-amber-400"
                    : "bg-red-500"
                }`}
              />
              <span className="uppercase tracking-wider">
                {phase === "flying"
                  ? "In Flight"
                  : phase === "countdown"
                  ? "Next Round Soon"
                  : "Crashed"}
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-[#1a2c38] px-2.5 py-1 border border-[#213743] text-xs font-bold">
              <TrendingUp className="h-3.5 w-3.5 text-[#00e701]" />
              <span className="text-[#b1bad3]">1% House Edge</span>
            </div>
          </div>

          {/* Centered Dynamic Multiplier Display & Overlay */}
          <div className="relative z-10 flex flex-col items-center text-center my-auto pointer-events-none">
            {phase === "countdown" ? (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="text-xs font-extrabold uppercase tracking-widest text-[#b1bad3]">
                  Starting In
                </div>
                <div className="text-4xl sm:text-6xl font-black font-mono text-white tracking-tight">
                  {countdownSeconds.toFixed(1)}s
                </div>
                {/* Countdown Progress Bar */}
                <div className="w-48 sm:w-64 h-2 rounded-full bg-[#1a2c38] border border-[#213743] overflow-hidden">
                  <div
                    className="h-full bg-[#00e701] transition-all duration-75"
                    style={{ width: `${(countdownSeconds / 5.0) * 100}%` }}
                  />
                </div>
              </div>
            ) : phase === "crashed" ? (
              <div className="space-y-2 animate-bomb-shake">
                <div className="text-5xl sm:text-7xl font-black font-mono tracking-tight text-red-500 drop-shadow-[0_0_25px_rgba(239,68,68,0.7)]">
                  {crashPoint.toFixed(2)}×
                </div>
                <div className="inline-block rounded-xl bg-red-500/20 border border-red-500/40 px-4 py-1 text-sm font-extrabold text-red-400 uppercase tracking-wider">
                  Crashed @ {crashPoint.toFixed(2)}×
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-5xl sm:text-7xl md:text-8xl font-black font-mono tracking-tight text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] animate-pulse-subtle">
                  {currentMultiplier.toFixed(2)}×
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-[#00e701]">
                  Current Payout
                </div>
              </div>
            )}
          </div>

          {/* HTML5 Canvas Background / Curve Engine */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
          />

          {/* Bottom Game Utilities Bar */}
          <div className="w-full flex items-center justify-between border-t border-[#213743] pt-3 z-10">
            {/* Provably Fair Modal Trigger */}
            <button
              onClick={() => setIsFairnessOpen(true)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold text-[#b1bad3] hover:text-white hover:bg-[#1a2c38] transition-colors"
            >
              <ShieldCheck className="h-4 w-4 text-[#00e701]" />
              <span>Fairness</span>
            </button>

            {/* Sound & Screen Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleSound}
                title={isMuted ? "Unmute Audio" : "Mute Audio"}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#b1bad3] hover:text-white hover:bg-[#1a2c38] transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4 text-red-400" />
                ) : (
                  <Volume2 className="h-4 w-4 text-[#00e701]" />
                )}
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#b1bad3] hover:text-white hover:bg-[#1a2c38] transition-colors"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. PROVABLY FAIR MODAL */}
      {/* ======================================================== */}
      {isFairnessOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#213743] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00e701]/15 text-[#00e701]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Crash Fairness</h3>
                  <p className="text-xs text-[#b1bad3]">
                    100% cryptographic verification of crash multiplier
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFairnessOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#b1bad3] hover:bg-[#213743] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#b1bad3] uppercase tracking-wider text-[10px]">
                  Server Seed (SHA-256 Hash)
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-[#213743] bg-[#0f212e] px-3 py-2">
                  <span className="font-mono text-white text-[11px] truncate flex-1">
                    {serverSeedHash}
                  </span>
                  <button
                    onClick={() => copyToClipboard(serverSeedHash, "server")}
                    className="text-[#b1bad3] hover:text-[#00e701]"
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
                <label className="font-bold text-[#b1bad3] uppercase tracking-wider text-[10px]">
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
                    onClick={() =>
                      setClientSeed(`stake_${Math.random().toString(36).substring(2, 9)}`)
                    }
                    title="Generate Random Client Seed"
                    className="text-[#b1bad3] hover:text-[#00e701]"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#b1bad3] uppercase tracking-wider text-[10px]">
                  Nonce (Game Counter)
                </label>
                <div className="rounded-xl border border-[#213743] bg-[#0f212e] px-3 py-2 font-mono text-white font-bold">
                  {nonce}
                </div>
              </div>

              <div className="rounded-xl border border-[#213743] bg-[#0f212e] p-3 text-[11px] space-y-1 text-[#b1bad3]">
                <div className="font-bold text-white">Crash Point Formula:</div>
                <div className="font-mono text-[#00e701]">
                  CrashPoint = 0.99 / (1 - HashToFloat(ServerSeed, ClientSeed, Nonce))
                </div>
                <div>Where House Edge = 1%. Values &lt; 1.01 are clamped to 1.01x.</div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#213743]">
              <button
                onClick={() => setIsFairnessOpen(false)}
                className="rounded-xl bg-[#00e701] px-5 py-2 text-xs font-bold text-[#0f212e] hover:bg-[#00c701]"
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
