"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BANNER_ASSETS } from "@/data/bannerAssets";

export default function CasinoSportsHeroBanner() {
  const [casinoCount, setCasinoCount] = useState<number>(65562);
  const [sportsCount, setSportsCount] = useState<number>(39681);

  const [casinoImgError, setCasinoImgError] = useState<boolean>(false);
  const [sportsImgError, setSportsImgError] = useState<boolean>(false);

  // Subtle organic counter jitter for authentic live feel
  useEffect(() => {
    const interval = setInterval(() => {
      setCasinoCount((prev) => Math.max(50000, prev + Math.floor(Math.random() * 21) - 10));
      setSportsCount((prev) => Math.max(30000, prev + Math.floor(Math.random() * 15) - 7));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const casinoImgUrl = BANNER_ASSETS.casinoHero.image;
  const sportsImgUrl = BANNER_ASSETS.sportsHero.image;

  return (
    <div className="grid grid-cols-2 gap-3 w-full my-3 select-none">
      {/* 1. Left Card: CASINO */}
      <Link
        href={BANNER_ASSETS.casinoHero.href || "/casino/home"}
        className="group min-h-[175px] sm:min-h-[210px] w-full rounded-2xl overflow-hidden bg-[#0f212e] border border-[#213743] hover:border-[#2f4553] flex flex-col justify-between transition-transform duration-200 active:scale-[0.98] shadow-lg"
      >
        {/* Top Blue Graphic Stage */}
        <div className="relative h-[125px] sm:h-[155px] w-full overflow-hidden bg-gradient-to-b from-[#1475e1] to-[#0b4bb1] p-3 flex flex-col justify-between">
          {/* Ambient stage shine */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          {/* Title */}
          <div className="z-10">
            <h2 className="text-white font-extrabold text-base sm:text-lg tracking-wide uppercase drop-shadow-md">
              {BANNER_ASSETS.casinoHero.title || "CASINO"}
            </h2>
          </div>

          {/* Centered 3D Artwork */}
          <div className="relative z-0 flex items-center justify-center my-auto w-full">
            {casinoImgUrl && !casinoImgError ? (
              <img
                src={casinoImgUrl}
                alt="Casino"
                onError={() => setCasinoImgError(true)}
                className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-2xl mx-auto transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              /* High-Fidelity 3D Blue Diamond & Red/White Casino Chip */
              <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center mx-auto drop-shadow-2xl transition-transform duration-300 group-hover:scale-105">
                <svg viewBox="0 0 100 90" className="w-full h-full">
                  <defs>
                    <radialGradient id="chipGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#991b1b" />
                    </radialGradient>
                    <linearGradient id="facetTop" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#e0f2fe" />
                      <stop offset="100%" stopColor="#38bdf8" />
                    </linearGradient>
                    <linearGradient id="facetMain" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="50%" stopColor="#0284c7" />
                      <stop offset="100%" stopColor="#075985" />
                    </linearGradient>
                  </defs>

                  {/* 3D Casino Chip (Back Left) */}
                  <g transform="translate(10, 32)">
                    {/* Chip Edge / Thickness */}
                    <ellipse cx="28" cy="28" rx="26" ry="19" fill="#7f1d1d" />
                    <ellipse cx="28" cy="25" rx="26" ry="19" fill="url(#chipGlow)" />
                    {/* White Edge Inlays */}
                    <path d="M8 20 L14 17" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" />
                    <path d="M48 20 L42 17" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" />
                    <path d="M28 8 L28 12" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" />
                    <path d="M28 38 L28 42" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" />
                    {/* Inner Gold Border & Inset */}
                    <ellipse cx="28" cy="25" rx="17" ry="12" fill="#b91c1c" />
                    <ellipse cx="28" cy="25" rx="13" ry="9" fill="#ffffff" />
                    <ellipse cx="28" cy="25" rx="10" ry="7" fill="#ef4444" />
                    <text x="28" y="28" fill="#ffffff" fontSize="7" fontWeight="900" textAnchor="middle">
                      ★
                    </text>
                  </g>

                  {/* 3D Sparkling Blue Diamond (Front Right) */}
                  <g transform="translate(42, 6)">
                    {/* Crown Top facets */}
                    <polygon points="26,6 40,6 48,22 18,22" fill="url(#facetTop)" />
                    <polygon points="8,22 18,22 26,6 16,6" fill="#bae6fd" />
                    <polygon points="40,6 50,6 58,22 48,22" fill="#0284c7" />
                    {/* Pavilion Lower facets */}
                    <polygon points="18,22 48,22 33,62" fill="url(#facetMain)" />
                    <polygon points="8,22 18,22 33,62" fill="#0284c7" />
                    <polygon points="48,22 58,22 33,62" fill="#0c4a6e" />
                    {/* Star Glint */}
                    <circle cx="26" cy="10" r="2.5" fill="#ffffff" />
                    <path d="M26 4 L26 16 M20 10 L32 10" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
                  </g>
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Status Strip */}
        <div className="bg-[#0f212e] px-3 py-2.5 flex items-center gap-1.5 border-t border-[#1a2c38]">
          <span className="w-2 h-2 rounded-full bg-[#00e701] shadow-[0_0_8px_#00e701] animate-pulse shrink-0" />
          <span className="text-xs sm:text-sm font-semibold text-[#b1bad3] tabular-nums font-mono">
            {casinoCount.toLocaleString("en-US")} playing
          </span>
        </div>
      </Link>

      {/* 2. Right Card: SPORTS */}
      <Link
        href={BANNER_ASSETS.sportsHero.href || "/sports"}
        className="group min-h-[175px] sm:min-h-[210px] w-full rounded-2xl overflow-hidden bg-[#0f212e] border border-[#213743] hover:border-[#2f4553] flex flex-col justify-between transition-transform duration-200 active:scale-[0.98] shadow-lg"
      >
        {/* Top Blue Graphic Stage */}
        <div className="relative h-[125px] sm:h-[155px] w-full overflow-hidden bg-gradient-to-b from-[#1475e1] to-[#0b4bb1] p-3 flex flex-col justify-between">
          {/* Ambient stage shine */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          {/* Title */}
          <div className="z-10">
            <h2 className="text-white font-extrabold text-base sm:text-lg tracking-wide uppercase drop-shadow-md">
              {BANNER_ASSETS.sportsHero.title || "SPORTS"}
            </h2>
          </div>

          {/* Centered 3D Artwork */}
          <div className="relative z-0 flex items-center justify-center my-auto w-full">
            {sportsImgUrl && !sportsImgError ? (
              <img
                src={sportsImgUrl}
                alt="Sports"
                onError={() => setSportsImgError(true)}
                className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-2xl mx-auto transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              /* High-Fidelity 3D Silver/Gold Trophy & Stake Blue Football */
              <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center mx-auto drop-shadow-2xl transition-transform duration-300 group-hover:scale-105">
                <svg viewBox="0 0 100 90" className="w-full h-full">
                  <defs>
                    <linearGradient id="trophyGold" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fef08a" />
                      <stop offset="35%" stopColor="#facc15" />
                      <stop offset="70%" stopColor="#eab308" />
                      <stop offset="100%" stopColor="#ca8a04" />
                    </linearGradient>
                    <linearGradient id="silverRim" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#cbd5e1" />
                    </linearGradient>
                  </defs>

                  {/* 3D Trophy (Left) */}
                  <g transform="translate(8, 8)">
                    {/* Handles */}
                    <path
                      d="M8 14 C-4 14 -4 30 10 32"
                      fill="none"
                      stroke="url(#trophyGold)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M40 14 C52 14 52 30 38 32"
                      fill="none"
                      stroke="url(#trophyGold)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    {/* Cup Body */}
                    <path
                      d="M9 8 L39 8 L35 34 C33 44 15 44 13 34 Z"
                      fill="url(#trophyGold)"
                    />
                    {/* Cup Opening Rim */}
                    <ellipse cx="24" cy="8" rx="15" ry="4" fill="url(#silverRim)" />
                    {/* Stem & Solid Base */}
                    <path d="M21 41 L27 41 L27 48 L21 48 Z" fill="#a16207" />
                    <path d="M15 48 L33 48 L35 56 L13 56 Z" fill="#713f12" />
                    <rect x="16" y="50" width="16" height="3" fill="#fef08a" rx="0.5" />
                    {/* Star Badge on Trophy */}
                    <text x="24" y="27" fill="#713f12" fontSize="9" fontWeight="900" textAnchor="middle">
                      ★
                    </text>
                  </g>

                  {/* 3D Stake Soccer Ball (Right) */}
                  <g transform="translate(50, 24)">
                    <circle cx="24" cy="24" r="22" fill="#f8fafc" stroke="#334155" strokeWidth="1.2" />
                    {/* Blue Pentagon Center */}
                    <polygon points="24,15 31,20 28,29 20,29 17,20" fill="#0284c7" />
                    {/* Seam Lines */}
                    <line x1="24" y1="15" x2="24" y2="4" stroke="#0f172a" strokeWidth="1.8" />
                    <line x1="31" y1="20" x2="41" y2="15" stroke="#0f172a" strokeWidth="1.8" />
                    <line x1="28" y1="29" x2="37" y2="38" stroke="#0f172a" strokeWidth="1.8" />
                    <line x1="20" y1="29" x2="11" y2="38" stroke="#0f172a" strokeWidth="1.8" />
                    <line x1="17" y1="20" x2="7" y2="15" stroke="#0f172a" strokeWidth="1.8" />
                    {/* Surrounding Blue Hex Patches */}
                    <polygon points="21,3 27,3 30,7 18,7" fill="#38bdf8" />
                    <polygon points="42,14 46,18 42,25 38,20" fill="#0284c7" />
                    <polygon points="35,39 39,43 32,45 28,41" fill="#38bdf8" />
                    <polygon points="13,39 9,43 16,45 20,41" fill="#0284c7" />
                    <polygon points="6,14 2,18 6,25 10,20" fill="#38bdf8" />
                  </g>
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Status Strip */}
        <div className="bg-[#0f212e] px-3 py-2.5 flex items-center gap-1.5 border-t border-[#1a2c38]">
          <span className="w-2 h-2 rounded-full bg-[#00e701] shadow-[0_0_8px_#00e701] animate-pulse shrink-0" />
          <span className="text-xs sm:text-sm font-semibold text-[#b1bad3] tabular-nums font-mono">
            {sportsCount.toLocaleString("en-US")} betting
          </span>
        </div>
      </Link>
    </div>
  );
}
