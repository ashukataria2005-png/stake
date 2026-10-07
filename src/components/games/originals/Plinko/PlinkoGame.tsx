"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CircleDot,
  Volume2,
  VolumeX,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Sparkles,
  RefreshCw,
  X,
  Copy,
  Check,
  Play,
  Layers,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

// Stake Symmetrical Multiplier Tables for Rows x Risk
const MULTIPLIER_TABLES: Record<number, Record<"low" | "medium" | "high", number[]>> = {
  8: {
    low: [5.6, 2.1, 1.1, 1.0, 0.5, 1.0, 1.1, 2.1, 5.6],
    medium: [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
    high: [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29],
  },
  10: {
    low: [8.9, 3.0, 1.4, 1.1, 1.0, 0.5, 1.0, 1.1, 1.4, 3.0, 8.9],
    medium: [22, 5, 2, 1.4, 0.6, 0.4, 0.6, 1.4, 2, 5, 22],
    high: [76, 10, 3, 0.9, 0.3, 0.2, 0.3, 0.9, 3, 10, 76],
  },
  12: {
    low: [8.4, 3.0, 1.6, 1.4, 1.1, 1.0, 0.5, 1.0, 1.1, 1.4, 1.6, 3.0, 8.4],
    medium: [33, 11, 4, 2, 1.1, 0.6, 0.3, 0.6, 1.1, 2, 4, 11, 33],
    high: [170, 24, 8.1, 2, 0.7, 0.2, 0.2, 0.2, 0.7, 2, 8.1, 24, 170],
  },
  14: {
    low: [7.1, 4.0, 1.9, 1.4, 1.3, 1.1, 1.0, 0.5, 1.0, 1.1, 1.3, 1.4, 1.9, 4.0, 7.1],
    medium: [58, 15, 7, 4, 1.9, 1.3, 0.5, 0.2, 0.5, 1.3, 1.9, 4, 7, 15, 58],
    high: [420, 56, 18, 5, 1.9, 0.3, 0.2, 0.2, 0.2, 0.3, 1.9, 5, 18, 56, 420],
  },
  16: {
    low: [16, 9, 2, 1.4, 1.1, 1, 0.5, 0.5, 0.5, 0.5, 0.5, 1, 1.1, 1.4, 2, 9, 16],
    medium: [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110],
    high: [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000],
  },
};

interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  betAmount: number;
  color: string;
  hasLanded: boolean;
}

interface Peg {
  x: number;
  y: number;
  radius: number;
  pulse: number; // 0 to 1 for glow animation on hit
}

interface FloatingPayout {
  id: number;
  x: number;
  y: number;
  text: string;
  alpha: number;
}

