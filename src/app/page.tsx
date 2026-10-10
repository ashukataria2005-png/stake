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
  ArrowRight,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";
import CasinoSportsHeroBanner from "@/components/CasinoSportsHeroBanner";
import LiveStatusAndSearch from "@/components/LiveStatusAndSearch";
import VIPProgressCard from "@/components/VIPProgressCard";
import ContinuePlayingSlider from "@/components/ContinuePlayingSlider";
import GamesForYou from "@/components/GamesForYou";
import TrendingSports from "@/components/TrendingSports";
import RacesAndRafflesWidget from "@/components/RacesAndRafflesWidget";
import LiveBetsFeed from "@/components/LiveBetsFeed";
import StakeGameArtwork from "@/components/casino/StakeGameArtwork";
import LiveCasinoGateModal from "@/components/casino/LiveCasinoGateModal";
import CasinoGameRow, { CasinoCardData } from "@/components/casino/CasinoGameRow";
import { HOME_PAGE_CATEGORIES } from "@/config/homeLayoutConfig";
import { getGameThumbnail } from "@/data/gameThumbnails";
import {
  STAKE_ORIGINALS,
  LIVE_CASINO_GAMES,
  EVOLUTION_GAMES,
  POPULAR_SLOTS,
  GAME_SHOWS_GAMES,
  INOUT_GAMES,
  EZUGI_GAMES,
  MAC88_GAMES,
  SPRIBE_GAMES,
  JILI_GAMES,
  HP100_GAMES,
  HACKSAW_GAMES,
  ALL_GAMES,
  GameItem,
  masterGameMap,
  getGameItem,
} from "@/data/stakeGames";

interface SlotModalGame {
  id: string;
  title: string;
  provider: string;
  rtp?: string;
  symbols?: string[];
}

