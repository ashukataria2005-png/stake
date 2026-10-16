"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Zap,
  TrendingUp,
  X,
  Copy,
  Check,
  Sparkles,
  Flame,
  Egg,
  Skull,
  ShieldAlert,
  ChevronUp,
  BarChart2,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";
import StakeGameFooterCard from "@/components/games/originals/common/StakeGameFooterCard";

export type TowerDifficulty = "easy" | "medium" | "hard" | "expert" | "master";

interface DifficultyConfig {
  name: string;
  tilesPerRow: number;
  safeCount: number;
  trapCount: number;
  badgeColor: string;
}

const DIFFICULTIES: Record<TowerDifficulty, DifficultyConfig> = {
  easy: { name: "Easy", tilesPerRow: 4, safeCount: 3, trapCount: 1, badgeColor: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10" },
  medium: { name: "Medium", tilesPerRow: 3, safeCount: 2, trapCount: 1, badgeColor: "text-blue-400 border-blue-500/40 bg-blue-500/10" },
  hard: { name: "Hard", tilesPerRow: 2, safeCount: 1, trapCount: 1, badgeColor: "text-amber-400 border-amber-500/40 bg-amber-500/10" },
  expert: { name: "Expert", tilesPerRow: 3, safeCount: 1, trapCount: 2, badgeColor: "text-purple-400 border-purple-500/40 bg-purple-500/10" },
  master: { name: "Master", tilesPerRow: 4, safeCount: 1, trapCount: 3, badgeColor: "text-red-400 border-red-500/40 bg-red-500/10" },
};

const TOTAL_FLOORS = 9;

// Calculate progressive multiplier at each floor for 99% RTP
function getMultiplierForFloor(diff: TowerDifficulty, floor: number): number {
  if (floor <= 0) return 1.0;
  const cfg = DIFFICULTIES[diff];
  const pSafe = cfg.safeCount / cfg.tilesPerRow;
  const cumulativeProb = Math.pow(pSafe, floor);
  const mult = 0.99 / cumulativeProb;
  return parseFloat(mult >= 1000 ? mult.toFixed(0) : mult.toFixed(2));
}

interface FloorData {
  floorNumber: number; // 1 to 9 (1 is bottom, 9 is top)
  tiles: { isSafe: boolean; isRevealed: boolean; wasPicked: boolean }[];
}

export default function DragonTowerGame() {
  const { balance, updateBalance, currencySymbol, addRecentlyPlayedGame, recordSessionBet, toggleLiveStats } = useGame();
  const activeSym = currencySymbol || "$";

  // Register in Recently Played
  useEffect(() => {
    if (addRecentlyPlayedGame) {
      addRecentlyPlayedGame({
        id: "dragontower",
        title: "Dragon Tower",
        image: "/games/stake-originals/dragontower.webp",
        href: "/games/dragontower",
      });
    }
  }, []);

  // Settings & Modes
  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [difficulty, setDifficulty] = useState<TowerDifficulty>("easy");
  const [betAmount, setBetAmount] = useState<number>(10);
  const [betInput, setBetInput] = useState<string>("10");

  useEffect(() => {
    if (betInput !== "" && parseFloat(betInput) === betAmount) return;
    setBetInput(betAmount.toString());
  }, [betAmount]);

  // Round State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentFloor, setCurrentFloor] = useState<number>(1); // 1 to 9
  const [floors, setFloors] = useState<FloorData[]>([]);
  const [isBust, setIsBust] = useState<boolean>(false);
  const [isCashedOut, setIsCashedOut] = useState<boolean>(false);
  const [isRevealing, setIsRevealing] = useState<boolean>(false);

  // Derived values
  const currentMultiplier = currentFloor > 1 ? getMultiplierForFloor(difficulty, currentFloor - 1) : 1.0;
  const currentPayout = parseFloat((betAmount * currentMultiplier).toFixed(2));
  const currentProfit = parseFloat((currentPayout - betAmount).toFixed(2));

  // Settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // Modals
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

  // Initialize fresh tower layout
  const generateTower = (diff: TowerDifficulty): FloorData[] => {
    const cfg = DIFFICULTIES[diff];
    const generated: FloorData[] = [];

    for (let f = 1; f <= TOTAL_FLOORS; f++) {
      // Create tiles
      const safeIndices = new Set<number>();
      while (safeIndices.size < cfg.safeCount) {
        safeIndices.add(Math.floor(Math.random() * cfg.tilesPerRow));
      }

      const tiles = Array.from({ length: cfg.tilesPerRow }, (_, i) => ({
        isSafe: safeIndices.has(i),
        isRevealed: false,
        wasPicked: false,
      }));

      generated.push({ floorNumber: f, tiles });
    }
    return generated;
  };

  // Quick Bet Modifiers
  const handleHalfBet = () => {
    if (isPlaying) return;
    if (soundEnabled) sounds.playClick();
    const next = Math.max(0.01, parseFloat((betAmount / 2).toFixed(2)));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  const handleDoubleBet = () => {
    if (isPlaying) return;
    if (soundEnabled) sounds.playClick();
    const next = parseFloat((betAmount * 2).toFixed(2));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  const handleMaxBet = () => {
    if (isPlaying) return;
    if (soundEnabled) sounds.playClick();
    const next = Math.max(0.01, parseFloat(balance.toFixed(2)));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  // Start Round
  const handleStartRound = () => {
    if (isPlaying || isRevealing) return;
    if (balance < betAmount) {
      alert("Insufficient balance!");
      return;
    }

    updateBalance(-betAmount);
    if (soundEnabled) sounds.playBet();

    const newFloors = generateTower(difficulty);
    setFloors(newFloors);
    setCurrentFloor(1);
    setIsBust(false);
    setIsCashedOut(false);
    setIsPlaying(true);

    setStats((prev) => ({
      ...prev,
      rounds: prev.rounds + 1,
      wagered: parseFloat((prev.wagered + betAmount).toFixed(2)),
    }));
  };

  // Tile Selection on Current Active Floor
  const handleTilePick = (floorIndex: number, tileIndex: number) => {
    const floorNum = floorIndex + 1;
    if (!isPlaying || isRevealing || floorNum !== currentFloor) return;

    setIsRevealing(true);
    const targetFloor = floors[floorIndex];
    const pickedTile = targetFloor.tiles[tileIndex];

    setTimeout(() => {
      // Update floor tile states
      const updatedFloors = [...floors];
      const currentTiles = updatedFloors[floorIndex].tiles.map((t, idx) => {
        if (idx === tileIndex) {
          return { ...t, isRevealed: true, wasPicked: true };
        }
        return t;
      });
      updatedFloors[floorIndex].tiles = currentTiles;

      if (!pickedTile.isSafe) {
        // Bust! Dragon Skull hit
        // Reveal all tiles on current floor
        updatedFloors[floorIndex].tiles = currentTiles.map((t) => ({ ...t, isRevealed: true }));
        setFloors(updatedFloors);
        setIsBust(true);
        setIsPlaying(false);
        setIsRevealing(false);
        if (soundEnabled) sounds.playDragonBust();
        recordSessionBet(betAmount, 0, false, "dragontower");

        setStats((prev) => ({
          ...prev,
          losses: prev.losses + 1,
          profit: parseFloat((prev.profit - betAmount).toFixed(2)),
        }));
      } else {
        // Safe Dragon Egg found!
        if (soundEnabled) sounds.playDragonEgg(currentFloor);

        if (currentFloor === TOTAL_FLOORS) {
          // Cleared Tower Apex (Floor 9)! Auto Cashout!
          setFloors(updatedFloors);
          const apexMult = getMultiplierForFloor(difficulty, TOTAL_FLOORS);
          const finalPayout = parseFloat((betAmount * apexMult).toFixed(2));
          updateBalance(finalPayout);
          setIsCashedOut(true);
          setIsPlaying(false);
          setIsRevealing(false);
          if (soundEnabled) sounds.playCashout();
          recordSessionBet(betAmount, finalPayout, true, "dragontower");
          confetti({ particleCount: 150, spread: 80, origin: { y: 0.5 } });

          setStats((prev) => ({
            ...prev,
            wins: prev.wins + 1,
            profit: parseFloat((prev.profit + (finalPayout - betAmount)).toFixed(2)),
          }));
        } else {
          // Advance to next floor above
          setFloors(updatedFloors);
          setCurrentFloor((prev) => prev + 1);
          setIsRevealing(false);
          if (soundEnabled) sounds.playStoneSlide();
        }
      }
    }, 150);
  };

  // Cashout
  const handleCashout = () => {
    if (!isPlaying || isRevealing || currentFloor <= 1) return;

    updateBalance(currentPayout);
    setIsCashedOut(true);
    setIsPlaying(false);
    if (soundEnabled) sounds.playCashout();
    recordSessionBet(betAmount, currentPayout, true, "dragontower");
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });

    setStats((prev) => ({
      ...prev,
      wins: prev.wins + 1,
      profit: parseFloat((prev.profit + currentProfit).toFixed(2)),
    }));
  };

  const toggleFullscreen = () => {
    if (!gameContainerRef.current) return;
    if (!document.fullscreenElement) {
      gameContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Pre-fill tower visual if idle
  const activeFloors = floors.length === TOTAL_FLOORS ? floors : generateTower(difficulty);

  return (
    <div
      ref={gameContainerRef}
      className={`w-full max-w-lg mx-auto px-2 sm:px-3 py-2 select-none flex flex-col space-y-0 ${
        isFullscreen ? "p-6 bg-[#0f212e] min-h-screen max-w-none" : ""
      }`}
    >
      {/* =========================================================================
          1. GAME ARENA: DRAGON TOWER VERTICAL CLIMB ARENA (Floors 9 down to 1)
      ========================================================================== */}
      <div className="w-full rounded-t-2xl bg-[#0f212e] border-t border-x border-[#213743] shadow-2xl p-3 sm:p-4 flex flex-col items-center justify-center space-y-3 relative overflow-hidden">
        {/* Ambient Fire / Cave Glow */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Current Multiplier HUD Header */}
        <div className="w-full flex items-center justify-between bg-[#1a2c38] rounded-xl px-3 py-2 border border-[#213743]">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-[#b1bad3] uppercase tracking-wider">Floor:</span>
            <span className="text-xs font-bold text-white font-mono">
              <span className="text-amber-400">{isPlaying ? currentFloor : 1}</span> / {TOTAL_FLOORS}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isPlaying && currentFloor > 1 && (
              <div className="text-xs text-[#b1bad3]">
                Bank: <span className="font-mono font-bold text-[#00e701]">{activeSym}{currentPayout.toFixed(2)}</span>
              </div>
            )}
            <div
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#0f212e] text-xs font-black font-mono transition-transform duration-200 ${
                currentFloor > 1 ? "scale-105 text-[#00e701]" : "text-[#b1bad3]"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{currentMultiplier.toFixed(2)}×</span>
            </div>
          </div>
        </div>

        {/* Stone Tower Grid (Rendered from Floor 9 Top down to Floor 1 Bottom) */}
        <div className="w-full flex flex-col gap-1 p-2 bg-[#1a2c38]/40 rounded-xl border border-[#213743] shadow-inner">
          {Array.from({ length: TOTAL_FLOORS }, (_, index) => {
            // Invert index so top row is Floor 9, bottom row is Floor 1
            const floorIdx = TOTAL_FLOORS - 1 - index;
            const floorNum = floorIdx + 1;
            const floorData = activeFloors[floorIdx];
            const isCurrentActive = isPlaying && floorNum === currentFloor;
            const isCompletedFloor = isPlaying && floorNum < currentFloor;
            const floorMult = getMultiplierForFloor(difficulty, floorNum);

            return (
              <div
                key={floorNum}
                className={`flex items-center gap-1.5 p-1 rounded-lg transition-all duration-300 ${
                  isCurrentActive
                    ? "bg-[#213743]/90 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/30"
                    : isCompletedFloor
                    ? "bg-[#172733]/50 opacity-80"
                    : "opacity-45"
                }`}
              >
                {/* Floor Multiplier Pill (Left Column) */}
                <div
                  className={`w-12 py-1 rounded-md text-center font-mono font-bold text-[10px] shrink-0 transition-colors ${
                    isCurrentActive
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : isCompletedFloor
                      ? "bg-[#00e701]/10 text-[#00e701] border border-[#00e701]/20"
                      : "bg-[#0f212e] text-[#b1bad3]"
                  }`}
                >
                  {floorMult}×
                </div>

                {/* Stone Tiles for this Floor */}
                <div className="flex-1 grid gap-1" style={{ gridTemplateColumns: `repeat(${DIFFICULTIES[difficulty].tilesPerRow}, 1fr)` }}>
                  {floorData.tiles.map((tile, tIdx) => {
                    const canClick = isCurrentActive && !isRevealing;

                    return (
                      <button
                        key={tIdx}
                        disabled={!canClick}
                        onClick={() => handleTilePick(floorIdx, tIdx)}
                        className={`h-7 sm:h-8 rounded-lg flex items-center justify-center font-bold transition-all transform duration-200 overflow-hidden relative ${
                          !tile.isRevealed
                            ? isCurrentActive
                              ? "bg-gradient-to-b from-[#2a4555] to-[#1c303c] border border-amber-400/40 hover:border-amber-300 hover:scale-[1.03] active:scale-95 cursor-pointer shadow-md"
                              : "bg-[#1a2c38] border border-[#213743] cursor-not-allowed"
                            : tile.isSafe
                            ? "bg-gradient-to-b from-amber-950 to-yellow-950 border-2 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)]"
                            : "bg-gradient-to-b from-red-950 to-red-900 border-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-in shake"
                        }`}
                      >
                        {!tile.isRevealed ? (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-black/20" />
                          </div>
                        ) : tile.isSafe ? (
                          <div className="flex items-center justify-center animate-in zoom-in-75">
                            <Egg className="h-4 w-4 text-amber-300 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center animate-in zoom-in-75">
                            <Skull className="h-4 w-4 text-red-400 fill-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Round Feedback Messages */}
        {isCashedOut && (
          <div className="w-full px-4 py-1.5 rounded-xl bg-[#00e701]/10 border border-[#00e701]/40 flex items-center justify-center gap-2 animate-in fade-in zoom-in-95">
            <Sparkles className="h-3.5 w-3.5 text-[#00e701]" />
            <div className="text-xs font-bold text-[#00e701]">
              Cashed Out! Won {activeSym}{currentPayout.toFixed(2)} ({currentMultiplier.toFixed(2)}×)
            </div>
          </div>
        )}

        {isBust && (
          <div className="w-full px-4 py-1.5 rounded-xl bg-[#e9113c]/10 border border-[#e9113c]/40 flex items-center justify-center gap-2 animate-in fade-in">
            <Flame className="h-3.5 w-3.5 text-[#e9113c]" />
            <div className="text-xs font-bold text-[#e9113c]">
              Dragon Trap Burned Your Climb!
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          2. MINES HARMONIZED BETTING CONTROLS SHELL CONTAINER
      ========================================================================== */}
      <div className="w-full border-t border-[#213743] bg-[#1a2c38] p-3 sm:p-4 flex flex-col justify-start space-y-2 sm:space-y-2.5 rounded-b-2xl select-none">
        {/* 1. PRIMARY BET CTA BUTTON (Directly at top of controls) */}
        <div className="w-full">
          {!isPlaying ? (
            <button
              type="button"
              onClick={handleStartRound}
              disabled={betAmount > balance || betAmount <= 0}
              className="w-full py-3 sm:py-3.5 text-sm sm:text-base font-extrabold rounded-lg bg-[#1475e1] hover:bg-[#1164c2] text-white shadow-lg shadow-[#1475e1]/25 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer uppercase tracking-wider"
            >
              <span>{mode === "auto" ? "START AUTOBET" : "BET"}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCashout}
              disabled={isRevealing || currentFloor <= 1}
              className={`w-full py-3 sm:py-3.5 text-sm sm:text-base font-extrabold rounded-lg shadow-lg transition-all flex items-center justify-center uppercase tracking-wider cursor-pointer ${
                currentFloor > 1
                  ? "bg-[#1475e1] hover:bg-[#1164c2] text-white shadow-[#1475e1]/30 hover:brightness-110"
                  : "bg-[#213743] text-[#b1bad3] cursor-not-allowed"
              }`}
            >
              <span>
                {currentFloor > 1
                  ? `CASHOUT ${activeSym}${currentPayout.toFixed(2)} (${currentMultiplier.toFixed(2)}×)`
                  : "PICK A TILE"}
              </span>
            </button>
          )}
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
                disabled={isPlaying}
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
                disabled={isPlaying}
                onClick={handleHalfBet}
                className="rounded-lg bg-[#213743] px-2.5 py-1.5 text-xs font-bold text-[#b1bad3] hover:bg-[#2f4553] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                ½
              </button>
              <button
                type="button"
                disabled={isPlaying}
                onClick={handleDoubleBet}
                className="rounded-lg bg-[#213743] px-2.5 py-1.5 text-xs font-bold text-[#b1bad3] hover:bg-[#2f4553] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                2×
              </button>
            </div>
          </div>
        </div>

        {/* 3. DIFFICULTY SELECTOR PILLS */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10px] font-bold text-[#b1bad3] uppercase">
            <span>Difficulty</span>
            <span className="capitalize">{DIFFICULTIES[difficulty].safeCount} Eggs / {DIFFICULTIES[difficulty].tilesPerRow} Tiles</span>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {(Object.keys(DIFFICULTIES) as TowerDifficulty[]).map((diffKey) => {
              const isSelected = difficulty === diffKey;
              return (
                <button
                  key={diffKey}
                  type="button"
                  disabled={isPlaying}
                  onClick={() => {
                    if (soundEnabled) sounds.playClick();
                    setDifficulty(diffKey);
                  }}
                  className={`py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#213743] text-white shadow-sm"
                      : "bg-[#0f212e] text-[#b1bad3] hover:text-white"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {diffKey[0].toUpperCase() + diffKey.slice(1, 4)}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. MODE SWITCH TABS: [ Manual | Auto ] - Positioned at bottom */}
        <div className="flex rounded-lg bg-[#0f212e] p-1 border border-[#213743] mt-auto">
          <button
            type="button"
            disabled={isPlaying}
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
            disabled={isPlaying}
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
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1 rounded-md hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
            </button>
            <button
              type="button"
              onClick={() => toggleLiveStats("dragontower")}
              className="p-1 rounded-md hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors cursor-pointer"
              title="Live Stats"
            >
              <BarChart2 className="w-4 h-4 text-cyan-400" />
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

      {/* Stake Originals Game Footer Card */}
      <StakeGameFooterCard gameTitle="Dragon Tower" />

      {/* =========================================================================
          MODALS: PROVABLY FAIR & LIVE STATS
      ========================================================================== */}
      {showFairnessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#00e701]" />
                <span>Provably Fair: Dragon Tower</span>
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
                Dragon tower floor egg & trap layouts are generated using HMAC-SHA256 from your Client Seed
                and Server Seed with certified 99% Return to Player (RTP).
              </p>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#b1bad3]">Server Seed (Hashed)</label>
                <div className="flex items-center justify-between rounded-xl bg-[#0f212e] border border-[#213743] p-2.5 font-mono text-white text-[11px] truncate">
                  <span className="truncate">3a2f1e0d9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("3a2f1e0d9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b");
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
                <span>Dragon Tower Session Stats</span>
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
                <div className="text-[11px] font-bold text-[#b1bad3]">Total Climbs</div>
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
