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
  RotateCw,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

interface BarSymbol {
  id: string;
  name: string;
  icon: string;
  isBar?: boolean;
  payout3: number;
  color: string;
  badgeBg: string;
}

const BAR_SYMBOLS: BarSymbol[] = [
  {
    id: "seven",
    name: "Lucky 7",
    icon: "7️⃣",
    payout3: 1000,
    color: "text-red-500",
    badgeBg: "bg-red-500/20 border-red-500",
  },
  {
    id: "bar3",
    name: "Triple BAR",
    icon: "3️⃣BAR",
    isBar: true,
    payout3: 500,
    color: "text-amber-400",
    badgeBg: "bg-amber-500/20 border-amber-400",
  },
  {
    id: "bar2",
    name: "Double BAR",
    icon: "2️⃣BAR",
    isBar: true,
    payout3: 200,
    color: "text-amber-300",
    badgeBg: "bg-amber-500/15 border-amber-400/80",
  },
  {
    id: "bar1",
    name: "Single BAR",
    icon: "1️⃣BAR",
    isBar: true,
    payout3: 100,
    color: "text-amber-200",
    badgeBg: "bg-amber-500/10 border-amber-400/60",
  },
  {
    id: "bell",
    name: "Golden Bell",
    icon: "🔔",
    payout3: 30,
    color: "text-yellow-300",
    badgeBg: "bg-yellow-500/20 border-yellow-400",
  },
  {
    id: "cherry",
    name: "Cherry",
    icon: "🍒",
    payout3: 20,
    color: "text-rose-400",
    badgeBg: "bg-rose-500/20 border-rose-400",
  },
];

// 5 Vintage Mechanical Lines
const MECHANICAL_LINES: number[][] = [
  [1, 1, 1], // Center Horizontal
  [0, 0, 0], // Top Horizontal
  [2, 2, 2], // Bottom Horizontal
  [0, 1, 2], // Diagonal \
  [2, 1, 0], // Diagonal /
];

function getRandomBarSymbol(): BarSymbol {
  const r = Math.random();
  if (r < 0.04) return BAR_SYMBOLS[0]; // Lucky 7 (Rare)
  if (r < 0.12) return BAR_SYMBOLS[1]; // 3x BAR
  if (r < 0.24) return BAR_SYMBOLS[2]; // 2x BAR
  if (r < 0.42) return BAR_SYMBOLS[3]; // 1x BAR
  if (r < 0.65) return BAR_SYMBOLS[4]; // Bell
  return BAR_SYMBOLS[5]; // Cherry
}

function generateInitialBarGrid(): BarSymbol[][] {
  return Array.from({ length: 3 }, () =>
    Array.from({ length: 3 }, () => getRandomBarSymbol())
  );
}

