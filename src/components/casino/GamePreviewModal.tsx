"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  ShieldCheck,
  Heart,
  ChevronRight,
  ChevronDown,
  Bookmark,
  Play,
  Layers,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { getGameThumbnail } from "@/data/gameThumbnails";
import StakeGameArtwork from "@/components/casino/StakeGameArtwork";

export default function GamePreviewModal() {
  const router = useRouter();
  const { previewGame, closeGamePreview, currency, addRecentlyPlayedGame } = useGame();

  const [isFullscreenMode, setIsFullscreenMode] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [showFairnessInfo, setShowFairnessInfo] = useState<boolean>(false);

  if (!previewGame) return null;

  const gameTitle = previewGame.title || previewGame.name || "Game";
  const slug = previewGame.slug || previewGame.id || "game";
  const providerName = previewGame.provider || "Stake Originals";
  const thumbnail = getGameThumbnail(slug, previewGame.image);

  // Generate plausible, realistic player counts based on game data
  const playingCount = previewGame.playersCount
    ? `${(previewGame.playersCount / 1000).toFixed(2)}K`
    : "8.42K";
  const savesCount = "24.1K";
  const followersCount = providerName === "Stake Originals" ? "194.66K Followers" : "89.2K Followers";

  const targetHref =
    previewGame.href ||
    (previewGame.isPlayable || previewGame.category === "originals" || providerName === "Stake Originals"
      ? `/games/${slug}`
      : `/casino/games/${slug}`);

  const handleLaunchGame = () => {
    if (addRecentlyPlayedGame) {
      addRecentlyPlayedGame({
        id: previewGame.id,
        slug,
        title: gameTitle,
        href: targetHref,
        image: thumbnail,
        playersCount: previewGame.playersCount,
      });
    }

    if (isFullscreenMode && typeof document !== "undefined" && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }

    closeGamePreview();
    router.push(targetHref);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) closeGamePreview();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md space-y-3 relative text-white my-auto select-none">
        {/* Floating Close Button */}
        <button
          onClick={closeGamePreview}
          className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-[#1a2c38] border border-[#2f4553] text-[#b1bad3] hover:text-white flex items-center justify-center transition-colors shadow-lg cursor-pointer"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 1. TOP GAME INFO CARD */}
        <div className="bg-[#1a2c38] rounded-xl p-4 border border-[#213743] shadow-2xl">
          {/* Upper thumbnail & title row */}
          <div className="flex items-start gap-4">
            {/* Portrait game thumbnail */}
            <div className="w-20 sm:w-24 aspect-[3/4] rounded-lg overflow-hidden bg-[#0f212e] border border-[#213743] shrink-0 relative shadow-md">
              {thumbnail ? (
                <img
                  src={thumbnail}
                  alt={gameTitle}
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-2">
                  <StakeGameArtwork gameId={slug} />
                </div>
              )}
            </div>

            {/* Title & Save Game Button */}
            <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white leading-tight truncate">
                  {gameTitle}
                </h2>
                <p className="text-xs text-[#b1bad3] font-semibold mt-0.5 truncate">
                  {providerName}
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsSaved(!isSaved)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isSaved
                      ? "bg-[#00e701]/20 text-[#00e701] border border-[#00e701]/40"
                      : "bg-[#2f4553] text-[#b1bad3] hover:text-white"
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-[#00e701]" : ""}`} />
                  <span>{isSaved ? "Saved" : "Save Game"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Settings Row: Currency Display & Fullscreen Slider */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#213743]">
            {/* Currency selector display */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0f212e] border border-[#213743] text-xs font-bold text-white">
              <span className="text-[#b1bad3] text-[11px]">Display</span>
              <span>🇮🇳</span>
              <span>INR</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#b1bad3] ml-0.5" />
            </div>

            {/* Fullscreen Toggle Slider */}
            <div className="flex items-center gap-2 text-xs font-bold text-[#b1bad3]">
              <span>Fullscreen</span>
              <button
                type="button"
                onClick={() => setIsFullscreenMode(!isFullscreenMode)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  isFullscreenMode ? "bg-[#1475e1]" : "bg-[#0f212e] border border-[#213743]"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    isFullscreenMode ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Action Row: Real Play Primary CTA & Fairness Icon */}
          <div className="flex items-center gap-2 pt-3 mt-1">
            <button
              type="button"
              onClick={handleLaunchGame}
              className="bg-[#1475e1] hover:bg-[#1164c2] text-white font-extrabold py-3.5 rounded-lg flex-1 text-center shadow-lg active:scale-[0.98] transition-all cursor-pointer text-sm sm:text-base tracking-wider flex items-center justify-center gap-2 uppercase"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span>Real Play</span>
            </button>

            <button
              type="button"
              onClick={() => setShowFairnessInfo(!showFairnessInfo)}
              className="bg-[#2f4553]/60 hover:bg-[#2f4553] p-3.5 rounded-lg text-[#b1bad3] hover:text-white transition-colors cursor-pointer border border-[#2f4553]"
              title="Provably Fair RNG"
            >
              <ShieldCheck className="w-5 h-5 text-[#00e701]" />
            </button>
          </div>

          {/* Conditional Fairness Notice Dropdown */}
          {showFairnessInfo && (
            <div className="mt-3 p-3 rounded-lg bg-[#0f212e] border border-[#213743] text-xs text-[#b1bad3] leading-relaxed animate-in fade-in">
              <div className="flex items-center gap-1.5 font-bold text-white mb-1">
                <ShieldCheck className="w-4 h-4 text-[#00e701]" />
                <span>Certified Provably Fair</span>
              </div>
              This game operates with cryptographic seeds, ensuring transparent, immutable, and 99% certified RTP outcomes.
            </div>
          )}
        </div>

        {/* 2. PROVIDER & INSIGHTS CARD */}
        <div className="bg-[#1a2c38] rounded-xl p-4 border border-[#213743] shadow-2xl">
          {/* Upper Provider Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Provider Logo Box */}
              <div className="w-10 h-10 rounded-lg bg-[#0f212e] border border-[#2f4553] flex items-center justify-center font-black text-xs text-[#00e701] shadow-inner">
                {providerName.charAt(0)}
              </div>

              <div>
                <h4 className="text-white font-bold text-sm leading-tight">
                  {providerName}
                </h4>
                <p className="text-[#b1bad3] text-xs font-medium">
                  {followersCount}
                </p>
              </div>
            </div>

            {/* Heart Favorite Button */}
            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className={`border border-[#2f4553] rounded-lg p-2 transition-colors cursor-pointer ${
                isFavorite
                  ? "bg-red-500/20 text-red-400 border-red-500/40"
                  : "bg-[#213743]/60 text-[#b1bad3] hover:text-white"
              }`}
              title="Favorite Provider"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-400 text-red-400" : ""}`} />
            </button>
          </div>

          {/* Divider Line */}
          <div className="border-t border-[#213743] my-3" />

          {/* Lower Game Insights Row */}
          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-xs sm:text-sm font-bold text-white leading-tight">
                {gameTitle} Insights
              </h5>
              <div className="flex items-center gap-3 text-[11px] text-[#b1bad3] mt-0.5 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00e701] animate-pulse" />
                  <strong className="text-white">{playingCount}</strong> Playing
                </span>
                <span>•</span>
                <span>
                  <strong className="text-white">{savesCount}</strong> Saves
                </span>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-[#b1bad3]" />
          </div>
        </div>
      </div>
    </div>
  );
}
