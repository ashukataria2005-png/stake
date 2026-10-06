"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";

interface LiveStatusAndSearchProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  showPills?: boolean;
}

export default function LiveStatusAndSearch({
  searchQuery,
  setSearchQuery,
  showPills = true,
}: LiveStatusAndSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Live realistic counters with subtle organic jitter
  const [casinoCount, setCasinoCount] = useState<number>(62251);
  const [sportsCount, setSportsCount] = useState<number>(34670);

  useEffect(() => {
    const interval = setInterval(() => {
      setCasinoCount((prev) => Math.max(50000, prev + Math.floor(Math.random() * 21) - 10));
      setSportsCount((prev) => Math.max(25000, prev + Math.floor(Math.random() * 15) - 7));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Global Ctrl + K / Cmd + K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="space-y-3.5 my-4">
      {/* 1. Two Compact Status Pill Cards */}
      {showPills && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Casino Status Pill Card */}
          <div className="bg-[#1a2c38] border border-[#213743] hover:border-[#2f4553] rounded-lg px-4 py-2.5 flex items-center justify-between transition-colors shadow-sm select-none">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e701] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00e701]" />
              </span>
              <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                Casino
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xs sm:text-sm font-semibold text-[#b1bad3] tabular-nums">
              <span className="text-[#00e701] font-bold">🟢</span>
              <span>{casinoCount.toLocaleString("en-US")}</span>
            </div>
          </div>

          {/* Sports Status Pill Card */}
          <div className="bg-[#1a2c38] border border-[#213743] hover:border-[#2f4553] rounded-lg px-4 py-2.5 flex items-center justify-between transition-colors shadow-sm select-none">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e701] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00e701]" />
              </span>
              <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                Sports
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xs sm:text-sm font-semibold text-[#b1bad3] tabular-nums">
              <span className="text-[#00e701] font-bold">🟢</span>
              <span>{sportsCount.toLocaleString("en-US")}</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Global Stake Search Bar with Ctrl+K shortcut badge */}
      <div className="bg-[#1a2c38] border border-[#213743] hover:border-[#2f4553] focus-within:border-[#00e701] rounded-lg px-4 py-2.5 flex items-center gap-3 transition-colors shadow-sm">
        <Search className="h-4 w-4 text-[#b1bad3] flex-shrink-0" />
        <input
          ref={inputRef}
          id="game-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Stake.com"
          className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-[#7a889b] focus:outline-none"
        />
        <kbd className="hidden md:flex items-center text-[11px] font-semibold text-[#b1bad3] bg-[#0f212e] px-2 py-0.5 rounded border border-[#213743] select-none flex-shrink-0">
          Ctrl + K
        </kbd>
      </div>
    </div>
  );
}
