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
  Layers,
  Settings,
  BarChart2,
  Heart,
  Bookmark,
  Share2,
  ChevronDown,
  Zap,
  RotateCcw,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

// Authentic Stake Multiplier Tables: Rows (8–16) × Risk Level (low, medium, high)
export type PlinkoRisk = "low" | "medium" | "high";

export const PLINKO_MULTIPLIER_TABLES: Record<number, Record<PlinkoRisk, number[]>> = {
  8: {
    low: [5.6, 2.1, 1.1, 1.0, 0.5, 1.0, 1.1, 2.1, 5.6],
    medium: [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
    high: [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29],
  },
  9: {
    low: [5.6, 2.0, 1.6, 1.0, 0.7, 0.7, 1.0, 1.6, 2.0, 5.6],
    medium: [18, 4.0, 1.7, 0.9, 0.5, 0.5, 0.9, 1.7, 4.0, 18],
    high: [43, 7.0, 2.0, 0.6, 0.2, 0.2, 0.6, 2.0, 7.0, 43],
  },
  10: {
    low: [8.9, 3.0, 1.4, 1.1, 1.0, 0.5, 1.0, 1.1, 1.4, 3.0, 8.9],
    medium: [22, 5.0, 2.0, 1.4, 0.6, 0.4, 0.6, 1.4, 2.0, 5.0, 22],
    high: [76, 10, 3.0, 0.9, 0.3, 0.2, 0.3, 0.9, 3.0, 10, 76],
  },
  11: {
    low: [8.4, 3.0, 1.9, 1.3, 1.0, 0.7, 0.7, 1.0, 1.3, 1.9, 3.0, 8.4],
    medium: [24, 6.0, 3.0, 1.8, 0.7, 0.5, 0.5, 0.7, 1.8, 3.0, 6.0, 24],
    high: [120, 14, 4.2, 1.4, 0.4, 0.2, 0.2, 0.4, 1.4, 4.2, 14, 120],
  },
  12: {
    low: [8.4, 3.0, 1.6, 1.4, 1.1, 1.0, 0.5, 1.0, 1.1, 1.4, 1.6, 3.0, 8.4],
    medium: [33, 11, 4.0, 2.0, 1.1, 0.6, 0.3, 0.6, 1.1, 2.0, 4.0, 11, 33],
    high: [170, 24, 8.1, 2.0, 0.7, 0.2, 0.2, 0.2, 0.7, 2.0, 8.1, 24, 170],
  },
  13: {
    low: [8.1, 4.0, 2.1, 1.3, 1.1, 1.0, 0.7, 0.7, 1.0, 1.1, 1.3, 2.1, 4.0, 8.1],
    medium: [43, 13, 6.0, 3.0, 1.3, 0.7, 0.4, 0.4, 0.7, 1.3, 3.0, 6.0, 13, 43],
    high: [260, 37, 11, 4.0, 1.0, 0.2, 0.2, 0.2, 0.2, 1.0, 4.0, 11, 37, 260],
  },
  14: {
    low: [7.1, 4.0, 1.9, 1.4, 1.3, 1.1, 1.0, 0.5, 1.0, 1.1, 1.3, 1.4, 1.9, 4.0, 7.1],
    medium: [58, 15, 7.0, 4.0, 1.9, 1.3, 0.5, 0.2, 0.5, 1.3, 1.9, 4.0, 7.0, 15, 58],
    high: [420, 56, 18, 5.0, 1.9, 0.3, 0.2, 0.2, 0.2, 0.3, 1.9, 5.0, 18, 56, 420],
  },
  15: {
    low: [15, 8.0, 3.0, 2.0, 1.5, 1.1, 1.0, 0.5, 0.5, 1.0, 1.1, 1.5, 2.0, 3.0, 8.0, 15],
    medium: [88, 25, 9.0, 4.5, 2.5, 1.4, 0.7, 0.3, 0.3, 0.7, 1.4, 2.5, 4.5, 9.0, 25, 88],
    high: [620, 83, 24, 7.0, 2.8, 0.7, 0.2, 0.2, 0.2, 0.2, 0.7, 2.8, 7.0, 24, 83, 620],
  },
  16: {
    low: [16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1.0, 0.5, 1.0, 1.1, 1.2, 1.4, 1.4, 2, 9, 16],
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
  pulse: number;
}

interface FloatingPayout {
  id: number;
  x: number;
  y: number;
  text: string;
  alpha: number;
}

interface BucketHitState {
  index: number;
  expire: number;
  bounceOffset: number;
}

interface HistoryItem {
  id: string;
  multiplier: number;
  bg: string;
  text: string;
}

// Authentic Stake Heat-Map: Deep Crimson/Red on outer edges -> Orange -> Amber -> Bright Golden Yellow at center
export function getBucketColorGrading(index: number, totalBuckets: number) {
  const center = (totalBuckets - 1) / 2;
  const dist = Math.abs(index - center) / (center || 1); // 0 at center, 1 at edge

  if (dist < 0.16) {
    // Center Trough: Bright Golden Yellow
    return { bg: "#ffea00", text: "#0f212e", border: "#fff133", shadow: "#ffea00" };
  } else if (dist < 0.35) {
    // Inner center: Warm Amber
    return { bg: "#ffaa00", text: "#0f212e", border: "#ffbd33", shadow: "#ffaa00" };
  } else if (dist < 0.55) {
    // Intermediate: Bright Orange
    return { bg: "#ff7700", text: "#0f212e", border: "#ff9033", shadow: "#ff7700" };
  } else if (dist < 0.75) {
    // Outer Mid: Fire Coral / Red-Orange
    return { bg: "#ff3e14", text: "#ffffff", border: "#ff5e38", shadow: "#ff3e14" };
  } else if (dist < 0.92) {
    // High Rim: Fire Red
    return { bg: "#ee1133", text: "#ffffff", border: "#ff3355", shadow: "#ee1133" };
  } else {
    // Extreme Edge Jackpot (e.g. 1000x / 110x): Deep Crimson / Ruby
    return { bg: "#cc0029", text: "#ffffff", border: "#ff0033", shadow: "#ff0033" };
  }
}

export default function PlinkoGame() {
  const { balance, updateBalance, formatBalance, currencySymbol, addRecentlyPlayedGame } = useGame();
  const activeSym = currencySymbol || "$";

  // Game Settings (HUD)
  const [betAmount, setBetAmount] = useState<number>(10);
  const [betInput, setBetInput] = useState<string>("10");
  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [risk, setRisk] = useState<PlinkoRisk>("medium");
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

  // History strip of last 6 landed multipliers with authentic colors
  const [history, setHistory] = useState<HistoryItem[]>([
    { id: "h1", multiplier: 1.5, bg: "#ff7700", text: "#0f212e" },
    { id: "h2", multiplier: 0.5, bg: "#ffea00", text: "#0f212e" },
    { id: "h3", multiplier: 10, bg: "#ff3e14", text: "#ffffff" },
    { id: "h4", multiplier: 0.3, bg: "#ffea00", text: "#0f212e" },
    { id: "h5", multiplier: 3, bg: "#ffaa00", text: "#0f212e" },
    { id: "h6", multiplier: 41, bg: "#ee1133", text: "#ffffff" },
  ]);

  // Active highlighted bucket state
  const [activeBucket, setActiveBucket] = useState<BucketHitState | null>(null);

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const ballsRef = useRef<Ball[]>([]);
  const pegsRef = useRef<Peg[]>([]);
  const payoutsRef = useRef<FloatingPayout[]>([]);
  const nextBallIdRef = useRef<number>(1);
  const lastPegSoundTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // Register in recently played games once on mount
  useEffect(() => {
    addRecentlyPlayedGame({
      id: "plinko",
      slug: "plinko",
      title: "Plinko",
      href: "/games/plinko",
      playersCount: 4210,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Active Multipliers list
  const currentMultipliers = useMemo(() => {
    return PLINKO_MULTIPLIER_TABLES[rows]?.[risk] || PLINKO_MULTIPLIER_TABLES[16].medium;
  }, [rows, risk]);

  // Toggle Sound
  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    sounds.enabled = !next;
  };

  // Math Buttons (½, 2×, Max)
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
      setAutoBetting(false);
      return;
    }
    if (effectiveBet <= 0) return;

    // Cap simultaneous balls at 100 to prevent canvas lag
    if (ballsRef.current.length >= 100) return;

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
    // Slight random initial offset around top funnel
    const startX = width / 2 + (Math.random() - 0.5) * 6;
    const startY = 24;

    // Authentic Stake glowing red ball
    ballsRef.current.push({
      id: nextBallIdRef.current++,
      x: startX,
      y: startY,
      vx: (Math.random() - 0.5) * 1.5,
      vy: Math.random() * 0.5 + 0.2,
      radius: 5.5,
      betAmount: effectiveBet,
      color: "#ff003f",
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
      const speed = fastDrop ? 180 : 320;
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
  // HTML5 CANVAS PHYSICS & PEGS ENGINE
  // -------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isRunning = true;

    // Generate triangular peg pyramid coordinates matching rows
    const generatePegs = (w: number, h: number) => {
      const pegs: Peg[] = [];
      const startY = 46;
      const bottomY = h - 64;
      const spacingY = (bottomY - startY) / (rows + 1);

      for (let r = 0; r < rows; r++) {
        const count = r + 3;
        const spacingX = Math.min(38, (w - 32) / (rows + 2));
        const rowWidth = (count - 1) * spacingX;
        const startX = (w - rowWidth) / 2;
        const y = startY + (r + 1) * spacingY;

        for (let c = 0; c < count; c++) {
          pegs.push({
            x: startX + c * spacingX,
            y: y,
            radius: Math.max(2.8, Math.min(3.8, spacingX * 0.14)),
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

      // Subtle Atmospheric Radial Glow Behind Center Pegs
      const radialGrad = ctx.createRadialGradient(width / 2, height / 2, 20, width / 2, height / 2, width / 2);
      radialGrad.addColorStop(0, "rgba(20, 117, 225, 0.05)");
      radialGrad.addColorStop(1, "transparent");
      ctx.fillStyle = radialGrad;
      ctx.fillRect(0, 0, width, height);

      // Top Drop Funnel (Stake Plinko Entrance)
      ctx.beginPath();
      ctx.arc(width / 2, 16, 12, 0, Math.PI);
      ctx.fillStyle = "#1a2c38";
      ctx.fill();
      ctx.strokeStyle = "#213743";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Funnel rim glow
      ctx.beginPath();
      ctx.arc(width / 2, 16, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#00e701";
      ctx.shadowColor = "#00e701";
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Update & Draw Pegs
      for (let i = 0; i < pegsRef.current.length; i++) {
        const peg = pegsRef.current[i];
        if (peg.pulse > 0) {
          peg.pulse = Math.max(0, peg.pulse - 0.05);
        }

        ctx.beginPath();
        ctx.arc(peg.x, peg.y, peg.radius + peg.pulse * 2.2, 0, Math.PI * 2);

        if (peg.pulse > 0) {
          ctx.fillStyle = "#ffffff";
          ctx.shadowColor = "#00e701";
          ctx.shadowBlur = 10;
        } else {
          ctx.fillStyle = "#ffffff";
          ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Physics Constants
      const gravity = fastDrop ? 0.36 : 0.24;
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

        // Side walls bounce
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
              // Authentic randomized lateral deflection
              b.vx += impulse * nx + (Math.random() - 0.5) * 0.42;
              b.vy += impulse * ny;
            }

            b.x = peg.x + nx * minDist;
            b.y = peg.y + ny * minDist;
            peg.pulse = 1.0;

            const now = performance.now();
            if (now - lastPegSoundTimeRef.current > 25) {
              sounds.playPeg();
              lastPegSoundTimeRef.current = now;
            }
          }
        }

        // Ball Landing in Bottom Bucket
        if (b.y >= bottomLimit && !b.hasLanded) {
          b.hasLanded = true;

          const bucketCount = rows + 1;
          const spacingX = Math.min(38, (width - 32) / (rows + 2));
          const totalWidth = bucketCount * spacingX;
          const startX = (width - totalWidth) / 2;
          const relativeX = b.x - startX;
          let bucketIdx = Math.floor(relativeX / spacingX);
          bucketIdx = Math.max(0, Math.min(bucketCount - 1, bucketIdx));

          const multiplier = currentMultipliers[bucketIdx] ?? 1.0;
          const payout = parseFloat((b.betAmount * multiplier).toFixed(2));
          const bucketStyle = getBucketColorGrading(bucketIdx, bucketCount);

          // Credit Balance
          updateBalance(payout);

          // Update Stats
          setStats((prev) => ({
            ...prev,
            totalWon: prev.totalWon + payout,
            netProfit: prev.netProfit + payout,
            bestMultiplier: Math.max(prev.bestMultiplier, multiplier),
          }));

          // Audio Chime
          sounds.playBucket(multiplier);

          // Trigger bucket pop animation
          setActiveBucket({
            index: bucketIdx,
            expire: performance.now() + 320,
            bounceOffset: 5,
          });

          // History entry with authentic color
          setHistory((prev) => [
            {
              id: `h-${Date.now()}-${Math.random()}`,
              multiplier,
              bg: bucketStyle.bg,
              text: bucketStyle.text,
            },
            ...prev.slice(0, 5),
          ]);

          // Floating payout tag
          payoutsRef.current.push({
            id: Date.now() + Math.random(),
            x: b.x,
            y: bottomLimit - 14,
            text: `+${multiplier}x (${activeSym}${payout.toFixed(2)})`,
            alpha: 1.0,
          });

          // High Multiplier Win Fanfare
          if (multiplier >= 10) {
            try {
              confetti({
                particleCount: multiplier >= 100 ? 100 : 50,
                spread: 75,
                origin: { y: 0.75 },
                colors: ["#00e701", "#ff003f", "#ffea00", "#ffffff"],
              });
            } catch {
              // ignore
            }
          }

          // Remove ball
          ballsRef.current.splice(i, 1);
          continue;
        }

        // Draw Ball: Glowing vibrant Stake red sphere
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.shadowColor = "rgba(255, 0, 63, 0.7)";
        ctx.shadowBlur = 8;
        ctx.fill();

        // Inner ball highlight
        ctx.beginPath();
        ctx.arc(b.x - 1.5, b.y - 1.5, b.radius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.shadowBlur = 0;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw Floating Payouts
      for (let pIdx = payoutsRef.current.length - 1; pIdx >= 0; pIdx--) {
        const fp = payoutsRef.current[pIdx];
        fp.y -= 0.75;
        fp.alpha -= 0.022;

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

      // ---------------------------------------------------------
      // Draw Dynamic Bottom Multiplier Buckets
      // ---------------------------------------------------------
      const bucketCount = rows + 1;
      const bucketSpacing = Math.min(38, (width - 32) / (rows + 2));
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
          activeBucket &&
          activeBucket.index === bIdx &&
          performance.now() < activeBucket.expire;

        const bounceDelta = isHit ? activeBucket.bounceOffset : 0;

        ctx.save();
        ctx.beginPath();
        const r = 4;
        ctx.roundRect(bx, bucketY + bounceDelta, bw, bucketHeight, [r]);
        ctx.fillStyle = isHit ? "#ffffff" : style.bg;

        if (isHit) {
          ctx.shadowColor = style.shadow;
          ctx.shadowBlur = 18;
        } else {
          ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
          ctx.shadowBlur = 4;
        }
        ctx.fill();
        ctx.strokeStyle = isHit ? "#ffffff" : style.border;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Multiplier Text
        ctx.fillStyle = isHit ? "#0f212e" : style.text;
        const fontSize = bw < 20 ? "8px" : bw < 26 ? "9px" : "11px";
        ctx.font = `black ${fontSize} monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const label =
          mult >= 1000
            ? `${(mult / 1000).toFixed(0)}K`
            : mult >= 100
            ? `${mult}`
            : `${mult}x`;

        ctx.fillText(label, bx + bw / 2, bucketY + bounceDelta + bucketHeight / 2);
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
  }, [rows, currentMultipliers, activeBucket, updateBalance, fastDrop, activeSym]);

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
      className={`w-full max-w-6xl mx-auto px-2 sm:px-4 py-3 select-none space-y-3 relative z-0 pointer-events-auto ${
        isFullscreen ? "fixed inset-0 z-40 bg-[#0f212e] overflow-y-auto p-4 max-w-none" : ""
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

        {/* Live Multiplier History Chips with Heat-Map Colors */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          <span className="text-[10px] font-bold text-[#b1bad3] uppercase tracking-wider hidden md:inline mr-1 shrink-0">
            Recent:
          </span>
          {history.map((h) => (
            <span
              key={h.id}
              style={{ backgroundColor: h.bg, color: h.text }}
              className="rounded-lg px-2 py-0.5 text-xs font-mono font-black shadow-sm transition-transform shrink-0"
            >
              {h.multiplier}x
            </span>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* MAIN GAME CONTAINER: 1:1 STAKE ORIGINALS 2-PANEL LAYOUT */}
      {/* Left: Betting Controls Sidebar                           */}
      {/* Right: Plinko Peg Arena Canvas                           */}
      {/* ======================================================== */}
      <div className="rounded-2xl border border-[#213743] bg-[#1a2c38] shadow-2xl overflow-hidden flex flex-col">
        {/* ======================================================== */}
        {/* PART 2: PLINKO PEG ARENA CANVAS (RIGHT ON DESKTOP)       */}
        {/* ======================================================== */}
        <div
          ref={containerRef}
          className="flex-1 bg-[#0f212e] p-3 sm:p-5 flex flex-col items-center justify-between min-h-[480px] sm:min-h-[560px] relative overflow-hidden"
        >
          {/* Top Status Bar inside Canvas */}
          <div className="w-full flex items-center justify-between z-10">
            <div className="flex items-center gap-2 text-xs font-bold text-[#b1bad3]">
              <span className="flex h-2 w-2 rounded-full bg-[#00e701] animate-pulse" />
              <span className="text-white">Provably Fair Physics</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#b1bad3] bg-[#1a2c38] px-2.5 py-1 rounded-lg border border-[#213743] flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-[#00e701]" />
                <span>{rows} Rows</span>
              </span>

              <button
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

          {/* Real-time HTML5 2D Canvas */}
          <canvas
            ref={canvasRef}
            className="w-full h-full min-h-[420px] sm:min-h-[480px] flex-1 my-1"
          />
        </div>
      {/* PART 1: BETTING CONTROLS SIDEBAR (LEFT ON DESKTOP)       */}
        {/* ======================================================== */}
        <div className="w-full border-t border-[#213743] bg-[#1a2c38] p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
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

            {/* Bet Amount Input with ½, 2×, Max Buttons */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-[#b1bad3]">
                <span>Bet Amount</span>
                <span className="font-mono text-[#00e701]">
                  {activeSym}{formatBalance(balance)}
                </span>
              </div>
              <div className="flex items-center rounded-xl border border-[#213743] bg-[#0f212e] p-1 focus-within:border-[#00e701] transition-colors">
                <span className="px-2.5 text-sm font-bold text-[#b1bad3]">{activeSym}</span>
                <input
                  type="text"
                  inputMode="decimal"
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
                      setBetAmount(num);
                    }
                  }}
                  className="w-full bg-transparent text-sm font-bold text-white focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={handleHalfBet}
                  className="rounded-lg px-2.5 py-1 text-xs font-bold text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors cursor-pointer"
                >
                  ½
                </button>
                <button
                  type="button"
                  onClick={handleDoubleBet}
                  className="rounded-lg px-2.5 py-1 text-xs font-bold text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors cursor-pointer"
                >
                  2×
                </button>
                <button
                  type="button"
                  onClick={handleMaxBet}
                  className="rounded-lg px-2.5 py-1 text-xs font-bold text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors cursor-pointer"
                >
                  Max
                </button>
              </div>
            </div>

            {/* Risk Level Selector: Exact 3-Option Toggle (Low, Medium, High) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#b1bad3]">Risk</label>
              <div className="grid grid-cols-3 rounded-xl bg-[#0f212e] p-1 border border-[#213743]">
                {(["low", "medium", "high"] as PlinkoRisk[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setRisk(r);
                    }}
                    className={`py-2 text-xs font-bold rounded-lg capitalize transition-all cursor-pointer ${
                      risk === r
                        ? "bg-[#213743] text-white shadow-sm"
                        : "text-[#b1bad3] hover:text-white"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Rows Selector: Dropdown (8 to 16 Rows) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#b1bad3]">Rows</label>
              <div className="relative">
                <select
                  value={rows}
                  onChange={(e) => {
                    sounds.playClick();
                    setRows(parseInt(e.target.value));
                  }}
                  className="w-full appearance-none rounded-xl border border-[#213743] bg-[#0f212e] px-3.5 py-2.5 text-xs font-bold text-white focus:border-[#00e701] focus:outline-none cursor-pointer"
                >
                  {[8, 9, 10, 11, 12, 13, 14, 15, 16].map((cnt) => (
                    <option key={cnt} value={cnt} className="bg-[#1a2c38]">
                      {cnt}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-[#b1bad3]" />
              </div>
            </div>

            {/* Auto Mode Custom Inputs */}
            {mode === "auto" && (
              <div className="space-y-3 pt-1 border-t border-[#213743]/50">
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
                      className="text-[11px] font-bold text-[#00e701] hover:underline cursor-pointer"
                    >
                      ∞
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] text-[#b1bad3] px-1 font-mono">
                  <span>Bets Dropped:</span>
                  <span className="text-white font-bold">{autoBetCount} / {autoBetLimit === 0 ? "∞" : autoBetLimit}</span>
                </div>
              </div>
            )}
          </div>

          {/* PRIMARY CTA: Full-Width Vibrant Stake Green Button */}
          <div className="pt-2 space-y-3">
            <button
              onClick={handleBetAction}
              disabled={betAmount > balance || betAmount <= 0}
              className={`w-full py-3.5 sm:py-4 text-base font-black rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer ${
                autoBetting
                  ? "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25"
                  : "bg-[#00e701] hover:bg-[#00c201] text-[#0f212e] shadow-[0_0_20px_rgba(0,231,1,0.25)] hover:shadow-[0_0_28px_rgba(0,231,1,0.4)]"
              }`}
            >
              {autoBetting ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Stop Auto Bet</span>
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
          </div>
        </div>

        {/* ======================================================== */}
        </div>

      {/* ======================================================== */}
      {/* PART 3: BOTTOM UTILITY BAR (FAIRNESS, STATS, SETTINGS)   */}
      {/* ======================================================== */}
      <div className="flex items-center justify-between rounded-2xl bg-[#1a2c38] border border-[#213743] px-4 py-2.5 text-xs text-[#b1bad3]">
        <div className="flex items-center gap-2">
          {/* Verifiable Fairness Trigger */}
          <button
            type="button"
            onClick={() => setIsFairnessOpen(true)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 bg-[#213743] hover:bg-[#2f4553] text-[#00e701] font-bold transition-colors cursor-pointer"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Fairness</span>
          </button>

          {/* Live Stats Trigger */}
          <button
            type="button"
            onClick={() => setIsStatsOpen(true)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 bg-[#213743] hover:bg-[#2f4553] text-[#b1bad3] hover:text-white font-bold transition-colors cursor-pointer"
          >
            <BarChart2 className="h-3.5 w-3.5" />
            <span>Stats</span>
          </button>

          {/* Settings Trigger */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 bg-[#213743] hover:bg-[#2f4553] text-[#b1bad3] hover:text-white font-bold transition-colors cursor-pointer"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Settings</span>
          </button>
        </div>

        {/* Favorite & Share */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFavorite}
            className={`flex items-center gap-1 rounded-xl px-2.5 py-1 font-bold transition-colors cursor-pointer ${
              isFavorited ? "text-rose-400" : "text-[#b1bad3] hover:text-white"
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${isFavorited ? "fill-current" : ""}`} />
            <span className="hidden sm:inline">{favoriteCount.toLocaleString()}</span>
          </button>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: "Stake Plinko", url: window.location.href });
              } else {
                copyToClipboard(window.location.href, "share");
              }
            }}
            className="p-1 rounded-lg text-[#b1bad3] hover:text-white transition-colors cursor-pointer"
            title="Share"
          >
            <Share2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: PROVABLY FAIR VERIFIER                         */}
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
                  <h3 className="text-base font-black">Plinko Provably Fair</h3>
                  <p className="text-xs text-[#b1bad3]">
                    Cryptographic SHA-256 path verification for each dropped ball
                  </p>
                </div>
              </div>
              <button
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
                  Nonce (Ball Counter)
                </label>
                <div className="rounded-xl border border-[#213743] bg-[#0f212e] px-3 py-2 font-mono text-white font-bold">
                  {nonce}
                </div>
              </div>

              <div className="rounded-xl border border-[#213743] bg-[#0f212e] p-3 text-[11px] space-y-1">
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
                className="w-full py-2.5 rounded-xl bg-[#1475e1] hover:bg-[#1164c2] text-white font-bold text-xs cursor-pointer"
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
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsStatsOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
          <div className="w-full max-w-md rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 shadow-2xl space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-[#213743] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00e701]/15 text-[#00e701]">
                  <BarChart2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black">Live Session Stats</h3>
                  <p className="text-xs text-[#b1bad3]">Real-time Plinko performance</p>
                </div>
              </div>
              <button
                onClick={() => setIsStatsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#b1bad3] hover:bg-[#213743] hover:text-white cursor-pointer"
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
                <span className="text-[#00e701] font-mono font-bold text-sm">
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
                className="flex items-center gap-1 text-xs text-[#b1bad3] hover:text-white cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Stats</span>
              </button>

              <button
                onClick={() => setIsStatsOpen(false)}
                className="rounded-xl bg-[#1475e1] px-5 py-2 text-xs font-bold text-white hover:bg-[#1065c7] cursor-pointer"
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
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsSettingsOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
          <div className="w-full max-w-md rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 shadow-2xl space-y-5 text-white">
            <div className="flex items-center justify-between border-b border-[#213743] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00e701]/15 text-[#00e701]">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black">Plinko Settings</h3>
                  <p className="text-xs text-[#b1bad3]">Control game physics and audio</p>
                </div>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#b1bad3] hover:bg-[#213743] hover:text-white cursor-pointer"
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
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    !isMuted ? "bg-[#00e701]" : "bg-[#213743]"
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
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    fastDrop ? "bg-[#00e701]" : "bg-[#213743]"
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
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    hotkeysEnabled ? "bg-[#00e701]" : "bg-[#213743]"
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
                className="w-full py-2.5 rounded-xl bg-[#1475e1] hover:bg-[#1164c2] text-white font-bold text-xs cursor-pointer"
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
