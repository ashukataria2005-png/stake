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
// 1. FLOATING 3D SILVER CHROME GIFT BOX WITH COLOR-CODED SATIN RIBBON
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
    <div className="absolute -top-9 left-1/2 -translate-x-1/2 w-28 h-28 pointer-events-none z-20 flex flex-col items-center justify-center select-none">
      {/* Ambient radial floor shadow on card roof */}
      <div className="absolute bottom-1 w-20 h-4 bg-black/50 blur-[6px] rounded-full" />

      {/* 3D Chrome Cube & Satin Bow Render */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Chrome Cube Gradients */}
          <linearGradient id="chrome-top" x1="50" y1="18" x2="50" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <linearGradient id="chrome-left" x1="16" y1="35" x2="50" y2="82" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="50%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <linearGradient id="chrome-right" x1="50" y1="35" x2="84" y2="82" gradientUnits="userSpaceOnUse">
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
        <path d="M 16 35 L 50 50 L 50 82 L 16 67 Z" fill="url(#chrome-left)" />
        <path d="M 50 50 L 84 35 L 84 67 L 50 82 Z" fill="url(#chrome-right)" />

        {/* 2. Vertical Ribbons on Base */}
        <path d="M 30 41 L 37 44 L 37 76 L 30 73 Z" fill={`url(#${ribbonStyles.gradId})`} />
        <path d="M 63 44 L 70 41 L 70 73 L 63 76 Z" fill={`url(#${ribbonStyles.gradId})`} />

        {/* 3. Horizontal Ribbons Across Base */}
        <path d="M 16 52 L 50 67 L 84 52 L 84 57 L 50 72 L 16 57 Z" fill={`url(#${ribbonStyles.gradId})`} opacity="0.95" />

        {/* 4. Chrome Lid (3D Overhang) */}
        <path d="M 13 32 L 50 48 L 50 53 L 13 37 Z" fill="#64748b" />
        <path d="M 50 48 L 87 32 L 87 37 L 50 53 Z" fill="#94a3b8" />
        <path d="M 50 18 L 87 32 L 50 48 L 13 32 Z" fill="url(#chrome-top)" />

        {/* 5. Crossing Ribbons on Lid */}
        <path d="M 28 24 L 35 27 L 72 42 L 65 39 Z" fill={`url(#${ribbonStyles.gradId})`} />
        <path d="M 28 40 L 35 37 L 72 22 L 65 25 Z" fill={`url(#${ribbonStyles.gradId})`} />

        {/* 6. Realistic 3D Silk Ribbon Bow on Top */}
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
        <g transform="translate(50, 62)">
          <circle cx="0" cy="1" r="11" fill="#000000" opacity="0.45" />
          <circle cx="0" cy="0" r="10" fill={`url(#${ribbonStyles.tagGradId})`} stroke={ribbonStyles.shine} strokeWidth="1" />
          <circle cx="0" cy="0" r="8" fill="#0f212e" opacity="0.9" />
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
// 2. AVAILABLE BONUSES POP-OUT CARDS & RUBY GRAPHIC (SCREENSHOT 26)
// ============================================================================
function AvailableBonusesGraphic() {
  return (
    <div className="absolute -top-5 right-2 sm:right-4 w-32 sm:w-36 pointer-events-none select-none overflow-visible">
      <svg
        viewBox="0 0 130 110"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="banner-card-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.7" />
          </filter>
          <linearGradient id="ruby-crimson" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff4d6d" />
            <stop offset="40%" stopColor="#e60039" />
            <stop offset="100%" stopColor="#800020" />
          </linearGradient>
        </defs>

        {/* Ambient Floor Shadow */}
        <ellipse cx="65" cy="95" rx="42" ry="8" fill="#000000" opacity="0.5" />

        {/* Card 1: Ace of Clubs (Tilted Left) */}
        <g transform="translate(45, 52) rotate(-14) translate(-25, -36)" filter="url(#banner-card-shadow)">
          <rect x="0" y="0" width="46" height="64" rx="5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
          <text x="5" y="12" fill="#0f172a" fontSize="9" fontWeight="900">A</text>
          <text x="5" y="20" fill="#0f172a" fontSize="8">♣</text>
          <text x="23" y="42" textAnchor="middle" fill="#0f172a" fontSize="20">♣</text>
        </g>

        {/* Card 2: Ace of Hearts (Tilted Right & Physically Popping Above Top Edge) */}
        <g transform="translate(76, 44) rotate(14) translate(-25, -36)" filter="url(#banner-card-shadow)">
          <rect x="0" y="0" width="46" height="64" rx="5" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
          <text x="5" y="12" fill="#dc2626" fontSize="9" fontWeight="900">A</text>
          <text x="5" y="20" fill="#dc2626" fontSize="8">♥</text>
          <text x="23" y="42" textAnchor="middle" fill="#dc2626" fontSize="20">♥</text>
        </g>

        {/* Sparkling Ruby Gem In Foreground */}
        <g transform="translate(64, 76) scale(0.95)" filter="url(#banner-card-shadow)">
          <polygon points="-12,-6 12,-6 16,2 -16,2" fill="#ff758f" />
          <polygon points="-16,2 0,14 16,2" fill="url(#ruby-crimson)" />
          <polygon points="-7,2 0,14 7,2" fill="#ff4d6d" opacity="0.9" />
          <circle cx="-3" cy="0" r="1.2" fill="#ffffff" />
          <path d="M 8 -3 L 9 -6 L 10 -3 L 13 -2 L 10 -1 L 9 2 L 8 -1 L 5 -2 Z" fill="#ffffff" opacity="0.95" />
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
    const cardWidth = 240; // ~230px card + gap
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
      {/* 1. COMPACT 4 MAIN BONUS CARDS (ZERO EMPTY SPACE, EXACT GRADIENTS) */}
      {/* ------------------------------------------------------------- */}
      <div className="relative overflow-visible">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory gap-3 sm:gap-4 px-2 sm:px-4 pt-12 pb-5 items-center overflow-y-visible select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {WELCOME_BONUSES.map((bonus) => (
            <div
              key={bonus.id}
              data-bonus-card
              className={`w-[215px] sm:w-[230px] h-[275px] sm:h-[285px] shrink-0 snap-center rounded-[24px] relative overflow-visible pt-[82px] pb-4 px-4 flex flex-col items-center justify-start gap-1.5 border border-white/10 shadow-xl transition-transform duration-200 hover:-translate-y-1 bg-gradient-to-b ${bonus.bgGradient}`}
            >
              {/* Floating 3D Silver Chrome Gift Box */}
              <GiftBox3D theme={bonus.theme} />

              {/* 1. Main Offer Text */}
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="text-[21px] font-black text-white tracking-tight">
                  {bonus.bonusPercent} + {bonus.freeSpins}
                </span>
                <span className="text-white/60 text-xs cursor-pointer hover:text-white" title="Bonus info">
                  ⓘ
                </span>
              </div>

              {/* 2. Subtitle */}
              <p className="text-[11px] font-medium text-white/65 -mt-0.5 mb-1">
                {bonus.depositTier}
              </p>

              {/* 3. Countdown Timer Pill */}
              <div className="bg-black/25 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-bold text-white tracking-wider font-mono border border-white/5 mb-3.5">
                {formattedTimer}
              </div>

              {/* 4. Action Button (Centered & Immediate) */}
              <div className="w-full mt-auto">
                {bonus.isUnlocked ? (
                  <button
                    onClick={() => handleReceiveBonus(bonus)}
                    className="w-full bg-white text-black font-extrabold py-2.5 rounded-xl text-sm shadow-md hover:bg-neutral-100 active:scale-95 transition-transform cursor-pointer"
                  >
                    Receive
                  </button>
                ) : (
                  <div className="w-full bg-white/10 backdrop-blur-xs py-2.5 rounded-xl flex items-center justify-center text-white/40 cursor-not-allowed">
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
      {/* 2. AVAILABLE BONUSES 100% BANNER (SCREENSHOT 26) */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-[#28496e] to-[#1a324d] rounded-2xl p-4 sm:p-5 relative overflow-visible shadow-lg border border-white/5 mt-6">
        {/* Pop-Out Playing Cards & Ruby Graphic */}
        <AvailableBonusesGraphic />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 relative max-w-[calc(100%-110px)] sm:max-w-none">
          <div className="space-y-1.5 text-left">
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

            <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
              100% casino bonus
            </h3>
            <p className="text-xs sm:text-sm text-white/80 max-w-[280px] sm:max-w-md leading-relaxed">
              Deposit from ₹300 &amp; get a bonus + 70 FS as a gift
            </p>
          </div>

          <div className="sm:self-end shrink-0">
            <button
              onClick={() => handleReceiveBonus()}
              className="bg-white hover:bg-neutral-100 text-black font-extrabold px-6 py-2.5 rounded-xl text-sm shadow-md active:scale-95 transition-transform cursor-pointer"
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
