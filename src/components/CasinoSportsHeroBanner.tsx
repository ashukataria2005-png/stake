"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BANNER_ASSETS } from "@/data/bannerAssets";

export default function CasinoSportsHeroBanner() {
  const [casinoImgError, setCasinoImgError] = useState<boolean>(false);
  const [sportsImgError, setSportsImgError] = useState<boolean>(false);

  const casinoImgUrl = BANNER_ASSETS.casinoHero.image;
  const sportsImgUrl = BANNER_ASSETS.sportsHero.image;

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 w-full my-3 select-none">
      {/* 1. Left Card: CASINO */}
      <Link
        href={BANNER_ASSETS.casinoHero.href || "/casino/home"}
        className="relative w-full h-[180px] sm:h-[2100px] rounded-2xl overflow-hidden bg-[#0f212e] border border-[#213743] hover:border-[#2f4553] shadow-lg group transition-transform duration-200 active:scale-[0.98]"
      >
        {/* Title Overlay */}
        <span className="absolute top-3 left-3.5 z-10 text-white font-black text-base sm:text-lg tracking-wider drop-shadow-md select-none">
          {BANNER_ASSETS.casinoHero.title || "CASINO"}
        </span>

        {/* Full-bleed image or responsive fallback */}
        {casinoImgUrl && !casinoImgError ? (
          <img
            src={casinoImgUrl}
            alt={BANNER_ASSETS.casinoHero.title || "CASINO"}
            onError={() => setCasinoImgError(true)}
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          /* Edge-to-edge 3D artwork fallback */
          <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-[#1475e1] to-[#0b4bb1] flex items-center justify-center pointer-events-none transition-transform duration-300 group-hover:scale-105">
            <svg
              viewBox="0 0 200 140"
              preserveAspectRatio="xMidYMid slice"
              className="w-full h-full object-cover"
            >
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
                <radialGradient id="shineGlow" cx="60%" cy="40%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Subtle light sweep */}
              <rect x="0" y="0" width="200" height="140" fill="url(#shineGlow)" />

              {/* 3D Casino Chip (Back Left) */}
              <g transform="translate(38, 42)">
                <ellipse cx="28" cy="28" rx="28" ry="20" fill="#7f1d1d" />
                <ellipse cx="28" cy="25" rx="28" ry="20" fill="url(#chipGlow)" />
                <path d="M7 19 L13 16" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" />
                <path d="M49 19 L43 16" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" />
                <path d="M28 7 L28 11" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" />
                <path d="M28 39 L28 43" stroke="#ffffff" strokeWidth="4.5" strokeLinecap="round" />
                <ellipse cx="28" cy="25" rx="18" ry="13" fill="#b91c1c" />
                <ellipse cx="28" cy="25" rx="14" ry="10" fill="#ffffff" />
                <ellipse cx="28" cy="25" rx="11" ry="8" fill="#ef4444" />
                <text x="28" y="28" fill="#ffffff" fontSize="8" fontWeight="900" textAnchor="middle">
                  ★
                </text>
              </g>

              {/* 3D Sparkling Blue Diamond (Front Right) */}
              <g transform="translate(95, 16)">
                <polygon points="32,8 50,8 60,28 22,28" fill="url(#facetTop)" />
                <polygon points="10,28 22,28 32,8 20,8" fill="#bae6fd" />
                <polygon points="50,8 62,8 72,28 60,28" fill="#0284c7" />
                <polygon points="22,28 60,28 41,78" fill="url(#facetMain)" />
                <polygon points="10,28 22,28 41,78" fill="#0284c7" />
                <polygon points="60,28 72,28 41,78" fill="#0c4a6e" />
                <circle cx="32" cy="14" r="3" fill="#ffffff" />
                <path d="M32 6 L32 22 M24 14 L40 14" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
              </g>
            </svg>
          </div>
        )}
      </Link>

      {/* 2. Right Card: SPORTS */}
      <Link
        href={BANNER_ASSETS.sportsHero.href || "/sports"}
        className="relative w-full h-[180px] sm:h-[210px] rounded-2xl overflow-hidden bg-[#0f212e] border border-[#213743] hover:border-[#2f4553] shadow-lg group transition-transform duration-200 active:scale-[0.98]"
      >
        {/* Title Overlay */}
        <span className="absolute top-3 left-3.5 z-10 text-white font-black text-base sm:text-lg tracking-wider drop-shadow-md select-none">
          {BANNER_ASSETS.sportsHero.title || "SPORTS"}
        </span>

        {/* Full-bleed image or responsive fallback */}
        {sportsImgUrl && !sportsImgError ? (
          <img
            src={sportsImgUrl}
            alt={BANNER_ASSETS.sportsHero.title || "SPORTS"}
            onError={() => setSportsImgError(true)}
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          /* Edge-to-edge 3D artwork fallback */
          <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-[#1475e1] to-[#0b4bb1] flex items-center justify-center pointer-events-none transition-transform duration-300 group-hover:scale-105">
            <svg
              viewBox="0 0 200 140"
              preserveAspectRatio="xMidYMid slice"
              className="w-full h-full object-cover"
            >
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
                <radialGradient id="shineGlowSports" cx="40%" cy="30%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#ffffff" />
                </radialGradient>
              </defs>

              {/* Subtle light sweep */}
              <rect x="0" y="0" width="200" height="140" fill="url(#shineGlowSports)" />

              {/* 3D Trophy (Left) */}
              <g transform="translate(35, 20)">
                <path
                  d="M9 16 C-5 16 -5 34 11 36"
                  fill="none"
                  stroke="url(#trophyGold)"
                  strokeWidth="3.8"
                  strokeLinecap="round"
                />
                <path
                  d="M45 16 C59 16 59 34 43 36"
                  fill="none"
                  stroke="url(#trophyGold)"
                  strokeWidth="3.8"
                  strokeLinecap="round"
                />
                <path
                  d="M10 9 L44 9 L40 38 C37 49 17 49 14 38 Z"
                  fill="url(#trophyGold)"
                />
                <ellipse cx="27" cy="9" rx="17" ry="4.5" fill="url(#silverRim)" />
                <path d="M24 46 L30 46 L30 54 L24 54 Z" fill="#a16207" />
                <path d="M17 54 L37 54 L39 63 L15 63 Z" fill="#713f12" />
                <rect x="18" y="56" width="18" height="3.5" fill="#fef08a" rx="0.5" />
                <text x="27" y="30" fill="#713f12" fontSize="10" fontWeight="900" textAnchor="middle">
                  ★
                </text>
              </g>

              {/* 3D Stake Soccer Ball (Right) */}
              <g transform="translate(100, 32)">
                <circle cx="28" cy="28" r="26" fill="#f8fafc" stroke="#334155" strokeWidth="1.2" />
                <polygon points="28,17 36,23 33,34 23,34 20,23" fill="#0284c7" />
                <line x1="28" y1="17" x2="28" y2="4" stroke="#0f172a" strokeWidth="2" />
                <line x1="36" y1="23" x2="48" y2="17" stroke="#0f172a" strokeWidth="2" />
                <line x1="33" y1="34" x2="43" y2="45" stroke="#0f172a" strokeWidth="2" />
                <line x1="23" y1="34" x2="13" y2="45" stroke="#0f172a" strokeWidth="2" />
                <line x1="20" y1="23" x2="8" y2="17" stroke="#0f172a" strokeWidth="2" />
                <polygon points="25,3 31,3 35,7 21,7" fill="#38bdf8" />
                <polygon points="49,16 54,21 49,29 44,23" fill="#0284c7" />
                <polygon points="41,46 45,51 37,53 32,48" fill="#38bdf8" />
                <polygon points="15,46 10,51 18,53 23,48" fill="#0284c7" />
                <polygon points="7,16 2,21 7,29 12,23" fill="#38bdf8" />
              </g>
            </svg>
          </div>
        )}
      </Link>
    </div>
  );
}
