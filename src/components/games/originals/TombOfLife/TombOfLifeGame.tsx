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
  Zap,
  Flame,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

interface TombSymbol {
  id: string;
  name: string;
  icon: string;
  isWild?: boolean;
  isScatter?: boolean;
  payout3: number;
  payout4: number;
  payout5: number;
  color: string;
  glowColor: string;
}

const TOMB_SYMBOLS: TombSymbol[] = [
  {
    id: "mummy",
    name: "Wild Mummy",
    icon: "🧟",
    isWild: true,
    payout3: 15,
    payout4: 50,
    payout5: 150,
    color: "text-emerald-300",
    glowColor: "border-emerald-400 shadow-emerald-500/30",
  },
  {
    id: "anubis",
    name: "Anubis Scatter",
    icon: "🐕",
    isScatter: true,
    payout3: 5,
    payout4: 20,
    payout5: 100,
    color: "text-amber-400",
    glowColor: "border-amber-400 shadow-amber-500/30",
  },
  {
    id: "sarcophagus",
    name: "Sarcophagus",
    icon: "🏺",
    payout3: 8,
    payout4: 25,
    payout5: 75,
    color: "text-yellow-300",
    glowColor: "border-yellow-400 shadow-yellow-500/20",
  },
  {
    id: "amulet",
    name: "Ruby Amulet",
    icon: "🔮",
    payout3: 5,
    payout4: 15,
    payout5: 40,
    color: "text-rose-400",
    glowColor: "border-rose-400 shadow-rose-500/20",
  },
  {
    id: "dagger",
    name: "Obsidian Blade",
    icon: "🗡️",
    payout3: 3,
    payout4: 8,
    payout5: 20,
    color: "text-cyan-400",
    glowColor: "border-cyan-400 shadow-cyan-500/20",
  },
  {
    id: "A",
    name: "Ace Rune",
    icon: "A",
    payout3: 1.5,
    payout4: 4,
    payout5: 10,
    color: "text-slate-200",
    glowColor: "border-slate-500/30",
  },
  {
    id: "K",
    name: "King Rune",
    icon: "K",
    payout3: 1.2,
    payout4: 3,
    payout5: 7,
    color: "text-slate-300",
    glowColor: "border-slate-500/30",
  },
  {
    id: "Q",
    name: "Queen Rune",
    icon: "Q",
    payout3: 1.0,
    payout4: 2.5,
    payout5: 5,
    color: "text-slate-300",
    glowColor: "border-slate-500/30",
  },
  {
    id: "J",
    name: "Jack Rune",
    icon: "J",
    payout3: 0.8,
    payout4: 2,
    payout5: 4,
    color: "text-slate-400",
    glowColor: "border-slate-500/30",
  },
];

// 10 Key Ancient Paylines
const TOMB_PAYLINES: number[][] = [
  [1, 1, 1, 1, 1], // Center
  [0, 0, 0, 0, 0], // Top
  [2, 2, 2, 2, 2], // Bottom
  [0, 1, 2, 1, 0], // V-shape
  [2, 1, 0, 1, 2], // Inverted V
  [0, 0, 1, 2, 2],
  [2, 2, 1, 0, 0],
  [1, 0, 0, 0, 1],
  [1, 2, 2, 2, 1],
  [0, 1, 0, 1, 0],
];

function getRandomTombSymbol(): TombSymbol {
  const r = Math.random();
  if (r < 0.05) return TOMB_SYMBOLS[0]; // Mummy (Wild)
  if (r < 0.11) return TOMB_SYMBOLS[1]; // Anubis (Scatter)
  if (r < 0.20) return TOMB_SYMBOLS[2]; // Sarcophagus
  if (r < 0.32) return TOMB_SYMBOLS[3]; // Amulet
  if (r < 0.46) return TOMB_SYMBOLS[4]; // Dagger
  if (r < 0.60) return TOMB_SYMBOLS[5]; // A
  if (r < 0.74) return TOMB_SYMBOLS[6]; // K
  if (r < 0.87) return TOMB_SYMBOLS[7]; // Q
  return TOMB_SYMBOLS[8]; // J
}

