"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Gift,
  Clock,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

export interface BonusOffer {
  id: string;
  depositTier: string;
  bonusPercent: string;
  freeSpins: string;
  theme: "gold" | "teal" | "blue" | "purple";
  isUnlocked: boolean;
  bgGradient: string;
}

export const WELCOME_BONUSES: BonusOffer[] = [
  {
    id: "bonus-1",
    depositTier: "1st deposit",
    bonusPercent: "100%",
    freeSpins: "70FS",
    theme: "gold",
    isUnlocked: true,
    bgGradient: "from-[#84633d] via-[#735533] to-[#594025]",
  },
  {
    id: "bonus-2",
    depositTier: "2nd deposit",
    bonusPercent: "120%",
    freeSpins: "100FS",
    theme: "teal",
    isUnlocked: false,
    bgGradient: "from-[#235d75] via-[#1c4d62] to-[#133543]",
  },
  {
    id: "bonus-3",
    depositTier: "3rd deposit",
    bonusPercent: "130%",
    freeSpins: "150FS",
    theme: "blue",
    isUnlocked: false,
    bgGradient: "from-[#2a5187] via-[#21406c] to-[#172d4c]",
  },
  {
    id: "bonus-4",
    depositTier: "4th deposit",
    bonusPercent: "150%",
    freeSpins: "180FS",
    theme: "purple",
    isUnlocked: false,
    bgGradient: "from-[#633e75] via-[#50305f] to-[#3a2146]",
  },
];

