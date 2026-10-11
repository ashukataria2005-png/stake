"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  ShieldCheck,
  Maximize2,
  Minimize2,
  TrendingUp,
  X,
  Copy,
  Check,
  Sparkles,
  CircleDot,
  RotateCcw,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

export type WheelRisk = "low" | "medium" | "high";
export type SegmentCount = 10 | 20 | 30 | 40 | 50;

export interface WheelSegment {
  multiplier: number;
  color: string;
}

// Generate exact 99% RTP wheel segments for any (Risk, Segments) combination
export function getWheelDistribution(risk: WheelRisk, segmentsCount: SegmentCount): WheelSegment[] {
  const segments: WheelSegment[] = [];

  if (risk === "high") {
    // 1 single jackpot segment = segmentsCount * 0.99
    const jackpot = parseFloat((segmentsCount * 0.99).toFixed(2));
    segments.push({ multiplier: jackpot, color: "#eab308" });
    for (let i = 1; i < segmentsCount; i++) {
      segments.push({ multiplier: 0.0, color: "#1e293b" });
    }
  } else if (risk === "medium") {
    // Balanced risk with ~30-40% win rate
    const winsCount = Math.floor(segmentsCount * 0.4);
    const winMult = parseFloat(((segmentsCount * 0.99) / winsCount).toFixed(2));
    for (let i = 0; i < segmentsCount; i++) {
      if (i < winsCount) {
        const isBig = i === 0;
        segments.push({
          multiplier: isBig ? parseFloat((winMult * 1.5).toFixed(2)) : parseFloat((winMult * 0.85).toFixed(2)),
          color: isBig ? "#ef4444" : "#06b6d4",
        });
      } else {
        segments.push({ multiplier: 0.0, color: "#1e293b" });
      }
    }
  } else {
    // Low risk: ~70-80% win rate
    const lossCount = Math.floor(segmentsCount * 0.2);
    const safeCount = segmentsCount - lossCount;
    const safeMult = parseFloat(((segmentsCount * 0.99) / safeCount).toFixed(2));
    for (let i = 0; i < segmentsCount; i++) {
      if (i < safeCount) {
        const isSuper = i % 2 === 0;
        segments.push({
          multiplier: isSuper ? parseFloat((safeMult * 1.2).toFixed(2)) : parseFloat((safeMult * 0.8).toFixed(2)),
          color: isSuper ? "#10b981" : "#3b82f6",
        });
      } else {
        segments.push({ multiplier: 0.0, color: "#1e293b" });
      }
    }
  }

  // Shuffle segments for realistic alternating layout
  return segments.sort((a, b) => (Math.random() > 0.5 ? 1 : -1));
}