function generateTombGrid(): TombSymbol[][] {
  return Array.from({ length: 5 }, () =>
    Array.from({ length: 3 }, () => getRandomTombSymbol())
  );
}

export default function TombOfLifeGame() {
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
        id: "tomb-of-life",
        title: "Tomb of Life",
        image: "/games/stake-originals/tomb-of-life.webp",
        href: "/games/tomb-of-life",
      });
    }
  }, [addRecentlyPlayedGame]);

  // Betting & Mode State
  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [betAmount, setBetAmount] = useState<number>(10);
  const [betInput, setBetInput] = useState<string>("10");
  const [isTurbo, setIsTurbo] = useState<boolean>(false);
  const [freeSpinsLeft, setFreeSpinsLeft] = useState<number>(0);
  const [globalMultiplier, setGlobalMultiplier] = useState<number>(1);

  // Reels State
  const [grid, setGrid] = useState<TombSymbol[][]>(generateTombGrid);
  const [spinningCols, setSpinningCols] = useState<boolean[]>([false, false, false, false, false]);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [expandedCols, setExpandedCols] = useState<number[]>([]);
  const [roundWin, setRoundWin] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>("Awaken the Tomb of Life!");

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
    if (isSpinning || freeSpinsLeft > 0) return;
    sounds.playClick();
    const next = Math.max(0.01, parseFloat((betAmount / 2).toFixed(2)));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  const handleDoubleBet = () => {
    if (isSpinning || freeSpinsLeft > 0) return;
    sounds.playClick();
    const next = parseFloat((betAmount * 2).toFixed(2));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  const handleMaxBet = () => {
    if (isSpinning || freeSpinsLeft > 0) return;
    sounds.playClick();
    const next = Math.max(0.01, parseFloat(balance.toFixed(2)));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  // Spin
  const handleSpin = useCallback(() => {
    if (isSpinning) return;

    const inFreeSpins = freeSpinsLeft > 0;
    const parsedBet = parseFloat(betInput) || 1;

    if (!inFreeSpins) {
      if (parsedBet > balance) {
        alert("Insufficient balance! Please use the Wallet button.");
        return;
      }
      updateBalance(-parsedBet);
      setBetAmount(parsedBet);

      setStats((prev) => ({
        ...prev,
        rounds: prev.rounds + 1,
        wagered: parseFloat((prev.wagered + parsedBet).toFixed(2)),
      }));
    } else {
      setFreeSpinsLeft((prev) => prev - 1);
    }

    setIsSpinning(true);
    setSpinningCols([true, true, true, true, true]);
    setExpandedCols([]);
    setRoundWin(0);
    setStatusMessage("Unsealing ancient sarcophagus...");

    sounds.playReelSpin();

    // Generate outcome grid
    const targetGrid = Array.from({ length: 5 }, () =>
      Array.from({ length: 3 }, () => getRandomTombSymbol())
    );

    // Expanding Wild Check: If Mummy lands in column, column will expand
    const expandingColumns: number[] = [];
    targetGrid.forEach((col, cIdx) => {
      if (col.some((s) => s.id === "mummy")) {
        expandingColumns.push(cIdx);
      }
    });

    const stopInterval = isTurbo ? 100 : 250;

    [0, 1, 2, 3, 4].forEach((colIdx) => {
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

        if (colIdx === 4) {
          // Trigger Wild Expansions
          if (expandingColumns.length > 0) {
            setExpandedCols(expandingColumns);
            sounds.playSuccessChime();
            // Fill expanded columns with full Mummy wilds
            expandingColumns.forEach((c) => {
              targetGrid[c] = [TOMB_SYMBOLS[0], TOMB_SYMBOLS[0], TOMB_SYMBOLS[0]];
            });
            setGrid([...targetGrid]);
          }

          evaluateTombWins(targetGrid, parsedBet, inFreeSpins);
        }
      }, 300 + colIdx * stopInterval);
    });
  }, [balance, betInput, freeSpinsLeft, isSpinning, isTurbo, updateBalance]);

  // Evaluate Line Wins & Scatter Free Spins
  const evaluateTombWins = (
    finalGrid: TombSymbol[][],
    wager: number,
    inFreeSpins: boolean
  ) => {
    setIsSpinning(false);
    const lineBet = wager / 10;
    let totalWin = 0;
    const currentMult = inFreeSpins ? 3 : 1;

    // Count Scatters for Free Spins
    let scatterCount = 0;
    finalGrid.forEach((col) => {
      col.forEach((sym) => {
        if (sym.isScatter) scatterCount++;
      });
    });

    // 3+ Scatters trigger 10 Free Spins!
    if (scatterCount >= 3) {
      const awardedSpins = 10;
      setFreeSpinsLeft((prev) => prev + awardedSpins);
      setGlobalMultiplier(3);
      sounds.playSuccessChime();
      setStatusMessage(`✨ ANUBIS AWAKENED! ${awardedSpins} Free Spins with 3× Multiplier!`);
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch {}
    }

    // Paylines Check (10 Lines)
    TOMB_PAYLINES.forEach((linePath) => {
      const firstSym = finalGrid[0][linePath[0]];
      let count = 1;
      let matchedSym = firstSym;

      for (let c = 1; c < 5; c++) {
        const nextSym = finalGrid[c][linePath[c]];
        if (
          nextSym.id === matchedSym.id ||
          nextSym.isWild ||
          (matchedSym.isWild && !nextSym.isWild && !nextSym.isScatter)
        ) {
          if (matchedSym.isWild && !nextSym.isWild) matchedSym = nextSym;
          count++;
        } else {
          break;
        }
      }

      if (count >= 3 && !matchedSym.isScatter) {
        let mult = 0;
        if (count === 3) mult = matchedSym.payout3;
        else if (count === 4) mult = matchedSym.payout4;
        else if (count >= 5) mult = matchedSym.payout5;

        const payout = lineBet * mult * currentMult;
        totalWin += payout;
      }
    });

    const rounded = parseFloat(totalWin.toFixed(2));
    setRoundWin(rounded);

    if (rounded > 0) {
      updateBalance(rounded);
      sounds.playPaylineWin();
      if (scatterCount < 3) {
        setStatusMessage(`Tomb Treasure! +${activeSym}${rounded.toFixed(2)} (${(rounded / wager).toFixed(1)}×)`);
      }

      if (rounded >= wager * 4) {
        try {
          confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
        } catch {}
      }

      setStats((prev) => ({
        ...prev,
        wins: prev.wins + 1,
        profit: parseFloat((prev.profit + (rounded - (inFreeSpins ? 0 : wager))).toFixed(2)),
      }));
    } else {
      if (scatterCount < 3) {
        setStatusMessage(inFreeSpins ? "Free Spin complete." : "Empty tomb chamber. Spin again!");
      }
      if (!inFreeSpins) {
        setStats((prev) => ({
          ...prev,
          losses: prev.losses + 1,
          profit: parseFloat((prev.profit - wager).toFixed(2)),
        }));
      }
    }
  };

  // Automatically continue Free Spins if active
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (freeSpinsLeft > 0 && !isSpinning) {
      timer = setTimeout(() => {
        handleSpin();
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [freeSpinsLeft, isSpinning, handleSpin]);

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
      {/* 1. TOP INTERACTIVE ARENA: ANCIENT TOMB CRYPT REELS        */}
      {/* ========================================================= */}
      <div className="w-full rounded-t-2xl bg-[#0a1824] border-t border-x border-[#1b3445] shadow-2xl p-4 sm:p-5 flex flex-col items-center relative overflow-hidden">
        {/* Ancient ambient green glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Utilities */}
        <div className="w-full flex items-center justify-between mb-4 z-10 text-xs text-[#b1bad3]">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-[11px] text-[#8596a5]">
              Tomb of Life
            </span>
            {freeSpinsLeft > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 font-mono font-bold text-[10px] animate-pulse">
                {freeSpinsLeft} Free Spins (3×)
              </span>
            )}
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

        {/* 5x3 Tomb Crypt Layout */}
        <div className="w-full max-w-2xl rounded-2xl border-2 border-emerald-600/40 bg-[#06111a] p-2.5 sm:p-4 grid grid-cols-5 gap-1.5 sm:gap-2.5 shadow-2xl relative z-10">
          {grid.map((col, colIdx) => {
            const isColSpinning = spinningCols[colIdx];
            const isColExpanded = expandedCols.includes(colIdx);
            return (
              <div
                key={colIdx}
                className={`flex flex-col gap-1.5 sm:gap-2.5 rounded-xl border p-1 sm:p-1.5 overflow-hidden transition-all duration-300 ${
                  isColExpanded
                    ? "bg-emerald-950/40 border-emerald-400 shadow-xl shadow-emerald-500/25"
                    : "bg-[#0c1f2d]/80 border-[#1a3447]"
                }`}
              >
                {col.map((sym, rowIdx) => {
                  return (
                    <div
                      key={rowIdx}
                      className={`aspect-square rounded-xl border flex flex-col items-center justify-center p-1 relative transition-all duration-300 ${
                        sym.glowColor
                      } ${
                        sym.isWild
                          ? "bg-gradient-to-b from-emerald-950 to-black text-emerald-300"
                          : sym.isScatter
                          ? "bg-gradient-to-b from-amber-950 to-black text-amber-300"
                          : "bg-[#0b1924]"
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
            <span>
              {isSpinning
                ? "OPENING CRYPT..."
                : freeSpinsLeft > 0
                ? `FREE SPIN (${freeSpinsLeft} LEFT)`
                : mode === "auto"
                ? "START AUTOBET"
                : "SPIN"}
            </span>
          </button>
        </div>

        {/* 2. TURBO SPEED TOGGLE */}
        <div className="flex items-center justify-between rounded-lg bg-[#0f212e] p-2 border border-[#213743]">
          <div className="flex items-center gap-2 text-xs font-bold text-[#b1bad3]">
            <Zap className={`h-4 w-4 ${isTurbo ? "fill-[#00e701] text-[#00e701]" : ""}`} />
            <span>Turbo Spin Mode</span>
          </div>
          <button
            type="button"
            disabled={isSpinning}
            onClick={() => {
              sounds.playClick();
              setIsTurbo(!isTurbo);
            }}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
              isTurbo
                ? "bg-[#00e701] text-black"
                : "bg-[#213743] text-[#b1bad3] hover:text-white"
            }`}
          >
            {isTurbo ? "ON" : "OFF"}
          </button>
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
                disabled={isSpinning || freeSpinsLeft > 0}
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
                disabled={isSpinning || freeSpinsLeft > 0}
                onClick={handleHalfBet}
                className="rounded-lg bg-[#213743] px-2.5 py-1.5 text-xs font-bold text-[#b1bad3] hover:bg-[#2f4553] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                ½
              </button>
              <button
                type="button"
                disabled={isSpinning || freeSpinsLeft > 0}
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
                  <span className="truncate">fa0183bce198274a019842bf9104fa28913c19b02418a09bca7120bc89412948</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("fa0183bce198274a019842bf9104fa28913c19b02418a09bca7120bc89412948");
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
                  stake_tomb_client_seed_2026
                </div>
              </div>
              <div>
                <label className="font-bold text-white block mb-1">RTP</label>
                <div className="p-2.5 rounded-xl bg-[#0f212e] font-mono text-[11px] text-[#00e701]">
                  96.50%
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
                <span>Live Tomb of Life Stats</span>
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
                <span>How to Play Tomb of Life</span>
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
                <strong className="text-white">Expanding Wild Mummy:</strong> When a Mummy symbol lands on any reel, it expands to turn the entire reel Wild, substituting for all regular symbols!
              </p>
              <p>
                <strong className="text-white">Anubis Free Spins:</strong> 3 or more Anubis Scatter symbols trigger 10 Free Spins with a global 3× win multiplier!
              </p>
              <p>
                <strong className="text-white">Turbo Mode:</strong> Speed up reel spins for fast-paced crypt exploration.
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
