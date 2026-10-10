"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { Search, X, Play, TrendingUp, Sparkles } from "lucide-react";
import { ALL_GAMES, GameItem } from "@/data/stakeGames";
import { getGameThumbnail } from "@/data/gameThumbnails";
import StakeGameArtwork from "@/components/casino/StakeGameArtwork";
import { useGame } from "@/context/GameContext";

interface CasinoSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_TAGS = [
  "Mines",
  "Crash",
  "Plinko",
  "Aviator",
  "Crazy Time",
  "Roulette",
  "Blackjack",
  "Teen Patti",
  "Andar Bahar",
  "Sweet Bonanza",
];

export default function CasinoSearchModal({
  isOpen,
  onClose,
}: CasinoSearchModalProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { addRecentlyPlayedGame } = useGame();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Filter games based on query
  const filteredGames = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return ALL_GAMES.filter((g) => {
      return (
        g.title.toLowerCase().includes(q) ||
        (g.name && g.name.toLowerCase().includes(q)) ||
        g.slug.toLowerCase().includes(q) ||
        (g.provider && g.provider.toLowerCase().includes(q)) ||
        (g.category && g.category.toLowerCase().includes(q))
      );
    }).slice(0, 24);
  }, [query]);

  // Popular preview when empty
  const popularPreview = useMemo(() => {
    return ALL_GAMES.slice(0, 8);
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 md:p-10 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 select-none overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-[#1a2c38] border border-[#2f4553] shadow-2xl overflow-hidden mt-6 sm:mt-12 animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div className="relative flex items-center p-3.5 sm:p-4 border-b border-[#213743] bg-[#0f212e]">
          <Search className="w-5 h-5 text-[#b1bad3] shrink-0 ml-1.5" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search games, providers, categories..."
            className="w-full bg-transparent border-none outline-none text-white placeholder-[#b1bad3] px-3 text-sm sm:text-base font-semibold"
          />
          {query ? (
            <button
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="p-1.5 text-[#b1bad3] hover:text-white rounded-lg hover:bg-[#213743] transition-colors cursor-pointer mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
          <button
            onClick={onClose}
            className="p-1.5 text-[#b1bad3] hover:text-white rounded-lg hover:bg-[#213743] transition-colors cursor-pointer text-xs font-bold px-2.5 py-1 bg-[#213743]/60 border border-[#2f4553]/60"
          >
            ESC
          </button>
        </div>

        {/* Quick Tag Pills */}
        <div className="flex items-center gap-1.5 p-3 overflow-x-auto no-scrollbar border-b border-[#213743]/60 bg-[#14232f]/60 text-xs">
          <span className="text-[#b1bad3] font-bold text-[11px] uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-[#00e701]" />
            Trending:
          </span>
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setQuery(tag);
                inputRef.current?.focus();
              }}
              className="px-2.5 py-1 rounded-lg bg-[#213743] hover:bg-[#2a4454] text-[#b1bad3] hover:text-white transition-colors shrink-0 font-medium cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Search Results / Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {query.trim() ? (
            filteredGames.length > 0 ? (
              <div className="space-y-2">
                <div className="text-xs font-bold text-[#b1bad3] uppercase tracking-wider px-1">
                  Results ({filteredGames.length})
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3">
                  {filteredGames.map((game) => {
                    const thumb = getGameThumbnail(game.slug || game.id, game.image);
                    const gameHref = game.href || `/casino/games/${game.slug || game.id}`;
                    return (
                      <Link
                        key={game.id}
                        href={gameHref}
                        onClick={() => {
                          addRecentlyPlayedGame({
                            id: game.id,
                            slug: game.slug,
                            title: game.title,
                            href: gameHref,
                            image: thumb,
                            playersCount: game.playersCount,
                          });
                          onClose();
                        }}
                        className="group relative flex flex-col select-none cursor-pointer"
                      >
                        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-[#0f212e] border border-[#213743] hover:border-[#2f4553] transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
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
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#00e701] text-[#0f212e] shadow-lg shadow-[#00e701]/50 transform scale-75 group-hover:scale-100 transition-transform">
                              <Play className="h-4 w-4 fill-current ml-0.5" />
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col mt-1 px-0.5">
                          <span className="font-bold text-xs text-white truncate group-hover:text-[#00e701] transition-colors">
                            {game.title}
                          </span>
                          <span className="text-[10px] uppercase font-semibold text-[#b1bad3] truncate">
                            {game.provider || "Stake"}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#213743] flex items-center justify-center text-xl">
                  🔍
                </div>
                <div className="text-white font-bold text-sm">No games found</div>
                <p className="text-xs text-[#b1bad3]">
                  No results for &ldquo;{query}&rdquo;. Try another term or provider.
                </p>
              </div>
            )
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-[#b1bad3] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#00e701]" />
                  Popular Right Now
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                {popularPreview.map((game) => {
                  const thumb = getGameThumbnail(game.slug || game.id, game.image);
                  const gameHref = game.href || `/casino/games/${game.slug || game.id}`;
                  return (
                    <Link
                      key={game.id}
                      href={gameHref}
                      onClick={() => {
                        addRecentlyPlayedGame({
                          id: game.id,
                          slug: game.slug,
                          title: game.title,
                          href: gameHref,
                          image: thumb,
                          playersCount: game.playersCount,
                        });
                        onClose();
                      }}
                      className="group relative flex flex-col select-none cursor-pointer"
                    >
                      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-[#0f212e] border border-[#213743] hover:border-[#2f4553] transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
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
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#00e701] text-[#0f212e] shadow-lg shadow-[#00e701]/50 transform scale-75 group-hover:scale-100 transition-transform">
                            <Play className="h-4 w-4 fill-current ml-0.5" />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col mt-1 px-0.5">
                        <span className="font-bold text-xs text-white truncate group-hover:text-[#00e701] transition-colors">
                          {game.title}
                        </span>
                        <span className="text-[10px] uppercase font-semibold text-[#b1bad3] truncate">
                          {game.provider || "Stake"}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
