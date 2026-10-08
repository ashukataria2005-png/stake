"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, ShieldCheck } from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

export default function RouletteGame() {
  const { balance, updateBalance, currency, formatBalance, currencySymbol } = useGame();
  const activeSym = currencySymbol || "$";
  const [betAmount, setBetAmount] = useState<number>(10);
  const [betInput, setBetInput] = useState<string>("10");

  React.useEffect(() => {
    if (betInput !== "" && parseFloat(betInput) === betAmount) return;
    setBetInput(betAmount.toString());
  }, [betAmount]);

  const [selectedBet, setSelectedBet] = useState<"red" | "black" | "even" | "odd" | "green">("red");
  const [lastNumber, setLastNumber] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [hasWon, setHasWon] = useState<boolean | null>(null);

  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

  const spinRoulette = () => {
    if (isSpinning) return;
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
    setIsSpinning(true);
    setHasWon(null);
    sounds.playDiceRoll();

    const start = performance.now();
    const interval = setInterval(() => {
      setLastNumber(Math.floor(Math.random() * 37));
      if (performance.now() - start > 2200) {
        clearInterval(interval);
        const finalNum = Math.floor(Math.random() * 37);
        setLastNumber(finalNum);
        setIsSpinning(false);

        let won = false;
        let payoutMult = 0;

        if (selectedBet === "green" && finalNum === 0) {
          won = true;
          payoutMult = 36;
        } else if (selectedBet === "red" && redNumbers.includes(finalNum)) {
          won = true;
          payoutMult = 2;
        } else if (selectedBet === "black" && finalNum !== 0 && !redNumbers.includes(finalNum)) {
          won = true;
          payoutMult = 2;
        } else if (selectedBet === "even" && finalNum !== 0 && finalNum % 2 === 0) {
          won = true;
          payoutMult = 2;
        } else if (selectedBet === "odd" && finalNum % 2 === 1) {
          won = true;
          payoutMult = 2;
        }

        setHasWon(won);

        if (won) {
          const payout = parseFloat((betAmount * payoutMult).toFixed(2));
          updateBalance(payout);
          sounds.playDiceWin();
          try {
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
          } catch {}
        } else {
          sounds.playDiceLoss();
        }
      }
    }, 50);
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
          <span>Provably Fair European Roulette</span>
        </div>
      </div>

      {/* Main 2-Panel Container: On mobile, Display Area is on top, Controls below */}
      <div className="rounded-2xl border border-[#213743] bg-[#1a2c38] overflow-hidden shadow-2xl flex flex-col-reverse lg:flex-row">
        {/* Controls Panel */}
        <div className="w-full lg:w-[340px] shrink-0 border-t lg:border-t-0 lg:border-r border-[#213743] bg-[#1a2c38] p-5 space-y-4 flex flex-col justify-start">
          {/* [Section 2 - Directly below Game Screen]: PRIMARY ACTION BUTTON */}
          <div className="w-full">
            <button
              onClick={spinRoulette}
              disabled={isSpinning || betAmount > balance || betAmount <= 0}
              className="w-full py-4 text-base font-extrabold rounded-lg bg-[#00e701] text-black shadow-md hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className={`h-5 w-5 ${isSpinning ? "animate-spin" : ""}`} />
              <span>{isSpinning ? "Spinning Ball..." : "Bet"}</span>
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
                  disabled={isSpinning}
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

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#b1bad3]">Bet Option</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedBet("red")}
                  className={`py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    selectedBet === "red" ? "bg-red-600 text-white shadow-md" : "bg-[#0f212e] text-[#b1bad3]"
                  }`}
                >
                  Red (2x)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBet("black")}
                  className={`py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    selectedBet === "black" ? "bg-zinc-800 text-white border border-gray-600 shadow-md" : "bg-[#0f212e] text-[#b1bad3]"
                  }`}
                >
                  Black (2x)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBet("even")}
                  className={`py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    selectedBet === "even" ? "bg-[#213743] text-[#00e701] border border-[#00e701]" : "bg-[#0f212e] text-[#b1bad3]"
                  }`}
                >
                  Even (2x)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBet("odd")}
                  className={`py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    selectedBet === "odd" ? "bg-[#213743] text-[#00e701] border border-[#00e701]" : "bg-[#0f212e] text-[#b1bad3]"
                  }`}
                >
                  Odd (2x)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBet("green")}
                  className={`col-span-2 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    selectedBet === "green" ? "bg-[#00e701] text-black font-extrabold" : "bg-emerald-950/70 text-[#00e701]"
                  }`}
                >
                  Zero 0 (36x)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* [Section 1]: Roulette Display Area */}
        <div className="flex-1 bg-[#0f212e] p-8 flex flex-col items-center justify-center min-h-[420px] space-y-4">
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
