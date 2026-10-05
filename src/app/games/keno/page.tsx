"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, ShieldCheck, Play, RotateCcw } from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

export default function KenoPage() {
  const { balance, updateBalance, currency, formatBalance } = useGame();
  const [betAmount, setBetAmount] = useState<number>(10);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([7, 14, 21, 28]);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [hits, setHits] = useState<number>(0);

  const toggleNumber = (num: number) => {
    if (isDrawing) return;
    sounds.playClick();
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
    } else {
      if (selectedNumbers.length < 10) {
        setSelectedNumbers([...selectedNumbers, num]);
      }
    }
  };

  const autoPick = () => {
    sounds.playClick();
    const picks: number[] = [];
    while (picks.length < 5) {
      const r = Math.floor(Math.random() * 40) + 1;
      if (!picks.includes(r)) picks.push(r);
    }
    setSelectedNumbers(picks);
  };

  const clearPicks = () => {
    sounds.playClick();
    setSelectedNumbers([]);
    setDrawnNumbers([]);
  };

  const startKeno = () => {
    if (isDrawing || selectedNumbers.length === 0) return;
    if (betAmount > balance) {
      alert("Insufficient demo balance! Top up in Wallet.");
      return;
    }
    if (betAmount <= 0) return;

    updateBalance(-betAmount);
    setIsDrawing(true);
    setDrawnNumbers([]);
    setHits(0);

    const draws: number[] = [];
    while (draws.length < 10) {
      const r = Math.floor(Math.random() * 40) + 1;
      if (!draws.includes(r)) draws.push(r);
    }

    let revealed = 0;
    const interval = setInterval(() => {
      revealed++;
      const currentDraws = draws.slice(0, revealed);
      setDrawnNumbers(currentDraws);
      sounds.playPeg();

      if (revealed === 10) {
        clearInterval(interval);
        setIsDrawing(false);

        const matchCount = selectedNumbers.filter((n) => draws.includes(n)).length;
        setHits(matchCount);

        // Multiplier scaling with matches
        const multTable: Record<number, number> = { 0: 0, 1: 1.2, 2: 2.5, 3: 5, 4: 15, 5: 50 };
        const mult = multTable[matchCount] ?? (matchCount >= 6 ? 150 : 0);

        if (mult > 0) {
          const payout = parseFloat((betAmount * mult).toFixed(2));
          updateBalance(payout);
          sounds.playDiceWin();
          if (mult >= 5) {
            try {
              confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
            } catch {}
          }
        } else {
          sounds.playDiceLoss();
        }
      }
    }, 120);
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
          <span>Provably Fair Keno</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 rounded-2xl border border-[#213743] bg-[#1a2c38] overflow-hidden shadow-2xl">
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
                disabled={isDrawing}
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(1, parseFloat(e.target.value) || 0))}
                className="w-full bg-transparent text-sm font-bold text-white focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={autoPick}
              disabled={isDrawing}
              className="flex-1 rounded-xl border border-[#213743] bg-[#0f212e] py-2 text-xs font-bold text-white hover:bg-[#213743]"
            >
              Auto Pick
            </button>
            <button
              onClick={clearPicks}
              disabled={isDrawing}
              className="rounded-xl border border-[#213743] bg-[#0f212e] px-3 py-2 text-xs font-bold text-[#b1bad3] hover:text-white"
            >
              Clear
            </button>
          </div>

          <div className="rounded-xl border border-[#213743] bg-[#0f212e] p-3 text-xs space-y-1">
            <div className="flex justify-between text-[#b1bad3]">
              <span>Selected:</span>
              <span className="font-bold text-white">{selectedNumbers.length} / 10</span>
            </div>
            <div className="flex justify-between text-[#b1bad3]">
              <span>Hits:</span>
              <span className="font-bold text-[#00e701] font-mono">{hits} Matches</span>
            </div>
          </div>

          <button
            onClick={startKeno}
            disabled={isDrawing || selectedNumbers.length === 0}
            className="w-full rounded-xl bg-[#00e701] py-4 text-sm font-extrabold text-[#0f212e] shadow-lg shadow-[#00e701]/30 transition-all hover:bg-[#00c701] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Sparkles className="h-4 w-4 fill-current" />
            <span>{isDrawing ? "Drawing Numbers..." : "Bet"}</span>
          </button>
        </div>

        {/* 40 Number Grid */}
        <div className="lg:col-span-8 bg-[#0f212e] p-6 flex flex-col items-center justify-center min-h-[420px]">
          <div className="grid grid-cols-8 gap-2 sm:gap-2.5 w-full max-w-lg">
            {Array.from({ length: 40 }, (_, i) => i + 1).map((num) => {
              const isSelected = selectedNumbers.includes(num);
              const isDrawn = drawnNumbers.includes(num);
              const isHit = isSelected && isDrawn;

              return (
                <button
                  key={num}
                  onClick={() => toggleNumber(num)}
                  disabled={isDrawing}
                  className={`h-10 sm:h-12 rounded-xl text-xs sm:text-sm font-black font-mono transition-all ${
                    isHit
                      ? "bg-[#00e701] text-[#0f212e] shadow-[0_0_15px_#00e701] scale-105"
                      : isDrawn
                      ? "bg-red-500/80 text-white"
                      : isSelected
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-[#1a2c38] text-[#b1bad3] border border-[#213743] hover:border-[#00e701]/50 hover:text-white"
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
