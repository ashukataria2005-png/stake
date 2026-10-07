"use client";

import React from "react";
import { Sparkles, RotateCcw, Trash2, Trophy } from "lucide-react";

interface MinesGridProps {
  revealedTiles: number[];
  mineLocations: number[];
  isPlaying: boolean;
  isGameOver: boolean;
  minesCount: number;
  maxMultiplier: number;
  currentMultiplier: number;
  currentProfit: number;
  floatingBadges: { [key: number]: string };
  selectedAutoTiles: number[];
  mode: "manual" | "auto";
  onTileClick: (index: number) => void;
  onRepeatTiles?: () => void;
  onClearTiles?: () => void;
  animations?: boolean;
}

export default function MinesGrid({
  revealedTiles,
  mineLocations,
  isPlaying,
  isGameOver,
  minesCount,
  maxMultiplier,
  currentMultiplier,
  currentProfit,
  floatingBadges,
  selectedAutoTiles,
  mode,
  onTileClick,
  onRepeatTiles,
  onClearTiles,
  animations = true,
}: MinesGridProps) {
  const currentGemsOpened = revealedTiles.filter((t) => !mineLocations.includes(t)).length;
  const totalGems = 25 - minesCount;

  return (
    <div className="flex-1 bg-[#0f212e] p-3.5 sm:p-5 lg:p-7 flex flex-col items-center justify-between min-h-[460px] sm:min-h-[540px] relative overflow-hidden rounded-2xl select-none">
      {/* Subtle Ambient Radial Lighting */}
      <div className="absolute inset-0 bg-radial from-[#1a2c38]/40 via-transparent to-transparent pointer-events-none" />

      {/* Dynamic Multiplier Header Strip Matching Stake Parity */}
      <div className="w-full flex items-center justify-between gap-2 z-10 mb-3 flex-wrap">
        {/* Left: Dynamic Max Multiplier Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#1a2c38] border border-[#213743] rounded-xl px-3 py-1.5 shadow-sm">
            <span className="text-[11px] font-bold text-[#b1bad3] uppercase tracking-wider">
              Max Multiplier
            </span>
            <span className="font-mono text-xs sm:text-sm font-black text-[#00e701]">
              {maxMultiplier.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}×
            </span>
          </div>

          {isPlaying && (
            <div className="flex items-center gap-1.5 bg-[#00e701]/10 border border-[#00e701]/30 rounded-xl px-3 py-1.5 shadow-sm animate-in fade-in">
              <Trophy className="w-3.5 h-3.5 text-[#00e701]" />
              <span className="font-mono text-xs font-black text-[#00e701]">
                {currentMultiplier.toFixed(2)}× (+${currentProfit.toFixed(2)})
              </span>
            </div>
          )}
        </div>

        {/* Right: Repeat & Clear Controls */}
        <div className="flex items-center gap-1.5">
          {onRepeatTiles && (
            <button
              type="button"
              onClick={onRepeatTiles}
              disabled={isPlaying}
              className="flex items-center gap-1.5 bg-[#1a2c38] hover:bg-[#213743] text-[#b1bad3] hover:text-white border border-[#213743] px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95 shadow-sm"
              title="Repeat previous pattern"
            >
              <RotateCcw className="w-3 h-3 text-[#00e701]" />
              <span className="hidden sm:inline">Repeat</span>
            </button>
          )}

          {onClearTiles && (
            <button
              type="button"
              onClick={onClearTiles}
              disabled={isPlaying}
              className="flex items-center gap-1.5 bg-[#1a2c38] hover:bg-[#213743] text-[#b1bad3] hover:text-white border border-[#213743] px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95 shadow-sm"
              title="Clear selection"
            >
              <Trash2 className="w-3 h-3 text-red-400" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}

          {isPlaying && (
            <div className="rounded-xl bg-[#1a2c38] px-2.5 py-1.5 border border-[#213743] text-xs text-[#b1bad3]">
              <span>Gems: </span>
              <strong className="text-[#00e701] font-mono">
                {currentGemsOpened}/{totalGems}
              </strong>
            </div>
          )}
        </div>
      </div>

      {/* 5x5 Mines Grid Arena */}
      <div className="relative my-auto flex items-center justify-center w-full max-w-[430px] aspect-square z-10">
        <div className="grid grid-cols-5 gap-2 sm:gap-2.5 w-full h-full p-2.5 rounded-2xl bg-[#14232f] border border-[#213743]/80 shadow-2xl">
          {Array.from({ length: 25 }).map((_, index) => {
            const isRevealed = revealedTiles.includes(index);
            const isMine = mineLocations.includes(index);
            const isExplodedMine = isGameOver && isMine && isRevealed;
            const isDimmedHiddenMine = isGameOver && isMine && !isRevealed;
            const isDimmedUntouchedGem =
              (isGameOver || (!isPlaying && revealedTiles.length > 0)) &&
              !isMine &&
              !isRevealed;
            const isAutoSelected = mode === "auto" && selectedAutoTiles.includes(index);

            return (
              <button
                key={index}
                type="button"
                onClick={() => onTileClick(index)}
                disabled={(!isPlaying && mode !== "auto") || (isPlaying && (isRevealed || isGameOver))}
                className={`relative rounded-xl flex items-center justify-center transition-all select-none duration-150 cursor-pointer ${
                  isRevealed && !isMine
                    ? "bg-[#1a2c38] border border-[#00e701]/50 shadow-[0_0_18px_rgba(0,231,1,0.3)]"
                    : isExplodedMine
                    ? "bg-red-950/80 border-2 border-red-500 shadow-[0_0_24px_rgba(239,68,68,0.7)]"
                    : isDimmedHiddenMine
                    ? "bg-[#1a2c38]/50 border border-red-900/40 opacity-40 cursor-default"
                    : isDimmedUntouchedGem
                    ? "bg-[#1a2c38]/50 border border-[#213743] opacity-35 cursor-default"
                    : isAutoSelected
                    ? "bg-[#00e701]/20 border-2 border-[#00e701] shadow-[0_0_12px_rgba(0,231,1,0.3)]"
                    : isPlaying
                    ? "bg-[#2f4553] hover:bg-[#3d5565] border-b-4 border-[#213743] hover:border-[#2b404e] active:translate-y-1 active:border-b-0 shadow-md"
                    : mode === "auto"
                    ? "bg-[#2f4553] hover:bg-[#3d5565] border-b-4 border-[#213743] shadow-md"
                    : "bg-[#2f4553] border-b-4 border-[#213743] opacity-75 cursor-default"
                }`}
              >
                {/* Floating Multiplier Profit Badge on this Tile */}
                {floatingBadges[index] && (
                  <span className="absolute -top-3 z-30 pointer-events-none rounded-md bg-[#00e701] px-1.5 py-0.5 text-[10px] font-black text-[#0f212e] shadow-lg animate-float-up">
                    {floatingBadges[index]}
                  </span>
                )}

                {/* 1. Revealed Sparkling Green GEM 💎 */}
                {isRevealed && !isMine && (
                  <svg
                    viewBox="0 0 48 48"
                    className={`h-7 w-7 sm:h-9 sm:w-9 drop-shadow-[0_0_12px_rgba(0,231,1,0.8)] ${
                      animations ? "animate-gem-pop" : ""
                    }`}
                    fill="none"
                  >
                    <polygon
                      points="24,6 40,16 34,40 14,40 8,16"
                      fill="url(#gemGrad)"
                      stroke="#00e701"
                      strokeWidth="1.5"
                    />
                    <polygon
                      points="24,6 40,16 24,24 8,16"
                      fill="#00ff01"
                      fillOpacity="0.4"
                    />
                    <polygon
                      points="24,24 40,16 34,40"
                      fill="#00b301"
                      fillOpacity="0.6"
                    />
                    <polygon
                      points="24,24 8,16 14,40"
                      fill="#008001"
                      fillOpacity="0.6"
                    />
                    <circle cx="24" cy="14" r="2.5" fill="#ffffff" opacity="0.9" />
                    <defs>
                      <linearGradient id="gemGrad" x1="24" y1="6" x2="24" y2="40" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#00e701" />
                        <stop offset="0.6" stopColor="#00a301" />
                        <stop offset="1" stopColor="#004d00" />
                      </linearGradient>
                    </defs>
                  </svg>
                )}

                {/* 2. Exploded Red Bomb 💣 */}
                {isExplodedMine && (
                  <svg
                    viewBox="0 0 48 48"
                    className={`h-7 w-7 sm:h-9 sm:w-9 drop-shadow-[0_0_16px_rgba(239,68,68,0.9)] ${
                      animations ? "animate-bomb-shake" : ""
                    }`}
                    fill="none"
                  >
                    <circle cx="22" cy="26" r="15" fill="url(#bombGrad)" stroke="#ef4444" strokeWidth="1.5" />
                    <circle cx="17" cy="20" r="3" fill="#ffffff" opacity="0.4" />
                    <rect x="18" y="8" width="8" height="4" rx="1" fill="#475569" stroke="#334155" strokeWidth="1" />
                    <path d="M22 8 C 22 2, 30 5, 34 3" stroke="#eab308" strokeWidth="2.5" strokeLinecap="round" />
                    <polygon points="34,1 36,4 39,2 37,5 40,7 36,7 35,10 33,7 29,7 32,5 30,2 33,4" fill="#ef4444" />
                    <circle cx="34" cy="3" r="2.5" fill="#facc15" />
                    <defs>
                      <radialGradient id="bombGrad" cx="30%" cy="30%" r="70%">
                        <stop offset="0%" stopColor="#450a0a" />
                        <stop offset="60%" stopColor="#1c1917" />
                        <stop offset="100%" stopColor="#000000" />
                      </radialGradient>
                    </defs>
                  </svg>
                )}

                {/* 3. Dimmed Mine on Game Over */}
                {isDimmedHiddenMine && (
                  <svg viewBox="0 0 48 48" className="h-6 w-6 sm:h-7 sm:w-7 opacity-35" fill="none">
                    <circle cx="24" cy="26" r="12" fill="#ef4444" opacity="0.6" />
                    <rect x="21" y="10" width="6" height="3" rx="1" fill="#991b1b" />
                  </svg>
                )}

                {/* 4. Dimmed Gem on Game Over */}
                {isDimmedUntouchedGem && (
                  <svg viewBox="0 0 48 48" className="h-6 w-6 sm:h-7 sm:w-7 opacity-25" fill="none">
                    <polygon points="24,10 36,18 32,36 16,36 12,18" fill="#00e701" opacity="0.5" />
                  </svg>
                )}

                {/* 5. Auto Mode Selection Indicator */}
                {isAutoSelected && !isRevealed && !isGameOver && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00e701] shadow-[0_0_8px_#00e701]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Status Ticker */}
      <div className="w-full flex items-center justify-between text-xs text-[#b1bad3] z-10 pt-2 border-t border-[#213743]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#00e701] animate-pulse" />
          <span>Provably Fair RNG SHA-256</span>
        </div>
        <div className="text-[11px] font-mono">
          <span>House Edge: 1.00%</span>
        </div>
      </div>
    </div>
  );
}
