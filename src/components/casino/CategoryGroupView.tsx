"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Heart,
  Flame,
  ChevronDown,
  Sparkles,
  Gamepad2,
  Tv,
  ShieldAlert,
  ArrowRight,
  Activity,
} from "lucide-react";
import StakeGameCard from "@/components/casino/StakeGameCard";
import CasinoLiveBets from "@/components/casino/CasinoLiveBets";
import LiveCasinoGateModal from "@/components/casino/LiveCasinoGateModal";
import { useGame } from "@/context/GameContext";
import {
  STAKE_ORIGINALS,
  LIVE_CASINO_GAMES,
  EVOLUTION_GAMES,
  INOUT_GAMES,
  POPULAR_SLOTS,
  PRAGMATIC_GAMES,
  HACKSAW_GAMES,
  PROVIDERS_LIST,
  GameItem,
} from "@/data/stakeGames";

interface CategoryGroupViewProps {
  slug: string;
}

export default function CategoryGroupView({ slug }: CategoryGroupViewProps) {
  const { realBalance, hasVerifiedDeposit, openWalletModal } = useGame();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPublisher, setSelectedPublisher] = useState("all");
  const [sortOption, setSortOption] = useState<"popular" | "az" | "za" | "featured">("popular");
  const [isFollowing, setIsFollowing] = useState(false);
  const [visibleCount, setVisibleCount] = useState(18);
  const [gateModalOpen, setGateModalOpen] = useState(false);
  const [gateTableName, setGateTableName] = useState("Live Casino Table");

  const isLiveRestricted = slug === "live-casino" && realBalance <= 0 && !hasVerifiedDeposit;

  // Group metadata based on slug
  const groupMeta = useMemo(() => {
    switch (slug) {
      case "stake-originals":
        return {
          title: "Stake Originals",
          badge: "31 EXCLUSIVE GAMES",
          playersCount: "10,150",
          stats: "31 Games • 192.4K Followers • $375.517B Wagered • 378.23B Bets",
          description:
            "Stake's signature provably fair original titles engineered with an ultra-low 1% house edge, instant payouts, and dynamic multipliers up to 1,000,000x.",
          initialGames: STAKE_ORIGINALS,
          bannerBg: "from-emerald-950/70 via-[#1a2c38] to-[#0f212e]",
          icon: <Flame className="w-6 h-6 text-[#00e701]" />,
        };
      case "live-casino":
        return {
          title: "Live Casino",
          badge: "REAL DEALERS",
          playersCount: "28,420",
          stats: "80 Live Tables • Evolution & Stake Live • 24/7 Professional Dealers",
          description:
            "Experience high-definition live streaming tables directly from real casino studios. Stream Blackjack, Roulette, Baccarat, and high-roller VIP suites.",
          initialGames: LIVE_CASINO_GAMES,
          bannerBg: "from-rose-950/70 via-[#1a2c38] to-[#0f212e]",
          icon: <Gamepad2 className="w-6 h-6 text-rose-400" />,
        };
      case "evolution":
        return {
          title: "Evolution Gaming",
          badge: "80 LIVE TABLES",
          playersCount: "38,950",
          stats: "80 Live Tables • Evolution Gaming • Live Dealers & Game Shows",
          description:
            "Experience high-definition live streaming tables directly from Evolution Gaming studios. Stream Blackjack, Roulette, Baccarat, and high-roller VIP suites.",
          initialGames: EVOLUTION_GAMES,
          bannerBg: "from-red-950/70 via-[#1a2c38] to-[#0f212e]",
          icon: <Activity className="w-6 h-6 text-red-500" />,
        };
      case "inout":
      case "inout-games":
        return {
          title: "INOUT Games",
          badge: "30 EXCLUSIVE GAMES",
          playersCount: "26,840",
          stats: "30 Games • INOUT Studio • Instant Win & Crash Mechanics",
          description:
            "Play dynamic instant-win games, arcade multipliers, and crash sensations engineered by INOUT. Fast-paced action with provably fair rounds and high multipliers.",
          initialGames: INOUT_GAMES,
          bannerBg: "from-amber-950/70 via-[#1a2c38] to-[#0f212e]",
          icon: <Flame className="w-6 h-6 text-amber-400" />,
        };
      case "game-shows":
        return {
          title: "Game Shows",
          badge: "MEGA MULTIPLIERS",
          playersCount: "18,940",
          stats: "Studio Wheels • Interactive Bonus Rounds • Crazy Time & Monopoly",
          description:
            "Spectacular live studio entertainment with prize wheels, coin flips, pachinko drops, and augmented reality bonus rounds.",
          initialGames: LIVE_CASINO_GAMES.filter(
            (g) => g.category === "game-shows" || g.category === "live"
          ),
          bannerBg: "from-pink-950/70 via-[#1a2c38] to-[#0f212e]",
          icon: <Tv className="w-6 h-6 text-pink-400" />,
        };
      case "pragmatic":
      case "pragmatic-play":
        return {
          title: "Pragmatic Play",
          badge: "32 FLAGSHIP SLOTS",
          playersCount: "42,850",
          stats: "32 Games • Pragmatic Play • Megaways, Tumbling Reels & 1000x Series",
          description:
            "Play world-renowned Pragmatic Play slot titles including Gates of Olympus 1000, Sweet Bonanza 1000, Sugar Rush, and the complete Big Bass collection.",
          initialGames: PRAGMATIC_GAMES,
          bannerBg: "from-amber-950/70 via-[#1a2c38] to-[#0f212e]",
          icon: <Flame className="w-6 h-6 text-amber-400" />,
        };
      case "hacksaw":
      case "hacksaw-gaming":
        return {
          title: "Hacksaw Gaming",
          badge: "32 SIGNATURE TITLES",
          playersCount: "34,620",
          stats: "32 Games • Hacksaw Gaming • VS Multipliers, Cluster Pays & Dark Humor",
          description:
            "Experience innovative gritty slot classics by Hacksaw Gaming, featuring Wanted Dead or a Wild, Le Bandit, Dork Unit, Chaos Crew 2, and Rip City.",
          initialGames: HACKSAW_GAMES,
          bannerBg: "from-blue-950/70 via-[#1a2c38] to-[#0f212e]",
          icon: <Sparkles className="w-6 h-6 text-blue-400" />,
        };
      case "slots":
      default:
        return {
          title: "Slots",
          badge: "OVER 1,000 TITLES",
          playersCount: "45,210",
          stats: "Megaways • Bonus Buys • Pragmatic Play & Hacksaw Gaming",
          description:
            "Explore the most thrilling video slots online featuring tumble mechanics, expanding wilds, and massive max win multipliers.",
          initialGames: POPULAR_SLOTS,
          bannerBg: "from-amber-950/70 via-[#1a2c38] to-[#0f212e]",
          icon: <Sparkles className="w-6 h-6 text-amber-400" />,
        };
    }
  }, [slug]);

  // Filtering and sorting games
  const filteredGames = useMemo(() => {
    let list = [...groupMeta.initialGames];

    // Filter by Publisher
    if (selectedPublisher !== "all") {
      list = list.filter((game) =>
        game.provider.toLowerCase().includes(selectedPublisher.toLowerCase())
      );
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (game) =>
          game.title.toLowerCase().includes(q) ||
          game.provider.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortOption) {
      case "popular":
        list.sort((a, b) => b.playersCount - a.playersCount);
        break;
      case "az":
        list.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "za":
        list.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "featured":
      default:
        break;
    }

    return list;
  }, [groupMeta.initialGames, selectedPublisher, searchQuery, sortOption]);

  const displayedGames = filteredGames.slice(0, visibleCount);

  return (
    <div className="min-h-screen px-3 sm:px-6 py-4 max-w-7xl mx-auto space-y-6">
      {/* Category Header Banner matching Stake */}
      <div
        className={`relative rounded-2xl overflow-hidden border border-[#213743] bg-gradient-to-r ${groupMeta.bannerBg} p-5 sm:p-7 shadow-xl`}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-[#213743] border border-[#2f4553]">
                {groupMeta.icon}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {groupMeta.title}
              </h1>
              <span className="rounded-md bg-[#00e701]/15 text-[#00e701] border border-[#00e701]/30 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                {groupMeta.badge}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#b1bad3] max-w-2xl leading-relaxed">
              {groupMeta.description}
            </p>

            {/* Stats Strip */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] sm:text-xs text-[#b1bad3] font-medium">
              <span className="flex items-center gap-1.5 text-white font-semibold">
                <span className="text-[#00e701] animate-pulse">🟢</span>
                {groupMeta.playersCount} Playing
              </span>
              <span className="text-[#2f4553]">•</span>
              <span>{groupMeta.stats}</span>
            </div>
          </div>

          {/* Follow Button */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                isFollowing
                  ? "bg-[#e9113c]/20 text-[#e9113c] border-[#e9113c]/40 hover:bg-[#e9113c]/30"
                  : "bg-[#213743] hover:bg-[#2a4555] text-white border-[#2f4553]"
              }`}
            >
              <Heart
                className={`w-4 h-4 ${
                  isFollowing ? "fill-[#e9113c] text-[#e9113c]" : "text-[#b1bad3]"
                }`}
              />
              <span>{isFollowing ? "Following" : "Follow"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dual Filter & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#1a2c38] p-3 rounded-xl border border-[#213743]">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a889b]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${groupMeta.title}...`}
            className="w-full bg-[#0f212e] border border-[#213743] hover:border-[#2f4553] focus:border-[#1475e1] text-white text-xs rounded-lg pl-9.5 pr-14 py-2.5 outline-none transition-colors placeholder-[#7a889b]"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <kbd className="hidden sm:inline-block bg-[#1a2c38] text-[#7a889b] border border-[#213743] text-[9px] px-1.5 py-0.5 rounded font-mono">
              Ctrl+K
            </kbd>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2.5">
          {/* Publishers Filter */}
          <div className="relative flex-1 md:flex-initial">
            <div className="flex items-center gap-1.5 bg-[#0f212e] border border-[#213743] rounded-lg px-3 py-2 text-xs font-semibold text-white">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#7a889b]" />
              <select
                value={selectedPublisher}
                onChange={(e) => setSelectedPublisher(e.target.value)}
                className="bg-transparent text-xs text-white outline-none cursor-pointer pr-4 appearance-none"
              >
                <option value="all" className="bg-[#1a2c38]">All Publishers</option>
                <option value="stake originals" className="bg-[#1a2c38]">Stake Originals</option>
                <option value="pragmatic" className="bg-[#1a2c38]">Pragmatic Play</option>
                <option value="hacksaw" className="bg-[#1a2c38]">Hacksaw Gaming</option>
                <option value="evolution" className="bg-[#1a2c38]">Evolution Live</option>
                <option value="nolimit" className="bg-[#1a2c38]">Nolimit City</option>
              </select>
              <ChevronDown className="w-3 h-3 text-[#7a889b] pointer-events-none -ml-3" />
            </div>
          </div>

          {/* Sort Filter */}
          <div className="relative flex-1 md:flex-initial">
            <div className="flex items-center gap-1.5 bg-[#0f212e] border border-[#213743] rounded-lg px-3 py-2 text-xs font-semibold text-white">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#7a889b]" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                className="bg-transparent text-xs text-white outline-none cursor-pointer pr-4 appearance-none"
              >
                <option value="popular" className="bg-[#1a2c38]">Popular</option>
                <option value="featured" className="bg-[#1a2c38]">Featured</option>
                <option value="az" className="bg-[#1a2c38]">A - Z</option>
                <option value="za" className="bg-[#1a2c38]">Z - A</option>
              </select>
              <ChevronDown className="w-3 h-3 text-[#7a889b] pointer-events-none -ml-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Persistent Stake Warning Lock Sheet if Live Casino and unverified/zero balance */}
      {isLiveRestricted && (
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

      {/* Grid: Mobile 3-Col, Desktop 6-Col */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-[#b1bad3]">
          <span>
            Showing <strong className="text-white">{displayedGames.length}</strong> of{" "}
            <strong className="text-white">{filteredGames.length}</strong> games
          </span>
          <Link
            href="/casino/collection/providers"
            className="text-[#00e701] hover:underline flex items-center gap-1 font-semibold"
          >
            Browse All Providers &gt;
          </Link>
        </div>

        {displayedGames.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#1a2c38] border border-[#213743] space-y-3">
            <p className="text-base text-white font-bold">No games found</p>
            <p className="text-xs text-[#b1bad3]">
              Try adjusting your search query or provider filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedPublisher("all");
              }}
              className="mt-2 px-4 py-2 rounded-lg bg-[#213743] hover:bg-[#2a4555] text-white text-xs font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-3.5">
            {displayedGames.map((game) => (
              <StakeGameCard
                key={game.id}
                game={game}
                onClick={
                  isLiveRestricted
                    ? (g) => {
                        setGateTableName(g.title);
                        setGateModalOpen(true);
                      }
                    : undefined
                }
              />
            ))}
          </div>
        )}

        {/* Center-Aligned "Load More" Pagination Trigger */}
        {visibleCount < filteredGames.length && (
          <div className="flex justify-center pt-6">
            <button
              onClick={() => setVisibleCount((prev) => prev + 12)}
              className="bg-[#213743] hover:bg-[#2a4555] text-white font-bold text-xs sm:text-sm px-8 py-3 rounded-xl border border-[#2f4553] transition-all cursor-pointer active:scale-95 shadow-lg shadow-black/30 hover:border-[#3d5565]"
            >
              Load More Games ({filteredGames.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </div>

      {/* Embedded Bottom Contextual Live Bets */}
      <div className="pt-6">
        <CasinoLiveBets />
      </div>

      {/* Live Casino Gate Modal */}
      <LiveCasinoGateModal
        isOpen={gateModalOpen}
        onClose={() => setGateModalOpen(false)}
        tableName={gateTableName}
      />
    </div>
  );
}
