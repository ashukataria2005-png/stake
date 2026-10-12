"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Layers } from "lucide-react";
import { PROVIDERS_LIST } from "@/data/stakeGames";
import { ProviderLogo } from "@/components/casino/ProviderLogos";
import CasinoLiveBets from "@/components/casino/CasinoLiveBets";

export default function ProvidersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProviders = PROVIDERS_LIST.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
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
                {PROVIDERS_LIST.length} PARTNERS
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
              <span>{PROVIDERS_LIST.length} Certified Studios • 2,500+ Games • Provably Fair Certified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-[#1a2c38] p-3 rounded-xl border border-[#213743] flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b1bad3]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search provider by name..."
            className="w-full bg-[#0f212e] border border-[#213743] hover:border-[#2f4553] focus:border-[#2f4553] text-white text-sm font-semibold rounded-lg pl-9.5 pr-4 py-2.5 outline-none transition-colors placeholder:text-[#b1bad3]"
          />
        </div>
        <div className="text-xs text-[#b1bad3] shrink-0 font-medium hidden sm:block">
          Showing <strong className="text-white">{filteredProviders.length}</strong> providers
        </div>
      </div>

      {/* 1:1 Authentic Stake Publishers / Providers Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
        {filteredProviders.map((provider) => {
          const targetHref =
            provider.id === "stake-originals" || provider.id === "pub-stake"
              ? "/casino/group/stake-originals"
              : provider.id === "evolution" || provider.id === "pub-evolution"
              ? "/casino/group/live-casino"
              : provider.id === "spribe" || provider.id === "pub-spribe"
              ? "/casino/group/spribe"
              : provider.id === "pragmatic-play" || provider.id === "pub-pragmatic"
              ? "/casino/group/pragmatic-play"
              : provider.id === "hacksaw-gaming" || provider.id === "pub-hacksaw"
              ? "/casino/group/hacksaw-gaming"
              : provider.id === "smartsoft" || provider.id === "turbogames"
              ? "/casino/group/turbogames"
              : `/casino/group/slots`;

          return (
            <Link
              key={provider.id}
              href={targetHref}
              className="flex flex-col select-none cursor-pointer group w-full"
            >
              {/* Exact compact rounded pill-box styling */}
              <div className="h-[54px] sm:h-[62px] w-full rounded-xl bg-[#213743] hover:bg-[#2a4454] border border-[#2f4553]/60 flex items-center justify-center p-2.5 transition-transform active:scale-95 cursor-pointer shadow-sm">
                <div className="flex items-center justify-center max-w-full overflow-hidden text-white font-semibold">
                  <ProviderLogo id={provider.id} name={provider.name} />
                </div>
              </div>

              {/* Live active player count indicator underneath each box */}
              <div className="flex items-center justify-center gap-1.5 mt-1.5 text-[10px] sm:text-xs font-semibold text-[#b1bad3]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e701] shadow-[0_0_6px_#00e701] shrink-0" />
                <span>
                  {(provider.playersCount || 1200).toLocaleString("en-US")} playing
                </span>
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
