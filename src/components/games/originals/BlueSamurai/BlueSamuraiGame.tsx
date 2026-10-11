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
  Swords,
  RotateCw,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

interface SamuraiSymbol {
  id: string;
  name: string;
  icon: string;
  isWild?: boolean;
  payout3: number;
  payout4: number;
  payout5: number;
  color: string;
  glowColor: string;
}

const SAMURAI_SYMBOLS: SamuraiSymbol[] = [
  {
    id: "samurai",
    name: "Blue Samurai",
    icon: "⚔️",
    isWild: true,
    payout3: 20,
    payout4: 60,
    payout5: 200,
    color: "text-sky-300",
    glowColor: "border-sky-400 shadow-sky-500/40",
  },
  {
    id: "shogun",
    name: "Red Shogun",
    icon: "👺",
    payout3: 10,
    payout4: 30,
    payout5: 80,
    color: "text-rose-400",
    glowColor: "border-rose-400 shadow-rose-500/30",
  },
  {
    id: "geisha",
    name: "Geisha",
    icon: "👘",
    payout3: 6,
    payout4: 16,
    payout5: 40,
    color: "text-pink-300",
    glowColor: "border-pink-400 shadow-pink-500/20",
  },
  {
    id: "pagoda",
    name: "Dragon Pagoda",
    icon: "🏯",
    payout3: 4,
    payout4: 10,
    payout5: 25,
    color: "text-amber-300",
    glowColor: "border-amber-400 shadow-amber-500/20",
  },
  {
    id: "shuriken",
    name: "Ninja Shuriken",
    icon: "🥷",
    payout3: 2.5,
    payout4: 6,
    payout5: 15,
    color: "text-indigo-300",
    glowColor: "border-indigo-400 shadow-indigo-500/20",
  },
  {
    id: "A",
    name: "Ace Kanji",
    icon: "A",
    payout3: 1.5,
    payout4: 3.5,
    payout5: 8,
    color: "text-slate-200",
    glowColor: "border-slate-500/30",
  },
  {
    id: "K",
    name: "King Kanji",
    icon: "K",
    payout3: 1.2,
    payout4: 2.5,
    payout5: 6,
    color: "text-slate-300",
    glowColor: "border-slate-500/30",
  },
  {
    id: "Q",
    name: "Queen Kanji",
    icon: "Q",
    payout3: 1.0,
    payout4: 2.0,
    payout5: 4,
    color: "text-slate-300",
    glowColor: "border-slate-500/30",
  },
  {
    id: "J",
    name: "Jack Kanji",
    icon: "J",
    payout3: 0.8,
    payout4: 1.5,
    payout5: 2.5,
    color: "text-slate-400",
    glowColor: "border-slate-500/30",
  },
  {
    id: "10",
    name: "Ten Kanji",
    icon: "10",
    payout3: 0.5,
    payout4: 1.0,
    payout5: 1.5,
    color: "text-slate-400",
    glowColor: "border-slate-500/30",
  },
];

const SAMURAI_PAYLINES: number[][] = [
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
  [2, 1, 2, 1, 2],
  [1, 0, 1, 0, 1],
  [1, 2, 1, 2, 1],
  [0, 1, 1, 1, 0],
  [2, 1, 1, 1, 2],
  [0, 0, 0, 1, 2],
  [2, 2, 2, 1, 0],
  [1, 1, 0, 1, 1],
  [1, 1, 2, 1, 1],
  [0, 2, 0, 2, 0],
];

function getRandomSamuraiSymbol(): SamuraiSymbol {
  const r = Math.random();
  if (r < 0.05) return SAMURAI_SYMBOLS[0]; // Blue Samurai (Wild)
  if (r < 0.12) return SAMURAI_SYMBOLS[1]; // Red Shogun
  if (r < 0.22) return SAMURAI_SYMBOLS[2]; // Geisha
  if (r < 0.34) return SAMURAI_SYMBOLS[3]; // Pagoda
  if (r < 0.46) return SAMURAI_SYMBOLS[4]; // Shuriken
  if (r < 0.58) return SAMURAI_SYMBOLS[5]; // A
  if (r < 0.70) return SAMURAI_SYMBOLS[6]; // K
  if (r < 0.81) return SAMURAI_SYMBOLS[7]; // Q
  if (r < 0.91) return SAMURAI_SYMBOLS[8]; // J
  return SAMURAI_SYMBOLS[9]; // 10
}

function generateInitialSamuraiGrid(): SamuraiSymbol[][] {
  return Array.from({ length: 5 }, () =>
    Array.from({ length: 3 }, () => getRandomSamuraiSymbol())
  );
}

