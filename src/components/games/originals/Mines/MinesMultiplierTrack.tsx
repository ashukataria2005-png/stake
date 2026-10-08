"use client";

import React, { useEffect, useRef } from "react";
import { getMinesMultipliersList } from "./minesMultipliers";

interface MinesMultiplierTrackProps {
  minesCount: number;
  revealedGemsCount: number;
  isPlaying: boolean;
  className?: string;
}

export default function MinesMultiplierTrack({
  minesCount,
  revealedGemsCount,
  isPlaying,
  className = "",
}: MinesMultiplierTrackProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetBadgeRef = useRef<HTMLDivElement>(null);

  const multipliers = getMinesMultipliersList(minesCount);

  // Auto-scroll to the currently active or next target step as gems are uncovered
  useEffect(() => {
    if (targetBadgeRef.current) {
      targetBadgeRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [revealedGemsCount, minesCount]);

  if (!isPlaying) return null;

  return (
    <div className={`w-full overflow-hidden select-none ${className}`}>
      <div
        ref={containerRef}
        className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2 px-1 scroll-smooth"
      >
        {multipliers.map((mult, idx) => {
          const stepNumber = idx + 1;
          const isAchieved = stepNumber === revealedGemsCount;
          const isPast = stepNumber < revealedGemsCount;
          const isNext = stepNumber === revealedGemsCount + 1;

          let badgeClasses =
            "min-w-[62px] py-1.5 px-2 rounded-xl border flex flex-col items-center justify-center transition-all shrink-0 select-none";

          if (isAchieved) {
            badgeClasses +=
              " bg-[#00e701]/10 border-[#00e701] text-[#00e701] shadow-lg shadow-[#00e701]/20 scale-105 z-10";
          } else if (isNext) {
            badgeClasses += " bg-[#1a2c38] border-[#557086] text-white shadow-sm";
          } else if (isPast) {
            badgeClasses += " bg-[#0f212e]/50 border-[#213743]/70 text-[#00e701]/75";
          } else {
            badgeClasses += " bg-[#0f212e]/80 border-[#213743] text-[#b1bad3]";
          }

          // Attach scroll anchor to current achieved step or next target step
          const shouldAttachRef = isAchieved || (revealedGemsCount === 0 && isNext);

          return (
            <div
              key={stepNumber}
              ref={shouldAttachRef ? targetBadgeRef : undefined}
              className={badgeClasses}
            >
              <span className="text-[10px] font-bold opacity-75 flex items-center gap-0.5">
                <span>◆</span>
                <span>{stepNumber}</span>
              </span>
              <span className="text-xs sm:text-sm font-black tracking-tight">
                {mult >= 1000 ? mult.toLocaleString("en-US") : mult.toFixed(2)}×
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
