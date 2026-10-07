"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Flame, Activity, Sparkles, Tv, ArrowRight } from "lucide-react";
import StakeGameCard from "@/components/casino/StakeGameCard";
import {
  STAKE_ORIGINALS,
  LIVE_CASINO_GAMES,
  POPULAR_SLOTS,
  GameItem,
} from "@/data/stakeGames";

interface GameRowProps {
  title: string;
  icon: React.ReactNode;
  viewAllHref: string;
  games: GameItem[];
}

function CategoryGameRow({ title, icon, viewAllHref, games }: GameRowProps) {
  const rowRef = useRef<HTMLDivElement | null>(null);

  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-3">
      {/* Category Header Row */}
      <div className="flex items-center justify-between">
        <Link
          href={viewAllHref}
          className="group flex items-center gap-2 text-sm sm:text-base font-black text-white hover:text-[#00e701] transition-colors"
        >
          <span className="p-1.5 rounded-lg bg-[#213743] border border-[#2f4553]/60 group-hover:border-[#00e701]/40">
            {icon}
          </span>
          <span className="tracking-wide">{title}</span>
          <ArrowRight className="w-4 h-4 text-[#b1bad3] group-hover:translate-x-1 group-hover:text-[#00e701] transition-transform" />
        </Link>

        {/* Carousel Scroll Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => scroll("left")}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#213743] hover:bg-[#2f4553] text-[#b1bad3] hover:text-white transition-colors cursor-pointer"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#213743] hover:bg-[#2f4553] text-[#b1bad3] hover:text-white transition-colors cursor-pointer"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Track (10-15 cards per row) */}
      <div
        ref={rowRef}
        className="flex gap-2.5 sm:gap-3.5 overflow-x-auto no-scrollbar scroll-smooth pb-2 pt-1"
      >
        {games.map((game) => (
          <div
            key={game.id}
            className="w-[125px] sm:w-[155px] md:w-[170px] shrink-0"
          >
            <StakeGameCard game={game} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MinesGamesForYou() {
  const originals = STAKE_ORIGINALS.slice(0, 12);
  const liveCasino = LIVE_CASINO_GAMES.filter((g) => g.category === "live").slice(0, 14);
  const slots = POPULAR_SLOTS.slice(0, 14);
  const gameShows = LIVE_CASINO_GAMES.filter((g) => g.category === "game-shows").slice(0, 12);

  return (
    <section className="mt-8 space-y-8 select-none">
      <div className="border-b border-[#213743] pb-3">
        <h2 className="text-lg sm:text-xl font-black text-white tracking-wide flex items-center gap-2">
          <span>🎯</span> Games For You
        </h2>
        <p className="text-xs text-[#b1bad3] mt-0.5">
          Discover top Stake Originals, live dealer tables, high-volatility slots, and immersive game shows.
        </p>
      </div>

      {/* 1. Stake Originals */}
      <CategoryGameRow
        title="Stake Originals"
        icon={<Flame className="w-4 h-4 text-[#00e701]" />}
        viewAllHref="/casino/group/stake-originals"
        games={originals}
      />

      {/* 2. Live Casino */}
      <CategoryGameRow
        title="Live Casino"
        icon={<Activity className="w-4 h-4 text-red-400" />}
        viewAllHref="/casino/group/live-casino"
        games={liveCasino}
      />

      {/* 3. Slots */}
      <CategoryGameRow
        title="Slots"
        icon={<Sparkles className="w-4 h-4 text-amber-400" />}
        viewAllHref="/casino/group/slots"
        games={slots}
      />

      {/* 4. Game Shows */}
      <CategoryGameRow
        title="Game Shows"
        icon={<Tv className="w-4 h-4 text-pink-400" />}
        viewAllHref="/casino/group/game-shows"
        games={gameShows}
      />
    </section>
  );
}
