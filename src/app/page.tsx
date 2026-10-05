"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bomb,
  TrendingUp,
  CircleDot,
  Dice5,
  Gamepad2,
  Sparkles,
  Flame,
  Trophy,
  ChevronRight,
  Play,
  Search,
  SlidersHorizontal,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Activity,
  Circle,
  Timer,
  Award,
} from "lucide-react";
import { useGame } from "@/context/GameContext";

interface BetRecord {
  id: string;
  game: string;
  user: string;
  time: string;
  betAmount: number;
  multiplier: number;
  payout: number;
  isWin: boolean;
}

const initialBets: BetRecord[] = [
  {
    id: "bet-1",
    game: "Crash",
    user: "Hidden",
    time: "Just now",
    betAmount: 50.0,
    multiplier: 2.45,
    payout: 122.5,
    isWin: true,
  },
  {
    id: "bet-2",
    game: "Mines",
    user: "CryptoWhale",
    time: "2s ago",
    betAmount: 25.0,
    multiplier: 4.12,
    payout: 103.0,
    isWin: true,
  },
  {
    id: "bet-3",
    game: "Plinko",
    user: "LuckyStrike",
    time: "4s ago",
    betAmount: 10.0,
    multiplier: 0.2,
    payout: 2.0,
    isWin: false,
  },
  {
    id: "bet-4",
    game: "Dice",
    user: "AcesHigh",
    time: "6s ago",
    betAmount: 100.0,
    multiplier: 1.98,
    payout: 198.0,
    isWin: true,
  },
  {
    id: "bet-5",
    game: "Crash",
    user: "MoonShot",
    time: "9s ago",
    betAmount: 15.0,
    multiplier: 14.8,
    payout: 222.0,
    isWin: true,
  },
  {
    id: "bet-6",
    game: "Mines",
    user: "DiamondHands",
    time: "12s ago",
    betAmount: 75.0,
    multiplier: 0.0,
    payout: 0.0,
    isWin: false,
  },
  {
    id: "bet-7",
    game: "Plinko",
    user: "Satoshi_88",
    time: "15s ago",
    betAmount: 200.0,
    multiplier: 29.0,
    payout: 5800.0,
    isWin: true,
  },
];

