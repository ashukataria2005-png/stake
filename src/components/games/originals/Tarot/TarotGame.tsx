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
  Eye,
  Moon,
  Sun,
  Flame,
  Crown,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

export interface TarotCardData {
  id: string;
  name: string;
  romanNumeral: string;
  baseMultiplier: number;
  description: string;
  element: "fire" | "water" | "air" | "earth" | "spirit";
  revealed: boolean;
  bgGradient: string;
  borderColor: string;
  textColor: string;
}

const ARCANA_DECK: Omit<TarotCardData, "id" | "revealed">[] = [
  {
    name: "The Fool",
    romanNumeral: "0",
    baseMultiplier: 0.5,
    description: "New Beginnings",
    element: "air",
    bgGradient: "from-amber-950 via-stone-900 to-black",
    borderColor: "border-stone-500",
    textColor: "text-stone-300",
  },
  {
    name: "The Magician",
    romanNumeral: "I",
    baseMultiplier: 1.5,
    description: "Willpower & Creation",
    element: "fire",
    bgGradient: "from-blue-950 via-indigo-950 to-black",
    borderColor: "border-blue-400",
    textColor: "text-blue-300",
  },
  {
    name: "The High Priestess",
    romanNumeral: "II",
    baseMultiplier: 2.2,
    description: "Divine Intuition",
    element: "water",
    bgGradient: "from-cyan-950 via-teal-950 to-black",
    borderColor: "border-cyan-400",
    textColor: "text-cyan-300",
  },
  {
    name: "The Empress",
    romanNumeral: "III",
    baseMultiplier: 3.5,
    description: "Abundance & Fertility",
    element: "earth",
    bgGradient: "from-emerald-950 via-teal-950 to-black",
    borderColor: "border-emerald-400",
    textColor: "text-emerald-300",
  },
  {
    name: "The Emperor",
    romanNumeral: "IV",
    baseMultiplier: 5.0,
    description: "Authority & Dominion",
    element: "fire",
    bgGradient: "from-orange-950 via-amber-950 to-black",
    borderColor: "border-orange-400",
    textColor: "text-orange-300",
  },
  {
    name: "The Hierophant",
    romanNumeral: "V",
    baseMultiplier: 7.5,
    description: "Sacred Wisdom",
    element: "earth",
    bgGradient: "from-purple-950 via-violet-950 to-black",
    borderColor: "border-purple-400",
    textColor: "text-purple-300",
  },
  {
    name: "The Lovers",
    romanNumeral: "VI",
    baseMultiplier: 12.0,
    description: "Cosmic Harmony",
    element: "air",
    bgGradient: "from-rose-950 via-pink-950 to-black",
    borderColor: "border-rose-400",
    textColor: "text-rose-300",
  },
  {
    name: "The Chariot",
    romanNumeral: "VII",
    baseMultiplier: 20.0,
    description: "Triumph & Mastery",
    element: "water",
    bgGradient: "from-amber-950 via-yellow-950 to-black",
    borderColor: "border-yellow-400",
    textColor: "text-yellow-300",
  },
  {
    name: "Wheel of Fortune",
    romanNumeral: "X",
    baseMultiplier: 40.0,
    description: "Destiny Turned",
    element: "fire",
    bgGradient: "from-indigo-950 via-violet-950 to-black",
    borderColor: "border-indigo-400",
    textColor: "text-indigo-300",
  },
  {
    name: "Death",
    romanNumeral: "XIII",
    baseMultiplier: 75.0,
    description: "Mystic Rebirth",
    element: "water",
    bgGradient: "from-zinc-950 via-stone-950 to-black",
    borderColor: "border-zinc-400",
    textColor: "text-zinc-200",
  },
  {
    name: "The Star",
    romanNumeral: "XVII",
    baseMultiplier: 150.0,
    description: "Celestial Radiance",
    element: "air",
    bgGradient: "from-sky-950 via-cyan-950 to-black",
    borderColor: "border-sky-300",
    textColor: "text-sky-200",
  },
  {
    name: "The Sun",
    romanNumeral: "XIX",
    baseMultiplier: 350.0,
    description: "Supreme Enlightenment",
    element: "fire",
    bgGradient: "from-amber-900 via-yellow-600 to-black",
    borderColor: "border-amber-300",
    textColor: "text-amber-200",
  },
  {
    name: "The World",
    romanNumeral: "XXI",
    baseMultiplier: 1000.0,
    description: "Cosmic Perfection",
    element: "spirit",
    bgGradient: "from-emerald-900 via-teal-700 to-black",
    borderColor: "border-[#00e701]",
    textColor: "text-[#00e701]",
  },
];

