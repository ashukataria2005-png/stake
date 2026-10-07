"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Play } from "lucide-react";
import StakeGameArtwork from "@/components/casino/StakeGameArtwork";
import { GameItem } from "@/data/stakeGames";
import { getGameThumbnail } from "@/data/gameThumbnails";

interface StakeGameCardProps {
  game: GameItem;
  onClick?: (game: GameItem) => void;
}

export default function StakeGameCard({ game, onClick }: StakeGameCardProps) {
  const [imageError, setImageError] = useState(false);
  const thumbnailUrl = getGameThumbnail(game.slug || game.id, game.image);

  const cardContent = (
    <div
      onClick={() => onClick && onClick(game)}
      className="group relative flex flex-col select-none cursor-pointer"
    >
      {/* 100% Full-Bleed Image Box */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-[#1a2c38] border border-[#213743] hover:border-[#2f4553] transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
        {thumbnailUrl && !imageError ? (
          <img
            src={thumbnailUrl}
            alt={game.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover rounded-xl"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-3">
            <StakeGameArtwork gameId={game.slug || game.id} />
          </div>
        )}

        {/* Hover Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#00e701] text-[#0f212e] shadow-lg shadow-[#00e701]/50 transform scale-75 group-hover:scale-100 transition-transform">
            <Play className="h-5 w-5 fill-current ml-0.5" />
          </div>
        </div>
      </div>

      {/* Under-Card Title & Player Count */}
      <div className="flex flex-col mt-1.5 px-0.5">
        <span className="font-black uppercase tracking-wider text-sm sm:text-base text-white truncate">
          {game.title}
        </span>
        <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5 text-xs sm:text-sm font-semibold text-[#b1bad3] truncate">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00e701] shadow-[0_0_6px_#00e701] animate-pulse shrink-0" />
          <span className="truncate">{(game.playersCount || 1200).toLocaleString("en-US")} playing</span>
        </div>
      </div>
    </div>
  );

  if (game.href && !onClick) {
    return (
      <Link href={game.href} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
