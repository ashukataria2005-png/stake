"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CircleDot, ShieldCheck, Play } from "lucide-react";
import { useGame } from "@/context/GameContext";
import confetti from "canvas-confetti";

export default function PlinkoPage() {
  const { balance, updateBalance, currency, formatBalance } = useGame();
  const [betAmount, setBetAmount] = useState<number>(10);
  const [risk, setRisk] = useState<"low" | "medium" | "high">("medium");
  const [rows, setRows] = useState<number>(8);
  const [isDropping, setIsDropping] = useState<boolean>(false);
  const [lastMultiplier, setLastMultiplier] = useState<number | null>(null);

  // Multiplier bins for 8 rows medium risk
  const multipliers = [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13];

  const dropBall = () => {
    if (betAmount > balance) {
      alert("Insufficient demo balance! Top up in Wallet.");
      return;
    }
    if (betAmount <= 0) return;

    updateBalance(-betAmount);
    setIsDropping(true);
    setLastMultiplier(null);

    // Simulate peg bounce path
    setTimeout(() => {
      // Pick slot according to binomial distribution
      let slot = 0;
      for (let r = 0; r < rows; r++) {
        if (Math.random() > 0.5) slot++;
      }
      const mult = multipliers[slot] || 1.0;
      setLastMultiplier(mult);

      const winAmount = parseFloat((betAmount * mult).toFixed(2));
      updateBalance(winAmount);
      setIsDropping(false);

      if (mult >= 3) {
        try {
          confetti({
            particleCount: 50,
            spread: 50,
            origin: { y: 0.6 },
            colors: ["#00e701", "#ffffff", "#3b82f6"],
          });
        } catch {
          // ignore
        }
      }
    }, 1200);
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
                disabled={isDropping}
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(1, parseFloat(e.target.value) || 0))}
                className="w-full bg-transparent text-sm font-bold text-white focus:outline-none"
              />
              <button
                disabled={isDropping}
                onClick={() => setBetAmount((prev) => Math.max(1, parseFloat((prev / 2).toFixed(2))))}
                className="rounded-lg px-2.5 py-1 text-xs font-bold text-[#b1bad3] hover:bg-[#213743] hover:text-white"
              >
                ½
              </button>
              <button
                disabled={isDropping}
                onClick={() => setBetAmount((prev) => parseFloat((prev * 2).toFixed(2)))}
                className="rounded-lg px-2.5 py-1 text-xs font-bold text-[#b1bad3] hover:bg-[#213743] hover:text-white"
              >
                2×
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#b1bad3]">Risk</label>
            <div className="grid grid-cols-3 gap-2">
              {(["low", "medium", "high"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRisk(r)}
                  className={`rounded-xl py-2 text-xs font-bold capitalize transition-colors ${
                    risk === r
                      ? "bg-[#213743] text-[#00e701] border border-[#00e701]/30"
                      : "bg-[#0f212e] text-[#b1bad3] hover:text-white"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={dropBall}
            disabled={isDropping}
            className="w-full rounded-xl bg-[#00e701] py-3.5 text-sm font-extrabold text-[#0f212e] shadow-lg shadow-[#00e701]/30 transition-all hover:bg-[#00c701] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>{isDropping ? "Ball Falling..." : "Drop Ball"}</span>
          </button>

          {lastMultiplier !== null && (
            <div className="rounded-xl border border-[#213743] bg-[#0f212e] p-3 text-center">
              <span className="text-xs text-[#b1bad3]">Result: </span>
              <span className="text-base font-black text-[#00e701] font-mono">
                {lastMultiplier}x (+${(betAmount * lastMultiplier).toFixed(2)})
              </span>
            </div>
          )}
        </div>

        {/* Peg Pyramid Preview */}
        <div className="lg:col-span-8 bg-[#0f212e] p-8 flex flex-col items-center justify-center min-h-[420px]">
          <div className="flex flex-col items-center space-y-3">
            {Array.from({ length: 9 }).map((_, rowIndex) => (
              <div key={rowIndex} className="flex gap-4 sm:gap-6 justify-center">
                {Array.from({ length: rowIndex + 3 }).map((_, pegIndex) => (
                  <div
                    key={pegIndex}
                    className="h-2 w-2 rounded-full bg-slate-400 shadow-[0_0_4px_rgba(255,255,255,0.4)]"
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Multiplier buckets at bottom */}
          <div className="mt-8 flex gap-1.5 flex-wrap justify-center">
            {multipliers.map((m, idx) => (
              <div
                key={idx}
                className={`rounded-lg px-2 py-1.5 text-xs font-black text-center min-w-[36px] ${
                  m >= 10
                    ? "bg-red-500 text-white"
                    : m >= 3
                    ? "bg-amber-500 text-black"
                    : m >= 1
                    ? "bg-yellow-400 text-black"
                    : "bg-blue-600 text-white"
                }`}
              >
                {m}x
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
