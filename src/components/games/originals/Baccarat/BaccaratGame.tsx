"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ShieldCheck,
  Maximize2,
  Minimize2,
  TrendingUp,
  X,
  Info,
  Check,
  Copy,
  Volume2,
  VolumeX,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

export type Suit = "spades" | "hearts" | "diamonds" | "clubs";
export type BetTarget = "player" | "banker" | "tie";

export interface BaccaratCard {
  rank: number; // 1 to 13 (1=A, 11=J, 12=Q, 13=K)
  suit: Suit;
  label: string;
  value: number; // 0 to 9 in baccarat
  isRed: boolean;
}

const SUITS: { suit: Suit; symbol: string; isRed: boolean }[] = [
  { suit: "spades", symbol: "♠", isRed: false },
  { suit: "hearts", symbol: "♥", isRed: true },
  { suit: "diamonds", symbol: "♦", isRed: true },
  { suit: "clubs", symbol: "♣", isRed: false },
];

const RANK_LABELS: Record<number, string> = {
  1: "A",
  2: "2",
  3: "3",
  4: "4",
  5: "5",
  6: "6",
  7: "7",
  8: "8",
  9: "9",
  10: "10",
  11: "J",
  12: "Q",
  13: "K",
};

function generateCard(): BaccaratCard {
  const rank = Math.floor(Math.random() * 13) + 1;
  const suitObj = SUITS[Math.floor(Math.random() * SUITS.length)];
  const value = rank >= 10 ? 0 : rank; // 10, J, Q, K = 0; A = 1
  return {
    rank,
    suit: suitObj.suit,
    label: RANK_LABELS[rank],
    value,
    isRed: suitObj.isRed,
  };
}

function calculateHandScore(cards: BaccaratCard[]): number {
  const sum = cards.reduce((acc, c) => acc + c.value, 0);
  return sum % 10;
}

const CHIP_VALUES = [0.1, 1, 5, 25, 100];

