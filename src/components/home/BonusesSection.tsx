"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Gift,
  Clock,
  Lock,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Info,
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
    freeSpins: "+ 70FS",
    theme: "gold",
    isUnlocked: true,
    bgGradient: "from-[#8f6d3f] to-[#5a4427]",
  },
  {
    id: "bonus-2",
    depositTier: "2nd deposit",
    bonusPercent: "120%",
    freeSpins: "+ 100FS",
    theme: "teal",
    isUnlocked: false,
    bgGradient: "from-[#215a72] to-[#123645]",
  },
  {
    id: "bonus-3",
    depositTier: "3rd deposit",
    bonusPercent: "130%",
    freeSpins: "+ 150FS",
    theme: "blue",
    isUnlocked: false,
    bgGradient: "from-[#2a4d7d] to-[#172d4b]",
  },
  {
    id: "bonus-4",
    depositTier: "4th deposit",
    bonusPercent: "150%",
    freeSpins: "+ 180FS",
    theme: "purple",
    isUnlocked: false,
    bgGradient: "from-[#69427b] to-[#422550]",
  },
];

// ============================================================================
// 1. SILVER METALLIC 3D GIFT BOX WITH COLOR-CODED ACCENT RIBBON & % TAG
// ============================================================================
function GiftBox3D({ theme }: { theme: "gold" | "teal" | "blue" | "purple" }) {
  const ribbonDefs = {
    gold: {
      ribbonGrad: "url(#ribbon-gold)",
      shine: "#fef08a",
      tagGrad: "url(#tag-gold)",
      tagBorder: "#fde047",
      tagText: "#451a03",
    },
    teal: {
      ribbonGrad: "url(#ribbon-teal)",
      shine: "#a5f3fc",
      tagGrad: "url(#tag-teal)",
      tagBorder: "#5eead4",
      tagText: "#042f2e",
    },
    blue: {
      ribbonGrad: "url(#ribbon-blue)",
      shine: "#bfdbfe",
      tagGrad: "url(#tag-blue)",
      tagBorder: "#93c5fd",
      tagText: "#172554",
    },
    purple: {
      ribbonGrad: "url(#ribbon-purple)",
      shine: "#f3e8ff",
      tagGrad: "url(#tag-purple)",
      tagBorder: "#d8b4fe",
      tagText: "#3b0764",
    },
  }[theme];

  return (
    <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-36 h-36 z-20 pointer-events-none select-none filter drop-shadow-[0_16px_24px_rgba(0,0,0,0.6)] transition-transform duration-300 group-hover:scale-105">
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Silver Metallic Box Gradients */}
          <linearGradient id="silver-lid-top" x1="60" y1="20" x2="60" y2="58" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <linearGradient id="silver-lid-left" x1="16" y1="41" x2="60" y2="66" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>
          <linearGradient id="silver-lid-right" x1="60" y1="41" x2="104" y2="66" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
          <linearGradient id="silver-box-left" x1="20" y1="45" x2="60" y2="94" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="60%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <linearGradient id="silver-box-right" x1="60" y1="45" x2="100" y2="94" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f1f5f9" />
            <stop offset="60%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>

          {/* Gold Satin Ribbon */}
          <linearGradient id="ribbon-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          <linearGradient id="tag-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fef9c3" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>

          {/* Teal Satin Ribbon */}
          <linearGradient id="ribbon-teal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a5f3fc" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0f766e" />
          </linearGradient>
          <linearGradient id="tag-teal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ccfbf1" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>

          {/* Royal Blue Satin Ribbon */}
          <linearGradient id="ribbon-blue" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#bfdbfe" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="tag-blue" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#dbeafe" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>

          {/* Purple Satin Ribbon */}
          <linearGradient id="ribbon-purple" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f3e8ff" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#6b21a8" />
          </linearGradient>
          <linearGradient id="tag-purple" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#faf5ff" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>

        {/* Ambient Ground Shadow */}
        <ellipse cx="60" cy="99" rx="36" ry="9" fill="#000000" opacity="0.65" />

        {/* Silver Metallic Base (Left & Right Faces) */}
        <path d="M 20 45 L 60 62 L 60 94 L 20 77 Z" fill="url(#silver-box-left)" />
        <path d="M 60 62 L 100 45 L 100 77 L 60 94 Z" fill="url(#silver-box-right)" />

        {/* Vertical Base Ribbons */}
        <path d="M 36 52 L 44 55 L 44 87 L 36 84 Z" fill={ribbonDefs.ribbonGrad} />
        <path d="M 76 55 L 84 52 L 84 84 L 76 87 Z" fill={ribbonDefs.ribbonGrad} />
        {/* Horizontal Base Ribbon */}
        <path d="M 20 59 L 60 76 L 100 59 L 100 66 L 60 83 L 20 66 Z" fill={ribbonDefs.ribbonGrad} opacity="0.95" />

        {/* Silver Lid (3D Overhang) */}
        <path d="M 16 41 L 60 59 L 60 66 L 16 48 Z" fill="url(#silver-lid-left)" />
        <path d="M 60 59 L 104 41 L 104 48 L 60 66 Z" fill="url(#silver-lid-right)" />
        <path d="M 60 23 L 104 41 L 60 59 L 16 41 Z" fill="url(#silver-lid-top)" />

        {/* Crossing Ribbons on Lid */}
        <path d="M 34 30 L 42 34 L 86 52 L 78 48 Z" fill={ribbonDefs.ribbonGrad} />
        <path d="M 34 50 L 42 46 L 86 28 L 78 32 Z" fill={ribbonDefs.ribbonGrad} />

        {/* Satin Ribbon Bow on Top */}
        <path
          d="M 60 38 C 45 15, 26 22, 42 36 C 50 43, 56 40, 60 38 Z"
          fill={ribbonDefs.ribbonGrad}
          stroke={ribbonDefs.shine}
          strokeWidth="0.8"
        />
        <path
          d="M 60 38 C 75 15, 94 22, 78 36 C 70 43, 64 40, 60 38 Z"
          fill={ribbonDefs.ribbonGrad}
          stroke={ribbonDefs.shine}
          strokeWidth="0.8"
        />
        <ellipse cx="60" cy="38" rx="6.5" ry="5.5" fill={ribbonDefs.shine} />
        <ellipse cx="60" cy="38" rx="5" ry="4" fill={ribbonDefs.ribbonGrad} />

        {/* Floating 3D '%' Tag / Medallion in Front */}
        <g transform="translate(60, 72)">
          <circle cx="0" cy="2" r="14" fill="#000000" opacity="0.5" />
          <circle cx="0" cy="0" r="13" fill={ribbonDefs.tagGrad} stroke={ribbonDefs.tagBorder} strokeWidth="1.5" />
          <circle cx="0" cy="0" r="10.5" fill="#0f212e" opacity="0.9" />
          <text
            x="0"
            y="4.5"
            textAnchor="middle"
            fill={ribbonDefs.tagBorder}
            fontSize="12"
            fontWeight="900"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            %
          </text>
        </g>

        {/* Sparkle Glint */}
        <path
          d="M 92 24 L 94 18 L 96 24 L 102 26 L 96 28 L 94 34 L 92 28 L 86 26 Z"
          fill="#ffffff"
          opacity="0.9"
        />
      </svg>
    </div>
  );
}

