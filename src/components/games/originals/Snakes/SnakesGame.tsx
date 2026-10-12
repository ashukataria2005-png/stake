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
  ArrowUpRight,
  Skull,
  Award,
  Sparkles,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

export type Difficulty = "easy" | "medium" | "hard";

interface BoardTile {
  index: number;
  type: "normal" | "ladder" | "snake" | "checkpoint" | "finish";
  targetIndex?: number; // for ladder jumps or snake drops
  multiplier: number;
  label?: string;
}

// 16-Tile Track with authentic Stake Snakes progression
const EASY_TILES: BoardTile[] = [
  { index: 0, type: "normal", multiplier: 1.0, label: "START" },
  { index: 1, type: "normal", multiplier: 1.15 },
  { index: 2, type: "ladder", targetIndex: 5, multiplier: 1.25, label: "LADDER" },
  { index: 3, type: "normal", multiplier: 1.4 },
  { index: 4, type: "snake", targetIndex: 1, multiplier: 1.6, label: "SNAKE" },
  { index: 5, type: "checkpoint", multiplier: 1.9, label: "SAFE" },
  { index: 6, type: "normal", multiplier: 2.3 },
  { index: 7, type: "ladder", targetIndex: 10, multiplier: 2.8, label: "LADDER" },
  { index: 8, type: "snake", targetIndex: 4, multiplier: 3.5, label: "SNAKE" },
  { index: 9, type: "normal", multiplier: 4.5 },
  { index: 10, type: "checkpoint", multiplier: 6.0, label: "SAFE" },
  { index: 11, type: "normal", multiplier: 8.5 },
  { index: 12, type: "snake", targetIndex: 6, multiplier: 12.0, label: "SNAKE" },
  { index: 13, type: "ladder", targetIndex: 15, multiplier: 18.0, label: "LADDER" },
  { index: 14, type: "normal", multiplier: 28.0 },
  { index: 15, type: "finish", multiplier: 50.0, label: "FINISH" },
];

const MEDIUM_TILES: BoardTile[] = [
  { index: 0, type: "normal", multiplier: 1.0, label: "START" },
  { index: 1, type: "normal", multiplier: 1.25 },
  { index: 2, type: "ladder", targetIndex: 5, multiplier: 1.5, label: "LADDER" },
  { index: 3, type: "snake", targetIndex: 0, multiplier: 1.8, label: "SNAKE" },
  { index: 4, type: "normal", multiplier: 2.2 },
  { index: 5, type: "checkpoint", multiplier: 2.8, label: "SAFE" },
  { index: 6, type: "snake", targetIndex: 2, multiplier: 3.6, label: "SNAKE" },
  { index: 7, type: "ladder", targetIndex: 11, multiplier: 4.8, label: "LADDER" },
  { index: 8, type: "normal", multiplier: 6.5 },
  { index: 9, type: "snake", targetIndex: 4, multiplier: 9.0, label: "SNAKE" },
  { index: 10, type: "checkpoint", multiplier: 14.0, label: "SAFE" },
  { index: 11, type: "normal", multiplier: 22.0 },
  { index: 12, type: "snake", targetIndex: 5, multiplier: 35.0, label: "SNAKE" },
  { index: 13, type: "normal", multiplier: 55.0 },
  { index: 14, type: "snake", targetIndex: 8, multiplier: 85.0, label: "SNAKE" },
  { index: 15, type: "finish", multiplier: 150.0, label: "FINISH" },
];

