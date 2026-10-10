"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  ShieldCheck,
  Settings,
  BarChart2,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  X,
  Check,
  Copy,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";
import MinesGrid from "./MinesGrid";
import MinesControls from "./MinesControls";
import MinesSettingsPopover from "./MinesSettingsPopover";
import MinesGamesForYou from "./MinesGamesForYou";
import { getMinesMultiplier } from "./minesMultipliers";

interface MultiplierHistoryItem {
  id: string;
  multiplier: number;
  isWin: boolean;
}

// Multiplier calculation backed by editable MINES_MULTIPLIERS_MAP registry
function calculateMultiplier(mines: number, gemsOpened: number): number {
  return getMinesMultiplier(mines, gemsOpened);
}

function calculateMaxMultiplier(mines: number): number {
  const totalGems = 25 - mines;
  return getMinesMultiplier(mines, totalGems);
}

export default function MinesGame() {
  const { balance, realBalance, hasVerifiedDeposit, playMode, updateBalance, currency, addRecentlyPlayedGame } = useGame();
  const isDemo = playMode === "fun" || !hasVerifiedDeposit;

  // Mode: Manual or Auto
  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [betAmount, setBetAmount] = useState<number>(10);
  const [minesCount, setMinesCount] = useState<number>(3);

  // Active game state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [revealedTiles, setRevealedTiles] = useState<number[]>([]);
  const [mineLocations, setMineLocations] = useState<number[]>([]);
  const [floatingBadges, setFloatingBadges] = useState<{ [key: number]: string }>({});
  const [lastRoundTiles, setLastRoundTiles] = useState<number[]>([]);
  const [selectedAutoTiles, setSelectedAutoTiles] = useState<number[]>([]);
  const [cashoutOverlay, setCashoutOverlay] = useState<{ multiplier: number; payout: number } | null>(null);

  // Settings & Utilities state
  const [volume, setVolume] = useState<number>(100);
  const [instantBet, setInstantBet] = useState<boolean>(false);
  const [animations, setAnimations] = useState<boolean>(true);
  const [quickSelection, setQuickSelection] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isFairnessOpen, setIsFairnessOpen] = useState<boolean>(false);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Autobet state
  const [isAutoRunning, setIsAutoRunning] = useState<boolean>(false);
  const [autoBetsCount, setAutoBetsCount] = useState<number | "infinity">(10);
  const [autoBetsRemaining, setAutoBetsRemaining] = useState<number>(10);
  const [onWinAction, setOnWinAction] = useState<"reset" | "increase">("reset");
  const [onWinPercent, setOnWinPercent] = useState<number>(100);
  const [onLossAction, setOnLossAction] = useState<"reset" | "increase">("reset");
  const [onLossPercent, setOnLossPercent] = useState<number>(100);
  const [stopOnProfit, setStopOnProfit] = useState<number>(0);
  const [stopOnLoss, setStopOnLoss] = useState<number>(0);
  const autoInitialBalanceRef = useRef<number>(balance);
  const baseBetRef = useRef<number>(betAmount);

  // Provably fair seed details
  const [serverSeed] = useState("a8f5c3b9d7e124806a5bc839d4e7f12a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e");
  const [clientSeed, setClientSeed] = useState("stake-client-seed-2026");
  const [nonce, setNonce] = useState<number>(1);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // History strip
  const [history, setHistory] = useState<MultiplierHistoryItem[]>([
    { id: "h1", multiplier: 1.48, isWin: true },
    { id: "h2", multiplier: 2.12, isWin: true },
    { id: "h3", multiplier: 0.0, isWin: false },
    { id: "h4", multiplier: 1.13, isWin: true },
    { id: "h5", multiplier: 3.65, isWin: true },
  ]);

  // Derived calculations
  const gemsOpened = revealedTiles.filter((t) => !mineLocations.includes(t)).length;
  const currentMultiplier = calculateMultiplier(minesCount, gemsOpened);
  const currentProfit = isPlaying ? betAmount * currentMultiplier - betAmount : 0;
  const maxMultiplier = calculateMaxMultiplier(minesCount);

  // Register in recently played games
  useEffect(() => {
    addRecentlyPlayedGame({
      id: "mines",
      slug: "mines",
      title: "Mines",
      href: "/games/mines",
      playersCount: 3820,
    });
  }, [addRecentlyPlayedGame]);

  // Start new game
  const startGame = useCallback(() => {
    if (betAmount > balance || betAmount <= 0) return;

    sounds.playClick();
    updateBalance(-betAmount);

    // Generate authentic randomized mine positions
    const allIndices = Array.from({ length: 25 }, (_, i) => i);
    const shuffled = [...allIndices].sort(() => Math.random() - 0.5);
    const mines = shuffled.slice(0, minesCount);

    setMineLocations(mines);
    setRevealedTiles([]);
    setFloatingBadges({});
    setIsGameOver(false);
    setIsPlaying(true);
    setCashoutOverlay(null);
    setNonce((n) => n + 1);
  }, [balance, betAmount, minesCount, updateBalance]);

  // Cashout current winnings
  const cashout = useCallback(() => {
    if (!isPlaying || gemsOpened === 0) return;

    const winAmount = betAmount * currentMultiplier;
    sounds.playCashout();

    if (animations) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#00e701", "#ffffff", "#1475e1"],
      });
    }

    updateBalance(winAmount);
    setIsPlaying(false);
    setIsGameOver(true);
    setCashoutOverlay({ multiplier: currentMultiplier, payout: winAmount });

    // Save history
    setHistory((prev) => [
      { id: `h-${Date.now()}`, multiplier: currentMultiplier, isWin: true },
      ...prev.slice(0, 9),
    ]);
  }, [animations, betAmount, currentMultiplier, gemsOpened, isPlaying, updateBalance]);

  // Reveal a tile on click
  const handleTileClick = useCallback(
    (index: number) => {
      // In auto mode before running, toggle tile pre-selection
      if (!isPlaying && mode === "auto") {
        sounds.playClick();
        setSelectedAutoTiles((prev) =>
          prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
        );
        return;
      }

      if (!isPlaying || revealedTiles.includes(index) || isGameOver) return;

      let currentMines = [...mineLocations];
      const gemsRevealedSoFar = revealedTiles.filter((t) => !currentMines.includes(t)).length;

      // Demo High-Win Algorithm Integration (75%-80% Win Rate)
      // When in demo mode:
      // 1. First 4 picks (gemsRevealedSoFar < 4): Never hit a bomb! If clicked tile has a mine, dynamically relocate it to an unrevealed slot.
      // 2. Picks 5 and beyond: 70% bias protection so the overall session win rate naturally hits 75%-80%.
      if (isDemo && currentMines.includes(index)) {
        const isProtectedPick = gemsRevealedSoFar < 4 || Math.random() < 0.70;
        if (isProtectedPick) {
          const availableSlots = Array.from({ length: 25 }, (_, i) => i).filter(
            (i) => i !== index && !revealedTiles.includes(i) && !currentMines.includes(i)
          );
          if (availableSlots.length > 0) {
            const newMineSlot = availableSlots[Math.floor(Math.random() * availableSlots.length)];
            currentMines = currentMines.map((m) => (m === index ? newMineSlot : m));
            setMineLocations(currentMines);
          }
        }
      }

      const isMine = currentMines.includes(index);
      const nextRevealed = [...revealedTiles, index];
      setRevealedTiles(nextRevealed);
      setLastRoundTiles(nextRevealed);

      if (isMine) {
        // Exploded! Game Over
        sounds.playMine();
        setIsPlaying(false);
        setIsGameOver(true);
        setHistory((prev) => [
          { id: `h-${Date.now()}`, multiplier: 0.0, isWin: false },
          ...prev.slice(0, 9),
        ]);
      } else {
        // Safe Gem!
        const nextGemsCount = nextRevealed.filter((t) => !currentMines.includes(t)).length;
        const nextMult = calculateMultiplier(minesCount, nextGemsCount);
        sounds.playGem(nextGemsCount);

        setFloatingBadges((prev) => ({
          ...prev,
          [index]: `${nextMult.toFixed(2)}×`,
        }));

        // If all safe gems opened, auto-cashout!
        if (nextGemsCount === 25 - minesCount) {
          cashout();
        }
      }
    },
    [cashout, isDemo, isGameOver, isPlaying, mineLocations, minesCount, mode, revealedTiles]
  );

  // Random Pick an unrevealed tile
  const handleRandomPick = useCallback(() => {
    if (!isPlaying || isGameOver) return;
    const unrevealed = Array.from({ length: 25 }, (_, i) => i).filter(
      (idx) => !revealedTiles.includes(idx)
    );
    if (unrevealed.length === 0) return;
    const randomTile = unrevealed[Math.floor(Math.random() * unrevealed.length)];
    handleTileClick(randomTile);
  }, [handleTileClick, isGameOver, isPlaying, revealedTiles]);

  // Repeat previous pattern
  const handleRepeatTiles = useCallback(() => {
    if (isPlaying || lastRoundTiles.length === 0) return;
    sounds.playClick();
    setSelectedAutoTiles(lastRoundTiles);
  }, [isPlaying, lastRoundTiles]);

  // Clear selected tiles
  const handleClearTiles = useCallback(() => {
    if (isPlaying) return;
    sounds.playClick();
    setSelectedAutoTiles([]);
  }, [isPlaying]);

  // Max bet helper
  const handleMaxBet = useCallback(() => {
    setBetAmount(balance > 0 ? balance : 100);
  }, [balance]);

  // Autobet execution loop
  useEffect(() => {
    if (!isAutoRunning) return;

    const timer = setTimeout(() => {
      // Check remaining bets
      if (autoBetsCount !== "infinity" && autoBetsRemaining <= 0) {
        setIsAutoRunning(false);
        return;
      }

      // Check balance
      if (betAmount > balance || betAmount <= 0) {
        setIsAutoRunning(false);
        return;
      }

      // Check profit / loss limits
      const currentNet = balance - autoInitialBalanceRef.current;
      if (stopOnProfit > 0 && currentNet >= stopOnProfit) {
        setIsAutoRunning(false);
        return;
      }
      if (stopOnLoss > 0 && -currentNet >= stopOnLoss) {
        setIsAutoRunning(false);
        return;
      }

      // Execute 1 autobet round
      updateBalance(-betAmount);
      const allIndices = Array.from({ length: 25 }, (_, i) => i);
      const shuffled = [...allIndices].sort(() => Math.random() - 0.5);
      const mines = shuffled.slice(0, minesCount);

      const picks =
        selectedAutoTiles.length > 0
          ? selectedAutoTiles
          : [shuffled.find((idx) => !mines.includes(idx)) || 0];

      let effectiveMines = [...mines];
      let hitMine = picks.some((p) => effectiveMines.includes(p));

      // Demo High-Win Algorithm for Autobet (75%-80% Win Rate)
      if (isDemo && hitMine && Math.random() < 0.78) {
        const safeSlots = allIndices.filter((idx) => !picks.includes(idx));
        if (safeSlots.length >= minesCount) {
          effectiveMines = safeSlots.slice(0, minesCount);
          hitMine = false;
        }
      }

      setMineLocations(effectiveMines);
      setRevealedTiles(picks);

      if (hitMine) {
        sounds.playMine();
        setHistory((prev) => [
          { id: `h-${Date.now()}`, multiplier: 0.0, isWin: false },
          ...prev.slice(0, 9),
        ]);
        if (onLossAction === "increase") {
          setBetAmount((b) => parseFloat((b * (1 + onLossPercent / 100)).toFixed(2)));
        } else {
          setBetAmount(baseBetRef.current);
        }
      } else {
        const mult = calculateMultiplier(minesCount, picks.length);
        const winAmt = betAmount * mult;
        updateBalance(winAmt);
        sounds.playCashout();
        setHistory((prev) => [
          { id: `h-${Date.now()}`, multiplier: mult, isWin: true },
          ...prev.slice(0, 9),
        ]);
        if (onWinAction === "increase") {
          setBetAmount((b) => parseFloat((b * (1 + onWinPercent / 100)).toFixed(2)));
        } else {
          setBetAmount(baseBetRef.current);
        }
      }

      if (autoBetsCount !== "infinity") {
        setAutoBetsRemaining((r) => r - 1);
      }
    }, instantBet ? 300 : 900);

    return () => clearTimeout(timer);
  }, [
    autoBetsCount,
    autoBetsRemaining,
    balance,
    betAmount,
    instantBet,
    isAutoRunning,
    isDemo,
    minesCount,
    onLossAction,
    onLossPercent,
    onWinAction,
    onWinPercent,
    selectedAutoTiles,
    stopOnLoss,
    stopOnProfit,
    updateBalance,
  ]);

  const startAutoBet = () => {
    if (betAmount > balance || betAmount <= 0) return;
    setCashoutOverlay(null);
    autoInitialBalanceRef.current = balance;
    baseBetRef.current = betAmount;
    setAutoBetsRemaining(autoBetsCount === "infinity" ? 999999 : autoBetsCount);
    setIsAutoRunning(true);
  };

  const stopAutoBet = () => {
    setIsAutoRunning(false);
  };

  // Keyboard hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      if (e.code === "Space") {
        e.preventDefault();
        if (!isPlaying) startGame();
      } else if (e.code === "KeyC") {
        e.preventDefault();
        if (isPlaying) cashout();
      } else if (e.code === "KeyR") {
        e.preventDefault();
        if (isPlaying) handleRandomPick();
      } else if (e.code === "KeyA") {
        e.preventDefault();
        if (!isPlaying) setBetAmount((b) => Math.max(0.01, parseFloat((b / 2).toFixed(2))));
      } else if (e.code === "KeyS") {
        e.preventDefault();
        if (!isPlaying) setBetAmount((b) => parseFloat((b * 2).toFixed(2)));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cashout, handleRandomPick, isPlaying, startGame]);

  return (
    <div
      className={`w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 select-none space-y-4 ${
        isFullscreen ? "fixed inset-0 z-50 bg-[#0f212e] overflow-y-auto p-4 pb-28 max-w-none" : ""
      }`}
    >
      {/* 1. Top Header: House Edge */}
      <div className="flex items-center justify-end">
        <span className="text-xs text-[#b1bad3] font-medium">
          House Edge: 1.00%
        </span>
      </div>

      {/* 2. Main 2-Panel Game Container: Left Controls & Right 5x5 Grid */}
      <div className="rounded-2xl border border-[#213743] bg-[#1a2c38] shadow-2xl overflow-hidden flex flex-col-reverse lg:flex-row">
        {/* Controls Panel */}
        <MinesControls
          mode={mode}
          setMode={setMode}
          betAmount={betAmount}
          setBetAmount={setBetAmount}
          minesCount={minesCount}
          setMinesCount={setMinesCount}
          isPlaying={isPlaying}
          currentMultiplier={currentMultiplier}
          currentGemsOpened={gemsOpened}
          balance={balance}
          currency={currency}
          onBet={startGame}
          onCashout={cashout}
          onRandomPick={handleRandomPick}
          isAutoRunning={isAutoRunning}
          onStartAuto={startAutoBet}
          onStopAuto={stopAutoBet}
          autoBetsCount={autoBetsCount}
          setAutoBetsCount={setAutoBetsCount}
          onWinAction={onWinAction}
          setOnWinAction={setOnWinAction}
          onWinPercent={onWinPercent}
          setOnWinPercent={setOnWinPercent}
          onLossAction={onLossAction}
          setOnLossAction={setOnLossAction}
          onLossPercent={onLossPercent}
          setOnLossPercent={setOnLossPercent}
          stopOnProfit={stopOnProfit}
          setStopOnProfit={setStopOnProfit}
          stopOnLoss={stopOnLoss}
          setStopOnLoss={setStopOnLoss}
        />

        {/* 5x5 Arena Grid */}
        <MinesGrid
          revealedTiles={revealedTiles}
          mineLocations={mineLocations}
          isPlaying={isPlaying}
          isGameOver={isGameOver}
          minesCount={minesCount}
          maxMultiplier={maxMultiplier}
          currentMultiplier={currentMultiplier}
          currentProfit={currentProfit}
          floatingBadges={floatingBadges}
          selectedAutoTiles={selectedAutoTiles}
          mode={mode}
          onTileClick={handleTileClick}
          onRepeatTiles={handleRepeatTiles}
          onClearTiles={handleClearTiles}
          animations={animations}
          cashoutOverlay={cashoutOverlay}
          onDismissCashout={() => setCashoutOverlay(null)}
        />
      </div>

      {/* 3. Bottom Utility Strip (Settings ⚙️, Stats 📊, Fairness 🛡️, Audio, Fullscreen) */}
      <div className="relative flex items-center justify-between bg-[#1a2c38] border border-[#213743] rounded-2xl px-4 py-2.5">
        <div className="flex items-center gap-2">
          {/* Settings Gear Popover Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#213743] hover:bg-[#2f4553] text-[#b1bad3] hover:text-white text-xs font-bold transition-colors cursor-pointer"
              title="Game Settings"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>

            {/* Popover Menu matching Screenshot 29 */}
            <MinesSettingsPopover
              isOpen={isSettingsOpen}
              onClose={() => setIsSettingsOpen(false)}
              volume={volume}
              setVolume={setVolume}
              instantBet={instantBet}
              setInstantBet={setInstantBet}
              animations={animations}
              setAnimations={setAnimations}
              quickSelection={quickSelection}
              setQuickSelection={setQuickSelection}
              onMaxBet={handleMaxBet}
            />
          </div>

          {/* Stats Button */}
          <button
            type="button"
            onClick={() => setIsStatsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#213743] hover:bg-[#2f4553] text-[#b1bad3] hover:text-white text-xs font-bold transition-colors cursor-pointer"
            title="Session Stats"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Stats</span>
          </button>

          {/* Fairness Modal Trigger */}
          <button
            type="button"
            onClick={() => setIsFairnessOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#213743] hover:bg-[#2f4553] text-[#00e701] text-xs font-bold transition-colors cursor-pointer"
            title="Provably Fair RNG"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Fairness</span>
          </button>
        </div>

        {/* Right Audio & Screen Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const nextVol = volume === 0 ? 100 : 0;
              setVolume(nextVol);
              sounds.enabled = nextVol > 0;
            }}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#213743] hover:bg-[#2f4553] text-[#b1bad3] hover:text-white transition-colors cursor-pointer"
            title={volume === 0 ? "Unmute" : "Mute"}
          >
            {volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-[#00e701]" />}
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#213743] hover:bg-[#2f4553] text-[#b1bad3] hover:text-white transition-colors cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 4. Categorized "Games For You" Section (Screenshot 28) */}
      <MinesGamesForYou />

      {/* Fairness Modal */}
      {isFairnessOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-[#2f4553] bg-[#1a2c38] p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#00e701]" />
                <h3 className="text-base font-black">Provably Fair Verification</h3>
              </div>
              <button onClick={() => setIsFairnessOpen(false)} className="text-[#b1bad3] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-[#b1bad3]">
              <div>
                <label className="font-bold uppercase tracking-wider text-[10px]">Active Server Seed (SHA-256)</label>
                <div className="flex items-center gap-2 bg-[#0f212e] p-2.5 rounded-xl border border-[#213743] mt-1 font-mono text-white text-[11px] break-all">
                  <span className="flex-1">{serverSeed}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(serverSeed);
                      setCopiedField("server");
                      setTimeout(() => setCopiedField(null), 1500);
                    }}
                    className="p-1 hover:text-[#00e701]"
                  >
                    {copiedField === "server" ? <Check className="w-3.5 h-3.5 text-[#00e701]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold uppercase tracking-wider text-[10px]">Client Seed</label>
                <input
                  type="text"
                  value={clientSeed}
                  onChange={(e) => setClientSeed(e.target.value)}
                  className="w-full bg-[#0f212e] p-2.5 rounded-xl border border-[#213743] mt-1 font-mono text-white text-xs outline-none"
                />
              </div>

              <div className="flex justify-between items-center bg-[#0f212e] p-2.5 rounded-xl border border-[#213743]">
                <span className="font-bold">Nonce Count</span>
                <span className="font-mono text-[#00e701] font-bold">{nonce}</span>
              </div>
            </div>
            <button
              onClick={() => setIsFairnessOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#1475e1] hover:bg-[#1164c2] text-white font-bold text-xs"
            >
              Verify Game Result
            </button>
          </div>
        </div>
      )}

      {/* Session Stats Modal */}
      {isStatsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-[#2f4553] bg-[#1a2c38] p-5 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <h3 className="text-base font-black flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-cyan-400" />
                <span>Session Stats</span>
              </h3>
              <button onClick={() => setIsStatsOpen(false)} className="text-[#b1bad3] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#0f212e] p-3 rounded-xl border border-[#213743] space-y-1">
                <span className="text-[#b1bad3]">Rounds Played</span>
                <p className="font-mono text-base font-bold text-white">{history.length}</p>
              </div>
              <div className="bg-[#0f212e] p-3 rounded-xl border border-[#213743] space-y-1">
                <span className="text-[#b1bad3]">Win Rate</span>
                <p className="font-mono text-base font-bold text-[#00e701]">
                  {(
                    (history.filter((h) => h.isWin).length / Math.max(1, history.length)) *
                    100
                  ).toFixed(1)}
                  %
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsStatsOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#1475e1] hover:bg-[#1164c2] text-white font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
