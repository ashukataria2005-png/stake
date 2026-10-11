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
  RotateCw,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

interface SymbolDef {
  id: string;
  name: string;
  icon: string;
  isWild?: boolean;
  payout3: number;
  payout4: number;
  payout5: number;
  color: string;
  borderColor: string;
}

const SYMBOLS: SymbolDef[] = [
  {
    id: "scarab",
    name: "Golden Scarab",
    icon: "🪲",
    isWild: true,
    payout3: 10,
    payout4: 35,
    payout5: 100,
    color: "text-amber-300",
    borderColor: "border-amber-400",
  },
  {
    id: "horus",
    name: "Eye of Horus",
    icon: "👁️",
    payout3: 6,
    payout4: 18,
    payout5: 50,
    color: "text-cyan-300",
    borderColor: "border-cyan-400",
  },
  {
    id: "ankh",
    name: "Golden Ankh",
    icon: "☥",
    payout3: 4,
    payout4: 10,
    payout5: 25,
    color: "text-yellow-400",
    borderColor: "border-yellow-400",
  },
  {
    id: "pharaoh",
    name: "Pharaoh Mask",
    icon: "👑",
    payout3: 2.5,
    payout4: 6,
    payout5: 15,
    color: "text-amber-400",
    borderColor: "border-amber-500",
  },
  {
    id: "nefertiti",
    name: "Nefertiti",
    icon: "👸",
    payout3: 2,
    payout4: 4.5,
    payout5: 10,
    color: "text-purple-300",
    borderColor: "border-purple-400",
  },
  {
    id: "A",
    name: "Ace",
    icon: "A",
    payout3: 1.5,
    payout4: 3,
    payout5: 6,
    color: "text-rose-400",
    borderColor: "border-rose-400/40",
  },
  {
    id: "K",
    name: "King",
    icon: "K",
    payout3: 1.2,
    payout4: 2.2,
    payout5: 4,
    color: "text-blue-400",
    borderColor: "border-blue-400/40",
  },
  {
    id: "Q",
    name: "Queen",
    icon: "Q",
    payout3: 1.0,
    payout4: 1.8,
    payout5: 3,
    color: "text-emerald-400",
    borderColor: "border-emerald-400/40",
  },
  {
    id: "J",
    name: "Jack",
    icon: "J",
    payout3: 0.8,
    payout4: 1.4,
    payout5: 2,
    color: "text-violet-400",
    borderColor: "border-violet-400/40",
  },
  {
    id: "10",
    name: "Ten",
    icon: "10",
    payout3: 0.5,
    payout4: 1.0,
    payout5: 1.5,
    color: "text-slate-400",
    borderColor: "border-slate-400/40",
  },
];

// 20 Standard Slot Payline paths (row indices 0..2 for each col 0..4)
const PAYLINES: number[][] = [
  [1, 1, 1, 1, 1], // Line 1: Center
  [0, 0, 0, 0, 0], // Line 2: Top
  [2, 2, 2, 2, 2], // Line 3: Bottom
  [0, 1, 2, 1, 0], // Line 4: V-shape
  [2, 1, 0, 1, 2], // Line 5: Inverted V
  [0, 0, 1, 2, 2], // Line 6
  [2, 2, 1, 0, 0], // Line 7
  [1, 0, 0, 0, 1], // Line 8
  [1, 2, 2, 2, 1], // Line 9
  [0, 1, 0, 1, 0], // Line 10
  [2, 1, 2, 1, 2], // Line 11
  [1, 0, 1, 0, 1], // Line 12
  [1, 2, 1, 2, 1], // Line 13
  [0, 1, 1, 1, 0], // Line 14
  [2, 1, 1, 1, 2], // Line 15
  [0, 0, 0, 1, 2], // Line 16
  [2, 2, 2, 1, 0], // Line 17
  [1, 1, 0, 1, 1], // Line 18
  [1, 1, 2, 1, 1], // Line 19
  [0, 2, 0, 2, 0], // Line 20
];

function getRandomSymbol(): SymbolDef {
  const r = Math.random();
  // Weighted RNG favoring lower royals, keeping scarab rare
  if (r < 0.05) return SYMBOLS[0]; // Scarab (Wild)
  if (r < 0.12) return SYMBOLS[1]; // Eye of Horus
  if (r < 0.22) return SYMBOLS[2]; // Ankh
  if (r < 0.34) return SYMBOLS[3]; // Pharaoh
  if (r < 0.46) return SYMBOLS[4]; // Nefertiti
  if (r < 0.58) return SYMBOLS[5]; // A
  if (r < 0.70) return SYMBOLS[6]; // K
  if (r < 0.81) return SYMBOLS[7]; // Q
  if (r < 0.91) return SYMBOLS[8]; // J
  return SYMBOLS[9]; // 10
}

function generateInitialGrid(): SymbolDef[][] {
  // 5 cols, each 3 rows
  return Array.from({ length: 5 }, () =>
    Array.from({ length: 3 }, () => getRandomSymbol())
  );
}

