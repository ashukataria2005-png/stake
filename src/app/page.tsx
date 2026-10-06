"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Flame,
  Activity,
  Play,
  ChevronRight,
  Search,
  X,
  Sparkles,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";
import CasinoSportsHeroBanner from "@/components/CasinoSportsHeroBanner";
import LiveStatusAndSearch from "@/components/LiveStatusAndSearch";
import VIPProgressCard from "@/components/VIPProgressCard";
import ContinuePlayingSlider from "@/components/ContinuePlayingSlider";
import GamesForYou from "@/components/GamesForYou";
import TrendingGames from "@/components/TrendingGames";
import TrendingSports from "@/components/TrendingSports";
import RacesAndRafflesWidget from "@/components/RacesAndRafflesWidget";
import LiveBetsFeed from "@/components/LiveBetsFeed";
import StakeGameArtwork from "@/components/casino/StakeGameArtwork";
import { getGameThumbnail } from "@/data/gameThumbnails";
import { STAKE_ORIGINALS, LIVE_CASINO_GAMES, GameItem } from "@/data/stakeGames";

interface SlotModalGame {
  id: string;
  title: string;
  provider: string;
  rtp?: string;
  symbols?: string[];
}

export default function HomePage() {
  const { balance, updateBalance, currency, addRecentlyPlayedGame } = useGame();

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Visible counts for Load More
  const [visibleOriginalsCount, setVisibleOriginalsCount] = useState<number>(6);
  const [visibleLiveCount, setVisibleLiveCount] = useState<number>(6);

  // Slot Demo Player Modal state
  const [activeSlotModal, setActiveSlotModal] = useState<SlotModalGame | null>(null);
  const [slotBet, setSlotBet] = useState<number>(10);
  const [slotReels, setSlotReels] = useState<string[][]>([
    ["⚡", "👑", "💎", "⭐", "🏺"],
    ["💎", "⚡", "👑", "🏺", "⭐"],
    ["⭐", "🏺", "💎", "⚡", "👑"],
  ]);
  const [isSpinningSlot, setIsSpinningSlot] = useState<boolean>(false);
  const [slotLastWin, setSlotLastWin] = useState<number | null>(null);

  // Filter games when user types in global search
  const isSearching = searchQuery.trim().length > 0;
  const searchResults: GameItem[] = isSearching
    ? [...STAKE_ORIGINALS, ...LIVE_CASINO_GAMES].filter((g) =>
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.provider.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Slot Demo Spin Handler
  const spinSlotDemo = (game: SlotModalGame) => {
    if (isSpinningSlot) return;
    if (slotBet > balance) {
      alert("Insufficient demo balance! Please top up via the Wallet button.");
      return;
    }
    if (slotBet <= 0) return;

    updateBalance(-slotBet);
    setIsSpinningSlot(true);
    setSlotLastWin(null);
    sounds.playDiceRoll();

    const pool = game.symbols || ["💎", "⚡", "👑", "⭐", "🏺"];

    // 750ms tumble animation
    const startTime = performance.now();
    const interval = setInterval(() => {
      setSlotReels([
        Array.from({ length: 5 }, () => pool[Math.floor(Math.random() * pool.length)]),
        Array.from({ length: 5 }, () => pool[Math.floor(Math.random() * pool.length)]),
        Array.from({ length: 5 }, () => pool[Math.floor(Math.random() * pool.length)]),
      ]);

      if (performance.now() - startTime > 750) {
        clearInterval(interval);
        setIsSpinningSlot(false);

        // Win calculation
        const isWin = Math.random() > 0.4;
        if (isWin) {
          const mult = parseFloat((Math.random() * 8 + 1.5).toFixed(2));
          const payout = parseFloat((slotBet * mult).toFixed(2));
          setSlotLastWin(payout);
          updateBalance(payout);
          sounds.playDiceWin();

          if (mult >= 5) {
            try {
              confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
            } catch {}
          }
        } else {
          setSlotLastWin(0);
          sounds.playDiceLoss();
        }
      }
    }, 60);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 space-y-6 select-none">
      {/* 1. CASINO / SPORTS HERO BANNER (Dual 2-column cards) */}
      <CasinoSportsHeroBanner />

      {/* 2. LIVE STATUS & GLOBAL SEARCH BAR (showPills={false}) */}
      <LiveStatusAndSearch
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showPills={false}
      />

      {/* Search Results Overlay (If user is actively typing in search) */}
      {isSearching && (
        <section className="space-y-3 bg-[#14232d] p-4 rounded-2xl border border-[#213743]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Search className="h-4 w-4 text-[#00e701]" />
              <span>Search Results for &quot;{searchQuery}&quot; ({searchResults.length})</span>
            </h2>
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-[#b1bad3] hover:text-white"
            >
              Clear
            </button>
          </div>

          {searchResults.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#b1bad3]">
              No games found matching your search.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:gap-3 md:grid-cols-4 lg:grid-cols-6">
              {searchResults.slice(0, 12).map((game) => {
                const thumb = getGameThumbnail(game.slug || game.id, game.image);
                const gameHref = game.href || `/games/${game.slug || game.id}`;
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
                    }}
                    className="group relative flex flex-col select-none cursor-pointer"
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-[#1a2c38] border border-[#213743] hover:border-[#2f4553] transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={game.title}
                          className="w-full h-full object-cover rounded-xl"
                          loading="lazy"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center p-3">
                          <StakeGameArtwork gameId={game.slug || game.id} />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00e701] text-[#0f212e] shadow-lg shadow-[#00e701]/50 transform scale-75 group-hover:scale-100 transition-transform">
                          <Play className="h-4 w-4 fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-1.5 mt-1.5 sm:mt-2 px-0.5 text-[10px] sm:text-[11px] font-semibold text-[#b1bad3] truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00e701] shadow-[0_0_6px_#00e701] animate-pulse shrink-0" />
                      <span className="truncate">{(game.playersCount || 2450).toLocaleString("en-US")} playing</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* 3. VIP PROGRESS CARD ("VIP Progress >", username, progress bar, Unranked -> Bronze) */}
      <VIPProgressCard />

      {/* 4. CONTINUE PLAYING SLIDER (Strictly rendered ONLY if recentlyPlayedGames has at least 1 game) */}
      <ContinuePlayingSlider />

      {/* 5. STAKE ORIGINALS > (Mines, Dice, Plinko, Limbo, etc. with "Load More" button) */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <Link
            href="/casino/group/stake-originals"
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#00e701]/15 text-[#00e701]">
              <Flame className="h-4 w-4 fill-current" />
            </div>
            <h2 className="text-base sm:text-xl font-black text-white group-hover:text-[#00e701] transition-colors flex items-center gap-1.5">
              <span>Stake Originals</span>
              <ChevronRight className="h-4 w-4 text-[#b1bad3] group-hover:translate-x-1 transition-transform" />
            </h2>
            <span className="rounded-full bg-[#213743] px-2 py-0.5 text-[11px] font-bold text-[#00e701]">
              31 Games
            </span>
          </Link>
          <Link
            href="/casino/group/stake-originals"
            className="text-xs font-bold text-[#00e701] hover:underline"
          >
            View All 31 &gt;
          </Link>
        </div>

        {/* 3:4 Full-Bleed Stake Originals Cards Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 md:grid-cols-4 lg:grid-cols-6">
          {STAKE_ORIGINALS.slice(0, visibleOriginalsCount).map((game) => {
            const thumb = getGameThumbnail(game.slug || game.id, game.image);
            const gameHref = game.href || `/games/${game.slug || game.id}`;
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
                }}
                className="group relative flex flex-col select-none cursor-pointer"
              >
                {/* 100% Full-Bleed Image Box */}
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-[#1a2c38] border border-[#213743] hover:border-[#2f4553] transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={game.title}
                      className="w-full h-full object-cover rounded-xl"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-3">
                      <StakeGameArtwork gameId={game.slug || game.id} />
                    </div>
                  )}

                  {/* Play Button Overlay on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#00e701] text-[#0f212e] shadow-lg shadow-[#00e701]/50 transform scale-75 group-hover:scale-100 transition-transform">
                      <Play className="h-5 w-5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Under-Card Player Count (ONLY green live player status pill) */}
                <div className="flex items-center gap-1 sm:gap-1.5 mt-1.5 sm:mt-2 px-0.5 text-[10px] sm:text-[11px] font-semibold text-[#b1bad3] truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00e701] shadow-[0_0_6px_#00e701] animate-pulse shrink-0" />
                  <span className="truncate">{(game.playersCount || 2450).toLocaleString("en-US")} playing</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Load More Button for Stake Originals */}
        {visibleOriginalsCount < STAKE_ORIGINALS.length && (
          <div className="flex justify-center pt-2">
            <button
              onClick={() => setVisibleOriginalsCount((prev) => Math.min(STAKE_ORIGINALS.length, prev + 6))}
              className="rounded-xl bg-[#213743] hover:bg-[#2f4553] px-6 py-2.5 text-xs font-bold text-white transition-colors"
            >
              Load More
            </button>
          </div>
        )}
      </section>

      {/* 6. LIVE CASINO > (Live dealer cards with "Load More" button) */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <Link
            href="/casino/group/live-casino"
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/15 text-red-400">
              <Activity className="h-4 w-4" />
            </div>
            <h2 className="text-base sm:text-xl font-black text-white group-hover:text-red-400 transition-colors flex items-center gap-1.5">
              <span>Live Casino</span>
              <ChevronRight className="h-4 w-4 text-[#b1bad3] group-hover:translate-x-1 transition-transform" />
            </h2>
            <span className="rounded-full bg-[#213743] px-2 py-0.5 text-[11px] font-bold text-red-400">
              Live Dealers
            </span>
          </Link>
          <Link
            href="/casino/group/live-casino"
            className="text-xs font-bold text-red-400 hover:underline"
          >
            View All Live &gt;
          </Link>
        </div>

        {/* 3:4 Full-Bleed Live Casino Cards Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 md:grid-cols-4 lg:grid-cols-6">
          {LIVE_CASINO_GAMES.slice(0, visibleLiveCount).map((game) => {
            const thumb = getGameThumbnail(game.slug || game.id, game.image);
            const gameHref = game.href || `/games/blackjack`;
            return (
              <div
                key={game.id}
                onClick={() => {
                  addRecentlyPlayedGame({
                    id: game.id,
                    slug: game.slug,
                    title: game.title,
                    href: gameHref,
                    image: thumb,
                    playersCount: game.playersCount,
                  });
                  setActiveSlotModal({
                    id: game.id,
                    title: game.title,
                    provider: game.provider,
                    rtp: "99.28% RTP",
                  });
                }}
                className="group relative flex flex-col select-none cursor-pointer"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-[#1a2c38] border border-[#213743] hover:border-[#2f4553] transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={game.title}
                      className="w-full h-full object-cover rounded-xl"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-3">
                      <StakeGameArtwork gameId={game.slug || game.id} />
                    </div>
                  )}

                  <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#00e701] text-[#0f212e] shadow-lg shadow-[#00e701]/50 transform scale-75 group-hover:scale-100 transition-transform">
                      <Play className="h-5 w-5 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-1.5 mt-1.5 sm:mt-2 px-0.5 text-[10px] sm:text-[11px] font-semibold text-[#b1bad3] truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00e701] shadow-[0_0_6px_#00e701] animate-pulse shrink-0" />
                  <span className="truncate">{(game.playersCount || 1920).toLocaleString("en-US")} playing</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Load More Button for Live Casino */}
        {visibleLiveCount < LIVE_CASINO_GAMES.length && (
          <div className="flex justify-center pt-2">
            <button
              onClick={() => setVisibleLiveCount((prev) => Math.min(LIVE_CASINO_GAMES.length, prev + 6))}
              className="rounded-xl bg-[#213743] hover:bg-[#2f4553] px-6 py-2.5 text-xs font-bold text-white transition-colors"
            >
              Load More
            </button>
          </div>
        )}
      </section>

      {/* 7. GAMES FOR YOU > (Drac's Stacks, Skyscraper Crash, Nuukd with "Load More" button) */}
      <GamesForYou />

      {/* 8. SLOTS > (Trending Games: Gates of Olympus 2500, Gates of Olympus Super Scatter, Sharks! with "Load More" button) */}
      <TrendingGames
        title="Slots"
        categoryHref="/casino/group/slots"
        onSelectGame={(g) => setActiveSlotModal(g as SlotModalGame)}
      />

      {/* 9. TRENDING SPORTS > (Soccer, Tennis, American Football cards with "Load More" button) */}
      <TrendingSports />

      {/* 10. RACES AND RAFFLES WIDGET ($100k Race, countdown, Leaderboard button, Not entered yet) */}
      <RacesAndRafflesWidget />

      {/* 11. LIVE BETS FEED (Casino Bets, Sports Bets, Race Leaderboard tabs with auto-streaming bets) */}
      <LiveBetsFeed />

      {/* Stake Authentic Partnerships & Accepted Cryptos Banner */}
      <section className="border-t border-[#213743] pt-8 pb-4 space-y-6 text-xs text-[#b1bad3]">
        <div className="rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 space-y-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-white text-center">
            Official Global Partners
          </div>
          <div className="flex flex-wrap items-center justify-around gap-6">
            <div className="flex items-center gap-2 font-black text-white text-sm sm:text-base tracking-wider">
              <span className="rounded bg-[#00e701] px-2 py-0.5 text-xs text-[#0f212e] font-black">F1</span>
              <span>STAKE F1 TEAM KICK SAUBER</span>
            </div>
            <div className="flex items-center gap-2 font-black text-white text-sm sm:text-base tracking-wider">
              <span className="rounded bg-red-600 px-2 py-0.5 text-xs text-white font-black">UFC</span>
              <span>OFFICIAL BETTING PARTNER</span>
            </div>
            <div className="flex items-center gap-2 font-black text-white text-sm sm:text-base tracking-wider">
              <span className="rounded bg-blue-600 px-2 py-0.5 text-xs text-white font-black">EFC</span>
              <span>EVERTON FOOTBALL CLUB</span>
            </div>
          </div>
        </div>

        {/* Accepted Cryptocurrencies Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {["BTC", "ETH", "LTC", "USDT", "DOGE", "SOL", "TRX", "BNB", "XRP"].map((coin) => (
            <span
              key={coin}
              className="rounded-lg border border-[#213743] bg-[#1a2c38] px-3 py-1 font-mono font-bold text-white text-[11px]"
            >
              {coin}
            </span>
          ))}
        </div>
      </section>

      {/* Interactive Slot / Live Game Demo Player Modal */}
      {activeSlotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-2xl border border-[#213743] bg-[#1a2c38] shadow-2xl overflow-hidden space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#213743] p-4 bg-[#14232f]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 font-bold">
                  🎰
                </div>
                <div>
                  <h3 className="text-base font-black text-white">{activeSlotModal.title}</h3>
                  <p className="text-xs text-[#b1bad3]">
                    {activeSlotModal.provider} • {activeSlotModal.rtp || "96.50% RTP"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveSlotModal(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#b1bad3] hover:bg-[#213743] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Slot Reels Screen */}
            <div className="p-6 bg-[#0f212e] mx-4 rounded-xl border border-[#213743] flex flex-col items-center space-y-4 shadow-inner">
              <div className="text-xs font-bold text-[#b1bad3] uppercase tracking-wider">
                5-Reel Tumble Grid Demo
              </div>

              {/* 3x5 Symbols Grid */}
              <div className="grid grid-rows-3 gap-2 w-full max-w-md bg-[#14232f] p-3 rounded-xl border border-[#213743]">
                {slotReels.map((row, rIdx) => (
                  <div key={rIdx} className="grid grid-cols-5 gap-2">
                    {row.map((sym, cIdx) => (
                      <div
                        key={cIdx}
                        className={`h-12 sm:h-14 rounded-lg bg-[#1a2c38] border border-[#213743] flex items-center justify-center text-2xl shadow-sm transition-all ${
                          isSpinningSlot ? "animate-pulse" : ""
                        }`}
                      >
                        {sym}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Win result banner */}
              {slotLastWin !== null && (
                <div
                  className={`text-sm font-bold uppercase tracking-wider ${
                    slotLastWin > 0 ? "text-[#00e701]" : "text-[#b1bad3]"
                  }`}
                >
                  {slotLastWin > 0
                    ? `Won +$${slotLastWin.toFixed(2)} ${currency}!`
                    : "No win this tumble. Spin again!"}
                </div>
              )}
            </div>

            {/* Modal Controls */}
            <div className="p-4 flex items-center justify-between gap-4 border-t border-[#213743]">
              <div className="flex items-center rounded-xl border border-[#213743] bg-[#0f212e] px-3 py-2 w-40">
                <span className="text-sm font-bold text-[#00e701] mr-1">$</span>
                <input
                  type="number"
                  disabled={isSpinningSlot}
                  value={slotBet}
                  onChange={(e) => setSlotBet(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="w-full bg-transparent text-sm font-bold text-white focus:outline-none font-mono"
                />
              </div>

              <button
                onClick={() => spinSlotDemo(activeSlotModal)}
                disabled={isSpinningSlot || slotBet > balance || slotBet <= 0}
                className="flex-1 rounded-xl bg-[#00e701] py-3 text-sm font-extrabold text-[#0f212e] shadow-lg shadow-[#00e701]/30 hover:bg-[#00c701] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className={`h-4 w-4 ${isSpinningSlot ? "animate-spin" : ""}`} />
                <span>{isSpinningSlot ? "Tumbling..." : "Spin Demo"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
