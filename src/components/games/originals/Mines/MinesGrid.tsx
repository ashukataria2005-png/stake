"use client";

import React from "react";
import { Sparkles, RotateCcw, Trash2, Trophy } from "lucide-react";
import { useGame } from "@/context/GameContext";
import MinesMultiplierTrack from "./MinesMultiplierTrack";

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
  cashoutOverlay?: { multiplier: number; payout: number } | null;
  onDismissCashout?: () => void;
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
  cashoutOverlay,
  onDismissCashout,
}: MinesGridProps) {
  const { currencySymbol } = useGame();
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
        <div className="grid grid-cols-5 grid-rows-5 auto-rows-fr gap-2 sm:gap-2.5 w-full h-full p-2.5 rounded-2xl bg-[#14232f] border border-[#213743]/80 shadow-2xl">
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
                className={`relative aspect-square w-full h-full rounded-xl flex items-center justify-center transition-all select-none duration-150 overflow-visible ${
                  isRevealed && !isMine
                    ? "bg-[#1a2c38] border-2 border-[#00e701] shadow-[0_0_20px_rgba(0,231,1,0.35)] cursor-default"
                    : isExplodedMine
                    ? "bg-red-950/90 border-2 border-[#fe2247] shadow-[0_0_28px_rgba(254,34,71,0.9)] animate-pulse z-20 cursor-default"
                    : isDimmedHiddenMine
                    ? "bg-[#1a2c38]/60 border-2 border-[#fe2247]/30 cursor-default"
                    : isDimmedUntouchedGem
                    ? "bg-[#1a2c38]/60 border-2 border-[#00e701]/25 cursor-default"
                    : isAutoSelected
                    ? "bg-[#00e701]/20 border-2 border-[#00e701] shadow-[0_0_12px_rgba(0,231,1,0.3)] cursor-pointer"
                    : isPlaying
                    ? "bg-[#2f4553] hover:bg-[#3d5565] border-2 border-[#213743] hover:border-[#385162] shadow-md active:scale-95 cursor-pointer"
                    : mode === "auto"
                    ? "bg-[#2f4553] hover:bg-[#3d5565] border-2 border-[#213743] shadow-md cursor-pointer"
                    : "bg-[#2f4553] border-2 border-[#213743] opacity-75 cursor-default"
                }`}
              >
                {/* Floating Multiplier Profit Badge on this Tile */}
                {floatingBadges[index] && (
                  <span className="absolute -top-3 z-30 pointer-events-none rounded-md bg-[#00e701] px-1.5 py-0.5 text-[10px] font-black text-[#0f212e] shadow-lg animate-float-up">
                    {floatingBadges[index]}
                  </span>
                )}

                {/* 1. Revealed Active Sparkling Green GEM 💎 (Stake Emerald Diamond Parity) */}
                {isRevealed && !isMine && (
                  <svg
                    viewBox="0 0 64 64"
                    className={`h-8 w-8 sm:h-10 sm:w-10 drop-shadow-[0_0_14px_rgba(0,231,1,0.85)] ${
                      animations ? "animate-gem-pop" : ""
                    }`}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <radialGradient id={`gemUnderGlow-${index}`} cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#00e701" stopOpacity="0.8" />
                        <stop offset="60%" stopColor="#00c701" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                      </radialGradient>
                      <linearGradient id={`gemCrown-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#75ff91" />
                        <stop offset="50%" stopColor="#00e701" />
                        <stop offset="100%" stopColor="#00a301" />
                      </linearGradient>
                      <linearGradient id={`gemFacetL-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00ff66" />
                        <stop offset="100%" stopColor="#008001" />
                      </linearGradient>
                      <linearGradient id={`gemFacetR-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00a301" />
                        <stop offset="100%" stopColor="#004d00" />
                      </linearGradient>
                    </defs>

                    {/* Ambient Green Underglow */}
                    <circle cx="32" cy="34" r="24" fill={`url(#gemUnderGlow-${index})`} />

                    {/* Faceted Emerald Gem Silhouette */}
                    <polygon points="32,8 16,22 32,32" fill={`url(#gemFacetL-${index})`} stroke="#a3ffb0" strokeWidth="0.75" />
                    <polygon points="32,8 48,22 32,32" fill={`url(#gemFacetR-${index})`} stroke="#a3ffb0" strokeWidth="0.75" />
                    <polygon points="32,8 42,16 32,24 22,16" fill={`url(#gemCrown-${index})`} stroke="#ffffff" strokeWidth="0.8" />

                    {/* Lower Pavilion Tapering */}
                    <polygon points="16,22 32,32 32,56" fill={`url(#gemFacetL-${index})`} stroke="#00e701" strokeWidth="0.75" />
                    <polygon points="48,22 32,32 32,56" fill={`url(#gemFacetR-${index})`} stroke="#00e701" strokeWidth="0.75" />
                    <polygon points="22,16 32,24 32,56 16,22" fill="#00c701" fillOpacity="0.45" />
                    <polygon points="42,16 32,24 32,56 48,22" fill="#008f01" fillOpacity="0.45" />

                    {/* Crisp Bevel Highlights */}
                    <line x1="32" y1="8" x2="32" y2="56" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.7" />
                    <line x1="16" y1="22" x2="48" y2="22" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.6" />

                    {/* Sparkling Glint Star */}
                    <polygon points="32,6 33.5,11 38,11 34.5,13.5 36,18 32,15 28,18 29.5,13.5 26,11 30.5,11" fill="#ffffff" fillOpacity="0.95" />
                  </svg>
                )}

                {/* 2. Exploded Active Red Bomb 💣 (Stake Crimson-Charcoal Sphere with Ignited Fuse) */}
                {isExplodedMine && (
                  <svg
                    viewBox="0 0 64 64"
                    className={`h-8 w-8 sm:h-10 sm:w-10 drop-shadow-[0_0_20px_rgba(254,34,71,0.95)] ${
                      animations ? "animate-bomb-shake" : ""
                    }`}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <radialGradient id={`bombBody-${index}`} cx="35%" cy="35%" r="65%">
                        <stop offset="0%" stopColor="#4a1520" />
                        <stop offset="35%" stopColor="#250910" />
                        <stop offset="70%" stopColor="#14070a" />
                        <stop offset="100%" stopColor="#080204" />
                      </radialGradient>
                      <radialGradient id={`bombRedGlow-${index}`} cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#fe2247" stopOpacity="0.9" />
                        <stop offset="60%" stopColor="#fe2247" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                      </radialGradient>
                      <radialGradient id={`fuseSpark-${index}`} cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="35%" stopColor="#ffea00" />
                        <stop offset="70%" stopColor="#ff5400" />
                        <stop offset="100%" stopColor="#fe2247" />
                      </radialGradient>
                    </defs>

                    {/* Ambient Crimson Particle Glow */}
                    <circle cx="28" cy="36" r="24" fill={`url(#bombRedGlow-${index})`} />

                    {/* Crimson-Charcoal Sphere Body */}
                    <circle cx="28" cy="36" r="20" fill={`url(#bombBody-${index})`} stroke="#fe2247" strokeWidth="1.5" strokeOpacity="0.85" />
                    <ellipse cx="22" cy="28" rx="6" ry="3.5" transform="rotate(-30 22 28)" fill="#ffffff" fillOpacity="0.25" />
                    <circle cx="19" cy="25" r="2" fill="#ffffff" fillOpacity="0.45" />

                    {/* Metal Collar Neck */}
                    <rect x="23" y="13" width="10" height="5" rx="1.5" fill="#334155" stroke="#fe2247" strokeWidth="1" />

                    {/* Curved Rope Fuse */}
                    <path d="M28 13 C 28 6, 38 9, 44 6" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />

                    {/* Ignited Fuse Flame Particles */}
                    <circle cx="44" cy="6" r="5" fill={`url(#fuseSpark-${index})`} />
                    <polygon points="44,0 46,5 51,4 47,8 50,12 45,9 41,12 43,8 39,5 44,5" fill="#ffd166" />
                    <circle cx="44" cy="6" r="2" fill="#ffffff" />
                  </svg>
                )}

                {/* 3. Translucent Muted Red Bomb on Game Over (Matching Screenshot 37) */}
                {isDimmedHiddenMine && (
                  <div className="opacity-55 flex items-center justify-center">
                    <svg viewBox="0 0 48 48" className="h-7 w-7 drop-shadow-[0_0_8px_rgba(254,34,71,0.5)]" fill="none">
                      <circle cx="22" cy="26" r="14" fill="#3a0d14" stroke="#fe2247" strokeWidth="1.2" />
                      <ellipse cx="18" cy="20" rx="3.5" ry="2" fill="#ffffff" fillOpacity="0.2" />
                      <rect x="18" y="9" width="8" height="4" rx="1" fill="#475569" stroke="#991b1b" strokeWidth="0.8" />
                      <path d="M22 9 C 22 4, 28 6, 32 4" stroke="#b45309" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="32" cy="4" r="2" fill="#fe2247" />
                    </svg>
                  </div>
                )}

                {/* 4. Translucent Muted Emerald Gem on Game Over (Matching Screenshot 37) */}
                {isDimmedUntouchedGem && (
                  <div className="opacity-45 flex items-center justify-center">
                    <svg viewBox="0 0 48 48" className="h-7 w-7 drop-shadow-[0_0_8px_rgba(0,231,1,0.4)]" fill="none">
                      <polygon points="24,6 38,16 32,38 16,38 10,16" fill="#003800" stroke="#00e701" strokeWidth="1" />
                      <polygon points="24,6 38,16 24,24 10,16" fill="#00e701" fillOpacity="0.25" />
                      <polygon points="24,24 38,16 32,38" fill="#00a301" fillOpacity="0.3" />
                      <line x1="24" y1="6" x2="24" y2="38" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.4" />
                    </svg>
                  </div>
                )}

                {/* 5. Auto Mode Selection Indicator */}
                {isAutoSelected && !isRevealed && !isGameOver && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00e701] shadow-[0_0_8px_#00e701]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Authentic Centered Green Cashout Win Overlay (Floating over 5x5 grid) */}
        {cashoutOverlay && (
          <div
            onClick={onDismissCashout}
            className="absolute inset-0 z-30 flex items-center justify-center p-4 pointer-events-auto cursor-pointer"
          >
            <div className="bg-[#0f212e]/90 backdrop-blur-md border-2 border-[#00e701] rounded-2xl p-5 sm:p-6 shadow-[0_0_35px_rgba(0,231,1,0.45)] min-w-[200px] sm:min-w-[240px] text-center animate-in zoom-in-95 duration-200">
              <div className="text-2xl sm:text-3xl font-black font-mono text-[#00e701] tracking-tight">
                {cashoutOverlay.multiplier.toFixed(2)}×
              </div>
              <div className="h-[1px] bg-[#2f4553]/60 w-3/4 mx-auto my-2" />
              <div className="flex items-center justify-center gap-1.5 text-base sm:text-lg font-bold font-mono text-[#00e701]">
                <span>{currencySymbol || "₹"}</span>
                <span>{cashoutOverlay.payout.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Live In-Game Multiplier Progression Track (Rendered below grid when active) */}
      {isPlaying && (
        <div className="w-full max-w-[430px] my-1 sm:my-2 z-10 animate-in fade-in duration-200">
          <MinesMultiplierTrack
            minesCount={minesCount}
            revealedGemsCount={currentGemsOpened}
            isPlaying={isPlaying}
          />
        </div>
      )}

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