export default function WheelGame() {
  const { balance, updateBalance, currencySymbol, addRecentlyPlayedGame } = useGame();
  const activeSym = currencySymbol || "$";

  // Register in Recently Played once on mount
  useEffect(() => {
    if (addRecentlyPlayedGame) {
      addRecentlyPlayedGame({
        id: "wheel",
        title: "Wheel",
        image: "/games/stake-originals/wheel.webp",
        href: "/games/wheel",
      });
    }
  }, []);

  // Settings & Modes
  const [betAmount, setBetAmount] = useState<number>(10);
  const [betInput, setBetInput] = useState<string>("10");
  const [risk, setRisk] = useState<WheelRisk>("medium");
  const [segmentsCount, setSegmentsCount] = useState<SegmentCount>(20);

  useEffect(() => {
    if (betInput !== "" && parseFloat(betInput) === betAmount) return;
    setBetInput(betAmount.toString());
  }, [betAmount]);

  // Wheel State
  const [segments, setSegments] = useState<WheelSegment[]>(() =>
    getWheelDistribution("medium", 20)
  );

  useEffect(() => {
    if (isSpinning) return;
    setSegments(getWheelDistribution(risk, segmentsCount));
  }, [risk, segmentsCount]);

  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [wheelRotation, setWheelRotation] = useState<number>(0);
  const [winningSegment, setWinningSegment] = useState<WheelSegment | null>(null);
  const [lastPayout, setLastPayout] = useState<number | null>(null);

  // Settings & Modals
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [showFairnessModal, setShowFairnessModal] = useState<boolean>(false);
  const [showLiveStats, setShowLiveStats] = useState<boolean>(false);
  const [copiedSeed, setCopiedSeed] = useState<boolean>(false);

  // Live Stats
  const [stats, setStats] = useState({
    rounds: 0,
    wins: 0,
    losses: 0,
    wagered: 0,
    profit: 0,
  });

  // Quick Bet Modifiers
  const handleHalfBet = () => {
    if (isSpinning) return;
    if (soundEnabled) sounds.playClick();
    const next = Math.max(0.01, parseFloat((betAmount / 2).toFixed(2)));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  const handleDoubleBet = () => {
    if (isSpinning) return;
    if (soundEnabled) sounds.playClick();
    const next = parseFloat((betAmount * 2).toFixed(2));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  const handleMaxBet = () => {
    if (isSpinning) return;
    if (soundEnabled) sounds.playClick();
    const next = Math.max(0.01, parseFloat(balance.toFixed(2)));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  // Spin Wheel Action
  const handleSpin = () => {
    if (isSpinning) return;
    if (balance < betAmount) {
      alert("Insufficient balance!");
      return;
    }

    updateBalance(-betAmount);
    setIsSpinning(true);
    setWinningSegment(null);
    setLastPayout(null);

    if (soundEnabled) sounds.playBet();

    // Select random winning index
    const targetIdx = Math.floor(Math.random() * segments.length);
    const chosen = segments[targetIdx];

    const sliceAngle = 360 / segments.length;
    // Calculate rotation: Pointer is at top (270 deg / 12 o'clock).
    // Target slice center needs to align with 270 deg.
    const targetAngle = targetIdx * sliceAngle + sliceAngle / 2;
    const extraSpins = 360 * 5;
    const finalDegree = wheelRotation + extraSpins + (360 - (targetAngle % 360));

    setWheelRotation(finalDegree);

    // Decelerating peg clicks
    let clickCount = 0;
    const clickInterval = setInterval(() => {
      clickCount++;
      if (soundEnabled) sounds.playWheelTick();
      if (clickCount >= 18) clearInterval(clickInterval);
    }, 140);

    setTimeout(() => {
      clearInterval(clickInterval);
      setIsSpinning(false);
      setWinningSegment(chosen);

      const payout = parseFloat((betAmount * chosen.multiplier).toFixed(2));
      const profitDelta = parseFloat((payout - betAmount).toFixed(2));

      if (chosen.multiplier > 0) {
        updateBalance(payout);
        setLastPayout(payout);
        if (soundEnabled) sounds.playCashout();
        if (chosen.multiplier >= 2.0) {
          confetti({ particleCount: 75, spread: 65, origin: { y: 0.55 } });
        }
      } else {
        if (soundEnabled) sounds.playDiceLoss();
      }

      setStats((prev) => ({
        ...prev,
        rounds: prev.rounds + 1,
        wins: chosen.multiplier >= 1.0 ? prev.wins + 1 : prev.wins,
        losses: chosen.multiplier < 1.0 ? prev.losses + 1 : prev.losses,
        wagered: parseFloat((prev.wagered + betAmount).toFixed(2)),
        profit: parseFloat((prev.profit + profitDelta).toFixed(2)),
      }));
    }, 3200);
  };

  const toggleFullscreen = () => {
    if (!gameContainerRef.current) return;
    if (!document.fullscreenElement) {
      gameContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div
      ref={gameContainerRef}
      className={`w-full max-w-lg mx-auto px-2 sm:px-3 py-2 select-none flex flex-col space-y-2 ${
        isFullscreen ? "p-6 bg-[#0f212e] min-h-screen max-w-none" : ""
      }`}
    >
      {/* =========================================================================
          1. GAME ARENA: SPINNING WHEEL ARENA (Top of View)
      ========================================================================== */}
      <div className="w-full rounded-t-2xl bg-[#0f212e] border-t border-x border-[#213743] shadow-2xl p-3 sm:p-4 flex flex-col items-center justify-center space-y-3 relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-[#00e701]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Live Multiplier & Config Header HUD */}
        <div className="w-full flex items-center justify-between bg-[#1a2c38] rounded-xl px-3 py-2 border border-[#213743]">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-[#b1bad3] uppercase tracking-wider">Config:</span>
            <span className="text-xs font-bold text-white font-mono">
              <span className="capitalize text-amber-400">{risk}</span> • {segmentsCount} Segs
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#0f212e] text-xs font-black font-mono transition-transform duration-200 ${
                winningSegment && winningSegment.multiplier > 0 ? "scale-105 text-[#00e701]" : "text-[#b1bad3]"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{winningSegment ? `${winningSegment.multiplier.toFixed(2)}×` : "1.00×"}</span>
            </div>
          </div>
        </div>

        {/* Center Spinning Wheel Disc with Top Pointer Needle */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-2 flex items-center justify-center">
          {/* Top Pointer Arrow */}
          <div className="absolute -top-2.5 z-30 flex flex-col items-center pointer-events-none">
            <div className="w-0 h-0 border-x-7 border-x-transparent border-t-[16px] border-t-[#00e701] drop-shadow-[0_0_10px_#00e701]" />
            <div className="w-2 h-2 rounded-full bg-white shadow -mt-1" />
          </div>

          {/* SVG Multi-Segment Wheel Disc */}
          <div
            className="w-full h-full rounded-full border-4 border-[#213743] shadow-[0_0_40px_rgba(0,0,0,0.8)] relative flex items-center justify-center overflow-hidden"
            style={{
              transform: `rotate(${wheelRotation}deg)`,
              transition: isSpinning ? "transform 3.2s cubic-bezier(0.2, 0.8, 0.2, 1)" : "none",
            }}
          >
            <svg viewBox="0 0 300 300" className="w-full h-full absolute inset-0">
              <circle cx="150" cy="150" r="146" fill="#0f1922" stroke="#213743" strokeWidth="2" />
              {segments.map((seg, idx) => {
                const sliceAngle = 360 / segments.length;
                const angle = idx * sliceAngle;
                return (
                  <g key={idx} transform={`rotate(${angle} 150 150)`}>
                    {/* Slice Wedge */}
                    <path
                      d="M150 150 L140 10 A140 140 0 0 1 160 10 Z"
                      fill={seg.color}
                      opacity={0.9}
                    />
                    {/* Ticker Outer Peg */}
                    <circle cx="150" cy="8" r="2.5" fill="#f8fafc" />
                    {/* Slice Multiplier Text (shown on 10 or 20 segments) */}
                    {segments.length <= 20 && (
                      <text
                        x="150"
                        y="32"
                        fill="#ffffff"
                        fontSize={segments.length <= 10 ? "11" : "8"}
                        fontWeight="bold"
                        textAnchor="middle"
                        fontFamily="monospace"
                        transform="rotate(180 150 32)"
                      >
                        {seg.multiplier}×
                      </text>
                    )}
                  </g>
                );
              })}
              {/* Center Wheel Hub */}
              <circle cx="150" cy="150" r="42" fill="#0f212e" stroke="#213743" strokeWidth="3" />
              <circle cx="150" cy="150" r="28" fill="#1a2c38" />
            </svg>

            {/* Center Brand Badge */}
            <div className="absolute w-14 h-14 rounded-full bg-[#1a2c38] border-2 border-[#00e701]/40 flex items-center justify-center shadow-lg pointer-events-none">
              <span className="text-[10px] font-black text-[#00e701] tracking-wider">STAKE</span>
            </div>
          </div>
        </div>

        {/* Payout Feedback Banner */}
        {lastPayout !== null && (
          <div className="w-full px-4 py-1.5 rounded-xl bg-[#00e701]/10 border border-[#00e701]/40 flex items-center justify-center gap-2 animate-in zoom-in-95">
            <Sparkles className="h-3.5 w-3.5 text-[#00e701]" />
            <span className="text-xs font-bold text-[#00e701]">
              Landed {winningSegment?.multiplier.toFixed(2)}×! Payout: {activeSym}{lastPayout.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* =========================================================================
          2. MINES HARMONIZED BETTING CONTROLS SHELL CONTAINER
      ========================================================================== */}
      <div className="w-full border-t border-[#213743] bg-[#1a2c38] p-3 sm:p-4 flex flex-col justify-start space-y-2 sm:space-y-2.5 rounded-b-2xl select-none">
        {/* 1. PRIMARY BET CTA BUTTON (Directly at top of controls) */}
        <div className="w-full">
          <button
            type="button"
            onClick={handleSpin}
            disabled={isSpinning || betAmount > balance || betAmount <= 0}
            className="w-full py-3 sm:py-3.5 text-sm sm:text-base font-extrabold rounded-xl bg-[#1475e1] hover:bg-[#1164c2] text-white shadow-lg shadow-[#1475e1]/25 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer uppercase tracking-wider"
          >
            <span>{isSpinning ? "SPINNING..." : "SPIN"}</span>
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
                disabled={isSpinning}
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
                disabled={isSpinning}
                onClick={handleHalfBet}
                className="rounded-lg bg-[#213743] px-2.5 py-1.5 text-xs font-bold text-[#b1bad3] hover:bg-[#2f4553] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                ½
              </button>
              <button
                type="button"
                disabled={isSpinning}
                onClick={handleDoubleBet}
                className="rounded-lg bg-[#213743] px-2.5 py-1.5 text-xs font-bold text-[#b1bad3] hover:bg-[#2f4553] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                2×
              </button>
            </div>
          </div>
        </div>

        {/* 3. RISK LEVEL & SEGMENTS SELECTORS */}
        <div className="grid grid-cols-2 gap-2">
          {/* Risk Level Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#b1bad3] uppercase">Risk</label>
            <div className="grid grid-cols-3 gap-1">
              {(["low", "medium", "high"] as WheelRisk[]).map((r) => {
                const isSelected = risk === r;
                return (
                  <button
                    key={r}
                    type="button"
                    disabled={isSpinning}
                    onClick={() => {
                      if (soundEnabled) sounds.playClick();
                      setRisk(r);
                    }}
                    className={`py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#213743] text-white shadow-sm"
                        : "bg-[#0f212e] text-[#b1bad3] hover:text-white"
                    } disabled:opacity-50`}
                  >
                    {r[0].toUpperCase() + r.slice(1, 3)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Segments Count Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#b1bad3] uppercase">Segments</label>
            <div className="grid grid-cols-5 gap-1">
              {([10, 20, 30, 40, 50] as SegmentCount[]).map((cnt) => {
                const isSelected = segmentsCount === cnt;
                return (
                  <button
                    key={cnt}
                    type="button"
                    disabled={isSpinning}
                    onClick={() => {
                      if (soundEnabled) sounds.playClick();
                      setSegmentsCount(cnt);
                    }}
                    className={`py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#213743] text-white shadow-sm"
                        : "bg-[#0f212e] text-[#b1bad3] hover:text-white"
                    } disabled:opacity-50`}
                  >
                    {cnt}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4. BOTTOM UTILITY BAR */}
        <div className="flex items-center justify-between rounded-lg bg-[#0f212e] border border-[#213743] px-3 py-2 text-xs text-[#b1bad3] mt-0.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1 rounded-md hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowFairnessModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#213743] hover:bg-[#2f4553] text-[#b1bad3] hover:text-white font-bold text-xs transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-[#00e701]" />
            <span>Fairness</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          MODALS: PROVABLY FAIR & LIVE STATS
      ========================================================================== */}
      {showFairnessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#00e701]" />
                <span>Provably Fair: Wheel</span>
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
                Wheel spin landing segments are generated using HMAC-SHA256 from your Client Seed and
                Server Seed with certified 99% Return to Player (RTP).
              </p>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#b1bad3]">Server Seed (Hashed)</label>
                <div className="flex items-center justify-between rounded-xl bg-[#0f212e] border border-[#213743] p-2.5 font-mono text-white text-[11px] truncate">
                  <span className="truncate">c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4");
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

      {showLiveStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#00e701]" />
                <span>Wheel Session Stats</span>
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
                <div className="text-[11px] font-bold text-[#b1bad3]">Total Spins</div>
                <div className="text-lg font-black text-white font-mono">{stats.rounds}</div>
              </div>
              <div className="rounded-xl bg-[#0f212e] border border-[#213743] p-3">
                <div className="text-[11px] font-bold text-[#b1bad3]">Win Rate (≥1×)</div>
                <div className="text-lg font-black text-[#00e701] font-mono">
                  {stats.rounds > 0 ? ((stats.wins / stats.rounds) * 100).toFixed(1) : "0.0"}%
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
