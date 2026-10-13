"use client";
import React, { useState, useMemo, useEffect } from "react";
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
  EZUGI_GAMES,
  MAC88_GAMES,
  SPRIBE_GAMES,
  SMARTSOFT_GAMES,
  HP100_GAMES,
  JILI_GAMES,
  EVOPLAY_GAMES,
  TURBOGAMES_GAMES,
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

  // Restore visibleCount and scroll position from sessionStorage on mount (back navigation)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const savedCount = sessionStorage.getItem(`provider_games_limit_${slug}`);
      if (savedCount) {
        const parsed = parseInt(savedCount, 10);
        if (!isNaN(parsed) && parsed > 18) {
          setVisibleCount(parsed);
        }
      }
      const savedScroll = sessionStorage.getItem(`provider_scroll_${slug}`);
      if (savedScroll) {
        const targetY = parseInt(savedScroll, 10);
        if (!isNaN(targetY) && targetY > 0) {
          const timer = setTimeout(() => {
            window.scrollTo({ top: targetY, behavior: "instant" });
          }, 80);
          return () => clearTimeout(timer);
        }
      }
    } catch {
      // Ignore sessionStorage errors
    }
  }, [slug]);

  // Track window scroll position for back navigation restoration
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleScroll = () => {
      try {
        sessionStorage.setItem(`provider_scroll_${slug}`, String(window.scrollY));
      } catch {}
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [slug]);

  // Handle explicit Show Less action
  const handleShowLess = () => {
    setVisibleCount(18);
    try {
      sessionStorage.removeItem(`provider_games_limit_${slug}`);
      sessionStorage.removeItem(`provider_scroll_${slug}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {}
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => {
      const next = prev + 12;
      try {
        sessionStorage.setItem(`provider_games_limit_${slug}`, String(next));
      } catch {}
      return next;
    });
  };

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
      case "ezugi":
      case "ezugi-games":
        return {
          title: "Ezugi Live Casino",
          badge: "35 LIVE TABLES",
          playersCount: "34,500",
          stats: "35 Live Tables • Ezugi Gaming • Authentic Indian & International Live Studios",
          description:
            "Play authentic live dealer tables from Ezugi, featuring flagship Indian classics like Andar Bahar and Teen Patti alongside high-definition Roulette, Blackjack, and Baccarat suites.",
          initialGames: EZUGI_GAMES,
          bannerBg: "from-blue-950/70 via-[#1a2c38] to-[#0f212e]",
          icon: <Activity className="w-6 h-6 text-blue-400" />,
        };
      case "mac88":
      case "mac88-games":
        return {
          title: "Mac88 Indian Card Suite",
          badge: "15 LIVE TABLES",
          playersCount: "45,200",
          stats: "15 Live Tables • Mac88 • Authentic Indian Card Games & Asian Tables",
          description:
            "Immerse yourself in authentic Indian live card gaming with Mac88, featuring 3 Cards Judgement, Muflis Teen Patti, Amar Akbar Anthony, Worli Matka, Andar Bahar, and Casino War.",
          initialGames: MAC88_GAMES,
          bannerBg: "from-emerald-950/70 via-[#1a2c38] to-[#0f212e]",
          icon: <Activity className="w-6 h-6 text-emerald-400" />,
        };
      case "spribe":
        return {
          title: "Spribe",
          badge: "18 TURBO GAMES",
          playersCount: "38,400",
          stats: "18 Games • Spribe Studio • Home of Aviator, Plinko & Table Classics",
          description:
            "Fast-paced provably fair turbo titles from Spribe, led by the flagship global crash sensation Aviator alongside Mines, Dice, Goal, and Blackjack.",
          initialGames: SPRIBE_GAMES,
          bannerBg: "from-red-950/70 via-[#1a2c38] to-[#0f212e]",
          icon: <Activity className="w-6 h-6 text-red-400" />,
        };
      case "smartsoft":
      case "smartsoft-gaming":
        return {
          title: "SmartSoft Gaming",
          badge: "19 X-SERIES GAMES",
          playersCount: "29,800",
          stats: "19 Games • SmartSoft • JetX, Balloon & Table Sensations",
          description:
            "Pioneering next-generation crash sensations and interactive arcade games, starring JetX, Balloon, CricketX, and SmartSoft Table Games.",
          initialGames: SMARTSOFT_GAMES,
          bannerBg: "from-amber-950/70 via-[#1a2c38] to-[#0f212e]",
          icon: <Flame className="w-6 h-6 text-amber-500" />,
        };
      case "100hp":
      case "hp100":
        return {
          title: "100 HP Gaming",
          badge: "13 ARCADE TITLES",
          playersCount: "18,900",
          stats: "13 Games • 100 HP Gaming • Astronaut, Airjet & Turbo Table Series",
          description:
            "High-octane arcade excitement and retro racing slot machines engineered for instant high-speed thrills and exponential multipliers.",
          initialGames: HP100_GAMES,
          bannerBg: "from-orange-950/70 via-[#1a2c38] to-[#0f212e]",
          icon: <Flame className="w-6 h-6 text-orange-500" />,
        };
      case "evoplay":
      case "evoplay-games":
        return {
          title: "Evoplay",
          badge: "17 3D ACTION TITLES",
          playersCount: "38,900",
          stats: "17 Games • Evoplay Studio • Penalty Shootout, Table & 3D Action",
          description:
            "High-energy interactive 3D gameplay, world-famous penalty shootout titles, and European table classics engineered by Evoplay.",
          initialGames: EVOPLAY_GAMES,
          bannerBg: "from-emerald-950/70 via-[#1a2c38] to-[#0f212e]",
          icon: <Activity className="w-6 h-6 text-emerald-400" />,
        };
      case "turbogames":
      case "turbo-games":
        return {
          title: "Turbo Games",
          badge: "20 INSTANT CRASH TITLES",
          playersCount: "42,100",
          stats: "20 Games • Turbo Games • Fast Plinko, Towers & Crash Mechanics",
          description:
            "Instant crash, multiplier ladder, and provably fair fast action games with ultra-rapid round resolutions and low house edge by Turbo Games.",
          initialGames: TURBOGAMES_GAMES,
          bannerBg: "from-orange-950/70 via-[#1a2c38] to-[#0f212e]",
          icon: <Flame className="w-6 h-6 text-orange-400" />,
        };
      case "jili":
      case "jili-games":
        return {
          title: "Jili Games",
          badge: "20 TOP HIT GAMES",
          playersCount: "42,100",
          stats: "20 Games • Jili Games • Super Ace, Mines & Asian Table Hits",
          description:
            "Asia's hottest arcade and card slot phenomenon, starring Super Ace, Mines, GoRush, and Asian table classics with massive payout chains.",
          initialGames: JILI_GAMES,
          bannerBg: "from-yellow-950/70 via-[#1a2c38] to-[#0f212e]",
          icon: <Sparkles className="w-6 h-6 text-yellow-400" />,
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
      case "chicken-games":
      case "only-on-stake":
        return {
          title: "Chicken Games",
          badge: "CHICKEN & CROSSING",
          playersCount: "52,400",
          stats: "Chicken Crossing • Multiplier Hops • Safe Cloche Uncover",
          description:
            "Popular chicken, froggy, and road-crossing games. Hop across roads and dodge bones to multiply your cashout!",
          initialGames: [
            ...INOUT_GAMES.filter((g) => g.title?.toLowerCase().includes("chicken") || g.slug?.includes("chicken")),
            ...HP100_GAMES.filter((g) => g.title?.toLowerCase().includes("chicken")),
            ...EVOPLAY_GAMES.filter((g) => g.title?.toLowerCase().includes("uncrossable")),
            ...TURBOGAMES_GAMES.filter((g) => g.title?.toLowerCase().includes("chicken")),
            ...STAKE_ORIGINALS.filter((g) => g.slug === "chicken"),
          ],
          bannerBg: "from-amber-950/70 via-[#1a2c38] to-[#0f212e]",
          icon: <Flame className="w-6 h-6 text-amber-400" />,
        };
      case "burst-games":
        return {
          title: "Burst Games",
          badge: "CURVE MULTIPLIER CRASH",
          playersCount: "48,150",
          stats: "Aviator & JetX • Curve Multipliers up to 10,000x • Instant Cashouts",
          description:
            "Adrenaline-pumping crash and burst games where the multiplier climbs exponentially into the sky. Cash out before it flies away!",
          initialGames: [
            ...SPRIBE_GAMES.filter((g) => g.slug === "spribe-aviator"),
            ...SMARTSOFT_GAMES.filter((g) => g.slug === "jetx" || g.slug === "smartsoft-balloon" || g.slug === "smartsoft-propel-x" || g.slug === "helicopter-x"),
            ...INOUT_GAMES.filter((g) => g.slug?.includes("aviafly")),
            ...TURBOGAMES_GAMES.filter((g) => g.slug?.includes("vortex") || g.slug?.includes("crash")),
            ...STAKE_ORIGINALS.filter((g) => g.slug === "crash"),
            ...PRAGMATIC_GAMES.filter((g) => g.slug === "spaceman"),
          ],
          bannerBg: "from-orange-950/70 via-[#1a2c38] to-[#0f212e]",
          icon: <Activity className="w-6 h-6 text-orange-400" />,
        };
      case "new-releases":
        return {
          title: "New Releases",
          badge: "FRESH DROPS",
          playersCount: "42,200",
          stats: "Fresh Additions • High Production Visuals • Curated Premieres",
          description:
            "Fresh releases with guaranteed verified artwork, featuring top hits from Evolution, Pragmatic Play, and Hacksaw Gaming.",
          initialGames: [
            ...EVOLUTION_GAMES.filter((g) => g.slug === "stock-market" || g.slug === "bac-bo" || g.slug === "super-sic-bo"),
            ...PRAGMATIC_GAMES.slice(0, 15),
            ...HACKSAW_GAMES.slice(0, 15),
          ],
          bannerBg: "from-purple-950/70 via-[#1a2c38] to-[#0f212e]",
          icon: <Sparkles className="w-6 h-6 text-purple-400" />,
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
      {/* TASK 1: 1:1 Publisher / Provider Top Banner Card */}
      <div className="bg-[#1a2c38] rounded-xl p-4 border border-[#213743]">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Dark rounded square container with provider logo */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl bg-[#0f212e] border border-[#213743] flex items-center justify-center shrink-0 shadow-inner p-2.5">
              {slug === "stake-originals" ? (
                <span className="text-[#1475e1] font-black text-xl italic tracking-tighter select-none">
                  Stake
                </span>
              ) : (
                groupMeta.icon
              )}
            </div>
            {/* Right details */}
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight truncate">
                {groupMeta.title}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1.5 text-xs text-[#00e701] font-semibold">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e701] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00e701]"></span>
                  </span>
                  {groupMeta.playersCount || "9.15K"} Playing
                </span>
              </div>
            </div>
          </div>

          {/* Follow Button */}
          <button
            onClick={() => setIsFollowing(!isFollowing)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer shrink-0 ${
              isFollowing
                ? "bg-[#e9113c]/20 text-[#e9113c] border border-[#e9113c]/40"
                : "bg-[#2f4553]/70 hover:bg-[#2f4553] text-[#b1bad3] border border-transparent"
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                isFollowing ? "fill-[#e9113c] text-[#e9113c]" : "text-[#b1bad3]"
              }`}
            />
            <span>{isFollowing ? "Following" : "Follow"}</span>
          </button>
        </div>
      </div>

      {/* TASK 1: 4-Column Metrics Bar (Dedicated separate card directly beneath the banner) */}
      <div className="bg-[#1a2c38] rounded-xl p-3 border border-[#213743]">
        <div className="grid grid-cols-4 gap-2 text-center divide-x divide-[#213743]">
          {/* Item 1: Games */}
          <div className="flex flex-col items-center justify-center px-1">
            <span className="text-xs sm:text-sm font-bold text-white">
              {groupMeta.initialGames?.length || 31}
            </span>
            <span className="text-[#b1bad3] text-xs">Games</span>
          </div>

          {/* Item 2: Followers */}
          <div className="flex flex-col items-center justify-center px-1">
            <span className="text-xs sm:text-sm font-bold text-white">
              {slug === "stake-originals" ? "194.66K" : "42.1K"}
            </span>
            <span className="text-[#b1bad3] text-xs">Followers</span>
          </div>

          {/* Item 3: Wagered */}
          <div className="flex flex-col items-center justify-center px-1">
            <span className="text-xs sm:text-sm font-bold text-white">
              {slug === "stake-originals" ? "$375.5B" : "$48.2B"}
            </span>
            <span className="text-[#b1bad3] text-xs">Wagered</span>
          </div>

          {/* Item 4: Bets */}
          <div className="flex flex-col items-center justify-center px-1">
            <span className="text-xs sm:text-sm font-bold text-white">
              {slug === "stake-originals" ? "378.23B" : "52.8B"}
            </span>
            <span className="text-[#b1bad3] text-xs">Bets</span>
          </div>
        </div>
      </div>

      {/* TASK 1: Search & Filters Row */}
      <div className="space-y-2.5">
        {/* Full-width Search Bar */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b1bad3]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Stake.com"
            className="w-full bg-[#0f212e] border border-[#213743] hover:border-[#2f4553] focus:border-[#2f4553] text-white text-sm font-semibold rounded-lg pl-9.5 pr-4 py-2.5 outline-none transition-colors placeholder:text-[#b1bad3]"
          />
        </div>

        {/* Filters Row below: "All Publishers" pill button on left, "Popular ⌵" dropdown on right */}
        <div className="flex items-center justify-between gap-2">
          {/* Left: All Publishers selector */}
          <div className="relative">
            <div className="flex items-center gap-1.5 bg-[#2f4553]/70 hover:bg-[#2f4553] text-[#b1bad3] hover:text-white rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer border border-[#213743]">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#7a889b]" />
              <select
                value={selectedPublisher}
                onChange={(e) => setSelectedPublisher(e.target.value)}
                className="bg-transparent text-xs text-white outline-none cursor-pointer pr-4 appearance-none font-semibold"
              >
                <option value="all" className="bg-[#1a2c38]">All Publishers</option>
                <option value="mac88" className="bg-[#1a2c38]">Mac88</option>
                <option value="evolution" className="bg-[#1a2c38]">Evolution</option>
                <option value="ezugi" className="bg-[#1a2c38]">Ezugi</option>
                <option value="stake originals" className="bg-[#1a2c38]">Stake Originals</option>
                <option value="pragmatic" className="bg-[#1a2c38]">Pragmatic Play</option>
                <option value="hacksaw" className="bg-[#1a2c38]">Hacksaw Gaming</option>
                <option value="spribe" className="bg-[#1a2c38]">Spribe</option>
                <option value="smartsoft" className="bg-[#1a2c38]">SmartSoft</option>
                <option value="jili" className="bg-[#1a2c38]">Jili Games</option>
                <option value="evoplay" className="bg-[#1a2c38]">Evoplay</option>
                <option value="turbogames" className="bg-[#1a2c38]">Turbo Games</option>
                <option value="nolimit" className="bg-[#1a2c38]">Nolimit City</option>
              </select>
              <ChevronDown className="w-3 h-3 text-[#7a889b] pointer-events-none -ml-3" />
            </div>
          </div>

          {/* Right: Sort Dropdown */}
          <div className="relative">
            <div className="flex items-center gap-1.5 bg-[#2f4553]/70 hover:bg-[#2f4553] text-[#b1bad3] hover:text-white rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer border border-[#213743]">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#7a889b]" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                className="bg-transparent text-xs text-white outline-none cursor-pointer pr-4 appearance-none font-semibold"
              >
                <option value="popular" className="bg-[#1a2c38]">Popular ⌵</option>
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

        {/* Center-Aligned "Load More" & "Show Less" Pagination Triggers */}
        {(visibleCount < filteredGames.length || visibleCount > 18) && (
          <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
            {visibleCount < filteredGames.length && (
              <button
                onClick={handleLoadMore}
                className="bg-[#213743] hover:bg-[#2a4555] text-white font-bold text-xs sm:text-sm px-8 py-3 rounded-xl border border-[#2f4553] transition-all cursor-pointer active:scale-95 shadow-lg shadow-black/30 hover:border-[#3d5565]"
              >
                Load More Games ({filteredGames.length - visibleCount} remaining)
              </button>
            )}
            {visibleCount > 18 && (
              <button
                onClick={handleShowLess}
                className="bg-[#1a2c38] hover:bg-[#213743] text-[#b1bad3] hover:text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl border border-[#2f4553] transition-all cursor-pointer active:scale-95 shadow-md hover:border-[#3d5565]"
              >
                Show Less
              </button>
            )}
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
