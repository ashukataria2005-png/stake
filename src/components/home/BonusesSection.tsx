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
  ArrowRight,
  Sparkles,
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
  accentColor: string;
  isUnlocked: boolean;
  bgGradient: string;
  borderGlow: string;
}

export const WELCOME_BONUSES: BonusOffer[] = [
  {
    id: "bonus-1",
    depositTier: "1st deposit",
    bonusPercent: "100%",
    freeSpins: "+ 70 FS",
    theme: "gold",
    accentColor: "#fbbf24",
    isUnlocked: true,
    bgGradient: "from-[#2e220a] via-[#1a242c] to-[#0f212e]",
    borderGlow: "border-[#d97706]/40 hover:border-[#fbbf24]",
  },
  {
    id: "bonus-2",
    depositTier: "2nd deposit",
    bonusPercent: "120%",
    freeSpins: "+ 100 FS",
    theme: "teal",
    accentColor: "#2dd4bf",
    isUnlocked: false,
    bgGradient: "from-[#082a28] via-[#162933] to-[#0f212e]",
    borderGlow: "border-[#0d9488]/40 hover:border-[#2dd4bf]",
  },
  {
    id: "bonus-3",
    depositTier: "3rd deposit",
    bonusPercent: "130%",
    freeSpins: "+ 150 FS",
    theme: "blue",
    accentColor: "#60a5fa",
    isUnlocked: false,
    bgGradient: "from-[#0b1e3b] via-[#152738] to-[#0f212e]",
    borderGlow: "border-[#2563eb]/40 hover:border-[#60a5fa]",
  },
  {
    id: "bonus-4",
    depositTier: "4th deposit",
    bonusPercent: "150%",
    freeSpins: "+ 180 FS",
    theme: "purple",
    accentColor: "#c084fc",
    isUnlocked: false,
    bgGradient: "from-[#261038] via-[#1b2533] to-[#0f212e]",
    borderGlow: "border-[#9333ea]/40 hover:border-[#c084fc]",
  },
];

