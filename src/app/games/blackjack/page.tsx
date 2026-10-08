"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Play, ShieldCheck } from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

interface Card {
  suit: string;
  value: string;
  score: number;
}

const SUITS = ["♠", "♥", "♦", "♣"];
const VALUES = [
  { val: "2", score: 2 },
  { val: "3", score: 3 },
  { val: "4", score: 4 },
  { val: "5", score: 5 },
  { val: "6", score: 6 },
  { val: "7", score: 7 },
  { val: "8", score: 8 },
  { val: "9", score: 9 },
  { val: "10", score: 10 },
  { val: "J", score: 10 },
  { val: "Q", score: 10 },
  { val: "K", score: 10 },
  { val: "A", score: 11 },
];

export default function BlackjackPage() {
  const { balance, updateBalance, currency, currencySymbol, formatBalance } = useGame();
  const activeSym = currencySymbol || "$";
  const [betAmount, setBetAmount] = useState<number>(10);
  const [betInput, setBetInput] = useState<string>("10");
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<"betting" | "playing" | "ended">("betting");
  const [resultMsg, setResultMsg] = useState<string>("");

  useEffect(() => {
    setBetInput(betAmount.toString());
  }, [betAmount]);

  const getRandomCard = (): Card => {
    const s = SUITS[Math.floor(Math.random() * SUITS.length)];
    const v = VALUES[Math.floor(Math.random() * VALUES.length)];
    return { suit: s, value: v.val, score: v.score };
  };

  const getScore = (hand: Card[]): number => {
    let score = hand.reduce((acc, c) => acc + c.score, 0);
    let aces = hand.filter((c) => c.value === "A").length;
    while (score > 21 && aces > 0) {
      score -= 10;
      aces -= 1;
    }
    return score;
  };

  const startRound = () => {
    const effectiveBet = betInput === "" ? betAmount : (parseFloat(betInput) || betAmount);
    if (effectiveBet > balance) {
      alert("Insufficient demo balance! Please use the Wallet button.");
      return;
    }
    if (effectiveBet <= 0) return;

    setBetAmount(effectiveBet);
    updateBalance(-effectiveBet);
    sounds.playDiceRoll();
    setResultMsg("");

    const p1 = getRandomCard();
    const p2 = getRandomCard();
    const d1 = getRandomCard();

    setPlayerHand([p1, p2]);
    setDealerHand([d1]);
    setGameState("playing");

    if (getScore([p1, p2]) === 21) {
      // Natural Blackjack
      endRound([p1, p2], [d1]);
    }
  };

  const hit = () => {
    if (gameState !== "playing") return;
    sounds.playClick();
    const newCard = getRandomCard();
    const nextHand = [...playerHand, newCard];
    setPlayerHand(nextHand);

    if (getScore(nextHand) > 21) {
      // Bust
      setGameState("ended");
      setResultMsg("Bust! You exceeded 21.");
      sounds.playDiceLoss();
    }
  };

  const stand = () => {
    if (gameState !== "playing") return;
    sounds.playClick();
    let currentDealer = [...dealerHand];

    while (getScore(currentDealer) < 17) {
      currentDealer.push(getRandomCard());
    }

    setDealerHand(currentDealer);
    endRound(playerHand, currentDealer);
  };

  const endRound = (player: Card[], dealer: Card[]) => {
    const pScore = getScore(player);
    const dScore = getScore(dealer);

    setGameState("ended");

    if (pScore > 21) {
      setResultMsg("Bust! You lose.");
      sounds.playDiceLoss();
    } else if (dScore > 21 || pScore > dScore) {
      const payout = parseFloat((betAmount * 2).toFixed(2));
      updateBalance(payout);
      setResultMsg(`You Win! +$${payout} ${currency}`);
      sounds.playDiceWin();
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch {}
    } else if (pScore === dScore) {
      updateBalance(betAmount);
      setResultMsg("Push (Tie) - Bet returned");
      sounds.playClick();
    } else {
      setResultMsg("Dealer Wins.");
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

      {/* Main 2-Panel Container: On mobile, Felt Table is on top, Controls below */}
      <div className="rounded-2xl border border-[#213743] bg-[#1a2c38] overflow-hidden shadow-2xl flex flex-col-reverse lg:flex-row">
        {/* Controls Panel */}
        <div className="w-full lg:w-[340px] shrink-0 border-t lg:border-t-0 lg:border-r border-[#213743] bg-[#1a2c38] p-5 space-y-4 flex flex-col justify-start">
          {/* [Section 2 - Directly below Game Screen]: PRIMARY ACTION BUTTON */}
          <div className="w-full">
            {gameState !== "playing" ? (
              <button
                onClick={startRound}
                disabled={betAmount > balance || betAmount <= 0}
                className="w-full py-4 text-base font-extrabold rounded-lg bg-[#00e701] text-black shadow-md hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="h-5 w-5 fill-current" />
                <span>Bet (Deal Hand)</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={hit}
                  className="rounded-xl bg-[#00e701] py-4 text-base font-extrabold text-black hover:brightness-110 transition-all cursor-pointer"
                >
                  Hit
                </button>
                <button
                  onClick={stand}
                  className="rounded-xl bg-amber-400 py-4 text-base font-extrabold text-black hover:bg-amber-300 transition-all cursor-pointer"
                >
                  Stand
                </button>
              </div>
            )}
          </div>

          {/* [Section 3]: Betting Inputs & Modifiers */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-[#b1bad3]">
                <span>Bet Amount</span>
                <span className="text-[#00e701] font-mono">{activeSym}{formatBalance(balance)} {currency}</span>
              </div>
              <div className="flex items-center rounded-xl border border-[#213743] bg-[#0f212e] p-1 focus-within:border-[#00e701] transition-colors">
                <span className="px-2 text-sm font-bold text-[#00e701]">{activeSym}</span>
                <input
                  type="text"
                  inputMode="decimal"
                  disabled={gameState === "playing"}
                  value={betInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || /^\d*\.?\d*$/.test(val)) {
                      setBetInput(val);
                      if (val !== "") {
                        const num = parseFloat(val);
                        if (!isNaN(num)) setBetAmount(num);
                      }
                    }
                  }}
                  onBlur={() => {
                    if (betInput === "" || parseFloat(betInput) <= 0 || isNaN(parseFloat(betInput))) {
                      setBetAmount(1);
                      setBetInput("1");
                    } else {
                      const num = parseFloat(betInput);
                      setBetAmount(num);
                      setBetInput(num.toString());
                    }
                  }}
                  className="w-full bg-transparent text-sm font-bold text-white focus:outline-none font-mono"
                />
              </div>
            </div>

            {resultMsg && (
              <div className="rounded-xl border border-[#213743] bg-[#0f212e] p-3 text-center">
                <span className="text-xs font-bold text-white">{resultMsg}</span>
              </div>
            )}
          </div>
        </div>

        {/* [Section 1]: Blackjack Table Felt */}
        <div className="flex-1 bg-[#0f212e] p-8 flex flex-col justify-between min-h-[460px]">
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
          <div className="text-center font-bold text-xs tracking-widest text-[#213743] uppercase select-none my-6">
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
