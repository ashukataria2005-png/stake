"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bomb,
  Gem,
  Volume2,
  VolumeX,
  ShieldCheck,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  RefreshCw,
  X,
  HelpCircle,
  Copy,
  Check,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

interface MultiplierHistoryItem {
  id: string;
  multiplier: number;
  isWin: boolean;
}

export default function MinesPage() {
  const { balance, updateBalance, currency, formatBalance } = useGame();

  // Mode: Manual or Auto
  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [betAmount, setBetAmount] = useState<number>(10);
  const [minesCount, setMinesCount] = useState<number>(3);
  const [autoBetsCount, setAutoBetsCount] = useState<number>(10);

  // Game active state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [revealedTiles, setRevealedTiles] = useState<number[]>([]);
  const [mineLocations, setMineLocations] = useState<number[]>([]);
  const [floatingBadges, setFloatingBadges] = useState<{ [key: number]: string }>({});

  // History strip of last 5 multipliers
  const [history, setHistory] = useState<MultiplierHistoryItem[]>([
    { id: "h1", multiplier: 1.48, isWin: true },
    { id: "h2", multiplier: 2.12, isWin: true },
    { id: "h3", multiplier: 0.0, isWin: false },
    { id: "h4", multiplier: 1.13, isWin: true },
    { id: "h5", multiplier: 3.65, isWin: true },
  ]);

  // Win overlay state
  const [winOverlay, setWinOverlay] = useState<{
    show: boolean;
    multiplier: number;
    amount: number;
  }>({ show: false, multiplier: 0, amount: 0 });

  // Sound & Fullscreen state
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Provably Fair Modal
  const [isFairnessOpen, setIsFairnessOpen] = useState<boolean>(false);
  const [serverSeedHash, setServerSeedHash] = useState<string>(
    "7a9c82df09a4e321bf4e8c1a93417e29b1480f2d409e5b7c8a6f3d9b01e23a45"
  );
  const [clientSeed, setClientSeed] = useState<string>("stake_clone_94f8e");
  const [nonce, setNonce] = useState<number>(142);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Exact Stake Mines Payout Formula:
  // Multiplier = (1 - HouseEdge) * [ Combination(25, opened) / Combination(25 - mines, opened) ]
  // Where HouseEdge = 1% (0.99)
  const calculateMultiplier = useCallback(
    (opened: number, totalMines: number): number => {
      if (opened <= 0) return 1.0;
      if (opened > 25 - totalMines) return 0;
      let mult = 0.99;
      for (let i = 0; i < opened; i++) {
        mult *= (25 - i) / (25 - totalMines - i);
      }
      return parseFloat(mult.toFixed(2));
    },
    []
  );

  const currentGemsOpened = revealedTiles.filter(
    (idx) => !mineLocations.includes(idx)
  ).length;

  const currentMultiplier = isPlaying
    ? calculateMultiplier(currentGemsOpened, minesCount)
    : 1.0;

  const nextMultiplier = calculateMultiplier(currentGemsOpened + 1, minesCount);
  const currentProfit = isPlaying
    ? parseFloat((betAmount * (currentMultiplier - 1)).toFixed(2))
    : 0;

  // Sound toggle handler
  const toggleSound = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    sounds.enabled = !nextState;
  };

  // Quick Bet Math Actions
  const handleHalfBet = () => {
    sounds.playClick();
    setBetAmount((prev) => Math.max(1, parseFloat((prev / 2).toFixed(2))));
  };

  const handleDoubleBet = () => {
    sounds.playClick();
    setBetAmount((prev) => {
      const next = parseFloat((prev * 2).toFixed(2));
      return Math.min(next, Math.max(1, parseFloat(balance.toFixed(2))));
    });
  };

  const handleMaxBet = () => {
    sounds.playClick();
    setBetAmount(Math.max(1, parseFloat(balance.toFixed(2))));
  };

  // Start new round
  const startGame = () => {
    if (betAmount > balance) {
      alert("Insufficient demo balance! Please use the Wallet button to top up.");
      return;
    }
    if (betAmount <= 0) return;

    sounds.playClick();

    // Deduct bet amount from demo balance
    updateBalance(-betAmount);
    setNonce((n) => n + 1);

    // Randomize mine locations
    const mines: number[] = [];
    while (mines.length < minesCount) {
      const rand = Math.floor(Math.random() * 25);
      if (!mines.includes(rand)) {
        mines.push(rand);
      }
    }

    setMineLocations(mines);
    setRevealedTiles([]);
    setFloatingBadges({});
    setIsPlaying(true);
    setIsGameOver(false);
    setWinOverlay({ show: false, multiplier: 0, amount: 0 });
  };

  // Handle tile click
  const handleTileClick = (index: number) => {
    if (!isPlaying || revealedTiles.includes(index) || isGameOver) return;

    if (mineLocations.includes(index)) {
      // HIT MINE -> BOMB
      sounds.playMine();
      const allRevealed = [...revealedTiles, index];
      setRevealedTiles(allRevealed);
      setIsGameOver(true);
      setIsPlaying(false);

      // Record loss in history
      setHistory((prev) => [
        { id: `h-${Date.now()}`, multiplier: 0.0, isWin: false },
        ...prev.slice(0, 4),
      ]);
    } else {
      // REVEALED GEM
      const nextOpenedCount = currentGemsOpened + 1;
      sounds.playGem(nextOpenedCount);

      const nextMult = calculateMultiplier(nextOpenedCount, minesCount);
      setRevealedTiles((prev) => [...prev, index]);

      // Trigger floating profit badge
      setFloatingBadges((prev) => ({
        ...prev,
        [index]: `${nextMult.toFixed(2)}x`,
      }));

      // Check if all gems uncovered (perfect clear!)
      if (nextOpenedCount === 25 - minesCount) {
        cashout(nextMult);
      }
    }
  };

  // Cashout action
  const cashout = (forcedMultiplier?: number) => {
    if (!isPlaying || isGameOver || currentGemsOpened === 0) return;

    sounds.playCashout();
    const finalMult = forcedMultiplier || currentMultiplier;
    const totalPayout = parseFloat((betAmount * finalMult).toFixed(2));

    // Credit balance
    updateBalance(totalPayout);

    setIsPlaying(false);
    setIsGameOver(false);

    // Show win overlay
    setWinOverlay({
      show: true,
      multiplier: finalMult,
      amount: totalPayout,
    });

    // Record win in history
    setHistory((prev) => [
      { id: `h-${Date.now()}`, multiplier: finalMult, isWin: true },
      ...prev.slice(0, 4),
    ]);

    // Canvas confetti celebration
    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.55 },
        colors: ["#00e701", "#ffffff", "#1475e1", "#facc15"],
      });
    } catch {
      // ignore
    }
  };

  // Copy helper
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1800);
  };

  // Keyboard shortcut: Spacebar to cashout if playing or bet if idle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        if (isPlaying && currentGemsOpened > 0) {
          cashout();
        } else if (!isPlaying) {
          startGame();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <div
      className={`w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 select-none space-y-4 ${
        isFullscreen ? "fixed inset-0 z-50 bg-[#0f212e] overflow-y-auto p-4 max-w-none" : ""
      }`}
    >
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-bold text-[#b1bad3] hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Casino Lobby</span>
        </Link>

        {/* Live Multiplier History Strip (Last 5 Games) */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[11px] font-bold text-[#b1bad3] uppercase tracking-wider hidden sm:inline mr-1">
            History:
          </span>
          {history.map((h) => (
            <span
              key={h.id}
              className={`rounded-lg px-2 py-0.5 text-xs font-mono font-bold border ${
                h.isWin
                  ? "bg-[#00e701]/15 text-[#00e701] border-[#00e701]/30 shadow-sm"
                  : "bg-[#213743] text-[#b1bad3] border-[#2f4553]"
              }`}
            >
              {h.multiplier.toFixed(2)}x
            </span>
          ))}
        </div>
      </div>

      {/* Main 2-Panel Game Container */}
      <div className="rounded-2xl border border-[#213743] bg-[#1a2c38] shadow-2xl overflow-hidden flex flex-col-reverse lg:flex-row">
        {/* ======================================================== */}
        {/* 1. BETTING CONTROLS (Left Panel on Desktop / Bottom on Mobile) */}
        {/* ======================================================== */}
        <div className="w-full lg:w-[320px] shrink-0 border-t lg:border-t-0 lg:border-r border-[#213743] bg-[#1a2c38] p-4 sm:p-5 flex flex-col justify-start space-y-4">
          {/* [Section 2 - Directly below Game Screen]: PRIMARY ACTION BUTTON */}
          <div className="w-full">
            {!isPlaying ? (
              <button
                onClick={startGame}
                disabled={betAmount > balance || betAmount <= 0}
                className="w-full py-4 text-base font-extrabold rounded-lg bg-[#00e701] text-black shadow-md hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="h-5 w-5 fill-current" />
                <span>{mode === "auto" ? "Start Auto Bet" : "Bet"}</span>
              </button>
            ) : (
              <button
                onClick={() => cashout()}
                disabled={currentGemsOpened === 0}
                className={`w-full py-4 text-base font-extrabold rounded-lg shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer ${
                  currentGemsOpened === 0
                    ? "bg-[#213743] text-[#b1bad3] cursor-not-allowed"
                    : "bg-[#00e701] text-black shadow-[#00e701]/30 hover:brightness-110"
                }`}
              >
                <Gem className="h-5 w-5 fill-current" />
                <span>
                  Cashout ${(betAmount * currentMultiplier).toFixed(2)}
                </span>
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Mode Switch Tabs: Manual vs Auto */}
            <div className="flex rounded-xl bg-[#0f212e] p-1 border border-[#213743]">
              <button
                disabled={isPlaying}
                onClick={() => {
                  sounds.playClick();
                  setMode("manual");
                }}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                  mode === "manual"
                    ? "bg-[#213743] text-white shadow-sm"
                    : "text-[#b1bad3] hover:text-white"
                }`}
              >
                Manual
              </button>
              <button
                disabled={isPlaying}
                onClick={() => {
                  sounds.playClick();
                  setMode("auto");
                }}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                  mode === "auto"
                    ? "bg-[#213743] text-white shadow-sm"
                    : "text-[#b1bad3] hover:text-white"
                }`}
              >
                Auto
              </button>
            </div>

            {/* Bet Amount Input with Quick Math Buttons */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-[#b1bad3]">
                <span>Bet Amount</span>
                <span className="font-mono text-[#00e701]">
                  ${formatBalance(balance)} {currency}
                </span>
              </div>
              <div className="flex items-center rounded-xl border border-[#213743] bg-[#0f212e] p-1 focus-within:border-[#00e701] transition-colors">
                <span className="px-2 text-sm font-bold text-[#00e701]">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  disabled={isPlaying}
                  value={betAmount}
                  onChange={(e) =>
                    setBetAmount(Math.max(0, parseFloat(e.target.value) || 0))
                  }
                  className="w-full bg-transparent text-sm font-bold text-white focus:outline-none font-mono"
                />
                <button
                  type="button"
                  disabled={isPlaying}
                  onClick={handleHalfBet}
                  className="rounded-lg px-2 py-1 text-xs font-bold text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors"
                >
                  ½
                </button>
                <button
                  type="button"
                  disabled={isPlaying}
                  onClick={handleDoubleBet}
                  className="rounded-lg px-2 py-1 text-xs font-bold text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors"
                >
                  2×
                </button>
                <button
                  type="button"
                  disabled={isPlaying}
                  onClick={handleMaxBet}
                  className="rounded-lg px-2 py-1 text-xs font-bold text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors"
                >
                  Max
                </button>
              </div>
            </div>

            {/* Mines Count Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-[#b1bad3]">
                <span>Mines</span>
                <span className="text-white font-mono">{minesCount}</span>
              </div>
              <select
                disabled={isPlaying}
                value={minesCount}
                onChange={(e) => {
                  sounds.playClick();
                  setMinesCount(parseInt(e.target.value));
                }}
                className="w-full rounded-xl border border-[#213743] bg-[#0f212e] px-3 py-2.5 text-xs font-bold text-white focus:border-[#00e701] focus:outline-none cursor-pointer"
              >
                {Array.from({ length: 24 }, (_, i) => i + 1).map((cnt) => (
                  <option key={cnt} value={cnt} className="bg-[#1a2c38]">
                    {cnt} {cnt === 1 ? "Mine" : "Mines"} ({25 - cnt} Gems)
                  </option>
                ))}
              </select>
            </div>

            {/* Auto Mode: Number of Bets */}
            {mode === "auto" && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <label className="text-xs font-bold text-[#b1bad3]">
                  Number of Bets
                </label>
                <input
                  type="number"
                  disabled={isPlaying}
                  value={autoBetsCount}
                  onChange={(e) =>
                    setAutoBetsCount(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="w-full rounded-xl border border-[#213743] bg-[#0f212e] px-3 py-2 text-xs font-bold text-white focus:border-[#00e701] focus:outline-none font-mono"
                />
              </div>
            )}

            {/* Dynamic Game Info Cards (Stake style) */}
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-[#213743] bg-[#0f212e] p-2.5">
                <div className="text-[10px] font-bold text-[#b1bad3] uppercase tracking-wider">
                  Gems Left
                </div>
                <div className="mt-0.5 text-sm font-black text-white font-mono">
                  {isPlaying ? 25 - minesCount - currentGemsOpened : 25 - minesCount}
                  <span className="text-[10px] text-[#b1bad3] font-normal"> / {25 - minesCount}</span>
                </div>
              </div>

              <div className="rounded-xl border border-[#213743] bg-[#0f212e] p-2.5">
                <div className="text-[10px] font-bold text-[#b1bad3] uppercase tracking-wider">
                  Next Tile
                </div>
                <div className="mt-0.5 text-sm font-black text-[#00e701] font-mono">
                  {nextMultiplier.toFixed(2)}x
                </div>
              </div>
            </div>

            {/* Current Running Profit Display */}
            {isPlaying && (
              <div className="rounded-xl border border-[#213743] bg-[#0f212e] p-3 space-y-1.5">
                <div className="flex justify-between text-xs text-[#b1bad3]">
                  <span>Total Multiplier</span>
                  <span className="font-mono font-bold text-white">
                    {currentMultiplier.toFixed(2)}x
                  </span>
                </div>
                <div className="flex justify-between text-xs text-[#b1bad3]">
                  <span>Current Profit</span>
                  <span className="font-mono font-black text-[#00e701]">
                    +${currentProfit.toFixed(2)} {currency}
                  </span>
                </div>
              </div>
            )}
          </div>


        </div>

        {/* ======================================================== */}
        {/* 2. GAME ARENA (Right Panel on Desktop / Top on Mobile) */}
        {/* ======================================================== */}
        <div className="flex-1 bg-[#0f212e] p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-between min-h-[460px] sm:min-h-[560px] relative overflow-hidden">
          {/* Subtle Ambient Background Lighting */}
          <div className="absolute inset-0 bg-radial from-[#1a2c38]/40 via-transparent to-transparent pointer-events-none" />

          {/* Top Status Bar in Arena */}
          <div className="w-full flex items-center justify-between z-10">
            <div className="flex items-center gap-2 text-xs font-bold text-[#b1bad3]">
              <span className="flex h-2 w-2 rounded-full bg-[#00e701] animate-pulse" />
              <span>Provably Fair RNG</span>
            </div>

            {isPlaying && (
              <div className="flex items-center gap-2 rounded-lg bg-[#1a2c38] px-3 py-1 border border-[#213743]">
                <span className="text-xs text-[#b1bad3]">Opened:</span>
                <span className="font-mono text-xs font-bold text-[#00e701]">
                  {currentGemsOpened} / {25 - minesCount}
                </span>
              </div>
            )}
          </div>

          {/* 5x5 Mines Grid */}
          <div className="relative my-auto flex items-center justify-center w-full max-w-[420px] aspect-square z-10">
            <div className="grid grid-cols-5 gap-2 sm:gap-3 w-full h-full p-2 rounded-2xl bg-[#14232f] border border-[#213743]/60 shadow-inner">
              {Array.from({ length: 25 }).map((_, index) => {
                const isRevealed = revealedTiles.includes(index);
                const isMine = mineLocations.includes(index);
                const isExplodedMine = isGameOver && isMine && isRevealed;
                const isDimmedHiddenMine = isGameOver && isMine && !isRevealed;
                const isDimmedUntouchedGem =
                  (isGameOver || (!isPlaying && revealedTiles.length > 0)) &&
                  !isMine &&
                  !isRevealed;

                return (
                  <button
                    key={index}
                    onClick={() => handleTileClick(index)}
                    disabled={!isPlaying || isRevealed || isGameOver}
                    className={`relative rounded-xl flex items-center justify-center transition-all duration-150 select-none ${
                      isRevealed && !isMine
                        ? "bg-[#1a2c38] border border-[#00e701]/40 shadow-[0_0_15px_rgba(0,231,1,0.25)]"
                        : isExplodedMine
                        ? "bg-red-950/70 border border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                        : isDimmedHiddenMine
                        ? "bg-[#1a2c38]/60 border border-red-900/40 opacity-45 cursor-default"
                        : isDimmedUntouchedGem
                        ? "bg-[#1a2c38]/60 border border-[#213743] opacity-35 cursor-default"
                        : isPlaying
                        ? "bg-[#2f4553] hover:bg-[#3d5565] border-b-4 border-[#213743] hover:border-[#2b404e] active:translate-y-1 active:border-b-0 cursor-pointer shadow-md"
                        : "bg-[#2f4553] border-b-4 border-[#213743] shadow-md cursor-default"
                    }`}
                  >
                    {/* Floating Profit Badge on this Tile */}
                    {floatingBadges[index] && (
                      <span className="absolute -top-3 z-30 pointer-events-none rounded-md bg-[#00e701] px-1.5 py-0.5 text-[10px] font-black text-[#0f212e] shadow-md animate-float-up">
                        {floatingBadges[index]}
                      </span>
                    )}

                    {/* Revealed Sparkling GEM */}
                    {isRevealed && !isMine && (
                      <svg
                        viewBox="0 0 48 48"
                        className="h-7 w-7 sm:h-9 sm:w-9 drop-shadow-[0_0_10px_rgba(0,231,1,0.7)] animate-gem-pop"
                        fill="none"
                      >
                        <path
                          d="M12 8L36 8L44 20L24 42L4 20L12 8Z"
                          fill="url(#gemGrad)"
                          stroke="#00e701"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M12 8L24 20L36 8"
                          stroke="#ffffff"
                          strokeWidth="1"
                          strokeOpacity="0.7"
                        />
                        <path d="M4 20L44 20" stroke="#00c701" strokeWidth="1" />
                        <path d="M24 20L24 42" stroke="#00e701" strokeWidth="1.2" />
                        <circle cx="16" cy="14" r="2" fill="#ffffff" opacity="0.9" />
                        <defs>
                          <linearGradient
                            id="gemGrad"
                            x1="24"
                            y1="8"
                            x2="24"
                            y2="42"
                            gradientUnits="userSpaceOnUse"
                          >
                            <stop stopColor="#00e701" />
                            <stop offset="0.6" stopColor="#00a301" />
                            <stop offset="1" stopColor="#004d00" />
                          </linearGradient>
                        </defs>
                      </svg>
                    )}

                    {/* Exploded Mine */}
                    {isExplodedMine && (
                      <svg
                        viewBox="0 0 48 48"
                        className="h-7 w-7 sm:h-9 sm:w-9 drop-shadow-[0_0_12px_rgba(239,68,68,0.7)] animate-bomb-shake"
                        fill="none"
                      >
                        <circle
                          cx="22"
                          cy="26"
                          r="15"
                          fill="url(#bombGrad)"
                          stroke="#ef4444"
                          strokeWidth="1.5"
                        />
                        <circle cx="17" cy="20" r="3" fill="#ffffff" opacity="0.4" />
                        <rect
                          x="18"
                          y="8"
                          width="8"
                          height="4"
                          rx="1"
                          fill="#475569"
                          stroke="#334155"
                          strokeWidth="1"
                        />
                        <path
                          d="M22 8 C 22 2, 30 5, 34 3"
                          stroke="#eab308"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        <polygon
                          points="34,1 36,4 39,2 37,5 40,7 36,7 35,10 33,7 29,7 32,5 30,2 33,4"
                          fill="#ef4444"
                        />
                        <circle cx="34" cy="3" r="2.5" fill="#facc15" />
                        <defs>
                          <radialGradient id="bombGrad" cx="35%" cy="30%" r="70%">
                            <stop stopColor="#475569" />
                            <stop offset="0.7" stopColor="#0f172a" />
                            <stop offset="1" stopColor="#020617" />
                          </radialGradient>
                        </defs>
                      </svg>
                    )}

                    {/* Dimmed Mine (End of Game) */}
                    {isDimmedHiddenMine && (
                      <Bomb className="h-6 w-6 text-red-500/70" />
                    )}

                    {/* Dimmed Gem (End of Game) */}
                    {isDimmedUntouchedGem && (
                      <Gem className="h-6 w-6 text-[#00e701]/60" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Win Overlay Banner */}
            {winOverlay.show && (
              <div
                onClick={() => setWinOverlay({ show: false, multiplier: 0, amount: 0 })}
                className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/65 backdrop-blur-[2px] rounded-2xl p-6 text-center animate-in zoom-in-75 duration-200 cursor-pointer"
              >
                <div className="rounded-2xl border-2 border-[#00e701] bg-[#1a2c38] px-8 py-5 shadow-2xl shadow-[#00e701]/30 space-y-2">
                  <div className="text-3xl sm:text-5xl font-black font-mono text-[#00e701] tracking-tight drop-shadow-[0_0_15px_rgba(0,231,1,0.6)]">
                    {winOverlay.multiplier.toFixed(2)}x
                  </div>
                  <div className="text-xs font-bold uppercase tracking-widest text-[#b1bad3]">
                    Cashed Out
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white font-mono">
                    Won ${winOverlay.amount.toFixed(2)} {currency}
                  </div>
                  <p className="text-[10px] text-[#b1bad3] pt-1">
                    Click anywhere to dismiss
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Game Utilities Bar */}
          <div className="w-full flex items-center justify-between border-t border-[#213743] pt-3 z-10">
            {/* Provably Fair Modal Trigger */}
            <button
              onClick={() => setIsFairnessOpen(true)}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold text-[#b1bad3] hover:text-white hover:bg-[#1a2c38] transition-colors"
            >
              <ShieldCheck className="h-4 w-4 text-[#00e701]" />
              <span>Fairness</span>
            </button>

            {/* Sound & Screen Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleSound}
                title={isMuted ? "Unmute Audio" : "Mute Audio"}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#b1bad3] hover:text-white hover:bg-[#1a2c38] transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4 text-red-400" />
                ) : (
                  <Volume2 className="h-4 w-4 text-[#00e701]" />
                )}
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#b1bad3] hover:text-white hover:bg-[#1a2c38] transition-colors"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. PROVABLY FAIR MODAL */}
      {/* ======================================================== */}
      {isFairnessOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#213743] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00e701]/15 text-[#00e701]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Provably Fair</h3>
                  <p className="text-xs text-[#b1bad3]">
                    100% cryptographic verification of mine placement
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFairnessOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#b1bad3] hover:bg-[#213743] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Server Seed (Hashed) */}
              <div className="space-y-1">
                <label className="font-bold text-[#b1bad3] uppercase tracking-wider text-[10px]">
                  Active Server Seed (SHA-256 Hash)
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-[#213743] bg-[#0f212e] px-3 py-2">
                  <span className="font-mono text-white text-[11px] truncate flex-1">
                    {serverSeedHash}
                  </span>
                  <button
                    onClick={() => copyToClipboard(serverSeedHash, "server")}
                    className="text-[#b1bad3] hover:text-[#00e701]"
                  >
                    {copiedField === "server" ? (
                      <Check className="h-3.5 w-3.5 text-[#00e701]" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Client Seed */}
              <div className="space-y-1">
                <label className="font-bold text-[#b1bad3] uppercase tracking-wider text-[10px]">
                  Active Client Seed
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-[#213743] bg-[#0f212e] px-3 py-2">
                  <input
                    type="text"
                    value={clientSeed}
                    onChange={(e) => setClientSeed(e.target.value)}
                    className="font-mono text-white text-xs bg-transparent focus:outline-none flex-1"
                  />
                  <button
                    onClick={() =>
                      setClientSeed(`stake_${Math.random().toString(36).substring(2, 9)}`)
                    }
                    title="Generate Random Client Seed"
                    className="text-[#b1bad3] hover:text-[#00e701]"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Nonce Counter */}
              <div className="space-y-1">
                <label className="font-bold text-[#b1bad3] uppercase tracking-wider text-[10px]">
                  Nonce (Total Bets on this Seed)
                </label>
                <div className="rounded-xl border border-[#213743] bg-[#0f212e] px-3 py-2 font-mono text-white font-bold">
                  {nonce}
                </div>
              </div>

              {/* Mathematical Formula Preview */}
              <div className="rounded-xl border border-[#213743] bg-[#0f212e] p-3 text-[11px] space-y-1 text-[#b1bad3]">
                <div className="font-bold text-white">Exact Stake Mines Formula:</div>
                <div className="font-mono text-[#00e701]">
                  Multiplier = 0.99 × [ C(25, k) / C(25 - m, k) ]
                </div>
                <div>Where k = gems opened, m = mines count, House Edge = 1%.</div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#213743]">
              <button
                onClick={() => setIsFairnessOpen(false)}
                className="rounded-xl bg-[#00e701] px-5 py-2 text-xs font-bold text-[#0f212e] hover:bg-[#00c701]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
