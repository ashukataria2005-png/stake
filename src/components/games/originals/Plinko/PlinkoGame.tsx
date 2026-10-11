"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  ShieldCheck,
  RotateCcw,
  Settings,
  BarChart2,
  ChevronDown,
  Check,
  Copy,
  X,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

// ============================================================================
// CONFIGURABLE MULTIPLIER MATRIX
// ============================================================================
export type PlinkoDifficulty = "Low" | "Medium" | "High" | "Expert";

export const PLINKO_PAYOUT_CONFIG: Record<
  PlinkoDifficulty,
  Record<number, number[]>
> = {
  Low: {
    8: [5.6, 2.1, 1.1, 1.0, 0.5, 1.0, 1.1, 2.1, 5.6],
    9: [5.6, 2.0, 1.6, 1.0, 0.7, 0.7, 1.0, 1.6, 2.0, 5.6],
    10: [8.9, 3.0, 1.4, 1.1, 1.0, 0.5, 1.0, 1.1, 1.4, 3.0, 8.9],
    11: [8.4, 3.0, 1.9, 1.3, 1.0, 0.7, 0.7, 1.0, 1.3, 1.9, 3.0, 8.4],
    12: [10, 3.0, 1.6, 1.4, 1.1, 1.0, 0.5, 1.0, 1.1, 1.4, 1.6, 3.0, 10],
    13: [8.1, 4.0, 2.1, 1.3, 1.1, 1.0, 0.7, 0.7, 1.0, 1.1, 1.3, 2.1, 4.0, 8.1],
    14: [7.1, 4.0, 1.9, 1.4, 1.3, 1.1, 1.0, 0.5, 1.0, 1.1, 1.3, 1.4, 1.9, 4.0, 7.1],
    15: [15, 8.0, 3.0, 2.0, 1.5, 1.1, 1.0, 0.5, 0.5, 1.0, 1.1, 1.5, 2.0, 3.0, 8.0, 15],
    16: [16, 9.0, 2.0, 1.4, 1.4, 1.2, 1.1, 1.0, 0.5, 1.0, 1.1, 1.2, 1.4, 1.4, 2.0, 9.0, 16],
  },
  Medium: {
    8: [13, 3.0, 1.3, 0.7, 0.4, 0.7, 1.3, 3.0, 13],
    9: [18, 4.0, 1.7, 0.9, 0.5, 0.5, 0.9, 1.7, 4.0, 18],
    10: [22, 5.0, 2.0, 1.4, 0.6, 0.4, 0.6, 1.4, 2.0, 5.0, 22],
    11: [24, 6.0, 3.0, 1.8, 0.7, 0.5, 0.5, 0.7, 1.8, 3.0, 6.0, 24],
    12: [33, 11, 4.0, 2.0, 1.1, 0.6, 0.3, 0.6, 1.1, 2.0, 4.0, 11, 33],
    13: [43, 13, 6.0, 3.0, 1.3, 0.7, 0.4, 0.4, 0.7, 1.3, 3.0, 6.0, 13, 43],
    14: [58, 15, 7.0, 4.0, 1.9, 1.3, 0.5, 0.2, 0.5, 1.3, 1.9, 4.0, 7.0, 15, 58],
    15: [88, 25, 9.0, 4.5, 2.5, 1.4, 0.7, 0.3, 0.3, 0.7, 1.4, 2.5, 4.5, 9.0, 25, 88],
    16: [110, 41, 10, 5.0, 3.0, 1.5, 1.0, 0.5, 0.3, 0.5, 1.0, 1.5, 3.0, 5.0, 10, 41, 110],
  },
  High: {
    8: [29, 4.0, 1.5, 0.3, 0.2, 0.3, 1.5, 4.0, 29],
    9: [43, 7.0, 2.0, 0.6, 0.2, 0.2, 0.6, 2.0, 7.0, 43],
    10: [76, 10, 3.0, 0.9, 0.3, 0.2, 0.3, 0.9, 3.0, 10, 76],
    11: [120, 14, 4.2, 1.4, 0.4, 0.2, 0.2, 0.4, 1.4, 4.2, 14, 120],
    12: [170, 24, 8.1, 2.0, 0.7, 0.2, 0.2, 0.2, 0.7, 2.0, 8.1, 24, 170],
    13: [260, 37, 11, 4.0, 1.0, 0.2, 0.2, 0.2, 0.2, 1.0, 4.0, 11, 37, 260],
    14: [420, 56, 18, 5.0, 1.9, 0.3, 0.2, 0.2, 0.2, 0.3, 1.9, 5.0, 18, 56, 420],
    15: [620, 83, 24, 7.0, 2.8, 0.7, 0.2, 0.2, 0.2, 0.2, 0.7, 2.8, 7.0, 24, 83, 620],
    16: [1000, 130, 26, 9.0, 4.0, 2.0, 0.2, 0.2, 0.2, 0.2, 0.2, 2.0, 4.0, 9.0, 26, 130, 1000],
  },
  Expert: {
    8: [50, 4.6, 1.1, 0.1, 0.1, 0.1, 1.1, 4.6, 50],
    9: [80, 8.0, 1.8, 0.4, 0.1, 0.1, 0.4, 1.8, 8.0, 80],
    10: [150, 15, 3.2, 0.6, 0.2, 0.1, 0.2, 0.6, 3.2, 15, 150],
    11: [250, 25, 5.0, 1.0, 0.3, 0.1, 0.1, 0.3, 1.0, 5.0, 25, 250],
    12: [400, 40, 9.0, 1.8, 0.5, 0.1, 0.1, 0.1, 0.5, 1.8, 9.0, 40, 400],
    13: [600, 65, 16, 3.0, 0.8, 0.1, 0.1, 0.1, 0.1, 0.8, 3.0, 16, 65, 600],
    14: [1000, 100, 28, 6.0, 1.2, 0.2, 0.1, 0.1, 0.1, 0.2, 1.2, 6.0, 28, 100, 1000],
    15: [1500, 160, 45, 10, 2.2, 0.5, 0.1, 0.1, 0.1, 0.1, 0.5, 2.2, 10, 45, 160, 1500],
    16: [2500, 280, 60, 18, 5.0, 1.2, 0.2, 0.1, 0.1, 0.1, 0.1, 0.2, 1.2, 5.0, 18, 60, 280, 2500],
  },
};

