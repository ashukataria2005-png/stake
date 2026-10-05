"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Play, RotateCcw } from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

interface Card {
  suit: "♠" | "♥" | "♦" | "♣";
  value: string;
  num: number;
}

export default function BlackjackPage() {
  const { balance, updateBalance, currency, formatBalance } = useGame();
  const [betAmount, setBetAmount] = useState<number>(10);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<"idle" | "playing" | "dealerTurn" | "ended">("idle");
  const [resultMsg, setResultMsg] = useState<string>("");

  const suits: ("♠" | "♥" | "♦" | "♣")[] = ["♠", "♥", "♦", "♣"];
  const values = [
    { v: "2", n: 2 }, { v: "3", n: 3 }, { v: "4", n: 4 }, { v: "5", n: 5 },
    { v: "6", n: 6 }, { v: "7", n: 7 }, { v: "8", n: 8 }, { v: "9", n: 9 },
    { v: "10", n: 10 }, { v: "J", n: 10 }, { v: "Q", n: 10 }, { v: "K", n: 10 },
    { v: "A", n: 11 },
  ];

  const drawCard = (): Card => {
    const s = suits[Math.floor(Math.random() * suits.length)];
    const val = values[Math.floor(Math.random() * values.length)];
    return { suit: s, value: val.v, num: val.n };
  };

  const getScore = (hand: Card[]): number => {
    let score = hand.reduce((sum, c) => sum + c.num, 0);
    let aces = hand.filter((c) => c.value === "A").length;
    while (score > 21 && aces > 0) {
      score -= 10;
      aces--;
    }
    return score;
  };

  const startRound = () => {
    if (betAmount > balance) {
      alert("Insufficient demo balance! Please use the Wallet button.");
      return;
    }
    if (betAmount <= 0) return;

    updateBalance(-betAmount);
    sounds.playDiceRoll();

    const pHand = [drawCard(), drawCard()];
    const dHand = [drawCard(), drawCard()];
    setPlayerHand(pHand);
    setDealerHand(dHand);
    setResultMsg("");

    const pScore = getScore(pHand);
    if (pScore === 21) {
      // Natural Blackjack!
      setGameState("ended");
      setResultMsg("Blackjack! Paid 3:2");
      updateBalance(betAmount * 2.5);
      sounds.playDiceWin();
      try { confetti({ particleCount: 70, spread: 70 }); } catch {}
    } else {
      setGameState("playing");
    }
  };

  const hit = () => {
    if (gameState !== "playing") return;
    sounds.playPeg();
    const newHand = [...playerHand, drawCard()];
    setPlayerHand(newHand);

    if (getScore(newHand) > 21) {
      setGameState("ended");
      setResultMsg("Player Busted! Dealer Wins.");
      sounds.playDiceLoss();
    }
  };

  const stand = () => {
    if (gameState !== "playing") return;
    setGameState("dealerTurn");

    let currentDealer = [...dealerHand];
    while (getScore(currentDealer) < 17) {
      currentDealer.push(drawCard());
    }
    setDealerHand(currentDealer);

    const dScore = getScore(currentDealer);
    const pScore = getScore(playerHand);

    setGameState("ended");
    if (dScore > 21 || pScore > dScore) {
      setResultMsg(`Player Wins with ${pScore}!`);
      updateBalance(betAmount * 2);
      sounds.playDiceWin();
      try { confetti({ particleCount: 50, spread: 50 }); } catch {}
    } else if (pScore === dScore) {
      setResultMsg("Push! Bet refunded.");
      updateBalance(betAmount);
    } else {
      setResultMsg(`Dealer Wins with ${dScore}.`);
      sounds.playDiceLoss();
    }
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
          <span>Provably Fair 99.5% RTP</span>
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
                disabled={gameState === "playing"}
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(1, parseFloat(e.target.value) || 0))}
                className="w-full bg-transparent text-sm font-bold text-white focus:outline-none font-mono"
              />
            </div>
          </div>

          {gameState !== "playing" ? (
            <button
              onClick={startRound}
              disabled={betAmount > balance || betAmount <= 0}
              className="w-full rounded-xl bg-[#00e701] py-4 text-sm font-extrabold text-[#0f212e] shadow-lg shadow-[#00e701]/30 transition-all hover:bg-[#00c701] active:scale-95 flex items-center justify-center gap-2"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Deal Hand</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={hit}
                className="rounded-xl bg-[#00e701] py-3.5 text-sm font-extrabold text-[#0f212e] hover:bg-[#00c701]"
              >
                Hit
              </button>
              <button
                onClick={stand}
                className="rounded-xl bg-amber-400 py-3.5 text-sm font-extrabold text-[#0f212e] hover:bg-amber-300"
              >
                Stand
              </button>
            </div>
          )}

          {resultMsg && (
            <div className="rounded-xl border border-[#213743] bg-[#0f212e] p-3 text-center">
              <span className="text-xs font-bold text-white">{resultMsg}</span>
            </div>
          )}
        </div>

        {/* Blackjack Table Felt */}
        <div className="lg:col-span-8 bg-[#0f212e] p-8 flex flex-col justify-between min-h-[460px]">
          {/* Dealer Area */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-[#b1bad3] uppercase tracking-wider">
              Dealer {gameState === "ended" ? `(${getScore(dealerHand)})` : ""}
            </div>
            <div className="flex gap-2">
              {dealerHand.map((c, i) => (
                <div
                  key={i}
                  className="w-14 h-20 sm:w-16 sm:h-24 rounded-lg bg-white border border-gray-300 shadow-lg flex flex-col justify-between p-1.5"
                >
                  <span className={`text-xs font-black ${c.suit === "♥" || c.suit === "♦" ? "text-red-600" : "text-black"}`}>
                    {c.value}{c.suit}
                  </span>
                  <span className={`text-lg font-black text-center ${c.suit === "♥" || c.suit === "♦" ? "text-red-600" : "text-black"}`}>
                    {c.suit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Table Center Text */}
          <div className="text-center font-bold text-xs tracking-widest text-[#213743] uppercase select-none">
            BLACKJACK PAYS 3 TO 2 • DEALER MUST STAND ON 17
          </div>

          {/* Player Area */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-[#b1bad3] uppercase tracking-wider">
              Player {playerHand.length > 0 ? `(${getScore(playerHand)})` : ""}
            </div>
            <div className="flex gap-2">
              {playerHand.map((c, i) => (
                <div
                  key={i}
                  className="w-14 h-20 sm:w-16 sm:h-24 rounded-lg bg-white border border-gray-300 shadow-lg flex flex-col justify-between p-1.5"
                >
                  <span className={`text-xs font-black ${c.suit === "♥" || c.suit === "♦" ? "text-red-600" : "text-black"}`}>
                    {c.value}{c.suit}
                  </span>
                  <span className={`text-lg font-black text-center ${c.suit === "♥" || c.suit === "♦" ? "text-red-600" : "text-black"}`}>
                    {c.suit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
