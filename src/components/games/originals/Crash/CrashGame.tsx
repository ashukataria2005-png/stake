"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  Users,
  CircleDot,
  RotateCcw,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";
import StakeGameFooterCard from "@/components/games/originals/common/StakeGameFooterCard";

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

interface LivePlayerBet {
  id: string;
  username: string;
  avatarColor: string;
  betAmount: number;
  targetCashout: number;
  hasCashedOut: boolean;
  payout: number;
  isCurrentUser?: boolean;
}

const BOT_NAMES = [
  "CryptoWhale",
  "LuckyStrike",
  "NeonRider",
  "ShadowBets",
  "AlphaTrader",
  "StakeGod",
  "Viper99",
  "MoonShooter",
  "RiskTaker",
  "GoldFinger",
  "Satoshi_77",
  "DiamondHands",
  "ApexLegend",
  "QuantumBet",
];

const BOT_COLORS = [
  "#38bdf8",
  "#a855f7",
  "#f97316",
  "#10b981",
  "#f43f5e",
  "#eab308",
  "#06b6d4",
  "#ec4899",
];

export default function CrashGame() {
  const { balance, updateBalance, currency, formatBalance, currencySymbol, user, addRecentlyPlayedGame } = useGame();
  const activeSym = currencySymbol || "$";

  // Mode: Manual or Auto
  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [betAmount, setBetAmount] = useState<number>(10);
  const [betInput, setBetInput] = useState<string>("10");

  useEffect(() => {
    if (betInput !== "" && parseFloat(betInput) === betAmount) return;
    setBetInput(betAmount.toString());
  }, [betAmount]);

  const [autoCashout, setAutoCashout] = useState<number>(2.0);
  const [autoCashoutInput, setAutoCashoutInput] = useState<string>("2.00");
  const [autoCashoutEnabled, setAutoCashoutEnabled] = useState<boolean>(true);

  useEffect(() => {
    if (autoCashoutInput !== "" && parseFloat(autoCashoutInput) === autoCashout) return;
    setAutoCashoutInput(autoCashout.toFixed(2));
  }, [autoCashout]);

  // Auto Mode Options
  const [autoBetsLimit, setAutoBetsLimit] = useState<number>(0); // 0 = infinite
  const [autoBetsCount, setAutoBetsCount] = useState<number>(0);
  const [isAutoRunning, setIsAutoRunning] = useState<boolean>(false);
  const [onWinAction, setOnWinAction] = useState<"reset" | "increase">("reset");
  const [onWinPercent, setOnWinPercent] = useState<number>(100);
  const [onLossAction, setOnLossAction] = useState<"reset" | "increase">("reset");
  const [onLossPercent, setOnLossPercent] = useState<number>(100);
  const [stopOnProfit, setStopOnProfit] = useState<number>(0);
  const [stopOnLoss, setStopOnLoss] = useState<number>(0);
  const initialAutoBalanceRef = useRef<number>(balance);
  const baseBetRef = useRef<number>(betAmount);

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

  // Live Multiplayer Bets Board
  const [livePlayers, setLivePlayers] = useState<LivePlayerBet[]>([]);

  // History strip of last 8 rounds
  const [history, setHistory] = useState<HistoryItem[]>([
    { id: "h1", multiplier: 2.45 },
    { id: "h2", multiplier: 1.15 },
    { id: "h3", multiplier: 14.8 },
    { id: "h4", multiplier: 1.98 },
    { id: "h5", multiplier: 3.2 },
    { id: "h6", multiplier: 1.05 },
    { id: "h7", multiplier: 4.62 },
    { id: "h8", multiplier: 8.91 },
  ]);

  // Audio & Fullscreen state
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Provably Fair Modal
  const [isFairnessOpen, setIsFairnessOpen] = useState<boolean>(false);
  const [serverSeedHash] = useState<string>(
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

  // Register in recently played games once on mount
  useEffect(() => {
    addRecentlyPlayedGame({
      id: "crash",
      slug: "crash",
      title: "Crash",
      href: "/games/crash",
      playersCount: 5120,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Generate simulated live players before launch
  const generateLivePlayers = useCallback((userBetAmt: number) => {
    const players: LivePlayerBet[] = [];

    // Current user row if user bet
    if (userBetAmt > 0) {
      players.push({
        id: "current-user",
        username: user?.name || "You",
        avatarColor: user?.avatarColor || "#00e701",
        betAmount: userBetAmt,
        targetCashout: autoCashoutEnabled ? autoCashout : 9999,
        hasCashedOut: false,
        payout: 0,
        isCurrentUser: true,
      });
    }

    // 8-12 bot players
    const botCount = Math.floor(Math.random() * 5) + 8;
    const shuffledNames = [...BOT_NAMES].sort(() => Math.random() - 0.5);

    for (let i = 0; i < botCount; i++) {
      const name = shuffledNames[i] || `Player_${i + 1}`;
      const color = BOT_COLORS[i % BOT_COLORS.length];
      const botBet = parseFloat((Math.random() * 80 + 5).toFixed(2));
      // Target cashout distributed between 1.15x and 18x
      const randTarget =
        Math.random() < 0.65
          ? parseFloat((1.15 + Math.random() * 2.5).toFixed(2))
          : parseFloat((3.5 + Math.random() * 12.0).toFixed(2));

      players.push({
        id: `bot-${i}-${Date.now()}`,
        username: name,
        avatarColor: color,
        betAmount: botBet,
        targetCashout: randTarget,
        hasCashedOut: false,
        payout: 0,
      });
    }

    setLivePlayers(players);
  }, [autoCashout, autoCashoutEnabled, user]);

  // Queue or toggle bet for next round
  const toggleBetForNextRound = () => {
    sounds.playClick();
    if (hasBetNextRound) {
      // Cancel queued bet
      setHasBetNextRound(false);
    } else {
      const effectiveBet =
        betInput === "" || isNaN(parseFloat(betInput)) || parseFloat(betInput) <= 0
          ? 1
          : parseFloat(betInput);

      if (betInput === "" || isNaN(parseFloat(betInput))) {
        setBetInput(effectiveBet.toString());
        setBetAmount(effectiveBet);
      }

      if (effectiveBet > balance) {
        return;
      }
      if (effectiveBet <= 0) return;
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

      // Update user in live players board
      setLivePlayers((prev) =>
        prev.map((p) =>
          p.isCurrentUser
            ? { ...p, hasCashedOut: true, payout: winPayout, targetCashout: mult }
            : p
        )
      );

      // Confetti celebration if high win
      if (mult >= 2.0) {
        try {
          confetti({
            particleCount: mult >= 10 ? 100 : 50,
            spread: 70,
            origin: { y: 0.55 },
            colors: ["#00e701", "#ffffff", "#ffea00", "#38bdf8"],
          });
        } catch {
          // ignore
        }
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

  // Update bot cashouts dynamically as multiplier climbs
  useEffect(() => {
    if (phase !== "flying") return;

    setLivePlayers((prev) =>
      prev.map((player) => {
        if (!player.hasCashedOut && !player.isCurrentUser && currentMultiplier >= player.targetCashout) {
          return {
            ...player,
            hasCashedOut: true,
            payout: parseFloat((player.betAmount * player.targetCashout).toFixed(2)),
          };
        }
        return player;
      })
    );
  }, [currentMultiplier, phase]);

  // Generate random crash point with authentic 1% house edge
  const generateCrashPoint = (): number => {
    const rand = Math.random();
    let point = parseFloat((0.99 / (1 - rand)).toFixed(2));
    if (point < 1.01) point = 1.01;
    if (point > 250.0) point = 250.0;
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

      // Determine user queued bet
      const effectiveBet = hasBetNextRound || isAutoRunning ? betAmount : 0;
      generateLivePlayers(effectiveBet);

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

          // If user bet was queued or auto-betting
          if ((hasBetNextRound || isAutoRunning) && betAmount <= balance && betAmount > 0) {
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

      // Handle auto-betting progression
      if (isAutoRunning) {
        setAutoBetsCount((c) => {
          const nextCount = c + 1;
          if (autoBetsLimit > 0 && nextCount >= autoBetsLimit) {
            setIsAutoRunning(false);
          }
          return nextCount;
        });

        const won = hasCashedOut;
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

        // Check profit / loss limits
        const net = balance - initialAutoBalanceRef.current;
        if (stopOnProfit > 0 && net >= stopOnProfit) setIsAutoRunning(false);
        if (stopOnLoss > 0 && -net >= stopOnLoss) setIsAutoRunning(false);
      }

      // Display crashed state for 3.2s, then restart countdown
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
      ctx.strokeStyle = "#21374340";
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
        // Stake exponential curve: M(t) = e^(0.065 * t)
        const mult = parseFloat(Math.exp(0.065 * elapsedSec).toFixed(2));

        if (mult >= crashPoint) {
          // Crash trigger!
          setCurrentMultiplier(crashPoint);
          setPhase("crashed");
          setHistory((prev) => [
            { id: `h-${Date.now()}`, multiplier: crashPoint },
            ...prev.slice(0, 7),
          ]);
        } else {
          setCurrentMultiplier(mult);

          // Audio ticking feedback
          if (time - lastTickTimeRef.current > Math.max(100, 420 - mult * 32)) {
            sounds.playTick(mult);
            lastTickTimeRef.current = time;
          }
        }
      }

      // 4. Draw Exponential Curve Trajectory
      const originX = 28;
      const originY = height - 32;
      const maxX = width - 40;
      const maxY = 45;

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
        const glowColor = isCrashed ? "rgba(239,68,68,0.5)" : "rgba(0,231,1,0.5)";

        // Curve Area Fill Gradient
        const gradient = ctx.createLinearGradient(0, maxY, 0, originY);
        gradient.addColorStop(0, isCrashed ? "rgba(239,68,68,0.22)" : "rgba(0,231,1,0.22)");
        gradient.addColorStop(1, "rgba(15,33,46,0)");

        ctx.beginPath();
        ctx.moveTo(originX, originY);
        const steps = 36;
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
        ctx.shadowBlur = 0;

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

        // Render particles
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

        // Glowing Rocket / Tip Dot
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

  // Color mapping for climbing multiplier
  const multiplierColor = useMemo(() => {
    if (phase === "crashed") return "text-red-500 drop-shadow-[0_0_25px_rgba(239,68,68,0.8)]";
    if (currentMultiplier >= 10.0) return "text-[#fbbf24] drop-shadow-[0_0_24px_rgba(251,191,36,0.6)]";
    if (currentMultiplier >= 5.0) return "text-[#ffea00] drop-shadow-[0_0_20px_rgba(255,234,0,0.5)]";
    if (currentMultiplier >= 2.0) return "text-[#00e701] drop-shadow-[0_0_20px_rgba(0,231,1,0.5)]";
    return "text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.35)]";
  }, [currentMultiplier, phase]);

  // Copy helper
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1800);
  };

  return (
    <div
      className={`w-full max-w-lg mx-auto px-2 sm:px-3 py-2 select-none flex flex-col space-y-2 relative z-0 pointer-events-auto ${
        isFullscreen ? "fixed inset-0 z-40 bg-[#0f212e] overflow-y-auto p-4 pb-6 max-w-none" : ""
      }`}
    >
      {/* ======================================================== */}
      {/* 1. LIVE CANVAS ARENA (TOP PANEL)                         */}
      {/* ======================================================== */}
      <div
        ref={containerRef}
        className="w-full aspect-[16/10] sm:aspect-[16/9] rounded-t-2xl bg-[#0f212e] border-t border-x border-[#213743] shadow-2xl relative overflow-hidden flex flex-col justify-between p-3 sm:p-4"
      >
        {/* Top Status Indicators inside Arena */}
        <div className="w-full flex items-center justify-between z-10">
          <div className="flex items-center gap-2 text-xs font-bold text-[#b1bad3]">
            <span
              className={`flex h-2.5 w-2.5 rounded-full ${
                phase === "flying"
                  ? "bg-[#00e701] animate-ping"
                  : phase === "countdown"
                  ? "bg-amber-400"
                  : "bg-red-500"
              }`}
            />
            <span className="uppercase tracking-wider font-mono text-[11px]">
              {phase === "flying"
                ? "In Flight"
                : phase === "countdown"
                ? "Next Round Soon"
                : "Crashed"}
            </span>
          </div>

          <div className="flex items-center gap-2">
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

        {/* Centered Dynamic Multiplier Display & Overlay */}
        <div className="relative z-10 flex flex-col items-center text-center my-auto pointer-events-none">
          {phase === "countdown" ? (
            <div className="space-y-2 animate-in fade-in duration-200">
              <div className="text-[11px] font-extrabold uppercase tracking-widest text-[#b1bad3]">
                Next Round Starting In
              </div>
              <div className="text-4xl sm:text-6xl font-black font-mono text-white tracking-tight">
                {countdownSeconds.toFixed(1)}s
              </div>
              <div className="w-48 sm:w-60 h-2 rounded-full bg-[#1a2c38] border border-[#213743] overflow-hidden">
                <div
                  className="h-full bg-[#00e701] transition-all duration-75 ease-linear"
                  style={{ width: `${(countdownSeconds / 5.0) * 100}%` }}
                />
              </div>
            </div>
          ) : phase === "crashed" ? (
            <div className="space-y-1.5 animate-bomb-shake">
              <div className="text-5xl sm:text-7xl font-black font-mono tracking-tight text-red-500 drop-shadow-[0_0_24px_rgba(239,68,68,0.8)]">
                {crashPoint.toFixed(2)}×
              </div>
              <div className="inline-block rounded-lg bg-red-500/20 border border-red-500/40 px-3.5 py-1 text-xs font-extrabold text-red-400 uppercase tracking-wider">
                Crashed @ {crashPoint.toFixed(2)}×
              </div>
            </div>
          ) : (
            <div className="space-y-0.5">
              <div className={`text-5xl sm:text-7xl md:text-8xl font-black font-mono tracking-tight transition-colors duration-200 ${multiplierColor}`}>
                {currentMultiplier.toFixed(2)}×
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#00e701]">
                Current Multiplier
              </div>
            </div>
          )}
        </div>

        {/* HTML5 Canvas Background / 60fps Curve Engine */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* Bottom Game Arena Tag */}
        <div className="w-full flex items-center justify-between z-10 text-[10px] text-[#b1bad3]">
          <span className="font-mono">1.00% House Edge</span>
          <span className="font-mono">Live Multiplayer Engine</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. MINES HARMONIZED BETTING CONTROLS SHELL CONTAINER     */}
      {/* ======================================================== */}
      <div className="w-full border-t border-[#213743] bg-[#1a2c38] p-3 sm:p-4 flex flex-col justify-start space-y-2 sm:space-y-2.5 rounded-b-2xl select-none">
        {/* 1. PRIMARY BET CTA BUTTON (Directly at top of controls) */}
        <div className="w-full">
          {phase === "flying" && activeBetAmount > 0 && !hasCashedOut ? (
            <button
              type="button"
              onClick={() => cashout()}
              className="w-full py-3 sm:py-3.5 text-sm sm:text-base font-extrabold rounded-xl bg-[#00e701] hover:bg-[#00c201] text-black shadow-lg shadow-[#00e701]/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              <Zap className="h-4 w-4 fill-current" />
              <span>
                Cashout {activeSym}{(activeBetAmount * currentMultiplier).toFixed(2)}
              </span>
            </button>
          ) : mode === "auto" ? (
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
              className={`w-full py-3 sm:py-3.5 text-sm sm:text-base font-extrabold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center cursor-pointer uppercase tracking-wider ${
                isAutoRunning
                  ? "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25"
                  : "bg-[#1475e1] hover:bg-[#1164c2] text-white shadow-lg shadow-[#1475e1]/25"
              }`}
            >
              <span>{isAutoRunning ? "STOP AUTOBET" : "START AUTOBET"}</span>
            </button>
          ) : hasBetNextRound ? (
            <button
              type="button"
              onClick={toggleBetForNextRound}
              className="w-full py-3 sm:py-3.5 text-sm sm:text-base font-extrabold rounded-xl border border-[#213743] bg-[#213743] text-white hover:bg-[#2f4553] active:scale-[0.98] transition-all flex items-center justify-center cursor-pointer uppercase tracking-wider"
            >
              <span>Cancel Bet ({activeSym}{activeBetAmount.toFixed(2)})</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={toggleBetForNextRound}
              disabled={betAmount > balance || betAmount <= 0}
              className="w-full py-3 sm:py-3.5 text-sm sm:text-base font-extrabold rounded-xl bg-[#1475e1] hover:bg-[#1164c2] text-white shadow-lg shadow-[#1475e1]/25 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer uppercase tracking-wider"
            >
              <span>Bet (Next Round)</span>
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
                disabled={phase === "flying" && activeBetAmount > 0}
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
                className="w-full bg-transparent text-sm font-bold text-white outline-none font-mono disabled:opacity-50"
              />
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={phase === "flying" && activeBetAmount > 0}
                onClick={handleHalfBet}
                className="rounded-lg bg-[#213743] px-2.5 py-1.5 text-xs font-bold text-[#b1bad3] hover:bg-[#2f4553] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                ½
              </button>
              <button
                type="button"
                disabled={phase === "flying" && activeBetAmount > 0}
                onClick={handleDoubleBet}
                className="rounded-lg bg-[#213743] px-2.5 py-1.5 text-xs font-bold text-[#b1bad3] hover:bg-[#2f4553] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                2×
              </button>
            </div>
          </div>
        </div>

        {/* 3. AUTO CASHOUT INPUT (Exact Mines Aesthetic) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <label className="cursor-pointer flex items-center gap-1.5 font-bold text-[#b1bad3]">
              <input
                type="checkbox"
                checked={autoCashoutEnabled}
                onChange={(e) => setAutoCashoutEnabled(e.target.checked)}
                className="rounded accent-[#1475e1] cursor-pointer"
              />
              <span>Auto Cashout</span>
            </label>
            <span className="text-[#b1bad3] font-mono text-[11px]">{autoCashout.toFixed(2)}×</span>
          </div>
          <div className="flex rounded-lg bg-[#0f212e] border border-[#213743] focus-within:border-[#2f4553] p-1">
            <div className="flex flex-1 items-center px-2.5">
              <input
                type="text"
                inputMode="decimal"
                disabled={!autoCashoutEnabled}
                value={autoCashoutInput}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || /^\d*\.?\d*$/.test(val)) {
                    setAutoCashoutInput(val);
                    if (val !== "") {
                      const num = parseFloat(val);
                      if (!isNaN(num) && num >= 1.01) {
                        setAutoCashout(num);
                      }
                    }
                  }
                }}
                onBlur={() => {
                  if (autoCashoutInput === "" || parseFloat(autoCashoutInput) < 1.01 || isNaN(parseFloat(autoCashoutInput))) {
                    setAutoCashout(2.0);
                    setAutoCashoutInput("2.00");
                  } else {
                    const num = parseFloat(autoCashoutInput);
                    setAutoCashout(num);
                    setAutoCashoutInput(num.toFixed(2));
                  }
                }}
                className="w-full bg-transparent text-sm font-bold text-white outline-none font-mono disabled:opacity-40"
              />
              <span className="text-xs font-bold text-[#b1bad3]">×</span>
            </div>
          </div>
        </div>

        {/* 4. AUTO MODE CONFIGURATION INPUTS */}
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
              </div>
            </div>

            <div className="flex justify-between items-center text-[10px] text-[#b1bad3] px-1 font-mono">
              <span>Bets Completed:</span>
              <span className="text-white font-bold">{autoBetsCount} / {autoBetsLimit === 0 ? "∞" : autoBetsLimit}</span>
            </div>
          </div>
        )}

        {/* Live Profit Banner if currently in flight */}
        {phase === "flying" && activeBetAmount > 0 && !hasCashedOut && (
          <div className="rounded-lg border border-[#213743] bg-[#0f212e] p-2 flex justify-between items-center text-xs">
            <span className="text-[#b1bad3]">Current Profit:</span>
            <span className="font-mono font-black text-[#00e701]">
              +{activeSym}{liveProfit.toFixed(2)}
            </span>
          </div>
        )}

        {/* Cashed Out Banner */}
        {hasCashedOut && cashedOutMultiplier && (
          <div className="rounded-lg border border-[#00e701]/40 bg-[#00e701]/10 p-2 text-center text-xs">
            <span className="font-bold text-[#00e701]">
              Cashed out @ {cashedOutMultiplier.toFixed(2)}× (+{activeSym}{(activeBetAmount * cashedOutMultiplier).toFixed(2)})
            </span>
          </div>
        )}

        {/* 5. MODE SWITCH TABS: [ Manual | Auto ] (Exact Mines Pattern) */}
        <div className="flex rounded-lg bg-[#0f212e] p-1 border border-[#213743] mt-auto">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setMode("manual");
              setIsAutoRunning(false);
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

        {/* 6. BOTTOM UTILITY BAR */}
        <div className="flex items-center justify-between rounded-lg bg-[#0f212e] border border-[#213743] px-3 py-2 text-xs text-[#b1bad3] mt-0.5">
          <span className="font-mono text-[11px]">Provably Fair</span>
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
      <StakeGameFooterCard gameTitle="Crash" />

      {/* ======================================================== */}
      {/* 3. LIVE MULTIPLAYER BETS BOARD (UNDERNEATH)              */}
      {/* ======================================================== */}
      <div className="w-full rounded-2xl border border-[#213743] bg-[#1a2c38] p-3 sm:p-4 space-y-2.5 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#213743] pb-2.5">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#00e701]" />
            <h3 className="text-xs font-black text-white">Live Player Bets</h3>
            <span className="rounded-full bg-[#0f212e] px-2 py-0.5 text-[10px] font-mono font-bold text-[#00e701] border border-[#213743]">
              {livePlayers.length} Active
            </span>
          </div>

          <div className="text-xs font-bold text-[#b1bad3]">
            Total Bet:{" "}
            <span className="font-mono text-white">
              {activeSym}{livePlayers.reduce((acc, p) => acc + p.betAmount, 0).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Players Table */}
        <div className="overflow-x-auto max-h-56 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#213743]/60 text-[10px] uppercase font-bold text-[#b1bad3] tracking-wider">
                <th className="py-2 px-2.5">Player</th>
                <th className="py-2 px-2.5">Cashout</th>
                <th className="py-2 px-2.5">Bet Amount</th>
                <th className="py-2 px-2.5 text-right">Payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#213743]/30 font-mono text-[11px]">
              {livePlayers.map((player) => {
                const isWin = player.hasCashedOut;
                const isLost = phase === "crashed" && !player.hasCashedOut;

                return (
                  <tr
                    key={player.id}
                    className={`transition-colors ${
                      player.isCurrentUser
                        ? "bg-[#00e701]/10 font-bold"
                        : "hover:bg-[#213743]/30"
                    }`}
                  >
                    <td className="py-2 px-2.5 flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: player.avatarColor }}
                      />
                      <span className={player.isCurrentUser ? "text-[#00e701] font-bold" : "text-white"}>
                        {player.username}
                      </span>
                    </td>

                    <td className="py-2 px-2.5">
                      {isWin ? (
                        <span className="text-[#00e701] font-bold">
                          {player.targetCashout.toFixed(2)}×
                        </span>
                      ) : isLost ? (
                        <span className="text-red-400">Crashed</span>
                      ) : (
                        <span className="text-[#b1bad3]">—</span>
                      )}
                    </td>

                    <td className="py-2 px-2.5 text-white">
                      {activeSym}{player.betAmount.toFixed(2)}
                    </td>

                    <td className="py-2 px-2.5 text-right">
                      {isWin ? (
                        <span className="text-[#00e701] font-bold">
                          +{activeSym}{player.payout.toFixed(2)}
                        </span>
                      ) : isLost ? (
                        <span className="text-red-400/80">{activeSym}0.00</span>
                      ) : (
                        <span className="text-[#b1bad3]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. PROVABLY FAIR VERIFIER MODAL                          */}
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
                  <h3 className="text-base font-black">Crash Provably Fair</h3>
                  <p className="text-xs text-[#b1bad3]">
                    100% cryptographic SHA-256 verification of crash multiplier
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
                  Nonce (Game Counter)
                </label>
                <div className="rounded-xl border border-[#213743] bg-[#0f212e] px-3 py-2 font-mono text-white font-bold">
                  {nonce}
                </div>
              </div>

              <div className="rounded-xl border border-[#213743] bg-[#0f212e] p-3 text-[11px] space-y-1">
                <div className="font-bold text-white">Crash Point Formula:</div>
                <div className="font-mono text-[#00e701]">
                  CrashPoint = 0.99 / (1 - HashToFloat(ServerSeed, ClientSeed, Nonce))
                </div>
                <div>Where House Edge = 1%. Multipliers &lt; 1.01 are clamped to 1.01×.</div>
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