// Backward-compatibility alias
export type PlinkoRisk = "low" | "medium" | "high";
export const PLINKO_MULTIPLIER_TABLES = PLINKO_PAYOUT_CONFIG;

// ============================================================================
// DYNAMIC MULTIPLIER BUCKET THEMES PER DIFFICULTY
// ============================================================================
export function getBucketColorGrading(
  index: number,
  totalBuckets: number,
  difficulty: PlinkoDifficulty
) {
  const center = (totalBuckets - 1) / 2;
  const dist = Math.abs(index - center) / (center || 1); // 0 at center, 1 at edge

  if (difficulty === "Low") {
    // Soft Cyan / Sky-blue theme (center bucket 0.5, outer edges 5.6 to 10.0)
    if (dist < 0.22) {
      return { bg: "#38bdf8", text: "#032030", border: "#7dd3fc", shadow: "#38bdf8" };
    } else if (dist < 0.52) {
      return { bg: "#0284c7", text: "#ffffff", border: "#38bdf8", shadow: "#0284c7" };
    } else if (dist < 0.82) {
      return { bg: "#0369a1", text: "#ffffff", border: "#0284c7", shadow: "#0369a1" };
    } else {
      return { bg: "#0c4a6e", text: "#ffffff", border: "#0369a1", shadow: "#075985" };
    }
  } else if (difficulty === "Medium") {
    // Electric Lime / Soft Green theme (center bucket 0.4, outer edges 13.0)
    if (dist < 0.22) {
      return { bg: "#84cc16", text: "#172505", border: "#a3e635", shadow: "#84cc16" };
    } else if (dist < 0.52) {
      return { bg: "#22c55e", text: "#052e16", border: "#4ade80", shadow: "#22c55e" };
    } else if (dist < 0.82) {
      return { bg: "#16a34a", text: "#ffffff", border: "#22c55e", shadow: "#16a34a" };
    } else {
      return { bg: "#15803d", text: "#ffffff", border: "#16a34a", shadow: "#15803d" };
    }
  } else if (difficulty === "High") {
    // Soft Purple / Violet theme (center bucket 0.2, outer edges 29.0)
    if (dist < 0.22) {
      return { bg: "#c084fc", text: "#2e1065", border: "#d8b4fe", shadow: "#c084fc" };
    } else if (dist < 0.52) {
      return { bg: "#a855f7", text: "#ffffff", border: "#c084fc", shadow: "#a855f7" };
    } else if (dist < 0.82) {
      return { bg: "#9333ea", text: "#ffffff", border: "#a855f7", shadow: "#9333ea" };
    } else {
      return { bg: "#7e22ce", text: "#ffffff", border: "#9333ea", shadow: "#7e22ce" };
    }
  } else {
    // Expert: Vibrant Warm Orange / Amber theme (center bucket 0.1, outer edges 50.0)
    if (dist < 0.22) {
      return { bg: "#facc15", text: "#422006", border: "#fde047", shadow: "#facc15" };
    } else if (dist < 0.52) {
      return { bg: "#fb923c", text: "#ffffff", border: "#fdba74", shadow: "#fb923c" };
    } else if (dist < 0.82) {
      return { bg: "#f97316", text: "#ffffff", border: "#fb923c", shadow: "#f97316" };
    } else {
      return { bg: "#ea580c", text: "#ffffff", border: "#f97316", shadow: "#ea580c" };
    }
  }
}

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