export default function LobbyPage() {
  const { currency } = useGame();
  const [activeTab, setActiveTab] = useState<"casino" | "high" | "race">("casino");
  const [selectedCategory, setSelectedCategory] = useState("Originals");
  const [searchQuery, setSearchQuery] = useState("");
  const [bets, setBets] = useState<BetRecord[]>(initialBets);
  const [isLiveFeedPaused, setIsLiveFeedPaused] = useState(false);

  // Simulated live bet feed ticker
  useEffect(() => {
    if (isLiveFeedPaused) return;

    const games = ["Mines", "Crash", "Plinko", "Dice", "Limbo", "Roulette"];
    const users = [
      "Hidden",
      "Valkyrie",
      "ApexPredator",
      "CryptoKing",
      "Staker_X",
      "ShadowNinja",
      "Bullish99",
      "NeonRider",
      "GoldenAce",
      "WhaleRider",
    ];

    const interval = setInterval(() => {
      const randomGame = games[Math.floor(Math.random() * games.length)];
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const betAmt = parseFloat((Math.random() * 80 + 5).toFixed(2));
      const isWin = Math.random() > 0.45;
      const multiplier = isWin
        ? parseFloat((Math.random() * 5 + 1.1).toFixed(2))
        : 0;
      const payout = isWin ? parseFloat((betAmt * multiplier).toFixed(2)) : 0;

      const newBet: BetRecord = {
        id: `bet-${Date.now()}`,
        game: randomGame,
        user: randomUser,
        time: "Just now",
        betAmount: betAmt,
        multiplier,
        payout,
        isWin,
      };

      setBets((prev) => [newBet, ...prev.slice(0, 14)]);
    }, 2800);

    return () => clearInterval(interval);
  }, [isLiveFeedPaused]);

  // Stake Originals game list
  const stakeOriginals = [
    {
      id: "mines",
      title: "Mines",
      href: "/games/mines",
      badge: "POPULAR",
      badgeColor: "bg-[#00e701]/20 text-[#00e701] border-[#00e701]/30",
      rtp: "99.00% RTP",
      edge: "1.00% Edge",
      accent: "from-emerald-500/20 to-green-950/40",
      borderGlow: "group-hover:border-[#00e701]/50",
      icon: Bomb,
      desc: "Uncover gems, dodge hidden explosives",
      artSvg: (
        <div className="relative flex h-full w-full items-center justify-center">
          {/* Grid representation */}
          <div className="grid grid-cols-3 gap-2 opacity-80">
            <div className="h-7 w-7 rounded-lg bg-[#213743] flex items-center justify-center border border-[#2f4553] shadow-sm">
              <span className="h-3 w-3 rounded-full bg-[#00e701] animate-ping" />
            </div>
            <div className="h-7 w-7 rounded-lg bg-[#00e701] flex items-center justify-center shadow-lg shadow-[#00e701]/30">
              <span className="text-xs font-black text-[#0f212e]">💎</span>
            </div>
            <div className="h-7 w-7 rounded-lg bg-[#213743] flex items-center justify-center border border-[#2f4553]">
              <span className="h-2 w-2 rounded-full bg-slate-600" />
            </div>
            <div className="h-7 w-7 rounded-lg bg-[#213743] flex items-center justify-center border border-[#2f4553]">
              <span className="text-xs">💣</span>
            </div>
            <div className="h-7 w-7 rounded-lg bg-[#00e701] flex items-center justify-center shadow-lg shadow-[#00e701]/30">
              <span className="text-xs font-black text-[#0f212e]">💎</span>
            </div>
            <div className="h-7 w-7 rounded-lg bg-[#213743] flex items-center justify-center border border-[#2f4553]">
              <span className="h-2 w-2 rounded-full bg-slate-600" />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "crash",
      title: "Crash",
      href: "/games/crash",
      badge: "HOT",
      badgeColor: "bg-red-500/20 text-red-400 border-red-500/30",
      rtp: "99.00% RTP",
      edge: "1.00% Edge",
      accent: "from-amber-500/20 to-orange-950/40",
      borderGlow: "group-hover:border-amber-400/50",
      icon: TrendingUp,
      desc: "Cash out before the multiplier rocket crashes",
      artSvg: (
        <div className="relative flex h-full w-full flex-col items-center justify-center">
          <div className="text-3xl font-black italic tracking-tighter text-amber-400 font-mono drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]">
            24.85x
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-[#b1bad3]">
            <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
            <span>ROCKET SOARING</span>
          </div>
          {/* Exponential curve line */}
          <div className="absolute bottom-2 left-4 right-4 h-1 rounded-full bg-gradient-to-r from-transparent via-amber-500 to-[#00e701]" />
        </div>
      ),
    },
    {
      id: "plinko",
      title: "Plinko",
      href: "/games/plinko",
      badge: "ORIGINAL",
      badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      rtp: "99.00% RTP",
      edge: "1.00% Edge",
      accent: "from-blue-500/20 to-indigo-950/40",
      borderGlow: "group-hover:border-blue-400/50",
      icon: CircleDot,
      desc: "Drop the ball through pegs for up to 1000x",
      artSvg: (
        <div className="relative flex h-full w-full flex-col items-center justify-center">
          {/* Plinko Pyramid pins */}
          <div className="flex gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          </div>
          <div className="flex gap-3 mt-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#00e701] shadow-[0_0_6px_#00e701]" />
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          </div>
          <div className="flex gap-3 mt-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          </div>
          {/* Multiplier base blocks */}
          <div className="mt-3 flex gap-1 text-[9px] font-black">
            <span className="rounded bg-red-600/80 px-1 py-0.5 text-white">1000x</span>
            <span className="rounded bg-amber-500/80 px-1 py-0.5 text-black">9x</span>
            <span className="rounded bg-green-500/80 px-1 py-0.5 text-black">1.4x</span>
            <span className="rounded bg-amber-500/80 px-1 py-0.5 text-black">9x</span>
            <span className="rounded bg-red-600/80 px-1 py-0.5 text-white">1000x</span>
          </div>
        </div>
      ),
    },
    {
      id: "dice",
      title: "Dice",
      href: "/games/dice",
      badge: "CLASSIC",
      badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      rtp: "99.00% RTP",
      edge: "1.00% Edge",
      accent: "from-purple-500/20 to-fuchsia-950/40",
      borderGlow: "group-hover:border-purple-400/50",
      icon: Dice5,
      desc: "Roll over or under with custom win chances",
      artSvg: (
        <div className="relative flex h-full w-full flex-col items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#2f4553] to-[#1a2c38] border border-[#213743] shadow-lg">
              <Dice5 className="h-6 w-6 text-[#00e701]" />
            </div>
            <div className="text-2xl font-black font-mono text-white">50.50</div>
          </div>
          {/* Slider bar */}
          <div className="mt-3 w-36 h-2 rounded-full bg-[#0f212e] border border-[#213743] relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-red-500" />
            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[#00e701]" />
          </div>
        </div>
      ),
    },
  ];

  const categories = [
    { name: "Originals", icon: Flame },
    { name: "Slots", icon: Gamepad2 },
    { name: "Live Casino", icon: Sparkles },
    { name: "Game Shows", icon: Trophy },
    { name: "Table Games", icon: Layers },
  ];

  const filteredGames = stakeOriginals.filter((game) =>
    game.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 select-none">
      {/* 1. HERO PROMOTIONAL BANNER */}
      <section className="relative overflow-hidden rounded-2xl border border-[#213743] bg-gradient-to-r from-[#1a2c38] via-[#1a2c38] to-[#0f212e] p-6 sm:p-8 md:p-10 shadow-xl">
        {/* Ambient background glow */}
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#00e701]/10 blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-20 h-60 w-60 rounded-full bg-[#1475e1]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#00e701]/15 px-3 py-1 text-xs font-extrabold text-[#00e701] border border-[#00e701]/30 uppercase tracking-wider">
              <Flame className="h-3.5 w-3.5 fill-[#00e701]" />
              <span>Stake Originals Arena</span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Win up to <span className="text-[#00e701]">$1,000,000</span> on Provably Fair Games
            </h1>

            <p className="text-sm sm:text-base text-[#b1bad3] leading-relaxed">
              Experience the world’s lowest 1% house edge with instant demo balance. Play Mines, Crash, Plinko, and Dice with smooth physics and real-time payouts.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/games/mines"
                className="flex items-center gap-2 rounded-xl bg-[#00e701] px-5 py-3 text-sm font-extrabold text-[#0f212e] shadow-lg shadow-[#00e701]/25 transition-all hover:bg-[#00c701] hover:shadow-[#00e701]/40 active:scale-95"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>Play Mines Now</span>
              </Link>

              <Link
                href="/games/crash"
                className="flex items-center gap-2 rounded-xl border border-[#213743] bg-[#213743] px-5 py-3 text-sm font-bold text-white transition-all hover:bg-[#2f4553] hover:border-[#2f4553] active:scale-95"
              >
                <TrendingUp className="h-4 w-4 text-amber-400" />
                <span>Try Crash (24.85x)</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Badge on Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3 lg:w-72">
            <div className="rounded-xl border border-[#213743] bg-[#0f212e]/80 p-3.5 backdrop-blur-md">
              <div className="flex items-center gap-1.5 text-xs text-[#b1bad3] font-medium">
                <ShieldCheck className="h-4 w-4 text-[#00e701]" />
                <span>Fairness</span>
              </div>
              <div className="mt-1 text-lg font-black text-white">99% RTP</div>
              <div className="text-[10px] text-[#b1bad3]">1% House Edge</div>
            </div>

            <div className="rounded-xl border border-[#213743] bg-[#0f212e]/80 p-3.5 backdrop-blur-md">
              <div className="flex items-center gap-1.5 text-xs text-[#b1bad3] font-medium">
                <Zap className="h-4 w-4 text-amber-400" />
                <span>Instant</span>
              </div>
              <div className="mt-1 text-lg font-black text-white">0.00s Payout</div>
              <div className="text-[10px] text-[#b1bad3]">Zero Latency</div>
            </div>

            <div className="col-span-2 sm:col-span-1 lg:col-span-2 rounded-xl border border-[#213743] bg-[#0f212e]/80 p-3.5 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-[#b1bad3] font-medium">
                  <Trophy className="h-4 w-4 text-[#00e701]" />
                  <span>Daily Race</span>
                </div>
                <span className="text-[10px] font-bold text-[#00e701]">$100,000</span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Leaderboard Live</span>
                <span className="text-[11px] text-[#b1bad3] font-mono">14h 22m</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SEARCH & CATEGORY PILLS BAR */}
      <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#b1bad3]" />
          <input
            type="text"
            placeholder="Search Stake Originals or games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[#213743] bg-[#1a2c38] pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-[#b1bad3]/60 focus:border-[#00e701] focus:outline-none transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex items-center gap-2 shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-[#213743] text-[#00e701] border border-[#00e701]/30 shadow-sm"
                    : "bg-[#1a2c38] text-[#b1bad3] border border-[#213743] hover:text-white hover:bg-[#213743]"
                }`}
              >
                <Icon
                  className={`h-3.5 w-3.5 ${
                    isSelected ? "text-[#00e701]" : "text-[#b1bad3]"
                  }`}
                />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. STAKE ORIGINALS GAME CARDS GRID */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#00e701]/15 text-[#00e701]">
              <Flame className="h-4 w-4 fill-current" />
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
              Stake Originals
            </h2>
            <span className="rounded-full bg-[#213743] px-2 py-0.5 text-[11px] font-bold text-[#00e701] border border-[#2f4553]">
              {stakeOriginals.length}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-[#b1bad3] hover:text-[#00e701] transition-colors cursor-pointer">
            <span>View All</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>

        {/* Game Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredGames.map((game) => {
            const Icon = game.icon;
            return (
              <Link
                key={game.id}
                href={game.href}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#213743] bg-[#1a2c38] p-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/50 ${game.borderGlow}`}
              >
                {/* Top Badge & RTP */}
                <div className="flex items-center justify-between z-10">
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border ${game.badgeColor}`}
                  >
                    {game.badge}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-[#b1bad3]">
                    <ShieldCheck className="h-3 w-3 text-[#00e701]" />
                    <span>{game.rtp}</span>
                  </div>
                </div>

                {/* Graphic / Visual Box with Hover Zoom Effect */}
                <div className="my-6 relative flex h-36 w-full items-center justify-center rounded-xl bg-gradient-to-b from-[#0f212e] to-[#1a2c38] border border-[#213743] overflow-hidden transition-all duration-300 group-hover:scale-[1.02]">
                  {/* Subtle Background Glow */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${game.accent} opacity-40 transition-opacity group-hover:opacity-75`}
                  />

                  {/* Artwork / Icon Representation */}
                  <div className="relative z-10 transition-transform duration-300 group-hover:scale-110">
                    {game.artSvg}
                  </div>

                  {/* Play Button Overlay on Hover */}
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#00e701] text-[#0f212e] shadow-lg shadow-[#00e701]/40 transform scale-75 group-hover:scale-100 transition-transform duration-200">
                      <Play className="h-6 w-6 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Card Footer Info */}
                <div className="space-y-1 z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-[#00e701]" />
                      <h3 className="text-base font-black text-white group-hover:text-[#00e701] transition-colors">
                        {game.title}
                      </h3>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-[#b1bad3] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#00e701]" />
                  </div>
                  <p className="text-xs text-[#b1bad3] line-clamp-1">{game.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. LIVE BETS / RECENT BETS TABLE FEED */}
      <section className="rounded-2xl border border-[#213743] bg-[#1a2c38] overflow-hidden shadow-xl">
        {/* Table Header Controls & Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-[#213743] p-4 sm:px-6 gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("casino")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === "casino"
                  ? "bg-[#213743] text-white shadow-sm"
                  : "text-[#b1bad3] hover:text-white"
              }`}
            >
              Casino Bets
            </button>
            <button
              onClick={() => setActiveTab("high")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === "high"
                  ? "bg-[#213743] text-white shadow-sm"
                  : "text-[#b1bad3] hover:text-white"
              }`}
            >
              High Rollers
            </button>
            <button
              onClick={() => setActiveTab("race")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === "race"
                  ? "bg-[#213743] text-white shadow-sm"
                  : "text-[#b1bad3] hover:text-white"
              }`}
            >
              Race Leaderboard
            </button>
          </div>

          {/* Live Indicator Status & Pause Toggle */}
          <div className="flex items-center gap-3 self-end sm:self-center">
            <button
              onClick={() => setIsLiveFeedPaused(!isLiveFeedPaused)}
              className="flex items-center gap-2 rounded-lg border border-[#213743] bg-[#0f212e] px-2.5 py-1 text-xs font-semibold text-[#b1bad3] hover:text-white hover:border-[#2f4553] transition-colors"
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isLiveFeedPaused
                    ? "bg-amber-400"
                    : "bg-[#00e701] animate-pulse"
                }`}
              />
              <span>{isLiveFeedPaused ? "Paused" : "Live Feed"}</span>
            </button>
            <span className="text-[11px] font-mono text-[#b1bad3]">
              {bets.length} wagers
            </span>
          </div>
        </div>

        {/* Bets Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0f212e]/50 border-b border-[#213743] text-[11px] font-bold uppercase tracking-wider text-[#b1bad3]">
              <tr>
                <th className="px-5 py-3">Game</th>
                <th className="px-5 py-3">Player</th>
                <th className="px-5 py-3 hidden sm:table-cell">Time</th>
                <th className="px-5 py-3 text-right">Bet Amount</th>
                <th className="px-5 py-3 text-right">Multiplier</th>
                <th className="px-5 py-3 text-right">Payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#213743]/50">
              {bets.map((bet) => (
                <tr
                  key={bet.id}
                  className="transition-colors hover:bg-[#213743]/40 font-medium"
                >
                  {/* Game Name */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 font-bold text-white">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#0f212e] text-[#00e701] border border-[#213743]">
                        {bet.game === "Mines" && <Bomb className="h-3.5 w-3.5" />}
                        {bet.game === "Crash" && <TrendingUp className="h-3.5 w-3.5 text-amber-400" />}
                        {bet.game === "Plinko" && <CircleDot className="h-3.5 w-3.5 text-blue-400" />}
                        {bet.game === "Dice" && <Dice5 className="h-3.5 w-3.5 text-purple-400" />}
                        {bet.game !== "Mines" &&
                          bet.game !== "Crash" &&
                          bet.game !== "Plinko" &&
                          bet.game !== "Dice" && (
                            <Gamepad2 className="h-3.5 w-3.5" />
                          )}
                      </span>
                      <span>{bet.game}</span>
                    </div>
                  </td>

                  {/* Player Name */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 text-[#b1bad3]">
                      <span className="font-semibold text-white">{bet.user}</span>
                    </div>
                  </td>

                  {/* Time */}
                  <td className="px-5 py-3.5 hidden sm:table-cell text-[#b1bad3]">
                    {bet.time}
                  </td>

                  {/* Bet Amount */}
                  <td className="px-5 py-3.5 text-right font-mono font-semibold text-[#b1bad3]">
                    ${bet.betAmount.toFixed(2)} {currency}
                  </td>

                  {/* Multiplier */}
                  <td className="px-5 py-3.5 text-right font-mono font-bold">
                    <span
                      className={
                        bet.multiplier > 2
                          ? "text-[#00e701]"
                          : bet.multiplier > 0
                          ? "text-white"
                          : "text-[#b1bad3]"
                      }
                    >
                      {bet.multiplier.toFixed(2)}x
                    </span>
                  </td>

                  {/* Payout */}
                  <td className="px-5 py-3.5 text-right font-mono font-bold">
                    {bet.isWin ? (
                      <span className="text-[#00e701] drop-shadow-[0_0_8px_rgba(0,231,1,0.2)]">
                        +${bet.payout.toFixed(2)} {currency}
                      </span>
                    ) : (
                      <span className="text-[#b1bad3]">$0.00</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
