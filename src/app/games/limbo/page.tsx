"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Zap, ShieldCheck } from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

export default function LimboPage() {
  const { balance, updateBalance, currency, formatBalance } = useGame();
  const [betAmount, setBetAmount] = useState<number>(10);
  const [targetMultiplier, setTargetMultiplier] = useState<number>(2.0);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [hasWon, setHasWon] = useState<boolean | null>(null);

  const winChance = parseFloat((99.0 / targetMultiplier).toFixed(2));

  const rollLimbo = () => {
    if (isRolling) return;
    if (betAmount > balance) {
      alert("Insufficient demo balance! Please use the Wallet button.");
      return;
    }
    if (betAmount <= 0) return;

    updateBalance(-betAmount);
    setIsRolling(true);
    setHasWon(null);
    sounds.playDiceRoll();

    // Rapid shuffle animation for 200ms
    const start = performance.now();
    const interval = setInterval(() => {
      setLastRoll(parseFloat((Math.random() * targetMultiplier * 1.5 + 1.0).toFixed(2)));
      if (performance.now() - start > 200) {
        clearInterval(interval);

        // Stake Limbo formula: 0.99 / (1 - rand)
        const rand = Math.random();
        let result = parseFloat((0.99 / (1 - rand)).toFixed(2));
        if (result < 1.0) result = 1.0;
        setLastRoll(result);

        const won = result >= targetMultiplier;
        setHasWon(won);
        setIsRolling(false);

        if (won) {
          const payout = parseFloat((betAmount * targetMultiplier).toFixed(2));
          updateBalance(payout);
          sounds.playDiceWin();
          if (targetMultiplier >= 5) {
            try {
              confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
            } catch {}
          }
        } else {
          sounds.playDiceLoss();
        }
      }
    }, 30);
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
          <span>Provably Fair 99% RTP</span>
        </div>
      </div>

      {/* Main 2-Panel Container: On mobile, Arena is Section 1 (top), Controls is Section 2/3 (below) */}
      <div className="rounded-2xl border border-[#213743] bg-[#1a2c38] overflow-hidden shadow-2xl flex flex-col-reverse lg:flex-row">
        {/* Controls Panel */}
        <div className="w-full lg:w-[340px] shrink-0 border-t lg:border-t-0 lg:border-r border-[#213743] bg-[#1a2c38] p-4 sm:p-5 flex flex-col justify-start space-y-4">
          {/* [Section 2 - Directly below Game Screen]: PRIMARY ACTION BUTTON */}
          <div className="w-full">
            <button
              onClick={rollLimbo}
              disabled={isRolling || betAmount > balance || betAmount <= 0}
              className="w-full py-4 text-base font-extrabold rounded-lg bg-[#00e701] text-black shadow-md hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="h-5 w-5 fill-current" />
              <span>{isRolling ? "Rolling..." : "Bet"}</span>
            </button>
          </div>

          {/* [Section 3]: Betting Inputs & Modifiers */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-[#b1bad3]">
                <span>Bet Amount</span>
                <span className="text-[#00e701] font-mono">${formatBalance(balance)} {currency}</span>
              </div>
              <div className="flex items-center rounded-xl border border-[#213743] bg-[#0f212e] p-1 focus-within:border-[#00e701] transition-colors">
                <span className="px-2 text-sm font-bold text-[#00e701]">$</span>
                <input
                  type="number"
                  disabled={isRolling}
                  value={betAmount}
                  onChange={(e) => setBetAmount(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="w-full bg-transparent text-sm font-bold text-white focus:outline-none font-mono"
                />
                <button
                  type="button"
                  disabled={isRolling}
                  onClick={() => setBetAmount((prev) => Math.max(1, parseFloat((prev / 2).toFixed(2))))}
                  className="rounded-lg px-2.5 py-1 text-xs font-bold text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors cursor-pointer"
                >
                  ½
                </button>
                <button
                  type="button"
                  disabled={isRolling}
                  onClick={() => setBetAmount((prev) => parseFloat((prev * 2).toFixed(2)))}
                  className="rounded-lg px-2.5 py-1 text-xs font-bold text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors cursor-pointer"
                >
                  2×
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#b1bad3]">Target Multiplier</label>
                <div className="flex items-center rounded-xl border border-[#213743] bg-[#0f212e] p-2 focus-within:border-[#00e701] transition-colors">
                  <input
                    type="number"
                    step="0.1"
                    min="1.01"
                    disabled={isRolling}
                    value={targetMultiplier}
                    onChange={(e) => setTargetMultiplier(Math.max(1.01, parseFloat(e.target.value) || 1.01))}
                    className="w-full bg-transparent text-sm font-bold text-white focus:outline-none font-mono"
                  />
                  <span className="text-xs font-bold text-[#b1bad3]">×</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#b1bad3]">Win Chance</label>
                <div className="rounded-xl border border-[#213743] bg-[#0f212e] p-2 text-sm font-bold text-[#00e701] font-mono flex items-center h-[38px]">
                  {winChance}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* [Section 1]: Game Arena */}
        <div className="flex-1 bg-[#0f212e] p-8 flex flex-col items-center justify-center min-h-[420px] space-y-4">
          <div
            className={`text-6xl sm:text-8xl font-black font-mono tracking-tight transition-all ${
              hasWon === true
                ? "text-[#00e701] drop-shadow-[0_0_25px_rgba(0,231,1,0.6)]"
                : hasWon === false
                ? "text-red-500 drop-shadow-[0_0_25px_rgba(239,68,68,0.6)]"
                : "text-white"
            }`}
          >
            {lastRoll !== null ? `${lastRoll.toFixed(2)}×` : `${targetMultiplier.toFixed(2)}×`}
          </div>

          <div className="text-xs font-bold uppercase tracking-wider text-[#b1bad3]">
            {hasWon === true
              ? `Target hit! +$${(betAmount * targetMultiplier).toFixed(2)}`
              : hasWon === false
              ? `Target ${targetMultiplier}× missed`
              : `Target: ${targetMultiplier.toFixed(2)}×`}
          </div>
        </div>
      </div>
    </div>
  );
}
