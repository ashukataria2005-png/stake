"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Play, RotateCcw } from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

export default function RoulettePage() {
  const { balance, updateBalance, currency, formatBalance } = useGame();
  const [betAmount, setBetAmount] = useState<number>(10);
  const [selectedBet, setSelectedBet] = useState<"red" | "black" | "even" | "odd" | "green">("red");
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [lastNumber, setLastNumber] = useState<number | null>(null);
  const [hasWon, setHasWon] = useState<boolean | null>(null);

  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

  const spinRoulette = () => {
    if (isSpinning) return;
    if (betAmount > balance) {
      alert("Insufficient demo balance! Please use the Wallet button.");
      return;
    }
    if (betAmount <= 0) return;

    updateBalance(-betAmount);
    setIsSpinning(true);
    setHasWon(null);
    sounds.playDiceRoll();

    setTimeout(() => {
      const rolled = Math.floor(Math.random() * 37); // 0 to 36
      setLastNumber(rolled);
      setIsSpinning(false);

      let won = false;
      let payoutMult = 2;

      if (rolled === 0) {
        won = selectedBet === "green";
        payoutMult = 36;
      } else {
        const isRed = redNumbers.includes(rolled);
        if (selectedBet === "red" && isRed) won = true;
        if (selectedBet === "black" && !isRed) won = true;
        if (selectedBet === "even" && rolled % 2 === 0) won = true;
        if (selectedBet === "odd" && rolled % 2 === 1) won = true;
      }

      setHasWon(won);
      if (won) {
        const payout = parseFloat((betAmount * payoutMult).toFixed(2));
        updateBalance(payout);
        sounds.playDiceWin();
        try { confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } }); } catch {}
      } else {
        sounds.playDiceLoss();
      }
    }, 1500);
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
          <span>European Roulette 97.3% RTP</span>
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
                disabled={isSpinning}
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(1, parseFloat(e.target.value) || 0))}
                className="w-full bg-transparent text-sm font-bold text-white focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-[#b1bad3]">Select Bet</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedBet("red")}
                className={`py-3 rounded-xl font-bold text-xs transition-all ${
                  selectedBet === "red" ? "bg-red-600 text-white ring-2 ring-white" : "bg-red-950/70 text-red-300"
                }`}
              >
                Red (2x)
              </button>
              <button
                type="button"
                onClick={() => setSelectedBet("black")}
                className={`py-3 rounded-xl font-bold text-xs transition-all ${
                  selectedBet === "black" ? "bg-gray-800 text-white ring-2 ring-white" : "bg-[#0f212e] text-gray-300"
                }`}
              >
                Black (2x)
              </button>
              <button
                type="button"
                onClick={() => setSelectedBet("even")}
                className={`py-2.5 rounded-xl font-bold text-xs transition-all ${
                  selectedBet === "even" ? "bg-[#213743] text-[#00e701] border border-[#00e701]" : "bg-[#0f212e] text-[#b1bad3]"
                }`}
              >
                Even (2x)
              </button>
              <button
                type="button"
                onClick={() => setSelectedBet("odd")}
                className={`py-2.5 rounded-xl font-bold text-xs transition-all ${
                  selectedBet === "odd" ? "bg-[#213743] text-[#00e701] border border-[#00e701]" : "bg-[#0f212e] text-[#b1bad3]"
                }`}
              >
                Odd (2x)
              </button>
              <button
                type="button"
                onClick={() => setSelectedBet("green")}
                className={`col-span-2 py-2 rounded-xl font-bold text-xs transition-all ${
                  selectedBet === "green" ? "bg-[#00e701] text-[#0f212e]" : "bg-emerald-950/70 text-[#00e701]"
                }`}
              >
                Zero 0 (36x)
              </button>
            </div>
          </div>

          <button
            onClick={spinRoulette}
            disabled={isSpinning || betAmount > balance || betAmount <= 0}
            className="w-full rounded-xl bg-[#00e701] py-4 text-sm font-extrabold text-[#0f212e] shadow-lg shadow-[#00e701]/30 transition-all hover:bg-[#00c701] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <RotateCcw className={`h-4 w-4 ${isSpinning ? "animate-spin" : ""}`} />
            <span>{isSpinning ? "Spinning Ball..." : "Spin"}</span>
          </button>
        </div>

        {/* Roulette Display Area */}
        <div className="lg:col-span-8 bg-[#0f212e] p-8 flex flex-col items-center justify-center min-h-[420px] space-y-4">
          <div
            className={`w-28 h-28 rounded-full border-4 flex items-center justify-center shadow-2xl transition-all ${
              lastNumber === 0
                ? "bg-[#00e701] border-white text-[#0f212e]"
                : lastNumber !== null && redNumbers.includes(lastNumber)
                ? "bg-red-600 border-white text-white"
                : lastNumber !== null
                ? "bg-black border-white text-white"
                : "bg-[#1a2c38] border-[#213743] text-white"
            }`}
          >
            <span className="text-4xl font-black font-mono">
              {lastNumber !== null ? lastNumber : "—"}
            </span>
          </div>

          <div className="text-xs font-bold uppercase tracking-wider text-[#b1bad3]">
            {hasWon === true
              ? `You Won on ${selectedBet.toUpperCase()}!`
              : hasWon === false
              ? `Ball landed on ${lastNumber}. Better luck next roll!`
              : "Place your bet and spin"}
          </div>
        </div>
      </div>
    </div>
  );
}
