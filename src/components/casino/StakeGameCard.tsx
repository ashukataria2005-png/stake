"use client";

import React from "react";
import Link from "next/link";
import { Play } from "lucide-react";
import StakeGameArtwork from "@/components/casino/StakeGameArtwork";
import { GameItem } from "@/data/stakeGames";

interface StakeGameCardProps {
  game: GameItem;
  onClick?: (game: GameItem) => void;
}

export default function StakeGameCard({ game, onClick }: StakeGameCardProps) {
  const cardContent = (
    <div
      onClick={() => onClick && onClick(game)}
      className="group relative flex flex-col justify-between rounded-xl overflow-hidden border border-[#213743] bg-[#1a2c38] p-2.5 sm:p-3 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#2f4553] hover:shadow-2xl hover:shadow-[#00e701]/10 aspect-[3/4] cursor-pointer select-none"
    >
      {/* Background Gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${
          game.bgGradient || "from-slate-900/90 via-[#1a2c38] to-[#0f212e]"
        } opacity-80 group-hover:opacity-95 transition-opacity duration-300`}
      />

      {/* Top Badge Strip */}
      <div className="relative z-10 flex items-center justify-between min-h-[20px]">
        {game.badge ? (
          <span
            className={`rounded px-1.5 py-0.5 text-[8px] sm:text-[9px] font-black uppercase tracking-wider border truncate max-w-[85%] ${
              game.badgeColor || "bg-[#00e701]/20 text-[#00e701] border-[#00e701]/30"
            }`}
          >
            {game.badge}
          </span>
        ) : (
          <span />
        )}
      </div>

      {/* Center Artwork Graphic */}
      <div className="relative z-10 my-auto flex flex-col items-center justify-center w-full px-2">
        <div className="w-24 h-24 sm:w-28 sm:h-28 transform group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
          <StakeGameArtwork gameId={game.id} />
        </div>

        {/* Hover Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#00e701] text-[#0f212e] shadow-lg shadow-[#00e701]/50 transform scale-75 group-hover:scale-100 transition-transform">
            <Play className="h-5 w-5 fill-current ml-0.5" />
          </div>
        </div>
      </div>

      {/* Bottom Info & Live Players Count */}
      <div className="relative z-10 space-y-1 pt-1">
        <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#00e701] transition-colors truncate leading-tight">
          {game.title}
        </h3>
        <p className="text-[10px] font-semibold text-[#b1bad3] tracking-wide uppercase truncate">
          {game.provider}
        </p>

        {/* Live Player Indicator Pill */}
        <div className="flex items-center gap-1.5 rounded-md bg-[#0f212e]/85 border border-[#213743] px-1.5 py-0.5 text-[9px] sm:text-[10px] font-mono text-[#b1bad3] w-fit">
          <span className="text-[#00e701] animate-pulse">🟢</span>
          <span className="font-semibold text-white">
            {game.playersCount.toLocaleString("en-US")}
          </span>
          <span className="hidden sm:inline text-[#7a889b]">playing</span>
        </div>
      </div>
    </div>
  );

  if (game.href) {
    return (
      <Link href={game.href} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
