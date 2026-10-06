"use client";

import React from "react";
import Link from "next/link";
import { Play, ChevronRight } from "lucide-react";
import { useGame, RecentlyPlayedGame } from "@/context/GameContext";
import StakeGameArtwork from "@/components/casino/StakeGameArtwork";
import { getGameThumbnail } from "@/data/gameThumbnails";

export default function ContinuePlayingSlider() {
  const { recentlyPlayedGames } = useGame();

  // STRICT REQUIREMENT: MUST be strictly hidden for new users or when recentlyPlayedGames is empty
  if (!recentlyPlayedGames || recentlyPlayedGames.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3 my-5">
      {/* Section Header: Play Icon + "Continue Playing >" */}
      <div className="flex items-center justify-between">
        <Link
          href="/casino/group/stake-originals"
          className="flex items-center gap-2 group cursor-pointer"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#00e701]/15 text-[#00e701]">
            <Play className="h-4 w-4 fill-current ml-0.5" />
          </div>
          <h2 className="text-base sm:text-lg font-black text-white group-hover:text-[#00e701] transition-colors flex items-center gap-1">
            <span>Continue Playing</span>
            <ChevronRight className="h-4 w-4 text-[#b1bad3] group-hover:translate-x-0.5 transition-transform" />
          </h2>
        </Link>
      </div>

      {/* Single-row horizontal slider */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth flex-nowrap py-1">
        {recentlyPlayedGames.map((game: RecentlyPlayedGame) => {
          const thumb = getGameThumbnail(game.slug || game.id, game.image);
          const linkHref = game.href || `/games/${game.slug || game.id}`;

          return (
            <Link
              key={game.id}
              href={linkHref}
              className="flex-shrink-0 w-28 sm:w-36 group flex flex-col select-none cursor-pointer"
            >
              {/* Compact 3:4 aspect ratio full-bleed box */}
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
                  <div className="w-full h-full flex items-center justify-center p-2.5">
                    <StakeGameArtwork gameId={game.slug || game.id} />
                  </div>
                )}

                {/* Hover Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#00e701] text-[#0f212e] shadow-lg shadow-[#00e701]/40 transform scale-75 group-hover:scale-100 transition-transform">
                    <Play className="h-4 w-4 fill-current ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Bottom Player Count Pill */}
              <div className="flex items-center gap-1.5 mt-2 px-1 text-[11px] font-semibold text-[#b1bad3]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e701] shadow-[0_0_6px_#00e701] animate-pulse shrink-0"></span>
                <span>{(game.playersCount || 61).toLocaleString("en-US")} playing</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
