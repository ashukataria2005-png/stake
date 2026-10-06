"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ChevronRight, Play } from "lucide-react";
import StakeGameArtwork from "@/components/casino/StakeGameArtwork";
import { getGameThumbnail } from "@/data/gameThumbnails";
import { useGame } from "@/context/GameContext";

interface GameItem {
  id: string;
  title: string;
  provider: string;
  playersCount: number;
  href?: string;
}

export default function GamesForYou() {
  const { addRecentlyPlayedGame } = useGame();
  const [visibleCount, setVisibleCount] = useState<number>(6);

  const games: GameItem[] = [
    {
      id: "dracs-stacks",
      title: "Drac's Stacks",
      provider: "Hacksaw Gaming",
      playersCount: 1420,
      href: "/games/mines",
    },
    {
      id: "skyscraper-crash",
      title: "Skyscraper Crash",
      provider: "Stake Originals",
      playersCount: 2890,
      href: "/games/crash",
    },
    {
      id: "nuukd",
      title: "Nuukd",
      provider: "Pragmatic Play",
      playersCount: 980,
      href: "/games/plinko",
    },
    {
      id: "wanted-dead-or-a-wild",
      title: "Wanted Dead or a Wild",
      provider: "Hacksaw Gaming",
      playersCount: 3980,
      href: "/games/limbo",
    },
    {
      id: "sweet-bonanza-1000",
      title: "Sweet Bonanza 1000",
      provider: "Pragmatic Play",
      playersCount: 5420,
      href: "/games/dice",
    },
    {
      id: "gates-of-olympus-1000",
      title: "Gates of Olympus 1000",
      provider: "Pragmatic Play",
      playersCount: 6890,
      href: "/games/roulette",
    },
    {
      id: "sugar-rush-1000",
      title: "Sugar Rush 1000",
      provider: "Pragmatic Play",
      playersCount: 3210,
      href: "/games/wheel",
    },
    {
      id: "rip-city",
      title: "RIP City",
      provider: "Hacksaw Gaming",
      playersCount: 2150,
      href: "/games/keno",
    },
    {
      id: "chaos-crew-2",
      title: "Chaos Crew 2",
      provider: "Hacksaw Gaming",
      playersCount: 1890,
      href: "/games/mines",
    },
  ];

  const handleGameClick = (game: GameItem) => {
    addRecentlyPlayedGame({
      id: game.id,
      title: game.title,
      image: getGameThumbnail(game.id),
      href: game.href,
      playersCount: game.playersCount,
    });
  };

  const displayedGames = games.slice(0, visibleCount);

  return (
    <section className="space-y-4 my-6">
      {/* Section Header: Sparkles + "Games For You >" */}
      <div className="flex items-center justify-between">
        <Link
          href="/casino/group/slots"
          className="flex items-center gap-2 group cursor-pointer"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-500/15 text-pink-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white group-hover:text-pink-400 transition-colors flex items-center gap-1.5">
            <span>Games For You</span>
            <ChevronRight className="h-4 w-4 text-[#b1bad3] group-hover:translate-x-0.5 transition-transform" />
          </h2>
        </Link>
        <Link
          href="/casino/group/slots"
          className="text-xs font-bold text-pink-400 hover:underline"
        >
          View All &gt;
        </Link>
      </div>

      {/* Full-Bleed 3:4 Aspect Ratio Grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 md:grid-cols-4 lg:grid-cols-6">
        {displayedGames.map((game) => {
          const thumb = getGameThumbnail(game.id);
          const linkHref = game.href || `/games/${game.id}`;

          return (
            <Link
              key={game.id}
              href={linkHref}
              onClick={() => handleGameClick(game)}
              className="group flex flex-col select-none cursor-pointer"
            >
              {/* 100% Full-bleed Image Box */}
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
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#00e701] text-[#0f212e] shadow-lg shadow-[#00e701]/40 transform scale-75 group-hover:scale-100 transition-transform">
                    <Play className="h-5 w-5 fill-current ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Under-Card Player Count (ONLY green live player status pill) */}
              <div className="flex items-center gap-1 sm:gap-1.5 mt-1.5 sm:mt-2 px-0.5 text-[10px] sm:text-[11px] font-semibold text-[#b1bad3] truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e701] shadow-[0_0_6px_#00e701] animate-pulse shrink-0" />
                <span className="truncate">{game.playersCount.toLocaleString("en-US")} playing</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Center-Aligned "Load More" Button */}
      {visibleCount < games.length && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setVisibleCount((prev) => Math.min(games.length, prev + 3))}
            className="bg-[#213743] hover:bg-[#2a4555] text-white font-bold text-xs px-6 py-2.5 rounded-lg border border-[#2f4553] transition-all cursor-pointer active:scale-95 shadow-md"
          >
            Load More
          </button>
        </div>
      )}
    </section>
  );
}
