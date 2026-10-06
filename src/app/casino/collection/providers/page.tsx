"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Sparkles, Flame, Users, Layers, ExternalLink } from "lucide-react";
import { PROVIDERS_LIST } from "@/data/stakeGames";
import CasinoLiveBets from "@/components/casino/CasinoLiveBets";

export default function ProvidersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProviders = PROVIDERS_LIST.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      (p.badge && p.badge.toLowerCase().includes(searchQuery.toLowerCase().trim()))
  );

  return (
    <div className="min-h-screen px-3 sm:px-6 py-4 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-[#213743] bg-gradient-to-r from-blue-950/70 via-[#1a2c38] to-[#0f212e] p-5 sm:p-7 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-[#213743] border border-[#2f4553]">
                <Layers className="w-6 h-6 text-[#1475e1]" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Game Providers & Studios
              </h1>
              <span className="rounded-md bg-blue-500/15 text-blue-400 border border-blue-400/30 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                19 PARTNERS
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#b1bad3] max-w-2xl leading-relaxed">
              Explore games from the world&apos;s premier certified gaming software providers, including Stake&apos;s proprietary original titles, high-volatility slot creators, and state-of-the-art live casino studios.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] sm:text-xs text-[#b1bad3] font-medium">
              <span className="flex items-center gap-1.5 text-white font-semibold">
                <span className="text-[#00e701] animate-pulse">🟢</span>
                150K+ Active Players
              </span>
              <span className="text-[#2f4553]">•</span>
              <span>19 Certified Studios • 2,500+ Games • Provably Fair Certified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-[#1a2c38] p-3 rounded-xl border border-[#213743] flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a889b]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search provider by name..."
            className="w-full bg-[#0f212e] border border-[#213743] hover:border-[#2f4553] focus:border-[#1475e1] text-white text-xs rounded-lg pl-9.5 pr-4 py-2.5 outline-none transition-colors placeholder-[#7a889b]"
          />
        </div>
        <div className="text-xs text-[#b1bad3] shrink-0 font-medium hidden sm:block">
          Showing <strong className="text-white">{filteredProviders.length}</strong> providers
        </div>
      </div>

      {/* Providers Grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 md:grid-cols-4 lg:grid-cols-6">
        {filteredProviders.map((provider) => {
          const targetHref =
            provider.id === "stake-originals"
              ? "/casino/group/stake-originals"
              : provider.id === "evolution"
              ? "/casino/group/live-casino"
              : `/casino/group/slots`;

          return (
            <Link
              key={provider.id}
              href={targetHref}
              className="group relative flex flex-col justify-between rounded-xl overflow-hidden border border-[#213743] bg-[#1a2c38] p-4 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#2f4553] hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer select-none"
            >
              {/* Badge */}
              <div className="flex items-center justify-between min-h-[18px]">
                {provider.badge ? (
                  <span className="rounded bg-[#213743] border border-[#2f4553] px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-[#00e701]">
                    {provider.badge}
                  </span>
                ) : (
                  <span />
                )}
                <ExternalLink className="w-3.5 h-3.5 text-[#7a889b] group-hover:text-white transition-colors opacity-0 group-hover:opacity-100" />
              </div>

              {/* Provider Logo Box */}
              <div className="my-5 flex flex-col items-center justify-center text-center">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center border font-black text-lg transition-transform duration-300 group-hover:scale-110 shadow-md ${provider.logoBg}`}
                  style={{ color: provider.accentColor }}
                >
                  {provider.name.charAt(0)}
                </div>
                <h3 className="mt-3 text-xs sm:text-sm font-bold text-white group-hover:text-[#00e701] transition-colors truncate w-full">
                  {provider.name}
                </h3>
                <span className="text-[10px] text-[#7a889b] font-medium">
                  {provider.gamesCount} Games
                </span>
              </div>

              {/* Active Players Pill */}
              <div className="flex items-center justify-center gap-1.5 rounded-md bg-[#0f212e]/80 border border-[#213743] py-1 px-2 text-[10px] font-mono text-[#b1bad3] w-full">
                <span className="text-[#00e701] animate-pulse">🟢</span>
                <span className="font-semibold text-white">
                  {provider.playersCount.toLocaleString("en-US")}
                </span>
                <span className="text-[#7a889b]">playing</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Embedded Live Bets */}
      <div className="pt-6">
        <CasinoLiveBets />
      </div>
    </div>
  );
}