export default function BaccaratGame() {
  const {
    balance,
    updateBalance,
    currencySymbol,
    addRecentlyPlayedGame,
  } = useGame();
  const activeSym = currencySymbol || "$";

  // Register in Recently Played
  useEffect(() => {
    if (addRecentlyPlayedGame) {
      addRecentlyPlayedGame({
        id: "baccarat",
        title: "Baccarat",
        image: "/games/stake-originals/baccarat.webp",
        href: "/games/baccarat",
      });
    }
  }, [addRecentlyPlayedGame]);

  // Bets State
  const [selectedChip, setSelectedChip] = useState<number>(1);
  const [bets, setBets] = useState<{ player: number; banker: number; tie: number }>({
    player: 0,
    banker: 0,
    tie: 0,
  });

  // Table Hand State
  const [playerCards, setPlayerCards] = useState<BaccaratCard[]>([]);
  const [bankerCards, setBankerCards] = useState<BaccaratCard[]>([]);
  const [isDealing, setIsDealing] = useState<boolean>(false);
  const [roundResult, setRoundResult] = useState<"player" | "banker" | "tie" | null>(null);
  const [isNatural, setIsNatural] = useState<boolean>(false);
  const [payoutMessage, setPayoutMessage] = useState<string>("");
  const [lastWinAmount, setLastWinAmount] = useState<number | null>(null);

  // Settings & Modals
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showFairnessModal, setShowFairnessModal] = useState<boolean>(false);
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [copiedSeed, setCopiedSeed] = useState<boolean>(false);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // Statistics
  const [stats, setStats] = useState({
    rounds: 0,
    wins: 0,
    losses: 0,
    wagered: 0,
    profit: 0,
  });

  const totalBet = parseFloat((bets.player + bets.banker + bets.tie).toFixed(2));
  const playerScore = calculateHandScore(playerCards);
  const bankerScore = calculateHandScore(bankerCards);

  // Place Chip on Bet Target
  const handlePlaceChip = (target: BetTarget) => {
    if (isDealing) return;
    if (totalBet + selectedChip > balance) {
      alert("Insufficient balance for this bet!");
      return;
    }
    sounds.playChipPlace();
    setBets((prev) => ({
      ...prev,
      [target]: parseFloat((prev[target] + selectedChip).toFixed(2)),
    }));
  };

  // Clear Bets
  const handleClearBets = () => {
    if (isDealing) return;
    sounds.playClick();
    setBets({ player: 0, banker: 0, tie: 0 });
  };

  // Double Bets
  const handleDoubleBets = () => {
    if (isDealing) return;
    if (totalBet * 2 > balance) {
      alert("Insufficient balance to double bets!");
      return;
    }
    sounds.playClick();
    setBets((prev) => ({
      player: parseFloat((prev.player * 2).toFixed(2)),
      banker: parseFloat((prev.banker * 2).toFixed(2)),
      tie: parseFloat((prev.tie * 2).toFixed(2)),
    }));
  };

  // Deal Hand with Authentic Tableau Rules
  const handleDeal = () => {
    if (isDealing) return;
    if (totalBet <= 0) {
      alert("Please place a bet on Player, Banker, or Tie!");
      return;
    }
    if (totalBet > balance) {
      alert("Insufficient balance!");
      return;
    }

    // Deduct wager
    updateBalance(-totalBet);
    setIsDealing(true);
    setPlayerCards([]);
    setBankerCards([]);
    setRoundResult(null);
    setIsNatural(false);
    setPayoutMessage("");
    setLastWinAmount(null);

    setStats((prev) => ({
      ...prev,
      rounds: prev.rounds + 1,
      wagered: parseFloat((prev.wagered + totalBet).toFixed(2)),
    }));

    // Deal first 2 cards to Player and Banker
    const p1 = generateCard();
    const b1 = generateCard();
    const p2 = generateCard();
    const b2 = generateCard();

    setTimeout(() => {
      sounds.playCardDeal();
      setPlayerCards([p1]);
    }, 200);

    setTimeout(() => {
      sounds.playCardDeal();
      setBankerCards([b1]);
    }, 450);

    setTimeout(() => {
      sounds.playCardDeal();
      setPlayerCards([p1, p2]);
    }, 700);

    setTimeout(() => {
      sounds.playCardDeal();
      setBankerCards([b1, b2]);

      const initialPlayerScore = (p1.value + p2.value) % 10;
      const initialBankerScore = (b1.value + b2.value) % 10;

      // Natural 8 or 9 detection
      if (
        initialPlayerScore >= 8 ||
        initialBankerScore >= 8
      ) {
        setIsNatural(true);
        finishHand([p1, p2], [b1, b2]);
      } else {
        // Tableau rules for third card
        let pHand = [p1, p2];
        let bHand = [b1, b2];
        let pThird: BaccaratCard | null = null;

        // Player Rule: Draw on 0-5, Stand on 6-7
        if (initialPlayerScore <= 5) {
          pThird = generateCard();
          pHand.push(pThird);
        }

        // Banker Rule:
        if (pThird === null) {
          // If Player stood, Banker draws on 0-5, stands on 6-7
          if (initialBankerScore <= 5) {
            bHand.push(generateCard());
          }
        } else {
          // Banker draws based on Banker Tableau & Player 3rd card
          const thirdVal = pThird.value;
          let bankerDraws = false;
          if (initialBankerScore <= 2) {
            bankerDraws = true;
          } else if (initialBankerScore === 3 && thirdVal !== 8) {
            bankerDraws = true;
          } else if (initialBankerScore === 4 && [2, 3, 4, 5, 6, 7].includes(thirdVal)) {
            bankerDraws = true;
          } else if (initialBankerScore === 5 && [4, 5, 6, 7].includes(thirdVal)) {
            bankerDraws = true;
          } else if (initialBankerScore === 6 && [6, 7].includes(thirdVal)) {
            bankerDraws = true;
          }

          if (bankerDraws) {
            bHand.push(generateCard());
          }
        }

        // Deal 3rd cards with staggered timing if drawn
        if (pHand.length > 2) {
          setTimeout(() => {
            sounds.playCardDeal();
            setPlayerCards([...pHand]);
          }, 400);
        }

        if (bHand.length > 2) {
          setTimeout(() => {
            sounds.playCardDeal();
            setBankerCards([...bHand]);
          }, pHand.length > 2 ? 800 : 400);
        }

        const totalDelay = (pHand.length > 2 ? 500 : 0) + (bHand.length > 2 ? 500 : 0) + 500;
        setTimeout(() => {
          finishHand(pHand, bHand);
        }, totalDelay);
      }
    }, 950);
  };

  // Evaluate Hand Winner and Payouts
  const finishHand = (pHand: BaccaratCard[], bHand: BaccaratCard[]) => {
    const finalPlayerScore = calculateHandScore(pHand);
    const finalBankerScore = calculateHandScore(bHand);

    let winner: "player" | "banker" | "tie";
    if (finalPlayerScore > finalBankerScore) {
      winner = "player";
    } else if (finalBankerScore > finalPlayerScore) {
      winner = "banker";
    } else {
      winner = "tie";
    }

    setRoundResult(winner);
    sounds.playBaccaratScore();

    // Payout Calculation:
    // Player win: 1:1 (returns bet * 2)
    // Banker win: 0.95:1 (returns bet + bet * 0.95)
    // Tie win: 8:1 (returns bet + bet * 8)
    let totalReturn = 0;

    if (winner === "player") {
      if (bets.player > 0) totalReturn += bets.player * 2;
    } else if (winner === "banker") {
      if (bets.banker > 0) totalReturn += bets.banker + bets.banker * 0.95;
    } else if (winner === "tie") {
      if (bets.tie > 0) totalReturn += bets.tie + bets.tie * 8;
      // In tie, Player and Banker bets push (returned)
      totalReturn += bets.player + bets.banker;
    }

    totalReturn = parseFloat(totalReturn.toFixed(2));

    if (totalReturn > 0) {
      updateBalance(totalReturn);
      sounds.playBaccaratWin();
      setLastWinAmount(totalReturn);
      setPayoutMessage(`Won ${activeSym}${totalReturn.toFixed(2)}!`);
      try {
        confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
      } catch {}

      const netProfit = parseFloat((totalReturn - totalBet).toFixed(2));
      setStats((prev) => ({
        ...prev,
        wins: prev.wins + 1,
        profit: parseFloat((prev.profit + netProfit).toFixed(2)),
      }));
    } else {
      setPayoutMessage(`${winner.toUpperCase()} Wins!`);
      setStats((prev) => ({
        ...prev,
        losses: prev.losses + 1,
        profit: parseFloat((prev.profit - totalBet).toFixed(2)),
      }));
    }

    setIsDealing(false);
  };

  // Toggle fullscreen
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
      className="flex flex-col items-center w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 select-none"
    >
      {/* ========================================================= */}
      {/* 1. TOP INTERACTIVE ARENA: CASINO FELT TABLE               */}
      {/* ========================================================= */}
      <div className="w-full rounded-2xl bg-[#09151e] border border-[#213743] shadow-2xl p-4 sm:p-6 flex flex-col items-center relative overflow-hidden">
        {/* Felt Texture Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0e251a]/60 via-[#0a1c13]/40 to-[#09151e] pointer-events-none" />

        {/* Top Header Utilities */}
        <div className="w-full flex items-center justify-between mb-4 z-10 text-xs text-[#b1bad3]">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-[11px] text-[#8596a5]">
              Baccarat Felt Table
            </span>
            {isNatural && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-[10px] uppercase">
                Natural!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRulesModal(true)}
              className="p-1.5 rounded-lg bg-[#1a2c38] hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors"
              title="Game Rules"
            >
              <Info className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowStatsModal(true)}
              className="p-1.5 rounded-lg bg-[#1a2c38] hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors"
              title="Live Stats"
            >
              <TrendingUp className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowFairnessModal(true)}
              className="p-1.5 rounded-lg bg-[#1a2c38] hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors"
              title="Provably Fair"
            >
              <ShieldCheck className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                sounds.enabled = next;
              }}
              className="p-1.5 rounded-lg bg-[#1a2c38] hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors"
              title={soundEnabled ? "Mute" : "Unmute"}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg bg-[#1a2c38] hover:bg-[#213743] text-[#b1bad3] hover:text-white transition-colors"
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Felt Playing Area: Player vs Banker Boxes */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 my-2 z-10">
          {/* PLAYER BOX */}
          <div
            className={`rounded-2xl border p-4 flex flex-col items-center justify-between min-h-[170px] transition-all ${
              roundResult === "player"
                ? "bg-blue-950/40 border-blue-400 shadow-xl shadow-blue-500/20"
                : "bg-[#11232e]/80 border-[#213743]"
            }`}
          >
            <div className="w-full flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-blue-400">
                PLAYER (1:1)
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 font-mono font-black text-xs">
                Score: {playerCards.length > 0 ? playerScore : "-"}
              </span>
            </div>

            {/* Player Cards */}
            <div className="flex items-center justify-center gap-2 my-3 min-h-[72px]">
              {playerCards.map((card, idx) => (
                <div
                  key={idx}
                  className="w-12 h-18 sm:w-14 sm:h-20 rounded-xl bg-white border-2 border-slate-300 shadow-lg flex flex-col items-center justify-between p-1.5 animate-in fade-in zoom-in-95 duration-200"
                >
                  <span
                    className={`text-xs sm:text-sm font-black self-start leading-none ${
                      card.isRed ? "text-red-600" : "text-slate-900"
                    }`}
                  >
                    {card.label}
                  </span>
                  <span
                    className={`text-base sm:text-lg leading-none ${
                      card.isRed ? "text-red-600" : "text-slate-900"
                    }`}
                  >
                    {card.suit === "hearts"
                      ? "♥"
                      : card.suit === "diamonds"
                      ? "♦"
                      : card.suit === "spades"
                      ? "♠"
                      : "♣"}
                  </span>
                  <span
                    className={`text-[9px] font-bold self-end leading-none text-slate-400`}
                  >
                    {card.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Bet Placed Indicator */}
            <div className="text-[11px] font-bold text-[#8596a5]">
              Bet: <span className="text-white font-mono">{activeSym}{bets.player.toFixed(2)}</span>
            </div>
          </div>

          {/* BANKER BOX */}
          <div
            className={`rounded-2xl border p-4 flex flex-col items-center justify-between min-h-[170px] transition-all ${
              roundResult === "banker"
                ? "bg-amber-950/40 border-amber-400 shadow-xl shadow-amber-500/20"
                : "bg-[#11232e]/80 border-[#213743]"
            }`}
          >
            <div className="w-full flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                BANKER (0.95:1)
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-mono font-black text-xs">
                Score: {bankerCards.length > 0 ? bankerScore : "-"}
              </span>
            </div>

            {/* Banker Cards */}
            <div className="flex items-center justify-center gap-2 my-3 min-h-[72px]">
              {bankerCards.map((card, idx) => (
                <div
                  key={idx}
                  className="w-12 h-18 sm:w-14 sm:h-20 rounded-xl bg-white border-2 border-slate-300 shadow-lg flex flex-col items-center justify-between p-1.5 animate-in fade-in zoom-in-95 duration-200"
                >
                  <span
                    className={`text-xs sm:text-sm font-black self-start leading-none ${
                      card.isRed ? "text-red-600" : "text-slate-900"
                    }`}
                  >
                    {card.label}
                  </span>
                  <span
                    className={`text-base sm:text-lg leading-none ${
                      card.isRed ? "text-red-600" : "text-slate-900"
                    }`}
                  >
                    {card.suit === "hearts"
                      ? "♥"
                      : card.suit === "diamonds"
                      ? "♦"
                      : card.suit === "spades"
                      ? "♠"
                      : "♣"}
                  </span>
                  <span
                    className={`text-[9px] font-bold self-end leading-none text-slate-400`}
                  >
                    {card.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Bet Placed Indicator */}
            <div className="text-[11px] font-bold text-[#8596a5]">
              Bet: <span className="text-white font-mono">{activeSym}{bets.banker.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Center Tie Zone & Result Banner */}
        <div className="w-full flex flex-col items-center justify-center mt-2 z-10">
          <div
            className={`w-full max-w-xs py-2 rounded-xl border text-center transition-all ${
              roundResult === "tie"
                ? "bg-emerald-500/20 border-emerald-400 shadow-lg shadow-emerald-500/25"
                : "bg-[#11232e] border-[#213743]"
            }`}
          >
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
              TIE (8:1)
            </span>
            <div className="text-[11px] font-bold text-[#8596a5] mt-0.5">
              Bet: <span className="text-white font-mono">{activeSym}{bets.tie.toFixed(2)}</span>
            </div>
          </div>

          {/* Outcome Message */}
          <div className="h-8 flex items-center justify-center mt-2">
            {payoutMessage && (
              <span className="text-sm font-black text-[#00e701] font-mono animate-bounce flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" />
                {payoutMessage}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. BOTTOM CONTROLS (Directly Beneath Arena)               */}
      {/* ========================================================= */}
      <div className="w-full mt-4 rounded-2xl bg-[#1a2c38] border border-[#213743] p-4 sm:p-5 flex flex-col gap-4 shadow-xl">
        {/* Chip Value Selectors */}
        <div className="w-full flex items-center justify-between">
          <label className="text-xs font-bold text-[#b1bad3]">Select Chip Value</label>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {CHIP_VALUES.map((val) => (
              <button
                key={val}
                onClick={() => {
                  if (isDealing) return;
                  sounds.playClick();
                  setSelectedChip(val);
                }}
                disabled={isDealing}
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 font-mono font-black text-xs flex items-center justify-center transition-all disabled:opacity-50 cursor-pointer ${
                  selectedChip === val
                    ? "bg-[#00e701] border-white text-[#011e01] scale-110 shadow-lg shadow-[#00e701]/30"
                    : "bg-[#0f212e] border-[#213743] text-white hover:border-[#2f4553]"
                }`}
              >
                {val >= 1 ? `$${val}` : `${val * 100}¢`}
              </button>
            ))}
          </div>
        </div>

        {/* Bet Placement Buttons (Player, Tie, Banker) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <button
            onClick={() => handlePlaceChip("player")}
            disabled={isDealing}
            className="py-3.5 rounded-xl border border-blue-500/40 bg-blue-950/20 hover:bg-blue-950/40 active:scale-95 text-blue-300 font-black text-xs sm:text-sm uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer flex flex-col items-center gap-1"
          >
            <span>+ PLAYER (1:1)</span>
            <span className="font-mono text-[11px] text-white">
              {activeSym}{bets.player.toFixed(2)}
            </span>
          </button>

          <button
            onClick={() => handlePlaceChip("tie")}
            disabled={isDealing}
            className="py-3.5 rounded-xl border border-emerald-500/40 bg-emerald-950/20 hover:bg-emerald-950/40 active:scale-95 text-emerald-300 font-black text-xs sm:text-sm uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer flex flex-col items-center gap-1"
          >
            <span>+ TIE (8:1)</span>
            <span className="font-mono text-[11px] text-white">
              {activeSym}{bets.tie.toFixed(2)}
            </span>
          </button>

          <button
            onClick={() => handlePlaceChip("banker")}
            disabled={isDealing}
            className="py-3.5 rounded-xl border border-amber-500/40 bg-amber-950/20 hover:bg-amber-950/40 active:scale-95 text-amber-300 font-black text-xs sm:text-sm uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer flex flex-col items-center gap-1"
          >
            <span>+ BANKER (0.95:1)</span>
            <span className="font-mono text-[11px] text-white">
              {activeSym}{bets.banker.toFixed(2)}
            </span>
          </button>
        </div>

        {/* Bet Modifiers & Total Display */}
        <div className="w-full flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearBets}
              disabled={isDealing || totalBet === 0}
              className="px-3 py-2 rounded-xl bg-[#213743] hover:bg-[#2f4553] text-[#b1bad3] hover:text-white font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Clear</span>
            </button>
            <button
              onClick={handleDoubleBets}
              disabled={isDealing || totalBet === 0}
              className="px-3 py-2 rounded-xl bg-[#213743] hover:bg-[#2f4553] text-[#b1bad3] hover:text-white font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              2×
            </button>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-bold text-[#8596a5] block">Total Bet</span>
            <span className="text-base font-black font-mono text-white">
              {activeSym}{totalBet.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Stake Green Deal CTA Button */}
        <button
          onClick={handleDeal}
          disabled={isDealing || totalBet <= 0}
          className="w-full py-4 rounded-xl bg-[#00e701] hover:bg-[#00c701] active:scale-[0.99] text-[#011e01] font-black text-sm sm:text-base uppercase tracking-wider shadow-lg shadow-[#00e701]/25 transition-all disabled:opacity-50 cursor-pointer mt-1"
        >
          {isDealing ? "Dealing..." : "Deal"}
        </button>
      </div>

      {/* ========================================================= */}
      {/* PROVABLY FAIR MODAL                                       */}
      {/* ========================================================= */}
      {showFairnessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <ShieldCheck className="h-5 w-5 text-[#00e701]" />
                <span>Provably Fair Verification</span>
              </div>
              <button
                onClick={() => setShowFairnessModal(false)}
                className="p-1 rounded-lg text-[#b1bad3] hover:text-white hover:bg-[#213743]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-[#b1bad3]">
              <div>
                <label className="font-bold text-white block mb-1">Server Seed (Hashed)</label>
                <div className="p-2.5 rounded-xl bg-[#0f212e] font-mono text-[11px] text-white flex items-center justify-between">
                  <span className="truncate">f4e92a10bd71a3982e5c840134bc98e104921ca498b30172e811bc2940294191</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("f4e92a10bd71a3982e5c840134bc98e104921ca498b30172e811bc2940294191");
                      setCopiedSeed(true);
                      setTimeout(() => setCopiedSeed(false), 2000);
                    }}
                    className="p-1 text-[#8596a5] hover:text-white"
                  >
                    {copiedSeed ? <Check className="h-3.5 w-3.5 text-[#00e701]" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="font-bold text-white block mb-1">Client Seed</label>
                <div className="p-2.5 rounded-xl bg-[#0f212e] font-mono text-[11px] text-white">
                  stake_baccarat_client_seed_2026
                </div>
              </div>
              <div>
                <label className="font-bold text-white block mb-1">House Edge</label>
                <div className="p-2.5 rounded-xl bg-[#0f212e] font-mono text-[11px] text-[#00e701]">
                  Banker: 1.06% | Player: 1.24%
                </div>
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

      {/* ========================================================= */}
      {/* LIVE STATS MODAL                                          */}
      {/* ========================================================= */}
      {showStatsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <TrendingUp className="h-5 w-5 text-[#00e701]" />
                <span>Live Baccarat Stats</span>
              </div>
              <button
                onClick={() => setShowStatsModal(false)}
                className="p-1 rounded-lg text-[#b1bad3] hover:text-white hover:bg-[#213743]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-[#0f212e] border border-[#213743] text-center">
                <div className="text-[11px] font-bold text-[#b1bad3]">Rounds</div>
                <div className="text-lg font-black text-white font-mono mt-0.5">{stats.rounds}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#0f212e] border border-[#213743] text-center">
                <div className="text-[11px] font-bold text-[#b1bad3]">Win Rate</div>
                <div className="text-lg font-black text-[#00e701] font-mono mt-0.5">
                  {stats.rounds > 0 ? ((stats.wins / stats.rounds) * 100).toFixed(1) : "0.0"}%
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#0f212e] border border-[#213743] text-center">
                <div className="text-[11px] font-bold text-[#b1bad3]">Wagered</div>
                <div className="text-lg font-black text-white font-mono mt-0.5">
                  {activeSym}{stats.wagered.toFixed(2)}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#0f212e] border border-[#213743] text-center">
                <div className="text-[11px] font-bold text-[#b1bad3]">Net Profit</div>
                <div
                  className={`text-lg font-black font-mono mt-0.5 ${
                    stats.profit >= 0 ? "text-[#00e701]" : "text-[#e9113c]"
                  }`}
                >
                  {stats.profit >= 0 ? "+" : ""}
                  {activeSym}{stats.profit.toFixed(2)}
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

      {/* ========================================================= */}
      {/* RULES MODAL                                               */}
      {/* ========================================================= */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Info className="h-5 w-5 text-[#00e701]" />
                <span>How to Play Stake Baccarat</span>
              </div>
              <button
                onClick={() => setShowRulesModal(false)}
                className="p-1 rounded-lg text-[#b1bad3] hover:text-white hover:bg-[#213743]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-[#b1bad3] leading-relaxed">
              <p>
                <strong className="text-white">Card Values:</strong> Aces count as 1, 2-9 count as face value, and 10, Jack, Queen, King count as 0.
              </p>
              <p>
                <strong className="text-white">Hand Score:</strong> Total values are summed modulo 10 (e.g. 7 + 8 = 15 % 10 = 5). The hand closest to 9 wins.
              </p>
              <p>
                <strong className="text-white">Naturals:</strong> If either Player or Banker has an initial score of 8 or 9, both stand immediately.
              </p>
              <p>
                <strong className="text-white">Third Card Tableau:</strong> Standard international casino tableau rules dictate whether a 3rd card is drawn by Player or Banker.
              </p>
            </div>
            <button
              onClick={() => setShowRulesModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#213743] hover:bg-[#2f4553] text-white text-xs font-bold transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
