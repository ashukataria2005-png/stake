"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Gift,
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
  image: string;
  isUnlocked: boolean;
}

export const WELCOME_BONUSES: BonusOffer[] = [
  {
    id: "bonus-1",
    depositTier: "1st deposit",
    bonusPercent: "100%",
    freeSpins: "70FS",
    image: "/bonus/1stdeposit.png",
    isUnlocked: true,
  },
  {
    id: "bonus-2",
    depositTier: "2nd deposit",
    bonusPercent: "120%",
    freeSpins: "100FS",
    image: "/bonus/2nddeposit.png",
    isUnlocked: false,
  },
  {
    id: "bonus-3",
    depositTier: "3rd deposit",
    bonusPercent: "130%",
    freeSpins: "150FS",
    image: "/bonus/3rddeposit.png",
    isUnlocked: false,
  },
  {
    id: "bonus-4",
    depositTier: "4th deposit",
    bonusPercent: "150%",
    freeSpins: "180FS",
    image: "/bonus/4thdeposit.png",
    isUnlocked: false,
  },
];

// ============================================================================
// COMPLETE 8 FAQ QUESTIONS (SCREENSHOT 27)
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
// MAIN BONUSES SECTION COMPONENT
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
      const card = cards[index];
      const targetLeft = card.offsetLeft - 8;
      container.scrollTo({
        left: Math.max(0, targetLeft),
        behavior: "smooth",
      });
      setActiveCardIndex(index);
    }
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const cardWidth = 240;
    const newIndex = Math.min(
      WELCOME_BONUSES.length - 1,
      Math.max(0, Math.round(scrollLeft / cardWidth))
    );
    if (newIndex !== activeCardIndex) {
      setActiveCardIndex(newIndex);
    }
  };

  return (
    <section className="space-y-6 pt-2 pb-6 select-none">
      {/* ------------------------------------------------------------- */}
      {/* 1. HEADER */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center justify-between gap-4 border-b border-[#213743] pb-2.5 px-1 mb-2">
        <div>
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-[#fbbf24]" />
            <h2 className="font-bold text-lg sm:text-xl text-white tracking-normal">
              Up to 500% bonuses
            </h2>
          </div>
          <p className="text-xs text-[#879097] mt-0.5">
            Welcome deposit bonuses
          </p>
        </div>

        {/* Carousel Desktop Navigation Arrows */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => scrollToCard(Math.max(0, activeCardIndex - 1))}
            disabled={activeCardIndex === 0}
            className="p-1.5 rounded-lg bg-[#1a2c38] hover:bg-[#213743] border border-[#213743] text-[#b1bad3] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
            title="Previous Bonus"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollToCard(Math.min(WELCOME_BONUSES.length - 1, activeCardIndex + 1))}
            disabled={activeCardIndex === WELCOME_BONUSES.length - 1}
            className="p-1.5 rounded-lg bg-[#1a2c38] hover:bg-[#213743] border border-[#213743] text-[#b1bad3] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
            title="Next Bonus"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. 4 HORIZONTAL BONUS CARDS WITH OVERLAID LIVE TIMERS */}
      {/* ------------------------------------------------------------- */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto gap-3.5 py-2 px-1 select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden items-center touch-pan-x"
        >
          {WELCOME_BONUSES.map((bonus) => (
            <div
              key={bonus.id}
              data-bonus-card
              className="relative shrink-0 w-[220px] sm:w-[240px] aspect-[1/1.28] rounded-[24px] overflow-hidden shadow-xl border border-white/5 transition-transform duration-200 hover:-translate-y-1 bg-[#121d25]"
            >
              {/* Base High-Resolution Image */}
              <img
                src={bonus.image}
                alt={bonus.depositTier}
                className="w-full h-full object-contain pointer-events-none select-none block"
                onError={(e) => {
                  // Fallback to .jpg if .png fails
                  if (e.currentTarget.src.endsWith(".png")) {
                    e.currentTarget.src = bonus.image.replace(/\.png$/, ".jpg");
                  }
                }}
              />

              {/* Overlay Live Countdown Timer (Directly covering the printed timer) */}
              <div className="absolute bottom-[24%] left-1/2 -translate-x-1/2 w-[82%] flex items-center justify-center pointer-events-none">
                <div className="bg-[#24211b]/95 sm:bg-[#201d18]/90 backdrop-blur-md py-1 px-3 rounded-full border border-white/10 shadow-inner text-white font-mono text-[11px] sm:text-xs font-bold tracking-widest text-center whitespace-nowrap">
                  {formattedTimer}
                </div>
              </div>

              {/* Clickable Action Area */}
              {bonus.isUnlocked ? (
                <button
                  onClick={() => handleReceiveBonus(bonus)}
                  className="absolute bottom-2 left-3 right-3 h-11 cursor-pointer rounded-xl active:scale-95 transition-transform bg-transparent hover:bg-white/5 focus:outline-none"
                  aria-label={`Receive ${bonus.depositTier} bonus`}
                  title="Receive Bonus"
                />
              ) : (
                <div
                  className="absolute bottom-2 left-3 right-3 h-11 cursor-not-allowed rounded-xl"
                  aria-label={`Locked ${bonus.depositTier} bonus`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. "AVAILABLE BONUSES" & 100% CASINO BONUS BANNER */}
      {/* ------------------------------------------------------------- */}
      <div className="pt-2">
        <h3 className="font-bold text-lg sm:text-xl text-white mb-2">
          Available bonuses
        </h3>
        <div className="relative w-full max-w-[560px] mx-auto rounded-[24px] overflow-hidden shadow-2xl border border-white/10 bg-[#121d25]">
          {/* Base High-Resolution Banner Image */}
          <img
            src="/bonus/100casinobonus.png"
            alt="100% casino bonus"
          className="w-full h-auto object-cover pointer-events-none select-none block"
          onError={(e) => {
            if (e.currentTarget.src.endsWith(".png")) {
              e.currentTarget.src = "/bonus/100casinobonus.jpg";
            }
          }}
        />

        {/* Overlay Live Countdown Timer (Bottom-Left) */}
        <div className="absolute bottom-[10%] left-[5%] w-[38%] max-w-[150px] flex items-center justify-center pointer-events-none">
          <div className="w-full bg-[#2b3d54]/95 backdrop-blur-md py-1 px-2.5 rounded-full border border-white/10 shadow-inner text-white font-mono text-[10px] sm:text-xs font-bold tracking-widest text-center whitespace-nowrap">
            {formattedTimer}
          </div>
        </div>

        {/* Overlay Receive Button Hit-Box (Bottom-Right) */}
        <button
          onClick={() => handleReceiveBonus()}
          className="absolute bottom-[8%] right-[5%] w-[38%] max-w-[155px] h-[36px] sm:h-[42px] cursor-pointer rounded-xl active:scale-95 transition-transform bg-transparent hover:bg-white/5 focus:outline-none"
          aria-label="Receive 100% Casino Bonus"
          title="Receive 100% Casino Bonus"
        />
      </div>
    </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. COMPLETE 8 FAQ ACCORDION AT BOTTOM */}
      {/* ------------------------------------------------------------- */}
      <div className="mt-8 rounded-2xl border border-[#213743] bg-[#1a2c38] p-4 sm:p-6 space-y-2.5">
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
                className="w-full p-3.5 sm:p-4 flex items-center justify-between text-left text-xs sm:text-sm font-bold text-white hover:bg-[#213743]/50 transition-colors cursor-pointer"
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