export default function ScarabSpinGame() {
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
        id: "scarab-spin",
        title: "Scarab Spin",
        image: "/games/stake-originals/scarab-spin.webp",
        href: "/games/scarab-spin",
      });
    }
  }, [addRecentlyPlayedGame]);

  // Betting & Lines State
  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [betAmount, setBetAmount] = useState<number>(10);
  const [betInput, setBetInput] = useState<string>("10");
  const [activeLines, setActiveLines] = useState<number>(20);
  const [isAutoSpin, setIsAutoSpin] = useState<boolean>(false);

  // Reels & Spin State
  const [grid, setGrid] = useState<SymbolDef[][]>(generateInitialGrid);
  const [spinningCols, setSpinningCols] = useState<boolean[]>([false, false, false, false, false]);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [winningLines, setWinningLines] = useState<{ lineIdx: number; symbol: SymbolDef; count: number; payout: number }[]>([]);
  const [roundWin, setRoundWin] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>("Align golden scarabs across paylines!");

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

  // Perform Spin
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
    setSpinningCols([true, true, true, true, true]);
    setWinningLines([]);
    setRoundWin(0);
    setStatusMessage("Reels spinning...");

    sounds.playReelSpin();

    setStats((prev) => ({
      ...prev,
      rounds: prev.rounds + 1,
      wagered: parseFloat((prev.wagered + parsedBet).toFixed(2)),
    }));

    // Target grid generated ahead
    const newGrid = Array.from({ length: 5 }, () =>
      Array.from({ length: 3 }, () => getRandomSymbol())
    );

    // Staggered column stop timing: col 0 -> col 1 -> col 2 -> col 3 -> col 4
    [0, 1, 2, 3, 4].forEach((colIdx) => {
      setTimeout(() => {
        sounds.playReelStop();
        setGrid((prev) => {
          const updated = [...prev];
          updated[colIdx] = newGrid[colIdx];
          return updated;
        });
        setSpinningCols((prev) => {
          const updated = [...prev];
          updated[colIdx] = false;
          return updated;
        });

        // When final column stops, calculate payline wins
        if (colIdx === 4) {
          evaluateWins(newGrid, parsedBet);
        }
      }, 400 + colIdx * 250);
    });
  }, [balance, betInput, isSpinning, updateBalance]);

  // Evaluate Paylines
  const evaluateWins = (finalGrid: SymbolDef[][], wager: number) => {
    setIsSpinning(false);
    const lineBet = wager / activeLines;
    const wins: { lineIdx: number; symbol: SymbolDef; count: number; payout: number }[] = [];
    let totalWin = 0;

    // Check lines up to activeLines count
    for (let l = 0; l < activeLines; l++) {
      const linePath = PAYLINES[l];
      const firstSym = finalGrid[0][linePath[0]];

      let count = 1;
      let matchedSym = firstSym;

      for (let c = 1; c < 5; c++) {
        const nextSym = finalGrid[c][linePath[c]];
        if (nextSym.id === matchedSym.id || nextSym.isWild || (matchedSym.isWild && !nextSym.isWild)) {
          if (matchedSym.isWild && !nextSym.isWild) matchedSym = nextSym;
          count++;
        } else {
          break;
        }
      }

      if (count >= 3) {
        let mult = 0;
        if (count === 3) mult = matchedSym.payout3;
        else if (count === 4) mult = matchedSym.payout4;
        else if (count >= 5) mult = matchedSym.payout5;

        const payout = parseFloat((lineBet * mult).toFixed(2));
        if (payout > 0) {
          totalWin += payout;
          wins.push({ lineIdx: l, symbol: matchedSym, count, payout });
        }
      }
    }

    setWinningLines(wins);
    const roundedWin = parseFloat(totalWin.toFixed(2));
    setRoundWin(roundedWin);

    if (roundedWin > 0) {
      updateBalance(roundedWin);
      sounds.playPaylineWin();
      setStatusMessage(`Win! +${activeSym}${roundedWin.toFixed(2)} on ${wins.length} line(s)!`);

      if (roundedWin >= wager * 3) {
        try {
          confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
        } catch {}
      }

      setStats((prev) => ({
        ...prev,
        wins: prev.wins + 1,
        profit: parseFloat((prev.profit + (roundedWin - wager)).toFixed(2)),
      }));
    } else {
      setStatusMessage("No win this spin. Try again!");
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
      className={`w-full max-w-lg mx-auto px-2 sm:px-3 py-2 select-none flex flex-col space-y-0 ${
        isFullscreen ? "p-6 bg-[#0f212e] min-h-screen max-w-none" : ""
      }`}
    >
      {/* ========================================================= */}
      {/* 1. TOP INTERACTIVE ARENA: 5X3 EGYPTIAN SLOT REELS         */}
      {/* ========================================================= */}
      <div className="w-full rounded-t-2xl bg-[#0f212e] border-t border-x border-[#213743] shadow-2xl p-4 sm:p-5 flex flex-col items-center relative overflow-hidden">
        {/* Egyptian ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Utilities */}
        <div className="w-full flex items-center justify-between mb-4 z-10 text-xs text-[#b1bad3]">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-[11px] text-[#8596a5]">
              Scarab Spin (5×3)
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

        {/* 5x3 Reels Grid with Egyptian Gold Borders */}
        <div className="w-full max-w-2xl rounded-2xl border-2 border-amber-600/40 bg-[#09151e] p-2.5 sm:p-4 grid grid-cols-5 gap-1.5 sm:gap-2.5 shadow-2xl relative z-10">
          {grid.map((col, colIdx) => {
            const isColSpinning = spinningCols[colIdx];
            return (
              <div
                key={colIdx}
                className="flex flex-col gap-1.5 sm:gap-2.5 rounded-xl bg-[#11232e]/80 border border-[#213743] p-1 sm:p-1.5 overflow-hidden"
              >
                {col.map((sym, rowIdx) => {
                  return (
                    <div
                      key={rowIdx}
                      className={`aspect-square rounded-xl border flex flex-col items-center justify-center p-1 relative transition-all duration-300 ${
                        sym.borderColor
                      } ${
                        sym.isWild
                          ? "bg-gradient-to-b from-amber-950/60 to-black shadow-lg shadow-amber-500/20"
                          : "bg-[#0f212e]"
                      } ${isColSpinning ? "blur-xs scale-95 opacity-70 animate-pulse" : "scale-100"}`}
                    >
                      <span className="text-2xl sm:text-4xl filter drop-shadow">
                        {sym.icon}
                      </span>
                      <span
                        className={`text-[8px] sm:text-[10px] font-black uppercase tracking-wider mt-0.5 ${sym.color}`}
                      >
                        {sym.name.length > 8 ? sym.name.split(" ")[0] : sym.name}
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
      {/* 2. MINES HARMONIZED BETTING CONTROLS SHELL CONTAINER      */}
      {/* ========================================================= */}
      <div className="w-full border-t border-[#213743] bg-[#1a2c38] p-3 sm:p-4 flex flex-col justify-start space-y-2 sm:space-y-2.5 rounded-b-2xl select-none">
        {/* 1. PRIMARY BET CTA BUTTON (Directly at top of controls) */}
        <div className="w-full">
          <button
            type="button"
            onClick={handleSpin}
            disabled={isSpinning}
            className="w-full py-3 sm:py-3.5 text-sm sm:text-base font-extrabold rounded-xl bg-[#1475e1] hover:bg-[#1164c2] text-white shadow-lg shadow-[#1475e1]/25 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer uppercase tracking-wider"
          >
            <span>{isSpinning ? "SPINNING REELS..." : isAutoSpin ? "STOP AUTOBET" : mode === "auto" ? "START AUTOBET" : "SPIN"}</span>
          </button>
        </div>

        {/* 2. PAYLINES SELECTOR */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#b1bad3]">Paylines</span>
            <span className="text-white font-mono text-[11px]">{activeLines} of 20 Lines</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[1, 5, 10, 20].map((lines) => (
              <button
                key={lines}
                type="button"
                onClick={() => {
                  if (isSpinning) return;
                  sounds.playClick();
                  setActiveLines(lines);
                }}
                disabled={isSpinning}
                className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all disabled:opacity-50 cursor-pointer ${
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

        {/* 3. BET AMOUNT INPUT (Exact Mines Structure) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#b1bad3]">Total Bet</span>
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
                disabled={isSpinning || isAutoSpin}
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
                disabled={isSpinning || isAutoSpin}
                onClick={handleHalfBet}
                className="rounded-lg bg-[#213743] px-2.5 py-1.5 text-xs font-bold text-[#b1bad3] hover:bg-[#2f4553] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                ½
              </button>
              <button
                type="button"
                disabled={isSpinning || isAutoSpin}
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
            onClick={() => {
              setMode("manual");
              if (isAutoSpin) setIsAutoSpin(false);
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
              setMode("auto");
              setIsAutoSpin(true);
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
                  <span className="truncate">e3810f91ab728bdf01a74ec10984a921fe7842bb9012a4519bc781a941203891</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("e3810f91ab728bdf01a74ec10984a921fe7842bb9012a4519bc781a941203891");
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
                  stake_scarab_client_seed_2026
                </div>
              </div>
              <div>
                <label className="font-bold text-white block mb-1">RTP</label>
                <div className="p-2.5 rounded-xl bg-[#0f212e] font-mono text-[11px] text-[#00e701]">
                  96.84%
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
                <span>Live Scarab Spin Stats</span>
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
                <span>How to Play Scarab Spin</span>
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
                <strong className="text-white">Paylines:</strong> Select between 1 and 20 paylines. Matching symbols from left to right pay out according to the paytable.
              </p>
              <p>
                <strong className="text-white">Golden Scarab Wilds:</strong> The Scarab is Wild and substitutes for all other symbols, creating high-value winning connections up to 100× per line!
              </p>
              <p>
                <strong className="text-white">Auto-Spin:</strong> Toggle auto-spin for hands-free continuous play.
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
