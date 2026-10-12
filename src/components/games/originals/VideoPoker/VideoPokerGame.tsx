"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Volume2,
  VolumeX,
  ShieldCheck,
  Maximize2,
  Minimize2,
  X,
  Copy,
  Check,
  RotateCw,
  Trophy,
  Sparkles,
  Info,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

export type CardSuit = "hearts" | "diamonds" | "clubs" | "spades";
export type CardRank = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";

export interface PokerCard {
  suit: CardSuit;
  rank: CardRank;
  value: number; // 2 to 14
}

export interface HandRankResult {
  name: string;
  multiplier: number;
  highlightIndices: number[];
}

const SUIT_ICONS: Record<CardSuit, string> = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
};

const SUIT_COLORS: Record<CardSuit, string> = {
  hearts: "text-red-500",
  diamonds: "text-blue-400",
  clubs: "text-emerald-400",
  spades: "text-slate-300",
};

const PAYTABLE: { name: string; multiplier: number }[] = [
  { name: "Royal Flush", multiplier: 800 },
  { name: "Straight Flush", multiplier: 50 },
  { name: "Four of a Kind", multiplier: 25 },
  { name: "Full House", multiplier: 9 },
  { name: "Flush", multiplier: 6 },
  { name: "Straight", multiplier: 4 },
  { name: "Three of a Kind", multiplier: 3 },
  { name: "Two Pair", multiplier: 2 },
  { name: "Jacks or Better", multiplier: 1 },
];

function createDeck(): PokerCard[] {
  const suits: CardSuit[] = ["spades", "hearts", "diamonds", "clubs"];
  const ranks: { rank: CardRank; value: number }[] = [
    { rank: "2", value: 2 },
    { rank: "3", value: 3 },
    { rank: "4", value: 4 },
    { rank: "5", value: 5 },
    { rank: "6", value: 6 },
    { rank: "7", value: 7 },
    { rank: "8", value: 8 },
    { rank: "9", value: 9 },
    { rank: "10", value: 10 },
    { rank: "J", value: 11 },
    { rank: "Q", value: 12 },
    { rank: "K", value: 13 },
    { rank: "A", value: 14 },
  ];

  const deck: PokerCard[] = [];
  for (const s of suits) {
    for (const r of ranks) {
      deck.push({ suit: s, rank: r.rank, value: r.value });
    }
  }
  return deck;
}

