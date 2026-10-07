"use client";

import React from "react";
import Link from "next/link";
import { Play, ArrowRight } from "lucide-react";

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
}

export default function CasinoGameRow({
  title,
  linkHref = "#",
  rowBadge,
  cards,
  onCardClick,
}: CasinoGameRowProps) {
  const displayedCards = cards.slice(0, 15);

  return (
    <section className="space-y-3.5 my-7">
      {/* Row Header */}
      <div className="flex items-center justify-between">
        <Link href={linkHref} className="flex items-center gap-2 group cursor-pointer">
          <h2 className="text-base sm:text-lg font-black text-white group-hover:text-[#00e701] transition-colors flex items-center gap-1.5">
            <span>{title}</span>
            <span className="text-[#b1bad3] text-sm group-hover:translate-x-1 transition-transform">
              &gt;
            </span>
          </h2>
          {rowBadge && (
            <span className="rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/40 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
              {rowBadge}
            </span>
          )}
        </Link>
      </div>

      {/* 3-Card Responsive Horizontal Scroll Carousel */}
      <div className="flex gap-2.5 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-1 px-1">
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
                    <span className="rounded px-1.5 py-0.5 text-[8px] sm:text-[9px] font-black uppercase tracking-wider border truncate bg-[#00e701]/20 text-[#00e701] border-[#00e701]/30">
                      {card.badge}
                    </span>
                  )}
                </div>
                <div className="relative z-10 my-auto flex flex-col items-center justify-center w-full px-1">
                  {card.graphic}
                </div>
                <div className="relative z-10 space-y-0.5">
                  <h3 className="text-xs font-bold text-white group-hover:text-[#00e701] transition-colors truncate">
                    {card.title}
                  </h3>
                  {card.provider && <p className="text-[10px] text-[#b1bad3] truncate">{card.provider}</p>}
                </div>
              </div>
            );

            return (
              <div
                key={card.id}
                className="w-[calc(33.333%-7px)] min-w-[110px] sm:min-w-[150px] md:w-[150px] lg:w-[165px] flex-shrink-0 snap-start"
              >
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

          // Full-Bleed Game Card
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
                    className="w-full h-full object-cover rounded-xl"
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

              {/* Under-Card Player Count (ONLY green live player status pill) */}
              <div className="flex items-center gap-1 sm:gap-1.5 mt-1.5 sm:mt-2 px-0.5 text-[10px] sm:text-[11px] font-semibold text-[#b1bad3] truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e701] shadow-[0_0_6px_#00e701] animate-pulse shrink-0" />
                <span className="truncate">{(card.playersCount || 1250).toLocaleString("en-US")} playing</span>
              </div>
            </div>
          );

          return (
            <div
              key={card.id}
              className="w-[calc(33.333%-7px)] min-w-[110px] sm:min-w-[150px] md:w-[150px] lg:w-[165px] flex-shrink-0 snap-start"
            >
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

        {/* Authentic "View All" End Card */}
        <Link
          href={linkHref}
          className="w-[calc(33.333%-7px)] min-w-[110px] sm:min-w-[140px] md:w-[150px] lg:w-[165px] aspect-[3/4] rounded-xl bg-[#213743]/50 border border-[#2f4553] hover:border-[#213743] flex flex-col items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 text-[#b1bad3] hover:text-white flex-shrink-0 snap-start group"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1a2c38] group-hover:bg-[#00e701] text-[#b1bad3] group-hover:text-[#0f212e] transition-colors shadow-md">
            <ArrowRight className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-center px-1">View All {title}</span>
        </Link>
      </div>
    </section>
  );
}
