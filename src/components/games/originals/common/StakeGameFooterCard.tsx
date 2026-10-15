"use client";

import React, { useState } from "react";
import { Heart, ChevronRight, Bookmark, ShieldCheck } from "lucide-react";
import ProvablyFairModal from "./ProvablyFairModal";

interface StakeGameFooterCardProps {
  gameTitle: string;
  followers?: string;
  provider?: string;
}

export default function StakeGameFooterCard({
  gameTitle,
  followers = "194.66K Followers",
  provider = "Stake Originals",
}: StakeGameFooterCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isProvablyFairOpen, setIsProvablyFairOpen] = useState(false);

  return (
    <>
      <div className="bg-[#1a2c38] rounded-xl p-3.5 border border-[#213743] mt-3">
        {/* Upper Provider Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Left: Dark rounded square icon with Stake logo */}
            <div className="bg-[#2f4553]/70 rounded-lg p-2 flex items-center justify-center w-10 h-10 border border-[#213743]">
              <span className="text-[#1475e1] font-black text-sm italic tracking-tighter select-none">
                Stake
              </span>
            </div>
            {/* Middle: Title & subtitle */}
            <div>
              <h4 className="text-white font-bold text-sm leading-tight">{provider}</h4>
              <p className="text-[#b1bad3] text-xs leading-tight mt-0.5">{followers}</p>
            </div>
          </div>

          {/* Right: Heart favorite button */}
          <button
            type="button"
            onClick={() => setIsFavorited(!isFavorited)}
            className={`border border-[#2f4553] bg-[#213743]/60 hover:bg-[#2f4553] rounded-lg p-2 text-[#b1bad3] transition-colors cursor-pointer ${
              isFavorited ? "text-[#e9113c] border-[#e9113c]/40" : ""
            }`}
            title="Favorite Provider"
          >
            <Heart className={`w-4 h-4 ${isFavorited ? "fill-[#e9113c]" : ""}`} />
          </button>
        </div>

        {/* Horizontal Divider */}
        <div className="border-t border-[#213743] my-3" />

        {/* Lower Game Title Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Active Game Name */}
            <span className="text-white font-bold text-sm">{gameTitle}</span>
            {/* Save Game pill button */}
            <button
              type="button"
              onClick={() => setIsSaved(!isSaved)}
              className={`flex items-center gap-1 bg-[#2f4553] hover:bg-[#3b5567] text-[#b1bad3] text-xs font-semibold px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                isSaved ? "text-[#00e701]" : ""
              }`}
            >
              <Bookmark className={`w-3 h-3 ${isSaved ? "fill-[#00e701]" : ""}`} />
              <span>{isSaved ? "Saved" : "Save Game"}</span>
            </button>
            {/* Provably Fair pill button */}
            <button
              type="button"
              onClick={() => setIsProvablyFairOpen(true)}
              className="flex items-center gap-1.5 bg-[#0f212e] hover:bg-[#213743] text-[#00e701] border border-[#00e701]/30 hover:border-[#00e701] text-xs font-semibold px-2.5 py-1 rounded-md transition-all cursor-pointer shadow-sm"
              title="Verify Provably Fair Randomness"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Provably Fair</span>
            </button>
          </div>

          {/* Right chevron arrow icon */}
          <button
            type="button"
            onClick={() => setIsProvablyFairOpen(true)}
            className="flex items-center gap-1 text-[#b1bad3] hover:text-white text-xs cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <ProvablyFairModal
        isOpen={isProvablyFairOpen}
        onClose={() => setIsProvablyFairOpen(false)}
        gameTitle={gameTitle}
      />
    </>
  );
}
