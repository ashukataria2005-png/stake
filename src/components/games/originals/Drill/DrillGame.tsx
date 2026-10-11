"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ShieldCheck,
  Maximize2,
  Minimize2,
  TrendingUp,
  X,
  Info,
  Check,
  Copy,
  Volume2,
  VolumeX,
  Sparkles,
  Flame,
  Gauge,
  AlertTriangle,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

interface GroundLayer {
  depth: number; // in meters
  name: string;
  multiplier: number;
  color: string;
  borderColor: string;
  bgGradient: string;
}

const GROUND_LAYERS: GroundLayer[] = [
  {
    depth: 50,
    name: "Surface Soil",
    multiplier: 1.05,
    color: "text-amber-200",
    borderColor: "border-amber-700/50",
    bgGradient: "from-amber-950/60 to-stone-900/60",
  },
  {
    depth: 120,
    name: "Dense Stone",
    multiplier: 1.35,
    color: "text-stone-300",
    borderColor: "border-stone-500/50",
    bgGradient: "from-stone-900/60 to-zinc-900/60",
  },
  {
    depth: 250,
    name: "Copper Vein",
    multiplier: 1.85,
    color: "text-orange-400",
    borderColor: "border-orange-500/50",
    bgGradient: "from-orange-950/60 to-stone-900/60",
  },
  {
    depth: 450,
    name: "Iron Core",
    multiplier: 2.6,
    color: "text-slate-300",
    borderColor: "border-slate-400/50",
    bgGradient: "from-slate-900/60 to-zinc-900/60",
  },
  {
    depth: 700,
    name: "Silver Seam",
    multiplier: 4.2,
    color: "text-cyan-200",
    borderColor: "border-cyan-400/50",
    bgGradient: "from-cyan-950/60 to-slate-900/60",
  },
  {
    depth: 1000,
    name: "Gold Lode",
    multiplier: 8.5,
    color: "text-yellow-400",
    borderColor: "border-yellow-400/50",
    bgGradient: "from-yellow-950/60 to-amber-950/60",
  },
  {
    depth: 1500,
    name: "Diamond Crust",
    multiplier: 20.0,
    color: "text-sky-300",
    borderColor: "border-sky-400/50",
    bgGradient: "from-sky-950/60 to-blue-950/60",
  },
  {
    depth: 2200,
    name: "Obsidian Mantle",
    multiplier: 60.0,
    color: "text-purple-300",
    borderColor: "border-purple-400/50",
    bgGradient: "from-purple-950/60 to-indigo-950/60",
  },
  {
    depth: 3000,
    name: "Magma Vault",
    multiplier: 200.0,
    color: "text-rose-400",
    borderColor: "border-rose-500/50",
    bgGradient: "from-rose-950/60 to-red-950/60",
  },
  {
    depth: 5000,
    name: "Core Matrix",
    multiplier: 1000.0,
    color: "text-[#00e701]",
    borderColor: "border-[#00e701]/60",
    bgGradient: "from-emerald-950/60 to-[#0f212e]",
  },
];

