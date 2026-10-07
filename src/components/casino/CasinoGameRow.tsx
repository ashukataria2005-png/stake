"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Play, LayoutGrid, ArrowRight } from "lucide-react";

import StakeGameArtwork from "@/components/casino/StakeGameArtwork";
import { getGameThumbnail } from "@/data/gameThumbnails";

export interface CasinoCardData {
  id: string;
  title: string;
  provider?: string;
  playersCount?: number;
  badge?: string;
  badgeColor?: string;
  href?: string;
  graphic?: React.ReactNode;
  image?: string;
  bgGradient?: string;
  isPublisherCard?: boolean;
}

interface CasinoGameRowProps {
  title: string;
  linkHref?: string;
  rowBadge?: string;
  cards: CasinoCardData[];
  onCardClick?: (card: CasinoCardData) => void;
  sectionId?: string;
}

export default function CasinoGameRow({
  title,
  linkHref = "#",
  rowBadge,
  cards,
  onCardClick,
  sectionId,
}: CasinoGameRowProps) {
  // 3-Stage Progressive Tier Loading:
  // 0 = Initial: 3 games (1 row)
  // 1 = 1st Click: 6 games (2 rows)
  // 2 = 2nd Click: 9 games (3 rows)
  // 3 = 3rd Click: Up to 11 games + "All Games" End Card (4 rows)
  const [stage, setStage] = useState<number>(0);

  const handleLoadMore = () => {
    setStage((prev) => Math.min(prev + 1, 3));
  };

  let displayedCards: CasinoCardData[] = [];
  let showAllGamesCard = false;

  if (stage === 0) {
    displayedCards = cards.slice(0, 3);
  } else if (stage === 1) {
    displayedCards = cards.slice(0, 6);
  } else if (stage === 2) {
    displayedCards = cards.slice(0, 9);
  } else {
    displayedCards = cards.slice(0, 11);
    showAllGamesCard = true;
  }

  // Can load more for exactly 3 progressive tiers until stage 3 (where 'All Games' card is shown)
  const canLoadMore = stage < 3 && cards.length > 3;

  return (
    <section className="space-y-3.5 my-7">
      {/* Row Header */}
      <div className="flex items-center justify-between">
        <Link href={linkHref} className="flex items-center gap-2 group cursor-pointer">
          <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-1.5 tracking-tight hover:text-[#00e701] transition-colors cursor-pointer">
            <span>{title}</span>
            <span className="text-[#b1bad3] text-sm sm:text-base group-hover:translate-x-1 transition-transform">
              &gt;
            </span>
          </h2>
          {rowBadge && (
            <span className="rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/40 px-2 py-0.5 text-xs font-black uppercase tracking-wider">
              {rowBadge}
            </span>
          )}
        </Link>
      </div>

      {/* Exact 3-Item Layout Grid */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 w-full">
        {displayedCards.map((card) => {
          const thumb = getGameThumbnail(card.id, card.image);

          // For Publisher / Studio tiles
          if (card.isPublisherCard) {
            const pubContent = (
              <div
                onClick={() => onCardClick && onCardClick(card)}
                className="group relative flex flex-col justify-between rounded-xl overflow-hidden border border-[#213743] bg-[#1a2c38] p-3 transition-all duration-300 hover:-translate-y-1 hover:border-[#2f4553] hover:shadow-xl aspect-[3/4] cursor-pointer select-none"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-b ${
                    card.bgGradient || "from-slate-900/80 via-[#1a2c38] to-[#0f212e]"
                  } opacity-70 group-hover:opacity-90 transition-opacity`}
                />
                <div className="relative z-10 flex items-center justify-between">
                  {card.badge && (
                    <span className="rounded px-1.5 py-0.5 text-xs font-black uppercase tracking-wider border truncate bg-[#00e701]/20 text-[#00e701] border-[#00e701]/30">
                      {card.badge}
                    </span>
                  )}
                </div>
                <div className="relative z-10 my-auto flex flex-col items-center justify-center w-full px-1">
                  {card.graphic}
                </div>
                <div className="relative z-10 space-y-0.5">
                  <h3 className="font-black uppercase tracking-wider text-sm sm:text-base text-white group-hover:text-[#00e701] transition-colors truncate">
                    {card.title}
                  </h3>
                  {card.provider && <p className="text-xs text-[#b1bad3] truncate">{card.provider}</p>}
                </div>
              </div>
            );

            return (
              <div key={card.id} className="w-full">
                {card.href ? (
                  <Link href={card.href} className="block">
                    {pubContent}
                  </Link>
                ) : (
                  pubContent
                )}
              </div>
            );
          }

          // Full-Bleed Game Card with crisp uppercase title, subtitle/provider, and pulsing counter
          const content = (
            <div
              onClick={() => onCardClick && onCardClick(card)}
              className="group relative flex flex-col select-none cursor-pointer"
            >
              {/* 100% Full-Bleed Image Box */}
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-[#1a2c38] border border-[#213743] hover:border-[#2f4553] transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
                {thumb ? (
                  <img
                    src={thumb}
                    alt={card.title}
                    className="w-full h-full object-cover object-center rounded-xl"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-3">
                    {card.graphic ? card.graphic : <StakeGameArtwork gameId={card.id} />}
                  </div>
                )}

                {/* Hover Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00e701] text-[#0f212e] shadow-lg shadow-[#00e701]/40 transform scale-75 group-hover:scale-100 transition-transform">
                    <Play className="h-4 w-4 fill-current ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Under-Card Title, Subtitle / Provider & Pulsing Live Player Count */}
              <div className="flex flex-col mt-1.5 px-0.5">
                <span className="font-black uppercase tracking-wider text-xs sm:text-sm text-white truncate">
                  {card.title}
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold text-white/70 truncate">
                  {card.provider || "Stake Originals"}
                </span>
                <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5 text-[10px] sm:text-xs font-semibold text-[#b1bad3] truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00e701] shadow-[0_0_6px_#00e701] animate-pulse shrink-0" />
                  <span className="truncate">{(card.playersCount || 1250).toLocaleString("en-US")} playing</span>
                </div>
              </div>
            </div>
          );

          return (
            <div key={card.id} className="w-full">
              {card.href ? (
                <Link href={card.href} className="block">
                  {content}
                </Link>
              ) : (
                content
              )}
            </div>
          );
        })}

        {/* 3rd Click Dedicated 'All Games' End Card */}
        {showAllGamesCard && (
          <div className="w-full">
            <Link
              href={linkHref}
              className="w-full aspect-[3/4] rounded-2xl bg-[#1a2c38] border-2 border-dashed border-[#2f4553] hover:border-[#00e701] flex flex-col items-center justify-center gap-2 p-3 sm:p-4 cursor-pointer text-[#b1bad3] hover:text-white transition-all group shadow-md hover:shadow-xl hover:-translate-y-1"
            >
              <div className="w-11 h-11 rounded-xl bg-[#0f212e] border border-[#213743] flex items-center justify-center group-hover:bg-[#00e701] group-hover:text-[#0f212e] text-[#b1bad3] transition-colors shadow-inner">
                <LayoutGrid className="w-5 h-5 transition-transform group-hover:scale-110" />
              </div>
              <span className="font-black uppercase tracking-wider text-xs sm:text-sm text-center text-white group-hover:text-[#00e701] transition-colors">
                All Games
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-[#b1bad3] bg-[#0f212e] px-2 py-0.5 rounded-full border border-[#213743] group-hover:border-[#00e701]/40 flex items-center gap-1">
                <span>View All</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          </div>
        )}
      </div>

      {/* Underneath each 3-game row: Centered Stake 'Load More' Divider Trigger (Hidden after Stage 3, NO 'Show Less') */}
      {canLoadMore && (
        <div className="relative flex items-center justify-center my-3 w-full">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#213743]" />
          </div>
          <button
            onClick={handleLoadMore}
            className="relative z-10 px-4 text-xs sm:text-sm font-bold text-[#b1bad3] hover:text-white transition-colors bg-[#0f212e] cursor-pointer"
          >
            Load More
          </button>
        </div>
      )}
    </section>
  );
}
