"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { Play, LayoutGrid, ArrowRight, ChevronRight } from "lucide-react";

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
  showGameTitle?: boolean;
  showProviderName?: boolean;
}

export default function CasinoGameRow({
  title,
  linkHref = "#",
  rowBadge,
  cards,
  onCardClick,
  sectionId,
  showGameTitle = true,
  showProviderName = true,
}: CasinoGameRowProps) {
  // Progressive Tier Loading (+6 items = 2 rows per click):
  // 0 = Initial: 3 games (1 row)
  // 1 = 1st Click: 9 games (3 rows = 3 + 6)
  // 2 = 2nd Click: 15 games (5 rows = 9 + 6)
  // 3 = 3rd Click: Up to limit (17 games) + "All Games" End Card (6 rows total)
  const [stage, setStage] = useState<number>(0);
  const rowRef = useRef<HTMLElement>(null);

  let displayedCards: CasinoCardData[] = [];
  let showAllGamesCard = false;
  let isFullyExpanded = false;

  if (stage === 0) {
    displayedCards = cards.slice(0, 3);
    showAllGamesCard = false;
    isFullyExpanded = false;
  } else if (stage === 1) {
    if (cards.length <= 9) {
      displayedCards = cards;
      showAllGamesCard = true;
      isFullyExpanded = true;
    } else {
      displayedCards = cards.slice(0, 9);
      showAllGamesCard = false;
      isFullyExpanded = false;
    }
  } else if (stage === 2) {
    if (cards.length <= 15) {
      displayedCards = cards;
      showAllGamesCard = true;
      isFullyExpanded = true;
    } else {
      displayedCards = cards.slice(0, 15);
      showAllGamesCard = false;
      isFullyExpanded = false;
    }
  } else {
    // Stage 3: up to limit (17 items) + 1 All Games end card
    const limit = Math.min(cards.length, 17);
    displayedCards = cards.slice(0, limit);
    showAllGamesCard = true;
    isFullyExpanded = true;
  }

  const handleToggleLoadMore = () => {
    if (isFullyExpanded) {
      setStage(0);
      if (rowRef.current) {
        rowRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    } else {
      setStage((prev) => prev + 1);
    }
  };

  return (
    <section ref={rowRef} className="space-y-3.5 my-7 transition-all duration-300 ease-in-out">
      {/* Row Header */}
      <div className="flex items-center justify-between">
        <Link href={linkHref} className="flex items-center gap-2 group cursor-pointer">
          <h2 className="text-[20px] sm:text-[22px] font-semibold text-white tracking-[-0.017em] flex items-center gap-2 hover:text-[#00e701] transition-colors cursor-pointer">
            <span>{title}</span>
            {rowBadge && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                {rowBadge}
              </span>
            )}
            <ChevronRight className="w-4 h-4 text-[#b1bad3] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </h2>
        </Link>
      </div>

      {/* Exact 3-Item Layout Grid */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 w-full transition-all duration-300 ease-in-out">
        {displayedCards.map((card) => {
          const thumb = getGameThumbnail(card.id, card.image);

          // For Publisher / Studio tiles (Task 19: Compact Horizontal Pill-Boxes)
          if (card.isPublisherCard) {
            const pubContent = (
              <div
                onClick={() => onCardClick && onCardClick(card)}
                className="flex flex-col select-none cursor-pointer group w-full"
              >
                <div className="h-[54px] sm:h-[62px] w-full rounded-xl bg-[#213743] hover:bg-[#2a4454] border border-[#2f4553]/60 flex items-center justify-center p-2.5 transition-transform active:scale-95 cursor-pointer shadow-sm">
                  {card.graphic ? (
                    <div className="flex items-center justify-center max-w-full overflow-hidden text-white font-semibold">
                      {card.graphic}
                    </div>
                  ) : (
                    <span className="font-semibold text-sm sm:text-base text-white tracking-wide truncate">
                      {card.title}
                    </span>
                  )}
                </div>
              </div>
            );

            return (
              <div key={card.id} className="w-full">
                {card.href ? (
                  <Link href={card.href} className="block w-full">
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

              {/* Under-Card Title, Subtitle / Provider */}
              {(showGameTitle || showProviderName) && (
                <div className="flex flex-col mt-1.5 px-0.5">
                  {showGameTitle && (
                    <span className="font-semibold uppercase tracking-wider text-xs sm:text-sm text-white truncate">
                      {card.title}
                    </span>
                  )}
                  {showProviderName && (
                    <span className="text-[9px] sm:text-[10px] uppercase font-medium text-white/70 truncate">
                      {card.provider || "Stake Originals"}
                    </span>
                  )}
                </div>
              )}
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

        {/* 3rd Click Dedicated 'All Games' / 'View All' End Card */}
        {showAllGamesCard && (
          <div className="w-full">
            {cards[0]?.isPublisherCard ? (
              <Link
                href={linkHref}
                className="flex flex-col select-none cursor-pointer group w-full"
              >
                <div className="h-[54px] sm:h-[62px] w-full rounded-xl bg-[#1a2c38] border-2 border-dashed border-[#2f4553] hover:border-[#00e701] flex items-center justify-center gap-2 p-2.5 transition-transform active:scale-95 cursor-pointer shadow-sm">
                  <LayoutGrid className="w-4 h-4 text-[#00e701]" />
                  <span className="font-semibold text-xs sm:text-sm text-white tracking-wide">
                    All Providers
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#00e701] group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="flex items-center justify-center gap-1 mt-1 text-[11px] font-semibold text-[#b1bad3] text-center">
                  <span>View All &gt;</span>
                </div>
              </Link>
            ) : (
              <Link
                href={linkHref}
                className="w-full aspect-[3/4] rounded-2xl bg-[#1a2c38] border-2 border-dashed border-[#2f4553] hover:border-[#00e701] flex flex-col items-center justify-center gap-2 p-3 sm:p-4 cursor-pointer text-[#b1bad3] hover:text-white transition-all group shadow-md hover:shadow-xl hover:-translate-y-1"
              >
                <div className="w-11 h-11 rounded-xl bg-[#0f212e] border border-[#213743] flex items-center justify-center group-hover:bg-[#00e701] group-hover:text-[#0f212e] text-[#b1bad3] transition-colors shadow-inner">
                  <LayoutGrid className="w-5 h-5 transition-transform group-hover:scale-110" />
                </div>
                <span className="font-semibold uppercase tracking-wider text-xs sm:text-sm text-center text-white group-hover:text-[#00e701] transition-colors">
                  All Games
                </span>
                <span className="text-[10px] sm:text-xs font-medium text-[#b1bad3] bg-[#0f212e] px-2 py-0.5 rounded-full border border-[#213743] group-hover:border-[#00e701]/40 flex items-center gap-1">
                  <span>View All</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Centered Stake Divider UI with Load More / Show Less Toggle */}
      {cards.length > 3 && (
        <div className="flex items-center justify-center my-4 w-full">
          <div className="flex-1 h-[1px] bg-[#2f4553]" />
          <button
            onClick={handleToggleLoadMore}
            className="px-4 py-1.5 text-xs sm:text-sm font-semibold text-[#b1bad3] hover:text-white hover:bg-[#213743]/50 rounded transition-colors whitespace-nowrap cursor-pointer"
          >
            {isFullyExpanded ? "Show Less" : "Load More"}
          </button>
          <div className="flex-1 h-[1px] bg-[#2f4553]" />
        </div>
      )}
    </section>
  );
}
