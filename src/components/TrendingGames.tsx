"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TrendingUp, Play } from "lucide-react";

interface TrendingGameItem {
  id: string;
  title: string;
  provider: string;
  playersCount: number;
  badge: string;
  badgeColor: string;
  bgGradient: string;
  accentColor: string;
  symbols: string[];
  image?: string;
  href?: string;
}

interface TrendingGamesProps {
  onSelectGame?: (game: { id: string; title: string; provider: string; rtp: string; symbols?: string[] }) => void;
}

export default function TrendingGames({ onSelectGame }: TrendingGamesProps) {
  const [visibleCount, setVisibleCount] = useState<number>(6);

  const initialGames: TrendingGameItem[] = [
    {
      id: "gates-olympus-2500",
      title: "Gates of Olympus 2500",
      provider: "Pragmatic Play",
      playersCount: 846,
      badge: "2,500X MAX",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      bgGradient: "from-amber-950/80 via-[#1a2c38] to-[#0f212e]",
      accentColor: "#eab308",
      symbols: ["⚡", "👑", "💎", "🏺"],
      image: "https://mediumrare.imgix.net/3b470acf1e794ecb437a535c35a20f12e8f7caf1a1153b6601dab4a2d34607e4?auto=format",
    },
    {
      id: "gates-olympus-super-scatter",
      title: "Gates of Olympus Super Scatter",
      provider: "Pragmatic Play",
      playersCount: 641,
      badge: "SUPER SCATTER",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      bgGradient: "from-blue-950/80 via-[#1a2c38] to-[#0f212e]",
      accentColor: "#3b82f6",
      symbols: ["⚡", "💎", "👑", "⭐"],
      image: "https://mediumrare.imgix.net/3b470acf1e794ecb437a535c35a20f12e8f7caf1a1153b6601dab4a2d34607e4?auto=format",
    },
    {
      id: "sharks",
      title: "Sharks!",
      provider: "Push Gaming",
      playersCount: 512,
      badge: "RAZOR FRENZY",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      bgGradient: "from-cyan-950/80 via-[#1a2c38] to-[#0f212e]",
      accentColor: "#06b6d4",
      symbols: ["🦈", "🌊", "⚓", "💎"],
      image: "https://mediumrare.imgix.net/edfa399c2e46da7e0593a0e543ba66b129e306bdc6c77a8632c320fec8a04bed?auto=format",
    },
    {
      id: "big-bass-vegas-1000",
      title: "Big Bass Vegas 1000",
      provider: "Reel Kingdom",
      playersCount: 489,
      badge: "VEGAS REELS",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      bgGradient: "from-purple-950/80 via-[#1a2c38] to-[#0f212e]",
      accentColor: "#a855f7",
      symbols: ["🐟", "🎣", "💰", "🎰"],
      image: "https://mediumrare.imgix.net/edfa399c2e46da7e0593a0e543ba66b129e306bdc6c77a8632c320fec8a04bed?auto=format",
    },
    {
      id: "waylanders-forge",
      title: "Waylanders Forge",
      provider: "Stake Originals",
      playersCount: 723,
      badge: "ORIGINAL",
      badgeColor: "bg-[#00e701]/20 text-[#00e701] border-[#00e701]/30",
      bgGradient: "from-emerald-950/80 via-[#1a2c38] to-[#0f212e]",
      accentColor: "#00e701",
      symbols: ["⚔️", "🛡️", "🔨", "🔥"],
      href: "/games/mines",
      image: "https://mediumrare.imgix.net/8c1768b783a43931a4ebc8784ce64085e39139d262e6bb50da242b9f3fda70da?auto=format",
    },
    {
      id: "odins-vault",
      title: "Odin's Vault",
      provider: "Pragmatic Play",
      playersCount: 394,
      badge: "VAULT CASH",
      badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
      bgGradient: "from-indigo-950/80 via-[#1a2c38] to-[#0f212e]",
      accentColor: "#6366f1",
      symbols: ["🦅", "⚡", "🗝️", "👑"],
      image: "https://mediumrare.imgix.net/3b470acf1e794ecb437a535c35a20f12e8f7caf1a1153b6601dab4a2d34607e4?auto=format",
    },
    {
      id: "sugar-rush-1000",
      title: "Sugar Rush 1000",
      provider: "Pragmatic Play",
      playersCount: 912,
      badge: "MULTIPLIER SPOTS",
      badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/30",
      bgGradient: "from-pink-950/80 via-[#1a2c38] to-[#0f212e]",
      accentColor: "#ec4899",
      symbols: ["🍬", "🍭", "🐻", "🧁"],
      image: "https://mediumrare.imgix.net/edfa399c2e46da7e0593a0e543ba66b129e306bdc6c77a8632c320fec8a04bed?auto=format",
    },
    {
      id: "wanted-dead-or-a-wild",
      title: "Wanted Dead or a Wild",
      provider: "Hacksaw Gaming",
      playersCount: 785,
      badge: "VS DUEL",
      badgeColor: "bg-red-500/20 text-red-300 border-red-500/30",
      bgGradient: "from-red-950/80 via-[#1a2c38] to-[#0f212e]",
      accentColor: "#ef4444",
      symbols: ["💀", "🔫", "🥃", "💰"],
      image: "https://mediumrare.imgix.net/3b470acf1e794ecb437a535c35a20f12e8f7caf1a1153b6601dab4a2d34607e4?auto=format",
    },
  ];

  const displayedGames = initialGames.slice(0, visibleCount);

  const handleClick = (game: TrendingGameItem) => {
    if (onSelectGame) {
      onSelectGame({
        id: game.id,
        title: game.title,
        provider: game.provider,
        rtp: "96.50% RTP",
        symbols: game.symbols,
      });
    }
  };

  return (
    <section className="space-y-4 my-8">
      {/* Title with Trending Chart Icon + Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/casino/group/stake-originals"
          className="flex items-center gap-2 group cursor-pointer"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#00e701]/15 text-[#00e701]">
            <TrendingUp className="h-4 w-4" />
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white group-hover:text-[#00e701] transition-colors flex items-center gap-1.5">
            <span>Trending Games</span>
            <span className="text-base text-[#b1bad3] group-hover:translate-x-1 transition-transform">
              &gt;
            </span>
          </h2>
        </Link>
      </div>

      {/* Responsive 3-Card Grid (Mobile) / Multi-Column (Desktop) */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3.5">
        {displayedGames.map((game) => (
          <div
            key={game.id}
            onClick={() => handleClick(game)}
            className="group relative flex flex-col justify-between rounded-xl overflow-hidden border border-[#213743] bg-[#1a2c38] p-2.5 sm:p-3 transition-all duration-300 hover:-translate-y-1 hover:border-[#2f4553] hover:shadow-xl aspect-[3/4] cursor-pointer select-none"
          >
            {/* Ambient Background Gradient */}
            <div
              className={`absolute inset-0 bg-gradient-to-b ${game.bgGradient} opacity-60 group-hover:opacity-85 transition-opacity`}
            />

            {/* Top Badge */}
            <div className="relative z-10 flex items-center justify-between min-h-[20px]">
              <span
                className={`rounded px-1.5 py-0.5 text-[8px] sm:text-[9px] font-black uppercase tracking-wider border truncate max-w-[85%] ${game.badgeColor}`}
              >
                {game.badge}
              </span>
            </div>

            {/* Center Slot Theme Poster Graphic */}
            <div className="relative z-10 my-auto flex flex-col items-center justify-center w-full px-1 overflow-hidden">
              {game.image ? (
                <div className="w-full h-24 sm:h-28 flex items-center justify-center overflow-hidden rounded-lg">
                  <img
                    src={game.image}
                    alt={game.title}
                    className="w-full h-full object-cover rounded-lg transform group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <div className="flex gap-1 text-lg sm:text-2xl transform group-hover:scale-110 transition-transform duration-300 filter drop-shadow-md">
                    <span>{game.symbols[0]}</span>
                    <span>{game.symbols[1]}</span>
                  </div>
                  <div className="flex gap-1 text-base sm:text-xl mt-0.5 transform group-hover:scale-110 transition-transform duration-300 filter drop-shadow-md">
                    <span>{game.symbols[2]}</span>
                    <span>{game.symbols[3]}</span>
                  </div>
                </div>
              )}

              {/* Play Hover Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#00e701] text-[#0f212e] shadow-lg shadow-[#00e701]/40 transform scale-75 group-hover:scale-100 transition-transform">
                  <Play className="h-4 w-4 fill-current ml-0.5" />
                </div>
              </div>
            </div>

            {/* Bottom Details & Live Player Pill */}
            <div className="relative z-10 space-y-1 pt-1">
              <h3 className="text-xs font-bold text-white group-hover:text-[#00e701] transition-colors truncate leading-tight">
                {game.title}
              </h3>
              <p className="text-[10px] text-[#b1bad3] truncate">{game.provider}</p>

              {/* Live Player Pill */}
              <div className="flex items-center gap-1 rounded bg-[#0f212e]/80 border border-[#213743] px-1.5 py-0.5 text-[9px] sm:text-[10px] font-mono text-[#b1bad3] w-fit">
                <span className="text-[#00e701] animate-pulse">🟢</span>
                <span className="font-semibold text-white">{game.playersCount}</span>
                <span className="hidden sm:inline">playing</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Center-Aligned "Load More" Button */}
      {visibleCount < initialGames.length && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setVisibleCount((prev) => Math.min(initialGames.length, prev + 2))}
            className="bg-[#213743] hover:bg-[#2a4555] text-white font-bold text-xs px-6 py-2.5 rounded-lg border border-[#2f4553] transition-all cursor-pointer active:scale-95 shadow-md"
          >
            Load More
          </button>
        </div>
      )}
    </section>
  );
}