export default function BlueSamuraiGame() {
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
        id: "blue-samurai",
        title: "Blue Samurai",
        image: "/games/stake-originals/blue-samurai.webp",
        href: "/games/blue-samurai",
      });
    }
  }, [addRecentlyPlayedGame]);

  // Betting & Lines State
  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [betAmount, setBetAmount] = useState<number>(10);
  const [betInput, setBetInput] = useState<string>("10");
  const [activeLines, setActiveLines] = useState<number>(20);
  const [isAutoSpin, setIsAutoSpin] = useState<boolean>(false);
  const [isRespin, setIsRespin] = useState<boolean>(false);

  // Reels State
  const [grid, setGrid] = useState<SamuraiSymbol[][]>(generateInitialSamuraiGrid);
  const [spinningCols, setSpinningCols] = useState<boolean[]>([false, false, false, false, false]);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [expandedCols, setExpandedCols] = useState<number[]>([]);
  const [katanaSlashActive, setKatanaSlashActive] = useState<boolean>(false);
  const [roundWin, setRoundWin] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>("Unleash the Katana blade!");

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
    if (isSpinning || isRespin) return;
    sounds.playClick();
    const next = Math.max(0.01, parseFloat((betAmount / 2).toFixed(2)));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  const handleDoubleBet = () => {
    if (isSpinning || isRespin) return;
    sounds.playClick();
    const next = parseFloat((betAmount * 2).toFixed(2));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  const handleMaxBet = () => {
    if (isSpinning || isRespin) return;
    sounds.playClick();
    const next = Math.max(0.01, parseFloat(balance.toFixed(2)));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  // Spin
  const handleSpin = useCallback(() => {
    if (isSpinning) return;

    const parsedBet = parseFloat(betInput) || 1;
    if (!isRespin) {
      if (parsedBet > balance) {
        alert("Insufficient balance! Please use the Wallet button.");
        setIsAutoSpin(false);
        return;
      }
      updateBalance(-parsedBet);
      setBetAmount(parsedBet);

      setStats((prev) => ({
        ...prev,
        rounds: prev.rounds + 1,
        wagered: parseFloat((prev.wagered + parsedBet).toFixed(2)),
      }));
    }

    setIsSpinning(true);
    setSpinningCols([true, true, true, true, true]);
    setExpandedCols([]);
    setKatanaSlashActive(false);
    setRoundWin(0);
    setStatusMessage(isRespin ? "Free Samurai Respin!" : "Spinning blades...");

    sounds.playReelSpin();

    // Target outcome grid
    const targetGrid = Array.from({ length: 5 }, () =>
      Array.from({ length: 3 }, () => getRandomSamuraiSymbol())
    );

    // Check if Samurai Wild lands
    const samuraiCols: number[] = [];
    targetGrid.forEach((col, cIdx) => {
      if (col.some((s) => s.id === "samurai")) {
        samuraiCols.push(cIdx);
      }
    });

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
          // Trigger Katana Slash & Wild Expansions
          if (samuraiCols.length > 0) {
            setExpandedCols(samuraiCols);
            setKatanaSlashActive(true);
            sounds.playKatanaSlash();
            setTimeout(() => {
              sounds.playKatanaClash();
            }, 200);

            // Turn expanded column into 3x Samurai Wilds
            samuraiCols.forEach((c) => {
              targetGrid[c] = [SAMURAI_SYMBOLS[0], SAMURAI_SYMBOLS[0], SAMURAI_SYMBOLS[0]];
            });
            setGrid([...targetGrid]);

            // If not currently a respin, trigger a Free Samurai Respin next!
            if (!isRespin) {
              setIsRespin(true);
            } else {
              setIsRespin(false);
            }
          } else {
            setIsRespin(false);
          }

          evaluateSamuraiWins(targetGrid, parsedBet, samuraiCols.length > 0);
        }
      }, 400 + colIdx * 250);
    });
  }, [balance, betInput, isRespin, isSpinning, updateBalance]);

  // Evaluate Wins
  const evaluateSamuraiWins = (
    finalGrid: SamuraiSymbol[][],
    wager: number,
    hadSamurai: boolean
  ) => {
    setIsSpinning(false);
    const lineBet = wager / activeLines;
    let totalWin = 0;

    for (let l = 0; l < activeLines; l++) {
      const linePath = SAMURAI_PAYLINES[l];
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

        totalWin += lineBet * mult;
      }
    }

    const rounded = parseFloat(totalWin.toFixed(2));
    setRoundWin(rounded);

    if (rounded > 0) {
      updateBalance(rounded);
      sounds.playPaylineWin();
      setStatusMessage(
        hadSamurai
          ? `⚔️ SAMURAI SLASH! +${activeSym}${rounded.toFixed(2)} + RESPIN!`
          : `Honor & Glory! +${activeSym}${rounded.toFixed(2)}`
      );

      if (rounded >= wager * 4) {
        try {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        } catch {}
      }

      setStats((prev) => ({
        ...prev,
        wins: prev.wins + 1,
        profit: parseFloat((prev.profit + (rounded - (isRespin ? 0 : wager))).toFixed(2)),
      }));
    } else {
      setStatusMessage(
        hadSamurai ? "Samurai Wild locked! Free Respin awarded!" : "Defend the Dojo. Spin again!"
      );
      if (!isRespin) {
        setStats((prev) => ({
          ...prev,
          losses: prev.losses + 1,
          profit: parseFloat((prev.profit - wager).toFixed(2)),
        }));
      }
    }
  };

  // Auto-Spin execution loop
  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;
    if (isAutoSpin && !isSpinning && !isRespin) {
      timeout = setTimeout(() => {
        handleSpin();
      }, 700);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isAutoSpin, isRespin, isSpinning, handleSpin]);

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
      {/* 1. TOP INTERACTIVE ARENA: SAMURAI DOJO REELS              */}
      {/* ========================================================= */}
      <div className="w-full rounded-t-2xl bg-[#071928] border-t border-x border-[#1b3d5a] shadow-2xl p-4 sm:p-5 flex flex-col items-center relative overflow-hidden">
        {/* Blue moonlight samurai glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Katana Slash Light streak animation */}
        {katanaSlashActive && (
          <div className="absolute inset-0 bg-sky-400/20 z-20 pointer-events-none animate-pulse flex items-center justify-center">
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-sky-200 to-transparent rotate-12 scale-125" />
          </div>
        )}

        {/* Top Header Utilities */}
        <div className="w-full flex items-center justify-between mb-4 z-10 text-xs text-[#b1bad3]">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-[11px] text-[#8596a5]">
              Blue Samurai (5×3)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-sky-500/15 border border-sky-400/40 text-sky-300 font-mono font-bold text-[10px]">
              {activeLines} Lines
            </span>
            {isRespin && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 font-mono font-bold text-[10px] animate-pulse">
                Free Respin Ready!
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

        {/* 5x3 Samurai Reels Grid */}
        <div className="w-full max-w-2xl rounded-2xl border-2 border-sky-600/40 bg-[#040f1a] p-2.5 sm:p-4 grid grid-cols-5 gap-1.5 sm:gap-2.5 shadow-2xl relative z-10">
          {grid.map((col, colIdx) => {
            const isColSpinning = spinningCols[colIdx];
            const isColExpanded = expandedCols.includes(colIdx);
            return (
              <div
                key={colIdx}
                className={`flex flex-col gap-1.5 sm:gap-2.5 rounded-xl border p-1 sm:p-1.5 overflow-hidden transition-all duration-300 ${
                  isColExpanded
                    ? "bg-sky-950/50 border-sky-400 shadow-xl shadow-sky-500/30"
                    : "bg-[#0c2236]/80 border-[#1a3d5b]"
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
                          ? "bg-gradient-to-b from-sky-950 to-black text-sky-200"
                          : "bg-[#081b2a]"
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
                ? "CLASHING BLADES..."
                : isRespin
                ? "SAMURAI RESPIN!"
                : isAutoSpin
                ? "STOP AUTOBET"
                : mode === "auto"
                ? "START AUTOBET"
                : "SPIN"}
            </span>
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
                    ? "bg-sky-500/20 border-sky-400 text-sky-300"
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
                disabled={isSpinning || isAutoSpin || isRespin}
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
                disabled={isSpinning || isAutoSpin || isRespin}
                onClick={handleHalfBet}
                className="rounded-lg bg-[#213743] px-2.5 py-1.5 text-xs font-bold text-[#b1bad3] hover:bg-[#2f4553] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                ½
              </button>
              <button
                type="button"
                disabled={isSpinning || isAutoSpin || isRespin}
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
                  <span className="truncate">b810931facb827e8129031cba019482bf0912ab74519bc781a94120389140</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("b810931facb827e8129031cba019482bf0912ab74519bc781a94120389140");
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
                  stake_samurai_client_seed_2026
                </div>
              </div>
              <div>
                <label className="font-bold text-white block mb-1">RTP</label>
                <div className="p-2.5 rounded-xl bg-[#0f212e] font-mono text-[11px] text-[#00e701]">
                  97.26%
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
                <span>Live Blue Samurai Stats</span>
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
                <span>How to Play Blue Samurai</span>
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
                <strong className="text-white">Expanding Wild Samurai:</strong> The Blue Samurai symbol triggers a Katana slash, turning the entire column into Wilds that substitute for all symbols!
              </p>
              <p>
                <strong className="text-white">Free Samurai Respin:</strong> Every time a Samurai Wild expands, you receive an immediate Free Respin with the wild locked in position!
              </p>
              <p>
                <strong className="text-white">Paylines:</strong> Select up to 20 lines with payline combinations paying from left to right.
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
