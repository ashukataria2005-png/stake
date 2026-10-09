"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bookmark,
  Heart,
  PlaySquare,
  Gamepad2,
  FileText,
  Zap,
  Sparkles,
  Trophy,
  Flame,
  Users,
  Gift,
  TrendingUp,
  ArrowUpRight,
  ShoppingBag,
  Layers,
  CircleDot,
  Palette,
  ChevronDown,
  ChevronRight,
  Search,
  X,
  ShieldCheck,
  Headphones,
  Globe,
  MessageSquare,
  Newspaper,
  Award,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { StakeLogo } from "@/components/common/StakeLogo";
import { ALL_GAMES, GameItem } from "@/data/stakeGames";
import { getGameThumbnail } from "@/data/gameThumbnails";
import StakeGameArtwork from "@/components/casino/StakeGameArtwork";

interface NavEntry {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  emoji?: string;
  badge?: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, setSidebarOpen, toggleChat } = useGame();
  const [activeDrawerTab, setActiveDrawerTab] = useState<"casino" | "sports">("casino");
  const [searchQuery, setSearchQuery] = useState("");

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

  // Collapsible sections
  const [isPromosOpen, setIsPromosOpen] = useState(false);
  const [isSponsorshipsOpen, setIsSponsorshipsOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  // Lock background scrolling when mobile drawer is open
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      if (window.innerWidth < 1024 && isSidebarOpen) {
        document.body.classList.add("overflow-hidden");
        document.documentElement.classList.add("overflow-hidden");
      } else {
        document.body.classList.remove("overflow-hidden");
        document.documentElement.classList.remove("overflow-hidden");
      }
    };

    if (isSidebarOpen && window.innerWidth < 1024) {
      document.body.classList.add("overflow-hidden");
      document.documentElement.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
      document.documentElement.classList.remove("overflow-hidden");
    }

    window.addEventListener("resize", handleResize);
    return () => {
      document.body.classList.remove("overflow-hidden");
      document.documentElement.classList.remove("overflow-hidden");
      window.removeEventListener("resize", handleResize);
    };
  }, [isSidebarOpen]);

  // Group 1: Personal (Top Section)
  const personalLinks: NavEntry[] = [
    { name: "Saved Games", href: "/casino/home", icon: Bookmark, emoji: "🔖" },
    { name: "Following", href: "/casino/home", icon: Heart, emoji: "💙" },
    { name: "Continue Playing", href: "/casino/home", icon: PlaySquare, emoji: "▶️" },
    { name: "Games For You", href: "/casino/home", icon: Gamepad2, emoji: "🎮" },
    { name: "My Bets", href: "/casino/home", icon: FileText, emoji: "🧾" },
  ];

  // Group 2: Core Games Directory (Casino)
  const coreGamesLinks: NavEntry[] = [
    { name: "Only on Stake", href: "/casino/group/stake-originals", icon: Zap, emoji: "⚡", badge: "2x VIP" },
    { name: "New Releases", href: "/casino/group/slots", icon: Sparkles, emoji: "✨", badge: "New" },
    { name: "Slots", href: "/casino/group/slots", icon: Trophy, emoji: "🎰" },
    { name: "Stake Originals", href: "/casino/group/stake-originals", icon: Flame, emoji: "🔥", badge: "31" },
    { name: "Live Casino", href: "/casino/group/live-casino", icon: Users, emoji: "🤵", badge: "Live" },
    { name: "Game Shows", href: "/casino/group/game-shows", icon: Gift, emoji: "🎁" },
    { name: "Burst Games", href: "/casino/home", icon: TrendingUp, emoji: "💥" },
    { name: "Enhanced RTP", href: "/casino/group/slots", icon: ArrowUpRight, emoji: "⬆️" },
    { name: "Stake Poker", href: "/games/blackjack", icon: Layers, emoji: "♠️", badge: "Club" },
    { name: "Bonus Buy", href: "/casino/group/slots", icon: ShoppingBag, emoji: "🎁" },
    { name: "Blackjack", href: "/games/blackjack", icon: Layers, emoji: "🃏", badge: "21" },
    { name: "Baccarat", href: "/games/blackjack", icon: Layers, emoji: "🎴" },
    { name: "Roulette", href: "/games/roulette", icon: CircleDot, emoji: "🎡" },
    { name: "Publishers", href: "/casino/collection/providers", icon: Palette, emoji: "🎨", badge: "19" },
  ];

  // Sports Core Directory
  const sportsLinks: NavEntry[] = [
    { name: "Sportsbook Home", href: "/sports", icon: Trophy, emoji: "🏆" },
    { name: "Live Events", href: "/sports/live", icon: Zap, emoji: "🟢", badge: "Live" },
    { name: "Soccer", href: "/sports/soccer", icon: Trophy, emoji: "⚽" },
    { name: "Basketball", href: "/sports/basketball", icon: Trophy, emoji: "🏀" },
    { name: "Tennis", href: "/sports/tennis", icon: Trophy, emoji: "🎾" },
    { name: "Cricket", href: "/sports/cricket", icon: Trophy, emoji: "🏏" },
    { name: "American Football", href: "/sports/american-football", icon: Trophy, emoji: "🏈" },
    { name: "Baseball", href: "/sports/baseball", icon: Trophy, emoji: "⚾" },
    { name: "MMA / UFC", href: "/sports/mma", icon: Trophy, emoji: "🥊" },
    { name: "Esports", href: "/sports/esports", icon: Gamepad2, emoji: "🎮", badge: "Hot" },
  ];

  // Group 3: Community & Promos
  const communityLinks: NavEntry[] = [
    { name: "Challenges", href: "#challenges", icon: Trophy, emoji: "🏔️" },
    { name: "Affiliate", href: "#affiliate", icon: Users, emoji: "👥" },
    { name: "VIP Club", href: "#vip", icon: Award, emoji: "🏆" },
    { name: "Blog", href: "#blog", icon: Newspaper, emoji: "📰" },
    { name: "Forum", href: "#forum", icon: MessageSquare, emoji: "💬" },
  ];

  const handleMobileNavClick = () => {
    setSidebarOpen(false);
  };

  return (
    <>
      {/* ============================================================ */}
      {/* MOBILE HAMBURGER DRAWER (Task 21: Full Browse Drawer Parity) */}
      {/* ============================================================ */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-40"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Sheet Container */}
          <div className="relative z-50 w-[82vw] sm:w-[320px] max-w-[340px] max-h-[100dvh] h-full overflow-y-auto overscroll-contain pb-24 bg-[#0f212e] border-r border-[#213743] shadow-2xl flex flex-col [-webkit-overflow-scrolling:touch]">
            {/* Drawer Header */}
            <div className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-[#213743] bg-[#0f212e]/95 backdrop-blur px-4">
              <Link
                href="/"
                onClick={handleMobileNavClick}
                className="flex items-center gap-2 focus:outline-none"
              >
                <StakeLogo className="h-7 w-auto text-white" collapsed={false} />
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors cursor-pointer text-sm font-semibold"
                aria-label="Close Navigation Drawer"
              >
                ✕
              </button>
            </div>

            {/* Top Controls: Search games, providers... input with clean ✕ button */}
            <div className="p-3 border-b border-[#213743]">
              <div className="relative flex items-center">
                <Search className="absolute left-3 w-4 h-4 text-[#b1bad3]" />
                <input
                  type="text"
                  placeholder="Search games, providers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1a2c38] border border-[#213743] focus:border-[#2f4553] text-sm font-bold text-white placeholder:font-semibold placeholder-[#b1bad3] pl-9 pr-8 py-2 rounded-xl outline-none"
                />
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 text-[#b1bad3] hover:text-white p-1 text-xs cursor-pointer"
                    aria-label="Clear Search"
                  >
                    ✕
                  </button>
                ) : (
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="absolute right-2.5 text-[#b1bad3] hover:text-white p-1 text-xs cursor-pointer"
                    aria-label="Close Drawer"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {isSearching ? (
              /* Dynamic Search Results View */
              <div className="flex-1 px-3 py-3 overflow-y-auto space-y-2">
                <div className="flex items-center justify-between px-1 pb-2 border-b border-[#213743]">
                  <span className="text-xs font-black uppercase tracking-wider text-[#b1bad3]">
                    Search Results ({searchResults.length})
                  </span>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-xs font-bold text-[#00e701] hover:underline cursor-pointer"
                  >
                    Clear Search
                  </button>
                </div>

                {searchResults.length === 0 ? (
                  <div className="py-12 px-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#1a2c38] flex items-center justify-center text-xl">
                      🔍
                    </div>
                    <p className="text-white font-bold text-sm">No games found</p>
                    <p className="text-xs text-[#b1bad3] mt-1">
                      No results for &ldquo;{searchQuery}&rdquo;
                    </p>
                    <button
                      onClick={() => setSearchQuery("")}
                      className="mt-4 px-4 py-1.5 rounded-lg bg-[#213743] hover:bg-[#2f4553] text-xs font-bold text-white transition-colors cursor-pointer"
                    >
                      Clear Search
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {searchResults.map((game) => {
                      const thumb = getGameThumbnail(game.slug || game.id) || game.image;
                      const gameHref =
                        game.href ||
                        (game.category === "originals"
                          ? `/games/${game.slug || game.id}`
                          : `/casino/home`);
                      return (
                        <Link
                          key={game.id}
                          href={gameHref}
                          onClick={handleMobileNavClick}
                          className="flex items-center gap-3 p-2 rounded-xl bg-[#1a2c38]/70 hover:bg-[#213743] border border-[#213743]/60 hover:border-[#2f4553] transition-all cursor-pointer group"
                        >
                          <div className="relative w-11 h-11 shrink-0 rounded-lg overflow-hidden bg-[#0f212e] border border-[#213743]">
                            {thumb ? (
                              <img
                                src={thumb}
                                alt={game.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                                onError={(e) => {
                                  (e.currentTarget as HTMLElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full p-1 flex items-center justify-center">
                                <StakeGameArtwork gameId={game.slug || game.id} />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-white truncate group-hover:text-[#00e701] transition-colors">
                              {game.title}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-bold text-[#b1bad3] uppercase truncate bg-[#213743] px-1.5 py-0.5 rounded border border-[#2f4553]/50">
                                {game.provider}
                              </span>
                              <span className="flex items-center gap-1 text-[11px] font-semibold text-[#b1bad3]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#00e701] shrink-0" />
                                {(game.playersCount || 1200).toLocaleString("en-US")}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#b1bad3] group-hover:text-white shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Segmented Toggle: [ 🎰 Casino | ⚽ Sports ] (blue gradient capsule active state) */}
                <div className="px-3 pt-2.5 pb-2 border-b border-[#213743]">
              <div className="grid grid-cols-2 bg-[#1a2c38] p-1 rounded-xl border border-[#213743]">
                <button
                  onClick={() => setActiveDrawerTab("casino")}
                  className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeDrawerTab === "casino"
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md"
                      : "text-[#b1bad3] hover:text-white"
                  }`}
                >
                  <span className="text-sm">🎰</span>
                  <span>Casino</span>
                </button>
                <button
                  onClick={() => setActiveDrawerTab("sports")}
                  className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeDrawerTab === "sports"
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md"
                      : "text-[#b1bad3] hover:text-white"
                  }`}
                >
                  <span className="text-sm">⚽</span>
                  <span>Sports</span>
                </button>
              </div>
            </div>

            {/* Scrollable Navigation Area (Snug fit, no wide dead space) */}
            <div className="flex-1 px-3 py-2 space-y-3">
              {/* Group 1: Personal (Top Section) */}
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-[#b1bad3] px-3 pt-3 pb-1">
                  PERSONAL
                </div>
                <div className="space-y-0.5">
                  {personalLinks.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={handleMobileNavClick}
                      className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#213743]/70 hover:text-white transition-colors cursor-pointer text-sm sm:text-base font-bold text-white tracking-wide"
                    >
                      <span className="text-base sm:text-lg shrink-0">{item.emoji}</span>
                      <span className="truncate">{item.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Group 2: Core Games Directory (Casino or Sports) */}
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-[#b1bad3] px-3 pt-3 pb-1">
                  {activeDrawerTab === "casino" ? "GAMES" : "SPORTSBOOK"}
                </div>
                <div className="space-y-0.5">
                  {(activeDrawerTab === "casino" ? coreGamesLinks : sportsLinks).map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={handleMobileNavClick}
                        className={`group flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors cursor-pointer text-sm sm:text-base font-bold tracking-wide ${
                          isActive
                            ? "bg-[#213743] text-white shadow-sm"
                            : "text-white hover:bg-[#213743]/70"
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <span className="text-base sm:text-lg shrink-0">{item.emoji}</span>
                          <span className="truncate">{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className="rounded-md bg-[#213743] px-2 py-0.5 text-[10px] font-black text-[#00e701] border border-[#2f4553] shrink-0">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Group 3: Community & Promos */}
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-[#b1bad3] px-3 pt-3 pb-1">
                  PROMOTIONS & COMMUNITY
                </div>
                <div className="space-y-0.5">
                  {/* Collapsible Promotions */}
                  <div>
                    <button
                      onClick={() => setIsPromosOpen(!isPromosOpen)}
                      className="w-full group flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#213743]/70 transition-colors cursor-pointer text-sm sm:text-base font-bold text-white tracking-wide"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base sm:text-lg shrink-0">🎁</span>
                        <span>Promotions</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform text-[#b1bad3] group-hover:text-white ${
                          isPromosOpen ? "rotate-180 text-white" : ""
                        }`}
                      />
                    </button>
                    {isPromosOpen && (
                      <div className="pl-9 pr-3 py-1 space-y-1 bg-[#1a2c38]/60 rounded-xl my-1">
                        <Link
                          href="/casino/home"
                          onClick={handleMobileNavClick}
                          className="block py-1.5 text-xs font-semibold text-[#b1bad3] hover:text-[#00e701]"
                        >
                          Casino Promotions
                        </Link>
                        <Link
                          href="/sports"
                          onClick={handleMobileNavClick}
                          className="block py-1.5 text-xs font-semibold text-[#b1bad3] hover:text-[#00e701]"
                        >
                          Sports Promotions
                        </Link>
                        <Link
                          href="#vip"
                          onClick={handleMobileNavClick}
                          className="block py-1.5 text-xs font-semibold text-[#b1bad3] hover:text-[#00e701]"
                        >
                          VIP Club Promotions
                        </Link>
                      </div>
                    )}
                  </div>

                  {communityLinks.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={handleMobileNavClick}
                      className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#213743]/70 hover:text-white transition-colors cursor-pointer text-sm sm:text-base font-bold text-white tracking-wide"
                    >
                      <span className="text-base sm:text-lg shrink-0">{item.emoji}</span>
                      <span>{item.name}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Group 4: Footer Support & Settings */}
              <div>
                <div className="text-xs font-black uppercase tracking-wider text-[#b1bad3] px-3 pt-3 pb-1">
                  SUPPORT & SETTINGS
                </div>
                <div className="space-y-0.5">
                  {/* Collapsible Sponsorships */}
                  <div>
                    <button
                      onClick={() => setIsSponsorshipsOpen(!isSponsorshipsOpen)}
                      className="w-full group flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#213743]/70 transition-colors cursor-pointer text-sm sm:text-base font-bold text-white tracking-wide"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base sm:text-lg shrink-0">🤝</span>
                        <span>Sponsorships</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform text-[#b1bad3] group-hover:text-white ${
                          isSponsorshipsOpen ? "rotate-180 text-white" : ""
                        }`}
                      />
                    </button>
                    {isSponsorshipsOpen && (
                      <div className="pl-9 pr-3 py-1 space-y-1 bg-[#1a2c38]/60 rounded-xl my-1">
                        <span className="block py-1 text-xs text-[#b1bad3]">
                          Alfa Romeo F1 Team
                        </span>
                        <span className="block py-1 text-xs text-[#b1bad3]">
                          Everton Football Club
                        </span>
                        <span className="block py-1 text-xs text-[#b1bad3]">
                          Official UFC Partner
                        </span>
                        <span className="block py-1 text-xs text-[#b1bad3]">
                          Drake Partnership
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Responsible Gambling */}
                  <a
                    href="#responsible"
                    onClick={handleMobileNavClick}
                    className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#213743]/70 hover:text-white transition-colors cursor-pointer text-sm sm:text-base font-bold text-white tracking-wide"
                  >
                    <ShieldCheck className="w-5 h-5 text-[#00e701] shrink-0" />
                    <span>Responsible Gambling</span>
                  </a>

                  {/* Live Support */}
                  <button
                    onClick={() => {
                      handleMobileNavClick();
                      toggleChat();
                    }}
                    className="w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#213743]/70 hover:text-white transition-colors cursor-pointer text-sm sm:text-base font-bold text-white tracking-wide"
                  >
                    <Headphones className="w-5 h-5 text-[#1475e1] shrink-0" />
                    <span>Live Support</span>
                  </button>

                  {/* Collapsible Language */}
                  <div>
                    <button
                      onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                      className="w-full group flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#213743]/70 transition-colors cursor-pointer text-sm sm:text-base font-bold text-white tracking-wide"
                    >
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-cyan-400 shrink-0" />
                        <span>Language: {selectedLanguage}</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform text-[#b1bad3] group-hover:text-white ${
                          isLanguageOpen ? "rotate-180 text-white" : ""
                        }`}
                      />
                    </button>
                    {isLanguageOpen && (
                      <div className="pl-9 pr-3 py-1 space-y-1 bg-[#1a2c38]/60 rounded-xl my-1">
                        {["English", "Español", "Português", "日本語", "हिन्दी"].map(
                          (lang) => (
                            <button
                              key={lang}
                              onClick={() => {
                                setSelectedLanguage(lang);
                                setIsLanguageOpen(false);
                              }}
                              className={`block w-full text-left py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                                selectedLanguage === lang
                                  ? "text-[#00e701] font-bold"
                                  : "text-[#b1bad3] hover:text-white"
                              }`}
                            >
                              {lang}
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* DESKTOP SIDEBAR (Collapsible w-64 / w-16, hidden lg:flex)     */}
      {/* ============================================================ */}
      <aside
        className={`hidden lg:flex fixed top-16 bottom-0 left-0 z-30 flex-col border-r border-[#213743] bg-[#1a2c38] transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "w-64" : "w-16"
        }`}
      >
        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-5">
          {/* Main Navigation */}
          <div>
            {isSidebarOpen && (
              <div className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-[#b1bad3]">
                Casino
              </div>
            )}
            <div className="space-y-0.5">
              {coreGamesLinks.slice(0, 6).map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    title={!isSidebarOpen ? item.name : undefined}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-[#213743] text-white shadow-sm"
                        : "text-[#b1bad3] hover:bg-[#213743]/70 hover:text-white"
                    } ${!isSidebarOpen ? "justify-center px-0" : ""}`}
                  >
                    <span className="text-sm shrink-0">{item.emoji}</span>
                    {isSidebarOpen && (
                      <div className="flex flex-1 items-center justify-between">
                        <span className="truncate">{item.name}</span>
                        {item.badge && (
                          <span className="rounded bg-[#213743] px-1.5 py-0.5 text-[9px] font-bold text-[#00e701] border border-[#2f4553]">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Stake Originals Section */}
          <div>
            {isSidebarOpen ? (
              <div className="flex items-center justify-between px-3 pb-1.5">
                <Link
                  href="/casino/group/stake-originals"
                  className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#b1bad3] hover:text-[#00e701] transition-colors"
                >
                  <Flame className="h-3.5 w-3.5 text-[#00e701]" />
                  <span>Stake Originals</span>
                </Link>
                <Link
                  href="/casino/group/stake-originals"
                  className="text-[10px] font-semibold text-[#00e701] hover:underline"
                >
                  31 &gt;
                </Link>
              </div>
            ) : (
              <div className="my-2 border-t border-[#213743]" />
            )}

            <div className="space-y-0.5">
              {[
                { name: "Dice", href: "/games/dice", emoji: "🎲" },
                { name: "Mines", href: "/games/mines", emoji: "💣" },
                { name: "Plinko", href: "/games/plinko", emoji: "🔴" },
                { name: "Crash", href: "/games/crash", emoji: "🚀" },
                { name: "Limbo", href: "/games/limbo", emoji: "⚡" },
              ].map((game) => {
                const isActive = pathname === game.href;
                return (
                  <Link
                    key={game.name}
                    href={game.href}
                    title={!isSidebarOpen ? game.name : undefined}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      isActive
                        ? "bg-[#213743] text-white font-semibold"
                        : "text-[#b1bad3] hover:bg-[#213743]/80 hover:text-white"
                    } ${!isSidebarOpen ? "justify-center px-0" : ""}`}
                  >
                    <span className="text-sm shrink-0">{game.emoji}</span>
                    {isSidebarOpen && (
                      <span className="font-semibold text-white tracking-wide truncate">
                        {game.name}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Support Links */}
          {isSidebarOpen && (
            <div className="pt-2 border-t border-[#213743] space-y-0.5">
              <button
                onClick={toggleChat}
                className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors cursor-pointer"
              >
                <Headphones className="w-4 h-4 text-[#1475e1]" />
                <span>Live Support</span>
              </button>
              <a
                href="#responsible"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-[#00e701]" />
                <span>Responsible Gambling</span>
              </a>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
