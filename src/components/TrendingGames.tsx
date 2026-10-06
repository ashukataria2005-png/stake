"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TrendingUp, Play } from "lucide-react";
import StakeGameArtwork from "@/components/casino/StakeGameArtwork";
import { getGameThumbnail } from "@/data/gameThumbnails";

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
        {displayedGames.map((game) => {
          const thumb = getGameThumbnail(game.id, game.image);
          return (
            <div
              key={game.id}
              onClick={() => handleClick(game)}
              className="group relative flex flex-col select-none cursor-pointer"
            >
              {/* 100% Full-Bleed Image Box */}
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-[#1a2c38] border border-[#213743] hover:border-[#2f4553] transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
                {thumb ? (
                  <img
                    src={thumb}
                    alt={game.title}
                    className="w-full h-full object-cover rounded-xl"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-3">
                    <StakeGameArtwork gameId={game.id} />
                  </div>
                )}

                {/* Hover Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00e701] text-[#0f212e] shadow-lg shadow-[#00e701]/40 transform scale-75 group-hover:scale-100 transition-transform">
                    <Play className="h-4 w-4 fill-current ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Under-Card Player Count (ONLY green live player status pill) */}
              <div className="flex items-center gap-1.5 mt-2 px-1 text-[11px] font-semibold text-[#b1bad3]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e701] shadow-[0_0_6px_#00e701] animate-pulse"></span>
                <span>{game.playersCount?.toLocaleString("en-US")} playing</span>
              </div>
            </div>
          );
        })}
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