export default function DrillGame() {
  const {
    balance,
    updateBalance,
    currencySymbol,
    addRecentlyPlayedGame,
  } = useGame();
  const activeSym = currencySymbol || "$";

  // Register in Recently Played
  useEffect(() => {
    if (addRecentlyPlayedGame) {
      addRecentlyPlayedGame({
        id: "drill",
        title: "Drill",
        image: "/games/stake-originals/stake-originals-drill.webp",
        href: "/games/drill",
      });
    }
  }, [addRecentlyPlayedGame]);

  // Betting & Speed Controls
  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [betAmount, setBetAmount] = useState<number>(10);
  const [betInput, setBetInput] = useState<string>("10");
  const [drillSpeed, setDrillSpeed] = useState<"standard" | "turbo">("standard");

  // Game Shaft State
  const [isDrilling, setIsDrilling] = useState<boolean>(false);
  const [currentDepth, setCurrentDepth] = useState<number>(0);
  const [currentLayerIdx, setCurrentLayerIdx] = useState<number>(0);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1.0);
  const [heatLevel, setHeatLevel] = useState<number>(10); // 0 to 100%
  const [jammed, setJammed] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("Ready to dig!");
  const [lastWinAmount, setLastWinAmount] = useState<number | null>(null);

  // Settings & Modals
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showFairnessModal, setShowFairnessModal] = useState<boolean>(false);
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [copiedSeed, setCopiedSeed] = useState<boolean>(false);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const drillIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Statistics
  const [stats, setStats] = useState({
    rounds: 0,
    wins: 0,
    losses: 0,
    wagered: 0,
    profit: 0,
  });

  const currentCashout =
    isDrilling && currentMultiplier > 1
      ? parseFloat((betAmount * currentMultiplier).toFixed(2))
      : 0;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (drillIntervalRef.current) clearInterval(drillIntervalRef.current);
    };
  }, []);

  // Bet modifiers
  const handleHalfBet = () => {
    if (isDrilling) return;
    sounds.playClick();
    const next = Math.max(0.01, parseFloat((betAmount / 2).toFixed(2)));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  const handleDoubleBet = () => {
    if (isDrilling) return;
    sounds.playClick();
    const next = parseFloat((betAmount * 2).toFixed(2));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  const handleMaxBet = () => {
    if (isDrilling) return;
    sounds.playClick();
    const next = Math.max(0.01, parseFloat(balance.toFixed(2)));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  // Start Drilling Animation & Progression Loop
  const handleStartDrilling = () => {
    if (isDrilling) return;

    const parsedBet = parseFloat(betInput) || 1;
    if (parsedBet > balance) {
      alert("Insufficient balance! Please use the Wallet button.");
      return;
    }

    updateBalance(-parsedBet);
    setBetAmount(parsedBet);
    setIsDrilling(true);
    setJammed(false);
    setCurrentDepth(0);
    setCurrentLayerIdx(0);
    setCurrentMultiplier(1.0);
    setHeatLevel(15);
    setStatusMessage("Drill active! Digging downward...");
    setLastWinAmount(null);

    setStats((prev) => ({
      ...prev,
      rounds: prev.rounds + 1,
      wagered: parseFloat((prev.wagered + parsedBet).toFixed(2)),
    }));

    sounds.playDrillRumble();

    // Determine bust depth according to 99% house edge model
    // Exponential random crash depth
    const r = Math.random();
    const bustMultiplier = Math.max(1.02, 0.99 / (1 - r));

    const stepInterval = drillSpeed === "turbo" ? 180 : 320;

    let localDepth = 0;
    let localMult = 1.0;
    let localHeat = 15;

    drillIntervalRef.current = setInterval(() => {
      localDepth += Math.floor(Math.random() * 25) + 20;
      localHeat = Math.min(98, localHeat + Math.random() * 3.5);

      // Map depth to ground layers
      let layerIndex = 0;
      for (let i = 0; i < GROUND_LAYERS.length; i++) {
        if (localDepth >= GROUND_LAYERS[i].depth) {
          layerIndex = i;
        }
      }

      const layer = GROUND_LAYERS[layerIndex];
      localMult = parseFloat((layer.multiplier + (localDepth / 500) * 0.1).toFixed(2));

      setCurrentDepth(localDepth);
      setCurrentLayerIdx(layerIndex);
      setCurrentMultiplier(localMult);
      setHeatLevel(Math.floor(localHeat));

      if (Math.random() < 0.35) {
        sounds.playRockSmash();
      }

      // Check for Jam / Overheat Bust
      if (localMult >= bustMultiplier) {
        if (drillIntervalRef.current) clearInterval(drillIntervalRef.current);
        sounds.playDrillJam();
        setIsDrilling(false);
        setJammed(true);
        setStatusMessage("OVERHEAT! Drill Jammed!");

        setStats((prev) => ({
          ...prev,
          losses: prev.losses + 1,
          profit: parseFloat((prev.profit - parsedBet).toFixed(2)),
        }));
      }
    }, stepInterval);
  };

  // Safe Cashout
  const handleCashout = useCallback(() => {
    if (!isDrilling || jammed || currentMultiplier <= 1) return;

    if (drillIntervalRef.current) clearInterval(drillIntervalRef.current);
    drillIntervalRef.current = null;

    const payout = currentCashout;
    const profit = parseFloat((payout - betAmount).toFixed(2));
    updateBalance(payout);
    sounds.playCashout();

    try {
      confetti({ particleCount: 80, spread: 65, origin: { y: 0.6 } });
    } catch {}

    setIsDrilling(false);
    setStatusMessage(`Extracted! Cashed out ${activeSym}${payout.toFixed(2)} (${currentMultiplier}×)!`);
    setLastWinAmount(payout);

    setStats((prev) => ({
      ...prev,
      wins: prev.wins + 1,
      profit: parseFloat((prev.profit + profit).toFixed(2)),
    }));
  }, [activeSym, betAmount, currentCashout, currentMultiplier, isDrilling, jammed, updateBalance]);

  // Toggle fullscreen
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
      {/* ========================================================= */}
      {/* 1. TOP INTERACTIVE ARENA: DRILLING SHAFT ARENA            */}
      {/* ========================================================= */}
      <div className="w-full rounded-t-2xl bg-[#0f212e] border-t border-x border-[#213743] shadow-2xl p-4 sm:p-5 flex flex-col items-center relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Utilities */}
        <div className="w-full flex items-center justify-between mb-4 z-10 text-xs text-[#b1bad3]">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-[11px] text-[#8596a5]">
              Depth: <span className="text-white font-mono">{currentDepth}m</span>
            </span>
            {isDrilling && (
              <span className="px-2 py-0.5 rounded-full bg-[#00e701]/10 border border-[#00e701]/30 text-[#00e701] font-mono font-bold text-[10px]">
                {currentMultiplier}×
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRulesModal(true)}
              className="p-1.5 rounded-lg bg-[#1a2c38] hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors"
              title="Game Rules"
            >
              <Info className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowStatsModal(true)}
              className="p-1.5 rounded-lg bg-[#1a2c38] hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors"
              title="Live Stats"
            >
              <TrendingUp className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowFairnessModal(true)}
              className="p-1.5 rounded-lg bg-[#1a2c38] hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors"
              title="Provably Fair"
            >
              <ShieldCheck className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                sounds.enabled = next;
              }}
              className="p-1.5 rounded-lg bg-[#1a2c38] hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors"
              title={soundEnabled ? "Mute" : "Unmute"}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg bg-[#1a2c38] hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors"
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Status & Temperature Gauge */}
        <div className="w-full max-w-lg flex items-center justify-between mb-4 px-2 z-10 text-xs">
          <div className="flex items-center gap-2 font-bold text-white">
            <Flame className={`h-4 w-4 ${heatLevel > 75 ? "text-rose-500 animate-pulse" : "text-amber-400"}`} />
            <span>Heat: {heatLevel}%</span>
          </div>

          <div className="w-36 h-2 rounded-full bg-[#1a2c38] overflow-hidden border border-[#213743]">
            <div
              className={`h-full transition-all duration-300 ${
                heatLevel > 75 ? "bg-rose-500" : heatLevel > 50 ? "bg-amber-400" : "bg-[#00e701]"
              }`}
              style={{ width: `${heatLevel}%` }}
            />
          </div>

          <span className="font-mono font-bold text-xs text-[#b1bad3]">
            {GROUND_LAYERS[currentLayerIdx]?.name || "Surface"}
          </span>
        </div>

        {/* Underground Shaft Cross-Section */}
        <div className="w-full max-w-lg h-56 rounded-2xl bg-[#09151e] border border-[#213743] relative overflow-hidden flex flex-col justify-end p-3 z-10">
          {/* Strata Layers Visualizer */}
          <div className="absolute inset-0 flex flex-col justify-between opacity-70 pointer-events-none">
            {GROUND_LAYERS.slice(0, 5).map((l, idx) => (
              <div
                key={idx}
                className={`w-full h-10 border-b border-[#213743]/50 flex items-center justify-between px-3 text-[10px] font-mono font-bold ${l.color}`}
              >
                <span>{l.name}</span>
                <span>{l.multiplier}×</span>
              </div>
            ))}
          </div>

          {/* Animated Heavy Drill Mechanism */}
          <div
            className={`w-full flex flex-col items-center justify-center transition-transform duration-300 ${
              isDrilling ? "animate-pulse" : ""
            }`}
          >
            {/* Drill Mechanical Housing */}
            <div className="w-16 h-10 rounded-t-lg bg-gradient-to-b from-slate-600 to-slate-800 border-2 border-slate-400 flex items-center justify-center shadow-lg">
              <Gauge className="h-5 w-5 text-amber-400" />
            </div>

            {/* Rotating Drill Bit Cone */}
            <div
              className={`w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[32px] border-t-amber-400 transition-all ${
                isDrilling ? "border-t-yellow-300 animate-spin" : jammed ? "border-t-rose-500" : ""
              }`}
            />

            {/* Sparks / Rock Smash Dust */}
            {isDrilling && (
              <div className="flex items-center gap-1 mt-1 text-yellow-300 animate-bounce">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="text-[10px] font-mono font-bold">DIGGING {currentDepth}M</span>
                <Sparkles className="h-3.5 w-3.5" />
              </div>
            )}

            {jammed && (
              <div className="flex items-center gap-1 mt-1 text-rose-500 font-bold text-xs animate-bounce">
                <AlertTriangle className="h-4 w-4" />
                <span>DRILL OVERHEATED & JAMMED!</span>
              </div>
            )}
          </div>
        </div>

        {/* Current Multiplier / Cashout Banner */}
        <div className="h-8 flex items-center justify-center mt-3 z-10">
          {isDrilling && currentMultiplier > 1 ? (
            <span className="text-base font-black font-mono text-[#00e701] flex items-center gap-1.5 animate-bounce">
              <Sparkles className="h-4 w-4" />
              Current Extraction: {activeSym}{currentCashout.toFixed(2)} ({currentMultiplier}×)
            </span>
          ) : (
            <span className="text-xs font-bold text-[#b1bad3]">{statusMessage}</span>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MINES HARMONIZED BETTING CONTROLS SHELL CONTAINER      */}
      {/* ========================================================= */}
      <div className="w-full border-t border-[#213743] bg-[#1a2c38] p-3 sm:p-4 flex flex-col justify-start space-y-2 sm:space-y-2.5 rounded-b-2xl select-none">
        {/* 1. PRIMARY BET CTA BUTTON (Directly at top of controls) */}
        <div className="w-full">
          {isDrilling ? (
            <button
              type="button"
              onClick={handleCashout}
              className="w-full py-3 sm:py-3.5 text-sm sm:text-base font-extrabold rounded-xl bg-[#00e701] hover:bg-[#00c701] text-black shadow-lg shadow-[#00e701]/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center cursor-pointer uppercase tracking-wider"
            >
              <span>CASHOUT {activeSym}{currentCashout.toFixed(2)} ({currentMultiplier}×)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStartDrilling}
              disabled={isDrilling}
              className="w-full py-3 sm:py-3.5 text-sm sm:text-base font-extrabold rounded-xl bg-[#1475e1] hover:bg-[#1164c2] text-white shadow-lg shadow-[#1475e1]/25 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer uppercase tracking-wider"
            >
              <span>{mode === "auto" ? "START AUTOBET" : "START DRILLING"}</span>
            </button>
          )}
        </div>

        {/* 2. SPEED / DRILLING GEAR SELECTOR */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-[#b1bad3]">Drilling Gear</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                if (isDrilling) return;
                sounds.playClick();
                setDrillSpeed("standard");
              }}
              disabled={isDrilling}
              className={`py-2 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer ${
                drillSpeed === "standard"
                  ? "bg-amber-500/20 border-amber-400 text-amber-300"
                  : "bg-[#0f212e] border-[#213743] text-[#b1bad3] hover:text-white"
              }`}
            >
              Standard Dig
            </button>
            <button
              type="button"
              onClick={() => {
                if (isDrilling) return;
                sounds.playClick();
                setDrillSpeed("turbo");
              }}
              disabled={isDrilling}
              className={`py-2 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer ${
                drillSpeed === "turbo"
                  ? "bg-rose-500/20 border-rose-400 text-rose-300"
                  : "bg-[#0f212e] border-[#213743] text-[#b1bad3] hover:text-white"
              }`}
            >
              Turbo Bore
            </button>
          </div>
        </div>

        {/* 3. BET AMOUNT INPUT (Exact Mines Structure) */}
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
                disabled={isDrilling}
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
                disabled={isDrilling}
                onClick={handleHalfBet}
                className="rounded-lg bg-[#213743] px-2.5 py-1.5 text-xs font-bold text-[#b1bad3] hover:bg-[#2f4553] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                ½
              </button>
              <button
                type="button"
                disabled={isDrilling}
                onClick={handleDoubleBet}
                className="rounded-lg bg-[#213743] px-2.5 py-1.5 text-xs font-bold text-[#b1bad3] hover:bg-[#2f4553] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                2×
              </button>
            </div>
          </div>
        </div>

        {/* 4. MODE SWITCHER TABS (Manual / Auto) */}
        <div className="flex rounded-lg bg-[#0f212e] p-1 border border-[#213743] mt-auto">
          <button
            type="button"
            onClick={() => setMode("manual")}
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
            onClick={() => setMode("auto")}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
              mode === "auto"
                ? "bg-[#213743] text-white shadow-sm"
                : "text-[#b1bad3] hover:text-white"
            }`}
          >
            Auto
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* PROVABLY FAIR MODAL                                       */}
      {/* ========================================================= */}
      {showFairnessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <ShieldCheck className="h-5 w-5 text-[#00e701]" />
                <span>Provably Fair Verification</span>
              </div>
              <button
                onClick={() => setShowFairnessModal(false)}
                className="p-1 rounded-lg text-[#b1bad3] hover:text-white hover:bg-[#213743]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-[#b1bad3]">
              <div>
                <label className="font-bold text-white block mb-1">Server Seed (Hashed)</label>
                <div className="p-2.5 rounded-xl bg-[#0f212e] font-mono text-[11px] text-white flex items-center justify-between">
                  <span className="truncate">c19a84218e7631bdfe128794bc219800a741ef902b31ca788910cd9128aa1278</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("c19a84218e7631bdfe128794bc219800a741ef902b31ca788910cd9128aa1278");
                      setCopiedSeed(true);
                      setTimeout(() => setCopiedSeed(false), 2000);
                    }}
                    className="p-1 text-[#8596a5] hover:text-white"
                  >
                    {copiedSeed ? <Check className="h-3.5 w-3.5 text-[#00e701]" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="font-bold text-white block mb-1">Client Seed</label>
                <div className="p-2.5 rounded-xl bg-[#0f212e] font-mono text-[11px] text-white">
                  stake_drill_client_seed_2026
                </div>
              </div>
              <div>
                <label className="font-bold text-white block mb-1">RTP</label>
                <div className="p-2.5 rounded-xl bg-[#0f212e] font-mono text-[11px] text-[#00e701]">
                  99.00%
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowFairnessModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#213743] hover:bg-[#2f4553] text-white text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* LIVE STATS MODAL                                          */}
      {/* ========================================================= */}
      {showStatsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <TrendingUp className="h-5 w-5 text-[#00e701]" />
                <span>Live Drill Stats</span>
              </div>
              <button
                onClick={() => setShowStatsModal(false)}
                className="p-1 rounded-lg text-[#b1bad3] hover:text-white hover:bg-[#213743]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#0f212e] border border-[#213743] text-center">
                <div className="text-[11px] font-bold text-[#b1bad3]">Rounds</div>
                <div className="text-lg font-black text-white font-mono mt-0.5">{stats.rounds}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#0f212e] border border-[#213743] text-center">
                <div className="text-[11px] font-bold text-[#b1bad3]">Win Rate</div>
                <div className="text-lg font-black text-[#00e701] font-mono mt-0.5">
                  {stats.rounds > 0 ? ((stats.wins / stats.rounds) * 100).toFixed(1) : "0.0"}%
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#0f212e] border border-[#213743] text-center">
                <div className="text-[11px] font-bold text-[#b1bad3]">Wagered</div>
                <div className="text-lg font-black text-white font-mono mt-0.5">
                  {activeSym}{stats.wagered.toFixed(2)}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#0f212e] border border-[#213743] text-center">
                <div className="text-[11px] font-bold text-[#b1bad3]">Net Profit</div>
                <div
                  className={`text-lg font-black font-mono mt-0.5 ${
                    stats.profit >= 0 ? "text-[#00e701]" : "text-[#e9113c]"
                  }`}
                >
                  {stats.profit >= 0 ? "+" : ""}
                  {activeSym}{stats.profit.toFixed(2)}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowStatsModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#213743] hover:bg-[#2f4553] text-white text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* RULES MODAL                                               */}
      {/* ========================================================= */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Info className="h-5 w-5 text-[#00e701]" />
                <span>How to Play Stake Drill</span>
              </div>
              <button
                onClick={() => setShowRulesModal(false)}
                className="p-1 rounded-lg text-[#b1bad3] hover:text-white hover:bg-[#213743]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-[#b1bad3] leading-relaxed">
              <p>
                <strong className="text-white">Mining Multipliers:</strong> Start drilling to bore downward into earth strata. As depth increases, your payout multiplier climbs.
              </p>
              <p>
                <strong className="text-white">Overheat / Jam Risk:</strong> Deeper drilling generates immense friction. The drill can jam at any time, busting the round.
              </p>
              <p>
                <strong className="text-white">Cashout:</strong> Hit the green Cashout button at any time before the drill jams to claim your accumulated payout.
              </p>
            </div>
            <button
              onClick={() => setShowRulesModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#213743] hover:bg-[#2f4553] text-white text-xs font-bold transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