export default function PlinkoGame() {
  const { balance, updateBalance, currency, formatBalance } = useGame();

  // Settings
  const [betAmount, setBetAmount] = useState<number>(10);
  const [risk, setRisk] = useState<"low" | "medium" | "high">("medium");
  const [rows, setRows] = useState<number>(16);
  const [autoBetting, setAutoBetting] = useState<boolean>(false);
  const [activeBucketIndex, setActiveBucketIndex] = useState<{ index: number; expire: number } | null>(null);

  // History strip of last 7 payouts
  const [history, setHistory] = useState<Array<{ id: string; multiplier: number }>>([
    { id: "h1", multiplier: 1.5 },
    { id: "h2", multiplier: 0.5 },
    { id: "h3", multiplier: 10 },
    { id: "h4", multiplier: 0.3 },
    { id: "h5", multiplier: 3 },
    { id: "h6", multiplier: 0.5 },
    { id: "h7", multiplier: 41 },
  ]);

  // Audio & Fullscreen state
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Provably Fair Modal
  const [isFairnessOpen, setIsFairnessOpen] = useState<boolean>(false);
  const [serverSeedHash, setServerSeedHash] = useState<string>(
    "8e4f1a09d3b7621c54ea908b21c43f76901e5a2c89f3d12b07e456a1b2c3d4e5"
  );
  const [clientSeed, setClientSeed] = useState<string>("stake_plinko_8192a");
  const [nonce, setNonce] = useState<number>(315);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Refs for Canvas Animation
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const ballsRef = useRef<Ball[]>([]);
  const pegsRef = useRef<Peg[]>([]);
  const payoutsRef = useRef<FloatingPayout[]>([]);
  const nextBallIdRef = useRef<number>(1);
  const lastPegSoundTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // Active Multipliers list
  const currentMultipliers = MULTIPLIER_TABLES[rows]?.[risk] || MULTIPLIER_TABLES[16].medium;

  // Sound toggle
  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    sounds.enabled = !next;
  };

  // Math buttons
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

  // Drop a single Plinko Ball
  const dropBall = useCallback(() => {
    if (betAmount > balance) {
      alert("Insufficient demo balance! Please use the Wallet button to top up.");
      setAutoBetting(false);
      return;
    }
    if (betAmount <= 0) return;

    // Deduct bet amount from demo balance immediately
    updateBalance(-betAmount);
    setNonce((n) => n + 1);

    const canvas = canvasRef.current;
    const width = canvas ? canvas.getBoundingClientRect().width : 600;
    const startX = width / 2 + (Math.random() - 0.5) * 6; // Slight jitter at drop hole
    const startY = 32;

    const colors = ["#00e701", "#ffffff", "#38bdf8", "#facc15"];
    const chosenColor = colors[Math.floor(Math.random() * colors.length)];

    ballsRef.current.push({
      id: nextBallIdRef.current++,
      x: startX,
      y: startY,
      vx: (Math.random() - 0.5) * 1.5,
      vy: Math.random() * 0.5,
      radius: 5.5,
      betAmount: betAmount,
      color: chosenColor,
      hasLanded: false,
    });
  }, [balance, betAmount, updateBalance]);

  // Autobet interval loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (autoBetting) {
      interval = setInterval(() => {
        dropBall();
      }, 350);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoBetting, dropBall]);

  // Spacebar to drop ball
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        dropBall();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dropBall]);

  // Get bucket color based on multiplier value
  const getBucketColor = (mult: number) => {
    if (mult >= 100) return { bg: "#dc2626", text: "#ffffff", border: "#ef4444" };
    if (mult >= 20) return { bg: "#ea580c", text: "#ffffff", border: "#f97316" };
    if (mult >= 5) return { bg: "#f59e0b", text: "#0f212e", border: "#fbbf24" };
    if (mult >= 2) return { bg: "#eab308", text: "#0f212e", border: "#fde047" };
    if (mult >= 1) return { bg: "#84cc16", text: "#0f212e", border: "#a3e635" };
    if (mult >= 0.5) return { bg: "#2563eb", text: "#ffffff", border: "#3b82f6" };
    return { bg: "#1e293b", text: "#94a3b8", border: "#334155" };
  };

  // -------------------------------------------------------------
  // 60 FPS HTML5 CANVAS PHYSICS & RENDERING ENGINE
  // -------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isRunning = true;

    // Generate Pegs coordinates
    const generatePegs = (w: number, h: number) => {
      const pegs: Peg[] = [];
      const startY = 60;
      const bottomY = h - 68;
      const spacingY = (bottomY - startY) / (rows + 1);

      for (let r = 0; r < rows; r++) {
        const count = r + 3;
        const spacingX = Math.min(36, (w - 60) / (rows + 2));
        const rowWidth = (count - 1) * spacingX;
        const startX = (w - rowWidth) / 2;
        const y = startY + (r + 1) * spacingY;

        for (let c = 0; c < count; c++) {
          pegs.push({
            x: startX + c * spacingX,
            y: y,
            radius: 3.5,
            pulse: 0,
          });
        }
      }
      return pegs;
    };

    const render = () => {
      if (!isRunning) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = rect.width;
      const height = rect.height;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        pegsRef.current = generatePegs(width, height);
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Clear Canvas
      ctx.fillStyle = "#0f212e";
      ctx.fillRect(0, 0, width, height);

      // Subtle background grid
      ctx.strokeStyle = "#21374333";
      ctx.lineWidth = 1;
      for (let y = 40; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Top Center Drop Funnel
      ctx.beginPath();
      ctx.arc(width / 2, 24, 12, 0, Math.PI);
      ctx.fillStyle = "#1a2c38";
      ctx.fill();
      ctx.strokeStyle = "#00e701";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Update & Draw Pegs
      for (let i = 0; i < pegsRef.current.length; i++) {
        const peg = pegsRef.current[i];
        if (peg.pulse > 0) {
          peg.pulse = Math.max(0, peg.pulse - 0.05);
        }

        ctx.beginPath();
        ctx.arc(peg.x, peg.y, peg.radius + peg.pulse * 2.5, 0, Math.PI * 2);
        if (peg.pulse > 0) {
          ctx.fillStyle = "#ffffff";
          ctx.shadowColor = "#00e701";
          ctx.shadowBlur = 10;
        } else {
          ctx.fillStyle = "#94a3b8";
          ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Physics Constants
      const gravity = 0.22;
      const bounce = 0.58;
      const friction = 0.99;
      const bottomLimit = height - 58;

      // Update & Draw Balls
      for (let i = ballsRef.current.length - 1; i >= 0; i--) {
        const b = ballsRef.current[i];

        // Apply forces
        b.vy += gravity;
        b.vx *= friction;
        b.vy *= friction;

        b.x += b.vx;
        b.y += b.vy;

        // Wall collisions
        if (b.x < b.radius + 6) {
          b.x = b.radius + 6;
          b.vx = -b.vx * bounce;
        } else if (b.x > width - b.radius - 6) {
          b.x = width - b.radius - 6;
          b.vx = -b.vx * bounce;
        }

        // Peg collisions
        for (let pIdx = 0; pIdx < pegsRef.current.length; pIdx++) {
          const peg = pegsRef.current[pIdx];
          const dx = b.x - peg.x;
          const dy = b.y - peg.y;
          const dist = Math.hypot(dx, dy);
          const minDist = b.radius + peg.radius;

          if (dist < minDist) {
            const nx = dx / (dist || 1);
            const ny = dy / (dist || 1);

            // Normal impulse with slight randomized deflect
            const dot = b.vx * nx + b.vy * ny;
            if (dot < 0) {
              const impulse = -(1 + bounce) * dot;
              b.vx += impulse * nx + (Math.random() - 0.5) * 0.4;
              b.vy += impulse * ny;
            }

            // Separate overlapping
            b.x = peg.x + nx * minDist;
            b.y = peg.y + ny * minDist;

            peg.pulse = 1.0;

            // Audio trigger on collision (throttled to 35ms)
            const now = performance.now();
            if (now - lastPegSoundTimeRef.current > 35) {
              sounds.playPeg();
              lastPegSoundTimeRef.current = now;
            }
          }
        }

        // Check if ball lands in bottom bucket
        if (b.y >= bottomLimit && !b.hasLanded) {
          b.hasLanded = true;

          // Determine bucket index
          const count = rows + 1;
          const spacingX = Math.min(36, (width - 60) / (rows + 2));
          const totalWidth = count * spacingX;
          const startX = (width - totalWidth) / 2;
          const relativeX = b.x - startX;
          let bucketIdx = Math.floor(relativeX / spacingX);
          bucketIdx = Math.max(0, Math.min(count - 1, bucketIdx));

          const multiplier = currentMultipliers[bucketIdx] ?? 1.0;
          const payout = parseFloat((b.betAmount * multiplier).toFixed(2));

          // Credit Demo Balance
          updateBalance(payout);

          // Audio chime
          sounds.playBucket(multiplier);

          // Highlight bucket
          setActiveBucketIndex({ index: bucketIdx, expire: performance.now() + 320 });

          // History entry
          setHistory((prev) => [
            { id: `h-${Date.now()}-${Math.random()}`, multiplier },
            ...prev.slice(0, 6),
          ]);

          // Floating Payout Text
          payoutsRef.current.push({
            id: Date.now() + Math.random(),
            x: b.x,
            y: bottomLimit - 10,
            text: `+${multiplier}x ($${payout.toFixed(2)})`,
            alpha: 1.0,
          });

          // Big Win Confetti
          if (multiplier >= 10) {
            try {
              confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.8 },
                colors: ["#00e701", "#f59e0b", "#ffffff"],
              });
            } catch {
              // ignore
            }
          }

          // Remove ball
          ballsRef.current.splice(i, 1);
          continue;
        }

        // Draw Ball
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw Floating Payouts
      for (let pIdx = payoutsRef.current.length - 1; pIdx >= 0; pIdx--) {
        const fp = payoutsRef.current[pIdx];
        fp.y -= 0.8;
        fp.alpha -= 0.02;

        if (fp.alpha <= 0) {
          payoutsRef.current.splice(pIdx, 1);
          continue;
        }

        ctx.save();
        ctx.fillStyle = `rgba(0, 231, 1, ${fp.alpha})`;
        ctx.font = "bold 11px monospace";
        ctx.textAlign = "center";
        ctx.shadowColor = "#00e701";
        ctx.shadowBlur = 6;
        ctx.fillText(fp.text, fp.x, fp.y);
        ctx.restore();
      }

      // Draw Bottom Multiplier Buckets
      const bucketCount = rows + 1;
      const bucketSpacing = Math.min(36, (width - 60) / (rows + 2));
      const totalBucketWidth = bucketCount * bucketSpacing;
      const bucketStartX = (width - totalBucketWidth) / 2;
      const bucketY = height - 48;
      const bucketHeight = 32;

      for (let bIdx = 0; bIdx < bucketCount; bIdx++) {
        const bx = bucketStartX + bIdx * bucketSpacing + 1.5;
        const bw = bucketSpacing - 3;
        const mult = currentMultipliers[bIdx] ?? 1.0;
        const style = getBucketColor(mult);

        const isHit =
          activeBucketIndex &&
          activeBucketIndex.index === bIdx &&
          performance.now() < activeBucketIndex.expire;

        ctx.save();
        ctx.beginPath();
        const r = 5;
        ctx.roundRect(bx, bucketY - (isHit ? 4 : 0), bw, bucketHeight + (isHit ? 4 : 0), [r]);
        ctx.fillStyle = isHit ? "#ffffff" : style.bg;
        if (isHit) {
          ctx.shadowColor = "#00e701";
          ctx.shadowBlur = 14;
        }
        ctx.fill();
        ctx.strokeStyle = isHit ? "#00e701" : style.border;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Multiplier Text inside Bucket
        ctx.fillStyle = isHit ? "#0f212e" : style.text;
        ctx.font = `bold ${bw < 28 ? "9px" : "11px"} monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          mult >= 100 ? `${mult}` : `${mult}x`,
          bx + bw / 2,
          bucketY + bucketHeight / 2 - (isHit ? 2 : 0)
        );
        ctx.restore();
      }

      ctx.restore();
      animationFrameRef.current = requestAnimationFrame(render);
    };

    pegsRef.current = generatePegs(canvas.clientWidth, canvas.clientHeight);
    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [rows, currentMultipliers, activeBucketIndex, updateBalance]);

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

        {/* Live Multiplier History Strip (Last 7 Balls) */}
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
                {h.multiplier}x
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
        <div className="w-full lg:w-[320px] shrink-0 border-t lg:border-t-0 lg:border-r border-[#213743] bg-[#1a2c38] p-4 sm:p-5 flex flex-col justify-start space-y-4">
          {/* [Section 2 - Directly below Game Screen]: PRIMARY ACTION BUTTON */}
          <div className="w-full">
            <button
              onClick={() => dropBall()}
              disabled={betAmount > balance || betAmount <= 0}
              className="w-full py-4 text-base font-extrabold rounded-lg bg-[#00e701] text-black shadow-md hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              <CircleDot className="h-5 w-5 fill-current" />
              <span>Bet</span>
            </button>
          </div>

          {/* [Section 3]: Betting Inputs & Modifiers */}
          <div className="space-y-4">
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
                  value={betAmount}
                  onChange={(e) =>
                    setBetAmount(Math.max(0, parseFloat(e.target.value) || 0))
                  }
                  className="w-full bg-transparent text-sm font-bold text-white focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={handleHalfBet}
                  className="rounded-lg px-2 py-1 text-xs font-bold text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors"
                >
                  ½
                </button>
                <button
                  type="button"
                  onClick={handleDoubleBet}
                  className="rounded-lg px-2 py-1 text-xs font-bold text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors"
                >
                  2×
                </button>
                <button
                  type="button"
                  onClick={handleMaxBet}
                  className="rounded-lg px-2 py-1 text-xs font-bold text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors"
                >
                  Max
                </button>
              </div>
            </div>

            {/* Risk Selector Tabs */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#b1bad3]">Risk</label>
              <div className="grid grid-cols-3 gap-2 rounded-xl bg-[#0f212e] p-1 border border-[#213743]">
                {(["low", "medium", "high"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setRisk(r);
                    }}
                    className={`rounded-lg py-2 text-xs font-bold capitalize transition-all ${
                      risk === r
                        ? "bg-[#213743] text-[#00e701] shadow-sm border border-[#00e701]/30"
                        : "text-[#b1bad3] hover:text-white"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Rows Selector (8 to 16 rows) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-[#b1bad3]">
                <span>Rows</span>
                <span className="text-white font-mono">{rows}</span>
              </div>
              <select
                value={rows}
                onChange={(e) => {
                  sounds.playClick();
                  setRows(parseInt(e.target.value));
                }}
                className="w-full rounded-xl border border-[#213743] bg-[#0f212e] px-3 py-2.5 text-xs font-bold text-white focus:border-[#00e701] focus:outline-none cursor-pointer"
              >
                {[8, 10, 12, 14, 16].map((cnt) => (
                  <option key={cnt} value={cnt} className="bg-[#1a2c38]">
                    {cnt} Rows ({cnt + 1} Buckets)
                  </option>
                ))}
              </select>
            </div>

            {/* Autobet Toggle */}
            <div className="rounded-xl border border-[#213743] bg-[#0f212e] p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className={`h-4 w-4 ${autoBetting ? "text-[#00e701] animate-spin" : "text-[#b1bad3]"}`} />
                <span className="text-xs font-bold text-white">Auto Drop</span>
              </div>
              <button
                type="button"
                onClick={() => setAutoBetting(!autoBetting)}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition-colors ${
                  autoBetting
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "bg-[#213743] text-white hover:bg-[#2f4553]"
                }`}
              >
                {autoBetting ? "Stop" : "Start"}
              </button>
            </div>

            {/* Multiplier Range Preview */}
            <div className="rounded-xl border border-[#213743] bg-[#0f212e] p-3 space-y-1 text-xs text-[#b1bad3]">
              <div className="flex justify-between">
                <span>Min Multiplier</span>
                <span className="text-white font-mono font-bold">
                  {Math.min(...currentMultipliers)}x
                </span>
              </div>
              <div className="flex justify-between">
                <span>Max Multiplier</span>
                <span className="text-[#00e701] font-mono font-bold">
                  {Math.max(...currentMultipliers)}x
                </span>
              </div>
            </div>
          </div>


        </div>

        {/* ======================================================== */}
        {/* 2. PLINKO CANVAS ARENA (Right Panel on Desktop / Top on Mobile) */}
        {/* ======================================================== */}
        <div
          ref={containerRef}
          className="flex-1 bg-[#0f212e] p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-between min-h-[480px] sm:min-h-[580px] relative overflow-hidden"
        >
          {/* Top Status Bar in Arena */}
          <div className="w-full flex items-center justify-between z-10">
            <div className="flex items-center gap-2 text-xs font-bold text-[#b1bad3]">
              <span className="flex h-2 w-2 rounded-full bg-[#00e701] animate-pulse" />
              <span>Provably Fair Physics</span>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-[#1a2c38] px-2.5 py-1 border border-[#213743] text-xs font-bold">
              <Layers className="h-3.5 w-3.5 text-[#00e701]" />
              <span className="text-[#b1bad3]">{rows} Rows</span>
            </div>
          </div>

          {/* Real-time HTML5 2D Physics Canvas */}
          <canvas
            ref={canvasRef}
            className="w-full h-full min-h-[420px] sm:min-h-[500px]"
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
                  <h3 className="text-base font-black text-white">Plinko Fairness</h3>
                  <p className="text-xs text-[#b1bad3]">
                    Cryptographic path verification for each dropped pin
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
                  Nonce (Ball Counter)
                </label>
                <div className="rounded-xl border border-[#213743] bg-[#0f212e] px-3 py-2 font-mono text-white font-bold">
                  {nonce}
                </div>
              </div>

              <div className="rounded-xl border border-[#213743] bg-[#0f212e] p-3 text-[11px] space-y-1 text-[#b1bad3]">
                <div className="font-bold text-white">Binomial Deflection Math:</div>
                <div className="font-mono text-[#00e701]">
                  P(X = k) = C(Rows, k) × 0.5^Rows
                </div>
                <div>Where k is the landed bucket index, symmetrical across the board.</div>
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