// ============================================================================
// 2. POP-OUT PLAYING CARDS (ACE OF CLUBS & ACE OF HEARTS) + RUBY GEM
// ============================================================================
function PopOutCardsAndRuby() {
  return (
    <div className="absolute -top-6 right-3 sm:right-6 w-32 h-36 sm:w-40 sm:h-44 pointer-events-none select-none overflow-visible">
      <svg
        viewBox="0 0 140 140"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="pop-card-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#000000" floodOpacity="0.75" />
          </filter>
          <linearGradient id="pop-ruby-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff4d6d" />
            <stop offset="40%" stopColor="#e60039" />
            <stop offset="100%" stopColor="#800020" />
          </linearGradient>
          <linearGradient id="pop-ruby-facet" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff758f" />
            <stop offset="100%" stopColor="#c9184a" />
          </linearGradient>
        </defs>

        {/* Ambient Ground Shadow */}
        <ellipse cx="70" cy="120" rx="50" ry="10" fill="#000000" opacity="0.6" />

        {/* 1. Card 1 (Ace of Clubs ♣) - Tilted Left */}
        <g transform="translate(50, 60) rotate(-14) translate(-32, -48)" filter="url(#pop-card-shadow)">
          <rect
            x="0"
            y="0"
            width="54"
            height="76"
            rx="7"
            fill="#f8fafc"
            stroke="#cbd5e1"
            strokeWidth="1.2"
          />
          {/* Top-left corner */}
          <text x="6" y="14" fill="#0f172a" fontSize="11" fontWeight="900" fontFamily="sans-serif">
            A
          </text>
          <text x="6" y="24" fill="#0f172a" fontSize="10" fontFamily="sans-serif">
            ♣
          </text>
          {/* Big Center Club ♣ */}
          <text x="27" y="50" textAnchor="middle" fill="#0f172a" fontSize="26" fontFamily="sans-serif">
            ♣
          </text>
        </g>

        {/* 2. Card 2 (Ace of Hearts ♥) - Tilted Right & Popping Outside Top Rim */}
        <g transform="translate(85, 54) rotate(14) translate(-30, -48)" filter="url(#pop-card-shadow)">
          <rect
            x="0"
            y="0"
            width="54"
            height="76"
            rx="7"
            fill="#ffffff"
            stroke="#e2e8f0"
            strokeWidth="1.2"
          />
          {/* Top-left corner */}
          <text x="6" y="14" fill="#dc2626" fontSize="11" fontWeight="900" fontFamily="sans-serif">
            A
          </text>
          <text x="6" y="24" fill="#dc2626" fontSize="10" fontFamily="sans-serif">
            ♥
          </text>
          {/* Big Center Heart ♥ */}
          <text x="27" y="50" textAnchor="middle" fill="#dc2626" fontSize="26" fontFamily="sans-serif">
            ♥
          </text>
        </g>

        {/* 3. 3D Faceted Ruby Gem in Foreground */}
        <g transform="translate(70, 94) scale(1.15)" filter="url(#pop-card-shadow)">
          <ellipse cx="0" cy="18" rx="20" ry="5" fill="#000000" opacity="0.6" />

          {/* Faceted Ruby Contour */}
          <polygon points="-12,-8 12,-8 18,2 -18,2" fill="url(#pop-ruby-facet)" />
          <polygon points="-18,2 -12,-8 -6,-8" fill="#ff758f" opacity="0.8" />
          <polygon points="18,2 12,-8 6,-8" fill="#a4133c" opacity="0.9" />
          <polygon points="-18,2 0,16 18,2" fill="url(#pop-ruby-grad)" />
          <polygon points="-8,2 0,16 8,2" fill="#ff4d6d" opacity="0.9" />
          <polygon points="-18,2 -8,2 0,16" fill="#800f2f" />
          <polygon points="18,2 8,2 0,16" fill="#c9184a" />

          {/* Sparkle Glint */}
          <circle cx="-5" cy="0" r="1.5" fill="#ffffff" />
          <path
            d="M 10 -4 L 11.5 -8 L 13 -4 L 17 -2.5 L 13 -1 L 11.5 3 L 10 -1 L 6 -2.5 Z"
            fill="#ffffff"
            opacity="0.9"
          />
        </g>
      </svg>
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
    const cardWidth = 276; // 260px card + 16px gap
    const newIndex = Math.min(
      WELCOME_BONUSES.length - 1,
      Math.max(0, Math.round(scrollLeft / cardWidth))
    );
    setActiveCardIndex(newIndex);
  };

  return (
    <section className="space-y-6 pt-2 pb-8 overflow-visible">
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
      {/* 1. 4 MAIN BONUS CARDS (FIXED DIMS, EXACT GRADIENTS & 3D GIFT BOXES) */}
      {/* ------------------------------------------------------------- */}
      <div className="relative overflow-visible">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-3 sm:px-6 pt-16 pb-6 items-center overflow-y-visible select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {WELCOME_BONUSES.map((bonus, idx) => (
            <div
              key={bonus.id}
              data-bonus-card
              className={`group w-[260px] min-h-[340px] shrink-0 snap-center rounded-[28px] relative pt-20 pb-5 px-4 flex flex-col items-center justify-between overflow-visible shadow-2xl transition-transform duration-300 hover:-translate-y-1 bg-gradient-to-b ${bonus.bgGradient}`}
            >
              {/* Silver Metallic 3D Floating Gift Box with Accent Ribbon */}
              <GiftBox3D theme={bonus.theme} />

              {/* Text Typography & Timer (Exact scale per screenshot) */}
              <div className="w-full flex flex-col items-center text-center mt-2 z-10">
                {/* Main Offer Text */}
                <div className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-1.5">
                  <span>
                    {bonus.bonusPercent} {bonus.freeSpins}
                  </span>
                  <Info className="w-3.5 h-3.5 text-white/60 hover:text-white cursor-pointer transition-colors" />
                </div>

                {/* Deposit Subtitle */}
                <div className="text-xs font-semibold text-white/70 mt-1 mb-3">
                  {bonus.depositTier}
                </div>

                {/* Countdown Timer Badge */}
                <div className="rounded-full bg-black/25 px-3 py-1 text-xs font-bold text-white tracking-widest font-mono shadow-inner">
                  {formattedTimer}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full z-10 mt-4">
                {bonus.isUnlocked ? (
                  <button
                    onClick={() => handleReceiveBonus(bonus)}
                    className="w-full bg-white text-black font-extrabold py-3 rounded-2xl text-sm shadow-md active:scale-95 hover:bg-neutral-100 transition-all cursor-pointer"
                  >
                    Receive
                  </button>
                ) : (
                  <div className="w-full bg-white/10 text-white/40 py-3 rounded-2xl flex items-center justify-center cursor-not-allowed select-none">
                    <Lock className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Pagination Dots Indicator */}
        <div className="flex items-center justify-center gap-2 pt-1 pb-2">
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
      {/* 2. "AVAILABLE BONUSES" CARD & POP-OUT PLAYING CARDS */}
      {/* ------------------------------------------------------------- */}
      <div className="relative mt-8 pt-4 overflow-visible">
        <div className="bg-gradient-to-r from-[#2c4b70] to-[#1c324e] rounded-2xl p-5 sm:p-6 relative overflow-visible shadow-xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          {/* Pop-Out Playing Cards & Ruby Graphic */}
          <PopOutCardsAndRuby />

          {/* Left Text Block */}
          <div className="space-y-2 text-left z-10 max-w-[calc(100%-120px)] sm:max-w-md">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-white bg-white/15 px-2.5 py-0.5 rounded-full border border-white/20">
                <span>To be claimed</span>
                <Info className="w-3 h-3 text-white/80" />
              </span>

              <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-white bg-black/30 px-3 py-0.5 rounded-full border border-white/10 tracking-widest">
                <Clock className="w-3 h-3 text-[#fbbf24]" />
                <span>{formattedTimer}</span>
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              100% casino bonus
            </h3>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              Deposit from ₹300 &amp; get a bonus + 70 FS as a gift
            </p>
          </div>

          {/* White Action Button aligned to right */}
          <div className="z-10 sm:self-end">
            <button
              onClick={() => handleReceiveBonus()}
              className="w-full sm:w-auto bg-white hover:bg-neutral-100 text-black font-extrabold px-7 py-2.5 rounded-2xl text-sm shadow-md active:scale-95 transition-all cursor-pointer"
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
