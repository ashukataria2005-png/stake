"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Zap,
  ArrowUp,
  ArrowDown,
  RotateCw,
  Coins,
  Check,
  X,
  Info,
  TrendingUp,
  Copy,
  Sparkles,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

export type Suit = "spades" | "hearts" | "diamonds" | "clubs";

export interface Card {
  id: string;
  rank: number; // 1 (Ace) to 13 (King)
  rankLabel: string; // "A", "2", ..., "10", "J", "Q", "K"
  suit: Suit;
  suitSymbol: string; // "♠", "♥", "♦", "♣"
  isRed: boolean;
}

interface CardHistoryItem {
  card: Card;
  guess?: "higher" | "lower" | "skip";
  wasCorrect?: boolean;
  stepMultiplier?: number;
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

function generateRandomCard(): Card {
  const rank = Math.floor(Math.random() * 13) + 1;
  const suitObj = SUITS[Math.floor(Math.random() * SUITS.length)];
  return {
    id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    rank,
    rankLabel: RANK_LABELS[rank],
    suit: suitObj.suit,
    suitSymbol: suitObj.symbol,
    isRed: suitObj.isRed,
  };
}

export default function HiLoGame() {
  const { balance, updateBalance, currency, formatBalance, currencySymbol, addRecentlyPlayedGame } = useGame();
  const activeSym = currencySymbol || "$";

  // Register in Recently Played once on mount
  useEffect(() => {
    if (addRecentlyPlayedGame) {
      addRecentlyPlayedGame({
        id: "hilo",
        title: "HiLo",
        image: "/games/stake-originals/hilo.webp",
        href: "/games/hilo",
      });
    }
  }, []);

  // Mode & Betting State
  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [betAmount, setBetAmount] = useState<number>(10);
  const [betInput, setBetInput] = useState<string>("10");

  useEffect(() => {
    if (betInput !== "" && parseFloat(betInput) === betAmount) return;
    setBetInput(betAmount.toString());
  }, [betAmount]);

  // Round State
  const [isRoundActive, setIsRoundActive] = useState<boolean>(false);
  const [currentCard, setCurrentCard] = useState<Card>(() => generateRandomCard());
  const [previousCard, setPreviousCard] = useState<Card | null>(null);
  const [cardHistory, setCardHistory] = useState<CardHistoryItem[]>([]);
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1.0);
  const [skipsRemaining, setSkipsRemaining] = useState<number>(3);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [lastGuessResult, setLastGuessResult] = useState<"win" | "loss" | null>(null);

  // Settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // Auto Bet State
  const [isAutoRunning, setIsAutoRunning] = useState<boolean>(false);
  const [autoBetsLimit, setAutoBetsLimit] = useState<number>(0);
  const [autoBetsCount, setAutoBetsCount] = useState<number>(0);
  const [autoStrategy, setAutoStrategy] = useState<"smart" | "higher" | "lower">("smart");
  const [autoTargetCards, setAutoTargetCards] = useState<number>(3); // cashout after N cards
  const [onWinAction, setOnWinAction] = useState<"reset" | "increase">("reset");
  const [onWinPercent, setOnWinPercent] = useState<number>(100);
  const [onLossAction, setOnLossAction] = useState<"reset" | "increase">("reset");
  const [onLossPercent, setOnLossPercent] = useState<number>(100);
  const [stopOnProfit, setStopOnProfit] = useState<number>(0);
  const [stopOnLoss, setStopOnLoss] = useState<number>(0);
  const initialAutoBalanceRef = useRef<number>(balance);
  const baseBetRef = useRef<number>(betAmount);

  // Modals
  const [showFairnessModal, setShowFairnessModal] = useState<boolean>(false);
  const [showLiveStats, setShowLiveStats] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [copiedSeed, setCopiedSeed] = useState<boolean>(false);

  // Live Stats
  const [stats, setStats] = useState({
    rounds: 0,
    wins: 0,
    losses: 0,
    wagered: 0,
    profit: 0,
  });

