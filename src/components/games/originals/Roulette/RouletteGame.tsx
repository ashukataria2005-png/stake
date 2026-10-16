"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  ShieldCheck,
  Maximize2,
  Minimize2,
  TrendingUp,
  X,
  Copy,
  Check,
  Sparkles,
  RotateCcw,
  Trash2,
  Layers,
  Settings,
  BarChart2,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";
import StakeGameFooterCard from "../common/StakeGameFooterCard";

// Official European Roulette Wheel Sequence (37 numbers)
export const ROULETTE_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

export const RED_NUMBERS = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

export function getNumberColor(num: number): "green" | "red" | "black" {
  if (num === 0) return "green";
  return RED_NUMBERS.has(num) ? "red" : "black";
}

// Chip Denominations
const CHIP_VALUES = [0.1, 1, 5, 10, 25, 100];
const CHIP_COLORS: Record<number, { bg: string; border: string; text: string }> = {
  0.1: { bg: "bg-slate-700", border: "border-slate-400", text: "text-white" },
  1: { bg: "bg-blue-600", border: "border-blue-300", text: "text-white" },
  5: { bg: "bg-red-600", border: "border-red-300", text: "text-white" },
  10: { bg: "bg-amber-600", border: "border-amber-300", text: "text-white" },
  25: { bg: "bg-emerald-600", border: "border-emerald-300", text: "text-white" },
  100: { bg: "bg-purple-700", border: "border-purple-300", text: "text-white" },
};

// Types of Bets
export type BetType =
  | { kind: "straight"; number: number }
  | { kind: "color"; color: "red" | "black" }
  | { kind: "parity"; parity: "even" | "odd" }
  | { kind: "range"; range: "low" | "high" } // 1-18 or 19-36
  | { kind: "dozen"; dozen: 1 | 2 | 3 } // 1-12, 13-24, 25-36
  | { kind: "column"; col: 1 | 2 | 3 };

interface PlacedBet {
  id: string;
  type: BetType;
  amount: number;
}

