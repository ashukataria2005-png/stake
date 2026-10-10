"use client";

import React from "react";
import { useGame } from "@/context/GameContext";
import MinesMultiplierTrack from "./MinesMultiplierTrack";
import MinesGem from "./MinesGem";
import MinesBomb from "./MinesBomb";

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

      {/* 1. 5x5 Mines Arena Grid (Strictly First) */}
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

                {/* 1. Revealed Active Sparkling Green GEM 💎 */}
                {isRevealed && !isMine && (
                  <MinesGem id={index} animations={animations} />
                )}

                {/* 2. Exploded Active Red Bomb 💣 */}
                {isExplodedMine && (
                  <MinesBomb exploded id={index} animations={animations} />
                )}

                {/* 3. Translucent Muted Red Bomb on Game Over (Hidden Mines) */}
                {isDimmedHiddenMine && (
                  <MinesBomb dimmed id={index} />
                )}

                {/* 4. Translucent Muted Emerald Gem on Game Over (Unpicked Gems) */}
                {isDimmedUntouchedGem && (
                  <MinesGem dimmed id={index} />
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
            <div className="bg-[#071824]/65 backdrop-blur-sm border-2 border-[#00e701] rounded-lg px-4 py-3 sm:py-4 shadow-[0_0_35px_rgba(0,231,1,0.4)] w-full max-w-[190px] sm:max-w-[210px] text-center animate-in zoom-in-95 duration-200">
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


    </div>
  );
}