// ============================================================================
// 3D POP-OUT GIFT BOX COMPONENT
// ============================================================================
function GiftBox3D({ theme }: { theme: "gold" | "teal" | "blue" | "purple" }) {
  const colorDefs = {
    gold: {
      boxTop: "url(#gold-box-top)",
      boxLeft: "url(#gold-box-left)",
      boxRight: "url(#gold-box-right)",
      ribbon: "url(#gold-ribbon)",
      ribbonShine: "#fffbeb",
      badgeBg: "url(#gold-badge-grad)",
      badgeBorder: "#fde047",
      badgeText: "#451a03",
      glow: "rgba(245, 158, 11, 0.4)",
    },
    teal: {
      boxTop: "url(#teal-box-top)",
      boxLeft: "url(#teal-box-left)",
      boxRight: "url(#teal-box-right)",
      ribbon: "url(#teal-ribbon)",
      ribbonShine: "#f0fdfa",
      badgeBg: "url(#teal-badge-grad)",
      badgeBorder: "#5eead4",
      badgeText: "#042f2e",
      glow: "rgba(20, 184, 166, 0.4)",
    },
    blue: {
      boxTop: "url(#blue-box-top)",
      boxLeft: "url(#blue-box-left)",
      boxRight: "url(#blue-box-right)",
      ribbon: "url(#blue-ribbon)",
      ribbonShine: "#eff6ff",
      badgeBg: "url(#blue-badge-grad)",
      badgeBorder: "#93c5fd",
      badgeText: "#172554",
      glow: "rgba(59, 130, 246, 0.4)",
    },
    purple: {
      boxTop: "url(#purple-box-top)",
      boxLeft: "url(#purple-box-left)",
      boxRight: "url(#purple-box-right)",
      ribbon: "url(#purple-ribbon)",
      ribbonShine: "#faf5ff",
      badgeBg: "url(#purple-badge-grad)",
      badgeBorder: "#d8b4fe",
      badgeText: "#3b0764",
      glow: "rgba(168, 85, 247, 0.4)",
    },
  }[theme];

  return (
    <div
      className="absolute -top-10 left-1/2 -translate-x-1/2 w-24 h-24 sm:w-28 sm:h-28 z-20 pointer-events-none select-none transition-transform duration-300 group-hover:scale-105"
      style={{
        filter: "drop-shadow(0 14px 22px rgba(0,0,0,0.75))",
      }}
    >
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gold Gradients */}
          <linearGradient id="gold-box-top" x1="60" y1="20" x2="60" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>
          <linearGradient id="gold-box-left" x1="18" y1="44" x2="60" y2="92" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
          <linearGradient id="gold-box-right" x1="60" y1="44" x2="102" y2="92" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>
          <linearGradient id="gold-ribbon" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="40%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          <linearGradient id="gold-badge-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fef9c3" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>

          {/* Teal Gradients */}
          <linearGradient id="teal-box-top" x1="60" y1="20" x2="60" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#a7f3d0" />
            <stop offset="50%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#0f766e" />
          </linearGradient>
          <linearGradient id="teal-box-left" x1="18" y1="44" x2="60" y2="92" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0f766e" />
            <stop offset="100%" stopColor="#042f2e" />
          </linearGradient>
          <linearGradient id="teal-box-right" x1="60" y1="44" x2="102" y2="92" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#115e59" />
          </linearGradient>
          <linearGradient id="teal-ribbon" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f0fdfa" />
            <stop offset="40%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
          <linearGradient id="teal-badge-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ccfbf1" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>

          {/* Blue Gradients */}
          <linearGradient id="blue-box-top" x1="60" y1="20" x2="60" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#bfdbfe" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="blue-box-left" x1="18" y1="44" x2="60" y2="92" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e40af" />
            <stop offset="100%" stopColor="#172554" />
          </linearGradient>
          <linearGradient id="blue-box-right" x1="60" y1="44" x2="102" y2="92" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>
          <linearGradient id="blue-ribbon" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#eff6ff" />
            <stop offset="40%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="blue-badge-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#dbeafe" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>

          {/* Purple Gradients */}
          <linearGradient id="purple-box-top" x1="60" y1="20" x2="60" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#e9d5ff" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#7e22ce" />
          </linearGradient>
          <linearGradient id="purple-box-left" x1="18" y1="44" x2="60" y2="92" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7e22ce" />
            <stop offset="100%" stopColor="#3b0764" />
          </linearGradient>
          <linearGradient id="purple-box-right" x1="60" y1="44" x2="102" y2="92" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#581c87" />
          </linearGradient>
          <linearGradient id="purple-ribbon" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#faf5ff" />
            <stop offset="40%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#7e22ce" />
          </linearGradient>
          <linearGradient id="purple-badge-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f3e8ff" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>

        {/* 1. Underlying Drop Shadow */}
        <ellipse cx="60" cy="98" rx="34" ry="10" fill="#000000" opacity="0.65" />

        {/* 2. Main Box Base (Left & Right Faces) */}
        {/* Left Face */}
        <path d="M 20 45 L 60 62 L 60 94 L 20 77 Z" fill={colorDefs.boxLeft} />
        {/* Right Face */}
        <path d="M 60 62 L 100 45 L 100 77 L 60 94 Z" fill={colorDefs.boxRight} />

        {/* 3. Base Ribbons (Wrapped vertically & horizontally around box) */}
        {/* Left Face Vertical Ribbon */}
        <path d="M 36 52 L 44 55 L 44 87 L 36 84 Z" fill={colorDefs.ribbon} />
        {/* Right Face Vertical Ribbon */}
        <path d="M 76 55 L 84 52 L 84 84 L 76 87 Z" fill={colorDefs.ribbon} />
        {/* Horizontal Ribbon Across Both Faces */}
        <path d="M 20 59 L 60 76 L 100 59 L 100 66 L 60 83 L 20 66 Z" fill={colorDefs.ribbon} opacity="0.9" />

        {/* 4. Box Lid (3D Overhang for real perspective) */}
        {/* Lid Left Rim */}
        <path d="M 16 41 L 60 59 L 60 66 L 16 48 Z" fill={colorDefs.boxLeft} />
        {/* Lid Right Rim */}
        <path d="M 60 59 L 104 41 L 104 48 L 60 66 Z" fill={colorDefs.boxRight} />
        {/* Lid Top Face */}
        <path d="M 60 23 L 104 41 L 60 59 L 16 41 Z" fill={colorDefs.boxTop} />

        {/* 5. Lid Crossing Ribbons */}
        {/* Top ribbon: back-left to front-right */}
        <path d="M 34 30 L 42 34 L 86 52 L 78 48 Z" fill={colorDefs.ribbon} />
        {/* Top ribbon: front-left to back-right */}
        <path d="M 34 50 L 42 46 L 86 28 L 78 32 Z" fill={colorDefs.ribbon} />

        {/* 6. Realistic 3D Ribbon Bow on Top */}
        {/* Left Bow Loop */}
        <path
          d="M 60 38 C 45 15, 26 22, 42 36 C 50 43, 56 40, 60 38 Z"
          fill={colorDefs.ribbon}
          stroke={colorDefs.ribbonShine}
          strokeWidth="0.8"
        />
        {/* Right Bow Loop */}
        <path
          d="M 60 38 C 75 15, 94 22, 78 36 C 70 43, 64 40, 60 38 Z"
          fill={colorDefs.ribbon}
          stroke={colorDefs.ribbonShine}
          strokeWidth="0.8"
        />
        {/* Bow Center Knot */}
        <ellipse cx="60" cy="38" rx="6.5" ry="5.5" fill={colorDefs.ribbonShine} />
        <ellipse cx="60" cy="38" rx="5" ry="4" fill={colorDefs.ribbon} />

        {/* 7. Floating 3D '%' Medallion in Front */}
        <g transform="translate(60, 72)">
          {/* Badge Drop Shadow */}
          <circle cx="0" cy="2" r="14" fill="#000000" opacity="0.5" />
          {/* Badge Outer Rim */}
          <circle cx="0" cy="0" r="13" fill={colorDefs.badgeBg} stroke={colorDefs.badgeBorder} strokeWidth="1.5" />
          {/* Inner Inset */}
          <circle cx="0" cy="0" r="10.5" fill="#0f212e" opacity="0.9" />
          {/* Bold '%' Typography */}
          <text
            x="0"
            y="4.5"
            textAnchor="middle"
            fill={colorDefs.badgeBorder}
            fontSize="12"
            fontWeight="900"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            %
          </text>
        </g>

        {/* 8. Sparkling Light Accent */}
        <path
          d="M 92 24 L 94 18 L 96 24 L 102 26 L 96 28 L 94 34 L 92 28 L 86 26 Z"
          fill="#ffffff"
          opacity="0.85"
        />
      </svg>
    </div>
  );
}

