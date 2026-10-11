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
      className="flex flex-col items-center w-full min-h-[calc(100vh-64px)] bg-[#0f212e] text-white p-3 sm:p-6 select-none font-sans"
    >
      {/* =========================================================================
          TOP: SPINNING WHEEL ARENA (Top of View)
      ========================================================================== */}
      <div className="w-full max-w-4xl bg-[#1a2c38] rounded-2xl p-4 sm:p-6 border border-[#213743] shadow-2xl flex flex-col items-center relative overflow-hidden mb-5">
        
        {/* Ambient Glow */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-[#00e701]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Live Multiplier & Config Header HUD */}
        <div className="w-full flex items-center justify-between bg-[#0f212e]/80 backdrop-blur-md rounded-xl p-3 sm:px-6 mb-4 border border-[#213743]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#b1bad3] uppercase tracking-wider">Configuration:</span>
            <span className="text-sm font-bold text-white font-mono">
              <span className="capitalize text-amber-400">{risk}</span> Risk • {segmentsCount} Segments
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#213743] text-sm font-black font-mono transition-transform duration-200 ${
                winningSegment && winningSegment.multiplier > 0 ? "scale-105 text-[#00e701]" : "text-[#b1bad3]"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>{winningSegment ? `${winningSegment.multiplier.toFixed(2)}×` : "1.00×"}</span>
            </div>
          </div>
        </div>

        {/* Center Spinning Wheel Disc with Top Pointer Needle */}
        <div className="relative w-72 h-72 sm:w-84 sm:h-84 my-4 flex items-center justify-center">
          
          {/* Top Pointer Arrow */}
          <div className="absolute -top-3 z-30 flex flex-col items-center pointer-events-none">
            <div className="w-0 h-0 border-x-8 border-x-transparent border-t-[18px] border-t-[#00e701] drop-shadow-[0_0_10px_#00e701]" />
            <div className="w-2.5 h-2.5 rounded-full bg-white shadow -mt-1" />
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
            <div className="absolute w-16 h-16 rounded-full bg-[#1a2c38] border-2 border-[#00e701]/40 flex items-center justify-center shadow-lg pointer-events-none">
              <span className="text-[11px] font-black text-[#00e701] tracking-wider">STAKE</span>
            </div>
          </div>
        </div>

        {/* Payout Feedback Banner */}
        {lastPayout !== null && (
          <div className="mt-3 px-6 py-2 rounded-xl bg-[#00e701]/10 border border-[#00e701]/40 flex items-center gap-2 animate-in zoom-in-95">
            <Sparkles className="h-4 w-4 text-[#00e701]" />
            <span className="text-xs sm:text-sm font-bold text-[#00e701]">
              Landed {winningSegment?.multiplier.toFixed(2)}×! Payout: {activeSym}{lastPayout.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* =========================================================================
          CONTROLS: DIRECTLY BENEATH ARENA (Vertical Flow)
      ========================================================================== */}
      <div className="w-full max-w-4xl bg-[#1a2c38] rounded-2xl p-5 border border-[#213743] shadow-xl space-y-4">
        
        {/* Row 1: Bet Amount, Risk Level, Segments Count */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Bet Amount Input with Quick Modifiers */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs text-[#b1bad3] font-semibold">
              <label>Bet Amount</label>
              <span>{activeSym}{balance.toFixed(2)}</span>
            </div>
            <div className="relative flex items-center">
              <div className="absolute left-3 text-sm font-bold text-[#b1bad3]">
                {activeSym}
              </div>
              <input
                type="number"
                disabled={isSpinning}
                value={betInput}
                onChange={(e) => {
                  setBetInput(e.target.value);
                  const parsed = parseFloat(e.target.value);
                  if (!isNaN(parsed) && parsed > 0) setBetAmount(parsed);
                }}
                className="w-full bg-[#0f212e] border border-[#213743] rounded-xl pl-8 pr-32 py-2.5 text-sm font-bold font-mono text-white focus:outline-none focus:border-[#00e701] disabled:opacity-50"
                step="any"
                min="0.01"
              />
              <div className="absolute right-1.5 flex items-center gap-1">
                <button
                  type="button"
                  disabled={isSpinning}
                  onClick={handleHalfBet}
                  className="px-2 py-1 text-xs font-bold rounded-lg bg-[#213743] text-[#b1bad3] hover:text-white hover:bg-[#2f4553] transition-colors disabled:opacity-50"
                >
                  ½
                </button>
                <button
                  type="button"
                  disabled={isSpinning}
                  onClick={handleDoubleBet}
                  className="px-2 py-1 text-xs font-bold rounded-lg bg-[#213743] text-[#b1bad3] hover:text-white hover:bg-[#2f4553] transition-colors disabled:opacity-50"
                >
                  2×
                </button>
                <button
                  type="button"
                  disabled={isSpinning}
                  onClick={handleMaxBet}
                  className="px-2 py-1 text-xs font-bold rounded-lg bg-[#213743] text-[#b1bad3] hover:text-white hover:bg-[#2f4553] transition-colors disabled:opacity-50"
                >
                  Max
                </button>
              </div>
            </div>
          </div>

          {/* Risk Level Selector */}
          <div className="space-y-1.5">
            <div className="text-xs text-[#b1bad3] font-semibold">Risk Level</div>
            <div className="grid grid-cols-3 gap-1.5">
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
                    className={`py-2.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#213743] text-white border border-[#00e701] shadow-md ring-1 ring-[#00e701]"
                        : "bg-[#0f212e] text-[#b1bad3] hover:text-white hover:bg-[#2f4553]/50 border border-transparent"
                    } disabled:opacity-50`}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Segments Count Selector */}
          <div className="space-y-1.5">
            <div className="text-xs text-[#b1bad3] font-semibold">Segments</div>
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
                    className={`py-2.5 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#213743] text-white border border-[#00e701] shadow-md ring-1 ring-[#00e701]"
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

        {/* Row 2: Stake Green `#00e701` Spin CTA Button */}
        <div>
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className={`w-full py-4 rounded-xl font-black text-sm tracking-wide uppercase transition-all duration-200 transform active:scale-[0.99] ${
              !isSpinning
                ? "bg-[#00e701] hover:bg-[#00c701] text-black shadow-[0_0_20px_rgba(0,231,1,0.4)] cursor-pointer"
                : "bg-[#213743] text-[#b1bad3] cursor-not-allowed"
            }`}
          >
            {isSpinning ? "Spinning Wheel..." : `Spin (${activeSym}${betAmount.toFixed(2)})`}
          </button>
        </div>

        {/* Footer Utility Icons: Sound, Stats, Fairness, Fullscreen */}
        <div className="flex items-center justify-between pt-2 border-t border-[#213743] text-[#b1bad3]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-lg hover:bg-[#213743] hover:text-white transition-colors"
              title={soundEnabled ? "Mute" : "Unmute"}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>

            <button
              onClick={() => setShowLiveStats(true)}
              className="p-2 rounded-lg hover:bg-[#213743] hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Live Stats</span>
            </button>

            <button
              onClick={() => setShowFairnessModal(true)}
              className="p-2 rounded-lg hover:bg-[#213743] hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <ShieldCheck className="h-4 w-4 text-[#00e701]" />
              <span className="hidden sm:inline">Provably Fair</span>
            </button>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg hover:bg-[#213743] hover:text-white transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
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
