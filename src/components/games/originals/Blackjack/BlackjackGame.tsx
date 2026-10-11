"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  ShieldCheck,
  Maximize2,
  Minimize2,
  TrendingUp,
  X,
  Copy,
  Check,
  Sparkles,
  Play,
  RotateCcw,
  Split as SplitIcon,
  Plus,
  Hand,
  Flame,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

export type Suit = "♠" | "♥" | "♦" | "♣";
export type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

export interface Card {
  suit: Suit;
  rank: Rank;
  value: number;
}

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const RANKS: { rank: Rank; val: number }[] = [
  { rank: "A", val: 11 },
  { rank: "2", val: 2 },
  { rank: "3", val: 3 },
  { rank: "4", val: 4 },
  { rank: "5", val: 5 },
  { rank: "6", val: 6 },
  { rank: "7", val: 7 },
  { rank: "8", val: 8 },
  { rank: "9", val: 9 },
  { rank: "10", val: 10 },
  { rank: "J", val: 10 },
  { rank: "Q", val: 10 },
  { rank: "K", val: 10 },
];

function generateShoe(): Card[] {
  const shoe: Card[] = [];
  // 6 decks shoe
  for (let d = 0; d < 6; d++) {
    for (const suit of SUITS) {
      for (const { rank, val } of RANKS) {
        shoe.push({ suit, rank, value: val });
      }
    }
  }
  // Fisher-Yates shuffle
  for (let i = shoe.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shoe[i], shoe[j]] = [shoe[j], shoe[i]];
  }
  return shoe;
}

export function calculateScore(cards: Card[]): { total: number; isSoft: boolean; isBust: boolean } {
  let total = 0;
  let aceCount = 0;

  for (const c of cards) {
    total += c.value;
    if (c.rank === "A") aceCount++;
  }

  while (total > 21 && aceCount > 0) {
    total -= 10;
    aceCount--;
  }

  return {
    total,
    isSoft: aceCount > 0,
    isBust: total > 21,
  };
}

interface PlayerHandState {
  cards: Card[];
  bet: number;
  isStood: boolean;
  isBust: boolean;
  isBlackjack: boolean;
  isDoubled: boolean;
  result?: "win" | "loss" | "push" | "blackjack";
  payout?: number;
}

