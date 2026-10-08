"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Zap,
  Flame,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { TRENDING_SPORTS, SportItem } from "@/data/trendingSports";
import SportArtwork from "@/components/sports/SportArtwork";

export default function SportsbookPage() {
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredSports = TRENDING_SPORTS.filter((sport) => {
    const matchesFilter =
      selectedTab === "all" ||
      sport.category === selectedTab;

    const matchesSearch =
      searchQuery.trim() === "" ||
      sport.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sport.displayName ? sport.displayName.toLowerCase().includes(searchQuery.toLowerCase()) : false);

    return matchesFilter && matchesSearch;
  });

  const totalLiveMatches = TRENDING_SPORTS.reduce((acc, s) => acc + s.liveMatches, 0);

  return (
    <div className="space-y-6 pb-12 pt-2">
      {/* Sportsbook Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#071829] via-[#0d2a4a] to-[#0f212e] border border-[#213743] p-6 sm:p-8">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#00e701]/10 border border-[#00e701]/30 px-3 py-1 text-xs font-bold text-[#00e701]">
            <span className="w-2 h-2 rounded-full bg-[#00e701] animate-pulse" />
            <span>{totalLiveMatches} Live Sporting Events Worldwide</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Stake Sportsbook & Live Betting
          </h1>

          <p className="text-sm text-[#b1bad3] leading-relaxed">
            Bet on premier leagues, grand slams, esports championships, and global tournaments with industry-leading odds, instant crypto payouts, and live streaming.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/sports/soccer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#00e701] px-5 py-2.5 text-xs sm:text-sm font-extrabold text-[#0f212e] hover:bg-[#00c701] transition-colors shadow-lg shadow-[#00e701]/20 active:scale-95"
            >
              <span>Explore Live Soccer</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/sports/cs2"
              className="inline-flex items-center gap-2 rounded-xl bg-[#213743] hover:bg-[#2f4553] px-4 py-2.5 text-xs sm:text-sm font-bold text-white transition-colors active:scale-95"
            >
              <span>Esports & CS2</span>
            </Link>
          </div>
        </div>

        {/* Ambient Sports Background Accents */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none hidden md:block">
          <div className="w-full h-full bg-radial from-[#38bdf8] to-transparent blur-3xl" />
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {[
            { id: "all", label: "All Sports", emoji: "🏆" },
            { id: "traditional", label: "Traditional", emoji: "⚽" },
            { id: "esports", label: "Esports", emoji: "🎮" },
            { id: "combat", label: "Combat", emoji: "🥊" },
            { id: "racing", label: "Racing", emoji: "🏎️" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedTab === tab.id
                  ? "bg-[#213743] text-white border border-[#2f4553] shadow-sm"
                  : "bg-[#1a2c38] text-[#b1bad3] hover:text-white hover:bg-[#213743]/60"
              }`}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px] sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#b1bad3]" />
          <input
            type="text"
            placeholder="Search sports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1a2c38] border border-[#213743] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#b1bad3] focus:outline-none focus:border-[#00e701] transition-colors"
          />
        </div>
      </div>

      {/* Complete Sports Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {filteredSports.map((sport) => (
          <Link
            key={sport.id}
            href={`/sports/${sport.id}`}
            className="group relative flex flex-col select-none cursor-pointer"
          >
            <div
              className={`relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[#0f212e] border border-[#213743] ${sport.accentBorder} transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-2xl shadow-md`}
            >
              {/* Artwork Cutout Poster */}
              <SportArtwork sportId={sport.id} sport={sport} />

              {/* Top Live Badge */}
              <div className="absolute top-2.5 left-2.5 z-20 flex items-center">
                <span className="flex items-center gap-1 rounded-md bg-[#0a151d]/90 backdrop-blur-sm border border-[#213743] px-1.5 py-0.5 text-[9px] font-mono text-[#00e701] font-bold shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00e701] animate-pulse" />
                  {sport.liveMatches} Live
                </span>
              </div>

              {/* Bottom Scrim & Bold Typography */}
              {(!sport.image || sport.image.trim() === "") && (
                <div className="absolute inset-x-0 bottom-0 z-20 p-2.5 pt-8 bg-gradient-to-t from-[#0b1622] via-[#0b1622]/85 to-transparent text-center">
                  <h3 className="text-xs font-black tracking-wider text-white group-hover:text-[#00e701] transition-colors truncate uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                    {sport.displayName || sport.name}
                  </h3>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {filteredSports.length === 0 && (
        <div className="p-12 text-center rounded-2xl border border-[#213743] bg-[#1a2c38] space-y-2">
          <p className="text-sm font-bold text-white">No sports match &quot;{searchQuery}&quot;</p>
          <p className="text-xs text-[#b1bad3]">Try searching for Soccer, Tennis, Cricket, or CS2.</p>
        </div>
      )}
    </div>
  );
}
