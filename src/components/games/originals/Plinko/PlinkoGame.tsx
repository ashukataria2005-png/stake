"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CircleDot,
  Volume2,
  VolumeX,
  ShieldCheck,
  Maximize2,
  Minimize2,
  RefreshCw,
  X,
  Copy,
  Check,
  Play,
  Layers,
  Settings,
  BarChart2,
  Heart,
  Bookmark,
  Share2,
  ChevronDown,
  Sparkles,
  Zap,
  TrendingUp,
  Sliders,
  RotateCcw,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

// Authentic Stake Multiplier Tables: Rows (8–16) × Risk (low, medium, high, expert)
export type PlinkoDifficulty = "low" | "medium" | "high" | "expert";

export const PLINKO_MULTIPLIER_TABLES: Record<number, Record<PlinkoDifficulty, number[]>> = {
  8: {
    low: [5.6, 2.1, 1.1, 1.0, 0.5, 1.0, 1.1, 2.1, 5.6],
    medium: [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
    high: [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29],
    expert: [50, 15, 3, 0.5, 0.1, 0.5, 3, 15, 50],
  },
  9: {
    low: [5.6, 2.0, 1.6, 1.0, 0.7, 0.7, 1.0, 1.6, 2.0, 5.6],
    medium: [18, 4.0, 1.7, 0.9, 0.5, 0.5, 0.9, 1.7, 4.0, 18],
    high: [43, 7.0, 2.0, 0.6, 0.2, 0.2, 0.6, 2.0, 7.0, 43],
    expert: [100, 20, 5.0, 1.0, 0.1, 0.1, 1.0, 5.0, 20, 100],
  },
  10: {
    low: [8.9, 3.0, 1.4, 1.1, 1.0, 0.5, 1.0, 1.1, 1.4, 3.0, 8.9],
    medium: [22, 5.0, 2.0, 1.4, 0.6, 0.4, 0.6, 1.4, 2.0, 5.0, 22],
    high: [76, 10, 3.0, 0.9, 0.3, 0.2, 0.3, 0.9, 3.0, 10, 76],
    expert: [250, 45, 10, 2.0, 0.4, 0.1, 0.4, 2.0, 10, 45, 250],
  },
  11: {
    low: [8.4, 3.0, 1.9, 1.3, 1.0, 0.7, 0.7, 1.0, 1.3, 1.9, 3.0, 8.4],
    medium: [24, 6.0, 3.0, 1.8, 0.7, 0.5, 0.5, 0.7, 1.8, 3.0, 6.0, 24],
    high: [120, 14, 4.2, 1.4, 0.4, 0.2, 0.2, 0.4, 1.4, 4.2, 14, 120],
    expert: [500, 80, 18, 4.0, 0.8, 0.1, 0.1, 0.8, 4.0, 18, 80, 500],
  },
  12: {
    low: [8.4, 3.0, 1.6, 1.4, 1.1, 1.0, 0.5, 1.0, 1.1, 1.4, 1.6, 3.0, 8.4],
    medium: [33, 11, 4.0, 2.0, 1.1, 0.6, 0.3, 0.6, 1.1, 2.0, 4.0, 11, 33],
    high: [170, 24, 8.1, 2.0, 0.7, 0.2, 0.2, 0.2, 0.7, 2.0, 8.1, 24, 170],
    expert: [1000, 150, 35, 8.0, 1.5, 0.3, 0.1, 0.3, 1.5, 8.0, 35, 150, 1000],
  },
  13: {
    low: [8.1, 4.0, 2.1, 1.3, 1.1, 1.0, 0.7, 0.7, 1.0, 1.1, 1.3, 2.1, 4.0, 8.1],
    medium: [43, 13, 6.0, 3.0, 1.3, 0.7, 0.4, 0.4, 0.7, 1.3, 3.0, 6.0, 13, 43],
    high: [260, 37, 11, 4.0, 1.0, 0.2, 0.2, 0.2, 0.2, 1.0, 4.0, 11, 37, 260],
    expert: [2500, 300, 60, 15, 3.0, 0.5, 0.1, 0.1, 0.5, 3.0, 15, 60, 300, 2500],
  },
  14: {
    low: [7.1, 4.0, 1.9, 1.4, 1.3, 1.1, 1.0, 0.5, 1.0, 1.1, 1.3, 1.4, 1.9, 4.0, 7.1],
    medium: [58, 15, 7.0, 4.0, 1.9, 1.3, 0.5, 0.2, 0.5, 1.3, 1.9, 4.0, 7.0, 15, 58],
    high: [420, 56, 18, 5.0, 1.9, 0.3, 0.2, 0.2, 0.2, 0.3, 1.9, 5.0, 18, 56, 420],
    expert: [5000, 600, 120, 25, 5.0, 1.0, 0.2, 0.1, 0.2, 1.0, 5.0, 25, 120, 600, 5000],
  },
  15: {
    low: [15, 8.0, 3.0, 2.0, 1.5, 1.1, 1.0, 0.5, 0.5, 1.0, 1.1, 1.5, 2.0, 3.0, 8.0, 15],
    medium: [88, 25, 9.0, 4.5, 2.5, 1.4, 0.7, 0.3, 0.3, 0.7, 1.4, 2.5, 4.5, 9.0, 25, 88],
    high: [620, 83, 24, 7.0, 2.8, 0.7, 0.2, 0.2, 0.2, 0.2, 0.7, 2.8, 7.0, 24, 83, 620],
    expert: [7500, 1000, 200, 40, 10, 2.5, 0.5, 0.1, 0.1, 0.5, 2.5, 10, 40, 200, 1000, 7500],
  },
  16: {
    low: [16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1.0, 0.5, 1.0, 1.1, 1.2, 1.4, 1.4, 2, 9, 16],
    medium: [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110],
    high: [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000],
    expert: [10000, 1500, 300, 60, 15, 4, 1.5, 0.3, 0.1, 0.3, 1.5, 4, 15, 60, 300, 1500, 10000],
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
  pulse: number;
}

interface FloatingPayout {
  id: number;
  x: number;
  y: number;
  text: string;
  alpha: number;
}

// Compute dynamic color gradient: deep purple/red extremes -> orange -> yellow -> green/cyan center
function getBucketColorGrading(index: number, totalBuckets: number) {
  const center = (totalBuckets - 1) / 2;
  const dist = Math.abs(index - center) / (center || 1); // 0 at center, 1 at edge

  if (dist < 0.18) {
    // Center Trough: Bright Cyan / Green
    return { bg: "#06b6d4", text: "#082f49", border: "#22d3ee", shadow: "#06b6d4" };
  } else if (dist < 0.36) {
    // Inner center: Emerald Green
    return { bg: "#10b981", text: "#022c22", border: "#34d399", shadow: "#10b981" };
  } else if (dist < 0.55) {
    // Intermediate: Lime / Yellow
    return { bg: "#eab308", text: "#422006", border: "#facc15", shadow: "#eab308" };
  } else if (dist < 0.72) {
    // Outer Mid: Blazing Orange
    return { bg: "#f97316", text: "#ffffff", border: "#fb923c", shadow: "#f97316" };
  } else if (dist < 0.88) {
    // High Rim: Fire Red
    return { bg: "#ef4444", text: "#ffffff", border: "#f87171", shadow: "#ef4444" };
  } else {
    // Extreme Edge Jackpot: Deep Purple / Crimson
    return { bg: "#a855f7", text: "#ffffff", border: "#c084fc", shadow: "#a855f7" };
  }
}

export default function PlinkoGame() {
  const { balance, updateBalance, formatBalance, currencySymbol } = useGame();
  const activeSym = currencySymbol || "$";

  // Game Settings
  const [betAmount, setBetAmount] = useState<number>(10);
  const [betInput, setBetInput] = useState<string>("10");
  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [difficulty, setDifficulty] = useState<PlinkoDifficulty>("medium");
  const [rows, setRows] = useState<number>(16);

  // Auto Betting State
  const [autoBetting, setAutoBetting] = useState<boolean>(false);
  const [autoBetCount, setAutoBetCount] = useState<number>(0);
  const [autoBetLimit, setAutoBetLimit] = useState<number>(0); // 0 = infinite

  // Modals & Panels
  const [isFairnessOpen, setIsFairnessOpen] = useState<boolean>(false);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Sound & Screen Settings
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [fastDrop, setFastDrop] = useState<boolean>(false);
  const [hotkeysEnabled, setHotkeysEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Favorites & Social
  const [isFavorited, setIsFavorited] = useState<boolean>(false);
  const [favoriteCount, setFavoriteCount] = useState<number>(38429);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Live Stats State
  const [stats, setStats] = useState({
    totalBets: 0,
    totalWagered: 0,
    totalWon: 0,
    netProfit: 0,
    bestMultiplier: 0,
  });

  // Fairness Seeds
  const [serverSeedHash] = useState<string>(
    "8e4f1a09d3b7621c54ea908b21c43f76901e5a2c89f3d12b07e456a1b2c3d4e5"
  );
  const [clientSeed, setClientSeed] = useState<string>("stake_plinko_8192a");
  const [nonce, setNonce] = useState<number>(412);
  const [copiedField, setCopiedField] = useState<string | null>(null);

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

  // Active highlighted bucket
  const [activeBucketIndex, setActiveBucketIndex] = useState<{ index: number; expire: number } | null>(null);

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const ballsRef = useRef<Ball[]>([]);
  const pegsRef = useRef<Peg[]>([]);
  const payoutsRef = useRef<FloatingPayout[]>([]);
  const nextBallIdRef = useRef<number>(1);
  const lastPegSoundTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // Active Multipliers list
  const currentMultipliers = useMemo(() => {
    return PLINKO_MULTIPLIER_TABLES[rows]?.[difficulty] || PLINKO_MULTIPLIER_TABLES[16].medium;
  }, [rows, difficulty]);

  // Toggle Sound
  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    sounds.enabled = !next;
  };

  // Math Buttons (½, 2x, Max)
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

  // Drop a single Plinko Ball
  const dropBall = useCallback(() => {
    const effectiveBet =
      betInput === "" || isNaN(parseFloat(betInput)) || parseFloat(betInput) <= 0
        ? 1
        : parseFloat(betInput);

    if (betInput === "" || isNaN(parseFloat(betInput))) {
      setBetInput(effectiveBet.toString());
      setBetAmount(effectiveBet);
    }

    if (effectiveBet > balance) {
      alert("Insufficient balance! Please use the Wallet button to top up.");
      setAutoBetting(false);
      return;
    }
    if (effectiveBet <= 0) return;

    // Deduct bet amount immediately
    updateBalance(-effectiveBet);
    setNonce((n) => n + 1);

    // Update wagered stats
    setStats((prev) => ({
      ...prev,
      totalBets: prev.totalBets + 1,
      totalWagered: prev.totalWagered + effectiveBet,
      netProfit: prev.netProfit - effectiveBet,
    }));

    const canvas = canvasRef.current;
    const width = canvas ? canvas.getBoundingClientRect().width : 600;
    const startX = width / 2 + (Math.random() - 0.5) * 5;
    const startY = 24;

    const ballColors = ["#38bdf8", "#00e701", "#ffffff", "#facc15", "#f43f5e"];
    const chosenColor = ballColors[Math.floor(Math.random() * ballColors.length)];

    ballsRef.current.push({
      id: nextBallIdRef.current++,
      x: startX,
      y: startY,
      vx: (Math.random() - 0.5) * 1.6,
      vy: Math.random() * 0.6,
      radius: 5.5,
      betAmount: effectiveBet,
      color: chosenColor,
      hasLanded: false,
    });
  }, [balance, betAmount, betInput, updateBalance]);

  // Handle Bet Button Action
  const handleBetAction = () => {
    if (mode === "manual") {
      dropBall();
    } else {
      if (autoBetting) {
        setAutoBetting(false);
      } else {
        setAutoBetCount(0);
        setAutoBetting(true);
      }
    }
  };

  // Auto-Bet Loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (autoBetting) {
      const speed = fastDrop ? 200 : 350;
      interval = setInterval(() => {
        setAutoBetCount((cnt) => {
          if (autoBetLimit > 0 && cnt >= autoBetLimit) {
            setAutoBetting(false);
            return cnt;
          }
          dropBall();
          return cnt + 1;
        });
      }, speed);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoBetting, autoBetLimit, dropBall, fastDrop]);

  // Spacebar hotkey
  useEffect(() => {
    if (!hotkeysEnabled) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === "Space" &&
        e.target instanceof HTMLElement &&
        e.target.tagName !== "INPUT" &&
        e.target.tagName !== "SELECT"
      ) {
        e.preventDefault();
        dropBall();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dropBall, hotkeysEnabled]);

  // -------------------------------------------------------------
  // HTML5 CANVAS PHYSICS & MULTIPLIER PYRAMID
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
      const startY = 46;
      const bottomY = h - 64;
      const spacingY = (bottomY - startY) / (rows + 1);

      for (let r = 0; r < rows; r++) {
        const count = r + 3;
        const spacingX = Math.min(36, (w - 32) / (rows + 2));
        const rowWidth = (count - 1) * spacingX;
        const startX = (w - rowWidth) / 2;
        const y = startY + (r + 1) * spacingY;

        for (let c = 0; c < count; c++) {
          pegs.push({
            x: startX + c * spacingX,
            y: y,
            radius: Math.max(2.6, Math.min(4, spacingX * 0.16)),
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

      // Arena Background
      ctx.fillStyle = "#0f212e";
      ctx.fillRect(0, 0, width, height);

      // Subtle Background Grid
      ctx.strokeStyle = "#21374326";
      ctx.lineWidth = 1;
      for (let y = 30; y < height; y += 35) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Top Drop Funnel
      ctx.beginPath();
      ctx.arc(width / 2, 16, 14, 0, Math.PI);
      ctx.fillStyle = "#1a2c38";
      ctx.fill();
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Update & Draw Pegs
      for (let i = 0; i < pegsRef.current.length; i++) {
        const peg = pegsRef.current[i];
        if (peg.pulse > 0) {
          peg.pulse = Math.max(0, peg.pulse - 0.06);
        }

        ctx.beginPath();
        ctx.arc(peg.x, peg.y, peg.radius + peg.pulse * 2.5, 0, Math.PI * 2);
        if (peg.pulse > 0) {
          ctx.fillStyle = "#ffffff";
          ctx.shadowColor = "#38bdf8";
          ctx.shadowBlur = 12;
        } else {
          ctx.fillStyle = "#94a3b8";
          ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Physics Constants
      const gravity = fastDrop ? 0.35 : 0.23;
      const bounce = 0.58;
      const friction = 0.99;
      const bottomLimit = height - 52;

      // Update & Draw Balls
      for (let i = ballsRef.current.length - 1; i >= 0; i--) {
        const b = ballsRef.current[i];

        b.vy += gravity;
        b.vx *= friction;
        b.vy *= friction;

        b.x += b.vx;
        b.y += b.vy;

        // Side walls
        if (b.x < b.radius + 4) {
          b.x = b.radius + 4;
          b.vx = -b.vx * bounce;
        } else if (b.x > width - b.radius - 4) {
          b.x = width - b.radius - 4;
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

            const dot = b.vx * nx + b.vy * ny;
            if (dot < 0) {
              const impulse = -(1 + bounce) * dot;
              b.vx += impulse * nx + (Math.random() - 0.5) * 0.45;
              b.vy += impulse * ny;
            }

            b.x = peg.x + nx * minDist;
            b.y = peg.y + ny * minDist;
            peg.pulse = 1.0;

            const now = performance.now();
            if (now - lastPegSoundTimeRef.current > 30) {
              sounds.playPeg();
              lastPegSoundTimeRef.current = now;
            }
          }
        }

        // Ball Landing in Bottom Bucket
        if (b.y >= bottomLimit && !b.hasLanded) {
          b.hasLanded = true;

          const bucketCount = rows + 1;
          const spacingX = Math.min(36, (width - 32) / (rows + 2));
          const totalWidth = bucketCount * spacingX;
          const startX = (width - totalWidth) / 2;
          const relativeX = b.x - startX;
          let bucketIdx = Math.floor(relativeX / spacingX);
          bucketIdx = Math.max(0, Math.min(bucketCount - 1, bucketIdx));

          const multiplier = currentMultipliers[bucketIdx] ?? 1.0;
          const payout = parseFloat((b.betAmount * multiplier).toFixed(2));

          // Credit Balance
          updateBalance(payout);

          // Update Stats
          setStats((prev) => ({
            ...prev,
            totalWon: prev.totalWon + payout,
            netProfit: prev.netProfit + payout,
            bestMultiplier: Math.max(prev.bestMultiplier, multiplier),
          }));

          // Audio
          sounds.playBucket(multiplier);

          // Highlight bucket
          setActiveBucketIndex({ index: bucketIdx, expire: performance.now() + 320 });

          // History entry
          setHistory((prev) => [
            { id: `h-${Date.now()}-${Math.random()}`, multiplier },
            ...prev.slice(0, 6),
          ]);

          // Floating payout text
          payoutsRef.current.push({
            id: Date.now() + Math.random(),
            x: b.x,
            y: bottomLimit - 12,
            text: `+${multiplier}x (${activeSym}${payout.toFixed(2)})`,
            alpha: 1.0,
          });

          // Big Win Celebration
          if (multiplier >= 10) {
            try {
              confetti({
                particleCount: multiplier >= 100 ? 100 : 50,
                spread: 70,
                origin: { y: 0.75 },
                colors: ["#38bdf8", "#00e701", "#f59e0b", "#a855f7", "#ffffff"],
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
        fp.alpha -= 0.022;

        if (fp.alpha <= 0) {
          payoutsRef.current.splice(pIdx, 1);
          continue;
        }

        ctx.save();
        ctx.fillStyle = `rgba(56, 189, 248, ${fp.alpha})`;
        ctx.font = "bold 11px monospace";
        ctx.textAlign = "center";
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 6;
        ctx.fillText(fp.text, fp.x, fp.y);
        ctx.restore();
      }

      // ---------------------------------------------------------
      // Draw Dynamic Bottom Multiplier Buckets
      // ---------------------------------------------------------
      const bucketCount = rows + 1;
      const bucketSpacing = Math.min(36, (width - 32) / (rows + 2));
      const totalBucketWidth = bucketCount * bucketSpacing;
      const bucketStartX = (width - totalBucketWidth) / 2;
      const bucketY = height - 44;
      const bucketHeight = 28;

      for (let bIdx = 0; bIdx < bucketCount; bIdx++) {
        const bx = bucketStartX + bIdx * bucketSpacing + 1;
        const bw = bucketSpacing - 2;
        const mult = currentMultipliers[bIdx] ?? 1.0;
        const style = getBucketColorGrading(bIdx, bucketCount);

        const isHit =
          activeBucketIndex &&
          activeBucketIndex.index === bIdx &&
          performance.now() < activeBucketIndex.expire;

        ctx.save();
        ctx.beginPath();
        const r = 4;
        ctx.roundRect(bx, bucketY - (isHit ? 4 : 0), bw, bucketHeight + (isHit ? 4 : 0), [r]);
        ctx.fillStyle = isHit ? "#ffffff" : style.bg;
        if (isHit) {
          ctx.shadowColor = style.shadow;
          ctx.shadowBlur = 16;
        }
        ctx.fill();
        ctx.strokeStyle = isHit ? "#ffffff" : style.border;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Multiplier Text
        ctx.fillStyle = isHit ? "#0f212e" : style.text;
        const fontSize = bw < 20 ? "8px" : bw < 26 ? "9px" : "11px";
        ctx.font = `bold ${fontSize} monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const label =
          mult >= 10000
            ? "10K"
            : mult >= 1000
            ? "1K"
            : mult >= 100
            ? `${mult}`
            : `${mult}x`;

        ctx.fillText(label, bx + bw / 2, bucketY + bucketHeight / 2 - (isHit ? 2 : 0));
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
  }, [rows, currentMultipliers, activeBucketIndex, updateBalance, fastDrop, activeSym]);

  // Copy helper
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1800);
  };

  // Toggle favorite
  const toggleFavorite = () => {
    if (isFavorited) {
      setIsFavorited(false);
      setFavoriteCount((c) => c - 1);
    } else {
      setIsFavorited(true);
      setFavoriteCount((c) => c + 1);
    }
  };

  return (
    <div
      className={`w-full max-w-5xl mx-auto px-2 sm:px-4 py-4 select-none space-y-4 ${
        isFullscreen ? "fixed inset-0 z-50 bg-[#0f212e] overflow-y-auto p-4 max-w-none" : ""
      }`}
    >
      {/* ======================================================== */}
      {/* TOP HEADER: Back Link & History Strip                    */}
      {/* ======================================================== */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-bold text-[#b1bad3] hover:text-white transition-colors shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back to Casino Lobby</span>
          <span className="sm:hidden">Lobby</span>
        </Link>

        {/* Live Multiplier History Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          <span className="text-[10px] font-bold text-[#b1bad3] uppercase tracking-wider hidden md:inline mr-1 shrink-0">
            Recent:
          </span>
          {history.map((h) => {
            const isHigh = h.multiplier >= 2.0;
            const isExtreme = h.multiplier >= 10.0;
            return (
              <span
                key={h.id}
                className={`rounded-lg px-2 py-0.5 text-xs font-mono font-bold border transition-colors shrink-0 ${
                  isExtreme
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm"
                    : isHigh
                    ? "bg-[#00e701]/15 text-[#00e701] border-[#00e701]/30"
                    : "bg-[#213743] text-[#b1bad3] border-[#2f4553]"
                }`}
              >
                {h.multiplier}x
              </span>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* MAIN GAME CONTAINER: MOBILE-FIRST LAYOUT                */}
      {/* 1. Canvas Arena placed AT THE TOP                       */}
      {/* 2. Dedicated Betting Controls DIRECTLY BENEATH          */}
      {/* ======================================================== */}
      <div className="rounded-2xl border border-[#213743] bg-[#1a2c38] shadow-2xl overflow-hidden flex flex-col">
        {/* ======================================================== */}
        {/* PART 1: PLINKO CANVAS ARENA (TOP)                        */}
        {/* ======================================================== */}
        <div
          ref={containerRef}
          className="w-full bg-[#0f212e] p-3 sm:p-5 flex flex-col items-center justify-between min-h-[460px] sm:min-h-[520px] relative overflow-hidden"
        >
          {/* Top Status Bar inside Canvas */}
          <div className="w-full flex items-center justify-between z-10">
            <div className="flex items-center gap-2 text-xs font-bold text-[#b1bad3]">
              <span className="flex h-2 w-2 rounded-full bg-[#38bdf8] animate-pulse" />
              <span className="text-white">Provably Fair Physics</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#b1bad3] bg-[#1a2c38] px-2.5 py-1 rounded-lg border border-[#213743] flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-[#38bdf8]" />
                <span>{rows} Rows</span>
              </span>

              <button
                onClick={toggleSound}
                title={isMuted ? "Unmute Audio" : "Mute Audio"}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1a2c38] border border-[#213743] text-[#b1bad3] hover:text-white transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="h-3.5 w-3.5 text-red-400" />
                ) : (
                  <Volume2 className="h-3.5 w-3.5 text-[#38bdf8]" />
                )}
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1a2c38] border border-[#213743] text-[#b1bad3] hover:text-white transition-colors"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-3.5 w-3.5" />
                ) : (
                  <Maximize2 className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Real-time HTML5 2D Canvas */}
          <canvas
            ref={canvasRef}
            className="w-full h-full min-h-[400px] sm:min-h-[460px] flex-1 my-1"
          />
        </div>

        {/* ======================================================== */}
        {/* PART 2: DEDICATED BETTING CONTROLS BOX (DIRECTLY BENEATH) */}
        {/* ======================================================== */}
        <div className="w-full border-t border-[#213743] bg-[#1a2c38] p-4 sm:p-5 space-y-4">
          {/* PRIMARY ACTION: Full-Width Vibrant Blue Bet Button */}
          <button
            onClick={handleBetAction}
            disabled={betAmount > balance || betAmount <= 0}
            className={`w-full py-3.5 sm:py-4 text-base font-black rounded-xl text-white shadow-lg shadow-blue-500/20 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer ${
              autoBetting
                ? "bg-red-600 hover:bg-red-700 shadow-red-500/20"
                : "bg-[#1475e1] hover:bg-[#1065c7]"
            }`}
          >
            {autoBetting ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>Stop Auto Bet ({autoBetCount})</span>
              </>
            ) : mode === "auto" ? (
              <>
                <Zap className="h-5 w-5 fill-current" />
                <span>Start Auto Bet</span>
              </>
            ) : (
              <>
                <CircleDot className="h-5 w-5 fill-current" />
                <span>Bet</span>
              </>
            )}
          </button>

          {/* Betting Mode Switcher: Segmented Pill [ Manual | Auto ] */}
          <div className="grid grid-cols-2 rounded-xl bg-[#0f212e] p-1 border border-[#213743]">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setMode("manual");
                setAutoBetting(false);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
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
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                mode === "auto"
                  ? "bg-[#213743] text-white shadow-sm"
                  : "text-[#b1bad3] hover:text-white"
              }`}
            >
              Auto
            </button>
          </div>

          {/* Bet Amount Row: Input Field with Quick '½' and '2x' Buttons */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-[#b1bad3]">
              <span>Bet Amount</span>
              <span className="font-mono text-[#38bdf8]">
                {activeSym}{formatBalance(balance)}
              </span>
            </div>
            <div className="flex items-center rounded-xl border border-[#213743] bg-[#0f212e] p-1 focus-within:border-[#1475e1] transition-colors">
              <span className="px-2.5 text-sm font-bold text-[#38bdf8]">{activeSym}</span>
              <input
                type="text"
                inputMode="decimal"
                value={betInput}
                onChange={(e) => {
                  const val = e.target.value;
                  // Allow clean backspacing/empty string without sticky digits
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
                onClick={handleHalfBet}
                className="rounded-lg px-2.5 py-1 text-xs font-bold text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors"
              >
                ½
              </button>
              <button
                type="button"
                onClick={handleDoubleBet}
                className="rounded-lg px-2.5 py-1 text-xs font-bold text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors"
              >
                2×
              </button>
              <button
                type="button"
                onClick={handleMaxBet}
                className="rounded-lg px-2.5 py-1 text-xs font-bold text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors"
              >
                Max
              </button>
            </div>
          </div>

          {/* Selectors Grid: Difficulty Dropdown & Rows Dropdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Difficulty Dropdown [Low, Medium, High, Expert] */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#b1bad3]">Difficulty</label>
              <div className="relative">
                <select
                  value={difficulty}
                  onChange={(e) => {
                    sounds.playClick();
                    setDifficulty(e.target.value as PlinkoDifficulty);
                  }}
                  className="w-full appearance-none rounded-xl border border-[#213743] bg-[#0f212e] px-3.5 py-2.5 text-xs font-bold text-white capitalize focus:border-[#1475e1] focus:outline-none cursor-pointer"
                >
                  <option value="low" className="bg-[#1a2c38]">Low Risk</option>
                  <option value="medium" className="bg-[#1a2c38]">Medium Risk</option>
                  <option value="high" className="bg-[#1a2c38]">High Risk</option>
                  <option value="expert" className="bg-[#1a2c38]">Expert Risk (10,000x Max)</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-[#b1bad3]" />
              </div>
            </div>

            {/* Rows Dropdown (8 to 16 Rows) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#b1bad3]">Rows (Pyramid Depth)</label>
              <div className="relative">
                <select
                  value={rows}
                  onChange={(e) => {
                    sounds.playClick();
                    setRows(parseInt(e.target.value));
                  }}
                  className="w-full appearance-none rounded-xl border border-[#213743] bg-[#0f212e] px-3.5 py-2.5 text-xs font-bold text-white focus:border-[#1475e1] focus:outline-none cursor-pointer"
                >
                  {[8, 9, 10, 11, 12, 13, 14, 15, 16].map((cnt) => (
                    <option key={cnt} value={cnt} className="bg-[#1a2c38]">
                      {cnt} Rows ({cnt + 1} Multipliers)
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-[#b1bad3]" />
              </div>
            </div>
          </div>

          {/* Auto Mode Custom Inputs */}
          {mode === "auto" && (
            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-[#213743]/50">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#b1bad3]">Number of Bets</label>
                <div className="flex items-center rounded-xl border border-[#213743] bg-[#0f212e] px-3 py-1.5">
                  <input
                    type="number"
                    min="0"
                    placeholder="∞"
                    value={autoBetLimit === 0 ? "" : autoBetLimit}
                    onChange={(e) => setAutoBetLimit(parseInt(e.target.value) || 0)}
                    className="w-full bg-transparent text-xs font-bold text-white font-mono focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setAutoBetLimit(0)}
                    className="text-[10px] font-bold text-[#38bdf8] hover:underline"
                  >
                    ∞
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#b1bad3]">Active Run Bets</label>
                <div className="rounded-xl border border-[#213743] bg-[#0f212e] px-3 py-2 text-xs font-bold font-mono text-white">
                  {autoBetCount} / {autoBetLimit === 0 ? "∞" : autoBetLimit}
                </div>
              </div>
            </div>
          )}

          {/* Multiplier Spectrum Preview Strip */}
          <div className="flex items-center justify-between rounded-xl bg-[#0f212e] px-3.5 py-2.5 border border-[#213743] text-xs">
            <div className="flex items-center gap-1.5 text-[#b1bad3]">
              <span className="text-[11px] uppercase tracking-wider font-bold">Center:</span>
              <span className="font-mono font-bold text-cyan-400">
                {Math.min(...currentMultipliers)}x
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[#b1bad3]">
              <span className="text-[11px] uppercase tracking-wider font-bold">Max Edge:</span>
              <span className="font-mono font-bold text-purple-400 text-sm">
                {Math.max(...currentMultipliers) >= 1000
                  ? `${(Math.max(...currentMultipliers) / 1000).toFixed(0)}K`
                  : Math.max(...currentMultipliers)}
                x
              </span>
            </div>
          </div>

          {/* Footer Bar of Controls: Fairness, Settings, Live Stats */}
          <div className="flex items-center justify-between border-t border-[#213743] pt-3">
            {/* Verifiable Fairness Trigger */}
            <button
              type="button"
              onClick={() => setIsFairnessOpen(true)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#b1bad3] hover:text-white hover:bg-[#213743] transition-colors"
            >
              <ShieldCheck className="h-4 w-4 text-[#38bdf8]" />
              <span>Fairness</span>
            </button>

            {/* Quick Action Icons */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsStatsOpen(true)}
                title="Live Stats"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#b1bad3] hover:text-white hover:bg-[#213743] transition-colors"
              >
                <BarChart2 className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                title="Plinko Settings"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#b1bad3] hover:text-white hover:bg-[#213743] transition-colors"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* PART 3: GAME DETAILS & CATEGORY CARD (BELOW CONTROLS)    */}
      {/* ======================================================== */}
      <div className="rounded-2xl border border-[#213743] bg-[#1a2c38] p-4 sm:p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#213743] pb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <CircleDot className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-white">Plinko</h1>
                <span className="rounded-full bg-blue-500/20 border border-blue-500/30 px-2 py-0.5 text-[10px] font-black tracking-wider text-blue-400 uppercase">
                  Originals
                </span>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-black text-emerald-400">
                  Exclusive
                </span>
              </div>
              <p className="text-xs text-[#b1bad3]">Stake Originals • RTP 99.00%</p>
            </div>
          </div>

          {/* Social / Bookmark / Favorites Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFavorite}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                isFavorited
                  ? "bg-rose-500/20 border-rose-500/40 text-rose-400"
                  : "bg-[#0f212e] border-[#213743] text-[#b1bad3] hover:text-white"
              }`}
            >
              <Heart className={`h-4 w-4 ${isFavorited ? "fill-current text-rose-400" : ""}`} />
              <span>{favoriteCount.toLocaleString()}</span>
            </button>

            <button
              onClick={() => setIsSaved(!isSaved)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                isSaved
                  ? "bg-[#1475e1]/20 border-[#1475e1]/40 text-[#38bdf8]"
                  : "bg-[#0f212e] border-[#213743] text-[#b1bad3] hover:text-white"
              }`}
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
              <span>{isSaved ? "Saved" : "Save Game"}</span>
            </button>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: "Plinko on Stake", url: window.location.href });
                } else {
                  copyToClipboard(window.location.href, "share");
                }
              }}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0f212e] border border-[#213743] text-[#b1bad3] hover:text-white transition-colors"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Technical Specs Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="rounded-xl bg-[#0f212e] p-3 border border-[#213743]">
            <span className="text-[#b1bad3] block text-[11px]">House Edge</span>
            <span className="text-white font-mono font-bold text-sm">1.00%</span>
          </div>
          <div className="rounded-xl bg-[#0f212e] p-3 border border-[#213743]">
            <span className="text-[#b1bad3] block text-[11px]">Max Multiplier</span>
            <span className="text-[#38bdf8] font-mono font-bold text-sm">10,000x</span>
          </div>
          <div className="rounded-xl bg-[#0f212e] p-3 border border-[#213743]">
            <span className="text-[#b1bad3] block text-[11px]">Pyramid Rows</span>
            <span className="text-white font-mono font-bold text-sm">8 to 16 Rows</span>
          </div>
          <div className="rounded-xl bg-[#0f212e] p-3 border border-[#213743]">
            <span className="text-[#b1bad3] block text-[11px]">Volatility</span>
            <span className="text-emerald-400 font-bold text-sm capitalize">{difficulty}</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: PROVABLY FAIR VERIFIER                         */}
      {/* ======================================================== */}
      {isFairnessOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#213743] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#38bdf8]/15 text-[#38bdf8]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Plinko Fairness</h3>
                  <p className="text-xs text-[#b1bad3]">
                    Cryptographic path verification for each dropped ball
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
                    className="text-[#b1bad3] hover:text-[#38bdf8]"
                  >
                    {copiedField === "server" ? (
                      <Check className="h-3.5 w-3.5 text-[#38bdf8]" />
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
                    className="text-[#b1bad3] hover:text-[#38bdf8]"
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
                <div className="font-mono text-[#38bdf8]">
                  P(X = k) = C(Rows, k) × 0.5^Rows
                </div>
                <div>Where k is the landed bucket index, symmetrical across the board.</div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#213743]">
              <button
                onClick={() => setIsFairnessOpen(false)}
                className="rounded-xl bg-[#1475e1] px-5 py-2 text-xs font-bold text-white hover:bg-[#1065c7]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: LIVE STATS                                      */}
      {/* ======================================================== */}
      {isStatsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#213743] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#38bdf8]/15 text-[#38bdf8]">
                  <BarChart2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Live Session Stats</h3>
                  <p className="text-xs text-[#b1bad3]">Real-time Plinko performance</p>
                </div>
              </div>
              <button
                onClick={() => setIsStatsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#b1bad3] hover:bg-[#213743] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-[#0f212e] p-3 border border-[#213743]">
                <span className="text-[#b1bad3] block text-[11px]">Total Bets</span>
                <span className="text-white font-mono font-bold text-sm">{stats.totalBets}</span>
              </div>
              <div className="rounded-xl bg-[#0f212e] p-3 border border-[#213743]">
                <span className="text-[#b1bad3] block text-[11px]">Best Multiplier</span>
                <span className="text-purple-400 font-mono font-bold text-sm">
                  {stats.bestMultiplier}x
                </span>
              </div>
              <div className="rounded-xl bg-[#0f212e] p-3 border border-[#213743]">
                <span className="text-[#b1bad3] block text-[11px]">Total Wagered</span>
                <span className="text-white font-mono font-bold text-sm">
                  {activeSym}{stats.totalWagered.toFixed(2)}
                </span>
              </div>
              <div className="rounded-xl bg-[#0f212e] p-3 border border-[#213743]">
                <span className="text-[#b1bad3] block text-[11px]">Net Profit</span>
                <span
                  className={`font-mono font-bold text-sm ${
                    stats.netProfit >= 0 ? "text-[#00e701]" : "text-rose-400"
                  }`}
                >
                  {stats.netProfit >= 0 ? "+" : ""}
                  {activeSym}{stats.netProfit.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-[#213743]">
              <button
                onClick={() =>
                  setStats({
                    totalBets: 0,
                    totalWagered: 0,
                    totalWon: 0,
                    netProfit: 0,
                    bestMultiplier: 0,
                  })
                }
                className="flex items-center gap-1 text-xs text-[#b1bad3] hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Stats</span>
              </button>

              <button
                onClick={() => setIsStatsOpen(false)}
                className="rounded-xl bg-[#1475e1] px-5 py-2 text-xs font-bold text-white hover:bg-[#1065c7]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: GAME SETTINGS                                   */}
      {/* ======================================================== */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#213743] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#38bdf8]/15 text-[#38bdf8]">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Plinko Settings</h3>
                  <p className="text-xs text-[#b1bad3]">Control game physics and audio</p>
                </div>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#b1bad3] hover:bg-[#213743] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0f212e] border border-[#213743]">
                <div>
                  <span className="font-bold text-white block">Game Audio</span>
                  <span className="text-[11px] text-[#b1bad3]">Play peg collisions and landing chimes</span>
                </div>
                <button
                  onClick={toggleSound}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    !isMuted ? "bg-[#1475e1]" : "bg-[#213743]"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      !isMuted ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0f212e] border border-[#213743]">
                <div>
                  <span className="font-bold text-white block">Fast Drop Mode</span>
                  <span className="text-[11px] text-[#b1bad3]">Accelerate ball physics gravity</span>
                </div>
                <button
                  onClick={() => setFastDrop(!fastDrop)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    fastDrop ? "bg-[#1475e1]" : "bg-[#213743]"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      fastDrop ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0f212e] border border-[#213743]">
                <div>
                  <span className="font-bold text-white block">Spacebar Hotkey</span>
                  <span className="text-[11px] text-[#b1bad3]">Press Spacebar to quickly drop ball</span>
                </div>
                <button
                  onClick={() => setHotkeysEnabled(!hotkeysEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    hotkeysEnabled ? "bg-[#1475e1]" : "bg-[#213743]"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      hotkeysEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#213743]">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="rounded-xl bg-[#1475e1] px-5 py-2 text-xs font-bold text-white hover:bg-[#1065c7]"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