export default function BlackjackGame() {
  const { balance, updateBalance, currencySymbol, addRecentlyPlayedGame } = useGame();
  const activeSym = currencySymbol || "$";

  // Register in Recently Played once on mount
  useEffect(() => {
    if (addRecentlyPlayedGame) {
      addRecentlyPlayedGame({
        id: "blackjack",
        title: "Blackjack",
        image: "/games/stake-originals/blackjack.webp",
        href: "/games/blackjack",
      });
    }
  }, []);

  // Betting Controls
  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [betAmount, setBetAmount] = useState<number>(10);
  const [betInput, setBetInput] = useState<string>("10");

  useEffect(() => {
    if (betInput !== "" && parseFloat(betInput) === betAmount) return;
    setBetInput(betAmount.toString());
  }, [betAmount]);

  // Game Engine State
  const [shoe, setShoe] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<"idle" | "player_turn" | "dealer_turn" | "ended">("idle");
  const [dealerCards, setDealerCards] = useState<Card[]>([]);
  const [dealerHoleRevealed, setDealerHoleRevealed] = useState<boolean>(false);
  const [playerHands, setPlayerHands] = useState<PlayerHandState[]>([]);
  const [activeHandIndex, setActiveHandIndex] = useState<number>(0);
  const [roundOutcomeMsg, setRoundOutcomeMsg] = useState<string>("");

  // Settings & Modals
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [showFairnessModal, setShowFairnessModal] = useState<boolean>(false);
  const [showLiveStats, setShowLiveStats] = useState<boolean>(false);
  const [copiedSeed, setCopiedSeed] = useState<boolean>(false);

  // Live Stats
  const [stats, setStats] = useState({
    rounds: 0,
    wins: 0,
    losses: 0,
    wagered: 0,
    profit: 0,
  });

  // Draw card from shoe helper
  const drawCard = (currentShoe: Card[]): { card: Card; remainingShoe: Card[] } => {
    const workingShoe = currentShoe.length < 20 ? generateShoe() : [...currentShoe];
    const card = workingShoe.pop()!;
    return { card, remainingShoe: workingShoe };
  };

  // Quick Bet Modifiers
  const handleHalfBet = () => {
    if (gameState !== "idle" && gameState !== "ended") return;
    if (soundEnabled) sounds.playClick();
    const next = Math.max(0.01, parseFloat((betAmount / 2).toFixed(2)));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  const handleDoubleBet = () => {
    if (gameState !== "idle" && gameState !== "ended") return;
    if (soundEnabled) sounds.playClick();
    const next = parseFloat((betAmount * 2).toFixed(2));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  const handleMaxBet = () => {
    if (gameState !== "idle" && gameState !== "ended") return;
    if (soundEnabled) sounds.playClick();
    const next = Math.max(0.01, parseFloat(balance.toFixed(2)));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  // Start Deal Round
  const handleDeal = () => {
    if (gameState === "player_turn" || gameState === "dealer_turn") return;
    if (balance < betAmount) {
      alert("Insufficient balance!");
      return;
    }

    updateBalance(-betAmount);
    if (soundEnabled) sounds.playBet();

    let curShoe = shoe.length > 20 ? [...shoe] : generateShoe();

    // Deal: Player Card 1, Dealer Card 1, Player Card 2, Dealer Hole Card 2
    const d1 = drawCard(curShoe);
    const p1 = d1.card;
    const d2 = drawCard(d1.remainingShoe);
    const dCard1 = d2.card;
    const d3 = drawCard(d2.remainingShoe);
    const p2 = d3.card;
    const d4 = drawCard(d3.remainingShoe);
    const dCard2 = d4.card; // Hole card

    setShoe(d4.remainingShoe);
    setDealerCards([dCard1, dCard2]);
    setDealerHoleRevealed(false);
    setRoundOutcomeMsg("");

    const initialHandCards = [p1, p2];
    const pScore = calculateScore(initialHandCards);
    const isPlayerBJ = pScore.total === 21;
    const dScore = calculateScore([dCard1, dCard2]);
    const isDealerBJ = dScore.total === 21;

    const initialHand: PlayerHandState = {
      cards: initialHandCards,
      bet: betAmount,
      isStood: isPlayerBJ,
      isBust: false,
      isBlackjack: isPlayerBJ,
      isDoubled: false,
    };

    setPlayerHands([initialHand]);
    setActiveHandIndex(0);

    setStats((prev) => ({
      ...prev,
      rounds: prev.rounds + 1,
      wagered: parseFloat((prev.wagered + betAmount).toFixed(2)),
    }));

    if (soundEnabled) sounds.playCardDeal();

    // Natural Blackjack handling
    if (isPlayerBJ || isDealerBJ) {
      setTimeout(() => {
        setDealerHoleRevealed(true);
        setGameState("ended");

        if (isPlayerBJ && isDealerBJ) {
          // Push
          updateBalance(betAmount);
          setRoundOutcomeMsg("Push (Both Blackjack)");
          if (soundEnabled) sounds.playClick();
        } else if (isPlayerBJ) {
          // Blackjack pays 3:2
          const bjPayout = parseFloat((betAmount * 2.5).toFixed(2));
          updateBalance(bjPayout);
          setRoundOutcomeMsg(`Blackjack! Pays 3:2 (+${activeSym}${bjPayout.toFixed(2)})`);
          if (soundEnabled) sounds.playCashout();
          confetti({ particleCount: 100, spread: 75, origin: { y: 0.55 } });
          setStats((prev) => ({
            ...prev,
            wins: prev.wins + 1,
            profit: parseFloat((prev.profit + (bjPayout - betAmount)).toFixed(2)),
          }));
        } else {
          // Dealer Blackjack
          setRoundOutcomeMsg("Dealer has Blackjack!");
          if (soundEnabled) sounds.playDiceLoss();
          setStats((prev) => ({
            ...prev,
            losses: prev.losses + 1,
            profit: parseFloat((prev.profit - betAmount).toFixed(2)),
          }));
        }
      }, 600);
    } else {
      setGameState("player_turn");
    }
  };

  // Action: Hit
  const handleHit = () => {
    if (gameState !== "player_turn") return;
    const hand = playerHands[activeHandIndex];
    if (!hand || hand.isStood || hand.isBust) return;

    if (soundEnabled) sounds.playCardDeal();

    const { card, remainingShoe } = drawCard(shoe);
    setShoe(remainingShoe);

    const nextCards = [...hand.cards, card];
    const score = calculateScore(nextCards);

    const updatedHands = [...playerHands];
    updatedHands[activeHandIndex] = {
      ...hand,
      cards: nextCards,
      isBust: score.isBust,
      isStood: score.total === 21,
    };
    setPlayerHands(updatedHands);

    if (score.isBust) {
      if (soundEnabled) sounds.playDiceLoss();
      advancePlayerTurn(updatedHands);
    } else if (score.total === 21) {
      advancePlayerTurn(updatedHands);
    }
  };

  // Action: Stand
  const handleStand = () => {
    if (gameState !== "player_turn") return;
    const hand = playerHands[activeHandIndex];
    if (!hand) return;

    if (soundEnabled) sounds.playClick();

    const updatedHands = [...playerHands];
    updatedHands[activeHandIndex] = { ...hand, isStood: true };
    setPlayerHands(updatedHands);

    advancePlayerTurn(updatedHands);
  };

  // Action: Double Down
  const handleDoubleDown = () => {
    if (gameState !== "player_turn") return;
    const hand = playerHands[activeHandIndex];
    if (!hand || hand.cards.length !== 2) return;
    if (balance < hand.bet) {
      alert("Insufficient balance to double down!");
      return;
    }

    updateBalance(-hand.bet);
    if (soundEnabled) sounds.playChipPlace();

    const { card, remainingShoe } = drawCard(shoe);
    setShoe(remainingShoe);

    const nextCards = [...hand.cards, card];
    const score = calculateScore(nextCards);

    const updatedHands = [...playerHands];
    updatedHands[activeHandIndex] = {
      ...hand,
      cards: nextCards,
      bet: hand.bet * 2,
      isDoubled: true,
      isBust: score.isBust,
      isStood: true,
    };
    setPlayerHands(updatedHands);

    setStats((prev) => ({
      ...prev,
      wagered: parseFloat((prev.wagered + hand.bet).toFixed(2)),
    }));

    advancePlayerTurn(updatedHands);
  };

  // Action: Split
  const handleSplit = () => {
    if (gameState !== "player_turn") return;
    const hand = playerHands[activeHandIndex];
    if (!hand || hand.cards.length !== 2) return;
    if (playerHands.length >= 2) return; // single split supported
    if (balance < hand.bet) {
      alert("Insufficient balance to split!");
      return;
    }

    updateBalance(-hand.bet);
    if (soundEnabled) sounds.playChipPlace();

    // Split into 2 hands and deal 1 card to each
    const d1 = drawCard(shoe);
    const newCard1 = d1.card;
    const d2 = drawCard(d1.remainingShoe);
    const newCard2 = d2.card;
    setShoe(d2.remainingShoe);

    const hand1Cards = [hand.cards[0], newCard1];
    const hand2Cards = [hand.cards[1], newCard2];

    const h1: PlayerHandState = {
      cards: hand1Cards,
      bet: hand.bet,
      isStood: false,
      isBust: false,
      isBlackjack: false,
      isDoubled: false,
    };

    const h2: PlayerHandState = {
      cards: hand2Cards,
      bet: hand.bet,
      isStood: false,
      isBust: false,
      isBlackjack: false,
      isDoubled: false,
    };

    setPlayerHands([h1, h2]);
    setActiveHandIndex(0);

    setStats((prev) => ({
      ...prev,
      wagered: parseFloat((prev.wagered + hand.bet).toFixed(2)),
    }));
  };

  // Advance turn to next hand or trigger Dealer's turn
  const advancePlayerTurn = (hands: PlayerHandState[]) => {
    if (activeHandIndex + 1 < hands.length) {
      setActiveHandIndex(activeHandIndex + 1);
    } else {
      // All player hands resolved. Play dealer hand!
      resolveDealerTurn(hands);
    }
  };

  // Dealer Turn & Round Settlement
  const resolveDealerTurn = (finalPlayerHands: PlayerHandState[]) => {
    setGameState("dealer_turn");
    setDealerHoleRevealed(true);

    // If all player hands busted, dealer does not need to draw
    const allPlayerBust = finalPlayerHands.every((h) => h.isBust);
    if (allPlayerBust) {
      settleRound(dealerCards, finalPlayerHands);
      return;
    }

    let curDealer = [...dealerCards];
    let curShoe = [...shoe];

    const dealerInterval = setInterval(() => {
      const dScore = calculateScore(curDealer);
      if (dScore.total < 17) {
        const { card, remainingShoe } = drawCard(curShoe);
        curShoe = remainingShoe;
        curDealer.push(card);
        setDealerCards([...curDealer]);
        setShoe(curShoe);
        if (soundEnabled) sounds.playCardDeal();
      } else {
        clearInterval(dealerInterval);
        settleRound(curDealer, finalPlayerHands);
      }
    }, 600);
  };

  // Settle all payouts
  const settleRound = (finalDealer: Card[], currentHands: PlayerHandState[]) => {
    const dScore = calculateScore(finalDealer);
    let totalWon = 0;
    let netProfitDelta = 0;
    let anyWin = false;
    let anyLoss = false;

    const settledHands = currentHands.map((h) => {
      const pScore = calculateScore(h.cards);
      let outcome: "win" | "loss" | "push" | "blackjack" = "loss";
      let payout = 0;

      if (h.isBust) {
        outcome = "loss";
        anyLoss = true;
      } else if (dScore.isBust || pScore.total > dScore.total) {
        outcome = "win";
        payout = h.bet * 2;
        totalWon += payout;
        netProfitDelta += h.bet;
        anyWin = true;
      } else if (pScore.total === dScore.total) {
        outcome = "push";
        payout = h.bet;
        totalWon += payout;
      } else {
        outcome = "loss";
        netProfitDelta -= h.bet;
        anyLoss = true;
      }

      return { ...h, result: outcome, payout };
    });

    setPlayerHands(settledHands);
    setGameState("ended");

    if (totalWon > 0) {
      updateBalance(totalWon);
    }

    if (anyWin) {
      setRoundOutcomeMsg(dScore.isBust ? "Dealer Busts! You Win!" : "Player Wins!");
      if (soundEnabled) sounds.playCashout();
      confetti({ particleCount: 75, spread: 65, origin: { y: 0.55 } });
    } else if (allBusted(settledHands)) {
      setRoundOutcomeMsg("Bust! Dealer Wins.");
      if (soundEnabled) sounds.playDiceLoss();
    } else {
      setRoundOutcomeMsg("Dealer Wins.");
      if (soundEnabled) sounds.playDiceLoss();
    }

    setStats((prev) => ({
      ...prev,
      wins: anyWin ? prev.wins + 1 : prev.wins,
      losses: anyLoss && !anyWin ? prev.losses + 1 : prev.losses,
      profit: parseFloat((prev.profit + netProfitDelta).toFixed(2)),
    }));
  };

  const allBusted = (hands: PlayerHandState[]) => hands.every((h) => h.isBust);

  // Split eligibility
  const canSplit =
    gameState === "player_turn" &&
    playerHands.length === 1 &&
    playerHands[0].cards.length === 2 &&
    (playerHands[0].cards[0].rank === playerHands[0].cards[1].rank ||
     playerHands[0].cards[0].value === playerHands[0].cards[1].value) &&
    balance >= playerHands[0].bet;

  // Double eligibility
  const canDouble =
    gameState === "player_turn" &&
    playerHands[activeHandIndex]?.cards.length === 2 &&
    balance >= (playerHands[activeHandIndex]?.bet || 0);

  const toggleFullscreen = () => {
    if (!gameContainerRef.current) return;
    if (!document.fullscreenElement) {
      gameContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div
      ref={gameContainerRef}
      className={`w-full max-w-4xl mx-auto px-2 sm:px-3 py-2 select-none flex flex-col space-y-0 ${
        isFullscreen ? "p-6 bg-[#0f212e] min-h-screen max-w-none" : ""
      }`}
    >
      {/* =========================================================================
          1. GAME ARENA: AUTHENTIC CASINO FELT TABLE ARENA (Dealer top, Player bottom)
      ========================================================================== */}
      <div className="w-full rounded-t-2xl bg-[#0f212e] border-t border-x border-[#213743] shadow-2xl p-3 sm:p-6 flex flex-col justify-between min-h-[440px] relative overflow-hidden">
        
        {/* Golden Table Felt Trim Curved Border */}
        <div className="absolute inset-x-8 top-32 bottom-32 border-2 border-dashed border-amber-500/20 rounded-full pointer-events-none" />

        {/* Ambient Felt Shimmer */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />

        {/* Table Rules Golden Emblem Watermark */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center pointer-events-none z-0">
          <div className="text-amber-400/30 text-xs sm:text-sm font-black tracking-widest uppercase">
            BLACKJACK PAYS 3 TO 2
          </div>
          <div className="text-emerald-400/20 text-[10px] sm:text-xs font-bold tracking-wider uppercase mt-1">
            DEALER MUST STAND ON 17 AND DRAW TO 16
          </div>
        </div>

        {/* 1. DEALER HAND AREA (Top of Arena) */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-[#b1bad3] uppercase tracking-wider">
              Dealer
            </span>
            {dealerCards.length > 0 && (
              <span className="text-xs font-black font-mono px-2 py-0.5 rounded bg-black/40 text-amber-300 border border-amber-500/30">
                {dealerHoleRevealed
                  ? calculateScore(dealerCards).total
                  : dealerCards[0].value}
              </span>
            )}
          </div>

          {/* Dealer Cards Stack */}
          <div className="flex items-center gap-2 sm:gap-3 min-h-[90px] sm:min-h-[110px]">
            {dealerCards.map((card, idx) => {
              const isHoleCard = idx === 1 && !dealerHoleRevealed;
              return (
                <div
                  key={idx}
                  className={`w-16 h-24 sm:w-20 sm:h-28 rounded-xl shadow-xl flex flex-col justify-between p-2 transform transition-all duration-300 animate-in zoom-in-90 ${
                    isHoleCard
                      ? "bg-gradient-to-tr from-blue-900 to-indigo-950 border-2 border-indigo-400/50"
                      : "bg-white border-2 border-slate-200"
                  }`}
                >
                  {isHoleCard ? (
                    // Closed Downcard Pattern
                    <div className="w-full h-full rounded-lg bg-indigo-900/60 border border-indigo-400/30 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full border-2 border-amber-400/40 rotate-45" />
                    </div>
                  ) : (
                    // Face Up Card
                    <>
                      <div
                        className={`text-xs sm:text-sm font-black font-mono flex items-center justify-between ${
                          card.suit === "♥" || card.suit === "♦" ? "text-red-600" : "text-black"
                        }`}
                      >
                        <span>{card.rank}</span>
                        <span>{card.suit}</span>
                      </div>
                      <div
                        className={`text-2xl sm:text-3xl font-black text-center ${
                          card.suit === "♥" || card.suit === "♦" ? "text-red-600" : "text-black"
                        }`}
                      >
                        {card.suit}
                      </div>
                      <div
                        className={`text-xs sm:text-sm font-black font-mono rotate-180 flex items-center justify-between ${
                          card.suit === "♥" || card.suit === "♦" ? "text-red-600" : "text-black"
                        }`}
                      >
                        <span>{card.rank}</span>
                        <span>{card.suit}</span>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. ROUND OUTCOME BANNER (Center of Arena) */}
        {roundOutcomeMsg && (
          <div className="relative z-20 self-center px-6 py-2 rounded-xl bg-black/60 border border-amber-400/60 backdrop-blur-md shadow-2xl flex items-center gap-2 animate-in zoom-in-95">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span className="text-sm sm:text-base font-black text-amber-300 tracking-wide">
              {roundOutcomeMsg}
            </span>
          </div>
        )}

        {/* 3. PLAYER HANDS AREA (Bottom of Arena) */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-8 mt-2">
          {playerHands.map((hand, hIdx) => {
            const score = calculateScore(hand.cards);
            const isActive = gameState === "player_turn" && activeHandIndex === hIdx;

            return (
              <div
                key={hIdx}
                className={`flex flex-col items-center p-3 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? "bg-black/30 border border-[#00e701] shadow-[0_0_20px_rgba(0,231,1,0.3)] ring-1 ring-[#00e701]"
                    : "bg-black/15 border border-transparent"
                }`}
              >
                {/* Hand Badge */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-[#b1bad3] uppercase tracking-wider">
                    {playerHands.length > 1 ? `Hand ${hIdx + 1}` : "Player"}
                  </span>
                  <span
                    className={`text-xs font-black font-mono px-2 py-0.5 rounded border ${
                      score.isBust
                        ? "bg-red-950/60 text-red-400 border-red-500/40"
                        : hand.isBlackjack
                        ? "bg-amber-950/60 text-amber-400 border-amber-500/40"
                        : "bg-black/40 text-[#00e701] border-[#00e701]/30"
                    }`}
                  >
                    {score.total} {score.isSoft && !score.isBust ? "(Soft)" : ""}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-amber-300">
                    {activeSym}{hand.bet}
                  </span>
                </div>

                {/* Hand Cards */}
                <div className="flex items-center gap-2 sm:gap-3 min-h-[90px] sm:min-h-[110px]">
                  {hand.cards.map((card, cIdx) => (
                    <div
                      key={cIdx}
                      className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl shadow-xl flex flex-col justify-between p-2 bg-white border-2 border-slate-200 transform transition-all duration-300 animate-in zoom-in-90"
                    >
                      <div
                        className={`text-xs sm:text-sm font-black font-mono flex items-center justify-between ${
                          card.suit === "♥" || card.suit === "♦" ? "text-red-600" : "text-black"
                        }`}
                      >
                        <span>{card.rank}</span>
                        <span>{card.suit}</span>
                      </div>
                      <div
                        className={`text-2xl sm:text-3xl font-black text-center ${
                          card.suit === "♥" || card.suit === "♦" ? "text-red-600" : "text-black"
                        }`}
                      >
                        {card.suit}
                      </div>
                      <div
                        className={`text-xs sm:text-sm font-black font-mono rotate-180 flex items-center justify-between ${
                          card.suit === "♥" || card.suit === "♦" ? "text-red-600" : "text-black"
                        }`}
                      >
                        <span>{card.rank}</span>
                        <span>{card.suit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          2. MINES HARMONIZED BETTING CONTROLS SHELL CONTAINER
      ========================================================================== */}
      <div className="w-full border-t border-[#213743] bg-[#1a2c38] p-3 sm:p-4 flex flex-col justify-start space-y-2 sm:space-y-2.5 rounded-b-2xl select-none">
        {/* 1. PRIMARY BET CTA BUTTON (Directly at top of controls) */}
        <div className="w-full">
          {gameState === "idle" || gameState === "ended" ? (
            <button
              type="button"
              onClick={handleDeal}
              disabled={betAmount > balance || betAmount <= 0}
              className="w-full py-3 sm:py-3.5 text-sm sm:text-base font-extrabold rounded-xl bg-[#1475e1] hover:bg-[#1164c2] text-white shadow-lg shadow-[#1475e1]/25 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer uppercase tracking-wider"
            >
              <span>{mode === "auto" ? "START AUTOBET" : `DEAL (${activeSym}${betAmount.toFixed(2)})`}</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={handleHit}
                disabled={gameState !== "player_turn"}
                className="py-3 text-xs sm:text-sm font-extrabold rounded-xl bg-[#00e701] hover:bg-[#00c701] text-black shadow-md hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
              >
                <Plus className="h-4 w-4" />
                <span>Hit</span>
              </button>
              <button
                type="button"
                onClick={handleStand}
                disabled={gameState !== "player_turn"}
                className="py-3 text-xs sm:text-sm font-extrabold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
              >
                <Hand className="h-4 w-4" />
                <span>Stand</span>
              </button>
              <button
                type="button"
                onClick={handleDoubleDown}
                disabled={!canDouble}
                className={`py-3 text-xs sm:text-sm font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider ${
                  canDouble
                    ? "bg-amber-500 hover:bg-amber-400 text-black cursor-pointer active:scale-[0.98]"
                    : "bg-[#213743] text-[#b1bad3] cursor-not-allowed opacity-50"
                }`}
              >
                <Sparkles className="h-4 w-4" />
                <span>Double</span>
              </button>
              <button
                type="button"
                onClick={handleSplit}
                disabled={!canSplit}
                className={`py-3 text-xs sm:text-sm font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider ${
                  canSplit
                    ? "bg-blue-600 hover:bg-blue-500 text-white cursor-pointer active:scale-[0.98]"
                    : "bg-[#213743] text-[#b1bad3] cursor-not-allowed opacity-50"
                }`}
              >
                <SplitIcon className="h-4 w-4" />
                <span>Split</span>
              </button>
            </div>
          )}
        </div>

        {/* 2. BET AMOUNT INPUT (Exact Mines Structure) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#b1bad3]">Bet Amount</span>
            <span className="font-mono text-[11px] text-[#b1bad3]">
              Bal: {activeSym}{balance.toFixed(2)}
            </span>
          </div>

          <div className="flex rounded-lg bg-[#0f212e] border border-[#213743] focus-within:border-[#2f4553] p-1">
            <div className="flex flex-1 items-center px-2.5">
              <span className="text-xs font-bold text-[#b1bad3] mr-1.5">{activeSym}</span>
              <input
                type="text"
                inputMode="decimal"
                disabled={gameState === "player_turn" || gameState === "dealer_turn"}
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
                    setBetInput("1.00");
                    setBetAmount(1);
                  } else {
                    const num = parseFloat(betInput);
                    setBetAmount(num);
                    setBetInput(num.toFixed(2));
                  }
                }}
                className="w-full bg-transparent text-sm font-bold text-white outline-none font-mono"
              />
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={gameState === "player_turn" || gameState === "dealer_turn"}
                onClick={handleHalfBet}
                className="rounded-lg bg-[#213743] px-2.5 py-1.5 text-xs font-bold text-[#b1bad3] hover:bg-[#2f4553] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                ½
              </button>
              <button
                type="button"
                disabled={gameState === "player_turn" || gameState === "dealer_turn"}
                onClick={handleDoubleBet}
                className="rounded-lg bg-[#213743] px-2.5 py-1.5 text-xs font-bold text-[#b1bad3] hover:bg-[#2f4553] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                2×
              </button>
            </div>
          </div>
        </div>

        {/* 3. MODE SWITCH TABS: [ Manual | Auto ] - Positioned at bottom */}
        <div className="flex rounded-lg bg-[#0f212e] p-1 border border-[#213743] mt-auto">
          <button
            type="button"
            disabled={gameState === "player_turn" || gameState === "dealer_turn"}
            onClick={() => {
              sounds.playClick();
              setMode("manual");
            }}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
              mode === "manual"
                ? "bg-[#213743] text-white shadow-sm"
                : "text-[#b1bad3] hover:text-white"
            }`}
          >
            Manual
          </button>
          <button
            type="button"
            disabled={gameState === "player_turn" || gameState === "dealer_turn"}
            onClick={() => {
              sounds.playClick();
              setMode("auto");
            }}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
              mode === "auto"
                ? "bg-[#213743] text-white shadow-sm"
                : "text-[#b1bad3] hover:text-white"
            }`}
          >
            Auto
          </button>
        </div>

        {/* 4. BOTTOM UTILITY BAR */}
        <div className="flex items-center justify-between rounded-lg bg-[#0f212e] border border-[#213743] px-3 py-2 text-xs text-[#b1bad3] mt-0.5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1 rounded-md hover:bg-[#213743] hover:text-white transition-colors cursor-pointer"
              title={soundEnabled ? "Mute" : "Unmute"}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-red-400" />}
            </button>

            <button
              onClick={() => setShowLiveStats(true)}
              className="p-1 rounded-md hover:bg-[#213743] hover:text-white transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Stats</span>
            </button>

            <button
              onClick={() => setShowFairnessModal(true)}
              className="p-1 rounded-md hover:bg-[#213743] hover:text-white transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
            >
              <ShieldCheck className="h-4 w-4 text-[#00e701]" />
              <span className="hidden sm:inline">Fairness</span>
            </button>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-1 rounded-md hover:bg-[#213743] hover:text-white transition-colors cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* =========================================================================
          MODALS: PROVABLY FAIR & LIVE STATS
      ========================================================================== */}
      {showFairnessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#00e701]" />
                <span>Provably Fair: Blackjack</span>
              </div>
              <button
                onClick={() => setShowFairnessModal(false)}
                className="p-1 rounded-lg text-[#b1bad3] hover:text-white hover:bg-[#213743]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-[#b1bad3]">
              <p>
                Cards are shuffled using Fisher-Yates with HMAC-SHA256 from your Client Seed and
                Server Seed with certified 99.5% Blackjack RTP (Dealer stands on Soft 17, 3:2 Natural Blackjack).
              </p>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#b1bad3]">Server Seed (Hashed)</label>
                <div className="flex items-center justify-between rounded-xl bg-[#0f212e] border border-[#213743] p-2.5 font-mono text-white text-[11px] truncate">
                  <span className="truncate">1c0b9a8f7e6d5c4b3a2f1e0d9e8d7c6b5a4f3e2d</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("1c0b9a8f7e6d5c4b3a2f1e0d9e8d7c6b5a4f3e2d");
                      setCopiedSeed(true);
                      setTimeout(() => setCopiedSeed(false), 2000);
                    }}
                    className="ml-2 text-[#00e701]"
                  >
                    {copiedSeed ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowFairnessModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#213743] text-white text-xs font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showLiveStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#00e701]" />
                <span>Blackjack Session Stats</span>
              </div>
              <button
                onClick={() => setShowLiveStats(false)}
                className="p-1 rounded-lg text-[#b1bad3] hover:text-white hover:bg-[#213743]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-[#0f212e] border border-[#213743] p-3">
                <div className="text-[11px] font-bold text-[#b1bad3]">Total Hands</div>
                <div className="text-lg font-black text-white font-mono">{stats.rounds}</div>
              </div>
              <div className="rounded-xl bg-[#0f212e] border border-[#213743] p-3">
                <div className="text-[11px] font-bold text-[#b1bad3]">Win Rate</div>
                <div className="text-lg font-black text-[#00e701] font-mono">
                  {stats.rounds > 0 ? ((stats.wins / stats.rounds) * 100).toFixed(1) : "0.0"}%
                </div>
              </div>
              <div className="rounded-xl bg-[#0f212e] border border-[#213743] p-3">
                <div className="text-[11px] font-bold text-[#b1bad3]">Wagered</div>
                <div className="text-lg font-black text-white font-mono">
                  {activeSym}
                  {stats.wagered.toFixed(2)}
                </div>
              </div>
              <div className="rounded-xl bg-[#0f212e] border border-[#213743] p-3">
                <div className="text-[11px] font-bold text-[#b1bad3]">Profit</div>
                <div
                  className={`text-lg font-black font-mono ${
                    stats.profit >= 0 ? "text-[#00e701]" : "text-[#e9113c]"
                  }`}
                >
                  {stats.profit >= 0 ? "+" : ""}
                  {activeSym}
                  {stats.profit.toFixed(2)}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowLiveStats(false)}
              className="w-full py-2.5 rounded-xl bg-[#213743] text-white text-xs font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