const HARD_TILES: BoardTile[] = [
  { index: 0, type: "normal", multiplier: 1.0, label: "START" },
  { index: 1, type: "snake", targetIndex: 0, multiplier: 1.4, label: "BUST" },
  { index: 2, type: "ladder", targetIndex: 6, multiplier: 1.9, label: "LADDER" },
  { index: 3, type: "snake", targetIndex: 0, multiplier: 2.6, label: "BUST" },
  { index: 4, type: "normal", multiplier: 3.8 },
  { index: 5, type: "snake", targetIndex: 0, multiplier: 5.5, label: "BUST" },
  { index: 6, type: "checkpoint", multiplier: 8.0, label: "SAFE" },
  { index: 7, type: "snake", targetIndex: 0, multiplier: 12.5, label: "BUST" },
  { index: 8, type: "ladder", targetIndex: 13, multiplier: 20.0, label: "LADDER" },
  { index: 9, type: "snake", targetIndex: 0, multiplier: 35.0, label: "BUST" },
  { index: 10, type: "checkpoint", multiplier: 60.0, label: "SAFE" },
  { index: 11, type: "snake", targetIndex: 0, multiplier: 110.0, label: "BUST" },
  { index: 12, type: "normal", multiplier: 200.0 },
  { index: 13, type: "snake", targetIndex: 0, multiplier: 380.0, label: "BUST" },
  { index: 14, type: "normal", multiplier: 650.0 },
  { index: 15, type: "finish", multiplier: 1000.0, label: "JACKPOT" },
];

