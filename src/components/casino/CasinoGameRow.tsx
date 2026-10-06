"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Play } from "lucide-react";

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
  const [visibleCount, setVisibleCount] = useState<number>(6);

  const displayedCards = cards.slice(0, visibleCount);

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

      {/* Responsive Card Grid (Mobile: 3-Col, Desktop: 6-Col) */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3.5">
        {displayedCards.map((card) => {
          const content = (
            <div
              key={card.id}
              onClick={() => onCardClick && onCardClick(card)}
              className={`group relative flex flex-col justify-between rounded-xl overflow-hidden border border-[#213743] bg-[#1a2c38] p-2.5 sm:p-3 transition-all duration-300 hover:-translate-y-1 hover:border-[#2f4553] hover:shadow-xl aspect-[3/4] cursor-pointer select-none`}
            >
              {/* Background gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-b ${
                  card.bgGradient || "from-slate-900/80 via-[#1a2c38] to-[#0f212e]"
                } opacity-70 group-hover:opacity-90 transition-opacity`}
              />

              {/* Top Badge */}
              <div className="relative z-10 flex items-center justify-between">
                {card.badge && (
                  <span
                    className={`rounded px-1.5 py-0.5 text-[8px] sm:text-[9px] font-black uppercase tracking-wider border truncate max-w-[85%] ${
                      card.badgeColor || "bg-[#00e701]/20 text-[#00e701] border-[#00e701]/30"
                    }`}
                  >
                    {card.badge}
                  </span>
                )}
              </div>

              {/* Graphic Center / Real Poster Image */}
              <div className="relative z-10 my-auto flex flex-col items-center justify-center w-full px-1 overflow-hidden">
                {card.image ? (
                  <div className="w-full h-24 sm:h-28 flex items-center justify-center overflow-hidden rounded-lg">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover rounded-lg transform group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                ) : (
                  <div className="transform group-hover:scale-110 transition-transform duration-300">
                    {card.graphic}
                  </div>
                )}

                {/* Hover Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#00e701] text-[#0f212e] shadow-lg shadow-[#00e701]/40 transform scale-75 group-hover:scale-100 transition-transform">
                    <Play className="h-4 w-4 fill-current ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Bottom Details & Player Pill */}
              <div className="relative z-10 space-y-1">
                <h3 className="text-xs font-bold text-white group-hover:text-[#00e701] transition-colors truncate leading-tight">
                  {card.title}
                </h3>
                {card.provider && (
                  <p className="text-[10px] text-[#b1bad3] truncate">{card.provider}</p>
                )}

                {/* Live Player Pill */}
                {card.playersCount !== undefined && (
                  <div className="flex items-center gap-1 rounded bg-[#0f212e]/80 border border-[#213743] px-1.5 py-0.5 text-[9px] sm:text-[10px] font-mono text-[#b1bad3]">
                    <span className="text-[#00e701]">🟢</span>
                    <span className="font-semibold text-white">
                      {card.playersCount.toLocaleString("en-US")}
                    </span>
                    <span className="hidden sm:inline">playing</span>
                  </div>
                )}
              </div>
            </div>
          );

          if (card.href) {
            return (
              <Link key={card.id} href={card.href} className="block">
                {content}
              </Link>
            );
          }

          return <React.Fragment key={card.id}>{content}</React.Fragment>;
        })}
      </div>

      {/* Center-Aligned "Load More" Button */}
      {visibleCount < cards.length && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setVisibleCount((prev) => Math.min(cards.length, prev + 3))}
            className="bg-[#213743] hover:bg-[#2a4555] text-white font-bold text-xs px-6 py-2 rounded-lg border border-[#2f4553] transition-all cursor-pointer active:scale-95 shadow-md"
          >
            Load More
          </button>
        </div>
      )}
    </section>
  );
}