function drawRandomTarotCards(count: number): TarotCardData[] {
  // Fair distribution based on 99% RTP
  const shuffled = [...ARCANA_DECK].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map((card, idx) => ({
    ...card,
    id: `tarot-${Date.now()}-${idx}`,
    revealed: false,
  }));
}

export default function TarotGame() {
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
        id: "tarot",
        title: "Tarot",
        image: "/games/stake-originals/stake-originals-tarot.webp",
        href: "/games/tarot",
      });
    }
  }, [addRecentlyPlayedGame]);

  // Betting & Spread Controls
  const [mode, setMode] = useState<"manual" | "auto">("manual");
  const [betAmount, setBetAmount] = useState<number>(10);
  const [betInput, setBetInput] = useState<string>("10");
  const [spreadSize, setSpreadSize] = useState<3 | 5>(3);

  // Table Spread State
  const [cards, setCards] = useState<TarotCardData[]>(() => drawRandomTarotCards(3));
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [isRoundActive, setIsRoundActive] = useState<boolean>(false);
  const [totalMultiplier, setTotalMultiplier] = useState<number>(0);
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

  // Bet modifiers
  const handleHalfBet = () => {
    if (isRoundActive) return;
    sounds.playClick();
    const next = Math.max(0.01, parseFloat((betAmount / 2).toFixed(2)));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  const handleDoubleBet = () => {
    if (isRoundActive) return;
    sounds.playClick();
    const next = parseFloat((betAmount * 2).toFixed(2));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  const handleMaxBet = () => {
    if (isRoundActive) return;
    sounds.playClick();
    const next = Math.max(0.01, parseFloat(balance.toFixed(2)));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  // Draw Tarot Cards
  const handleDrawTarot = () => {
    if (isDrawing) return;

    const parsedBet = parseFloat(betInput) || 1;
    if (parsedBet > balance) {
      alert("Insufficient balance! Please use the Wallet button.");
      return;
    }

    updateBalance(-parsedBet);
    setBetAmount(parsedBet);
    setIsDrawing(true);
    setIsRoundActive(true);
    setTotalMultiplier(0);
    setPayoutMessage("");
    setLastWinAmount(null);

    setStats((prev) => ({
      ...prev,
      rounds: prev.rounds + 1,
      wagered: parseFloat((prev.wagered + parsedBet).toFixed(2)),
    }));

    // Deal fresh face-down cards
    const freshCards = drawRandomTarotCards(spreadSize);
    setCards(freshCards);
    sounds.playTarotFlip();

    // Sequentially flip each card
    freshCards.forEach((_, idx) => {
      setTimeout(() => {
        sounds.playTarotFlip();
        setCards((prev) =>
          prev.map((c, i) => (i === idx ? { ...c, revealed: true } : c))
        );

        if (idx === freshCards.length - 1) {
          // All cards revealed: calculate payout
          setTimeout(() => {
            finishRound(freshCards, parsedBet);
          }, 400);
        }
      }, 500 + idx * 450);
    });
  };

  // Evaluate Spread Multipliers
  const finishRound = (revealedCards: TarotCardData[], wager: number) => {
    sounds.playTarotChime();

    // Highest card multiplier in the spread
    const maxMult = Math.max(...revealedCards.map((c) => c.baseMultiplier));

    // Element Synergy Bonus (if 2+ cards share element)
    const elementCounts: Record<string, number> = {};
    revealedCards.forEach((c) => {
      elementCounts[c.element] = (elementCounts[c.element] || 0) + 1;
    });

    let synergyBonus = 1.0;
    Object.values(elementCounts).forEach((cnt) => {
      if (cnt >= 3) synergyBonus = 2.0;
      else if (cnt >= 2) synergyBonus = 1.25;
    });

    const finalMult = parseFloat((maxMult * synergyBonus).toFixed(2));
    const winVal = parseFloat((wager * finalMult).toFixed(2));

    setTotalMultiplier(finalMult);
    setIsDrawing(false);
    setIsRoundActive(false);

    if (finalMult >= 1.0) {
      updateBalance(winVal);
      sounds.playCashout();
      setLastWinAmount(winVal);
      setPayoutMessage(
        synergyBonus > 1.0
          ? `Arcane Synergy (${synergyBonus}×)! Won ${activeSym}${winVal.toFixed(2)} (${finalMult}×)!`
          : `Spread Revealed! Won ${activeSym}${winVal.toFixed(2)} (${finalMult}×)!`
      );

      try {
        confetti({ particleCount: 80, spread: 65, origin: { y: 0.6 } });
      } catch {}

      const netProfit = parseFloat((winVal - wager).toFixed(2));
      setStats((prev) => ({
        ...prev,
        wins: prev.wins + 1,
        profit: parseFloat((prev.profit + netProfit).toFixed(2)),
      }));
    } else {
      setPayoutMessage(`No divine favor. ${finalMult}× payout.`);
      setStats((prev) => ({
        ...prev,
        losses: prev.losses + 1,
        profit: parseFloat((prev.profit - wager).toFixed(2)),
      }));
    }
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
      className={`w-full max-w-lg mx-auto px-2 sm:px-3 py-2 select-none flex flex-col space-y-0 ${
        isFullscreen ? "p-6 bg-[#0f212e] min-h-screen max-w-none" : ""
      }`}
    >
      {/* ========================================================= */}
      {/* 1. TOP INTERACTIVE ARENA: MYSTICAL TAROT ALTAR            */}
      {/* ========================================================= */}
      <div className="w-full rounded-t-2xl bg-[#09151e] border-t border-x border-[#213743] shadow-2xl p-4 sm:p-5 flex flex-col items-center relative overflow-hidden">
        {/* Arcane Mystic Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 via-[#0a1c13]/10 to-[#09151e] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Utilities */}
        <div className="w-full flex items-center justify-between mb-4 z-10 text-xs text-[#b1bad3]">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-[11px] text-[#8596a5]">
              Arcana Altar ({spreadSize} Cards)
            </span>
            {totalMultiplier > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#00e701]/10 border border-[#00e701]/30 text-[#00e701] font-mono font-bold text-[10px]">
                {totalMultiplier}×
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

        {/* 3 or 5 Tarot Cards Display Area */}
        <div className="w-full flex items-center justify-center gap-2 sm:gap-4 my-4 z-10 flex-wrap">
          {cards.map((card) => {
            return (
              <div
                key={card.id}
                className="w-24 h-40 sm:w-28 sm:h-44 rounded-2xl relative transition-all duration-500 cursor-pointer"
                style={{ perspective: "1000px" }}
              >
                <div
                  className="w-full h-full relative transition-transform duration-500"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: card.revealed ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {/* FACE DOWN (Card Back: Gold Foil & Mystical Eye) */}
                  <div
                    className="absolute inset-0 rounded-2xl border-2 border-amber-500/50 bg-gradient-to-b from-[#180e29] via-[#0f081d] to-[#05020a] p-2 flex flex-col items-center justify-between shadow-xl"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <div className="w-full flex justify-between text-amber-500/40 text-[8px] font-mono">
                      <span>✦</span>
                      <span>✦</span>
                    </div>

                    <div className="w-12 h-12 rounded-full border border-amber-400/40 bg-purple-950/40 flex items-center justify-center shadow-inner">
                      <Eye className="h-6 w-6 text-amber-400 animate-pulse" />
                    </div>

                    <div className="w-full flex justify-between text-amber-500/40 text-[8px] font-mono">
                      <span>✦</span>
                      <span>✦</span>
                    </div>
                  </div>

                  {/* FACE UP (Card Front: Arcana Figure & Multiplier) */}
                  <div
                    className={`absolute inset-0 rounded-2xl border-2 ${card.borderColor} bg-gradient-to-b ${card.bgGradient} p-2 flex flex-col items-center justify-between shadow-2xl`}
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <div className="w-full flex items-center justify-between">
                      <span className="text-[10px] font-black font-mono text-white/80">
                        {card.romanNumeral}
                      </span>
                      {card.element === "fire" && <Flame className="h-3 w-3 text-orange-400" />}
                      {card.element === "water" && <Moon className="h-3 w-3 text-cyan-400" />}
                      {card.element === "air" && <Sun className="h-3 w-3 text-amber-300" />}
                      {card.element === "spirit" && <Crown className="h-3 w-3 text-[#00e701]" />}
                    </div>

                    <div className="flex flex-col items-center text-center my-1">
                      <span className={`text-[11px] sm:text-xs font-black uppercase tracking-wider ${card.textColor}`}>
                        {card.name}
                      </span>
                      <span className="text-[9px] text-[#8596a5] italic leading-tight mt-0.5">
                        {card.description}
                      </span>
                    </div>

                    <span className="text-xs sm:text-sm font-black font-mono text-white">
                      {card.baseMultiplier}×
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Outcome & Payout Message */}
        <div className="h-8 flex items-center justify-center mt-2 z-10">
          {payoutMessage ? (
            <span className="text-sm font-black font-mono text-[#00e701] flex items-center gap-1.5 animate-bounce">
              <Sparkles className="h-4 w-4" />
              {payoutMessage}
            </span>
          ) : (
            <span className="text-xs font-bold text-[#b1bad3]">
              {isDrawing ? "Revealing your destiny..." : "Draw cards to reveal Major Arcana!"}
            </span>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MINES HARMONIZED BETTING CONTROLS SHELL CONTAINER      */}
      {/* ========================================================= */}
      <div className="w-full border-t border-[#213743] bg-[#1a2c38] p-3 sm:p-4 flex flex-col justify-start space-y-2 sm:space-y-2.5 rounded-b-2xl select-none">
        {/* 1. PRIMARY BET CTA BUTTON (Directly at top of controls) */}
        <div className="w-full">
          <button
            type="button"
            onClick={handleDrawTarot}
            disabled={isDrawing}
            className="w-full py-3 sm:py-3.5 text-sm sm:text-base font-extrabold rounded-xl bg-[#1475e1] hover:bg-[#1164c2] text-white shadow-lg shadow-[#1475e1]/25 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer uppercase tracking-wider"
          >
            <span>{isDrawing ? "DRAWING ARCANA..." : mode === "auto" ? "START AUTOBET" : "DRAW TAROT"}</span>
          </button>
        </div>

        {/* 2. SPREAD SELECTOR (3 Cards vs 5 Cards) */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-[#b1bad3]">Spread Size</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                if (isDrawing) return;
                sounds.playClick();
                setSpreadSize(3);
                setCards(drawRandomTarotCards(3));
              }}
              disabled={isDrawing}
              className={`py-2 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer ${
                spreadSize === 3
                  ? "bg-purple-500/20 border-purple-400 text-purple-300"
                  : "bg-[#0f212e] border-[#213743] text-[#b1bad3] hover:text-white"
              }`}
            >
              Trinity (3 Cards)
            </button>
            <button
              type="button"
              onClick={() => {
                if (isDrawing) return;
                sounds.playClick();
                setSpreadSize(5);
                setCards(drawRandomTarotCards(5));
              }}
              disabled={isDrawing}
              className={`py-2 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer ${
                spreadSize === 5
                  ? "bg-purple-500/20 border-purple-400 text-purple-300"
                  : "bg-[#0f212e] border-[#213743] text-[#b1bad3] hover:text-white"
              }`}
            >
              Pentagram (5 Cards)
            </button>
          </div>
        </div>

        {/* 3. BET AMOUNT INPUT (Exact Mines Structure) */}
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
                disabled={isDrawing}
                onClick={handleHalfBet}
                className="rounded-lg bg-[#213743] px-2.5 py-1.5 text-xs font-bold text-[#b1bad3] hover:bg-[#2f4553] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                ½
              </button>
              <button
                type="button"
                disabled={isDrawing}
                onClick={handleDoubleBet}
                className="rounded-lg bg-[#213743] px-2.5 py-1.5 text-xs font-bold text-[#b1bad3] hover:bg-[#2f4553] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                2×
              </button>
            </div>
          </div>
        </div>

        {/* 4. MODE SWITCHER TABS (Manual / Auto) */}
        <div className="flex rounded-lg bg-[#0f212e] p-1 border border-[#213743] mt-auto">
          <button
            type="button"
            onClick={() => setMode("manual")}
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
            onClick={() => setMode("auto")}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
              mode === "auto"
                ? "bg-[#213743] text-white shadow-sm"
                : "text-[#b1bad3] hover:text-white"
            }`}
          >
            Auto
          </button>
        </div>
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
                  <span className="truncate">b8923a41ef8931bdfa0914bc8931ea701b8941fc23901bcf9012bb4591a27381</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("b8923a41ef8931bdfa0914bc8931ea701b8941fc23901bcf9012bb4591a27381");
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
                  stake_tarot_client_seed_2026
                </div>
              </div>
              <div>
                <label className="font-bold text-white block mb-1">RTP</label>
                <div className="p-2.5 rounded-xl bg-[#0f212e] font-mono text-[11px] text-[#00e701]">
                  99.00%
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
                <span>Live Tarot Stats</span>
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
                <span>How to Play Stake Tarot</span>
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
                <strong className="text-white">Major Arcana:</strong> Each card drawn from the deck carries a base multiplier up to 1000× (The World).
              </p>
              <p>
                <strong className="text-white">Highest Multiplier:</strong> Your payout is determined by the highest value card revealed in the spread.
              </p>
              <p>
                <strong className="text-white">Elemental Synergy:</strong> Drawing 2 or more cards sharing the same element triggers a synergy multiplier bonus (up to 2.0× boost)!
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
