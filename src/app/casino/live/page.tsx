"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Activity, ShieldAlert, Lock, ArrowRight, Play, Users } from "lucide-react";
import { useGame } from "@/context/GameContext";
import { LIVE_CASINO_GAMES, GameItem } from "@/data/stakeGames";
import { getGameThumbnail } from "@/data/gameThumbnails";
import StakeGameArtwork from "@/components/casino/StakeGameArtwork";
import LiveCasinoGateModal from "@/components/casino/LiveCasinoGateModal";

export default function LiveCasinoPage() {
  const { realBalance, hasVerifiedDeposit, openWalletModal, addRecentlyPlayedGame } = useGame();
  const [selectedTable, setSelectedTable] = useState<GameItem | null>(null);
  const [isGateModalOpen, setIsGateModalOpen] = useState(false);

  const isRestricted = realBalance <= 0 && !hasVerifiedDeposit;

  const handleTableClick = (game: GameItem) => {
    setSelectedTable(game);
    if (isRestricted) {
      setIsGateModalOpen(true);
      return;
    }
    // Verified user with positive balance can join table
    addRecentlyPlayedGame({
      id: game.id,
      slug: game.slug,
      title: game.title,
      href: game.href || "/casino/live",
      image: getGameThumbnail(game.slug || game.id, game.image),
      playersCount: game.playersCount,
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-6">

      {/* Hero Banner for Live Casino */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950/80 via-[#1a2c38] to-[#0f212e] border border-red-500/20 p-5 sm:p-7 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-black uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5 animate-pulse" /> Real-Time Live Dealers
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Stake Live Casino
          </h1>
          <p className="text-xs sm:text-sm text-[#b1bad3] leading-relaxed">
            Direct high-definition audio & video streams from Evolution Gaming and Pragmatic Play Live studios. Real dealers, authentic shoe cards, and instant table action.
          </p>
        </div>
      </div>

      {/* Persistent Stake Warning Lock Sheet if balance <= 0 and unverified */}
      {isRestricted && (
        <div className="rounded-2xl border-2 border-amber-500/40 bg-[#1a2c38] p-5 sm:p-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-5 animate-in fade-in">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold text-white">
                  ⚠️ Real Balance Required
                </span>
                <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded font-black uppercase">
                  Tables Locked
                </span>
              </div>
              <p className="text-xs text-[#b1bad3] max-w-xl">
                Live Casino tables require an active balance. Please deposit to join live dealer tables. Fun Play is disabled on live tables.
              </p>
            </div>
          </div>

          <button
            onClick={openWalletModal}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#00e701] hover:bg-[#00c701] text-[#0f212e] font-black text-xs sm:text-sm shadow-[0_0_15px_rgba(0,231,1,0.35)] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <span>Deposit Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Live Casino Game Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-[#b1bad3]">
          <span>
            Showing <strong className="text-white">{LIVE_CASINO_GAMES.length}</strong> Live Tables
          </span>
          <span className="flex items-center gap-1.5 text-red-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> 24/7 Live Dealers Online
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
          {LIVE_CASINO_GAMES.map((game) => {
            const thumb = getGameThumbnail(game.slug || game.id, game.image);
            return (
              <div
                key={game.id}
                onClick={() => handleTableClick(game)}
                className="group relative flex flex-col select-none cursor-pointer"
              >
                {/* 3:4 Full Bleed Box */}
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-[#1a2c38] border border-[#213743] hover:border-[#2f4553] transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={game.title}
                      className="w-full h-full object-cover rounded-xl"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-3">
                      <StakeGameArtwork gameId={game.slug || game.id} />
                    </div>
                  )}

                  {/* Lock Overlay if restricted */}
                  {isRestricted ? (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex flex-col items-center justify-center p-2 text-center transition-all group-hover:bg-black/70">
                      <div className="w-9 h-9 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 mb-1.5 shadow-lg">
                        <Lock className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-black text-white uppercase tracking-wider">
                        Deposit to Play
                      </span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#00e701] text-[#0f212e] shadow-lg shadow-[#00e701]/50 transform scale-75 group-hover:scale-100 transition-transform">
                        <Play className="h-5 w-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Under-Card Player Count */}
                <div className="flex items-center gap-1 sm:gap-1.5 mt-1.5 sm:mt-2 px-0.5 text-[10px] sm:text-[11px] font-semibold text-[#b1bad3] truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444] animate-pulse shrink-0" />
                  <span className="truncate">{(game.playersCount || 1920).toLocaleString("en-US")} playing</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Popup when restricted user taps a table */}
      <LiveCasinoGateModal
        isOpen={isGateModalOpen}
        onClose={() => setIsGateModalOpen(false)}
        tableName={selectedTable?.title || "Live Casino Table"}
      />
    </div>
  );
}