// ============================================================================
// 3D PLAYING CARDS + RUBY GEM ILLUSTRATION
// ============================================================================
function CardsAndRubyIllustration() {
  return (
    <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center select-none">
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="card-shadow" x="-20%" y="-20%" width="150%" height="150%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.6" />
          </filter>
          <linearGradient id="ruby-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff4d6d" />
            <stop offset="40%" stopColor="#e60039" />
            <stop offset="100%" stopColor="#800020" />
          </linearGradient>
          <linearGradient id="ruby-facet" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff758f" />
            <stop offset="100%" stopColor="#c9184a" />
          </linearGradient>
        </defs>

        {/* Ambient Ground Shadow */}
        <ellipse cx="60" cy="104" rx="42" ry="8" fill="#000000" opacity="0.6" />

        {/* 1. Card 1 (Ace of Clubs ♣) - Tilted Left */}
        <g transform="translate(42, 54) rotate(-14) translate(-30, -42)" filter="url(#card-shadow)">
          <rect
            x="0"
            y="0"
            width="48"
            height="68"
            rx="6"
            fill="#f8fafc"
            stroke="#cbd5e1"
            strokeWidth="1.2"
          />
          {/* Top-left corner */}
          <text x="5" y="13" fill="#0f172a" fontSize="10" fontWeight="900" fontFamily="sans-serif">
            A
          </text>
          <text x="5" y="22" fill="#0f172a" fontSize="9" fontFamily="sans-serif">
            ♣
          </text>
          {/* Big Center Club ♣ */}
          <text x="24" y="44" textAnchor="middle" fill="#0f172a" fontSize="22" fontFamily="sans-serif">
            ♣
          </text>
        </g>

        {/* 2. Card 2 (Ace of Hearts ♥) - Tilted Right */}
        <g transform="translate(68, 56) rotate(12) translate(-26, -42)" filter="url(#card-shadow)">
          <rect
            x="0"
            y="0"
            width="48"
            height="68"
            rx="6"
            fill="#ffffff"
            stroke="#e2e8f0"
            strokeWidth="1.2"
          />
          {/* Top-left corner */}
          <text x="5" y="13" fill="#dc2626" fontSize="10" fontWeight="900" fontFamily="sans-serif">
            A
          </text>
          <text x="5" y="22" fill="#dc2626" fontSize="9" fontFamily="sans-serif">
            ♥
          </text>
          {/* Big Center Heart ♥ */}
          <text x="24" y="44" textAnchor="middle" fill="#dc2626" fontSize="22" fontFamily="sans-serif">
            ♥
          </text>
        </g>

        {/* 3. 3D Faceted Ruby Gem in Foreground */}
        <g transform="translate(60, 80) scale(1.05)" filter="url(#card-shadow)">
          {/* Ruby Shadow */}
          <ellipse cx="0" cy="18" rx="18" ry="4.5" fill="#000000" opacity="0.6" />

          {/* Faceted Ruby Contour */}
          {/* Top Table */}
          <polygon points="-12,-8 12,-8 18,2 -18,2" fill="url(#ruby-facet)" />
          {/* Top Side Facets */}
          <polygon points="-18,2 -12,-8 -6,-8" fill="#ff758f" opacity="0.8" />
          <polygon points="18,2 12,-8 6,-8" fill="#a4133c" opacity="0.9" />
          {/* Bottom Pavilion Point */}
          <polygon points="-18,2 0,16 18,2" fill="url(#ruby-grad)" />
          {/* Pavilion Center Facet */}
          <polygon points="-8,2 0,16 8,2" fill="#ff4d6d" opacity="0.9" />
          {/* Left Darker Facet */}
          <polygon points="-18,2 -8,2 0,16" fill="#800f2f" />
          {/* Right Highlight Facet */}
          <polygon points="18,2 8,2 0,16" fill="#c9184a" />

          {/* Sparkle Glint on Ruby */}
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
// MAIN BONUSES SECTION
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

  // Scroll to index in horizontal carousel
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
    const cardWidth = container.clientWidth * 0.75;
    const newIndex = Math.min(
      WELCOME_BONUSES.length - 1,
      Math.max(0, Math.round(scrollLeft / (cardWidth || 280)))
    );
    setActiveCardIndex(newIndex);
  };

  return (
    <section className="space-y-6 pt-2 pb-8 overflow-visible">
      {/* ------------------------------------------------------------- */}
      {/* 1. SECTION HEADER WITH CONTROLS */}
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
      {/* 2. STRICT HORIZONTAL CAROUSEL WITH 3D POP-OUT GIFT BOXES */}
      {/* ------------------------------------------------------------- */}
      <div className="relative overflow-visible">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-2 sm:px-4 pt-12 pb-6 items-center overflow-y-visible select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {WELCOME_BONUSES.map((bonus, idx) => (
            <div
              key={bonus.id}
              data-bonus-card
              className={`group relative overflow-visible shrink-0 w-[82vw] max-w-[280px] sm:max-w-[300px] snap-center rounded-2xl border ${bonus.borderGlow} bg-gradient-to-b ${bonus.bgGradient} bg-[#1a2c38] p-5 pt-14 flex flex-col justify-between shadow-2xl transition-all duration-300 hover:-translate-y-1`}
            >
              {/* 3D POP-OUT GIFT BOX ELEVATED ABOVE TOP RIM */}
              <GiftBox3D theme={bonus.theme} />

              {/* Top Row: Deposit Tier Badge & Countdown Timer */}
              <div className="flex items-center justify-between gap-1.5 z-10">
                <span className="text-[11px] font-black uppercase tracking-wider text-white bg-black/50 px-2.5 py-1 rounded-full border border-white/10 shadow-sm">
                  {bonus.depositTier}
                </span>

                <div
                  className="flex items-center gap-1 font-mono text-[10px] font-bold text-white bg-[#0f212e]/90 px-2 py-1 rounded-md border border-[#213743] shadow-inner"
                  title="Live countdown"
                >
                  <Clock className="w-2.5 h-2.5 text-[#fbbf24]" />
                  <span>{formattedTimer}</span>
                </div>
              </div>

              {/* Central Multiplier & Reward Copy */}
              <div className="my-5 text-center space-y-1 z-10">
                <div
                  className="text-3xl sm:text-4xl font-black tracking-tight drop-shadow-md"
                  style={{ color: bonus.accentColor }}
                >
                  {bonus.bonusPercent}
                </div>
                <div className="text-base sm:text-lg font-black text-white tracking-wide">
                  {bonus.freeSpins}
                </div>
              </div>

              {/* Action Button: Receive or Locked */}
              <div className="z-10">
                {bonus.isUnlocked ? (
                  <button
                    onClick={() => handleReceiveBonus(bonus)}
                    className="w-full py-2.5 rounded-xl bg-white hover:bg-neutral-100 text-[#0f212e] font-black text-xs uppercase tracking-wider shadow-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Receive</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="w-full py-2.5 rounded-xl bg-[#14232d] border border-[#213743] text-[#879097] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-not-allowed select-none">
                    <Lock className="w-3.5 h-3.5 text-[#557086]" />
                    <span>Locked</span>
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
      {/* 3. "AVAILABLE BONUSES" FEATURED BANNER (Ace cards + Ruby gem) */}
      {/* ------------------------------------------------------------- */}
      <div className="relative rounded-2xl border border-[#213743] bg-gradient-to-r from-[#1475e1]/15 via-[#1a2c38] to-[#1a2c38] p-5 sm:p-6 shadow-xl overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-4 sm:gap-5 w-full sm:w-auto">
          {/* 3D Playing Cards + Ruby Gem */}
          <CardsAndRubyIllustration />

          <div className="space-y-1.5 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-[#1475e1] bg-[#1475e1]/10 px-2 py-0.5 rounded-md border border-[#1475e1]/30">
                <span>To be claimed</span>
                <Info className="w-3 h-3" />
              </span>

              <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-white bg-black/40 px-2 py-0.5 rounded-md border border-white/10">
                <Clock className="w-3 h-3 text-[#fbbf24]" />
                <span>{formattedTimer}</span>
              </span>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-white">
              100% casino bonus
            </h3>
            <p className="text-xs sm:text-sm text-[#b1bad3]">
              Deposit from ₹300 &amp; get a bonus + 70 FS as a gift
            </p>
          </div>
        </div>

        <button
          onClick={() => handleReceiveBonus()}
          className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#00e701] hover:bg-[#00c701] text-[#0f212e] font-black text-sm uppercase tracking-wider shadow-lg shadow-[#00e701]/20 transition-all active:scale-95 cursor-pointer shrink-0"
        >
          Receive
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. FAQ ACCORDION (SCREENSHOT 11) */}
      {/* ------------------------------------------------------------- */}
      <div className="rounded-2xl border border-[#213743] bg-[#1a2c38] p-4 sm:p-5 space-y-3">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#b1bad3]">
          Frequently Asked Questions
        </h4>

        {/* FAQ 1 */}
        <div className="border border-[#213743] rounded-xl overflow-hidden bg-[#0f212e]">
          <button
            onClick={() => toggleFaq(1)}
            className="w-full p-3.5 flex items-center justify-between text-left text-xs sm:text-sm font-bold text-white hover:bg-[#213743]/50 transition-colors cursor-pointer"
          >
            <span>What are bonuses?</span>
            {openFaq === 1 ? (
              <ChevronUp className="w-4 h-4 text-[#b1bad3]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#b1bad3]" />
            )}
          </button>
          {openFaq === 1 && (
            <div className="px-3.5 pb-3.5 text-xs text-[#b1bad3] leading-relaxed border-t border-[#213743] pt-2.5 animate-in fade-in duration-150">
              Bonuses are promotional credits and free spins awarded to your account upon qualifying deposits. They boost your playing power, enabling you to wager across our full catalog of games with enhanced multiplier opportunities.
            </div>
          )}
        </div>

        {/* FAQ 2 */}
        <div className="border border-[#213743] rounded-xl overflow-hidden bg-[#0f212e]">
          <button
            onClick={() => toggleFaq(2)}
            className="w-full p-3.5 flex items-center justify-between text-left text-xs sm:text-sm font-bold text-white hover:bg-[#213743]/50 transition-colors cursor-pointer"
          >
            <span>What is a bonus balance?</span>
            {openFaq === 2 ? (
              <ChevronUp className="w-4 h-4 text-[#b1bad3]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#b1bad3]" />
            )}
          </button>
          {openFaq === 2 && (
            <div className="px-3.5 pb-3.5 text-xs text-[#b1bad3] leading-relaxed border-t border-[#213743] pt-2.5 animate-in fade-in duration-150">
              A bonus balance is a separate dedicated ledger allocated for promotional incentives. Once standard rollover requirements are satisfied, bonus balances automatically convert into your withdrawable real balance.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
