"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CircleDot, ShieldCheck, Play } from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

export default function WheelPage() {
  const { balance, updateBalance, currency, formatBalance } = useGame();
  const [betAmount, setBetAmount] = useState<number>(10);
  const [rotation, setRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [resultMultiplier, setResultMultiplier] = useState<number | null>(null);

  const segments = [
    { mult: 0.0, color: "#1e293b" },
    { mult: 1.5, color: "#2563eb" },
    { mult: 1.2, color: "#059669" },
    { mult: 2.0, color: "#d97706" },
    { mult: 1.2, color: "#059669" },
    { mult: 3.0, color: "#dc2626" },
    { mult: 1.5, color: "#2563eb" },
    { mult: 1.2, color: "#059669" },
    { mult: 5.0, color: "#9333ea" },
    { mult: 1.2, color: "#059669" },
  ];

  const spinWheel = () => {
    if (isSpinning) return;
    if (betAmount > balance) {
      alert("Insufficient demo balance! Please use the Wallet button.");
      return;
    }
    if (betAmount <= 0) return;

    updateBalance(-betAmount);
    setIsSpinning(true);
    setResultMultiplier(null);
    sounds.playDiceRoll();

    const selectedIndex = Math.floor(Math.random() * segments.length);
    const segmentAngle = 360 / segments.length;
    const extraSpins = 360 * 5;
    const targetAngle = extraSpins + selectedIndex * segmentAngle + segmentAngle / 2;

    setRotation((prev) => prev + targetAngle);

    setTimeout(() => {
      setIsSpinning(false);
      const wonMult = segments[selectedIndex].mult;
      setResultMultiplier(wonMult);

      if (wonMult > 0) {
        const payout = parseFloat((betAmount * wonMult).toFixed(2));
        updateBalance(payout);
        sounds.playDiceWin();
        if (wonMult >= 2.0) {
          try {
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
          } catch {}
        }
      } else {
        sounds.playDiceLoss();
      }
    }, 3000);
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
          <span>Provably Fair Wheel</span>
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

          <button
            onClick={spinWheel}
            disabled={isSpinning || betAmount > balance || betAmount <= 0}
            className="w-full rounded-xl bg-[#00e701] py-4 text-sm font-extrabold text-[#0f212e] shadow-lg shadow-[#00e701]/30 transition-all hover:bg-[#00c701] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <CircleDot className={`h-4 w-4 ${isSpinning ? "animate-spin" : ""}`} />
            <span>{isSpinning ? "Spinning..." : "Spin Wheel"}</span>
          </button>

          {resultMultiplier !== null && (
            <div className="rounded-xl border border-[#213743] bg-[#0f212e] p-4 text-center">
              <div className="text-xs text-[#b1bad3]">Outcome:</div>
              <div
                className={`text-2xl font-black font-mono ${
                  resultMultiplier > 0 ? "text-[#00e701]" : "text-red-500"
                }`}
              >
                {resultMultiplier > 0
                  ? `${resultMultiplier}x (+${(betAmount * resultMultiplier).toFixed(2)})`
                  : "0.0x (Loss)"}
              </div>
            </div>
          )}
        </div>

        {/* Rotating Wheel Arena */}
        <div className="lg:col-span-8 bg-[#0f212e] p-8 flex flex-col items-center justify-center min-h-[420px] relative overflow-hidden">
          {/* Wheel Pointer Arrow */}
          <div className="absolute top-8 z-20 w-0 h-0 border-x-8 border-x-transparent border-t-[16px] border-t-[#00e701] drop-shadow-[0_0_8px_#00e701]" />

          {/* Wheel Disc */}
          <div
            className="w-64 h-64 sm:w-80 sm:h-80 rounded-full border-4 border-[#213743] shadow-2xl relative transition-transform duration-[3000ms] ease-out flex items-center justify-center overflow-hidden"
            style={{
              transform: `rotate(${rotation}deg)`,
              background: `conic-gradient(
                #1e293b 0deg 36deg,
                #2563eb 36deg 72deg,
                #059669 72deg 108deg,
                #d97706 108deg 144deg,
                #059669 144deg 180deg,
                #dc2626 180deg 216deg,
                #2563eb 216deg 252deg,
                #059669 252deg 288deg,
                #9333ea 288deg 324deg,
                #059669 324deg 360deg
              )`,
            }}
          >
            {/* Center Cap */}
            <div className="w-16 h-16 rounded-full bg-[#1a2c38] border-2 border-[#213743] flex items-center justify-center shadow-lg">
              <span className="text-xs font-black text-[#00e701]">STAKE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