export default function HomePage() {
  const { balance, realBalance, hasVerifiedDeposit, updateBalance, currency, currencySymbol, addRecentlyPlayedGame } = useGame();
  const activeSym = currencySymbol || "$";

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Live casino gating modal state
  const [isLiveGateOpen, setIsLiveGateOpen] = useState<boolean>(false);
  const [gateTableName, setGateTableName] = useState<string>("Live Casino Table");
  const [visibleLiveCount, setVisibleLiveCount] = useState<number>(6);

  // Slot Demo Player Modal state
  const [activeSlotModal, setActiveSlotModal] = useState<SlotModalGame | null>(null);
  const [slotBet, setSlotBet] = useState<number>(10);
  const [slotBetInput, setSlotBetInput] = useState<string>("10");
  const [slotReels, setSlotReels] = useState<string[][]>([
    ["⚡", "👑", "💎", "⭐", "🏺"],
    ["💎", "⚡", "👑", "🏺", "⭐"],
    ["⭐", "🏺", "💎", "⚡", "👑"],
  ]);
  const [isSpinningSlot, setIsSpinningSlot] = useState<boolean>(false);
  const [slotLastWin, setSlotLastWin] = useState<number | null>(null);

  const handleCardClick = (card: CasinoCardData) => {
    addRecentlyPlayedGame({
      id: card.id,
      title: card.title,
      href: card.href || `/casino/games/${card.id}`,
      image: card.image,
      playersCount: card.playersCount,
    });
  };

  // Instant real-time search across ALL_GAMES
  const isSearching = searchQuery.trim().length > 0;
  const searchResults: GameItem[] = isSearching
    ? ALL_GAMES.filter((g) => {
        const q = searchQuery.trim().toLowerCase();
        return (
          g.title.toLowerCase().includes(q) ||
          (g.name && g.name.toLowerCase().includes(q)) ||
          g.provider.toLowerCase().includes(q) ||
          (g.category && g.category.toLowerCase().includes(q))
        );
      })
    : [];

  // Slot Demo Spin Handler
  const spinSlotDemo = (game: SlotModalGame) => {
    if (isSpinningSlot) return;
    const effectiveBet = slotBetInput === "" ? slotBet : (parseFloat(slotBetInput) || slotBet);
    if (effectiveBet > balance) {
      alert("Insufficient demo balance! Please top up via the Wallet button.");
      return;
    }
    if (effectiveBet <= 0) return;

    setSlotBet(effectiveBet);
    updateBalance(-effectiveBet);
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

      {/* Search Results Grid (Replaces default lobby when actively searching) */}
      {isSearching ? (
        <section className="space-y-4 bg-[#14232d] p-4 sm:p-6 rounded-2xl border border-[#213743]">
          <div className="flex items-center justify-between pb-3 border-b border-[#213743]">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Search className="h-5 w-5 text-[#00e701]" />
              <span>
                Search Results for &ldquo;{searchQuery}&rdquo; ({searchResults.length} games found)
              </span>
            </h2>
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs sm:text-sm font-bold text-[#00e701] hover:underline cursor-pointer"
            >
              Clear Search
            </button>
          </div>

          {searchResults.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#1a2c38] flex items-center justify-center text-2xl">
                🔍
              </div>
              <p className="text-white font-bold text-base">No games found</p>
              <p className="text-xs text-[#b1bad3] mt-1">
                We couldn&apos;t find any games matching &ldquo;{searchQuery}&rdquo;
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 px-5 py-2 rounded-xl bg-[#213743] hover:bg-[#2f4553] text-xs sm:text-sm font-bold text-white transition-colors cursor-pointer"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 sm:gap-3.5">
              {searchResults.map((game) => {
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
                    <div className="flex flex-col mt-1.5 px-0.5">
                      <span className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-[#00e701] transition-colors">
                        {game.title}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-[#b1bad3] truncate">
                        {game.provider}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      ) : (
        <>

      {/* 3. VIP PROGRESS CARD ("VIP Progress >", username, progress bar, Unranked -> Bronze) */}
      <VIPProgressCard />

      {/* 4. CONTINUE PLAYING SLIDER (Strictly rendered ONLY if recentlyPlayedGames has at least 1 game) */}
      <ContinuePlayingSlider />

      {/* 5. DYNAMIC CATEGORY ROWS FROM layoutConfig */}
      {HOME_PAGE_CATEGORIES.filter((cat) => cat.enabled).map((cat) => {
        const cards: CasinoCardData[] = [];
        for (const slug of cat.orderedGameSlugs) {
          const game = masterGameMap.get(slug) || getGameItem(slug);
          if (game) {
            cards.push({
              id: game.slug || game.id,
              title: game.title || (game as any).name || slug,
              provider: game.provider,
              playersCount: game.playersCount,
              badge: game.badge,
              badgeColor: game.badgeColor,
              href: game.href || `/casino/games/${game.slug || game.id}`,
              image: getGameThumbnail(game.slug || game.id, game.image),
              bgGradient: game.bgGradient,
            });
          }
        }

        return (
          <CasinoGameRow
            key={cat.id}
            title={cat.title}
            linkHref={cat.viewAllLink || `/casino/group/${cat.id}`}
            cards={cards}
            onCardClick={handleCardClick}
            sectionId={cat.id}
            showGameTitle={cat.showGameTitle ?? true}
            showProviderName={cat.showProviderName ?? true}
          />
        );
      })}

      {/* 6. GAMES FOR YOU > */}
      <GamesForYou />

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
    </>
  )}

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
                    ? `Won +${activeSym}${slotLastWin.toFixed(2)} ${currency}!`
                    : "No win this tumble. Spin again!"}
                </div>
              )}
            </div>

            {/* Modal Controls */}
            <div className="p-4 flex items-center justify-between gap-4 border-t border-[#213743]">
              <div className="flex items-center rounded-xl border border-[#213743] bg-[#0f212e] px-3 py-2 w-40">
                <span className="text-sm font-bold text-[#00e701] mr-1">{activeSym}</span>
                <input
                  type="text"
                  inputMode="decimal"
                  disabled={isSpinningSlot}
                  value={slotBetInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || /^\d*\.?\d*$/.test(val)) {
                      setSlotBetInput(val);
                      if (val !== "") {
                        const num = parseFloat(val);
                        if (!isNaN(num)) setSlotBet(num);
                      }
                    }
                  }}
                  onBlur={() => {
                    if (slotBetInput === "" || parseFloat(slotBetInput) <= 0 || isNaN(parseFloat(slotBetInput))) {
                      setSlotBet(10);
                      setSlotBetInput("10");
                    } else {
                      const num = parseFloat(slotBetInput);
                      setSlotBet(num);
                      setSlotBetInput(num.toString());
                    }
                  }}
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

      {/* Live Casino Table Gating Modal */}
      <LiveCasinoGateModal
        isOpen={isLiveGateOpen}
        onClose={() => setIsLiveGateOpen(false)}
        tableName={gateTableName}
      />
    </div>
  );
}
