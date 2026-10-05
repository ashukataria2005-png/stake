"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Dice5, ShieldCheck, Play, ArrowUpDown } from "lucide-react";
import { useGame } from "@/context/GameContext";
import confetti from "canvas-confetti";

export default function DicePage() {
  const { balance, updateBalance, currency, formatBalance } = useGame();
  const [betAmount, setBetAmount] = useState<number>(10);
  const [rollTarget, setRollTarget] = useState<number>(50.5);
  const [isRollOver, setIsRollOver] = useState<boolean>(true);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [hasWon, setHasWon] = useState<boolean | null>(null);

  // Win chance & multiplier with 1% house edge
  const winChance = isRollOver
    ? parseFloat((100 - rollTarget).toFixed(2))
    : parseFloat(rollTarget.toFixed(2));

  const multiplier = winChance > 0
    ? parseFloat(((99 / winChance)).toFixed(4))
    : 0;

  const rollDice = () => {
    if (betAmount > balance) {
      alert("Insufficient demo balance! Top up in Wallet.");
      return;
    }
    if (betAmount <= 0) return;

    updateBalance(-betAmount);
    setIsRolling(true);
    setHasWon(null);

    setTimeout(() => {
      const roll = parseFloat((Math.random() * 100).toFixed(2));
      setLastRoll(roll);

      const won = isRollOver ? roll > rollTarget : roll < rollTarget;
      setHasWon(won);
      setIsRolling(false);

      if (won) {
        const winAmount = parseFloat((betAmount * multiplier).toFixed(2));
        updateBalance(winAmount);

        try {
          confetti({
            particleCount: 50,
            spread: 50,
            origin: { y: 0.6 },
            colors: ["#00e701", "#ffffff", "#8b5cf6"],
          });
        } catch {
          // ignore
        }
      }
    }, 400);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 select-none space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-bold text-[#b1bad3] hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Casino Lobby</span>
        </Link>
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#00e701] rounded-lg bg-[#00e701]/10 px-2.5 py-1 border border-[#00e701]/20">
          <ShieldCheck className="h-4 w-4" />
          <span>Provably Fair</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 rounded-2xl border border-[#213743] bg-[#1a2c38] overflow-hidden shadow-2xl">
        {/* Controls */}
        <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-[#213743] bg-[#1a2c38] p-5 space-y-5">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-[#b1bad3]">
              <span>Bet Amount</span>
              <span className="text-[#00e701]">${formatBalance(balance)} {currency}</span>
            </div>
            <div className="flex items-center rounded-xl border border-[#213743] bg-[#0f212e] p-1">
              <span className="px-2 text-sm font-bold text-[#00e701]">$</span>
              <input
                type="number"
                disabled={isRolling}
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(1, parseFloat(e.target.value) || 0))}
                className="w-full bg-transparent text-sm font-bold text-white focus:outline-none"
              />
              <button
                disabled={isRolling}
                onClick={() => setBetAmount((prev) => Math.max(1, parseFloat((prev / 2).toFixed(2))))}
                className="rounded-lg px-2.5 py-1 text-xs font-bold text-[#b1bad3] hover:bg-[#213743] hover:text-white"
              >
                ½
              </button>
              <button
                disabled={isRolling}
                onClick={() => setBetAmount((prev) => parseFloat((prev * 2).toFixed(2)))}
                className="rounded-lg px-2.5 py-1 text-xs font-bold text-[#b1bad3] hover:bg-[#213743] hover:text-white"
              >
                2×
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#b1bad3]">Multiplier</label>
              <div className="rounded-xl border border-[#213743] bg-[#0f212e] p-2 text-sm font-mono font-bold text-white">
                {multiplier.toFixed(2)}x
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#b1bad3]">Win Chance</label>
              <div className="rounded-xl border border-[#213743] bg-[#0f212e] p-2 text-sm font-mono font-bold text-[#00e701]">
                {winChance.toFixed(2)}%
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsRollOver(!isRollOver)}
            className="flex items-center justify-center gap-2 w-full rounded-xl border border-[#213743] bg-[#0f212e] py-2 text-xs font-bold text-white hover:bg-[#213743]"
          >
            <ArrowUpDown className="h-3.5 w-3.5 text-[#00e701]" />
            <span>Mode: {isRollOver ? "Roll Over" : "Roll Under"} {rollTarget}</span>
          </button>

          <button
            onClick={rollDice}
            disabled={isRolling}
            className="w-full rounded-xl bg-[#00e701] py-3.5 text-sm font-extrabold text-[#0f212e] shadow-lg shadow-[#00e701]/30 transition-all hover:bg-[#00c701] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Dice5 className="h-4 w-4" />
            <span>{isRolling ? "Rolling..." : "Roll Dice"}</span>
          </button>
        </div>

        {/* Dice Interactive Area */}
        <div className="lg:col-span-8 bg-[#0f212e] p-8 flex flex-col items-center justify-center min-h-[420px] space-y-8">
          {/* Result Number Display */}
          <div className="flex flex-col items-center">
            <div
              className={`text-6xl sm:text-7xl font-black font-mono tracking-tight transition-all ${
                hasWon === true
                  ? "text-[#00e701] drop-shadow-[0_0_20px_rgba(0,231,1,0.5)]"
                  : hasWon === false
                  ? "text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                  : "text-white"
              }`}
            >
              {lastRoll !== null ? lastRoll.toFixed(2) : "50.00"}
            </div>
            {hasWon !== null && (
              <div
                className={`mt-2 text-sm font-bold uppercase tracking-wider ${
                  hasWon ? "text-[#00e701]" : "text-red-400"
                }`}
              >
                {hasWon ? `Won +$${(betAmount * multiplier).toFixed(2)}` : "Lost"}
              </div>
            )}
          </div>

          {/* Interactive Slider Bar */}
          <div className="w-full max-w-lg space-y-3">
            <input
              type="range"
              min="2"
              max="98"
              step="1"
              value={rollTarget}
              onChange={(e) => setRollTarget(parseFloat(e.target.value))}
              className="w-full h-3 bg-[#1a2c38] rounded-lg appearance-none cursor-pointer accent-[#00e701]"
            />
            <div className="flex justify-between text-xs font-mono font-bold text-[#b1bad3]">
              <span>0</span>
              <span className="text-[#00e701]">Target: {rollTarget}</span>
              <span>100</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