function shuffleDeck(deck: PokerCard[]): PokerCard[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function evaluatePokerHand(cards: PokerCard[]): HandRankResult {
  if (cards.length !== 5) {
    return { name: "High Card", multiplier: 0, highlightIndices: [] };
  }

  // Count rank frequencies
  const rankCounts: Record<number, number> = {};
  cards.forEach((c) => {
    rankCounts[c.value] = (rankCounts[c.value] || 0) + 1;
  });

  // Check flush (all 5 suits identical)
  const isFlush = cards.every((c) => c.suit === cards[0].suit);

  // Check straight
  const sortedValues = [...cards].map((c) => c.value).sort((a, b) => a - b);
  let isStraight = false;
  let isRoyal = false;

  // Regular straight check
  const consecutive = sortedValues.every((val, i) => i === 0 || val === sortedValues[i - 1] + 1);
  if (consecutive) {
    isStraight = true;
    if (sortedValues[0] === 10 && sortedValues[4] === 14) {
      isRoyal = true;
    }
  } else if (
    sortedValues[0] === 2 &&
    sortedValues[1] === 3 &&
    sortedValues[2] === 4 &&
    sortedValues[3] === 5 &&
    sortedValues[4] === 14
  ) {
    // Ace-low straight (A, 2, 3, 4, 5)
    isStraight = true;
  }

  // Check combinations
  const counts = Object.values(rankCounts).sort((a, b) => b - a);

  // 1. Royal Flush
  if (isFlush && isStraight && isRoyal) {
    return { name: "Royal Flush", multiplier: 800, highlightIndices: [0, 1, 2, 3, 4] };
  }

  // 2. Straight Flush
  if (isFlush && isStraight) {
    return { name: "Straight Flush", multiplier: 50, highlightIndices: [0, 1, 2, 3, 4] };
  }

  // 3. Four of a Kind
  if (counts[0] === 4) {
    const quadValue = Number(Object.keys(rankCounts).find((k) => rankCounts[Number(k)] === 4));
    const quadIndices = cards.map((c, i) => (c.value === quadValue ? i : -1)).filter((i) => i >= 0);
    return { name: "Four of a Kind", multiplier: 25, highlightIndices: quadIndices };
  }

  // 4. Full House (3 + 2)
  if (counts[0] === 3 && counts[1] === 2) {
    return { name: "Full House", multiplier: 9, highlightIndices: [0, 1, 2, 3, 4] };
  }

  // 5. Flush
  if (isFlush) {
    return { name: "Flush", multiplier: 6, highlightIndices: [0, 1, 2, 3, 4] };
  }

  // 6. Straight
  if (isStraight) {
    return { name: "Straight", multiplier: 4, highlightIndices: [0, 1, 2, 3, 4] };
  }

  // 7. Three of a Kind
  if (counts[0] === 3) {
    const tripValue = Number(Object.keys(rankCounts).find((k) => rankCounts[Number(k)] === 3));
    const tripIndices = cards.map((c, i) => (c.value === tripValue ? i : -1)).filter((i) => i >= 0);
    return { name: "Three of a Kind", multiplier: 3, highlightIndices: tripIndices };
  }

  // 8. Two Pair
  if (counts[0] === 2 && counts[1] === 2) {
    const pairValues = Object.keys(rankCounts)
      .filter((k) => rankCounts[Number(k)] === 2)
      .map(Number);
    const pairIndices = cards.map((c, i) => (pairValues.includes(c.value) ? i : -1)).filter((i) => i >= 0);
    return { name: "Two Pair", multiplier: 2, highlightIndices: pairIndices };
  }

  // 9. Jacks or Better (Pair of J, Q, K, A)
  if (counts[0] === 2) {
    const highPairValue = Number(
      Object.keys(rankCounts).find((k) => rankCounts[Number(k)] === 2 && Number(k) >= 11)
    );
    if (!isNaN(highPairValue) && highPairValue >= 11) {
      const pairIndices = cards.map((c, i) => (c.value === highPairValue ? i : -1)).filter((i) => i >= 0);
      return { name: "Jacks or Better", multiplier: 1, highlightIndices: pairIndices };
    }
  }

  return { name: "High Card", multiplier: 0, highlightIndices: [] };
}

export default function VideoPokerGame() {
  const { balance, updateBalance, currencySymbol, addRecentlyPlayedGame } = useGame();
  const activeSym = currencySymbol || "$";

  // Register in Recently Played
  useEffect(() => {
    if (addRecentlyPlayedGame) {
      addRecentlyPlayedGame({
        id: "video-poker",
        title: "Video Poker",
        image: "/games/stake-originals/video-poker.webp",
        href: "/games/video-poker",
      });
    }
  }, [addRecentlyPlayedGame]);

  // Mode & Betting State
  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [betAmount, setBetAmount] = useState<number>(10);
  const [betInput, setBetInput] = useState<string>("10");

  useEffect(() => {
    if (betInput !== "" && parseFloat(betInput) === betAmount) return;
    setBetInput(betAmount.toString());
  }, [betAmount]);

  // Game Phases: "idle" -> "draw" (cards dealt, player can toggle hold) -> "evaluating"
  const [phase, setPhase] = useState<"idle" | "draw">("idle");
  const [deck, setDeck] = useState<PokerCard[]>([]);
  const [hand, setHand] = useState<PokerCard[]>([
    { suit: "spades", rank: "A", value: 14 },
    { suit: "hearts", rank: "K", value: 13 },
    { suit: "diamonds", rank: "Q", value: 12 },
    { suit: "clubs", rank: "J", value: 11 },
    { suit: "spades", rank: "10", value: 10 },
  ]);
  const [heldIndices, setHeldIndices] = useState<boolean[]>([false, false, false, false, false]);
  const [result, setResult] = useState<HandRankResult | null>(null);
  const [lastWinAmount, setLastWinAmount] = useState<number | null>(null);
  const [statusText, setStatusText] = useState<string>("Press BET to Deal 5 Cards");

  // Settings & Modals
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showFairnessModal, setShowFairnessModal] = useState<boolean>(false);
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);
  const [copiedSeed, setCopiedSeed] = useState<boolean>(false);
  const [stats, setStats] = useState({
    rounds: 0,
    wins: 0,
    losses: 0,
    wagered: 0,
    profit: 0,
  });

  const gameContainerRef = useRef<HTMLDivElement>(null);

  // Quick Bet Modifiers
  const handleHalfBet = () => {
    if (phase === "draw") return;
    sounds.playClick();
    const next = Math.max(0.01, parseFloat((betAmount / 2).toFixed(2)));
    setBetAmount(next);
  };

  const handleDoubleBet = () => {
    if (phase === "draw") return;
    sounds.playClick();
    const next = Math.min(balance || 100000, parseFloat((betAmount * 2).toFixed(2)));
    setBetAmount(next);
  };

  // 1. DEAL PHASE (BET)
  const handleDeal = useCallback(() => {
    if (betAmount <= 0 || betAmount > balance) return;

    sounds.playClick();
    updateBalance(-betAmount);

    const freshDeck = shuffleDeck(createDeck());
    const initialHand = freshDeck.slice(0, 5);
    const remainingDeck = freshDeck.slice(5);

    setDeck(remainingDeck);
    setHand(initialHand);
    setHeldIndices([false, false, false, false, false]);
    setResult(null);
    setLastWinAmount(null);
    setPhase("draw");
    setStatusText("Select cards to HOLD, then click DRAW");

    // Optional quick auto-hold for winning pre-draw combinations
    const initialEval = evaluatePokerHand(initialHand);
    if (initialEval.multiplier > 0) {
      const autoHeld = [false, false, false, false, false];
      initialEval.highlightIndices.forEach((idx) => {
        autoHeld[idx] = true;
      });
      setHeldIndices(autoHeld);
    }
  }, [balance, betAmount, updateBalance]);

  // Toggle Card Hold
  const toggleHold = (index: number) => {
    if (phase !== "draw") return;
    sounds.playClick();
    setHeldIndices((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  // 2. DRAW PHASE (DRAW)
  const handleDraw = useCallback(() => {
    if (phase !== "draw") return;

    sounds.playClick();

    // Replace unheld cards from remaining deck
    let deckIndex = 0;
    const finalHand = hand.map((card, idx) => {
      if (heldIndices[idx]) {
        return card;
      }
      const newCard = deck[deckIndex] || card;
      deckIndex++;
      return newCard;
    });

    setHand(finalHand);
    setPhase("idle");

    const handResult = evaluatePokerHand(finalHand);
    setResult(handResult);

    if (handResult.multiplier > 0) {
      const winPayout = parseFloat((betAmount * handResult.multiplier).toFixed(2));
      const profit = parseFloat((winPayout - betAmount).toFixed(2));
      updateBalance(winPayout);
      setLastWinAmount(winPayout);
      setStatusText(`${handResult.name}! Won ${activeSym}${winPayout.toFixed(2)} (${handResult.multiplier}×)`);

      try {
        sounds.playCashout();
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.65 },
          colors: ["#1475e1", "#00e701", "#ffffff", "#ffd700"],
        });
      } catch {}

      setStats((prev) => ({
        rounds: prev.rounds + 1,
        wins: prev.wins + 1,
        losses: prev.losses,
        wagered: prev.wagered + betAmount,
        profit: prev.profit + profit,
      }));
    } else {
      sounds.playLoss();
      setLastWinAmount(0);
      setStatusText("No Win - Try Again!");

      setStats((prev) => ({
        rounds: prev.rounds + 1,
        wins: prev.wins,
        losses: prev.losses + 1,
        wagered: prev.wagered + betAmount,
        profit: prev.profit - betAmount,
      }));
    }
  }, [activeSym, betAmount, deck, hand, heldIndices, phase, updateBalance]);

  // Primary CTA action: BET or DRAW
  const handlePrimaryCTA = () => {
    if (phase === "idle") {
      handleDeal();
    } else {
      handleDraw();
    }
  };

  return (
    <div
      ref={gameContainerRef}
      className={`w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-3 select-none space-y-3 relative z-0 pointer-events-auto ${
        isFullscreen ? "fixed inset-0 z-50 bg-[#0f212e] overflow-y-auto p-4 max-w-none" : ""
      }`}
    >
      {/* ========================================================= */}
      {/* 1. TOP INTERACTIVE ARENA: 5-CARD VIDEO POKER BOARD        */}
      {/* ========================================================= */}
      <div className="w-full rounded-t-2xl bg-[#0a1824] border-t border-x border-[#1b3445] shadow-2xl p-4 sm:p-6 flex flex-col items-center relative overflow-hidden">
        {/* Subtle royal blue glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Controls Bar */}
        <div className="w-full flex items-center justify-between mb-4 z-10 text-xs text-[#b1bad3]">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-[11px] text-[#8596a5]">
              Video Poker
            </span>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-400 font-mono font-bold text-[10px]">
              Jacks or Better (99.54% RTP)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                sounds.enabled = next;
                if (next) sounds.playClick();
              }}
              className="p-1.5 rounded-lg bg-[#1a2c38] hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors"
              title={soundEnabled ? "Mute" : "Unmute"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
            </button>
            <button
              onClick={() => setShowStatsModal(true)}
              className="p-1.5 rounded-lg bg-[#1a2c38] hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors"
              title="Live Stats"
            >
              <Trophy className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowFairnessModal(true)}
              className="p-1.5 rounded-lg bg-[#1a2c38] hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors"
              title="Provably Fair"
            >
              <ShieldCheck className="w-4 h-4 text-[#00e701]" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg bg-[#1a2c38] hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Compact Paytable Horizontal Strip */}
        <div className="w-full max-w-4xl grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1 mb-5 z-10 text-center">
          {PAYTABLE.map((item) => {
            const isActive = result?.name === item.name;
            return (
              <div
                key={item.name}
                className={`py-1.5 px-1 rounded-lg border text-[10px] sm:text-[11px] font-bold transition-all ${
                  isActive
                    ? "bg-[#00e701]/20 border-[#00e701] text-[#00e701] scale-105 shadow-md shadow-[#00e701]/20"
                    : "bg-[#142634]/70 border-[#1f3747] text-[#8596a5]"
                }`}
              >
                <div className="truncate">{item.name}</div>
                <div className="font-mono text-white text-[11px] sm:text-xs">{item.multiplier}×</div>
              </div>
            );
          })}
        </div>

        {/* 5 Cards Arena Grid */}
        <div className="w-full max-w-3xl grid grid-cols-5 gap-2 sm:gap-3.5 my-2 z-10">
          {hand.map((card, index) => {
            const isHeld = heldIndices[index];
            const isHighlight = result?.highlightIndices.includes(index);

            return (
              <div
                key={index}
                onClick={() => toggleHold(index)}
                className={`relative flex flex-col justify-between items-center rounded-xl p-2 sm:p-3 aspect-[2.7/4] border-2 transition-all duration-200 select-none ${
                  phase === "draw" ? "cursor-pointer hover:-translate-y-1" : "cursor-default"
                } ${
                  isHighlight
                    ? "border-[#00e701] bg-gradient-to-b from-[#153428] to-[#0d221a] shadow-[0_0_20px_rgba(0,231,1,0.4)]"
                    : isHeld
                    ? "border-[#1475e1] bg-gradient-to-b from-[#183754] to-[#102438] -translate-y-2 shadow-lg shadow-blue-500/20"
                    : "border-[#213743] bg-gradient-to-b from-[#1a2c38] to-[#0f212e] hover:border-[#2f4553]"
                }`}
              >
                {/* Top Badge: HELD */}
                <div className="h-4 sm:h-5 flex items-center justify-center">
                  {isHeld ? (
                    <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-[#1475e1] text-white animate-pulse">
                      HELD
                    </span>
                  ) : (
                    <span className="text-[9px] text-transparent select-none">.</span>
                  )}
                </div>

                {/* Central Card Rank & Suit */}
                <div className="flex flex-col items-center justify-center my-auto">
                  <span className="text-xl sm:text-3xl font-black text-white font-mono leading-none tracking-tight">
                    {card.rank}
                  </span>
                  <span className={`text-2xl sm:text-4xl leading-none mt-1 ${SUIT_COLORS[card.suit]}`}>
                    {SUIT_ICONS[card.suit]}
                  </span>
                </div>

                {/* Bottom Card Suit Mini */}
                <div className="w-full flex items-center justify-between text-[11px] sm:text-xs font-mono font-bold px-1 opacity-75">
                  <span className="text-white">{card.rank}</span>
                  <span className={SUIT_COLORS[card.suit]}>{SUIT_ICONS[card.suit]}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Status / Multiplier Banner */}
        <div className="mt-4 px-4 py-1.5 rounded-full bg-[#142634] border border-[#213743] text-xs font-bold text-[#b1bad3] flex items-center gap-2 z-10 font-mono">
          <Sparkles className="w-3.5 h-3.5 text-[#1475e1]" />
          <span>{statusText}</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. BETTING CONTROLS (EXACT 1:1 MINES TOKEN LAYOUT)         */}
      {/* ========================================================= */}
      <div className="w-full border-t border-[#213743] bg-[#1a2c38] p-3 sm:p-4 flex flex-col justify-start space-y-2 sm:space-y-2.5 rounded-b-2xl select-none">
        {/* Top Primary CTA Button: BET or DRAW */}
        <button
          type="button"
          onClick={handlePrimaryCTA}
          disabled={phase === "idle" && (betAmount > balance || betAmount <= 0)}
          className={`w-full py-3 sm:py-3.5 text-sm sm:text-base font-extrabold rounded-xl text-white shadow-lg active:scale-[0.98] uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 ${
            phase === "draw"
              ? "bg-[#00e701] hover:bg-[#00c201] text-black shadow-[0_0_15px_rgba(0,231,1,0.3)] font-black"
              : "bg-[#1475e1] hover:bg-[#1164c2]"
          }`}
        >
          <span>{phase === "idle" ? "BET" : "DRAW"}</span>
        </button>

        {/* Bet Amount Box with Quick Chips */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#b1bad3]">Bet Amount</span>
            <span className="font-mono text-[11px] text-[#b1bad3]">
              Bal: {activeSym}
              {balance.toFixed(2)}
            </span>
          </div>

          <div className="flex rounded-lg bg-[#0f212e] border border-[#213743] focus-within:border-[#2f4553] p-1">
            <div className="flex flex-1 items-center px-2.5">
              <span className="text-xs font-bold text-[#b1bad3] mr-1.5">{activeSym}</span>
              <input
                type="text"
                inputMode="decimal"
                disabled={phase === "draw"}
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
                className="w-full bg-transparent text-sm font-bold text-white outline-none font-mono"
              />
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={phase === "draw"}
                onClick={handleHalfBet}
                className="rounded-lg bg-[#213743] px-2.5 py-1.5 text-xs font-bold text-[#b1bad3] hover:bg-[#2f4553] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                ½
              </button>
              <button
                type="button"
                disabled={phase === "draw"}
                onClick={handleDoubleBet}
                className="rounded-lg bg-[#213743] px-2.5 py-1.5 text-xs font-bold text-[#b1bad3] hover:bg-[#2f4553] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                2×
              </button>
            </div>
          </div>
        </div>

        {/* Mode Switch Tabs [ Manual | Auto ] Anchored at Bottom */}
        <div className="flex rounded-lg bg-[#0f212e] p-1 border border-[#213743] mt-auto">
          <button
            type="button"
            disabled={phase === "draw"}
            onClick={() => {
              sounds.playClick();
              setMode("manual");
            }}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
              mode === "manual" ? "bg-[#213743] text-white shadow-sm" : "text-[#b1bad3] hover:text-white"
            }`}
          >
            Manual
          </button>
          <button
            type="button"
            disabled={phase === "draw"}
            onClick={() => {
              sounds.playClick();
              setMode("auto");
            }}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
              mode === "auto" ? "bg-[#213743] text-white shadow-sm" : "text-[#b1bad3] hover:text-white"
            }`}
          >
            Auto
          </button>
        </div>
      </div>

      {/* Fairness Modal */}
      {showFairnessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#1a2c38] border border-[#213743] p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#00e701]" />
                <h3 className="font-extrabold text-white text-base">Provably Fair</h3>
              </div>
              <button
                onClick={() => setShowFairnessModal(false)}
                className="text-[#b1bad3] hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-[#b1bad3] leading-relaxed">
              Video Poker uses cryptographic SHA-256 Fisher-Yates deck shuffling. Results are generated
              deterministically from active client and server seeds.
            </p>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#b1bad3]">Active Server Seed (Hashed)</label>
              <div className="flex items-center justify-between rounded-xl bg-[#0f212e] border border-[#213743] p-2 text-xs font-mono text-white">
                <span className="truncate">e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
                    setCopiedSeed(true);
                    setTimeout(() => setCopiedSeed(false), 2000);
                  }}
                  className="ml-2 text-[#b1bad3] hover:text-white"
                >
                  {copiedSeed ? <Check className="h-4 w-4 text-[#00e701]" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowFairnessModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#213743] hover:bg-[#2f4553] text-white text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#1a2c38] border border-[#213743] p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-[#1475e1]" />
                <h3 className="font-extrabold text-white text-base">Session Statistics</h3>
              </div>
              <button
                onClick={() => setShowStatsModal(false)}
                className="text-[#b1bad3] hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-[#0f212e] p-3 rounded-xl border border-[#213743]">
                <div className="text-[#b1bad3]">Rounds Played</div>
                <div className="text-white font-mono font-bold text-base mt-1">{stats.rounds}</div>
              </div>
              <div className="bg-[#0f212e] p-3 rounded-xl border border-[#213743]">
                <div className="text-[#b1bad3]">Hands Won</div>
                <div className="text-[#00e701] font-mono font-bold text-base mt-1">{stats.wins}</div>
              </div>
              <div className="bg-[#0f212e] p-3 rounded-xl border border-[#213743]">
                <div className="text-[#b1bad3]">Total Wagered</div>
                <div className="text-white font-mono font-bold text-base mt-1">
                  {activeSym}
                  {stats.wagered.toFixed(2)}
                </div>
              </div>
              <div className="bg-[#0f212e] p-3 rounded-xl border border-[#213743]">
                <div className="text-[#b1bad3]">Net Profit</div>
                <div
                  className={`font-mono font-bold text-base mt-1 ${
                    stats.profit >= 0 ? "text-[#00e701]" : "text-red-400"
                  }`}
                >
                  {stats.profit >= 0 ? "+" : ""}
                  {activeSym}
                  {stats.profit.toFixed(2)}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowStatsModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#213743] hover:bg-[#2f4553] text-white text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
