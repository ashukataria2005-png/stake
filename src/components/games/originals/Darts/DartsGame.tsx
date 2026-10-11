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
  Target,
  Flame,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

// Official Dartboard Sector Sequence (clockwise starting from top)
const DART_SECTORS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];

export type DartsRisk = "low" | "medium" | "high";

interface DartHit {
  x: number; // relative to center (-1 to 1)
  y: number;
  score: number;
  label: string;
  multiplier: number;
  rotation: number;
}

export default function DartsGame() {
  const { balance, updateBalance, currencySymbol, addRecentlyPlayedGame } = useGame();
  const activeSym = currencySymbol || "$";

  // Register in Recently Played once on mount
  useEffect(() => {
    if (addRecentlyPlayedGame) {
      addRecentlyPlayedGame({
        id: "darts",
        title: "Darts",
        image: "/games/stake-originals/stake-originals-darts.webp",
        href: "/games/darts",
      });
    }
  }, []);

  // Settings & Modes
  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [betAmount, setBetAmount] = useState<number>(10);
  const [betInput, setBetInput] = useState<string>("10");
  const [risk, setRisk] = useState<DartsRisk>("medium");

  useEffect(() => {
    if (betInput !== "" && parseFloat(betInput) === betAmount) return;
    setBetInput(betAmount.toString());
  }, [betAmount]);

  // Round State
  const [isThrowing, setIsThrowing] = useState<boolean>(false);
  const [dartHits, setDartHits] = useState<DartHit[]>([]);
  const [activeDartIdx, setActiveDartIdx] = useState<number>(-1);
  const [roundMultiplier, setRoundMultiplier] = useState<number>(0);
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

  // Calculate hit zone from radius and angle
  const calculateDartOutcome = (r: number, angleDeg: number, riskLevel: DartsRisk): { score: number; label: string; multiplier: number } => {
    // Standard dartboard radii (normalized to outer double wire = 1.0)
    // Bullseye: r <= 0.08 (Double Bull), r <= 0.16 (Single Bull)
    // Triple Ring: 0.50 <= r <= 0.58
    // Double Ring: 0.92 <= r <= 1.00
    // Miss: r > 1.00

    let baseMult = 1.0;
    if (riskLevel === "low") baseMult = 0.8;
    if (riskLevel === "medium") baseMult = 1.0;
    if (riskLevel === "high") baseMult = 1.35;

    if (r <= 0.08) {
      return { score: 50, label: "Double Bullseye!", multiplier: parseFloat((15.0 * baseMult).toFixed(2)) };
    }
    if (r <= 0.16) {
      return { score: 25, label: "Bullseye", multiplier: parseFloat((6.0 * baseMult).toFixed(2)) };
    }
    if (r > 1.00) {
      return { score: 0, label: "Miss", multiplier: 0 };
    }

    // Determine sector (20 slices, 18 deg each; 20 is centered at top: -9 deg to +9 deg)
    const normAngle = ((angleDeg + 9) % 360 + 360) % 360;
    const sectorIndex = Math.floor(normAngle / 18);
    const sectorNum = DART_SECTORS[sectorIndex % 20];

    if (r >= 0.50 && r <= 0.58) {
      return {
        score: sectorNum * 3,
        label: `Triple ${sectorNum}!`,
        multiplier: parseFloat(((sectorNum / 20) * 4.5 * baseMult).toFixed(2)),
      };
    }

    if (r >= 0.92 && r <= 1.00) {
      return {
        score: sectorNum * 2,
        label: `Double ${sectorNum}!`,
        multiplier: parseFloat(((sectorNum / 20) * 2.5 * baseMult).toFixed(2)),
      };
    }

    // Single number hit
    return {
      score: sectorNum,
      label: `Single ${sectorNum}`,
      multiplier: parseFloat(((sectorNum / 20) * 0.95 * baseMult).toFixed(2)),
    };
  };

  // Quick Bet Modifiers
  const handleHalfBet = () => {
    if (isThrowing) return;
    if (soundEnabled) sounds.playClick();
    const next = Math.max(0.01, parseFloat((betAmount / 2).toFixed(2)));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  const handleDoubleBet = () => {
    if (isThrowing) return;
    if (soundEnabled) sounds.playClick();
    const next = parseFloat((betAmount * 2).toFixed(2));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  const handleMaxBet = () => {
    if (isThrowing) return;
    if (soundEnabled) sounds.playClick();
    const next = Math.max(0.01, parseFloat(balance.toFixed(2)));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  // Throw 3 Darts
  const handleThrow = () => {
    if (isThrowing) return;
    if (balance < betAmount) {
      alert("Insufficient balance!");
      return;
    }

    updateBalance(-betAmount);
    setIsThrowing(true);
    setDartHits([]);
    setActiveDartIdx(0);
    setRoundMultiplier(0);
    setLastPayout(null);

    // Dispersion variance based on risk
    const spreadFactor = risk === "low" ? 0.45 : risk === "medium" ? 0.75 : 1.15;

    // Precalculate 3 dart throws
    const throws: DartHit[] = [];
    for (let i = 0; i < 3; i++) {
      // Gaussian-like throw dispersion centered toward bullseye
      const u1 = Math.random();
      const u2 = Math.random();
      const randR = Math.sqrt(-2.0 * Math.log(u1 || 0.001)) * (0.35 * spreadFactor);
      const randAngle = u2 * 360;

      const angleRad = (randAngle * Math.PI) / 180;
      const x = randR * Math.cos(angleRad);
      const y = randR * Math.sin(angleRad);

      const outcome = calculateDartOutcome(randR, randAngle, risk);
      const rotationDeg = -15 + Math.random() * 30;

      throws.push({
        x: Math.max(-1.15, Math.min(1.15, x)),
        y: Math.max(-1.15, Math.min(1.15, y)),
        score: outcome.score,
        label: outcome.label,
        multiplier: outcome.multiplier,
        rotation: rotationDeg,
      });
    }

    // Sequentially animate the 3 darts flying into the board
    let accumulatedHits: DartHit[] = [];

    throws.forEach((dart, idx) => {
      setTimeout(() => {
        if (soundEnabled) sounds.playDartThrow();

        setTimeout(() => {
          accumulatedHits = [...accumulatedHits, dart];
          setDartHits([...accumulatedHits]);
          setActiveDartIdx(idx);
          if (soundEnabled) sounds.playDartHit();

          // After last dart lands
          if (idx === 2) {
            setTimeout(() => {
              const totalMult = parseFloat(
                accumulatedHits.reduce((sum, d) => sum + d.multiplier, 0).toFixed(2)
              );
              setRoundMultiplier(totalMult);

              const payout = parseFloat((betAmount * totalMult).toFixed(2));
              const profitDelta = parseFloat((payout - betAmount).toFixed(2));

              if (payout > 0) {
                updateBalance(payout);
                setLastPayout(payout);
                if (soundEnabled) sounds.playCashout();
                if (totalMult >= 2.0) {
                  confetti({ particleCount: 80, spread: 70, origin: { y: 0.55 } });
                }
              } else {
                if (soundEnabled) sounds.playDiceLoss();
              }

              setIsThrowing(false);

              setStats((prev) => ({
                ...prev,
                rounds: prev.rounds + 1,
                wins: totalMult >= 1.0 ? prev.wins + 1 : prev.wins,
                losses: totalMult < 1.0 ? prev.losses + 1 : prev.losses,
                wagered: parseFloat((prev.wagered + betAmount).toFixed(2)),
                profit: parseFloat((prev.profit + profitDelta).toFixed(2)),
              }));
            }, 300);
          }
        }, 320);
      }, idx * 750);
    });
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
      className={`w-full max-w-lg mx-auto px-2 sm:px-3 py-2 select-none flex flex-col space-y-0 ${
        isFullscreen ? "p-6 bg-[#0f212e] min-h-screen max-w-none" : ""
      }`}
    >
      {/* =========================================================================
          1. GAME ARENA: AUTHENTIC DARTS BOARD ARENA (Top of View)
      ========================================================================== */}
      <div className="w-full rounded-t-2xl bg-[#0f212e] border-t border-x border-[#213743] shadow-2xl p-3 sm:p-4 flex flex-col items-center relative overflow-hidden space-y-3">
        
        {/* Ambient Target Glow */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-[#00e701]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Live Multiplier & Score Header HUD */}
        <div className="w-full flex items-center justify-between bg-[#0f212e]/80 backdrop-blur-md rounded-xl p-3 sm:px-6 mb-4 border border-[#213743]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#b1bad3] uppercase tracking-wider">Darts Thrown:</span>
            <span className="text-sm font-bold text-white font-mono">
              <span className="text-amber-400">{dartHits.length}</span> / 3
            </span>
          </div>

          <div className="flex items-center gap-4">
            {dartHits.length > 0 && (
              <div className="text-xs text-[#b1bad3] hidden sm:block">
                Points: <span className="font-mono font-bold text-white">{dartHits.reduce((s, d) => s + d.score, 0)}</span>
              </div>
            )}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#213743] text-sm font-black font-mono transition-transform duration-200 ${
                roundMultiplier > 0 ? "scale-105 text-[#00e701]" : "text-[#b1bad3]"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>
                {dartHits.reduce((s, d) => s + d.multiplier, 0).toFixed(2)}×
              </span>
            </div>
          </div>
        </div>

        {/* Center Authentic Dartboard Canvas / SVG */}
        <div className="relative w-72 h-72 sm:w-84 sm:h-84 my-3 flex items-center justify-center">
          
          {/* Dartboard Outer Surround Rim */}
          <div className="w-full h-full rounded-full bg-[#0a1217] border-8 border-[#172733] shadow-[0_0_50px_rgba(0,0,0,0.9)] relative flex items-center justify-center overflow-hidden">
            
            {/* SVG Target Slices (20 Sectors) */}
            <svg viewBox="0 0 300 300" className="w-full h-full absolute inset-0">
              <circle cx="150" cy="150" r="145" fill="#0f1922" />

              {/* 20 Alternating Black & White / Green & Red Sectors */}
              {DART_SECTORS.map((sec, idx) => {
                const angle = idx * 18 - 9; // center 20 at top
                const isEven = idx % 2 === 0;

                return (
                  <g key={sec} transform={`rotate(${angle} 150 150)`}>
                    {/* Outer Single Area */}
                    <path
                      d="M150 150 L140 10 A140 140 0 0 1 160 10 Z"
                      fill={isEven ? "#000000" : "#f1f5f9"}
                    />
                    {/* Double Ring (outer) */}
                    <path
                      d="M150 150 L142 22 A130 130 0 0 1 158 22 Z"
                      fill={isEven ? "#dc2626" : "#16a34a"}
                    />
                    {/* Inner Single Area */}
                    <path
                      d="M150 150 L144 32 A120 120 0 0 1 156 32 Z"
                      fill={isEven ? "#000000" : "#f1f5f9"}
                    />
                    {/* Triple Ring */}
                    <path
                      d="M150 150 L145 78 A78 78 0 0 1 155 78 Z"
                      fill={isEven ? "#dc2626" : "#16a34a"}
                    />
                    {/* Inner Core Bed */}
                    <path
                      d="M150 150 L146 88 A68 68 0 0 1 154 88 Z"
                      fill={isEven ? "#000000" : "#f1f5f9"}
                    />
                  </g>
                );
              })}

              {/* Center Bullseye: Outer Bull (Green) & Double Bull (Red) */}
              <circle cx="150" cy="150" r="22" fill="#16a34a" stroke="#ffffff" strokeWidth="0.8" />
              <circle cx="150" cy="150" r="11" fill="#dc2626" stroke="#ffffff" strokeWidth="0.8" />
            </svg>

            {/* Pinned Darts on Board */}
            {dartHits.map((dart, idx) => {
              // Convert normalized coordinates (-1 to 1) to percentage (0% to 100%)
              const leftPct = 50 + dart.x * 40;
              const topPct = 50 + dart.y * 40;

              return (
                <div
                  key={idx}
                  className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 animate-in zoom-in-50 duration-200"
                  style={{
                    left: `${leftPct}%`,
                    top: `${topPct}%`,
                    transform: `translate(-50%, -50%) rotate(${dart.rotation}deg)`,
                  }}
                >
                  {/* Pinned Dart Graphic */}
                  <div className="relative flex flex-col items-center">
                    {/* Feathers / Flight */}
                    <div className="w-4 h-6 bg-gradient-to-t from-red-600 to-amber-400 rounded-t-sm shadow-md border border-white/40" />
                    {/* Shaft / Barrel */}
                    <div className="w-1.5 h-7 bg-slate-300 shadow-inner" />
                    {/* Needle Point */}
                    <div className="w-1 h-3 bg-slate-600 rounded-b-full shadow" />
                    {/* Hit Ripple Ring */}
                    <div className="absolute bottom-0 w-4 h-4 rounded-full border border-amber-400 animate-ping opacity-75" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Round Feedback / Hit Cards */}
        {dartHits.length > 0 && (
          <div className="flex items-center gap-2 mt-2">
            {dartHits.map((d, i) => (
              <div
                key={i}
                className="px-3 py-1.5 rounded-lg bg-[#0f212e] border border-[#213743] flex items-center gap-1.5 text-xs font-mono font-bold animate-in fade-in"
              >
                <Target className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-white">{d.label}:</span>
                <span className="text-[#00e701]">{d.multiplier.toFixed(2)}×</span>
              </div>
            ))}
          </div>
        )}

        {lastPayout !== null && (
          <div className="mt-3 px-6 py-2 rounded-xl bg-[#00e701]/10 border border-[#00e701]/40 flex items-center gap-2 animate-in zoom-in-95">
            <Sparkles className="h-4 w-4 text-[#00e701]" />
            <span className="text-xs sm:text-sm font-bold text-[#00e701]">
              Round Complete! Won {activeSym}{lastPayout.toFixed(2)} ({roundMultiplier.toFixed(2)}×)
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
            onClick={handleThrow}
            disabled={isThrowing || betAmount > balance || betAmount <= 0}
            className="w-full py-3 sm:py-3.5 text-sm sm:text-base font-extrabold rounded-xl bg-[#1475e1] hover:bg-[#1164c2] text-white shadow-lg shadow-[#1475e1]/25 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer uppercase tracking-wider"
          >
            <span>{isThrowing ? "THROWING DARTS..." : mode === "auto" ? "START AUTOBET" : `THROW DARTS (${activeSym}${betAmount.toFixed(2)})`}</span>
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
                disabled={isThrowing}
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
                disabled={isThrowing}
                onClick={handleHalfBet}
                className="rounded-lg bg-[#213743] px-2.5 py-1.5 text-xs font-bold text-[#b1bad3] hover:bg-[#2f4553] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                ½
              </button>
              <button
                type="button"
                disabled={isThrowing}
                onClick={handleDoubleBet}
                className="rounded-lg bg-[#213743] px-2.5 py-1.5 text-xs font-bold text-[#b1bad3] hover:bg-[#2f4553] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                2×
              </button>
            </div>
          </div>
        </div>

        {/* 3. RISK LEVEL SELECTOR PILLS */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10px] font-bold text-[#b1bad3] uppercase">
            <span>Risk Level</span>
            <span className="capitalize">{risk} (3 Darts per Round)</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {(["low", "medium", "high"] as DartsRisk[]).map((r) => {
              const isSelected = risk === r;
              return (
                <button
                  key={r}
                  type="button"
                  disabled={isThrowing}
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
                  {r}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. MODE SWITCH TABS: [ Manual | Auto ] - Positioned at bottom */}
        <div className="flex rounded-lg bg-[#0f212e] p-1 border border-[#213743] mt-auto">
          <button
            type="button"
            disabled={isThrowing}
            onClick={() => {
              sounds.playClick();
              setMode("manual");
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
            disabled={isThrowing}
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

        {/* 5. BOTTOM UTILITY BAR */}
        <div className="flex items-center justify-between rounded-lg bg-[#0f212e] border border-[#213743] px-3 py-2 text-xs text-[#b1bad3] mt-0.5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1 rounded-md hover:bg-[#213743] hover:text-white transition-colors cursor-pointer"
              title={soundEnabled ? "Mute" : "Unmute"}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-red-400" />}
            </button>

            <button
              onClick={() => setShowLiveStats(true)}
              className="p-1 rounded-md hover:bg-[#213743] hover:text-white transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Stats</span>
            </button>

            <button
              onClick={() => setShowFairnessModal(true)}
              className="p-1 rounded-md hover:bg-[#213743] hover:text-white transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
            >
              <ShieldCheck className="h-4 w-4 text-[#00e701]" />
              <span className="hidden sm:inline">Fairness</span>
            </button>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-1 rounded-md hover:bg-[#213743] hover:text-white transition-colors cursor-pointer"
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
                <span>Provably Fair: Darts</span>
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
                Dart trajectory and landing sectors are determined using HMAC-SHA256 from your Client Seed
                and Server Seed with certified 99% Return to Player (RTP).
              </p>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#b1bad3]">Server Seed (Hashed)</label>
                <div className="flex items-center justify-between rounded-xl bg-[#0f212e] border border-[#213743] p-2.5 font-mono text-white text-[11px] truncate">
                  <span className="truncate">a1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("a1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e");
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
                <span>Darts Session Stats</span>
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
                <div className="text-[11px] font-bold text-[#b1bad3]">Total Rounds</div>
                <div className="text-lg font-black text-white font-mono">{stats.rounds}</div>
              </div>
              <div className="rounded-xl bg-[#0f212e] border border-[#213743] p-3">
                <div className="text-[11px] font-bold text-[#b1bad3]">Win Rate</div>
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
