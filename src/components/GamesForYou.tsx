"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ChevronRight, Play, ArrowRight } from "lucide-react";
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
    {
      id: "starlight-princess",
      title: "Starlight Princess",
      provider: "Pragmatic Play",
      playersCount: 4210,
      href: "/games/plinko",
    },
    {
      id: "tombstone-rip",
      title: "Tombstone RIP",
      provider: "Nolimit City",
      playersCount: 2340,
      href: "/games/crash",
    },
    {
      id: "san-quentin",
      title: "San Quentin xWays",
      provider: "Nolimit City",
      playersCount: 3120,
      href: "/games/dice",
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

      {/* 3-Card Responsive Horizontal Scroll Carousel */}
      <div className="flex gap-2.5 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-1 px-1">
        {games.map((game) => {
          const thumb = getGameThumbnail(game.id);
          const linkHref = game.href || `/games/${game.id}`;

          return (
            <div
              key={game.id}
              className="w-[calc(33.333%-7px)] min-w-[110px] sm:min-w-[150px] md:w-[150px] lg:w-[165px] flex-shrink-0 snap-start"
            >
              <Link
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

                {/* Under-Card Title & Provider */}
                <div className="flex flex-col mt-1.5 px-0.5">
                  <span className="font-black uppercase tracking-wider text-xs sm:text-sm text-white truncate">
                    {game.title}
                  </span>
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold text-white/70 truncate">
                    {game.provider || "Stake Originals"}
                  </span>
                </div>
              </Link>
            </div>
          );
        })}

        {/* Authentic "View All" End Card */}
        <Link
          href="/casino/group/slots"
          className="w-[calc(33.333%-7px)] min-w-[110px] sm:min-w-[140px] md:w-[150px] lg:w-[165px] aspect-[3/4] rounded-xl bg-[#213743]/50 border border-[#2f4553] hover:border-[#213743] flex flex-col items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 text-[#b1bad3] hover:text-white flex-shrink-0 snap-start group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a2c38] group-hover:bg-pink-500 text-[#b1bad3] group-hover:text-white transition-colors shadow-md">
            <ArrowRight className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-center px-1">View All Games</span>
        </Link>
      </div>
    </section>
  );
}
