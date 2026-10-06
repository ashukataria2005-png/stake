"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function CasinoSportsHeroBanner() {
  const [casinoCount, setCasinoCount] = useState<number>(57111);
  const [sportsCount, setSportsCount] = useState<number>(44292);

  // Subtle organic counter jitter for authentic live feel
  useEffect(() => {
    const interval = setInterval(() => {
      setCasinoCount((prev) => Math.max(50000, prev + Math.floor(Math.random() * 21) - 10));
      setSportsCount((prev) => Math.max(35000, prev + Math.floor(Math.random() * 15) - 7));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 my-4">
      {/* 1. Left Card: Casino */}
      <Link
        href="/casino/home"
        className="group relative flex flex-col justify-between rounded-2xl border border-[#213743] bg-gradient-to-br from-[#1a2c38] via-[#14232d] to-[#0f212e] p-3.5 sm:p-5 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[#2f4553] hover:shadow-xl select-none"
      >
        {/* Subtle background glow */}
        <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/20 transition-all duration-300" />

        {/* Text Details */}
        <div className="z-10">
          <h2 className="text-base sm:text-2xl font-black text-white tracking-wider uppercase group-hover:text-[#00e701] transition-colors">
            Casino
          </h2>
          <div className="flex items-center gap-1.5 mt-1 sm:mt-2 text-[11px] sm:text-xs font-semibold text-[#b1bad3]">
            <span className="w-2 h-2 rounded-full bg-[#00e701] shadow-[0_0_8px_#00e701] animate-pulse shrink-0" />
            <span className="tabular-nums font-mono">{casinoCount.toLocaleString("en-US")} playing</span>
          </div>
        </div>

        {/* Graphic: 3D Blue Diamond + Red/White Casino Chip */}
        <div className="mt-3 sm:mt-4 flex items-end justify-end self-end h-14 sm:h-20 w-full relative">
          <svg viewBox="0 0 100 80" className="h-full w-auto drop-shadow-md">
            {/* Red & White Poker Chip */}
            <g transform="translate(15, 30)">
              {/* Chip Shadow & Outer Rim */}
              <ellipse cx="25" cy="25" rx="24" ry="18" fill="#991b1b" />
              <ellipse cx="25" cy="22" rx="24" ry="18" fill="#dc2626" />
              {/* White Dashes */}
              <path d="M7 16 L12 14" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
              <path d="M43 16 L38 14" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
              <path d="M25 4 L25 8" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
              <path d="M25 36 L25 40" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
              {/* Chip Inner Circle */}
              <ellipse cx="25" cy="22" rx="16" ry="12" fill="#ef4444" />
              <ellipse cx="25" cy="22" rx="12" ry="9" fill="#ffffff" />
              <ellipse cx="25" cy="22" rx="9" ry="7" fill="#dc2626" />
              <text x="25" y="24" fill="#ffffff" fontSize="6" fontWeight="bold" textAnchor="middle">★</text>
            </g>

            {/* 3D Blue Diamond */}
            <g transform="translate(50, 10)">
              <defs>
                <linearGradient id="diamondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#0284c7" />
                  <stop offset="100%" stopColor="#0369a1" />
                </linearGradient>
                <linearGradient id="facetLight" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#bae6fd" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>
              {/* Top Crown Facets */}
              <polygon points="20,5 30,5 37,17 13,17" fill="url(#facetLight)" />
              <polygon points="5,17 13,17 20,5 12,5" fill="#7dd3fc" />
              <polygon points="30,5 38,5 45,17 37,17" fill="#0284c7" />
              {/* Bottom Pavilion Facets */}
              <polygon points="13,17 37,17 25,48" fill="url(#diamondGrad)" />
              <polygon points="5,17 13,17 25,48" fill="#0369a1" />
              <polygon points="37,17 45,17 25,48" fill="#075985" />
              {/* Sparkle Glint */}
              <circle cx="20" cy="8" r="1.5" fill="#ffffff" />
            </g>
          </svg>
        </div>
      </Link>

      {/* 2. Right Card: Sports */}
      <Link
        href="/sports"
        className="group relative flex flex-col justify-between rounded-2xl border border-[#213743] bg-gradient-to-br from-[#1a2c38] via-[#14232d] to-[#0f212e] p-3.5 sm:p-5 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[#2f4553] hover:shadow-xl select-none"
      >
        {/* Subtle background glow */}
        <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-300" />

        {/* Text Details */}
        <div className="z-10">
          <h2 className="text-base sm:text-2xl font-black text-white tracking-wider uppercase group-hover:text-blue-400 transition-colors">
            Sports
          </h2>
          <div className="flex items-center gap-1.5 mt-1 sm:mt-2 text-[11px] sm:text-xs font-semibold text-[#b1bad3]">
            <span className="w-2 h-2 rounded-full bg-[#00e701] shadow-[0_0_8px_#00e701] animate-pulse shrink-0" />
            <span className="tabular-nums font-mono">{sportsCount.toLocaleString("en-US")} betting</span>
          </div>
        </div>

        {/* Graphic: 3D Silver Trophy + Blue Stake Soccer Ball */}
        <div className="mt-3 sm:mt-4 flex items-end justify-end self-end h-14 sm:h-20 w-full relative">
          <svg viewBox="0 0 100 80" className="h-full w-auto drop-shadow-md">
            <defs>
              <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f1f5f9" />
                <stop offset="50%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#64748b" />
              </linearGradient>
              <linearGradient id="goldAcc" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
            </defs>

            {/* 3D Silver Trophy Cup */}
            <g transform="translate(18, 12)">
              {/* Handles */}
              <path d="M6 10 C-3 10 -3 24 8 26" fill="none" stroke="url(#silverGrad)" strokeWidth="3" strokeLinecap="round" />
              <path d="M34 10 C43 10 43 24 32 26" fill="none" stroke="url(#silverGrad)" strokeWidth="3" strokeLinecap="round" />
              {/* Cup Body */}
              <path d="M7 6 L33 6 L30 26 C28 34 12 34 10 26 Z" fill="url(#silverGrad)" />
              {/* Trophy Rim */}
              <ellipse cx="20" cy="6" rx="13" ry="3.5" fill="#f8fafc" />
              {/* Cup Stem & Base */}
              <path d="M17 32 L23 32 L23 38 L17 38 Z" fill="#94a3b8" />
              <path d="M12 38 L28 38 L29 44 L11 44 Z" fill="#64748b" />
              <rect x="14" y="40" width="12" height="2" fill="url(#goldAcc)" rx="0.5" />
            </g>

            {/* Blue Stake Soccer Ball */}
            <g transform="translate(54, 26)">
              <circle cx="20" cy="20" r="18" fill="#f8fafc" stroke="#334155" strokeWidth="1" />
              {/* Pentagon Center */}
              <polygon points="20,13 26,17 24,24 16,24 14,17" fill="#0284c7" />
              {/* Connecting Edges */}
              <line x1="20" y1="13" x2="20" y2="4" stroke="#0f172a" strokeWidth="1.5" />
              <line x1="26" y1="17" x2="34" y2="13" stroke="#0f172a" strokeWidth="1.5" />
              <line x1="24" y1="24" x2="31" y2="31" stroke="#0f172a" strokeWidth="1.5" />
              <line x1="16" y1="24" x2="9" y2="31" stroke="#0f172a" strokeWidth="1.5" />
              <line x1="14" y1="17" x2="6" y2="13" stroke="#0f172a" strokeWidth="1.5" />
              {/* Surrounding Patches */}
              <polygon points="18,3 22,3 25,6 15,6" fill="#38bdf8" />
              <polygon points="35,12 38,15 35,21 32,17" fill="#0284c7" />
            </g>
          </svg>
        </div>
      </Link>
    </div>
  );
}
