"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles, Award } from "lucide-react";

interface BannerSlide {
  id: string;
  badge: string;
  badgeStyle: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  bgGradient: string;
  graphic: React.ReactNode;
}

export default function CasinoPromoCarousel() {
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  const slides: BannerSlide[] = [
    {
      id: "monster-lab",
      badge: "Only on Stake",
      badgeStyle: "bg-teal-500/20 text-teal-300 border-teal-500/40",
      title: "Monster Lab - One Bet Can Change Everything",
      subtitle:
        "Exclusive release! Step inside the secret laboratory for mutating multipliers up to 10,000x.",
      ctaText: "Play Monster Lab",
      ctaLink: "/games/mines",
      bgGradient: "from-teal-950 via-[#1a2c38] to-[#0f212e]",
      graphic: (
        <div className="relative flex items-center justify-center select-none">
          {/* Mad Scientist Laboratory Artwork */}
          <div className="w-24 h-28 sm:w-36 sm:h-36 rounded-2xl bg-gradient-to-tr from-teal-500/25 via-emerald-800/40 to-slate-900 border-2 border-teal-400/30 p-3 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
            <span className="text-4xl sm:text-6xl filter drop-shadow-[0_0_20px_rgba(45,212,191,0.7)] animate-bounce">
              🧪
            </span>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-[10px] sm:text-xs font-mono font-black text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-500/40">
                10,000X
              </span>
            </div>
            {/* Ambient Beaker Vapor */}
            <div className="absolute top-1 right-2 text-base animate-pulse">⚡</div>
            <div className="absolute bottom-1 left-2 text-base animate-ping opacity-60">🫧</div>
          </div>
        </div>
      ),
    },
    {
      id: "vip-progress",
      badge: "2x VIP Progress",
      badgeStyle: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      title: "2x VIP Progress - Boosted VIP Progress on Only on Stake Games",
      subtitle:
        "Level up faster! Every wager on exclusive Stake Originals and custom releases awards double VIP points.",
      ctaText: "Explore Exclusive Games",
      ctaLink: "/games/plinko",
      bgGradient: "from-blue-950 via-[#1a2c38] to-[#0f212e]",
      graphic: (
        <div className="relative flex items-center justify-center select-none">
          {/* Neon Blue VIP Stake Medal Badge */}
          <div className="w-24 h-28 sm:w-36 sm:h-36 rounded-2xl bg-gradient-to-tr from-blue-600/30 via-indigo-900/50 to-slate-900 border-2 border-blue-400/40 p-3 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
            <span className="text-4xl sm:text-6xl filter drop-shadow-[0_0_25px_rgba(59,130,246,0.8)]">
              🥇
            </span>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-[10px] sm:text-xs font-black text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-400/50 tracking-wider">
                2X BOOST
              </span>
            </div>
            <div className="absolute top-2 right-2 text-sm text-yellow-300 animate-spin">✨</div>
          </div>
        </div>
      ),
    },
  ];

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#213743] bg-[#1a2c38] shadow-2xl select-none group">
      {/* Active Slide Container */}
      <div
        className={`relative flex flex-col sm:flex-row items-center justify-between p-6 sm:p-8 min-h-[220px] sm:min-h-[240px] bg-gradient-to-r ${slides[currentSlide].bgGradient} transition-all duration-700`}
      >
        {/* Left Information */}
        <div className="relative z-10 space-y-2 sm:space-y-3 max-w-xl text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start">
            <span
              className={`rounded-md px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider border shadow-sm ${slides[currentSlide].badgeStyle}`}
            >
              {slides[currentSlide].badge}
            </span>
          </div>

          <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-snug">
            {slides[currentSlide].title}
          </h2>

          <p className="text-xs sm:text-sm text-[#b1bad3] leading-relaxed line-clamp-2">
            {slides[currentSlide].subtitle}
          </p>

          <div className="pt-2 flex items-center justify-center sm:justify-start gap-3">
            <Link
              href={slides[currentSlide].ctaLink}
              className="rounded-xl bg-[#00e701] px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-black text-[#0f212e] shadow-lg shadow-[#00e701]/25 hover:bg-[#00c701] active:scale-95 transition-all"
            >
              {slides[currentSlide].ctaText}
            </Link>
          </div>
        </div>

        {/* Right Artwork Graphic */}
        <div className="relative z-10 mt-4 sm:mt-0 flex-shrink-0">
          {slides[currentSlide].graphic}
        </div>
      </div>

      {/* Manual Left / Right Chevron Controls */}
      <button
        onClick={prevSlide}
        aria-label="Previous Slide"
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-[#0f212e]/80 text-[#b1bad3] hover:text-white border border-[#213743] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={nextSlide}
        aria-label="Next Slide"
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-[#0f212e]/80 text-[#b1bad3] hover:text-white border border-[#213743] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Slide Dots Indicator */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              currentSlide === idx ? "w-6 bg-[#00e701]" : "w-2 bg-[#213743]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