export default function PlinkoGame() {
  const { balance, updateBalance, currencySymbol, addRecentlyPlayedGame } = useGame();
  const activeSym = currencySymbol || "$";

  // Settings
  const [betAmount, setBetAmount] = useState<number>(10);
  const [betInput, setBetInput] = useState<string>("10.00");
  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [difficulty, setDifficulty] = useState<PlinkoDifficulty>("Medium");
  const [rows, setRows] = useState<number>(16);

  // Auto Betting State
  const [autoBetting, setAutoBetting] = useState<boolean>(false);
  const [autoBetCount, setAutoBetCount] = useState<number>(0);
  const [autoBetLimit, setAutoBetLimit] = useState<number>(0); // 0 = infinite

  // Dropdown States
  const [isDifficultyDropdownOpen, setIsDifficultyDropdownOpen] = useState<boolean>(false);
  const [isRowsDropdownOpen, setIsRowsDropdownOpen] = useState<boolean>(false);

  // Modals
  const [isFairnessOpen, setIsFairnessOpen] = useState<boolean>(false);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Sound & Screen Settings
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [fastDrop, setFastDrop] = useState<boolean>(false);
  const [hotkeysEnabled, setHotkeysEnabled] = useState<boolean>(true);

  // Stats
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
  const [clientSeed] = useState<string>("stake_plinko_8192a");
  const [nonce, setNonce] = useState<number>(412);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Active highlighted bucket
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

  // Register in Recently Played
  useEffect(() => {
    addRecentlyPlayedGame({
      id: "plinko",
      slug: "plinko",
      title: "Plinko",
      href: "/games/plinko",
      playersCount: 4210,
    });
  }, [addRecentlyPlayedGame]);

  // Multipliers for selected rows & difficulty
  const currentMultipliers = useMemo(() => {
    return (
      PLINKO_PAYOUT_CONFIG[difficulty]?.[rows] ||
      PLINKO_PAYOUT_CONFIG.Medium[16]
    );
  }, [difficulty, rows]);

  // Click outside listener for dropdowns
  const difficultyDropdownRef = useRef<HTMLDivElement>(null);
  const rowsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        difficultyDropdownRef.current &&
        !difficultyDropdownRef.current.contains(event.target as Node)
      ) {
        setIsDifficultyDropdownOpen(false);
      }
      if (
        rowsDropdownRef.current &&
        !rowsDropdownRef.current.contains(event.target as Node)
      ) {
        setIsRowsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Quick Bet Modifiers
  const handleHalfBet = () => {
    sounds.playClick();
    const next = Math.max(0.01, parseFloat((betAmount / 2).toFixed(2)));
    setBetAmount(next);
    setBetInput(next.toFixed(2));
  };

  const handleDoubleBet = () => {
    sounds.playClick();
    const next = parseFloat((betAmount * 2).toFixed(2));
    const capped = Math.min(next, Math.max(1, parseFloat(balance.toFixed(2))));
    setBetAmount(capped);
    setBetInput(capped.toFixed(2));
  };

  // Drop Ball Action (Drops smoothly right at the apex)
  const dropBall = useCallback(() => {
    const effectiveBet =
      betInput === "" || isNaN(parseFloat(betInput)) || parseFloat(betInput) <= 0
        ? 1
        : parseFloat(betInput);

    if (betInput === "" || isNaN(parseFloat(betInput))) {
      setBetInput(effectiveBet.toFixed(2));
      setBetAmount(effectiveBet);
    }

    if (effectiveBet > balance) {
      setAutoBetting(false);
      return;
    }
    if (effectiveBet <= 0) return;

    // Cap simultaneous balls at 80 to prevent lag
    if (ballsRef.current.length >= 80) return;

    // Deduct balance
    updateBalance(-effectiveBet);
    setNonce((n) => n + 1);

    setStats((prev) => ({
      ...prev,
      totalBets: prev.totalBets + 1,
      totalWagered: prev.totalWagered + effectiveBet,
      netProfit: prev.netProfit - effectiveBet,
    }));

    const canvas = canvasRef.current;
    const width = canvas ? canvas.getBoundingClientRect().width : 480;
    // Ball drops tightly from apex (y=6, row 0 pegs are at y=16)
    const startX = width / 2 + (Math.random() - 0.5) * 4;
    const startY = 6;

    ballsRef.current.push({
      id: nextBallIdRef.current++,
      x: startX,
      y: startY,
      vx: (Math.random() - 0.5) * 1.3,
      vy: Math.random() * 0.4 + 0.3,
      radius: 5.5,
      betAmount: effectiveBet,
      color: "#ff003f",
      hasLanded: false,
    });
  }, [balance, betInput, updateBalance]);

  // Reset/Clear Arena Balls
  const handleResetArena = () => {
    sounds.playClick();
    ballsRef.current = [];
    payoutsRef.current = [];
  };

  // Primary Bet CTA Button Action
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

  // Auto-Bet loop
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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        hotkeysEnabled &&
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

  // ==========================================================================
  // CANVAS PHYSICS & PEGS ENGINE (TIGHT APEX CLEARANCE, NO TOP DEAD SPACE)
  // ==========================================================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isRunning = true;

    const generatePegs = (w: number, h: number) => {
      const pegs: Peg[] = [];
      // Tight top clearance: start directly at 16px from top edge
      const startY = 16;
      const bottomY = h - 44;
      const spacingY = (bottomY - startY) / rows;

      for (let r = 0; r < rows; r++) {
        const count = r + 3;
        const spacingX = Math.min(38, (w - 28) / (rows + 2));
        const rowWidth = (count - 1) * spacingX;
        const startX = (w - rowWidth) / 2;
        const y = startY + r * spacingY;

        for (let c = 0; c < count; c++) {
          pegs.push({
            x: startX + c * spacingX,
            y: y,
            radius: Math.max(2.6, Math.min(3.6, spacingX * 0.14)),
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

      // Radial ambient glow
      const radialGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        20,
        width / 2,
        height / 2,
        width / 2
      );
      radialGrad.addColorStop(0, "rgba(20, 117, 225, 0.04)");
      radialGrad.addColorStop(1, "transparent");
      ctx.fillStyle = radialGrad;
      ctx.fillRect(0, 0, width, height);

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
          ctx.shadowColor = "#ffffff";
          ctx.shadowBlur = 8;
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
      const bottomLimit = height - 40;

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
          const spacingX = Math.min(38, (width - 28) / (rows + 2));
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

          // Audio Chime
          sounds.playBucket(multiplier);

          // Trigger bucket pop animation
          setActiveBucket({
            index: bucketIdx,
            expire: performance.now() + 320,
            bounceOffset: 4,
          });

          // Floating payout tag
          payoutsRef.current.push({
            id: Date.now() + Math.random(),
            x: b.x,
            y: bottomLimit - 14,
            text: `+${multiplier}x`,
            alpha: 1.0,
          });

          // Big win confetti
          if (multiplier >= 10) {
            try {
              confetti({
                particleCount: multiplier >= 50 ? 90 : 45,
                spread: 70,
                origin: { y: 0.7 },
                colors: ["#1475e1", "#ff003f", "#facc15", "#ffffff"],
              });
            } catch {}
          }

          // Remove ball
          ballsRef.current.splice(i, 1);
          continue;
        }

        // Draw Glowing Red Stake Ball
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.shadowColor = "rgba(255, 0, 63, 0.7)";
        ctx.shadowBlur = 8;
        ctx.fill();

        // Inner ball shine
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
        ctx.fillStyle = `rgba(20, 117, 225, ${fp.alpha})`;
        ctx.font = "bold 11px monospace";
        ctx.textAlign = "center";
        ctx.shadowColor = "#1475e1";
        ctx.shadowBlur = 6;
        ctx.fillText(fp.text, fp.x, fp.y);
        ctx.restore();
      }

      // Draw Multiplier Buckets with Theme Colors
      const bucketCount = rows + 1;
      const bucketSpacing = Math.min(38, (width - 28) / (rows + 2));
      const totalBucketWidth = bucketCount * bucketSpacing;
      const bucketStartX = (width - totalBucketWidth) / 2;
      const bucketY = height - 34;
      const bucketHeight = 26;

      for (let bIdx = 0; bIdx < bucketCount; bIdx++) {
        const bx = bucketStartX + bIdx * bucketSpacing + 1;
        const bw = bucketSpacing - 2;
        const mult = currentMultipliers[bIdx] ?? 1.0;
        const style = getBucketColorGrading(bIdx, bucketCount, difficulty);

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
          ctx.shadowBlur = 16;
        } else {
          ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
          ctx.shadowBlur = 3;
        }
        ctx.fill();
        ctx.strokeStyle = isHit ? "#ffffff" : style.border;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Multiplier text
        ctx.fillStyle = isHit ? "#0f212e" : style.text;
        const fontSize = bw < 20 ? "8px" : bw < 26 ? "9px" : "10px";
        ctx.font = `bold ${fontSize} monospace`;
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
  }, [rows, currentMultipliers, activeBucket, updateBalance, fastDrop, difficulty]);

  // Copy helper
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1800);
  };

  return (
    <div className="w-full max-w-lg mx-auto px-2 sm:px-3 py-2 select-none flex flex-col space-y-2.5">
      {/* ========================================================= */}
      {/* 1. GAME ARENA CONTAINER (Dedicated dark card container)   */}
      {/* ========================================================= */}
      <div
        ref={containerRef}
        className="w-full aspect-[4/3.2] sm:aspect-[4/3] rounded-xl bg-[#0f212e] border border-[#213743] shadow-2xl relative overflow-hidden flex flex-col items-center justify-center"
      >
        {/* Top-Right Circular Replay / Refresh Icon Overlay */}
        <div className="absolute top-2.5 right-2.5 z-20">
          <button
            onClick={handleResetArena}
            title="Reset active balls"
            className="w-7 h-7 rounded-full bg-[#1a2c38]/90 hover:bg-[#213743] border border-[#213743] flex items-center justify-center text-[#8596a5] hover:text-white transition-all cursor-pointer shadow-md active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Real-time HTML5 2D Physics Canvas */}
        <canvas ref={canvasRef} className="w-full h-full flex-1" />
      </div>

      {/* ========================================================= */}
      {/* 2. BETTING CONTROLS CONTAINER (Clean separated card)      */}
      {/* ========================================================= */}
      <div className="w-full rounded-xl bg-[#0f212e] sm:bg-[#1a2c38] border border-[#213743] p-3 sm:p-4 flex flex-col gap-2.5 shadow-xl">
        {/* 1. Primary CTA Bet Button */}
        <button
          onClick={handleBetAction}
          disabled={betAmount > balance || betAmount <= 0}
          className={`w-full py-3.5 rounded-md font-bold text-base text-white tracking-wide transition-all active:scale-[0.98] shadow-lg shadow-[#1475e1]/25 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
            autoBetting
              ? "bg-rose-600 hover:bg-rose-700"
              : "bg-[#1475e1] hover:bg-[#1a7bf2]"
          }`}
        >
          {autoBetting ? "Stop Autobet" : mode === "auto" ? "Start Autobet" : "Bet"}
        </button>

        {/* 2. Bet Amount Section */}
        <div className="flex flex-col gap-1">
          {/* Dynamic Wallet Currency & Balance (No Hardcoded XRP) */}
          <div className="flex items-center justify-between text-xs font-semibold px-0.5">
            <span className="text-[#8596a5]">Bet Amount</span>
            <span className="text-[#8596a5] font-mono text-[11px]">
              {activeSym}{balance.toFixed(2)}
            </span>
          </div>

          {/* Compact Input Box with border-[#2f4553] & rounded-md */}
          <div className="flex items-center rounded-md bg-[#0f212e] border border-[#2f4553] px-3 py-1.5 focus-within:border-[#1475e1] transition-colors">
            {/* Active Currency Symbol Prefix (No Flag) */}
            <span className="text-xs font-bold text-[#b1bad3] mr-2 select-none shrink-0">
              {activeSym}
            </span>

            {/* Input Field */}
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
              className="w-full bg-transparent text-sm font-bold text-white focus:outline-none font-mono py-0.5"
            />

            {/* Vertical Divider */}
            <div className="w-[1px] h-5 bg-[#2f4553] mx-1.5 shrink-0" />

            {/* Compact Quick Action Buttons: ½ and 2× */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleHalfBet}
                className="px-2.5 py-1 rounded-md bg-[#213743] hover:bg-[#2f4553] text-[#b1bad3] hover:text-white font-bold text-xs transition-colors cursor-pointer"
              >
                ½
              </button>
              <button
                type="button"
                onClick={handleDoubleBet}
                className="px-2.5 py-1 rounded-md bg-[#213743] hover:bg-[#2f4553] text-[#b1bad3] hover:text-white font-bold text-xs transition-colors cursor-pointer"
              >
                2×
              </button>
            </div>
          </div>
        </div>

        {/* 3. Difficulty Dropdown (Custom Dropdown with compact rounded-md border-[#2f4553]) */}
        <div ref={difficultyDropdownRef} className="flex flex-col gap-1 relative">
          <label className="text-xs font-semibold text-[#8596a5] px-0.5">Difficulty</label>
          <button
            type="button"
            onClick={() => setIsDifficultyDropdownOpen(!isDifficultyDropdownOpen)}
            className="w-full flex items-center justify-between rounded-md bg-[#0f212e] border border-[#2f4553] px-3 py-2 text-xs font-bold text-white hover:border-[#1475e1] transition-colors cursor-pointer"
          >
            <span>{difficulty}</span>
            <ChevronDown
              className={`w-4 h-4 text-[#8596a5] transition-transform duration-200 ${
                isDifficultyDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isDifficultyDropdownOpen && (
            <div className="absolute top-[102%] left-0 right-0 z-30 rounded-md bg-[#1a2c38] border border-[#2f4553] shadow-xl overflow-hidden py-1">
              {(["Low", "Medium", "High", "Expert"] as PlinkoDifficulty[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setDifficulty(d);
                    setIsDifficultyDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-bold transition-colors flex items-center justify-between cursor-pointer ${
                    difficulty === d
                      ? "bg-[#213743] text-white"
                      : "text-[#b1bad3] hover:bg-[#213743]/60 hover:text-white"
                  }`}
                >
                  <span>{d}</span>
                  {difficulty === d && <Check className="w-3.5 h-3.5 text-[#1475e1]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 4. Rows Dropdown (Custom Dropdown with compact rounded-md border-[#2f4553]) */}
        <div ref={rowsDropdownRef} className="flex flex-col gap-1 relative">
          <label className="text-xs font-semibold text-[#8596a5] px-0.5">Rows</label>
          <button
            type="button"
            onClick={() => setIsRowsDropdownOpen(!isRowsDropdownOpen)}
            className="w-full flex items-center justify-between rounded-md bg-[#0f212e] border border-[#2f4553] px-3 py-2 text-xs font-bold text-white hover:border-[#1475e1] transition-colors cursor-pointer"
          >
            <span>{rows}</span>
            <ChevronDown
              className={`w-4 h-4 text-[#8596a5] transition-transform duration-200 ${
                isRowsDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isRowsDropdownOpen && (
            <div className="absolute top-[102%] left-0 right-0 z-30 rounded-md bg-[#1a2c38] border border-[#2f4553] shadow-xl overflow-hidden py-1 max-h-48 overflow-y-auto">
              {[8, 9, 10, 11, 12, 13, 14, 15, 16].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setRows(cnt);
                    setIsRowsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-bold transition-colors flex items-center justify-between cursor-pointer ${
                    rows === cnt
                      ? "bg-[#213743] text-white"
                      : "text-[#b1bad3] hover:bg-[#213743]/60 hover:text-white"
                  }`}
                >
                  <span>{cnt}</span>
                  {rows === cnt && <Check className="w-3.5 h-3.5 text-[#1475e1]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 5. "Number of Bets" Input (Only rendered when Auto Mode is selected) */}
        {mode === "auto" && (
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#8596a5] px-0.5">Number of Bets</label>
            <div className="flex items-center rounded-md bg-[#0f212e] border border-[#2f4553] px-3 py-1.5 focus-within:border-[#1475e1] transition-colors">
              <input
                type="number"
                min="0"
                placeholder="0"
                value={autoBetLimit === 0 ? "" : autoBetLimit}
                onChange={(e) => setAutoBetLimit(parseInt(e.target.value) || 0)}
                className="w-full bg-transparent text-xs font-bold text-white font-mono focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setAutoBetLimit(0)}
                title="Infinite Bets"
                className="px-2 text-sm font-black text-[#1475e1] hover:text-white transition-colors cursor-pointer select-none"
              >
                ∞
              </button>
            </div>
            {autoBetting && (
              <div className="flex justify-between items-center text-[10px] text-[#8596a5] px-1 font-mono">
                <span>Bets Dropped:</span>
                <span className="text-white font-bold">
                  {autoBetCount} / {autoBetLimit === 0 ? "∞" : autoBetLimit}
                </span>
              </div>
            )}
          </div>
        )}

        {/* 6. Manual / Auto Mode Selector (Segmented toggle with rounded-md) */}
        <div className="grid grid-cols-2 rounded-md bg-[#0f212e] p-1 border border-[#2f4553]">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setMode("manual");
              setAutoBetting(false);
            }}
            className={`py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
              mode === "manual"
                ? "bg-[#213743] text-white shadow-sm"
                : "text-[#8596a5] hover:text-white"
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
            className={`py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
              mode === "auto"
                ? "bg-[#213743] text-white shadow-sm"
                : "text-[#8596a5] hover:text-white"
            }`}
          >
            Auto
          </button>
        </div>

        {/* 7. Bottom Utility Controls Bar (Enlarged icons & subtle pill fairness) */}
        <div className="flex items-center justify-between rounded-md bg-[#0f212e] border border-[#2f4553] px-3 py-2 text-xs text-[#8596a5] mt-0.5">
          {/* Left Side: Settings Gear & Stats Bar-Chart icons (Enlarged to w-5.5 h-5.5) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-1 rounded-md hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors cursor-pointer"
              title="Settings"
            >
              <Settings className="w-5.5 h-5.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsStatsOpen(true)}
              className="p-1 rounded-md hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors cursor-pointer"
              title="Live Stats"
            >
              <BarChart2 className="w-5.5 h-5.5" />
            </button>
          </div>

          {/* Right Side: Clean Subtle Dark-Pill Fairness Button */}
          <button
            type="button"
            onClick={() => setIsFairnessOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#2f4553]/60 hover:bg-[#2f4553] text-[#b1bad3] hover:text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-[#b1bad3]" />
            <span>Fairness</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* PROVABLY FAIR MODAL                                       */}
      {/* ========================================================= */}
      {isFairnessOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-[#2f4553] bg-[#1a2c38] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2f4553] pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <ShieldCheck className="w-5 h-5 text-[#b1bad3]" />
                <span>Provably Fair Verification</span>
              </div>
              <button
                onClick={() => setIsFairnessOpen(false)}
                className="p-1 text-[#8596a5] hover:text-white rounded-md hover:bg-[#213743]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#b1bad3]">
              <div>
                <label className="text-[11px] font-bold text-white block mb-1">
                  Active Server Seed (Hashed)
                </label>
                <div className="flex items-center justify-between p-2.5 rounded-md bg-[#0f212e] font-mono text-[11px] text-white border border-[#2f4553]">
                  <span className="truncate">{serverSeedHash}</span>
                  <button
                    onClick={() => copyToClipboard(serverSeedHash, "server")}
                    className="p-1 text-[#8596a5] hover:text-white"
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
                <div className="p-2.5 rounded-md bg-[#0f212e] font-mono text-[11px] text-white border border-[#2f4553]">
                  {clientSeed}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-white block mb-1">Nonce</label>
                <div className="p-2.5 rounded-md bg-[#0f212e] font-mono text-[11px] text-white border border-[#2f4553]">
                  {nonce}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-white block mb-1">RTP</label>
                <div className="p-2.5 rounded-md bg-[#0f212e] font-mono text-[11px] text-[#00e701] border border-[#2f4553]">
                  99.00%
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsFairnessOpen(false)}
              className="w-full py-2.5 rounded-md bg-[#213743] hover:bg-[#2f4553] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* LIVE STATS MODAL                                          */}
      {/* ========================================================= */}
      {isStatsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-[#2f4553] bg-[#1a2c38] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2f4553] pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <BarChart2 className="w-5 h-5 text-[#1475e1]" />
                <span>Live Plinko Statistics</span>
              </div>
              <button
                onClick={() => setIsStatsOpen(false)}
                className="p-1 text-[#8596a5] hover:text-white rounded-md hover:bg-[#213743]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-md bg-[#0f212e] border border-[#2f4553] text-center">
                <div className="text-[11px] font-semibold text-[#8596a5]">Total Bets</div>
                <div className="text-lg font-black text-white font-mono mt-0.5">
                  {stats.totalBets}
                </div>
              </div>
              <div className="p-3 rounded-md bg-[#0f212e] border border-[#2f4553] text-center">
                <div className="text-[11px] font-semibold text-[#8596a5]">Best Multiplier</div>
                <div className="text-lg font-black text-[#1475e1] font-mono mt-0.5">
                  {stats.bestMultiplier}x
                </div>
              </div>
              <div className="p-3 rounded-md bg-[#0f212e] border border-[#2f4553] text-center">
                <div className="text-[11px] font-semibold text-[#8596a5]">Total Wagered</div>
                <div className="text-lg font-black text-white font-mono mt-0.5">
                  {activeSym}{stats.totalWagered.toFixed(2)}
                </div>
              </div>
              <div className="p-3 rounded-md bg-[#0f212e] border border-[#2f4553] text-center">
                <div className="text-[11px] font-semibold text-[#8596a5]">Net Profit</div>
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
              className="w-full py-2.5 rounded-md bg-[#213743] hover:bg-[#2f4553] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SETTINGS MODAL                                            */}
      {/* ========================================================= */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl border border-[#2f4553] bg-[#1a2c38] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2f4553] pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Settings className="w-5 h-5 text-[#8596a5]" />
                <span>Game Settings</span>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 text-[#8596a5] hover:text-white rounded-md hover:bg-[#213743]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Sound Toggle */}
              <div className="flex items-center justify-between p-2.5 rounded-md bg-[#0f212e] border border-[#2f4553]">
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

              {/* Fast Drop Toggle */}
              <div className="flex items-center justify-between p-2.5 rounded-md bg-[#0f212e] border border-[#2f4553]">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Fast Drop (Turbo)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFastDrop(!fastDrop)}
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                    fastDrop ? "bg-[#1475e1]" : "bg-[#213743]"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                      fastDrop ? "right-0.5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Hotkeys Toggle */}
              <div className="flex items-center justify-between p-2.5 rounded-md bg-[#0f212e] border border-[#2f4553]">
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
              className="w-full py-2.5 rounded-md bg-[#213743] hover:bg-[#2f4553] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
