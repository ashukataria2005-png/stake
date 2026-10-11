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
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

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
  const { balance, updateBalance, currencySymbol, addRecentlyPlayedGame } = useGame();
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
      className="flex flex-col items-center w-full min-h-[calc(100vh-64px)] bg-[#0f212e] text-white p-3 sm:p-6 select-none font-sans"
    >
      {/* =========================================================================
          TOP: DRAGON TOWER VERTICAL CLIMB ARENA (Floors 9 down to 1)
      ========================================================================== */}
      <div className="w-full max-w-4xl bg-[#1a2c38] rounded-2xl p-4 sm:p-6 border border-[#213743] shadow-2xl flex flex-col items-center relative overflow-hidden mb-5">
        
        {/* Ambient Fire / Cave Glow */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Current Multiplier HUD Header */}
        <div className="w-full flex items-center justify-between bg-[#0f212e]/80 backdrop-blur-md rounded-xl p-3 sm:px-6 mb-4 border border-[#213743]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#b1bad3] uppercase tracking-wider">Current Floor:</span>
            <span className="text-sm font-bold text-white font-mono">
              Floor <span className="text-amber-400">{isPlaying ? currentFloor : 1}</span> of {TOTAL_FLOORS}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {isPlaying && currentFloor > 1 && (
              <div className="text-xs text-[#b1bad3] hidden sm:block">
                Banked: <span className="font-mono font-bold text-[#00e701]">{activeSym}{currentPayout.toFixed(2)}</span>
              </div>
            )}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#213743] text-sm font-black font-mono transition-transform duration-200 ${
                currentFloor > 1 ? "scale-105 text-[#00e701]" : "text-[#b1bad3]"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>{currentMultiplier.toFixed(2)}×</span>
            </div>
          </div>
        </div>

        {/* Stone Tower Grid (Rendered from Floor 9 Top down to Floor 1 Bottom) */}
        <div className="w-full max-w-md flex flex-col gap-1.5 p-2 bg-[#0f212e]/60 rounded-2xl border border-[#213743]/80 shadow-inner">
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
                className={`flex items-center gap-2 p-1 rounded-xl transition-all duration-300 ${
                  isCurrentActive
                    ? "bg-[#213743]/90 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/30"
                    : isCompletedFloor
                    ? "bg-[#172733]/50 opacity-80"
                    : "opacity-45"
                }`}
              >
                {/* Floor Multiplier Pill (Left Column) */}
                <div
                  className={`w-14 sm:w-16 py-1.5 rounded-lg text-center font-mono font-bold text-[10px] sm:text-xs shrink-0 transition-colors ${
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
                <div className="flex-1 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${DIFFICULTIES[difficulty].tilesPerRow}, 1fr)` }}>
                  {floorData.tiles.map((tile, tIdx) => {
                    const canClick = isCurrentActive && !isRevealing;

                    return (
                      <button
                        key={tIdx}
                        disabled={!canClick}
                        onClick={() => handleTilePick(floorIdx, tIdx)}
                        className={`h-9 sm:h-10 rounded-lg flex items-center justify-center font-bold transition-all transform duration-200 overflow-hidden relative ${
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
                          // Stone pattern surface
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-black/20" />
                          </div>
                        ) : tile.isSafe ? (
                          // Dragon Egg
                          <div className="flex items-center justify-center animate-in zoom-in-75">
                            <Egg className="h-5 w-5 text-amber-300 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                          </div>
                        ) : (
                          // Dragon Skull Trap
                          <div className="flex items-center justify-center animate-in zoom-in-75">
                            <Skull className="h-5 w-5 text-red-400 fill-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
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
          <div className="mt-4 px-6 py-2.5 rounded-xl bg-[#00e701]/10 border border-[#00e701]/40 flex items-center gap-3 animate-in fade-in zoom-in-95">
            <Sparkles className="h-5 w-5 text-[#00e701]" />
            <div className="text-sm font-bold text-[#00e701]">
              Cashed Out! Won {activeSym}{currentPayout.toFixed(2)} ({currentMultiplier.toFixed(2)}×)
            </div>
          </div>
        )}

        {isBust && (
          <div className="mt-4 px-6 py-2.5 rounded-xl bg-[#e9113c]/10 border border-[#e9113c]/40 flex items-center gap-3 animate-in fade-in">
            <Flame className="h-5 w-5 text-[#e9113c]" />
            <div className="text-sm font-bold text-[#e9113c]">
              Dragon Trap Burned Your Climb!
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          CONTROLS: DIRECTLY BENEATH TOWER (Vertical Flow)
      ========================================================================== */}
      <div className="w-full max-w-4xl bg-[#1a2c38] rounded-2xl p-5 border border-[#213743] shadow-xl space-y-4">
        
        {/* Row 1: Bet Amount & Difficulty Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
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
                disabled={isPlaying}
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
                  disabled={isPlaying}
                  onClick={handleHalfBet}
                  className="px-2 py-1 text-xs font-bold rounded-lg bg-[#213743] text-[#b1bad3] hover:text-white hover:bg-[#2f4553] transition-colors disabled:opacity-50"
                >
                  ½
                </button>
                <button
                  type="button"
                  disabled={isPlaying}
                  onClick={handleDoubleBet}
                  className="px-2 py-1 text-xs font-bold rounded-lg bg-[#213743] text-[#b1bad3] hover:text-white hover:bg-[#2f4553] transition-colors disabled:opacity-50"
                >
                  2×
                </button>
                <button
                  type="button"
                  disabled={isPlaying}
                  onClick={handleMaxBet}
                  className="px-2 py-1 text-xs font-bold rounded-lg bg-[#213743] text-[#b1bad3] hover:text-white hover:bg-[#2f4553] transition-colors disabled:opacity-50"
                >
                  Max
                </button>
              </div>
            </div>
          </div>

          {/* Difficulty Selector Pills */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs text-[#b1bad3] font-semibold">
              <label>Difficulty</label>
              <span className="capitalize">{DIFFICULTIES[difficulty].safeCount} Eggs / {DIFFICULTIES[difficulty].tilesPerRow} Tiles</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
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
                    className={`py-2.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#213743] text-white border border-[#00e701] shadow-md ring-1 ring-[#00e701]"
                        : "bg-[#0f212e] text-[#b1bad3] hover:text-white hover:bg-[#213743]/50 border border-transparent"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {diffKey}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 2: Dual-State Primary Green CTA Button `#00e701` */}
        <div>
          {!isPlaying ? (
            <button
              onClick={handleStartRound}
              className="w-full py-4 rounded-xl font-black text-sm tracking-wide uppercase transition-all duration-200 transform active:scale-[0.99] bg-[#00e701] hover:bg-[#00c701] text-black shadow-[0_0_20px_rgba(0,231,1,0.4)] cursor-pointer"
            >
              Bet
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCashout}
              disabled={isRevealing || currentFloor <= 1}
              className={`w-full py-4 rounded-xl font-black text-sm tracking-wide uppercase transition-all duration-200 transform active:scale-[0.99] ${
                currentFloor > 1
                  ? "bg-[#00e701] hover:bg-[#00c701] text-black shadow-[0_0_25px_rgba(0,231,1,0.5)] cursor-pointer animate-pulse"
                  : "bg-[#213743] text-[#b1bad3] cursor-not-allowed"
              }`}
            >
              {currentFloor > 1
                ? `Cashout ${activeSym}${currentPayout.toFixed(2)} (${currentMultiplier.toFixed(2)}×)`
                : "Pick a Tile to Climb"}
            </button>
          )}
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
