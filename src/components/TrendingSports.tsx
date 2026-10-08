"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, LayoutGrid, ArrowRight } from "lucide-react";
import { TRENDING_SPORTS } from "@/data/trendingSports";
import SportArtwork from "@/components/sports/SportArtwork";

export default function TrendingSports() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -340 : 340;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="space-y-3.5 my-8">
      {/* Category Header: "⚽ Trending Sports >" linking to /sports */}
      <div className="flex items-center justify-between">
        <Link href="/sports" className="flex items-center gap-2 group cursor-pointer">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#213743] text-base">
            ⚽
          </div>
          <h2 className="text-base sm:text-xl font-black text-white group-hover:text-[#00e701] transition-colors flex items-center gap-1.5">
            <span>Trending Sports</span>
            <ChevronRight className="h-4 w-4 text-[#b1bad3] group-hover:translate-x-1 transition-transform" />
          </h2>
          <span className="rounded-full bg-[#213743] px-2 py-0.5 text-[11px] font-bold text-[#00e701]">
            {TRENDING_SPORTS.length} Sports
          </span>
        </Link>

        {/* Right Header Navigation & Link */}
        <div className="flex items-center gap-2">
          <Link
            href="/sports"
            className="text-xs font-bold text-[#00e701] hover:underline hidden sm:inline-block"
          >
            View All Sports &gt;
          </Link>
          <div className="flex items-center gap-1">
            <button
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#213743] text-[#b1bad3] hover:text-white hover:bg-[#2f4553] active:scale-95 transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#213743] text-[#b1bad3] hover:text-white hover:bg-[#2f4553] active:scale-95 transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Smooth Touch Horizontal Scrollable Container (3 cards on mobile) */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-2 px-1"
      >
        {TRENDING_SPORTS.map((sport) => {
          return (
            <div
              key={sport.id}
              className="w-[calc(33.333%-8px)] min-w-[110px] sm:min-w-[140px] md:w-[150px] lg:w-[165px] flex-shrink-0 snap-start"
            >
              <Link
                href={sport.href || `/sports/${sport.id}`}
                className="group relative flex flex-col select-none cursor-pointer"
              >
                <div
                  className={`relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[#0f212e] border border-[#213743] ${sport.accentBorder} transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl shadow-md`}
                >
                  {/* Full-bleed Cut-Out Character Graphic Poster */}
                  <SportArtwork sportId={sport.id} sport={sport} />

                  {/* Top Live Matches Counter Badge */}
                  <div className="absolute top-2 left-2 z-20 flex items-center">
                    <span className="flex items-center gap-1 rounded-md bg-[#0a151d]/90 backdrop-blur-sm border border-[#213743] px-1.5 py-0.5 text-[8px] sm:text-[9px] font-mono text-[#00e701] font-bold shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00e701] animate-pulse" />
                      {sport.liveMatches} Live
                    </span>
                  </div>

                  {/* Bottom Dark Scrim Gradient & Prominent Uppercase White Bold Typography */}
                  {(!sport.image || sport.image.trim() === "") && (
                    <div className="absolute inset-x-0 bottom-0 z-20 p-2 sm:p-2.5 pt-8 bg-gradient-to-t from-[#0b1622] via-[#0b1622]/85 to-transparent text-center flex flex-col items-center justify-end">
                      <h3 className="text-[10px] sm:text-xs font-black tracking-wider text-white group-hover:text-[#00e701] transition-colors truncate uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] max-w-full">
                        {sport.displayName || sport.name}
                      </h3>
                    </div>
                  )}
                </div>
              </Link>
            </div>
          );
        })}

        {/* Authentic "View All" End Card (matching Screenshots 154-157) */}
        <Link
          href="/sports"
          className="min-w-[105px] sm:min-w-[125px] aspect-[3/4] rounded-2xl bg-[#1a2c38] border-2 border-dashed border-[#2f4553] hover:border-[#00e701] flex flex-col items-center justify-center gap-2 p-3 text-[#b1bad3] hover:text-white transition-all cursor-pointer flex-shrink-0 snap-start group select-none shadow-md"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0f212e] border border-[#213743] group-hover:border-[#00e701]/50 group-hover:bg-[#00e701]/10 text-[#b1bad3] group-hover:text-[#00e701] transition-colors shadow-inner">
            <LayoutGrid className="h-5 w-5 transition-transform group-hover:scale-110" />
          </div>
          <span className="text-xs sm:text-sm font-black text-center text-white tracking-wide">
            View All
          </span>
          <div className="flex items-center gap-1 text-[10px] font-bold text-[#b1bad3] group-hover:text-[#00e701] transition-colors">
            <span>Sportsbook</span>
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </div>
    </section>
  );
}
