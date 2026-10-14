"use client";

import React, { useState } from "react";
import {
  Gift,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Lock,
  ArrowRight,
  Info,
  CheckCircle2,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

export interface BonusOffer {
  id: string;
  depositTier: string;
  bonusPercent: string;
  freeSpins: string;
  gradient: string;
  accentColor: string;
  ribbonColor: string;
  isUnlocked: boolean;
  timeLeft: string;
}

export const WELCOME_BONUSES: BonusOffer[] = [
  {
    id: "bonus-1",
    depositTier: "1st deposit",
    bonusPercent: "100%",
    freeSpins: "+ 70 FS",
    gradient: "from-[#d97706]/40 via-[#b45309]/30 to-[#1a2c38]",
    accentColor: "#fbbf24",
    ribbonColor: "#f59e0b",
    isUnlocked: true,
    timeLeft: "23h 59m",
  },
  {
    id: "bonus-2",
    depositTier: "2nd deposit",
    bonusPercent: "120%",
    freeSpins: "+ 100 FS",
    gradient: "from-[#0d9488]/40 via-[#0f766e]/30 to-[#1a2c38]",
    accentColor: "#2dd4bf",
    ribbonColor: "#14b8a6",
    isUnlocked: false,
    timeLeft: "Unlocked after 1st",
  },
  {
    id: "bonus-3",
    depositTier: "3rd deposit",
    bonusPercent: "130%",
    freeSpins: "+ 150 FS",
    gradient: "from-[#2563eb]/40 via-[#1d4ed8]/30 to-[#1a2c38]",
    accentColor: "#60a5fa",
    ribbonColor: "#3b82f6",
    isUnlocked: false,
    timeLeft: "Unlocked after 2nd",
  },
  {
    id: "bonus-4",
    depositTier: "4th deposit",
    bonusPercent: "150%",
    freeSpins: "+ 180 FS",
    gradient: "from-[#9333ea]/40 via-[#7e22ce]/30 to-[#1a2c38]",
    accentColor: "#c084fc",
    ribbonColor: "#a855f7",
    isUnlocked: false,
    timeLeft: "Unlocked after 3rd",
  },
];

export default function BonusesSection() {
  const { openWalletModal } = useGame();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    sounds.playClick();
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  const handleReceiveBonus = (bonus: BonusOffer) => {
    sounds.playSuccessChime();
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch {}
    // Opens deposit modal directly
    openWalletModal();
  };

  return (
    <section className="space-y-6 pt-4 pb-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#213743] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-[#fbbf24]" />
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Up to 500% bonuses
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-[#b1bad3] mt-1">
            Welcome deposit bonuses on your first 4 deposits
          </p>
        </div>
      </div>

      {/* 2. Horizontal Swipeable 4 Carousel 3D Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {WELCOME_BONUSES.map((bonus, idx) => (
          <div
            key={bonus.id}
            className={`relative rounded-2xl border border-[#213743] p-5 bg-gradient-to-br ${bonus.gradient} bg-[#1a2c38] shadow-xl overflow-hidden flex flex-col justify-between transition-all duration-200 hover:border-[#557086] hover:-translate-y-0.5`}
          >
            {/* Top Badge & Timer */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-white bg-black/40 px-2.5 py-1 rounded-full border border-white/10">
                {bonus.depositTier}
              </span>
              <div className="flex items-center gap-1 text-[11px] font-bold text-white/90 bg-black/30 px-2 py-0.5 rounded-md">
                <Clock className="w-3 h-3 text-[#fbbf24]" />
                <span>{bonus.timeLeft}</span>
              </div>
            </div>

            {/* Gift Box Graphic & Multiplier text */}
            <div className="my-6 text-center space-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-black/30 border border-white/10 shadow-inner">
                <Gift
                  className="w-8 h-8"
                  style={{ color: bonus.accentColor }}
                />
              </div>

              <div>
                <div
                  className="text-2xl sm:text-3xl font-black tracking-tight"
                  style={{ color: bonus.accentColor }}
                >
                  {bonus.bonusPercent}
                </div>
                <div className="text-sm font-bold text-white">
                  {bonus.freeSpins}
                </div>
              </div>
            </div>

            {/* Action Button: Receive or Locked */}
            {bonus.isUnlocked ? (
              <button
                onClick={() => handleReceiveBonus(bonus)}
                className="w-full py-2.5 rounded-xl bg-white hover:bg-neutral-100 text-[#0f212e] font-black text-xs uppercase tracking-wider shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Receive</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="w-full py-2.5 rounded-xl bg-black/40 border border-white/5 text-[#b1bad3] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#557086]" />
                <span>Locked</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 3. "Available bonuses" Featured Banner */}
      <div className="relative rounded-2xl border border-[#213743] bg-gradient-to-r from-[#1475e1]/20 via-[#1a2c38] to-[#1a2c38] p-5 sm:p-6 shadow-xl overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#1475e1]/20 border border-[#1475e1]/40 flex items-center justify-center text-3xl shadow-lg shrink-0">
            💎
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#1475e1] bg-[#1475e1]/10 px-2 py-0.5 rounded-md border border-[#1475e1]/30">
                To be claimed
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold text-[#b1bad3]">
                <Clock className="w-3 h-3 text-[#fbbf24]" />
                <span>23h 59m</span>
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
          onClick={() => {
            sounds.playSuccessChime();
            openWalletModal();
          }}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#00e701] hover:bg-[#00c701] text-[#0f212e] font-black text-sm uppercase tracking-wider shadow-lg shadow-[#00e701]/20 transition-all active:scale-95 cursor-pointer shrink-0"
        >
          Receive
        </button>
      </div>

      {/* 4. FAQ Accordion */}
      <div className="rounded-2xl border border-[#213743] bg-[#1a2c38] p-4 sm:p-5 space-y-3">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#b1bad3]">
          Frequently Asked Questions
        </h4>

        {/* FAQ 1 */}
        <div className="border border-[#213743] rounded-xl overflow-hidden">
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
        <div className="border border-[#213743] rounded-xl overflow-hidden">
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
