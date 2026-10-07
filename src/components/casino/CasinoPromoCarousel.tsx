"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Sparkles, Trophy, Flame, Ticket, Shield, Swords, Crown, Zap, Waves } from "lucide-react";

interface PromoItem {
  id: string;
  title: string;
  description: string;
  ctaLink: string;
  bgGradient: string;
  artwork: React.ReactNode;
}

export default function CasinoPromoCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 9 Exact Real Stake Promotions
  const promos: PromoItem[] = [
    {
      id: "ocean-surge",
      title: "Ocean Surge",
      description: "Hit or beat the target multiplier to share in...",
      ctaLink: "/casino/group/slots",
      bgGradient: "from-cyan-600 via-blue-700 to-indigo-950",
      artwork: (
        <div className="relative flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-cyan-400/20 border border-cyan-300/40 flex items-center justify-center text-3xl sm:text-4xl shadow-lg shadow-cyan-500/20">
            🌊
          </div>
          <span className="mt-1 text-[9px] font-black uppercase tracking-wider text-cyan-200 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-400/30">
            Multiplier
          </span>
        </div>
      ),
    },
    {
      id: "2x-vip-progress",
      title: "2x VIP Progress",
      description: "Boosted VIP progress on Only on Stake Games",
      ctaLink: "/casino/group/stake-originals",
      bgGradient: "from-blue-600 via-indigo-700 to-indigo-950",
      artwork: (
        <div className="relative flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-3xl sm:text-4xl shadow-lg shadow-blue-500/20">
            🥇
          </div>
          <span className="mt-1 text-[9px] font-black uppercase tracking-wider text-blue-200 bg-blue-950/80 px-2 py-0.5 rounded-full border border-blue-400/30">
            2X Boost
          </span>
        </div>
      ),
    },
    {
      id: "daily-races",
      title: "Daily Races",
      description: "Race to the top for a share in $100,000",
      ctaLink: "/casino/home",
      bgGradient: "from-amber-500 via-orange-600 to-red-950",
      artwork: (
        <div className="relative flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-3xl sm:text-4xl shadow-lg shadow-amber-500/20">
            🏎️
          </div>
          <span className="mt-1 text-[9px] font-black uppercase tracking-wider text-amber-200 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-400/30 font-mono">
            $100,000
          </span>
        </div>
      ),
    },
    {
      id: "weekly-raffle",
      title: "Weekly Raffle",
      description: "Earn raffle tickets for a chance to share in...",
      ctaLink: "/casino/home",
      bgGradient: "from-emerald-500 via-teal-700 to-slate-900",
      artwork: (
        <div className="relative flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-400/20 border border-emerald-300/40 flex items-center justify-center text-3xl sm:text-4xl shadow-lg shadow-emerald-500/20">
            🎟️
          </div>
          <span className="mt-1 text-[9px] font-black uppercase tracking-wider text-emerald-200 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-400/30">
            Weekly Draw
          </span>
        </div>
      ),
    },
    {
      id: "stake-vs-eddie",
      title: "Stake vs Eddie",
      description: "Hit or beat the target multiplier to share in...",
      ctaLink: "/casino/group/stake-originals",
      bgGradient: "from-purple-600 via-indigo-800 to-slate-950",
      artwork: (
        <div className="relative flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-purple-400/20 border border-purple-300/40 flex items-center justify-center text-3xl sm:text-4xl shadow-lg shadow-purple-500/20">
            🥊
          </div>
          <span className="mt-1 text-[9px] font-black uppercase tracking-wider text-purple-200 bg-purple-950/80 px-2 py-0.5 rounded-full border border-purple-400/30">
            Beat Eddie
          </span>
        </div>
      ),
    },
    {
      id: "conquer-the-casino",
      title: "Conquer the Casino",
      description: "Hit the Big Win or Lucky...",
      ctaLink: "/casino/group/slots",
      bgGradient: "from-rose-600 via-red-800 to-slate-900",
      artwork: (
        <div className="relative flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-rose-400/20 border border-rose-300/40 flex items-center justify-center text-3xl sm:text-4xl shadow-lg shadow-rose-500/20">
            ⚔️
          </div>
          <span className="mt-1 text-[9px] font-black uppercase tracking-wider text-rose-200 bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-400/30">
            Lucky Win
          </span>
        </div>
      ),
    },
    {
      id: "jaqkpot",
      title: "JAQKpot!",
      description: "Win up to $1M!",
      ctaLink: "/casino/group/slots",
      bgGradient: "from-fuchsia-600 via-pink-700 to-indigo-950",
      artwork: (
        <div className="relative flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-fuchsia-400/20 border border-fuchsia-300/40 flex items-center justify-center text-3xl sm:text-4xl shadow-lg shadow-fuchsia-500/20">
            🃏
          </div>
          <span className="mt-1 text-[9px] font-black uppercase tracking-wider text-fuchsia-200 bg-fuchsia-950/80 px-2 py-0.5 rounded-full border border-fuchsia-400/30 font-mono">
            $1,000,000
          </span>
        </div>
      ),
    },
    {
      id: "all-in-or-fold",
      title: "All in or Fold Jackpot",
      description: "$500,000 In Prizes! in our exclusive tables",
      ctaLink: "/casino/group/live-casino",
      bgGradient: "from-violet-600 via-purple-900 to-slate-950",
      artwork: (
        <div className="relative flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-violet-400/20 border border-violet-300/40 flex items-center justify-center text-3xl sm:text-4xl shadow-lg shadow-violet-500/20">
            ♠️
          </div>
          <span className="mt-1 text-[9px] font-black uppercase tracking-wider text-violet-200 bg-violet-950/80 px-2 py-0.5 rounded-full border border-violet-400/30 font-mono">
            $500,000
          </span>
        </div>
      ),
    },
    {
      id: "bad-beat-jackpot",
      title: "Bad Beat Jackpot",
      description: "Win your share of the $1,000,000 Jackpot",
      ctaLink: "/casino/home",
      bgGradient: "from-red-600 via-rose-900 to-neutral-950",
      artwork: (
        <div className="relative flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-red-400/20 border border-red-300/40 flex items-center justify-center text-3xl sm:text-4xl shadow-lg shadow-red-500/20">
            🔥
          </div>
          <span className="mt-1 text-[9px] font-black uppercase tracking-wider text-red-200 bg-red-950/80 px-2 py-0.5 rounded-full border border-red-400/30 font-mono">
            $1,000,000
          </span>
        </div>
      ),
    },
  ];

  // Advance to next promo slide
  const scrollToIndex = useCallback((nextIdx: number) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const cards = container.children;
    if (cards[nextIdx]) {
      const card = cards[nextIdx] as HTMLElement;
      container.scrollTo({
        left: card.offsetLeft - container.offsetLeft,
        behavior: "smooth",
      });
      setCurrentIndex(nextIdx);
    }
  }, []);

  // Auto-slide timer: Every 4.5 seconds advances to next promo (loops infinitely)
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % promos.length;
        scrollToIndex(next);
        return next;
      });
    }, 4500);

    return () => clearInterval(timer);
  }, [isPaused, promos.length, scrollToIndex]);

  return (
    <div
      className="relative w-full overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Horizontal Snap Scroll Carousel (No dots, no circles) */}
      <div
        ref={scrollRef}
        className="snap-x snap-mandatory flex gap-3 overflow-x-auto no-scrollbar py-1 scroll-smooth"
      >
        {promos.map((promo) => (
          <div
            key={promo.id}
            className="min-w-[88%] sm:min-w-[380px] md:min-w-[420px] max-w-[460px] flex-shrink-0 snap-center"
          >
            <Link
              href={promo.ctaLink}
              className="h-[125px] sm:h-[140px] w-full rounded-2xl bg-[#1a2c38] border border-[#213743] hover:border-[#2f4553] flex items-center overflow-hidden select-none cursor-grab active:cursor-grabbing transition-transform active:scale-[0.99] shadow-lg group block"
            >
              <div className="flex w-full h-full">
                {/* Left side (Artwork - 40%) */}
                <div
                  className={`w-[40%] h-full relative overflow-hidden bg-gradient-to-r ${promo.bgGradient} flex items-center justify-center p-2 shrink-0 group-hover:scale-105 transition-transform duration-300`}
                >
                  {promo.artwork}
                </div>

                {/* Right side (Content - 60%) */}
                <div className="w-[60%] p-3.5 flex flex-col justify-center gap-1 text-left overflow-hidden">
                  <span className="w-fit text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white px-2 py-0.5 rounded-md">
                    Promotion
                  </span>
                  <h3 className="text-white font-black text-sm sm:text-base leading-tight tracking-tight truncate">
                    {promo.title}
                  </h3>
                  <p className="text-[#b1bad3] text-[11px] sm:text-xs line-clamp-2 leading-relaxed">
                    {promo.description}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
