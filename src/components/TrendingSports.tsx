"use client";

import React, { useState } from "react";
import Link from "next/link";

interface SportCard {
  id: string;
  name: string;
  emoji: string;
  liveMatches: number;
  bgGradient: string;
  accentBorder: string;
  texturePattern: string;
}

export default function TrendingSports() {
  const [visibleCount, setVisibleCount] = useState<number>(6);

  const sports: SportCard[] = [
    {
      id: "soccer",
      name: "SOCCER",
      emoji: "⚽",
      liveMatches: 124,
      bgGradient: "from-emerald-950 via-green-900/60 to-[#0f212e]",
      accentBorder: "group-hover:border-emerald-500/50",
      texturePattern: "radial-gradient(circle at 50% 50%, rgba(16,185,129,0.15), transparent 70%)",
    },
    {
      id: "tennis",
      name: "TENNIS",
      emoji: "🎾",
      liveMatches: 48,
      bgGradient: "from-amber-950 via-yellow-900/60 to-[#0f212e]",
      accentBorder: "group-hover:border-yellow-500/50",
      texturePattern: "radial-gradient(circle at 50% 50%, rgba(234,179,8,0.15), transparent 70%)",
    },
    {
      id: "american-football",
      name: "AMERICAN FOOTBALL",
      emoji: "🏈",
      liveMatches: 18,
      bgGradient: "from-amber-950 via-stone-900/60 to-[#0f212e]",
      accentBorder: "group-hover:border-amber-600/50",
      texturePattern: "radial-gradient(circle at 50% 50%, rgba(217,119,6,0.15), transparent 70%)",
    },
    {
      id: "baseball",
      name: "BASEBALL",
      emoji: "⚾",
      liveMatches: 32,
      bgGradient: "from-red-950 via-rose-900/60 to-[#0f212e]",
      accentBorder: "group-hover:border-red-500/50",
      texturePattern: "radial-gradient(circle at 50% 50%, rgba(239,68,68,0.15), transparent 70%)",
    },
    {
      id: "ice-hockey",
      name: "ICE HOCKEY",
      emoji: "🏒",
      liveMatches: 15,
      bgGradient: "from-cyan-950 via-sky-900/60 to-[#0f212e]",
      accentBorder: "group-hover:border-cyan-500/50",
      texturePattern: "radial-gradient(circle at 50% 50%, rgba(6,182,212,0.15), transparent 70%)",
    },
    {
      id: "basketball",
      name: "BASKETBALL",
      emoji: "🏀",
      liveMatches: 65,
      bgGradient: "from-orange-950 via-amber-900/60 to-[#0f212e]",
      accentBorder: "group-hover:border-orange-500/50",
      texturePattern: "radial-gradient(circle at 50% 50%, rgba(249,115,22,0.15), transparent 70%)",
    },
    {
      id: "cricket",
      name: "CRICKET",
      emoji: "🏏",
      liveMatches: 22,
      bgGradient: "from-teal-950 via-emerald-900/60 to-[#0f212e]",
      accentBorder: "group-hover:border-teal-500/50",
      texturePattern: "radial-gradient(circle at 50% 50%, rgba(20,184,166,0.15), transparent 70%)",
    },
    {
      id: "mma",
      name: "MMA / UFC",
      emoji: "🥊",
      liveMatches: 9,
      bgGradient: "from-purple-950 via-slate-900/60 to-[#0f212e]",
      accentBorder: "group-hover:border-purple-500/50",
      texturePattern: "radial-gradient(circle at 50% 50%, rgba(168,85,247,0.15), transparent 70%)",
    },
  ];

  const displayedSports = sports.slice(0, visibleCount);

  return (
    <section className="space-y-4 my-8">
      {/* Title with Basketball Icon + Link */}
      <div className="flex items-center justify-between">
        <Link href="#sports" className="flex items-center gap-2 group cursor-pointer">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/15 text-orange-400">
            {/* Basketball SVG Icon */}
            <svg
              className="h-4 w-4 fill-none stroke-current stroke-2"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M4.93 4.93l4.24 4.24" />
              <path d="M14.83 9.17l4.24-4.24" />
              <path d="M14.83 14.83l4.24 4.24" />
              <path d="M9.17 14.83L4.93 19.07" />
              <line x1="12" y1="2" x2="12" y2="22" />
              <line x1="2" y1="12" x2="22" y2="12" />
            </svg>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white group-hover:text-orange-400 transition-colors flex items-center gap-1.5">
            <span>Trending Sports</span>
            <span className="text-base text-[#b1bad3] group-hover:translate-x-1 transition-transform">
              &gt;
            </span>
          </h2>
        </Link>
      </div>

      {/* Responsive 3-Card Grid (Mobile) / Multi-Column (Desktop) */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3.5">
        {displayedSports.map((sport) => (
          <div
            key={sport.id}
            className={`group relative flex flex-col justify-between rounded-lg overflow-hidden border border-[#213743] bg-[#1a2c38] p-3 sm:p-4 transition-all duration-300 hover:-translate-y-1 ${sport.accentBorder} hover:shadow-xl aspect-[3/4] cursor-pointer select-none`}
          >
            {/* Background Graphic & Texture Overlay with Subtle Hover Zoom */}
            <div
              className={`absolute inset-0 bg-gradient-to-b ${sport.bgGradient} opacity-80 group-hover:scale-105 group-hover:opacity-95 transition-all duration-300`}
              style={{ backgroundImage: sport.texturePattern }}
            />

            {/* Top Live Badge */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="rounded bg-[#0f212e]/80 border border-[#213743] px-1.5 py-0.5 text-[8px] sm:text-[9px] font-mono text-[#00e701] font-bold">
                {sport.liveMatches} Live
              </span>
            </div>

            {/* Sport Iconic Visual Center */}
            <div className="relative z-10 my-auto flex flex-col items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
              <span className="text-3xl sm:text-4xl filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]">
                {sport.emoji}
              </span>
            </div>

            {/* Bold Typography Overlay */}
            <div className="relative z-10 text-center">
              <h3 className="text-[11px] sm:text-xs font-black tracking-wider text-white group-hover:text-white transition-colors truncate uppercase drop-shadow">
                {sport.name}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Center-Aligned "Load More" Button */}
      {visibleCount < sports.length && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setVisibleCount((prev) => Math.min(sports.length, prev + 2))}
            className="bg-[#213743] hover:bg-[#2a4555] text-white font-bold text-xs px-6 py-2.5 rounded-lg border border-[#2f4553] transition-all cursor-pointer active:scale-95 shadow-md"
          >
            Load More
          </button>
        </div>
      )}
    </section>
  );
}
