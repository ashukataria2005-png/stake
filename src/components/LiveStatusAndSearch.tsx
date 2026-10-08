"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";

interface LiveStatusAndSearchProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  showPills?: boolean;
  showSearch?: boolean;
}

export default function LiveStatusAndSearch({
  searchQuery,
  setSearchQuery,
  showPills = true,
  showSearch = true,
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
      {showSearch && (
        <div className="border-2 border-[#2f4553] focus-within:border-[#557086] bg-[#0f212e] rounded-xl shadow-md transition-colors px-4 py-2.5 flex items-center gap-3">
          <Search className="stroke-[2.5] text-white w-4 h-4 shrink-0" />
          <input
            ref={inputRef}
            id="game-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Stake.com"
            className="font-bold text-white placeholder:font-semibold placeholder-[#b1bad3] tracking-wide text-sm sm:text-base outline-none bg-transparent w-full"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-[#b1bad3] hover:text-white p-1 text-xs cursor-pointer rounded hover:bg-[#213743] shrink-0"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
          <kbd className="hidden md:flex items-center text-xs font-bold text-[#b1bad3] bg-[#1a2c38] px-2 py-0.5 rounded border border-[#2f4553] select-none flex-shrink-0">
            Ctrl + K
          </kbd>
        </div>
      )}
    </div>
  );
}