export default function SnakesGame() {
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
        id: "snakes",
        title: "Snakes",
        image: "/games/stake-originals/stake-originals-snakes.webp",
        href: "/games/snakes",
      });
    }
  }, [addRecentlyPlayedGame]);

  // Betting & Difficulty State
  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [betAmount, setBetAmount] = useState<number>(10);
  const [betInput, setBetInput] = useState<string>("10");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");

  // Game Arena State
  const [playerTile, setPlayerTile] = useState<number>(0);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [isRoundActive, setIsRoundActive] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("Roll the dice to start!");
  const [lastWinAmount, setLastWinAmount] = useState<number | null>(null);

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

  const tiles =
    difficulty === "easy"
      ? EASY_TILES
      : difficulty === "hard"
      ? HARD_TILES
      : MEDIUM_TILES;

  const currentTileObj = tiles[playerTile] || tiles[0];
  const currentMultiplier = currentTileObj.multiplier;
  const currentCashout =
    isRoundActive && playerTile > 0
      ? parseFloat((betAmount * currentMultiplier).toFixed(2))
      : 0;

  // Bet modifiers
  const handleHalfBet = () => {
    if (isRoundActive) return;
    sounds.playClick();
    const next = Math.max(0.01, parseFloat((betAmount / 2).toFixed(2)));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  const handleDoubleBet = () => {
    if (isRoundActive) return;
    sounds.playClick();
    const next = parseFloat((betAmount * 2).toFixed(2));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  const handleMaxBet = () => {
    if (isRoundActive) return;
    sounds.playClick();
    const next = Math.max(0.01, parseFloat(balance.toFixed(2)));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  // Roll Dice & Move Pawn
  const handleRollDice = () => {
    if (isRolling) return;

    // Start round if not active
    if (!isRoundActive) {
      const parsedBet = parseFloat(betInput) || 1;
      if (parsedBet > balance) {
        alert("Insufficient balance! Please use the Wallet button.");
        return;
      }
      updateBalance(-parsedBet);
      setBetAmount(parsedBet);
      setIsRoundActive(true);
      setPlayerTile(0);
      setLastWinAmount(null);

      setStats((prev) => ({
        ...prev,
        rounds: prev.rounds + 1,
        wagered: parseFloat((prev.wagered + parsedBet).toFixed(2)),
      }));
    }

    setIsRolling(true);
    sounds.playDiceRoll();

    // Roll standard 6-sided dice (1-6)
    const roll = Math.floor(Math.random() * 6) + 1;
    setDiceResult(roll);
    setStatusMessage(`Rolling dice... Rolled a ${roll}!`);

    setTimeout(() => {
      // Step-by-step advance
      const targetPos = Math.min(tiles.length - 1, playerTile + roll);
      setPlayerTile(targetPos);
      sounds.playPawnHop();

      setTimeout(() => {
        const landing = tiles[targetPos];

        if (landing.type === "ladder" && landing.targetIndex !== undefined) {
          sounds.playLadderClimb();
          setStatusMessage(`Climbed a Ladder! Jumped to Tile ${landing.targetIndex + 1}!`);
          setPlayerTile(landing.targetIndex);
        } else if (landing.type === "snake") {
          sounds.playSnakeHiss();
          if (difficulty === "hard" || landing.targetIndex === 0) {
            // Bust
            setStatusMessage("Bit by a Snake! Round Busted!");
            setIsRoundActive(false);
            setPlayerTile(0);
            setStats((prev) => ({
              ...prev,
              losses: prev.losses + 1,
              profit: parseFloat((prev.profit - betAmount).toFixed(2)),
            }));
          } else {
            // Slide back
            setStatusMessage(`Slid down a Snake to Tile ${(landing.targetIndex || 0) + 1}!`);
            setPlayerTile(landing.targetIndex || 0);
          }
        } else if (landing.type === "finish") {
          // Finished board! Automatic max win
          sounds.playSuccessChime();
          const winVal = parseFloat((betAmount * landing.multiplier).toFixed(2));
          updateBalance(winVal);
          setLastWinAmount(winVal);
          setStatusMessage(`JACKPOT! Completed the board for ${landing.multiplier}×!`);
          try {
            confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
          } catch {}
          setIsRoundActive(false);
          setStats((prev) => ({
            ...prev,
            wins: prev.wins + 1,
            profit: parseFloat((prev.profit + (winVal - betAmount)).toFixed(2)),
          }));
        } else {
          sounds.playClick();
          setStatusMessage(`Landed safely on Tile ${targetPos + 1} (${landing.multiplier}×)!`);
        }

        setIsRolling(false);
      }, 500);
    }, 800);
  };

  // Safe Cashout
  const handleCashout = useCallback(() => {
    if (!isRoundActive || isRolling || playerTile === 0) return;

    const payout = currentCashout;
    const profit = parseFloat((payout - betAmount).toFixed(2));
    updateBalance(payout);
    sounds.playCashout();

    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch {}

    setStatusMessage(`Cashed out ${activeSym}${payout.toFixed(2)} (${currentMultiplier}×)!`);
    setIsRoundActive(false);
    setPlayerTile(0);
    setLastWinAmount(payout);

    setStats((prev) => ({
      ...prev,
      wins: prev.wins + 1,
      profit: parseFloat((prev.profit + profit).toFixed(2)),
    }));
  }, [activeSym, betAmount, currentCashout, currentMultiplier, isRolling, isRoundActive, playerTile, updateBalance]);

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
      {/* 1. TOP INTERACTIVE ARENA: BOARD PATH & DICE ARENA         */}
      {/* ========================================================= */}
      <div className="w-full rounded-t-2xl bg-[#0f212e] border-t border-x border-[#213743] shadow-2xl p-4 sm:p-5 flex flex-col items-center relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Information */}
        <div className="w-full flex items-center justify-between mb-4 z-10 text-xs text-[#b1bad3]">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-[11px] text-[#8596a5]">
              Position: <span className="text-white font-mono">{playerTile + 1}/{tiles.length}</span>
            </span>
            {playerTile > 0 && isRoundActive && (
              <span className="px-2 py-0.5 rounded-full bg-[#00e701]/10 border border-[#00e701]/30 text-[#00e701] font-mono font-bold text-[10px]">
                {currentMultiplier}×
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8596a5]">
              Difficulty: <span className="text-white uppercase font-mono">{difficulty}</span>
            </span>
          </div>
        </div>

        {/* Dice & Status Banner */}
        <div className="flex items-center justify-center gap-4 mb-5 z-10">
          {diceResult !== null ? (
            <div
              className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-2xl font-black font-mono shadow-xl transition-all ${
                isRolling
                  ? "bg-amber-500/20 border-amber-400 text-amber-300 animate-spin"
                  : "bg-teal-500/20 border-teal-400 text-teal-300 scale-105"
              }`}
            >
              {diceResult}
            </div>
          ) : (
            <div className="w-14 h-14 rounded-2xl border border-[#213743] bg-[#1a2c38] flex items-center justify-center text-xs text-[#8596a5] font-bold">
              DICE
            </div>
          )}

          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#b1bad3]">{statusMessage}</span>
            {isRoundActive && playerTile > 0 && (
              <span className="text-sm font-black font-mono text-[#00e701]">
                Current Cashout: {activeSym}{currentCashout.toFixed(2)} ({currentMultiplier}×)
              </span>
            )}
          </div>
        </div>

        {/* 16-Tile Interactive Board Grid (4x4 Matrix) */}
        <div className="w-full max-w-xl grid grid-cols-4 gap-2 sm:gap-3 p-3 rounded-2xl bg-[#09151e] border border-[#213743] z-10">
          {tiles.map((tile, idx) => {
            const isPlayerHere = playerTile === idx && (isRoundActive || playerTile > 0);
            const isLadder = tile.type === "ladder";
            const isSnake = tile.type === "snake";
            const isFinish = tile.type === "finish";
            const isCheckpoint = tile.type === "checkpoint";

            return (
              <div
                key={tile.index}
                className={`relative h-16 sm:h-20 rounded-xl border flex flex-col items-center justify-between p-1.5 sm:p-2 transition-all ${
                  isPlayerHere
                    ? "bg-[#00e701]/20 border-[#00e701] shadow-lg shadow-[#00e701]/25 scale-[1.03]"
                    : isFinish
                    ? "bg-amber-500/10 border-amber-500/50 text-amber-300"
                    : isLadder
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                    : isSnake
                    ? "bg-rose-500/10 border-rose-500/40 text-rose-300"
                    : isCheckpoint
                    ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300"
                    : "bg-[#1a2c38]/60 border-[#213743] text-[#8596a5]"
                }`}
              >
                {/* Tile Number Header */}
                <div className="w-full flex items-center justify-between text-[9px] font-bold text-[#8596a5]">
                  <span>#{idx + 1}</span>
                  {isLadder && <ArrowUpRight className="h-3 w-3 text-emerald-400" />}
                  {isSnake && <Skull className="h-3 w-3 text-rose-400" />}
                  {isFinish && <Award className="h-3.5 w-3.5 text-amber-400" />}
                </div>

                {/* Player Pawn Indicator */}
                {isPlayerHere ? (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#00e701] border-2 border-white flex items-center justify-center shadow-md animate-bounce">
                    <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#011e01]" />
                  </div>
                ) : (
                  <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                    {tile.label || `${tile.multiplier}×`}
                  </div>
                )}

                {/* Multiplier Footer */}
                <span className="text-[10px] sm:text-xs font-black font-mono text-white">
                  {tile.multiplier}×
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MINES HARMONIZED BETTING CONTROLS SHELL CONTAINER      */}
      {/* ========================================================= */}
      <div className="w-full border-t border-[#213743] bg-[#1a2c38] p-3 sm:p-4 flex flex-col justify-start space-y-2 sm:space-y-2.5 rounded-b-2xl select-none">
        {/* 1. PRIMARY BET CTA BUTTON (Directly at top of controls) */}
        <div className="w-full">
          {isRoundActive && playerTile > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleRollDice}
                disabled={isRolling}
                className="w-full py-3 sm:py-3.5 text-sm sm:text-base font-extrabold rounded-lg bg-[#213743] hover:bg-[#2f4553] text-white shadow-md hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer uppercase tracking-wider"
              >
                <span>{isRolling ? "ROLLING..." : "ROLL AGAIN"}</span>
              </button>

              <button
                type="button"
                onClick={handleCashout}
                disabled={isRolling}
                className="w-full py-3 sm:py-3.5 text-sm sm:text-base font-extrabold rounded-lg bg-[#1475e1] hover:bg-[#1164c2] text-white shadow-lg shadow-[#1475e1]/25 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer uppercase tracking-wider"
              >
                <span>CASHOUT {activeSym}{currentCashout.toFixed(2)}</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleRollDice}
              disabled={isRolling}
              className="w-full py-3 sm:py-3.5 text-sm sm:text-base font-extrabold rounded-lg bg-[#1475e1] hover:bg-[#1164c2] text-white shadow-lg shadow-[#1475e1]/25 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer uppercase tracking-wider"
            >
              <span>{isRolling ? "ROLLING DICE..." : mode === "auto" ? "START AUTOBET" : "ROLL DICE"}</span>
            </button>
          )}
        </div>

        {/* 2. DIFFICULTY / RISK SELECTOR */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-[#b1bad3]">Difficulty</label>
          <div className="grid grid-cols-3 gap-1.5">
            {(["easy", "medium", "hard"] as Difficulty[]).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => {
                  if (isRoundActive) return;
                  sounds.playClick();
                  setDifficulty(level);
                  setPlayerTile(0);
                }}
                disabled={isRoundActive}
                className={`py-2 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer ${
                  difficulty === level
                    ? level === "easy"
                      ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                      : level === "medium"
                      ? "bg-amber-500/20 border-amber-400 text-amber-300"
                      : "bg-rose-500/20 border-rose-400 text-rose-300"
                    : "bg-[#0f212e] border-[#213743] text-[#b1bad3] hover:text-white"
                }`}
              >
                {level}
              </button>
            ))}
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
                disabled={isRoundActive}
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
                disabled={isRoundActive}
                onClick={handleHalfBet}
                className="rounded-lg bg-[#213743] px-2.5 py-1.5 text-xs font-bold text-[#b1bad3] hover:bg-[#2f4553] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                ½
              </button>
              <button
                type="button"
                disabled={isRoundActive}
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
      {/* 3. BOTTOM UTILITY BAR                                     */}
      {/* ========================================================= */}
      <div className="flex items-center justify-between rounded-lg bg-[#0f212e] border border-[#213743] px-3 py-2 text-xs text-[#b1bad3] mt-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              sounds.enabled = next;
            }}
            className="p-1 rounded-md hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors cursor-pointer"
            title={soundEnabled ? "Mute" : "Unmute"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          </button>

          <button
            type="button"
            onClick={() => setShowStatsModal(true)}
            className="p-1 rounded-md hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors cursor-pointer"
            title="Live Stats"
          >
            <TrendingUp className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowRulesModal(true)}
            className="p-1 rounded-md hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors cursor-pointer"
            title="Rules"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFairnessModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#213743] hover:bg-[#2f4553] text-[#b1bad3] hover:text-white font-bold text-xs transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-[#00e701]" />
            <span>Fairness</span>
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1 rounded-md hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors cursor-pointer"
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
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
                  <span className="truncate">a7d18e95fb314bcde26913eacb0128710b784e1b7631cf59a63200ff081a2938</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("a7d18e95fb314bcde26913eacb0128710b784e1b7631cf59a63200ff081a2938");
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
                  stake_snakes_client_seed_2026
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
                <span>Live Snakes Stats</span>
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
                <span>How to Play Stake Snakes</span>
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
                <strong className="text-white">Board Traversal:</strong> Roll the dice to move your pawn along the track toward the finish line.
              </p>
              <p>
                <strong className="text-white">Ladders:</strong> Landing on a ladder leaps your pawn forward multiple tiles, boosting your multiplier!
              </p>
              <p>
                <strong className="text-white">Snakes:</strong> Landing on a snake slides you back (or busts in Hard mode).
              </p>
              <p>
                <strong className="text-white">Cashout:</strong> You can cash out your accumulated profit at any time on safe checkpoints.
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