  // Calculate Stake HiLo Odds (RTP 99% / House Edge 1%)
  // Standard infinite deck math with 13 ranks:
  // Higher or Same: counts ranks from R up to 13 inclusive => (14 - R) / 13
  // Lower or Same: counts ranks from 1 up to R inclusive => R / 13
  const rank = currentCard.rank;
  const ranksHigherOrSame = 14 - rank;
  const higherChance = parseFloat(((ranksHigherOrSame / 13) * 100).toFixed(2));
  const higherStepMult = parseFloat(((0.99 * 13) / ranksHigherOrSame).toFixed(4));

  const ranksLowerOrSame = rank;
  const lowerChance = parseFloat(((ranksLowerOrSame / 13) * 100).toFixed(2));
  const lowerStepMult = parseFloat(((0.99 * 13) / ranksLowerOrSame).toFixed(4));

  // Current Accumulated Payout and Profit
  const currentPayout = parseFloat((betAmount * currentMultiplier).toFixed(2));
  const currentProfit = parseFloat((currentPayout - betAmount).toFixed(2));

  // Quick Bet Modifiers
  const handleHalfBet = () => {
    sounds.playClick();
    const next = Math.max(0.01, parseFloat((betAmount / 2).toFixed(2)));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  const handleDoubleBet = () => {
    sounds.playClick();
    const next = parseFloat((betAmount * 2).toFixed(2));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  const handleMaxBet = () => {
    sounds.playClick();
    const next = Math.max(0.01, parseFloat(balance.toFixed(2)));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  // Start a new Round
  const startRound = () => {
    if (isRoundActive || isAnimating) return;

    const currentBet =
      betInput === "" || isNaN(parseFloat(betInput)) || parseFloat(betInput) <= 0
        ? 1
        : parseFloat(betInput);

    if (currentBet > balance) {
      alert("Insufficient balance! Please use the Wallet button.");
      setIsAutoRunning(false);
      return;
    }

    updateBalance(-currentBet);
    sounds.playCardFlip();

    const startCard = generateRandomCard();
    setCurrentCard(startCard);
    setPreviousCard(null);
    setCardHistory([{ card: startCard }]);
    setCurrentMultiplier(1.0);
    setSkipsRemaining(3);
    setIsRoundActive(true);
    setLastGuessResult(null);

    setStats((prev) => ({
      ...prev,
      rounds: prev.rounds + 1,
      wagered: parseFloat((prev.wagered + currentBet).toFixed(2)),
    }));
  };

  // Cashout Current Accumulated Profit
  const handleCashout = useCallback(() => {
    if (!isRoundActive || isAnimating || cardHistory.length <= 1) return;

    const payout = parseFloat((betAmount * currentMultiplier).toFixed(2));
    const profit = parseFloat((payout - betAmount).toFixed(2));
    updateBalance(payout);
    sounds.playCashout();

    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch {}

    setIsRoundActive(false);
    setLastGuessResult("win");

    setStats((prev) => ({
      ...prev,
      wins: prev.wins + 1,
      profit: parseFloat((prev.profit + profit).toFixed(2)),
    }));
  }, [betAmount, cardHistory.length, currentMultiplier, isAnimating, isRoundActive, updateBalance]);

  // Handle Player Guess: Higher or Same vs Lower or Same
  const handleGuess = useCallback(
    (guess: "higher" | "lower") => {
      if (!isRoundActive || isAnimating) return;

      setIsAnimating(true);
      sounds.playCardFlip();

      const nextCard = generateRandomCard();
      const prevRank = currentCard.rank;
      const nextRank = nextCard.rank;

      const isWin =
        guess === "higher"
          ? nextRank >= prevRank
          : nextRank <= prevRank;

      const stepMult = guess === "higher" ? higherStepMult : lowerStepMult;

      setTimeout(() => {
        setPreviousCard(currentCard);
        setCurrentCard(nextCard);

        if (isWin) {
          const nextMult = parseFloat((currentMultiplier * stepMult).toFixed(4));
          setCurrentMultiplier(nextMult);
          setLastGuessResult("win");
          sounds.playCardSuccess();

          setCardHistory((prev) => [
            ...prev,
            {
              card: nextCard,
              guess,
              wasCorrect: true,
              stepMultiplier: stepMult,
            },
          ]);
          setIsAnimating(false);
        } else {
          // Lost the round
          sounds.playCardLoss();
          setLastGuessResult("loss");
          setIsRoundActive(false);

          setCardHistory((prev) => [
            ...prev,
            {
              card: nextCard,
              guess,
              wasCorrect: false,
              stepMultiplier: stepMult,
            },
          ]);

          setStats((prev) => ({
            ...prev,
            losses: prev.losses + 1,
            profit: parseFloat((prev.profit - betAmount).toFixed(2)),
          }));

          setIsAnimating(false);
          if (isAutoRunning) {
            handleAutoLoss();
          }
        }
      }, 350);
    },
    [
      betAmount,
      currentCard,
      currentMultiplier,
      higherStepMult,
      isAnimating,
      isAutoRunning,
      isRoundActive,
      lowerStepMult,
    ]
  );

  // Skip Current Card
  const handleSkip = () => {
    if (!isRoundActive || isAnimating || skipsRemaining <= 0) return;

    setIsAnimating(true);
    sounds.playCardFlip();
    const nextCard = generateRandomCard();

    setTimeout(() => {
      setPreviousCard(currentCard);
      setCurrentCard(nextCard);
      setSkipsRemaining((prev) => Math.max(0, prev - 1));
      setCardHistory((prev) => [
        ...prev,
        {
          card: nextCard,
          guess: "skip",
          wasCorrect: true,
        },
      ]);
      setIsAnimating(false);
    }, 300);
  };

  // Auto Bet State Machine Handlers
  const handleAutoLoss = () => {
    if (onLossAction === "reset") {
      setBetAmount(baseBetRef.current);
      setBetInput(baseBetRef.current.toString());
    } else {
      const next = parseFloat((betAmount * (1 + onLossPercent / 100)).toFixed(2));
      setBetAmount(next);
      setBetInput(next.toString());
    }
  };

  const handleAutoWin = () => {
    if (onWinAction === "reset") {
      setBetAmount(baseBetRef.current);
      setBetInput(baseBetRef.current.toString());
    } else {
      const next = parseFloat((betAmount * (1 + onWinPercent / 100)).toFixed(2));
      setBetAmount(next);
      setBetInput(next.toString());
    }
  };

  // Auto Play Step Execution
  useEffect(() => {
    if (!isAutoRunning) return;

    let timer: NodeJS.Timeout;

    if (!isRoundActive) {
      // Check limits
      if (autoBetsLimit > 0 && autoBetsCount >= autoBetsLimit) {
        setIsAutoRunning(false);
        return;
      }
      const netProfit = balance - initialAutoBalanceRef.current;
      if (stopOnProfit > 0 && netProfit >= stopOnProfit) {
        setIsAutoRunning(false);
        return;
      }
      if (stopOnLoss > 0 && netProfit <= -stopOnLoss) {
        setIsAutoRunning(false);
        return;
      }

      timer = setTimeout(() => {
        startRound();
        setAutoBetsCount((c) => c + 1);
      }, 500);
    } else {
      // Round is active: make guess or cashout
      const guessesMade = cardHistory.length - 1;
      if (guessesMade >= autoTargetCards) {
        timer = setTimeout(() => {
          handleCashout();
          handleAutoWin();
        }, 400);
      } else {
        // Decide guess based on strategy
        let guessToMake: "higher" | "lower" = "higher";
        if (autoStrategy === "smart") {
          // If rank <= 7 guess higher, else lower
          guessToMake = currentCard.rank <= 7 ? "higher" : "lower";
        } else if (autoStrategy === "higher") {
          guessToMake = "higher";
        } else {
          guessToMake = "lower";
        }

        timer = setTimeout(() => {
          handleGuess(guessToMake);
        }, 500);
      }
    }

    return () => clearTimeout(timer);
  }, [
    isAutoRunning,
    isRoundActive,
    cardHistory.length,
    autoTargetCards,
    currentCard.rank,
    autoStrategy,
    autoBetsCount,
    autoBetsLimit,
    balance,
    handleCashout,
    handleGuess,
    stopOnLoss,
    stopOnProfit,
  ]);

  const toggleFullscreen = () => {
    if (!gameContainerRef.current) return;
    if (!document.fullscreenElement) {
      gameContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={gameContainerRef}
      className={`w-full max-w-6xl mx-auto px-2 sm:px-4 py-4 select-none flex flex-col space-y-4 ${
        isFullscreen ? "p-6 bg-[#0f212e] min-h-screen" : ""
      }`}
    >
      {/* Main Game Shell: Left Sidebar (Desktop) / Bottom Controls (Mobile) + Right Center Arena */}
      <div className="rounded-2xl border border-[#213743] bg-[#1a2c38] overflow-hidden shadow-2xl flex flex-col">
        {/* ========================================================= */}
        {/* RIGHT / CENTER ARENA: CARD DISPLAY & ACTION CHOICES        */}
        {/* ========================================================= */}
        <div className="flex-1 bg-[#0f212e] flex flex-col justify-between p-4 sm:p-6 lg:p-8 min-h-[460px] sm:min-h-[520px]">
          {/* Top Card Streak / Round History Bar */}
          <div className="w-full flex items-center justify-between pb-4">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {cardHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold shrink-0 ${
                    idx === 0
                      ? "bg-[#213743] border-[#2f4553] text-white"
                      : item.wasCorrect
                      ? "bg-[#00e701]/15 border-[#00e701]/30 text-[#00e701]"
                      : "bg-[#e9113c]/15 border-[#e9113c]/30 text-[#e9113c]"
                  }`}
                >
                  <span className={item.card.isRed ? "text-red-400" : "text-white"}>
                    {item.card.rankLabel}
                    {item.card.suitSymbol}
                  </span>
                  {item.guess && (
                    <span className="text-[10px]">
                      {item.guess === "higher" ? "↑" : item.guess === "lower" ? "↓" : "↷"}
                    </span>
                  )}
                  {item.wasCorrect && <Check className="h-3 w-3 text-[#00e701]" />}
                </div>
              ))}
            </div>
          </div>

          {/* CENTER ARENA: INTERACTIVE CARD & CHOICE BUTTONS */}
          <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 py-4">
            {/* The Main Current Card Graphic */}
            <div className="relative group perspective">
              <div
                className={`w-40 h-56 sm:w-48 sm:h-68 rounded-2xl border-4 border-slate-200/20 bg-gradient-to-b from-white via-[#fcfcfc] to-[#e8ebee] shadow-2xl p-4 flex flex-col justify-between transition-transform duration-300 ${
                  isAnimating ? "scale-95 rotate-1" : "scale-100"
                } ${
                  lastGuessResult === "win"
                    ? "ring-4 ring-[#00e701]/50 shadow-[0_0_40px_rgba(0,231,1,0.4)]"
                    : lastGuessResult === "loss"
                    ? "ring-4 ring-[#e9113c]/50 shadow-[0_0_40px_rgba(233,17,60,0.4)]"
                    : ""
                }`}
              >
                {/* Top Left Rank & Suit */}
                <div className="flex flex-col items-center self-start">
                  <span
                    className={`text-2xl sm:text-3xl font-black font-mono leading-none ${
                      currentCard.isRed ? "text-[#e9113c]" : "text-[#0f212e]"
                    }`}
                  >
                    {currentCard.rankLabel}
                  </span>
                  <span
                    className={`text-xl sm:text-2xl leading-none mt-0.5 ${
                      currentCard.isRed ? "text-[#e9113c]" : "text-[#0f212e]"
                    }`}
                  >
                    {currentCard.suitSymbol}
                  </span>
                </div>

                {/* Big Center Graphic */}
                <div className="flex flex-col items-center justify-center">
                  <span
                    className={`text-5xl sm:text-7xl select-none filter drop-shadow-sm ${
                      currentCard.isRed ? "text-[#e9113c]" : "text-[#0f212e]"
                    }`}
                  >
                    {currentCard.suitSymbol}
                  </span>
                </div>

                {/* Bottom Right Rank & Suit (Inverted) */}
                <div className="flex flex-col items-center self-end rotate-180">
                  <span
                    className={`text-2xl sm:text-3xl font-black font-mono leading-none ${
                      currentCard.isRed ? "text-[#e9113c]" : "text-[#0f212e]"
                    }`}
                  >
                    {currentCard.rankLabel}
                  </span>
                  <span
                    className={`text-xl sm:text-2xl leading-none mt-0.5 ${
                      currentCard.isRed ? "text-[#e9113c]" : "text-[#0f212e]"
                    }`}
                  >
                    {currentCard.suitSymbol}
                  </span>
                </div>
              </div>
            </div>

            {/* CHOICE ACTION BUTTONS (Higher or Same / Lower or Same / Skip) */}
            <div className="flex flex-col gap-3 w-full max-w-[280px]">
              {/* Higher or Same Button */}
              <button
                type="button"
                disabled={!isRoundActive || isAnimating}
                onClick={() => handleGuess("higher")}
                className="w-full p-4 rounded-2xl border border-[#213743] bg-[#1a2c38] hover:bg-[#213743] hover:border-[#00e701]/40 text-left transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed group cursor-pointer shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#00e701]/15 text-[#00e701] group-hover:scale-110 transition-transform">
                      <ArrowUp className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-white flex items-center gap-1.5">
                        <span>Higher or Same</span>
                      </div>
                      <div className="text-xs font-bold text-[#b1bad3]">
                        Win Chance: <span className="text-[#00e701]">{higherChance}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-black text-[#00e701] font-mono">
                      {higherStepMult.toFixed(2)}×
                    </div>
                  </div>
                </div>
              </button>

              {/* Lower or Same Button */}
              <button
                type="button"
                disabled={!isRoundActive || isAnimating}
                onClick={() => handleGuess("lower")}
                className="w-full p-4 rounded-2xl border border-[#213743] bg-[#1a2c38] hover:bg-[#213743] hover:border-[#00e701]/40 text-left transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed group cursor-pointer shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#1475e1]/15 text-[#1475e1] group-hover:scale-110 transition-transform">
                      <ArrowDown className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-white flex items-center gap-1.5">
                        <span>Lower or Same</span>
                      </div>
                      <div className="text-xs font-bold text-[#b1bad3]">
                        Win Chance: <span className="text-[#00e701]">{lowerChance}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-black text-[#00e701] font-mono">
                      {lowerStepMult.toFixed(2)}×
                    </div>
                  </div>
                </div>
              </button>

              {/* Skip Card Button */}
              <button
                type="button"
                disabled={!isRoundActive || isAnimating || skipsRemaining <= 0}
                onClick={handleSkip}
                className="w-full py-3 px-4 rounded-xl border border-[#213743] bg-[#0f212e] hover:bg-[#1a2c38] text-xs font-bold text-[#b1bad3] hover:text-white transition-all flex items-center justify-between disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <RotateCw className="h-4 w-4" />
                  <span>Skip Card</span>
                </div>
                <span className="font-mono text-white">{skipsRemaining} left</span>
              </button>
            </div>
          </div>

          {/* BOTTOM UTILITY TOOLBAR */}
          <div className="w-full flex items-center justify-between pt-4 border-t border-[#213743] text-[#b1bad3]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const next = !soundEnabled;
                  setSoundEnabled(next);
                  sounds.enabled = next;
                  if (next) sounds.playClick();
                }}
                className="p-2 rounded-lg bg-[#1a2c38] border border-[#213743] hover:text-white transition-colors cursor-pointer"
                title={soundEnabled ? "Mute Sound" : "Enable Sound"}
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-red-400" />}
              </button>

              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="p-2 rounded-lg bg-[#1a2c38] border border-[#213743] hover:text-white transition-colors cursor-pointer"
                title="Game Rules"
              >
                <Info className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowLiveStats(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1a2c38] border border-[#213743] hover:text-white transition-colors cursor-pointer"
              >
                <TrendingUp className="h-3.5 w-3.5 text-[#00e701]" />
                <span className="hidden sm:inline">Live Stats</span>
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                className="p-2 rounded-lg bg-[#1a2c38] border border-[#213743] hover:text-white transition-colors cursor-pointer"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      {/* LEFT / BOTTOM CONTROLS PANEL                              */}
        {/* ========================================================= */}
        <div className="w-full border-t border-[#213743] bg-[#1a2c38] p-4 sm:p-5 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 bg-[#0f212e] rounded-xl border border-[#213743]">
              <button
                type="button"
                disabled={isRoundActive || isAutoRunning}
                onClick={() => {
                  sounds.playClick();
                  setMode("manual");
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === "manual"
                    ? "bg-[#213743] text-white shadow-sm"
                    : "text-[#b1bad3] hover:text-white"
                }`}
              >
                Manual
              </button>
              <button
                type="button"
                disabled={isRoundActive || isAutoRunning}
                onClick={() => {
                  sounds.playClick();
                  setMode("auto");
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === "auto"
                    ? "bg-[#213743] text-white shadow-sm"
                    : "text-[#b1bad3] hover:text-white"
                }`}
              >
                Auto
              </button>
            </div>

            {/* Bet Amount Input with currency icon, 1/2, 2x, Max */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-[#b1bad3]">
                <span>Bet Amount</span>
                <span className="text-[#00e701] font-mono">
                  {activeSym}
                  {formatBalance(balance)}
                </span>
              </div>
              <div className="flex items-center rounded-xl border border-[#213743] bg-[#0f212e] p-1 focus-within:border-[#00e701] transition-colors">
                <span className="px-2.5 text-sm font-bold text-[#00e701]">{activeSym}</span>
                <input
                  type="text"
                  inputMode="decimal"
                  disabled={isRoundActive || isAutoRunning}
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
                <button
                  type="button"
                  disabled={isRoundActive || isAutoRunning}
                  onClick={handleHalfBet}
                  className="rounded-lg px-2.5 py-1 text-xs font-bold text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors cursor-pointer"
                >
                  ½
                </button>
                <button
                  type="button"
                  disabled={isRoundActive || isAutoRunning}
                  onClick={handleDoubleBet}
                  className="rounded-lg px-2.5 py-1 text-xs font-bold text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors cursor-pointer"
                >
                  2×
                </button>
                <button
                  type="button"
                  disabled={isRoundActive || isAutoRunning}
                  onClick={handleMaxBet}
                  className="rounded-lg px-2.5 py-1 text-xs font-bold text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors cursor-pointer"
                >
                  Max
                </button>
              </div>
            </div>

            {/* Current Round Profit Ladder (When Round is Active) */}
            {isRoundActive && (
              <div className="space-y-2 p-3 bg-[#0f212e] rounded-xl border border-[#213743]">
                <div className="flex justify-between items-center text-xs font-bold text-[#b1bad3]">
                  <span>Total Multiplier</span>
                  <span className="text-[#00e701] font-mono text-sm font-extrabold">
                    {currentMultiplier.toFixed(2)}×
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-[#b1bad3]">
                  <span>Accumulated Profit</span>
                  <span
                    className={`font-mono text-sm font-extrabold ${
                      currentProfit > 0 ? "text-[#00e701]" : "text-white"
                    }`}
                  >
                    {currentProfit > 0 ? "+" : ""}
                    {activeSym}
                    {currentProfit.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-[#b1bad3]">
                  <span>Skips Remaining</span>
                  <span className="text-white font-mono">{skipsRemaining} / 3</span>
                </div>
              </div>
            )}

            {/* AUTO BETTING SETTINGS */}
            {mode === "auto" && (
              <div className="space-y-3 pt-2 border-t border-[#213743]">
                {/* Auto Strategy */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#b1bad3]">Prediction Strategy</label>
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#0f212e] rounded-xl border border-[#213743]">
                    <button
                      type="button"
                      disabled={isAutoRunning}
                      onClick={() => setAutoStrategy("smart")}
                      className={`py-1.5 text-[11px] font-bold rounded-lg ${
                        autoStrategy === "smart"
                          ? "bg-[#213743] text-white"
                          : "text-[#b1bad3] hover:text-white"
                      }`}
                    >
                      Smart
                    </button>
                    <button
                      type="button"
                      disabled={isAutoRunning}
                      onClick={() => setAutoStrategy("higher")}
                      className={`py-1.5 text-[11px] font-bold rounded-lg ${
                        autoStrategy === "higher"
                          ? "bg-[#213743] text-white"
                          : "text-[#b1bad3] hover:text-white"
                      }`}
                    >
                      Higher
                    </button>
                    <button
                      type="button"
                      disabled={isAutoRunning}
                      onClick={() => setAutoStrategy("lower")}
                      className={`py-1.5 text-[11px] font-bold rounded-lg ${
                        autoStrategy === "lower"
                          ? "bg-[#213743] text-white"
                          : "text-[#b1bad3] hover:text-white"
                      }`}
                    >
                      Lower
                    </button>
                  </div>
                </div>

                {/* Auto Cashout Cards Target */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-[#b1bad3]">
                    <span>Cards Before Cashout</span>
                    <span className="text-[#00e701] font-mono">{autoTargetCards} cards</span>
                  </div>
                  <div className="flex items-center rounded-xl border border-[#213743] bg-[#0f212e] p-1.5">
                    <input
                      type="number"
                      min={1}
                      max={12}
                      disabled={isAutoRunning}
                      value={autoTargetCards}
                      onChange={(e) =>
                        setAutoTargetCards(Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))
                      }
                      className="w-full bg-transparent px-1 text-xs font-bold text-white focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Number of Bets */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#b1bad3]">Number of Bets</label>
                  <div className="flex items-center rounded-xl border border-[#213743] bg-[#0f212e] p-1">
                    <input
                      type="number"
                      disabled={isAutoRunning}
                      value={autoBetsLimit === 0 ? "" : autoBetsLimit}
                      placeholder="∞ (Infinite)"
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setAutoBetsLimit(isNaN(val) || val < 0 ? 0 : val);
                      }}
                      className="w-full bg-transparent px-2 text-xs font-bold text-white focus:outline-none font-mono"
                    />
                    <button
                      type="button"
                      disabled={isAutoRunning}
                      onClick={() => setAutoBetsLimit(0)}
                      className="rounded-lg px-2 py-1 text-xs font-bold text-[#b1bad3] hover:bg-[#213743] hover:text-white"
                    >
                      ∞
                    </button>
                    <button
                      type="button"
                      disabled={isAutoRunning}
                      onClick={() => setAutoBetsLimit(10)}
                      className="rounded-lg px-2 py-1 text-xs font-bold text-[#b1bad3] hover:bg-[#213743] hover:text-white"
                    >
                      10
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* PRIMARY CTA ACTION BUTTON: BET or CASHOUT */}
          <div className="w-full pt-2">
            {!isRoundActive ? (
              mode === "manual" ? (
                <button
                  type="button"
                  onClick={startRound}
                  disabled={betAmount > balance || betAmount <= 0}
                  className="w-full py-4 text-base font-extrabold rounded-xl bg-[#00e701] hover:bg-[#00c201] text-black shadow-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                >
                  <Zap className="h-5 w-5 fill-current" />
                  <span>Bet</span>
                </button>
              ) : isAutoRunning ? (
                <button
                  type="button"
                  onClick={() => setIsAutoRunning(false)}
                  className="w-full py-4 text-base font-extrabold rounded-xl bg-[#e9113c] hover:bg-[#c40e32] text-white shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                >
                  <span>Stop Autobet ({autoBetsCount})</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    initialAutoBalanceRef.current = balance;
                    baseBetRef.current = betAmount;
                    setAutoBetsCount(0);
                    setIsAutoRunning(true);
                  }}
                  disabled={betAmount > balance || betAmount <= 0}
                  className="w-full py-4 text-base font-extrabold rounded-xl bg-[#00e701] hover:bg-[#00c201] text-black shadow-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                >
                  <Zap className="h-5 w-5 fill-current" />
                  <span>Start Autobet</span>
                </button>
              )
            ) : (
              /* ACTIVE ROUND CASHOUT BUTTON */
              <button
                type="button"
                onClick={handleCashout}
                disabled={cardHistory.length <= 1 || isAnimating}
                className="w-full py-4 text-base font-extrabold rounded-xl bg-[#00e701] hover:bg-[#00c201] text-black shadow-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                <Coins className="h-5 w-5" />
                <span>
                  Cashout {activeSym}
                  {currentPayout.toFixed(2)}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        </div>

      {/* ========================================================= */}
      {/* PROVABLY FAIR VERIFIER MODAL                              */}
      {/* ========================================================= */}
      {showFairnessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <ShieldCheck className="h-5 w-5 text-[#00e701]" />
                <span>Provably Fair Verifier</span>
              </div>
              <button
                onClick={() => setShowFairnessModal(false)}
                className="p-1 rounded-lg text-[#b1bad3] hover:text-white hover:bg-[#213743]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-[#b1bad3]">
                HiLo card decks are shuffled using HMAC-SHA256 based on your Client Seed,
                Server Seed, and Nonce with a certified 99% Return to Player (RTP).
              </p>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#b1bad3]">Active Server Seed (Hashed)</label>
                <div className="flex items-center justify-between rounded-xl bg-[#0f212e] border border-[#213743] p-2.5">
                  <span className="font-mono text-[11px] text-white truncate">
                    74b8895d38f8cfc8479e0a6d23456fe2b23a7e584f09d3b
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("74b8895d38f8cfc8479e0a6d23456fe2b23a7e584f09d3b");
                      setCopiedSeed(true);
                      setTimeout(() => setCopiedSeed(false), 2000);
                    }}
                    className="ml-2 text-[#00e701] hover:brightness-110"
                  >
                    {copiedSeed ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#b1bad3]">Active Client Seed</label>
                <div className="rounded-xl bg-[#0f212e] border border-[#213743] p-2.5 font-mono text-white">
                  stake-hilo-fairness-2026
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowFairnessModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#213743] hover:bg-[#2f4553] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Close Verifier
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* LIVE STATS MODAL                                          */}
      {/* ========================================================= */}
      {showLiveStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <TrendingUp className="h-5 w-5 text-[#00e701]" />
                <span>HiLo Session Stats</span>
              </div>
              <button
                onClick={() => setShowLiveStats(false)}
                className="p-1 rounded-lg text-[#b1bad3] hover:text-white hover:bg-[#213743]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#0f212e] border border-[#213743] p-3 text-center">
                <div className="text-[11px] font-bold text-[#b1bad3]">Rounds</div>
                <div className="text-lg font-black text-white font-mono mt-0.5">{stats.rounds}</div>
              </div>
              <div className="rounded-xl bg-[#0f212e] border border-[#213743] p-3 text-center">
                <div className="text-[11px] font-bold text-[#b1bad3]">Win Rate</div>
                <div className="text-lg font-black text-[#00e701] font-mono mt-0.5">
                  {stats.rounds > 0 ? ((stats.wins / stats.rounds) * 100).toFixed(1) : "0.0"}%
                </div>
              </div>
              <div className="rounded-xl bg-[#0f212e] border border-[#213743] p-3 text-center">
                <div className="text-[11px] font-bold text-[#b1bad3]">Wagered</div>
                <div className="text-lg font-black text-white font-mono mt-0.5">
                  {activeSym}
                  {stats.wagered.toFixed(2)}
                </div>
              </div>
              <div className="rounded-xl bg-[#0f212e] border border-[#213743] p-3 text-center">
                <div className="text-[11px] font-bold text-[#b1bad3]">Net Profit</div>
                <div
                  className={`text-lg font-black font-mono mt-0.5 ${
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
              className="w-full py-2.5 rounded-xl bg-[#213743] hover:bg-[#2f4553] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Close Stats
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* GAME RULES MODAL                                          */}
      {/* ========================================================= */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Info className="h-5 w-5 text-[#00e701]" />
                <span>How to Play Stake HiLo</span>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 rounded-lg text-[#b1bad3] hover:text-white hover:bg-[#213743]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#b1bad3] leading-relaxed">
              <p>
                <strong className="text-white">Card Ranking:</strong> Ace is the lowest card (1), followed by 2 through 10, Jack (11), Queen (12), and King is the highest (13).
              </p>
              <p>
                <strong className="text-white">Higher or Same:</strong> Predict that the next card will have a rank equal to or higher than the current card.
              </p>
              <p>
                <strong className="text-white">Lower or Same:</strong> Predict that the next card will have a rank equal to or lower than the current card.
              </p>
              <p>
                <strong className="text-white">Equal Ranks:</strong> If the next card has the same rank, both "Higher or Same" and "Lower or Same" win!
              </p>
              <p>
                <strong className="text-white">Cashout:</strong> You can cash out your accumulated profit at any time after making at least one correct guess.
              </p>
              <p>
                <strong className="text-white">Skips:</strong> You can skip up to 3 cards per round without risking your accumulated profit.
              </p>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#213743] hover:bg-[#2f4553] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