// ============================================================================
// 1. 3D SILVER CHROME GIFT BOX (RESTING HALF-ABOVE TOP RIM)
// ============================================================================
function GiftBox3D({ theme }: { theme: "gold" | "teal" | "blue" | "purple" }) {
  const ribbonStyles = {
    gold: {
      gradId: "ribbon-grad-gold",
      tagGradId: "tag-grad-gold",
      from: "#e8c878",
      mid: "#cfa24d",
      to: "#b08a38",
      shine: "#fff9db",
      accent: "#fde047",
    },
    teal: {
      gradId: "ribbon-grad-teal",
      tagGradId: "tag-grad-teal",
      from: "#4dd0e1",
      mid: "#00acc1",
      to: "#00838f",
      shine: "#e0f7fa",
      accent: "#4dd0e1",
    },
    blue: {
      gradId: "ribbon-grad-blue",
      tagGradId: "tag-grad-blue",
      from: "#42a5f5",
      mid: "#1e88e5",
      to: "#1565c0",
      shine: "#e3f2fd",
      accent: "#64b5f6",
    },
    purple: {
      gradId: "ribbon-grad-purple",
      tagGradId: "tag-grad-purple",
      from: "#ba68c8",
      mid: "#8e24aa",
      to: "#6a1b9a",
      shine: "#f3e5f5",
      accent: "#ce93d8",
    },
  }[theme];

  return (
    <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-28 h-28 pointer-events-none z-20 flex flex-col items-center justify-center select-none filter drop-shadow-[0_12px_18px_rgba(0,0,0,0.65)]">
      {/* Floor Contact Occlusion Shadow */}
      <div className="absolute bottom-1.5 w-20 h-3 bg-black/60 blur-[4px] rounded-full" />

      {/* 3D Chrome Cube & Ribbon Render */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Chrome Cube Gradients */}
          <linearGradient id="chrome-box-top" x1="50" y1="18" x2="50" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#f1f5f9" />
            <stop offset="70%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <linearGradient id="chrome-box-left" x1="16" y1="35" x2="50" y2="84" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="50%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <linearGradient id="chrome-box-right" x1="50" y1="35" x2="84" y2="84" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="50%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>

          {/* Ribbon Gradients */}
          <linearGradient id={ribbonStyles.gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={ribbonStyles.from} />
            <stop offset="50%" stopColor={ribbonStyles.mid} />
            <stop offset="100%" stopColor={ribbonStyles.to} />
          </linearGradient>
          <linearGradient id={ribbonStyles.tagGradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={ribbonStyles.from} />
            <stop offset="100%" stopColor={ribbonStyles.to} />
          </linearGradient>
        </defs>

        {/* 1. Base Cube (Left & Right Faces) */}
        <path d="M 16 35 L 50 50 L 50 84 L 16 69 Z" fill="url(#chrome-box-left)" />
        <path d="M 50 50 L 84 35 L 84 69 L 50 84 Z" fill="url(#chrome-box-right)" />

        {/* 2. Vertical Ribbons on Base */}
        <path d="M 30 41 L 37 44 L 37 78 L 30 75 Z" fill={`url(#${ribbonStyles.gradId})`} />
        <path d="M 63 44 L 70 41 L 70 75 L 63 78 Z" fill={`url(#${ribbonStyles.gradId})`} />

        {/* 3. Horizontal Ribbons Across Base */}
        <path d="M 16 52 L 50 67 L 84 52 L 84 57 L 50 72 L 16 57 Z" fill={`url(#${ribbonStyles.gradId})`} opacity="0.95" />

        {/* 4. Chrome Lid (3D Overhang Lip) */}
        <path d="M 13 32 L 50 48 L 50 54 L 13 38 Z" fill="#64748b" />
        <path d="M 50 48 L 87 32 L 87 38 L 50 54 Z" fill="#94a3b8" />
        <path d="M 50 18 L 87 32 L 50 48 L 13 32 Z" fill="url(#chrome-box-top)" />

        {/* 5. Crossing Ribbons on Lid */}
        <path d="M 28 24 L 35 27 L 72 42 L 65 39 Z" fill={`url(#${ribbonStyles.gradId})`} />
        <path d="M 28 40 L 35 37 L 72 22 L 65 25 Z" fill={`url(#${ribbonStyles.gradId})`} />

        {/* 6. Satin Ribbon Bow on Top */}
        <path
          d="M 50 32 C 38 12, 22 17, 35 29 C 42 35, 47 33, 50 32 Z"
          fill={`url(#${ribbonStyles.gradId})`}
          stroke={ribbonStyles.shine}
          strokeWidth="0.8"
        />
        <path
          d="M 50 32 C 62 12, 78 17, 65 29 C 58 35, 53 33, 50 32 Z"
          fill={`url(#${ribbonStyles.gradId})`}
          stroke={ribbonStyles.shine}
          strokeWidth="0.8"
        />
        <ellipse cx="50" cy="32" rx="5.5" ry="4.5" fill={ribbonStyles.shine} />
        <ellipse cx="50" cy="32" rx="4.2" ry="3.5" fill={`url(#${ribbonStyles.gradId})`} />

        {/* 7. Embossed '%' Emblem on Front Face */}
        <g transform="translate(50, 63)">
          <circle cx="0" cy="1" r="11" fill="#000000" opacity="0.45" />
          <circle cx="0" cy="0" r="10.5" fill={`url(#${ribbonStyles.tagGradId})`} stroke={ribbonStyles.shine} strokeWidth="1" />
          <circle cx="0" cy="0" r="8.2" fill="#0f212e" opacity="0.9" />
          <text
            x="0"
            y="3.5"
            textAnchor="middle"
            fill={ribbonStyles.accent}
            fontSize="9.5"
            fontWeight="900"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            %
          </text>
        </g>
      </svg>
    </div>
  );
}

// ============================================================================
// 2. HYPER-REALISTIC PLAYING CARDS (ACE OF CLUBS & ACE OF HEARTS) + RUBY GEM
// ============================================================================
function HyperRealisticCardsAndRuby() {
  return (
    <div className="relative w-28 h-24 sm:w-36 sm:h-28 flex items-center justify-center select-none overflow-visible">
      {/* 1. Ace of Clubs ♣ (Tilted Left) */}
      <div
        className="absolute left-1 sm:left-2 top-2 w-16 h-22 sm:w-20 sm:h-28 bg-gradient-to-br from-white to-[#f0f2f5] rounded-lg border border-black/10 p-1 flex flex-col justify-between select-none shadow-[0_10px_20px_rgba(0,0,0,0.6)] -rotate-12 transition-transform hover:-rotate-8"
        style={{ transformOrigin: "bottom center" }}
      >
        <div className="flex flex-col items-center leading-none text-[#0f172a]">
          <span className="text-[11px] sm:text-[13px] font-black tracking-tighter">A</span>
          <span className="text-[10px] sm:text-[11px] leading-tight">♣</span>
        </div>
        <div className="self-center text-2xl sm:text-3xl text-[#0f172a] leading-none my-auto">
          ♣
        </div>
        <div className="flex flex-col items-center leading-none text-[#0f172a] rotate-180 self-end">
          <span className="text-[11px] sm:text-[13px] font-black tracking-tighter">A</span>
          <span className="text-[10px] sm:text-[11px] leading-tight">♣</span>
        </div>
      </div>

      {/* 2. Ace of Hearts ♥ (Tilted Right, Overlapping & Popping Slightly Out Above Rim) */}
      <div
        className="absolute right-1 sm:right-2 -top-2 w-16 h-22 sm:w-20 sm:h-28 bg-gradient-to-br from-white to-[#f0f2f5] rounded-lg border border-black/10 p-1 flex flex-col justify-between select-none shadow-[0_12px_24px_rgba(0,0,0,0.65)] rotate-12 transition-transform hover:rotate-8 z-10"
        style={{ transformOrigin: "bottom center" }}
      >
        <div className="flex flex-col items-center leading-none text-[#dc2626]">
          <span className="text-[11px] sm:text-[13px] font-black tracking-tighter">A</span>
          <span className="text-[10px] sm:text-[11px] leading-tight">♥</span>
        </div>
        <div className="self-center text-2xl sm:text-3xl text-[#dc2626] leading-none my-auto">
          ♥
        </div>
        <div className="flex flex-col items-center leading-none text-[#dc2626] rotate-180 self-end">
          <span className="text-[11px] sm:text-[13px] font-black tracking-tighter">A</span>
          <span className="text-[10px] sm:text-[11px] leading-tight">♥</span>
        </div>
      </div>

      {/* 3. Sparkling 3D Faceted Ruby Gem in Foreground */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-20 drop-shadow-[0_6px_14px_rgba(0,0,0,0.8)] pointer-events-none">
        <svg viewBox="0 0 50 42" className="w-10 h-8 sm:w-12 sm:h-10" fill="none">
          <defs>
            <linearGradient id="ruby-main-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ff4d6d" />
              <stop offset="45%" stopColor="#e60039" />
              <stop offset="100%" stopColor="#7a001e" />
            </linearGradient>
            <linearGradient id="ruby-table-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff758f" />
              <stop offset="100%" stopColor="#c9184a" />
            </linearGradient>
          </defs>

          <polygon points="12,4 38,4 46,14 4,14" fill="url(#ruby-table-grad)" />
          <polygon points="4,14 25,38 46,14" fill="url(#ruby-main-grad)" />
          <polygon points="15,14 25,38 35,14" fill="#ff4d6d" opacity="0.9" />
          <polygon points="4,14 15,14 25,38" fill="#800f2f" />
          <polygon points="46,14 35,14 25,38" fill="#c9184a" />

          <circle cx="18" cy="11" r="1.5" fill="#ffffff" />
          <path d="M 34 8 L 35.5 4 L 37 8 L 41 9.5 L 37 11 L 35.5 15 L 34 11 L 30 9.5 Z" fill="#ffffff" opacity="0.95" />
        </svg>
      </div>
    </div>
  );
}

// ============================================================================
// 3. COMPLETE FAQ ITEMS (SCREENSHOT 27 - 8 QUESTIONS)
// ============================================================================
const FAQ_QUESTIONS = [
  {
    q: "What are bonuses?",
    a: "Bonuses are promotional funds or free spins credited to your player account to boost your playtime and winning opportunities. They can be claimed through deposit matches, promo codes, or loyalty rewards, providing additional funds to wager across our full catalog of casino games.",
  },
  {
    q: "What is a bonus balance?",
    a: "A bonus balance is a separate dedicated ledger where promotional bonus money is held. Wagers are deducted from your balance according to promotional rules, and once playthrough (rollover) requirements are fulfilled, remaining bonus credits automatically convert into withdrawable cash balance.",
  },
  {
    q: "How do I receive a bonus?",
    a: "You can receive a bonus by making a qualifying deposit that meets the promotional minimum, redeeming an official promotional voucher code in the Wallet modal, or unlocking tier rewards in our VIP Club.",
  },
  {
    q: "How do I activate a bonus?",
    a: "Deposit bonuses activate automatically upon confirmed crediting of your deposit. If an offer requires manual activation, you can select it from the available promotions list or enter the corresponding promo code prior to finalizing your payment.",
  },
  {
    q: "How do I use an active bonus?",
    a: "Once active, your bonus funds can be wagered directly across eligible casino games, slots, and Stake Originals. Your progress toward fulfilling the required turnover multiplier is updated dynamically in real time.",
  },
  {
    q: "Where should I wager bonuses?",
    a: "Bonuses can be wagered across qualified slots and Stake Originals that support bonus wagering. Specific table games, live dealer rooms, or sports bets may have different or excluded contribution percentages as specified in the bonus terms.",
  },
  {
    q: "What are free spins and free bets in Crash games?",
    a: "Free spins let you spin slot reels without deducting any money from your real money balance, with winnings added to your account. Free bets in Crash games allow you to participate in a round risk-free and pocket earnings if you cash out before the crash multiplier.",
  },
  {
    q: "In which cases can a bonus be canceled?",
    a: "A bonus may be canceled if requested manually by the user, if the promotional validity window expires before rollover is satisfied, or if bonus arbitrage / unfair wagering violations of platform terms are detected.",
  },
];

// ============================================================================
// 4. MAIN BONUSES SECTION
// ============================================================================
export default function BonusesSection() {
  const { openWalletModal } = useGame();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);

  // Live countdown timer state (Days : Hours : Mins : Secs)
  const [countdown, setCountdown] = useState({
    days: 29,
    hours: 23,
    minutes: 58,
    seconds: 42,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTimer = `${String(countdown.days).padStart(2, "0")} : ${String(countdown.hours).padStart(2, "0")} : ${String(countdown.minutes).padStart(2, "0")} : ${String(countdown.seconds).padStart(2, "0")}`;

  const toggleFaq = (index: number) => {
    sounds.playClick();
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  const handleReceiveBonus = (bonus?: BonusOffer) => {
    sounds.playSuccessChime();
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch { }
    openWalletModal();
  };

  const scrollToCard = (index: number) => {
    sounds.playClick();
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const cards = container.querySelectorAll<HTMLElement>("[data-bonus-card]");
    if (cards[index]) {
      cards[index].scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
      setActiveCardIndex(index);
    }
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const cardWidth = 250; // 240px card + gap
    const newIndex = Math.min(
      WELCOME_BONUSES.length - 1,
      Math.max(0, Math.round(scrollLeft / cardWidth))
    );
    setActiveCardIndex(newIndex);
  };

  return (
    <section className="space-y-5 pt-2 pb-8 overflow-visible">
      {/* ------------------------------------------------------------- */}
      {/* HEADER WITH CONTROLS */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center justify-between gap-4 border-b border-[#213743] pb-3 px-1">
        <div>
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-[#fbbf24]" />
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Up to 500% bonuses
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-[#b1bad3] mt-0.5">
            Welcome deposit bonuses on your first 4 deposits
          </p>
        </div>

        {/* Carousel Desktop Navigation Arrows */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => scrollToCard(Math.max(0, activeCardIndex - 1))}
            disabled={activeCardIndex === 0}
            className="p-2 rounded-xl bg-[#1a2c38] hover:bg-[#213743] border border-[#213743] text-[#b1bad3] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md"
            title="Previous Bonus"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollToCard(Math.min(WELCOME_BONUSES.length - 1, activeCardIndex + 1))}
            disabled={activeCardIndex === WELCOME_BONUSES.length - 1}
            className="p-2 rounded-xl bg-[#1a2c38] hover:bg-[#213743] border border-[#213743] text-[#b1bad3] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md"
            title="Next Bonus"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. 4 MAIN BONUS CARDS (ZERO OVERLAP, PT-[115px], H-[310px]) */}
      {/* ------------------------------------------------------------- */}
      <div className="relative overflow-visible">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory gap-3 sm:gap-4 px-2 sm:px-4 pt-16 pb-5 items-center overflow-y-visible select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {WELCOME_BONUSES.map((bonus) => (
            <div
              key={bonus.id}
              data-bonus-card
              className={`w-[220px] sm:w-[240px] h-[310px] shrink-0 snap-center rounded-[28px] relative pt-[115px] pb-5 px-4 flex flex-col items-center justify-between overflow-visible shadow-xl border border-white/10 transition-transform duration-200 hover:-translate-y-1 bg-gradient-to-b ${bonus.bgGradient}`}
            >
              {/* 1. 3D Gift Box: half sits outside above the card top rim */}
              <GiftBox3D theme={bonus.theme} />

              {/* Middle Group: Offer Title, Subtitle, Countdown Timer */}
              <div className="w-full flex flex-col items-center text-center gap-1 z-10">
                {/* 2. Offer Title */}
                <div className="text-xl sm:text-[22px] font-black text-white text-center leading-tight tracking-tight flex items-center justify-center gap-1">
                  <span>{bonus.bonusPercent} + {bonus.freeSpins}</span>
                  <span className="text-white/60 text-xs cursor-pointer hover:text-white" title="Bonus info">
                    ⓘ
                  </span>
                </div>

                {/* 3. Subtitle */}
                <p className="text-xs font-medium text-white/70 -mt-0.5">
                  {bonus.depositTier}
                </p>

                {/* 4. Countdown Timer */}
                <div className="mt-1 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white tracking-widest font-mono border border-white/5 shadow-inner">
                  {formattedTimer}
                </div>
              </div>

              {/* 5. Action Button placed at the bottom */}
              <div className="w-full z-10">
                {bonus.isUnlocked ? (
                  <button
                    onClick={() => handleReceiveBonus(bonus)}
                    className="w-full bg-white text-black font-extrabold py-3 rounded-2xl text-sm shadow-md active:scale-95 hover:bg-neutral-100 transition-transform cursor-pointer"
                  >
                    Receive
                  </button>
                ) : (
                  <div className="w-full bg-white/10 text-white/40 py-3 rounded-2xl flex items-center justify-center cursor-not-allowed select-none">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Pagination Dots Indicator */}
        <div className="flex items-center justify-center gap-2 pt-1 pb-1">
          {WELCOME_BONUSES.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToCard(i)}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                activeCardIndex === i
                  ? "w-6 h-1.5 bg-[#00e701]"
                  : "w-1.5 h-1.5 bg-[#213743] hover:bg-[#557086]"
              }`}
              title={`Go to bonus ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. 100% CASINO BONUS BANNER (RESET TO SCREENSHOT 22/26 COMPACT LAYOUT) */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-[#2a496f] to-[#1a314d] rounded-2xl p-5 relative overflow-visible shadow-lg border border-white/5 mt-6">
        {/* Top-Right Absolute Playing Cards Graphic */}
        <div className="absolute -top-6 right-4 sm:right-8 w-28 sm:w-36 pointer-events-none overflow-visible z-20">
          <HyperRealisticCardsAndRuby />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 relative z-10">
          {/* Left Content Side */}
          <div className="space-y-1.5 text-left max-w-sm sm:max-w-md">
            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white/90 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
                <span>To be claimed</span>
                <span className="text-[10px]">ⓘ</span>
              </span>

              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-white bg-black/30 px-2.5 py-0.5 rounded-full border border-white/5 tracking-wider">
                <Clock className="w-3 h-3 text-[#fbbf24]" />
                <span>{formattedTimer}</span>
              </span>
            </div>

            {/* Heading */}
            <h3 className="text-xl sm:text-2xl font-black text-white mt-2 tracking-tight">
              100% casino bonus
            </h3>

            {/* Subtext */}
            <p className="text-xs sm:text-sm text-white/75 mt-1 max-w-[280px] leading-relaxed">
              Deposit from ₹300 &amp; get a bonus + 70 FS as a gift
            </p>
          </div>

          {/* Bottom-Right Solid White Action Button */}
          <div className="shrink-0 mt-3 sm:mt-0">
            <button
              onClick={() => handleReceiveBonus()}
              className="w-full sm:w-auto bg-white text-black font-extrabold px-8 py-2.5 rounded-xl text-sm shadow-md hover:bg-neutral-100 active:scale-95 transition-transform cursor-pointer"
            >
              Receive
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. COMPLETE FAQ ACCORDION (SCREENSHOT 27 - 8 QUESTIONS) */}
      {/* ------------------------------------------------------------- */}
      <div className="rounded-2xl border border-[#213743] bg-[#151f28] p-4 sm:p-5 space-y-2.5">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#b1bad3] mb-3 px-1">
          Frequently Asked Questions
        </h4>

        {FAQ_QUESTIONS.map((faq, index) => {
          const isOpen = openFaq === index;
          return (
            <div
              key={index}
              className="border border-[#213743] rounded-xl overflow-hidden bg-[#0f212e] transition-colors"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full p-3.5 sm:p-4 flex items-center justify-between text-left text-xs sm:text-sm font-bold text-white hover:bg-[#1a2c38]/60 transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-[#b1bad3] shrink-0 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#b1bad3] shrink-0 ml-2" />
                )}
              </button>

              {isOpen && (
                <div className="px-3.5 sm:px-4 pb-3.5 sm:pb-4 text-xs text-[#b1bad3] leading-relaxed border-t border-[#213743] pt-2.5 animate-in fade-in duration-150">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
