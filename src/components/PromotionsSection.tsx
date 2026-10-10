"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Gift, ArrowRight } from "lucide-react";
import { useGame } from "@/context/GameContext";

interface PromoCardItem {
  id: string;
  badge: string;
  badgeStyle: string;
  title: string;
  subtitle: string;
  graphic: React.ReactNode;
  bgGradient: string;
  ctaText: string;
}

export default function PromotionsSection() {
  const { openOneTap, isAuthenticated } = useGame();
  const [visibleCount, setVisibleCount] = useState<number>(2);

  const promos: PromoCardItem[] = [
    {
      id: "messi-last-dance",
      badge: "Only on Stake",
      badgeStyle: "bg-[#1a2c38] text-[#00e701] sm:text-[#2ee6ca] border border-[#2ee6ca]/30",
      title: "Messi's Last Dance",
      subtitle: "Boosted odds on Messi! T&Cs Apply.",
      bgGradient: "from-sky-950/80 via-[#1a2c38] to-[#0f212e]",
      ctaText: "Bet Boosted Odds",
      graphic: (
        <div className="relative flex items-center justify-center">
          {/* Argentina #10 Jersey Graphic */}
          <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl bg-gradient-to-b from-sky-400 via-white to-sky-400 p-1 shadow-2xl border-2 border-sky-300/40 relative flex flex-col items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
            <span className="text-[10px] font-black text-slate-800 tracking-wider">MESSI</span>
            <span className="text-3xl sm:text-4xl font-black text-sky-900 tracking-tighter">10</span>
            <div className="absolute -bottom-2 -right-2 text-xl">⚽</div>
          </div>
        </div>
      ),
    },
    {
      id: "monster-lab",
      badge: "Only on Stake",
      badgeStyle: "bg-teal-500/20 text-teal-300 border-teal-500/30",
      title: "Monster Lab",
      subtitle: "One Bet Can Change Everything",
      bgGradient: "from-teal-950/80 via-[#1a2c38] to-[#0f212e]",
      ctaText: "Enter The Lab",
      graphic: (
        <div className="relative flex items-center justify-center">
          {/* Monster Lab Scientist Avatar & Beaker */}
          <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl bg-gradient-to-br from-teal-500/30 via-emerald-900/60 to-slate-900 border-2 border-teal-400/40 p-2 shadow-2xl flex flex-col items-center justify-center transform group-hover:scale-105 transition-transform duration-300 relative overflow-hidden">
            <span className="text-3xl sm:text-4xl filter drop-shadow-[0_0_15px_rgba(45,212,191,0.6)]">
              🧪
            </span>
            <span className="text-xs font-mono font-bold text-teal-300 mt-1">10,000X</span>
            <div className="absolute top-1 right-1 text-sm animate-pulse">⚡</div>
          </div>
        </div>
      ),
    },
    {
      id: "daily-race",
      badge: "$100k Daily",
      badgeStyle: "bg-[#00e701]/20 text-[#00e701] border-[#00e701]/30",
      title: "Daily Wager Race",
      subtitle: "Top 5,000 racers share $100,000 every 24 hours.",
      bgGradient: "from-emerald-950/80 via-[#1a2c38] to-[#0f212e]",
      ctaText: "Join Race",
      graphic: (
        <div className="relative flex items-center justify-center">
          <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl bg-gradient-to-br from-emerald-500/20 to-slate-900 border border-emerald-500/30 p-2 flex items-center justify-center text-4xl">
            🏎️
          </div>
        </div>
      ),
    },
    {
      id: "weekly-raffle",
      badge: "$75k Raffle",
      badgeStyle: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      title: "Stake Weekly Raffle",
      subtitle: "Tickets earned automatically with every $1,000 wagered.",
      bgGradient: "from-purple-950/80 via-[#1a2c38] to-[#0f212e]",
      ctaText: "Get Tickets",
      graphic: (
        <div className="relative flex items-center justify-center">
          <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl bg-gradient-to-br from-purple-500/20 to-slate-900 border border-purple-500/30 p-2 flex items-center justify-center text-4xl">
            🎟️
          </div>
        </div>
      ),
    },
  ];

  const displayedPromos = promos.slice(0, visibleCount);

  return (
    <section className="space-y-4 my-8">
      {/* Title with Gift Icon + Link */}
      <div className="flex items-center justify-between">
        <Link href="#promotions" className="flex items-center gap-2 group cursor-pointer">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-500/15 text-pink-400">
            <Gift className="h-4 w-4" />
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white group-hover:text-pink-400 transition-colors flex items-center gap-1.5">
            <span>Promotions</span>
            <span className="text-base text-[#b1bad3] group-hover:translate-x-1 transition-transform">
              &gt;
            </span>
          </h2>
        </Link>
      </div>

      {/* 2 Promo Banner Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedPromos.map((promo) => (
          <div
            key={promo.id}
            onClick={() => {
              if (!isAuthenticated) openOneTap();
            }}
            className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-[#213743] bg-[#1a2c38] p-5 sm:p-6 transition-all duration-300 hover:border-[#2f4553] hover:shadow-2xl cursor-pointer"
          >
            {/* Background Gradient */}
            <div
              className={`absolute inset-0 bg-gradient-to-r ${promo.bgGradient} opacity-90 transition-opacity`}
            />

            {/* Left Info Column */}
            <div className="relative z-10 space-y-2 max-w-[65%]">
              <span
                className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border ${promo.badgeStyle}`}
              >
                {promo.badge}
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-white transition-colors">
                {promo.title}
              </h3>
              <p className="text-xs text-[#b1bad3] leading-relaxed line-clamp-2">
                {promo.subtitle}
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-[#00e701] transition-colors">
                  <span>{promo.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>

            {/* Right Graphic */}
            <div className="relative z-10 flex-shrink-0 ml-4">
              {promo.graphic}
            </div>
          </div>
        ))}
      </div>

      {/* Center-Aligned "Load More" Button */}
      {visibleCount < promos.length && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setVisibleCount((prev) => Math.min(promos.length, prev + 2))}
            className="bg-[#213743] hover:bg-[#2a4555] text-white font-bold text-xs px-6 py-2.5 rounded-lg border border-[#2f4553] transition-all cursor-pointer active:scale-95 shadow-md"
          >
            Load More
          </button>
        </div>
      )}
    </section>
  );
}