export default function BarsGame() {
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
        id: "bars",
        title: "Bars",
        image: "/games/stake-originals/bars.webp",
        href: "/games/bars",
      });
    }
  }, [addRecentlyPlayedGame]);

  // Betting & Mode State
  const [betAmount, setBetAmount] = useState<number>(10);
  const [betInput, setBetInput] = useState<string>("10");
  const [activeLines, setActiveLines] = useState<number>(5);
  const [isAutoSpin, setIsAutoSpin] = useState<boolean>(false);

  // Mechanical Stepper Reels State
  const [grid, setGrid] = useState<BarSymbol[][]>(generateInitialBarGrid);
  const [spinningCols, setSpinningCols] = useState<boolean[]>([false, false, false]);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [roundWin, setRoundWin] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>("Pull the mechanical handle!");

  // Settings & Modals
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showFairnessModal, setShowFairnessModal] = useState<boolean>(false);
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [copiedSeed, setCopiedSeed] = useState<boolean>(false);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // Statistics
  const [stats, setStats] = useState({
    rounds: 0,
    wins: 0,
    losses: 0,
    wagered: 0,
    profit: 0,
  });

  // Bet modifiers
  const handleHalfBet = () => {
    if (isSpinning) return;
    sounds.playClick();
    const next = Math.max(0.01, parseFloat((betAmount / 2).toFixed(2)));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  const handleDoubleBet = () => {
    if (isSpinning) return;
    sounds.playClick();
    const next = parseFloat((betAmount * 2).toFixed(2));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  const handleMaxBet = () => {
    if (isSpinning) return;
    sounds.playClick();
    const next = Math.max(0.01, parseFloat(balance.toFixed(2)));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  // Mechanical Spin
  const handleSpin = useCallback(() => {
    if (isSpinning) return;

    const parsedBet = parseFloat(betInput) || 1;
    if (parsedBet > balance) {
      alert("Insufficient balance! Please use the Wallet button.");
      setIsAutoSpin(false);
      return;
    }

    updateBalance(-parsedBet);
    setBetAmount(parsedBet);
    setIsSpinning(true);
    setSpinningCols([true, true, true]);
    setRoundWin(0);
    setStatusMessage("Mechanical reels spinning...");

    sounds.playReelSpin();

    setStats((prev) => ({
      ...prev,
      rounds: prev.rounds + 1,
      wagered: parseFloat((prev.wagered + parsedBet).toFixed(2)),
    }));

    // Target grid
    const targetGrid = Array.from({ length: 3 }, () =>
      Array.from({ length: 3 }, () => getRandomBarSymbol())
    );

    // Staggered stepper stops: Reel 1 -> Reel 2 -> Reel 3
    [0, 1, 2].forEach((colIdx) => {
      setTimeout(() => {
        sounds.playReelStop();
        setGrid((prev) => {
          const updated = [...prev];
          updated[colIdx] = targetGrid[colIdx];
          return updated;
        });
        setSpinningCols((prev) => {
          const updated = [...prev];
          updated[colIdx] = false;
          return updated;
        });

        if (colIdx === 2) {
          evaluateBarWins(targetGrid, parsedBet);
        }
      }, 450 + colIdx * 300);
    });
  }, [balance, betInput, isSpinning, updateBalance]);

  // Evaluate 3-Reel Classic Wins
  const evaluateBarWins = (finalGrid: BarSymbol[][], wager: number) => {
    setIsSpinning(false);
    const lineBet = wager / activeLines;
    let totalWin = 0;

    for (let l = 0; l < activeLines; l++) {
      const line = MECHANICAL_LINES[l];
      const s0 = finalGrid[0][line[0]];
      const s1 = finalGrid[1][line[1]];
      const s2 = finalGrid[2][line[2]];

      // 3 matching identical symbols
      if (s0.id === s1.id && s1.id === s2.id) {
        totalWin += lineBet * s0.payout3;
      }
      // Any 3 BARs combination (e.g. 1-BAR, 2-BAR, 3-BAR)
      else if (s0.isBar && s1.isBar && s2.isBar) {
        totalWin += lineBet * 50;
      }
      // Cherry partial scatter / line rules
      else if (s0.id === "cherry" && s1.id === "cherry") {
        totalWin += lineBet * 5;
      } else if (s0.id === "cherry") {
        totalWin += lineBet * 2;
      }
    }

    const rounded = parseFloat(totalWin.toFixed(2));
    setRoundWin(rounded);

    if (rounded > 0) {
      updateBalance(rounded);
      sounds.playVintageBell();

      if (rounded >= wager * 10) {
        sounds.playJackpotSiren();
        setStatusMessage(`🚨 JACKPOT! +${activeSym}${rounded.toFixed(2)} (${(rounded / wager).toFixed(0)}×)!`);
        try {
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        } catch {}
      } else {
        setStatusMessage(`WINNER! +${activeSym}${rounded.toFixed(2)}!`);
      }

      setStats((prev) => ({
        ...prev,
        wins: prev.wins + 1,
        profit: parseFloat((prev.profit + (rounded - wager)).toFixed(2)),
      }));
    } else {
      setStatusMessage("No match. Pull the handle again!");
      setStats((prev) => ({
        ...prev,
        losses: prev.losses + 1,
        profit: parseFloat((prev.profit - wager).toFixed(2)),
      }));
    }
  };

  // Auto-Spin execution loop
  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;
    if (isAutoSpin && !isSpinning) {
      timeout = setTimeout(() => {
        handleSpin();
      }, 700);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isAutoSpin, isSpinning, handleSpin]);

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
      className="flex flex-col items-center w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 select-none"
    >
      {/* ========================================================= */}
      {/* 1. TOP INTERACTIVE ARENA: VINTAGE MECHANICAL 3-REEL SLOT   */}
      {/* ========================================================= */}
      <div className="w-full rounded-2xl bg-[#0c1a24] border-2 border-[#ffb300]/30 shadow-2xl p-4 sm:p-6 flex flex-col items-center relative overflow-hidden">
        {/* Retro golden neon glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Utilities */}
        <div className="w-full flex items-center justify-between mb-3 z-10 text-xs text-[#b1bad3]">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-[11px] text-[#ffb300]">
              Bars (Classic 3×3)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono font-bold text-[10px]">
              {activeLines} Lines
            </span>
            {roundWin > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#00e701]/10 border border-[#00e701]/30 text-[#00e701] font-mono font-bold text-[10px]">
                +{activeSym}{roundWin.toFixed(2)}
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

        {/* Vintage Neon Marquee Paytable */}
        <div className="w-full max-w-lg mb-3 rounded-xl border border-amber-500/30 bg-[#07131b] p-2 flex items-center justify-around z-10 text-[10px] font-mono">
          <div className="text-center">
            <span className="text-red-400 font-bold block">7️⃣7️⃣7️⃣</span>
            <span className="text-white font-black">1000×</span>
          </div>
          <div className="text-center">
            <span className="text-amber-400 font-bold block">3️⃣BAR</span>
            <span className="text-white font-black">500×</span>
          </div>
          <div className="text-center">
            <span className="text-amber-300 font-bold block">2️⃣BAR</span>
            <span className="text-white font-black">200×</span>
          </div>
          <div className="text-center">
            <span className="text-amber-200 font-bold block">1️⃣BAR</span>
            <span className="text-white font-black">100×</span>
          </div>
          <div className="text-center">
            <span className="text-yellow-300 font-bold block">ANY BAR</span>
            <span className="text-[#00e701] font-black">50×</span>
          </div>
        </div>

        {/* 3x3 Stepper Reel Cabinet with Chrome Frame */}
        <div className="w-full max-w-md rounded-2xl border-4 border-slate-600 bg-gradient-to-b from-slate-800 to-black p-3 sm:p-5 grid grid-cols-3 gap-2 sm:gap-3 shadow-2xl relative z-10">
          {grid.map((col, colIdx) => {
            const isColSpinning = spinningCols[colIdx];
            return (
              <div
                key={colIdx}
                className="flex flex-col gap-2 rounded-xl bg-gradient-to-b from-white to-slate-200 border-2 border-slate-400 p-2 overflow-hidden shadow-inner"
              >
                {col.map((sym, rowIdx) => {
                  return (
                    <div
                      key={rowIdx}
                      className={`aspect-square rounded-lg flex flex-col items-center justify-center p-1 border shadow transition-all duration-200 ${
                        sym.badgeBg
                      } ${isColSpinning ? "blur-xs scale-90 opacity-70 animate-pulse" : "scale-100"}`}
                    >
                      <span className="text-3xl sm:text-4xl filter drop-shadow">
                        {sym.icon}
                      </span>
                      <span className={`text-[9px] font-black uppercase tracking-wider ${sym.color}`}>
                        {sym.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Outcome Banner */}
        <div className="h-8 flex items-center justify-center mt-3 z-10">
          {roundWin > 0 ? (
            <span className="text-sm font-black font-mono text-[#00e701] flex items-center gap-1.5 animate-bounce">
              <Sparkles className="h-4 w-4" />
              {statusMessage}
            </span>
          ) : (
            <span className="text-xs font-bold text-[#b1bad3]">{statusMessage}</span>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. BOTTOM CONTROLS (Directly Beneath 3-Reel Cabinet)       */}
      {/* ========================================================= */}
      <div className="w-full mt-4 rounded-2xl bg-[#1a2c38] border border-[#213743] p-4 sm:p-5 flex flex-col gap-4 shadow-xl">
        {/* Paylines & Auto-Spin Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Active Lines Selector */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-[#b1bad3]">
              <span>Mechanical Paylines</span>
              <span className="text-white font-mono">{activeLines} of 5 Lines</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map((lines) => (
                <button
                  key={lines}
                  onClick={() => {
                    if (isSpinning) return;
                    sounds.playClick();
                    setActiveLines(lines);
                  }}
                  disabled={isSpinning}
                  className={`py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all disabled:opacity-50 cursor-pointer ${
                    activeLines === lines
                      ? "bg-amber-500/20 border-amber-400 text-amber-300"
                      : "bg-[#0f212e] border-[#213743] text-[#b1bad3] hover:text-white"
                  }`}
                >
                  {lines}L
                </button>
              ))}
            </div>
          </div>

          {/* Auto-Spin Toggle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-[#b1bad3]">Spin Mode</label>
            <button
              onClick={() => {
                sounds.playClick();
                setIsAutoSpin(!isAutoSpin);
              }}
              className={`py-2 rounded-xl text-xs font-black uppercase tracking-wider border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isAutoSpin
                  ? "bg-rose-500/20 border-rose-400 text-rose-300"
                  : "bg-[#0f212e] border-[#213743] text-[#b1bad3] hover:text-white"
              }`}
            >
              <RotateCw className={`h-3.5 w-3.5 ${isAutoSpin ? "animate-spin" : ""}`} />
              <span>{isAutoSpin ? "Stop Auto-Spin" : "Enable Auto-Spin"}</span>
            </button>
          </div>
        </div>

        {/* Bet Amount Input & Quick Modifiers */}
        <div className="w-full flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-[#b1bad3]">
            <span>Total Bet</span>
            <span>
              Balance: <span className="text-white font-mono">{activeSym}{balance.toFixed(2)}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <div className="sm:col-span-2 relative flex items-center">
              <span className="absolute left-3 text-sm font-bold text-[#8596a5]">
                {activeSym}
              </span>
              <input
                type="number"
                step="any"
                disabled={isSpinning || isAutoSpin}
                value={betInput}
                onChange={(e) => {
                  setBetInput(e.target.value);
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val) && val >= 0) setBetAmount(val);
                }}
                className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-[#0f212e] border border-[#213743] text-white font-mono font-bold text-sm focus:outline-none focus:border-[#00e701] disabled:opacity-50"
              />
            </div>

            <div className="sm:col-span-2 grid grid-cols-3 gap-1.5">
              <button
                onClick={handleHalfBet}
                disabled={isSpinning || isAutoSpin}
                className="py-2.5 rounded-xl bg-[#213743] hover:bg-[#2f4553] text-[#b1bad3] hover:text-white font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                ½
              </button>
              <button
                onClick={handleDoubleBet}
                disabled={isSpinning || isAutoSpin}
                className="py-2.5 rounded-xl bg-[#213743] hover:bg-[#2f4553] text-[#b1bad3] hover:text-white font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                2×
              </button>
              <button
                onClick={handleMaxBet}
                disabled={isSpinning || isAutoSpin}
                className="py-2.5 rounded-xl bg-[#213743] hover:bg-[#2f4553] text-[#b1bad3] hover:text-white font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                Max
              </button>
            </div>
          </div>
        </div>

        {/* Stake Green Spin CTA Button */}
        <button
          onClick={handleSpin}
          disabled={isSpinning}
          className="w-full py-4 rounded-xl bg-[#00e701] hover:bg-[#00c701] active:scale-[0.99] text-[#011e01] font-black text-sm sm:text-base uppercase tracking-wider shadow-lg shadow-[#00e701]/25 transition-all disabled:opacity-50 cursor-pointer mt-1"
        >
          {isSpinning ? "Stepping Mechanical Reels..." : "Spin"}
        </button>
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
                  <span className="truncate">cc90184bfe8127da019842bc0912ab74519bc781a94120389140fa28913c19b0</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("cc90184bfe8127da019842bc0912ab74519bc781a94120389140fa28913c19b0");
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
                  stake_bars_client_seed_2026
                </div>
              </div>
              <div>
                <label className="font-bold text-white block mb-1">RTP</label>
                <div className="p-2.5 rounded-xl bg-[#0f212e] font-mono text-[11px] text-[#00e701]">
                  97.00%
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
                <span>Live Bars Stats</span>
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
                <div className="text-[11px] font-bold text-[#b1bad3]">Spins</div>
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
                <span>How to Play Bars</span>
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
                <strong className="text-white">Mechanical Stepper 3×3:</strong> Authentic retro 3-reel slot. Align 3 matching symbols on any active payline to win!
              </p>
              <p>
                <strong className="text-white">Any BAR Payline:</strong> Any mixture of 3 BAR symbols (1-BAR, 2-BAR, or 3-BAR) pays 50× line bet!
              </p>
              <p>
                <strong className="text-white">Lucky 7s Jackpot:</strong> 3 Lucky Red 7s across any payline awards the massive 1,000× jackpot!
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
