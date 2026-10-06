"use client";

import React from "react";
import { useGame } from "@/context/GameContext";

export default function GuestHero() {
  const { openOneTap } = useGame();

  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#213743] bg-gradient-to-b from-[#1a2c38] via-[#14232e] to-[#0f212e] p-6 sm:p-8 md:p-10 mb-8 shadow-2xl">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(20,117,225,0.18)_0%,_rgba(15,33,46,0)_70%)] pointer-events-none" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#1475e1]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Layout: Responsive between Mobile & Desktop */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        
        {/* Visual Artwork Container */}
        <div className="relative w-full max-w-3xl flex items-center justify-center py-2 sm:py-4">
          
          {/* Desktop Left Decor: Gold Championship Trophy & 8-Ball */}
          <div className="hidden lg:flex flex-col items-center gap-3 absolute left-4 top-1/2 -translate-y-1/2 animate-float-slow select-none">
            {/* Championship Trophy */}
            <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-[#0f212e]/90 border border-amber-500/30 shadow-[0_0_25px_rgba(245,158,11,0.25)]">
              <span className="text-4xl filter drop-shadow-[0_4px_8px_rgba(245,158,11,0.5)]">🏆</span>
              <span className="absolute -top-1 -right-1 text-amber-300 text-xs animate-ping">✨</span>
            </div>
            {/* 8-Ball Pill */}
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-black border-2 border-slate-700 shadow-lg text-white font-black text-sm">
              <span className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-xs font-bold">
                8
              </span>
            </div>
          </div>

          {/* Core 3D Floating Assets Center Arena (Mobile & Desktop Parity) */}
          <div className="relative flex items-center justify-center gap-4 sm:gap-8 my-2 sm:my-4">
            
            {/* Floating Stake Basketball */}
            <div className="relative animate-float-slow select-none">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-800 via-orange-600 to-amber-500 shadow-[0_10px_25px_rgba(234,88,12,0.4)] border border-orange-400/40 relative overflow-hidden flex items-center justify-center">
                {/* Basketball Ribbed Seams */}
                <svg className="absolute inset-0 w-full h-full stroke-black/70 stroke-[2] fill-none" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="49" />
                  <line x1="0" y1="50" x2="100" y2="50" />
                  <line x1="50" y1="0" x2="50" y2="100" />
                  <path d="M15,15 Q50,50 15,85" />
                  <path d="M85,15 Q50,50 85,85" />
                </svg>
                {/* 3D Specular Highlight */}
                <div className="absolute top-2 left-3 w-5 h-2.5 rounded-full bg-white/30 rotate-[-25deg] blur-[1px]" />
              </div>
            </div>

            {/* Glowing Multifaceted Blue Diamond Gem */}
            <div className="relative animate-float-reverse select-none scale-110 sm:scale-125 z-10">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-blue-700 via-cyan-500 to-sky-300 p-0.5 shadow-[0_0_35px_rgba(56,189,248,0.6)] rotate-45 flex items-center justify-center relative overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-cyan-400/90 via-blue-600/90 to-indigo-900 rounded-2xl flex items-center justify-center relative">
                  {/* Facet lines */}
                  <svg className="w-12 h-12 stroke-white/60 stroke-[1.5] fill-white/10 -rotate-45" viewBox="0 0 24 24">
                    <polygon points="6,3 18,3 22,9 12,22 2,9" />
                    <line x1="2" y1="9" x2="22" y2="9" />
                    <line x1="6" y1="3" x2="12" y2="22" />
                    <line x1="18" y1="3" x2="12" y2="22" />
                  </svg>
                  {/* Light sparkle */}
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent animate-pulse" />
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 text-cyan-300 text-sm animate-bounce">
                💎
              </div>
            </div>

            {/* Translucent Red Casino Dice with White Dots */}
            <div className="relative animate-float-slow select-none">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-red-700 via-rose-600 to-red-500 shadow-[0_10px_25px_rgba(225,29,72,0.45)] border border-rose-300/40 p-2.5 flex flex-col justify-between rotate-[-12deg] relative backdrop-blur-md">
                {/* 5 Dots pattern */}
                <div className="flex justify-between">
                  <div className="w-2.5 h-2.5 rounded-full bg-white shadow-inner" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white shadow-inner" />
                </div>
                <div className="flex justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-white shadow-inner" />
                </div>
                <div className="flex justify-between">
                  <div className="w-2.5 h-2.5 rounded-full bg-white shadow-inner" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white shadow-inner" />
                </div>
                {/* Translucent glossy reflex */}
                <div className="absolute inset-x-1 top-1 h-3 rounded-t-xl bg-white/25" />
              </div>
            </div>

          </div>

          {/* Desktop Right Decor: F1 Checkered Racing Flag & Basketball */}
          <div className="hidden lg:flex flex-col items-center gap-3 absolute right-4 top-1/2 -translate-y-1/2 animate-float-reverse select-none">
            {/* Checkered Racing Flag */}
            <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-[#0f212e]/90 border border-emerald-500/30 shadow-[0_0_25px_rgba(0,231,1,0.2)]">
              <span className="text-4xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">🏁</span>
              <span className="absolute bottom-1 right-2 text-[10px] font-black text-[#00e701] tracking-wider uppercase">F1 TEAM</span>
            </div>
            {/* Football / Soccer Ball */}
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-900 border border-slate-600 shadow-md text-xl">
              ⚽
            </div>
          </div>

        </div>

        {/* Typography Headline */}
        <h1 className="text-white font-black text-2xl sm:text-3xl text-center tracking-tight leading-snug max-w-md mx-auto mt-4">
          World&apos;s Largest Online Casino and Sportsbook
        </h1>

        {/* Action Section: Register Button + Social Auth Strip */}
        <div className="w-full max-w-md mx-auto mt-5">
          {/* Primary CTA Button */}
          <button
            onClick={openOneTap}
            className="w-full bg-[#1475e1] text-white font-bold py-3.5 rounded-lg hover:brightness-110 active:scale-[0.99] transition-all text-base shadow-lg shadow-blue-600/30 cursor-pointer flex items-center justify-center gap-2 group"
          >
            <span>Register</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>

          {/* Centered Divider Text: "Or Continue With" */}
          <div className="relative my-3.5 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#213743]" />
            </div>
            <span className="relative bg-[#172733] px-3 text-xs font-medium text-[#b1bad3] uppercase tracking-wider">
              Or Continue With
            </span>
          </div>

          {/* Social Auth Strip: 3-column row (Google, Facebook, Kick) */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {/* 1. Google Button */}
            <button
              onClick={openOneTap}
              title="Continue with Google"
              className="bg-[#213743] hover:bg-[#2a4555] border border-[#2f4553] py-2.5 rounded-lg flex items-center justify-center transition-all cursor-pointer group active:scale-95"
            >
              {/* Google Multi-color Icon */}
              <svg className="w-5 h-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.04h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.04c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.25 21.35 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.28c-.25-.72-.38-1.49-.38-2.28s.13-1.56.38-2.28V6.59H1.26C.46 8.19 0 9.99 0 12s.46 3.81 1.26 5.41l4.02-3.13z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.65 1.26 6.59l4.02 3.13c.95-2.83 3.6-4.97 6.72-4.97z"
                />
              </svg>
            </button>

            {/* 2. Facebook Button */}
            <button
              onClick={openOneTap}
              title="Continue with Facebook"
              className="bg-[#213743] hover:bg-[#2a4555] border border-[#2f4553] py-2.5 rounded-lg flex items-center justify-center transition-all cursor-pointer group active:scale-95"
            >
              {/* Facebook Icon */}
              <svg className="w-5 h-5 text-[#1877F2] fill-current transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </button>

            {/* 3. Kick Button */}
            <button
              onClick={openOneTap}
              title="Continue with Kick"
              className="bg-[#213743] hover:bg-[#2a4555] border border-[#2f4553] py-2.5 rounded-lg flex items-center justify-center transition-all cursor-pointer group active:scale-95"
            >
              {/* Kick Neon Green 'K' Icon */}
              <span className="font-black text-[#53fc18] text-lg leading-none transition-transform group-hover:scale-110 drop-shadow-[0_0_8px_rgba(83,252,24,0.6)]">
                K
              </span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