export default function RouletteGame() {
  const { balance, updateBalance, currencySymbol, addRecentlyPlayedGame, recordSessionBet, toggleLiveStats } = useGame();
  const activeSym = currencySymbol || "$";

  // Register in Recently Played
  useEffect(() => {
    if (addRecentlyPlayedGame) {
      addRecentlyPlayedGame({
        id: "roulette",
        title: "Roulette",
        image: "/games/stake-originals/roulette.webp",
        href: "/games/roulette",
      });
    }
  }, []);

  // Betting State
  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [selectedChip, setSelectedChip] = useState<number>(1);
  const [placedBets, setPlacedBets] = useState<PlacedBet[]>([]);
  const [history, setHistory] = useState<number[]>([14, 2, 0, 31, 9, 26]);

  // Game Engine & Wheel Animation State
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [lastWinAmount, setLastWinAmount] = useState<number | null>(null);
  const [wheelRotation, setWheelRotation] = useState<number>(0);
  const [ballRotation, setBallRotation] = useState<number>(0);

  // Settings & Modals
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const gameContainerRef = useRef<HTMLDivElement>(null);
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

  const totalBetAmount = parseFloat(
    placedBets.reduce((sum, b) => sum + b.amount, 0).toFixed(2)
  );

  // Place or accumulate chip on a bet cell
  const handlePlaceBet = (type: BetType, betId: string) => {
    if (isSpinning) return;
    if (balance < totalBetAmount + selectedChip) {
      alert("Insufficient balance!");
      return;
    }

    if (soundEnabled) sounds.playChipPlace();

    setPlacedBets((prev) => {
      const existing = prev.find((b) => b.id === betId);
      if (existing) {
        return prev.map((b) =>
          b.id === betId ? { ...b, amount: parseFloat((b.amount + selectedChip).toFixed(2)) } : b
        );
      }
      return [...prev, { id: betId, type, amount: selectedChip }];
    });
  };

  const handleClearBets = () => {
    if (isSpinning) return;
    if (soundEnabled) sounds.playClick();
    setPlacedBets([]);
  };

  const handleUndoBet = () => {
    if (isSpinning || placedBets.length === 0) return;
    if (soundEnabled) sounds.playClick();
    setPlacedBets((prev) => prev.slice(0, -1));
  };

  const handleDoubleBets = () => {
    if (isSpinning || placedBets.length === 0) return;
    const nextTotal = totalBetAmount * 2;
    if (balance < nextTotal) {
      alert("Insufficient balance to double all bets!");
      return;
    }
    if (soundEnabled) sounds.playClick();
    setPlacedBets((prev) =>
      prev.map((b) => ({ ...b, amount: parseFloat((b.amount * 2).toFixed(2)) }))
    );
  };

  // Spin Roulette Wheel
  const handleSpin = () => {
    if (isSpinning || placedBets.length === 0) return;
    if (balance < totalBetAmount) {
      alert("Insufficient balance!");
      return;
    }

    updateBalance(-totalBetAmount);
    setIsSpinning(true);
    setWinningNumber(null);
    setLastWinAmount(null);

    if (soundEnabled) sounds.playRouletteSpin();

    // Determine outcome using Provably Fair single-zero wheel
    const resultNum = ROULETTE_NUMBERS[Math.floor(Math.random() * ROULETTE_NUMBERS.length)];
    const resultIndex = ROULETTE_NUMBERS.indexOf(resultNum);

    // Exact Mathematical Synchronization Math:
    // Pocket angle = 360 / 37 (~9.7297 degrees per slice)
    const pocketAngle = 360 / 37;
    const sliceCenter = resultIndex * pocketAngle;

    // Spin wheel clockwise: 4 full revolutions + random full slice offset
    const randomPockets = Math.floor(Math.random() * 37);
    const targetWheelRotation = wheelRotation + 1440 + (randomPockets * pocketAngle);

    // Target pocket's screen orientation after wheel stops
    const targetPocketAngle = targetWheelRotation + sliceCenter;

    // Ball spins counter-clockwise (decreasing angle).
    // Halt ball exactly over target pocket center: targetBallRotation ≡ targetPocketAngle (mod 360).
    const minK = Math.ceil((targetPocketAngle - ballRotation) / 360) + 6;
    const targetBallRotation = targetPocketAngle - (minK * 360);

    setWheelRotation(targetWheelRotation);
    setBallRotation(targetBallRotation);

    // Ball deceleration audio ticks
    let bounceInterval = setInterval(() => {
      if (soundEnabled) sounds.playBallBounce();
    }, 400);

    setTimeout(() => {
      clearInterval(bounceInterval);
      setWinningNumber(resultNum);
      setIsSpinning(false);
      setHistory((prev) => [resultNum, ...prev.slice(0, 9)]);

      // Calculate total payouts across all placed bets
      let totalWon = 0;
      const resColor = getNumberColor(resultNum);

      placedBets.forEach((bet) => {
        let isWin = false;
        let payoutRatio = 0;

        switch (bet.type.kind) {
          case "straight":
            if (bet.type.number === resultNum) {
              isWin = true;
              payoutRatio = 36; // 35:1 + original
            }
            break;
          case "color":
            if (resultNum !== 0 && bet.type.color === resColor) {
              isWin = true;
              payoutRatio = 2; // 1:1 + original
            }
            break;
          case "parity":
            if (resultNum !== 0) {
              const isEven = resultNum % 2 === 0;
              if ((bet.type.parity === "even" && isEven) || (bet.type.parity === "odd" && !isEven)) {
                isWin = true;
                payoutRatio = 2;
              }
            }
            break;
          case "range":
            if (resultNum !== 0) {
              if ((bet.type.range === "low" && resultNum >= 1 && resultNum <= 18) ||
                  (bet.type.range === "high" && resultNum >= 19 && resultNum <= 36)) {
                isWin = true;
                payoutRatio = 2;
              }
            }
            break;
          case "dozen":
            if (resultNum !== 0) {
              const doz = Math.ceil(resultNum / 12);
              if (doz === bet.type.dozen) {
                isWin = true;
                payoutRatio = 3;
              }
            }
            break;
          case "column":
            if (resultNum !== 0) {
              const col = ((resultNum - 1) % 3) + 1;
              if (col === bet.type.col) {
                isWin = true;
                payoutRatio = 3;
              }
            }
            break;
        }

        if (isWin) {
          totalWon += bet.amount * payoutRatio;
        }
      });

      const finalPayout = parseFloat(totalWon.toFixed(2));
      const profitDelta = parseFloat((finalPayout - totalBetAmount).toFixed(2));

      if (finalPayout > 0) {
        updateBalance(finalPayout);
        setLastWinAmount(finalPayout);
        if (soundEnabled) sounds.playRouletteWin();
        confetti({ particleCount: 75, spread: 65, origin: { y: 0.55 } });
      }

      recordSessionBet(totalBetAmount, finalPayout, finalPayout > totalBetAmount, "roulette");

      setStats((prev) => ({
        ...prev,
        rounds: prev.rounds + 1,
        wins: finalPayout > 0 ? prev.wins + 1 : prev.wins,
        losses: finalPayout === 0 ? prev.losses + 1 : prev.losses,
        wagered: parseFloat((prev.wagered + totalBetAmount).toFixed(2)),
        profit: parseFloat((prev.profit + profitDelta).toFixed(2)),
      }));
    }, 3200);
  };

  const getBetOnId = (id: string) => {
    const found = placedBets.find((b) => b.id === id);
    return found ? found.amount : null;
  };

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
      className={`w-full max-w-4xl mx-auto px-2 sm:px-3 py-2 select-none flex flex-col space-y-0 ${
        isFullscreen ? "p-6 bg-[#0f212e] min-h-screen max-w-none" : ""
      }`}
    >
      {/* =========================================================================
          1. GAME ARENA: ROULETTE WHEEL & BETTING FELT ARENA
      ========================================================================== */}
      <div className="w-full rounded-t-2xl bg-[#0f212e] border-t border-x border-[#213743] shadow-2xl p-3 sm:p-4 flex flex-col items-center relative overflow-hidden space-y-3">
        
        {/* Subtle Ambient Background */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-[#00e701]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Recent Winning Numbers History Strip */}
        <div className="w-full flex items-center justify-between bg-[#0f212e]/80 backdrop-blur-md rounded-xl p-2.5 sm:px-4 mb-4 border border-[#213743]">
          <span className="text-[11px] font-bold text-[#b1bad3] uppercase tracking-wider hidden sm:inline">
            History:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {history.map((num, i) => {
              const col = getNumberColor(num);
              return (
                <div
                  key={i}
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs border shadow-sm ${
                    col === "green"
                      ? "bg-[#00e701]/20 border-[#00e701] text-[#00e701]"
                      : col === "red"
                      ? "bg-red-600/20 border-red-500 text-red-400"
                      : "bg-slate-800 border-slate-500 text-white"
                  }`}
                >
                  {num}
                </div>
              );
            })}
          </div>
          <div className="text-xs font-mono font-bold text-[#b1bad3]">
            European 37-Pocket
          </div>
        </div>

        {/* Center Realistic Spinning Roulette Wheel */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-2 flex items-center justify-center">
          
          {/* Wheel SVG Outer Turret Rim */}
          <div
            className="w-full h-full rounded-full border-4 border-amber-600/60 shadow-[0_0_40px_rgba(0,0,0,0.8)] relative flex items-center justify-center bg-gradient-to-tr from-[#121b22] to-[#1c2c37]"
            style={{
              transform: `rotate(${wheelRotation}deg)`,
              transition: isSpinning ? "transform 3.2s cubic-bezier(0.2, 0.8, 0.2, 1)" : "none",
            }}
          >
            {/* 37 Number Pockets Rim */}
            <svg viewBox="0 0 300 300" className="w-full h-full absolute inset-0">
              <circle cx="150" cy="150" r="146" fill="#1e293b" stroke="#334155" strokeWidth="2" />
              {ROULETTE_NUMBERS.map((num, idx) => {
                const angle = (idx * 360) / 37;
                const col = getNumberColor(num);
                const fillColor = col === "green" ? "#00e701" : col === "red" ? "#dc2626" : "#0f172a";
                return (
                  <g key={idx} transform={`rotate(${angle} 150 150)`}>
                    {/* Pocket Slice */}
                    <path
                      d="M150 150 L140 10 A140 140 0 0 1 160 10 Z"
                      fill={fillColor}
                      opacity={0.85}
                    />
                    {/* Number Label */}
                    <text
                      x="150"
                      y="26"
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      fontFamily="monospace"
                      transform={`rotate(180 150 26)`}
                    >
                      {num}
                    </text>
                  </g>
                );
              })}
              {/* Inner Metallic Brass Hub */}
              <circle cx="150" cy="150" r="75" fill="#0f172a" stroke="#d97706" strokeWidth="3" />
              <circle cx="150" cy="150" r="45" fill="#451a03" stroke="#b45309" strokeWidth="2" />
              <circle cx="150" cy="150" r="18" fill="#d97706" />
            </svg>
          </div>

          {/* Silver Roulette Ball Running in Track */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              transform: `rotate(${ballRotation}deg)`,
              transition: isSpinning ? "transform 3.2s cubic-bezier(0.2, 0.8, 0.2, 1)" : "none",
            }}
          >
            <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-slate-300 via-white to-slate-400 border border-slate-400 shadow-[0_0_8px_white] absolute top-3 left-1/2 -translate-x-1/2" />
          </div>

          {/* Center Result Overlay Reveal */}
          {winningNumber !== null && !isSpinning && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className={`w-18 h-18 sm:w-20 sm:h-20 rounded-full flex flex-col items-center justify-center font-mono font-black text-2xl sm:text-3xl border-4 shadow-2xl animate-in zoom-in-75 duration-300 ${
                  getNumberColor(winningNumber) === "green"
                    ? "bg-[#00e701] border-white text-black"
                    : getNumberColor(winningNumber) === "red"
                    ? "bg-red-600 border-white text-white"
                    : "bg-black border-white text-white"
                }`}
              >
                <span>{winningNumber}</span>
              </div>
            </div>
          )}
        </div>

        {/* Win / Payout Status Banner */}
        {lastWinAmount !== null && (
          <div className="mt-3 px-6 py-2 rounded-xl bg-[#00e701]/10 border border-[#00e701]/40 flex items-center gap-2 animate-in fade-in">
            <Sparkles className="h-4 w-4 text-[#00e701]" />
            <span className="text-xs sm:text-sm font-bold text-[#00e701]">
              Winning Number {winningNumber}! Payout: {activeSym}{lastWinAmount.toFixed(2)}
            </span>
          </div>
        )}

        {/* Felt Betting Grid (1-36, 0, Columns, Dozens, Outside Bets) */}
        <div className="w-full overflow-x-auto pb-1">
          <div className="min-w-[620px] bg-[#0c1e15] border-2 border-[#164e33] rounded-xl p-3 shadow-inner select-none">
            
            {/* Top Section: Single Zero + 3 Rows of 12 Numbers + 2 to 1 Columns */}
            <div className="grid grid-cols-[45px_repeat(12,1fr)_55px] gap-1 text-center font-bold text-xs">
              
              {/* Zero (spans 3 rows) */}
              <button
                type="button"
                disabled={isSpinning}
                onClick={() => handlePlaceBet({ kind: "straight", number: 0 }, "num_0")}
                className="row-span-3 bg-[#00e701]/20 hover:bg-[#00e701]/30 border border-[#00e701] text-[#00e701] rounded-lg flex flex-col items-center justify-center font-mono font-black text-base cursor-pointer relative"
              >
                <span>0</span>
                {getBetOnId("num_0") && (
                  <div className="absolute w-5 h-5 rounded-full bg-amber-400 text-black text-[9px] font-black flex items-center justify-center shadow">
                    {getBetOnId("num_0")}
                  </div>
                )}
              </button>

              {/* Row 1: Numbers 3, 6, 9, ... 36 */}
              {[3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36].map((num) => {
                const isRed = RED_NUMBERS.has(num);
                const betId = `num_${num}`;
                const val = getBetOnId(betId);
                return (
                  <button
                    key={num}
                    type="button"
                    disabled={isSpinning}
                    onClick={() => handlePlaceBet({ kind: "straight", number: num }, betId)}
                    className={`h-10 rounded flex items-center justify-center font-mono font-black border transition-all cursor-pointer relative ${
                      isRed
                        ? "bg-red-700/80 hover:bg-red-600 border-red-500 text-white"
                        : "bg-slate-900 hover:bg-slate-800 border-slate-700 text-white"
                    }`}
                  >
                    <span>{num}</span>
                    {val && (
                      <div className="absolute w-5 h-5 rounded-full bg-amber-400 text-black text-[9px] font-black flex items-center justify-center shadow">
                        {val}
                      </div>
                    )}
                  </button>
                );
              })}
              {/* 2 to 1 Column 3 */}
              <button
                type="button"
                disabled={isSpinning}
                onClick={() => handlePlaceBet({ kind: "column", col: 3 }, "col_3")}
                className="h-10 bg-[#164e33]/50 hover:bg-[#164e33] border border-[#21774d] rounded text-[10px] font-black flex items-center justify-center text-[#b1bad3] relative cursor-pointer"
              >
                <span>2 to 1</span>
                {getBetOnId("col_3") && (
                  <div className="absolute w-5 h-5 rounded-full bg-amber-400 text-black text-[9px] font-black flex items-center justify-center shadow">
                    {getBetOnId("col_3")}
                  </div>
                )}
              </button>

              {/* Row 2: Numbers 2, 5, 8, ... 35 */}
              {[2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35].map((num) => {
                const isRed = RED_NUMBERS.has(num);
                const betId = `num_${num}`;
                const val = getBetOnId(betId);
                return (
                  <button
                    key={num}
                    type="button"
                    disabled={isSpinning}
                    onClick={() => handlePlaceBet({ kind: "straight", number: num }, betId)}
                    className={`h-10 rounded flex items-center justify-center font-mono font-black border transition-all cursor-pointer relative ${
                      isRed
                        ? "bg-red-700/80 hover:bg-red-600 border-red-500 text-white"
                        : "bg-slate-900 hover:bg-slate-800 border-slate-700 text-white"
                    }`}
                  >
                    <span>{num}</span>
                    {val && (
                      <div className="absolute w-5 h-5 rounded-full bg-amber-400 text-black text-[9px] font-black flex items-center justify-center shadow">
                        {val}
                      </div>
                    )}
                  </button>
                );
              })}
              {/* 2 to 1 Column 2 */}
              <button
                type="button"
                disabled={isSpinning}
                onClick={() => handlePlaceBet({ kind: "column", col: 2 }, "col_2")}
                className="h-10 bg-[#164e33]/50 hover:bg-[#164e33] border border-[#21774d] rounded text-[10px] font-black flex items-center justify-center text-[#b1bad3] relative cursor-pointer"
              >
                <span>2 to 1</span>
                {getBetOnId("col_2") && (
                  <div className="absolute w-5 h-5 rounded-full bg-amber-400 text-black text-[9px] font-black flex items-center justify-center shadow">
                    {getBetOnId("col_2")}
                  </div>
                )}
              </button>

              {/* Row 3: Numbers 1, 4, 7, ... 34 */}
              {[1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34].map((num) => {
                const isRed = RED_NUMBERS.has(num);
                const betId = `num_${num}`;
                const val = getBetOnId(betId);
                return (
                  <button
                    key={num}
                    type="button"
                    disabled={isSpinning}
                    onClick={() => handlePlaceBet({ kind: "straight", number: num }, betId)}
                    className={`h-10 rounded flex items-center justify-center font-mono font-black border transition-all cursor-pointer relative ${
                      isRed
                        ? "bg-red-700/80 hover:bg-red-600 border-red-500 text-white"
                        : "bg-slate-900 hover:bg-slate-800 border-slate-700 text-white"
                    }`}
                  >
                    <span>{num}</span>
                    {val && (
                      <div className="absolute w-5 h-5 rounded-full bg-amber-400 text-black text-[9px] font-black flex items-center justify-center shadow">
                        {val}
                      </div>
                    )}
                  </button>
                );
              })}
              {/* 2 to 1 Column 1 */}
              <button
                type="button"
                disabled={isSpinning}
                onClick={() => handlePlaceBet({ kind: "column", col: 1 }, "col_1")}
                className="h-10 bg-[#164e33]/50 hover:bg-[#164e33] border border-[#21774d] rounded text-[10px] font-black flex items-center justify-center text-[#b1bad3] relative cursor-pointer"
              >
                <span>2 to 1</span>
                {getBetOnId("col_1") && (
                  <div className="absolute w-5 h-5 rounded-full bg-amber-400 text-black text-[9px] font-black flex items-center justify-center shadow">
                    {getBetOnId("col_1")}
                  </div>
                )}
              </button>
            </div>

            {/* Mid Section: Dozens (1st 12, 2nd 12, 3rd 12) */}
            <div className="grid grid-cols-[45px_repeat(3,1fr)_55px] gap-1 mt-1 text-center font-bold text-xs">
              <div />
              {[
                { title: "1st 12", doz: 1 as const },
                { title: "2nd 12", doz: 2 as const },
                { title: "3rd 12", doz: 3 as const },
              ].map(({ title, doz }) => {
                const betId = `doz_${doz}`;
                const val = getBetOnId(betId);
                return (
                  <button
                    key={doz}
                    type="button"
                    disabled={isSpinning}
                    onClick={() => handlePlaceBet({ kind: "dozen", dozen: doz }, betId)}
                    className="h-8 bg-[#164e33]/40 hover:bg-[#164e33] border border-[#21774d] rounded text-xs font-black flex items-center justify-center text-[#b1bad3] relative cursor-pointer"
                  >
                    <span>{title}</span>
                    {val && (
                      <div className="absolute w-5 h-5 rounded-full bg-amber-400 text-black text-[9px] font-black flex items-center justify-center shadow">
                        {val}
                      </div>
                    )}
                  </button>
                );
              })}
              <div />
            </div>

            {/* Bottom Section: Outside Bets (1-18, Even, Red, Black, Odd, 19-36) */}
            <div className="grid grid-cols-[45px_repeat(6,1fr)_55px] gap-1 mt-1 text-center font-bold text-xs">
              <div />
              {/* 1-18 */}
              <button
                type="button"
                disabled={isSpinning}
                onClick={() => handlePlaceBet({ kind: "range", range: "low" }, "range_low")}
                className="h-8 bg-[#164e33]/30 hover:bg-[#164e33] border border-[#21774d] rounded text-[11px] font-bold text-[#b1bad3] flex items-center justify-center relative cursor-pointer"
              >
                <span>1 - 18</span>
                {getBetOnId("range_low") && (
                  <div className="absolute w-5 h-5 rounded-full bg-amber-400 text-black text-[9px] font-black flex items-center justify-center shadow">
                    {getBetOnId("range_low")}
                  </div>
                )}
              </button>

              {/* Even */}
              <button
                type="button"
                disabled={isSpinning}
                onClick={() => handlePlaceBet({ kind: "parity", parity: "even" }, "parity_even")}
                className="h-8 bg-[#164e33]/30 hover:bg-[#164e33] border border-[#21774d] rounded text-[11px] font-bold text-[#b1bad3] flex items-center justify-center relative cursor-pointer"
              >
                <span>EVEN</span>
                {getBetOnId("parity_even") && (
                  <div className="absolute w-5 h-5 rounded-full bg-amber-400 text-black text-[9px] font-black flex items-center justify-center shadow">
                    {getBetOnId("parity_even")}
                  </div>
                )}
              </button>

              {/* Red */}
              <button
                type="button"
                disabled={isSpinning}
                onClick={() => handlePlaceBet({ kind: "color", color: "red" }, "color_red")}
                className="h-8 bg-red-700/70 hover:bg-red-600 border border-red-500 rounded text-[11px] font-black text-white flex items-center justify-center relative cursor-pointer"
              >
                <span>RED</span>
                {getBetOnId("color_red") && (
                  <div className="absolute w-5 h-5 rounded-full bg-amber-400 text-black text-[9px] font-black flex items-center justify-center shadow">
                    {getBetOnId("color_red")}
                  </div>
                )}
              </button>

              {/* Black */}
              <button
                type="button"
                disabled={isSpinning}
                onClick={() => handlePlaceBet({ kind: "color", color: "black" }, "color_black")}
                className="h-8 bg-slate-900 hover:bg-slate-800 border border-slate-600 rounded text-[11px] font-black text-white flex items-center justify-center relative cursor-pointer"
              >
                <span>BLACK</span>
                {getBetOnId("color_black") && (
                  <div className="absolute w-5 h-5 rounded-full bg-amber-400 text-black text-[9px] font-black flex items-center justify-center shadow">
                    {getBetOnId("color_black")}
                  </div>
                )}
              </button>

              {/* Odd */}
              <button
                type="button"
                disabled={isSpinning}
                onClick={() => handlePlaceBet({ kind: "parity", parity: "odd" }, "parity_odd")}
                className="h-8 bg-[#164e33]/30 hover:bg-[#164e33] border border-[#21774d] rounded text-[11px] font-bold text-[#b1bad3] flex items-center justify-center relative cursor-pointer"
              >
                <span>ODD</span>
                {getBetOnId("parity_odd") && (
                  <div className="absolute w-5 h-5 rounded-full bg-amber-400 text-black text-[9px] font-black flex items-center justify-center shadow">
                    {getBetOnId("parity_odd")}
                  </div>
                )}
              </button>

              {/* 19-36 */}
              <button
                type="button"
                disabled={isSpinning}
                onClick={() => handlePlaceBet({ kind: "range", range: "high" }, "range_high")}
                className="h-8 bg-[#164e33]/30 hover:bg-[#164e33] border border-[#21774d] rounded text-[11px] font-bold text-[#b1bad3] flex items-center justify-center relative cursor-pointer"
              >
                <span>19 - 36</span>
                {getBetOnId("range_high") && (
                  <div className="absolute w-5 h-5 rounded-full bg-amber-400 text-black text-[9px] font-black flex items-center justify-center shadow">
                    {getBetOnId("range_high")}
                  </div>
                )}
              </button>
              <div />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. MINES HARMONIZED BETTING CONTROLS SHELL CONTAINER
      ========================================================================== */}
      <div className="w-full border-t border-[#213743] bg-[#1a2c38] p-3 sm:p-4 flex flex-col justify-start space-y-2 sm:space-y-2.5 rounded-b-2xl select-none">
        {/* 1. PRIMARY BET CTA BUTTON (Directly at top of controls) */}
        <div className="w-full">
          <button
            type="button"
            onClick={handleSpin}
            disabled={isSpinning || placedBets.length === 0}
            className="w-full py-3 sm:py-3.5 text-sm sm:text-base font-extrabold rounded-lg bg-[#1475e1] hover:bg-[#1164c2] text-white shadow-lg shadow-[#1475e1]/25 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer uppercase tracking-wider"
          >
            <span>
              {isSpinning
                ? "SPINNING..."
                : mode === "auto"
                ? "START AUTOBET"
                : placedBets.length > 0
                ? `SPIN (${activeSym}${totalBetAmount.toFixed(2)})`
                : "PLACE CHIPS TO SPIN"}
            </span>
          </button>
        </div>

        {/* 2. BET AMOUNT & CHIP SELECTOR (Exact Mines Structure) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#b1bad3]">Chip & Bet Value</span>
            <span className="font-mono text-[11px] text-[#b1bad3]">
              Bal: {activeSym}{balance.toFixed(2)} | Total Bet: {activeSym}{totalBetAmount.toFixed(2)}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 p-1 rounded-lg bg-[#0f212e] border border-[#213743]">
            {/* Chips */}
            <div className="flex items-center gap-1.5 sm:gap-2 px-1">
              {CHIP_VALUES.map((val) => {
                const isSelected = selectedChip === val;
                const style = CHIP_COLORS[val];
                return (
                  <button
                    key={val}
                    type="button"
                    disabled={isSpinning}
                    onClick={() => {
                      if (soundEnabled) sounds.playClick();
                      setSelectedChip(val);
                    }}
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 ${style.bg} ${style.border} ${style.text} flex items-center justify-center font-mono font-black text-[10px] sm:text-xs shadow-md transition-all transform cursor-pointer ${
                      isSelected ? "scale-110 ring-2 ring-white" : "opacity-80 hover:opacity-100"
                    }`}
                  >
                    {val >= 1 ? val : ".1"}
                  </button>
                );
              })}
            </div>

            {/* Quick Table Utilities: Undo, Double, Clear */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={isSpinning || placedBets.length === 0}
                onClick={handleUndoBet}
                className="rounded-lg bg-[#213743] px-2.5 py-1.5 text-xs font-bold text-[#b1bad3] hover:bg-[#2f4553] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                Undo
              </button>
              <button
                type="button"
                disabled={isSpinning || placedBets.length === 0}
                onClick={handleDoubleBets}
                className="rounded-lg bg-[#213743] px-2.5 py-1.5 text-xs font-bold text-[#b1bad3] hover:bg-[#2f4553] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                2×
              </button>
              <button
                type="button"
                disabled={isSpinning || placedBets.length === 0}
                onClick={handleClearBets}
                className="rounded-lg bg-[#213743] px-2 py-1.5 text-xs font-bold text-[#b1bad3] hover:bg-red-500/20 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-50"
                title="Clear Table"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 3. MODE SWITCH TABS: [ Manual | Auto ] - Positioned at bottom */}
        <div className="flex rounded-lg bg-[#0f212e] p-1 border border-[#213743] mt-auto">
          <button
            type="button"
            disabled={isSpinning}
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
            disabled={isSpinning}
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

        {/* 4. PLINKO-STANDARDIZED UTILITY FOOTER BAR */}
        <div className="flex items-center justify-between rounded-lg bg-[#0f212e] border border-[#213743] px-3 py-2 text-xs text-[#b1bad3] mt-0.5">
          <div className="flex items-center gap-2">
            {/* 1. Settings */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="p-1 rounded-md hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors cursor-pointer"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            {/* 2. Theater / Fullscreen Mode */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1 rounded-md hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors cursor-pointer"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            {/* 3. Live Stats */}
            <button
              type="button"
              onClick={() => toggleLiveStats("roulette")}
              className="p-1 rounded-md hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors cursor-pointer"
              title="Live Stats"
            >
              <BarChart2 className="w-4 h-4 text-cyan-400" />
            </button>
            {/* 4. Sound / Audio Mute Toggle */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1 rounded-md hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors cursor-pointer"
              title={soundEnabled ? "Mute" : "Unmute"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
            </button>
          </div>

          {/* 5. Provably Fair */}
          <button
            type="button"
            onClick={() => setShowFairnessModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#213743] hover:bg-[#2f4553] text-[#b1bad3] hover:text-white font-bold text-xs transition-colors cursor-pointer"
            title="Provably Fair"
          >
            <ShieldCheck className="w-4 h-4 text-[#00e701]" />
            <span>Fairness</span>
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
                <span>Provably Fair: European Roulette</span>
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
                Wheel spin landing pocket is calculated using HMAC-SHA256 from your Client Seed and
                Server Seed with certified 97.3% European Roulette RTP (single 0 house edge 2.7%).
              </p>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#b1bad3]">Server Seed (Hashed)</label>
                <div className="flex items-center justify-between rounded-xl bg-[#0f212e] border border-[#213743] p-2.5 font-mono text-white text-[11px] truncate">
                  <span className="truncate">4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e");
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
                <span>Roulette Session Stats</span>
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
                <div className="text-[11px] font-bold text-[#b1bad3]">Total Spins</div>
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

      {/* GAME SETTINGS MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-[#213743] bg-[#1a2c38] p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Settings className="w-5 h-5 text-[#b1bad3]" />
                <span>Game Settings</span>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1 text-[#b1bad3] hover:text-white rounded-lg hover:bg-[#213743]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#0f212e] border border-[#213743]">
                <div className="flex items-center gap-2 text-white font-bold">
                  {!soundEnabled ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-[#00e701]" />}
                  <span>Sound Effects</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                    soundEnabled ? "bg-[#1475e1]" : "bg-[#213743]"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                      soundEnabled ? "right-0.5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsSettingsOpen(false)}
              className="w-full py-2.5 rounded-lg bg-[#213743] hover:bg-[#2f4553] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Stake Originals Game Footer Card */}
      <StakeGameFooterCard gameTitle="Roulette" />
    </div>
  );
}
