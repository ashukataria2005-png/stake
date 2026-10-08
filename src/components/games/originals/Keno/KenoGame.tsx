"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, ShieldCheck } from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

export default function KenoGame() {
  const { balance, updateBalance, currency, formatBalance, currencySymbol } = useGame();
  const activeSym = currencySymbol || "$";
  const [betAmount, setBetAmount] = useState<number>(10);
  const [betInput, setBetInput] = useState<string>("10");

  React.useEffect(() => {
    if (betInput !== "" && parseFloat(betInput) === betAmount) return;
    setBetInput(betAmount.toString());
  }, [betAmount]);

  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([3, 7, 12, 25, 38]);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [hits, setHits] = useState<number>(0);

  const toggleNumber = (num: number) => {
    if (isDrawing) return;
    sounds.playClick();
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
    } else {
      if (selectedNumbers.length >= 10) return;
      setSelectedNumbers([...selectedNumbers, num]);
    }
  };

  const autoPick = () => {
    if (isDrawing) return;
    sounds.playClick();
    const nums: number[] = [];
    while (nums.length < 5) {
      const r = Math.floor(Math.random() * 40) + 1;
      if (!nums.includes(r)) nums.push(r);
    }
    setSelectedNumbers(nums);
  };

  const clearPicks = () => {
    if (isDrawing) return;
    sounds.playClick();
    setSelectedNumbers([]);
  };

  const startKeno = () => {
    if (isDrawing || selectedNumbers.length === 0) return;
    const effectiveBet =
      betInput === "" || isNaN(parseFloat(betInput)) || parseFloat(betInput) <= 0
        ? 1
        : parseFloat(betInput);

    if (betInput === "" || isNaN(parseFloat(betInput))) {
      setBetInput(effectiveBet.toString());
      setBetAmount(effectiveBet);
    }

    if (effectiveBet > balance) {
      alert("Insufficient balance! Please use the Wallet button.");
      return;
    }
    if (effectiveBet <= 0) return;

    updateBalance(-effectiveBet);
    setIsDrawing(true);
    setDrawnNumbers([]);
    setHits(0);
    sounds.playDiceRoll();

    const drawn: number[] = [];
    let intervalCount = 0;

    const interval = setInterval(() => {
      let nextNum = Math.floor(Math.random() * 40) + 1;
      while (drawn.includes(nextNum)) {
        nextNum = Math.floor(Math.random() * 40) + 1;
      }
      drawn.push(nextNum);
      setDrawnNumbers([...drawn]);
      sounds.playClick();

      intervalCount++;
      if (intervalCount >= 10) {
        clearInterval(interval);
        setIsDrawing(false);

        const matchCount = selectedNumbers.filter((n) => drawn.includes(n)).length;
        setHits(matchCount);

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

      {/* Main 2-Panel Container: On mobile, Grid Arena is on top, Controls below */}
      <div className="rounded-2xl border border-[#213743] bg-[#1a2c38] overflow-hidden shadow-2xl flex flex-col-reverse lg:flex-row">
        {/* Controls Panel */}
        <div className="w-full lg:w-[340px] shrink-0 border-t lg:border-t-0 lg:border-r border-[#213743] bg-[#1a2c38] p-5 space-y-4 flex flex-col justify-start">
          {/* [Section 2 - Directly below Game Screen]: PRIMARY ACTION BUTTON */}
          <div className="w-full">
            <button
              onClick={startKeno}
              disabled={isDrawing || selectedNumbers.length === 0 || betAmount > balance || betAmount <= 0}
              className="w-full py-4 text-base font-extrabold rounded-lg bg-[#00e701] text-black shadow-md hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="h-5 w-5 fill-current" />
              <span>{isDrawing ? "Drawing Numbers..." : "Bet"}</span>
            </button>
          </div>

          {/* [Section 3]: Betting Inputs & Modifiers */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-[#b1bad3]">
                <span>Bet Amount</span>
                <span className="text-[#00e701] font-mono">{activeSym}{formatBalance(balance)}</span>
              </div>
              <div className="flex items-center rounded-xl border border-[#213743] bg-[#0f212e] p-1 focus-within:border-[#00e701] transition-colors">
                <span className="px-2 text-sm font-bold text-[#00e701]">{activeSym}</span>
                <input
                  type="text"
                  inputMode="decimal"
                  disabled={isDrawing}
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
                      setBetInput("1");
                      setBetAmount(1);
                    } else {
                      const num = parseFloat(betInput);
                      setBetInput(num.toString());
                      setBetAmount(num);
                    }
                  }}
                  className="w-full bg-transparent text-sm font-bold text-white focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={autoPick}
                disabled={isDrawing}
                className="flex-1 rounded-xl border border-[#213743] bg-[#0f212e] py-2 text-xs font-bold text-white hover:bg-[#213743] transition-colors cursor-pointer"
              >
                Auto Pick
              </button>
              <button
                onClick={clearPicks}
                disabled={isDrawing}
                className="rounded-xl border border-[#213743] bg-[#0f212e] px-3 py-2 text-xs font-bold text-[#b1bad3] hover:text-white transition-colors cursor-pointer"
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
          </div>
        </div>

        {/* [Section 1]: 40 Number Grid Arena */}
        <div className="flex-1 bg-[#0f212e] p-6 flex flex-col items-center justify-center min-h-[420px]">
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
                  className={`h-10 sm:h-12 rounded-xl text-xs sm:text-sm font-black font-mono transition-all cursor-pointer ${
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
