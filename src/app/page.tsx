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
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Activity,
  Award,
  Gift,
  Crown,
  ChevronLeft,
  X,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";
import GuestHero from "@/components/GuestHero";
import LiveStatusAndSearch from "@/components/LiveStatusAndSearch";
import TrendingGames from "@/components/TrendingGames";
import TrendingSports from "@/components/TrendingSports";
import PromotionsSection from "@/components/PromotionsSection";
import LiveBetsFeed from "@/components/LiveBetsFeed";

interface BetRecord {
  id: string;
  game: string;
  user: string;
  time: string;
  betAmount: number;
  multiplier: number;
  payout: number;
  isWin: boolean;
  category: "all" | "high" | "lucky";
}

interface GameCard {
  id: string;
  title: string;
  provider: string;
  href?: string;
  category: "Originals" | "Slots" | "Live";
  badge: string;
  badgeColor: string;
  rtp: string;
  accent: string;
  desc: string;
  iconBg: string;
  symbols?: string[];
  themeColor: string;
}

export default function HomePage() {
  const { balance, updateBalance, currency, formatBalance, isAuthenticated } = useGame();

  // Navigation states
  const [topTab, setTopTab] = useState<"casino" | "sports">("casino");
  const [selectedCategory, setSelectedCategory] = useState<string>("Lobby");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProvider, setSelectedProvider] = useState<string>("All");

  // Hero carousel state
  const [activeSlide, setActiveSlide] = useState<number>(0);

  // Live Bets Table state
  const [activeBetsTab, setActiveBetsTab] = useState<"all" | "high" | "lucky" | "my">("all");
  const [isLivePaused, setIsLivePaused] = useState<boolean>(false);
  const [myBets, setMyBets] = useState<BetRecord[]>([]);

  // Slot Demo Player Modal state
  const [activeSlotModal, setActiveSlotModal] = useState<GameCard | null>(null);
  const [slotBet, setSlotBet] = useState<number>(10);
  const [slotReels, setSlotReels] = useState<string[][]>([
    ["⚡", "👑", "💎", "⭐", "🏺"],
    ["💎", "⚡", "👑", "🏺", "⭐"],
    ["⭐", "🏺", "💎", "⚡", "👑"],
  ]);
  const [isSpinningSlot, setIsSpinningSlot] = useState<boolean>(false);
  const [slotLastWin, setSlotLastWin] = useState<number | null>(null);

  // Hero Carousel Slides
  const slides = [
    {
      id: "slide-1",
      badge: "$100,000 DAILY RACE",
      badgeColor: "bg-[#00e701]/20 text-[#00e701] border-[#00e701]/30",
      title: "Compete in the $100,000 Daily Race",
      subtitle:
        "Every bet placed on Casino or Sports climbs the leaderboard. Top 5,000 racers share $100,000 daily!",
      ctaText: "Race Now",
      ctaLink: "/games/crash",
      timer: "12h 42m 18s",
      bgGradient: "from-emerald-950/80 via-[#1a2c38] to-[#0f212e]",
      racers: [
        { rank: 1, name: "WhaleKing", prize: "$25,000", wagered: "$1.4M" },
        { rank: 2, name: "CryptoValkyrie", prize: "$12,500", wagered: "$980K" },
        { rank: 3, name: "ApexRoll", prize: "$7,500", wagered: "$650K" },
      ],
    },
    {
      id: "slide-2",
      badge: "STAKE WEEKLY RAFFLE",
      badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      title: "Win Your Share of $75,000 Each Week",
      subtitle:
        "Earn 1 ticket for every $1,000 wagered. Live stream draw every Saturday with Eddie!",
      ctaText: "Get Tickets",
      ctaLink: "/games/plinko",
      timer: "3d 14h 05m",
      bgGradient: "from-amber-950/80 via-[#1a2c38] to-[#0f212e]",
      racers: [
        { rank: 1, name: "LuckyTicket#482", prize: "$10,000", wagered: "Ticket Drawn" },
        { rank: 2, name: "Satoshi_99", prize: "$5,000", wagered: "Ticket Drawn" },
        { rank: 3, name: "NeonRider", prize: "$5,000", wagered: "Ticket Drawn" },
      ],
    },
    {
      id: "slide-3",
      badge: "VIP LEVEL UP",
      badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      title: "Unlock Instant Rakeback & Weekly Bonuses",
      subtitle:
        "Experience the highest VIP rewards in gaming. Custom bonus hosts, level up cash, and zero turnover.",
      ctaText: "View VIP Club",
      ctaLink: "#vip",
      timer: "Always Active",
      bgGradient: "from-blue-950/80 via-[#1a2c38] to-[#0f212e]",
      racers: [
        { rank: 1, name: "Bronze IV", prize: "Active", wagered: "10% Rakeback" },
        { rank: 2, name: "Silver II", prize: "Next Tier", wagered: "$150 Bonus" },
        { rank: 3, name: "Platinum I", prize: "VIP Host", wagered: "Dedicated Host" },
      ],
    },
  ];

  // Auto rotate hero carousel every 6s
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Initial live bets feed
  const [bets, setBets] = useState<BetRecord[]>([
    {
      id: "b1",
      game: "Crash",
      user: "Hidden",
      time: "Just now",
      betAmount: 120.0,
      multiplier: 3.45,
      payout: 414.0,
      isWin: true,
      category: "all",
    },
    {
      id: "b2",
      game: "Gates of Olympus",
      user: "CryptoWhale",
      time: "1s ago",
      betAmount: 500.0,
      multiplier: 12.8,
      payout: 6400.0,
      isWin: true,
      category: "high",
    },
    {
      id: "b3",
      game: "Mines",
      user: "ApexPredator",
      time: "2s ago",
      betAmount: 50.0,
      multiplier: 18.4,
      payout: 920.0,
      isWin: true,
      category: "lucky",
    },
    {
      id: "b4",
      game: "Plinko",
      user: "LuckyStrike",
      time: "3s ago",
      betAmount: 20.0,
      multiplier: 0.2,
      payout: 4.0,
      isWin: false,
      category: "all",
    },
    {
      id: "b5",
      game: "Sweet Bonanza",
      user: "SugarLover",
      time: "5s ago",
      betAmount: 100.0,
      multiplier: 48.0,
      payout: 4800.0,
      isWin: true,
      category: "lucky",
    },
    {
      id: "b6",
      game: "Dice",
      user: "AcesHigh",
      time: "6s ago",
      betAmount: 250.0,
      multiplier: 1.98,
      payout: 495.0,
      isWin: true,
      category: "all",
    },
    {
      id: "b7",
      game: "Crazy Time",
      user: "Valkyrie",
      time: "8s ago",
      betAmount: 1500.0,
      multiplier: 10.0,
      payout: 15000.0,
      isWin: true,
      category: "high",
    },
  ]);

  // Live streaming bet ticker every 1.5 seconds
  useEffect(() => {
    if (isLivePaused) return;

    const gameNames = [
      "Crash",
      "Mines",
      "Plinko",
      "Dice",
      "Gates of Olympus",
      "Sweet Bonanza",
      "Sugar Rush 1000",
      "Wanted Dead or a Wild",
      "Limbo",
      "Crazy Time",
      "Blackjack",
      "Lightning Roulette",
    ];

    const users = [
      "Hidden",
      "Satoshi_88",
      "GoldRush99",
      "CryptoKing",
      "NeonViper",
      "DiamondHands",
      "AlphaWolf",
      "Valkyrie_X",
      "ShadowNinja",
      "ZeusMaster",
      "LuckyCat",
    ];

    const interval = setInterval(() => {
      const g = gameNames[Math.floor(Math.random() * gameNames.length)];
      const u = users[Math.floor(Math.random() * users.length)];
      const isHigh = Math.random() > 0.8;
      const betAmt = isHigh
        ? parseFloat((Math.random() * 2500 + 500).toFixed(2))
        : parseFloat((Math.random() * 80 + 5).toFixed(2));

      const isWin = Math.random() > 0.45;
      const isLucky = isWin && Math.random() > 0.7;
      const mult = isWin
        ? isLucky
          ? parseFloat((Math.random() * 150 + 10).toFixed(2))
          : parseFloat((Math.random() * 4.5 + 1.1).toFixed(2))
        : 0;

      const payout = isWin ? parseFloat((betAmt * mult).toFixed(2)) : 0;
      const cat = isLucky ? "lucky" : isHigh ? "high" : "all";

      const newBet: BetRecord = {
        id: `bet-${Date.now()}-${Math.random()}`,
        game: g,
        user: u,
        time: "Just now",
        betAmount: betAmt,
        multiplier: mult,
        payout,
        isWin,
        category: cat,
      };

      setBets((prev) => [newBet, ...prev.slice(0, 19)]);
    }, 1500);

    return () => clearInterval(interval);
  }, [isLivePaused]);

  // Comprehensive Game Catalog
  const stakeOriginals: GameCard[] = [
    {
      id: "mines",
      title: "Mines",
      provider: "Stake Originals",
      href: "/games/mines",
      category: "Originals",
      badge: "POPULAR",
      badgeColor: "bg-[#00e701]/20 text-[#00e701] border-[#00e701]/30",
      rtp: "99.00% RTP",
      accent: "from-emerald-500/20 to-green-950/40",
      desc: "Uncover gems, dodge hidden explosives",
      iconBg: "bg-emerald-500/10 text-[#00e701]",
      themeColor: "#00e701",
    },
    {
      id: "crash",
      title: "Crash",
      provider: "Stake Originals",
      href: "/games/crash",
      category: "Originals",
      badge: "HOT",
      badgeColor: "bg-red-500/20 text-red-400 border-red-500/30",
      rtp: "99.00% RTP",
      accent: "from-amber-500/20 to-orange-950/40",
      desc: "Cash out before the multiplier rocket crashes",
      iconBg: "bg-amber-500/10 text-amber-400",
      themeColor: "#f59e0b",
    },
    {
      id: "plinko",
      title: "Plinko",
      provider: "Stake Originals",
      href: "/games/plinko",
      category: "Originals",
      badge: "ORIGINAL",
      badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      rtp: "99.00% RTP",
      accent: "from-blue-500/20 to-indigo-950/40",
      desc: "Drop balls through pegs for up to 1000x",
      iconBg: "bg-blue-500/10 text-blue-400",
      themeColor: "#3b82f6",
    },
    {
      id: "dice",
      title: "Dice",
      provider: "Stake Originals",
      href: "/games/dice",
      category: "Originals",
      badge: "CLASSIC",
      badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      rtp: "99.00% RTP",
      accent: "from-purple-500/20 to-fuchsia-950/40",
      desc: "Roll over or under with custom win chances",
      iconBg: "bg-purple-500/10 text-purple-400",
      themeColor: "#a855f7",
    },
    {
      id: "limbo",
      title: "Limbo",
      provider: "Stake Originals",
      href: "/games/limbo",
      category: "Originals",
      badge: "FAST",
      badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      rtp: "99.00% RTP",
      accent: "from-yellow-500/20 to-amber-950/40",
      desc: "Target multipliers up to 1,000,000x",
      iconBg: "bg-yellow-500/10 text-yellow-400",
      themeColor: "#eab308",
    },
    {
      id: "keno",
      title: "Keno",
      provider: "Stake Originals",
      href: "/games/keno",
      category: "Originals",
      badge: "CASUAL",
      badgeColor: "bg-pink-500/20 text-pink-400 border-pink-500/30",
      rtp: "99.00% RTP",
      accent: "from-pink-500/20 to-rose-950/40",
      desc: "Pick 1 to 10 numbers from 40",
      iconBg: "bg-pink-500/10 text-pink-400",
      themeColor: "#ec4899",
    },
    {
      id: "wheel",
      title: "Wheel",
      provider: "Stake Originals",
      href: "/games/wheel",
      category: "Originals",
      badge: "SPIN",
      badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      rtp: "99.00% RTP",
      accent: "from-cyan-500/20 to-teal-950/40",
      desc: "Colored segment prize wheel",
      iconBg: "bg-cyan-500/10 text-cyan-400",
      themeColor: "#06b6d4",
    },
    {
      id: "blackjack",
      title: "Blackjack",
      provider: "Stake Originals",
      href: "/games/blackjack",
      category: "Originals",
      badge: "TABLE",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      rtp: "99.50% RTP",
      accent: "from-emerald-500/20 to-slate-950/40",
      desc: "Beat the dealer to 21 with 3:2 blackjack payout",
      iconBg: "bg-emerald-500/10 text-emerald-400",
      themeColor: "#10b981",
    },
    {
      id: "roulette",
      title: "Roulette",
      provider: "Stake Originals",
      href: "/games/roulette",
      category: "Originals",
      badge: "CLASSIC",
      badgeColor: "bg-red-500/20 text-red-400 border-red-500/30",
      rtp: "97.30% RTP",
      accent: "from-red-500/20 to-slate-950/40",
      desc: "Single zero European wheel with inside & outside bets",
      iconBg: "bg-red-500/10 text-red-400",
      themeColor: "#ef4444",
    },
  ];

  const popularSlots: GameCard[] = [
    {
      id: "gates-of-olympus",
      title: "Gates of Olympus",
      provider: "Pragmatic Play",
      category: "Slots",
      badge: "TOP SLOT",
      badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      rtp: "96.50% RTP",
      accent: "from-amber-500/25 to-yellow-950/50",
      desc: "Zeus tumble spins with up to 500x multiplier orbs",
      iconBg: "bg-amber-500/10 text-amber-400",
      symbols: ["⚡", "👑", "💎", "⭐", "🏺"],
      themeColor: "#f59e0b",
    },
    {
      id: "sweet-bonanza",
      title: "Sweet Bonanza",
      provider: "Pragmatic Play",
      category: "Slots",
      badge: "HOT",
      badgeColor: "bg-pink-500/20 text-pink-400 border-pink-500/30",
      rtp: "96.51% RTP",
      accent: "from-pink-500/25 to-rose-950/50",
      desc: "Candy tumble cluster pays with 100x candy bombs",
      iconBg: "bg-pink-500/10 text-pink-400",
      symbols: ["🍭", "🍬", "🍇", "🍉", "🍏"],
      themeColor: "#ec4899",
    },
    {
      id: "wanted-dead-or-wild",
      title: "Wanted Dead or a Wild",
      provider: "Hacksaw Gaming",
      category: "Slots",
      badge: "VS DUEL",
      badgeColor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      rtp: "96.38% RTP",
      accent: "from-orange-500/25 to-stone-950/50",
      desc: "VS duel multipliers up to 100x on full screen wilds",
      iconBg: "bg-orange-500/10 text-orange-400",
      symbols: ["🤠", "💀", "💰", "🥃", "🌵"],
      themeColor: "#f97316",
    },
    {
      id: "sugar-rush-1000",
      title: "Sugar Rush 1000",
      provider: "Pragmatic Play",
      category: "Slots",
      badge: "1000X",
      badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      rtp: "97.50% RTP",
      accent: "from-purple-500/25 to-fuchsia-950/50",
      desc: "Multiplier spots that multiply up to 1,024x",
      iconBg: "bg-purple-500/10 text-purple-400",
      symbols: ["🐻", "🌟", "🍬", "🍩", "🧁"],
      themeColor: "#a855f7",
    },
    {
      id: "rip-city",
      title: "RIP City",
      provider: "Hacksaw Gaming",
      category: "Slots",
      badge: "FEATURE",
      badgeColor: "bg-slate-500/20 text-slate-300 border-slate-500/30",
      rtp: "96.22% RTP",
      accent: "from-slate-500/25 to-zinc-950/50",
      desc: "Wild Cat jaw drops expanding with up to 200x multipliers",
      iconBg: "bg-slate-500/10 text-slate-300",
      symbols: ["🐱", "🐭", "🧀", "🍌", "💣"],
      themeColor: "#64748b",
    },
  ];

  const liveShows: GameCard[] = [
    {
      id: "crazy-time",
      title: "Crazy Time",
      provider: "Evolution Live",
      category: "Live",
      badge: "LIVE SHOW",
      badgeColor: "bg-red-500/20 text-red-400 border-red-500/30",
      rtp: "96.08% RTP",
      accent: "from-red-500/25 to-rose-950/50",
      desc: "Top Money wheel with Cash Hunt, Pachinko & Coin Flip",
      iconBg: "bg-red-500/10 text-red-400",
      themeColor: "#ef4444",
    },
    {
      id: "lightning-roulette",
      title: "Lightning Roulette",
      provider: "Evolution Live",
      category: "Live",
      badge: "500X STRIKES",
      badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      rtp: "97.30% RTP",
      accent: "from-amber-500/25 to-yellow-950/50",
      desc: "Lucky numbers struck by lightning for multipliers up to 500x",
      iconBg: "bg-amber-500/10 text-amber-400",
      themeColor: "#f59e0b",
    },
    {
      id: "stake-exclusive-blackjack",
      title: "Stake Exclusive Blackjack",
      provider: "Stake Live",
      category: "Live",
      badge: "VIP EXCLUSIVE",
      badgeColor: "bg-[#00e701]/20 text-[#00e701] border-[#00e701]/30",
      rtp: "99.28% RTP",
      accent: "from-emerald-500/25 to-green-950/50",
      desc: "Private 7-seat live dealers tailored for Stake VIP players",
      iconBg: "bg-[#00e701]/10 text-[#00e701]",
      themeColor: "#00e701",
    },
  ];

  // Category filter
  const categories = [
    "Lobby",
    "Stake Originals",
    "Slots",
    "Live Casino",
    "Game Shows",
    "Feature Buy-in",
    "Table Games",
  ];

  // Filter games based on search and selected category
  const allGames = [...stakeOriginals, ...popularSlots, ...liveShows];
  const filteredGames = allGames.filter((g) => {
    const matchesSearch =
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProvider =
      selectedProvider === "All" || g.provider.toLowerCase().includes(selectedProvider.toLowerCase());
    const matchesCategory =
      selectedCategory === "Lobby" ||
      (selectedCategory === "Stake Originals" && g.category === "Originals") ||
      (selectedCategory === "Slots" && g.category === "Slots") ||
      (selectedCategory === "Live Casino" && g.category === "Live") ||
      (selectedCategory === "Game Shows" && g.category === "Live");

    return matchesSearch && matchesProvider && matchesCategory;
  });

  // Slot Demo Spin Handler
  const spinSlotDemo = (game: GameCard) => {
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

    // 400ms tumble animation
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

          // Add to my bets
          const newBet: BetRecord = {
            id: `my-${Date.now()}`,
            game: game.title,
            user: "You",
            time: "Just now",
            betAmount: slotBet,
            multiplier: mult,
            payout,
            isWin: true,
            category: "all",
          };
          setMyBets((prev) => [newBet, ...prev.slice(0, 10)]);

          if (mult >= 5) {
            try {
              confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
            } catch {}
          }
        } else {
          setSlotLastWin(0);
          sounds.playDiceLoss();
          const newBet: BetRecord = {
            id: `my-${Date.now()}`,
            game: game.title,
            user: "You",
            time: "Just now",
            betAmount: slotBet,
            multiplier: 0,
            payout: 0,
            isWin: false,
            category: "all",
          };
          setMyBets((prev) => [newBet, ...prev.slice(0, 10)]);
        }
      }
    }, 60);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 space-y-8 select-none">
      {/* 1. TOP CASINO / SPORTS SWITCHER & SUB-NAV BAR */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Casino / Sports Toggle Pill */}
          <div className="flex rounded-xl bg-[#1a2c38] p-1 border border-[#213743] self-start">
            <button
              onClick={() => setTopTab("casino")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-black transition-all ${
                topTab === "casino"
                  ? "bg-[#213743] text-[#00e701] shadow-sm border border-[#00e701]/30"
                  : "text-[#b1bad3] hover:text-white"
              }`}
            >
              <Gamepad2 className="h-4 w-4" />
              <span>Casino</span>
            </button>
            <button
              onClick={() => setTopTab("sports")}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-black transition-all ${
                topTab === "sports"
                  ? "bg-[#213743] text-[#00e701] shadow-sm border border-[#00e701]/30"
                  : "text-[#b1bad3] hover:text-white"
              }`}
            >
              <Trophy className="h-4 w-4" />
              <span>Sports</span>
            </button>
          </div>

          {/* Providers Filter */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto sm:ml-auto">
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="rounded-xl border border-[#213743] bg-[#1a2c38] px-3.5 py-2 text-xs font-bold text-white focus:border-[#00e701] focus:outline-none cursor-pointer"
            >
              <option value="All">All Providers</option>
              <option value="Stake Originals">Stake Originals</option>
              <option value="Pragmatic Play">Pragmatic Play</option>
              <option value="Hacksaw Gaming">Hacksaw Gaming</option>
              <option value="Evolution">Evolution Live</option>
            </select>
          </div>
        </div>

        {/* Horizontal Category Pill Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-[#213743] text-[#00e701] border border-[#00e701]/40 shadow-sm"
                    : "bg-[#1a2c38] text-[#b1bad3] border border-[#213743] hover:text-white hover:bg-[#213743]"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. HERO SECTION: GUEST HERO LANDING OR PROMOTIONAL CAROUSEL */}
      {!isAuthenticated ? (
        <GuestHero />
      ) : (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Main Rotating Carousel Banner (8 Cols on Desktop) */}
          <div className="lg:col-span-8 relative overflow-hidden rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 sm:p-8 flex flex-col justify-between min-h-[300px] shadow-xl">
            <div
              className={`absolute inset-0 bg-gradient-to-r ${slides[activeSlide].bgGradient} opacity-90 transition-all duration-700 pointer-events-none`}
            />

            <div className="relative z-10 space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider backdrop-blur-sm ${slides[activeSlide].badgeColor}">
                <Flame className="h-3.5 w-3.5 fill-current" />
                <span>{slides[activeSlide].badge}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                {slides[activeSlide].title}
              </h1>

              <p className="text-xs sm:text-sm text-[#b1bad3] leading-relaxed">
                {slides[activeSlide].subtitle}
              </p>

              <div className="pt-2 flex items-center gap-3">
                <Link
                  href={slides[activeSlide].ctaLink}
                  className="flex items-center gap-2 rounded-xl bg-[#00e701] px-5 py-3 text-xs sm:text-sm font-black text-[#0f212e] shadow-lg shadow-[#00e701]/25 transition-all hover:bg-[#00c701] active:scale-95"
                >
                  <Play className="h-4 w-4 fill-current" />
                  <span>{slides[activeSlide].ctaText}</span>
                </Link>
                <div className="rounded-xl border border-[#213743] bg-[#0f212e]/70 px-3.5 py-2.5 text-xs font-mono font-bold text-white">
                  <span className="text-[#b1bad3] text-[10px] block uppercase">Time Left:</span>
                  <span>{slides[activeSlide].timer}</span>
                </div>
              </div>
            </div>

            {/* Carousel Slide Indicators */}
            <div className="relative z-10 flex items-center gap-2 pt-4">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    activeSlide === idx ? "w-8 bg-[#00e701]" : "w-2 bg-[#213743]"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* 2 Spotlight Cards (4 Cols on Desktop) */}
          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-4">
          {/* Spotlight Card 1: Casino */}
          <Link
            href="/casino/home"
            className="flex-1 rounded-2xl border border-[#213743] bg-gradient-to-br from-[#1a2c38] to-[#0f212e] p-5 flex flex-col justify-between hover:border-[#00e701]/40 transition-all group shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-[#00e701]/15 px-2 py-0.5 text-[10px] font-bold text-[#00e701] border border-[#00e701]/30">
                74,219 PLAYING
              </span>
              <Gamepad2 className="h-5 w-5 text-[#00e701]" />
            </div>
            <div className="my-3">
              <h3 className="text-xl font-black text-white group-hover:text-[#00e701] transition-colors">
                Stake Casino
              </h3>
              <p className="text-xs text-[#b1bad3]">
                Play Mines, Plinko, Crash & 3,000+ top verified slots
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-black text-[#00e701]">
              <span>Enter Casino</span>
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Spotlight Card 2: Sports */}
          <div className="flex-1 rounded-2xl border border-[#213743] bg-gradient-to-br from-[#1a2c38] to-[#0f212e] p-5 flex flex-col justify-between shadow-lg">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-blue-500/15 px-2 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-500/30">
                25,840 BETTING
              </span>
              <Trophy className="h-5 w-5 text-blue-400" />
            </div>
            <div className="my-3">
              <h3 className="text-xl font-black text-white">Stake Sportsbook</h3>
              <p className="text-xs text-[#b1bad3]">
                Live odds on UEFA Champions League, NBA, Premier League & UFC
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-black text-blue-400">
              <span>View Sports Odds</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </section>
      )}

      {/* 3. LIVE STATUS PILLS & CTRL+K GLOBAL SEARCH */}
      <LiveStatusAndSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* 4. TRENDING GAMES SECTION */}
      <TrendingGames onSelectGame={(g) => setActiveSlotModal(g as any)} />

      {/* 5. TRENDING SPORTS SECTION */}
      <TrendingSports />

      {/* 6. PROMOTIONS SECTION */}
      <PromotionsSection />

      {/* 7. GAMES CATALOG: SECTION 1: STAKE ORIGINALS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#00e701]/15 text-[#00e701]">
              <Flame className="h-4 w-4 fill-current" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">Stake Originals</h2>
            <span className="rounded-full bg-[#213743] px-2 py-0.5 text-[11px] font-bold text-[#00e701]">
              {stakeOriginals.length} Games
            </span>
          </div>
        </div>

        {/* 3:4 Aspect Ratio Stake Game Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {stakeOriginals.map((game) => (
            <Link
              key={game.id}
              href={game.href || `/games/${game.id}`}
              className="group relative flex flex-col justify-between rounded-2xl border border-[#213743] bg-[#1a2c38] p-3.5 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#00e701]/50 hover:shadow-2xl hover:shadow-black/60 aspect-[3/4]"
            >
              <div className="flex items-center justify-between z-10">
                <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase border ${game.badgeColor}`}>
                  {game.badge}
                </span>
                <span className="text-[10px] font-bold text-[#b1bad3]">{game.rtp}</span>
              </div>

              {/* Graphic Center */}
              <div className="my-auto flex flex-col items-center justify-center relative">
                <div
                  className={`flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl border border-[#213743] bg-[#0f212e] shadow-lg transform group-hover:scale-110 transition-transform duration-300`}
                >
                  {game.id === "mines" && <Bomb className="h-8 w-8 text-[#00e701]" />}
                  {game.id === "crash" && <TrendingUp className="h-8 w-8 text-amber-400" />}
                  {game.id === "plinko" && <CircleDot className="h-8 w-8 text-blue-400" />}
                  {game.id === "dice" && <Dice5 className="h-8 w-8 text-purple-400" />}
                  {game.id === "limbo" && <Zap className="h-8 w-8 text-yellow-400" />}
                  {game.id === "keno" && <Sparkles className="h-8 w-8 text-pink-400" />}
                  {game.id === "wheel" && <CircleDot className="h-8 w-8 text-cyan-400" />}
                  {game.id === "blackjack" && <span className="text-2xl font-black text-emerald-400">21</span>}
                  {game.id === "roulette" && <span className="text-2xl font-black text-red-400">36</span>}
                </div>

                {/* Play Button Overlay on Hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00e701] text-[#0f212e] shadow-lg shadow-[#00e701]/40 transform scale-75 group-hover:scale-100 transition-transform">
                    <Play className="h-5 w-5 fill-current ml-0.5" />
                  </div>
                </div>
              </div>

              <div className="z-10 space-y-0.5">
                <h3 className="text-sm font-black text-white group-hover:text-[#00e701] transition-colors">
                  {game.title}
                </h3>
                <p className="text-[10px] text-[#b1bad3] truncate">{game.provider}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. GAMES CATALOG: SECTION 2: POPULAR SLOTS (Interactive Demo Spin Modal) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">Popular Slots</h2>
            <span className="rounded-full bg-[#213743] px-2 py-0.5 text-[11px] font-bold text-amber-400">
              Pragmatic & Hacksaw
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
          {popularSlots.map((slot) => (
            <div
              key={slot.id}
              onClick={() => setActiveSlotModal(slot)}
              className="group relative flex flex-col justify-between rounded-2xl border border-[#213743] bg-[#1a2c38] p-3.5 transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-400/50 hover:shadow-2xl hover:shadow-black/60 aspect-[3/4] cursor-pointer"
            >
              <div className="flex items-center justify-between z-10">
                <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase border ${slot.badgeColor}`}>
                  {slot.badge}
                </span>
                <span className="text-[10px] font-bold text-[#b1bad3]">{slot.rtp}</span>
              </div>

              {/* Slot Visual Thumb Representation */}
              <div className="my-auto flex flex-col items-center justify-center relative">
                <div className="flex flex-col items-center justify-center h-20 w-20 rounded-2xl bg-[#0f212e] border border-[#213743] p-2 space-y-1 group-hover:scale-105 transition-transform">
                  <div className="flex gap-1 text-base">
                    <span>{slot.symbols?.[0]}</span>
                    <span>{slot.symbols?.[1]}</span>
                  </div>
                  <div className="flex gap-1 text-base">
                    <span>{slot.symbols?.[2]}</span>
                    <span>{slot.symbols?.[3]}</span>
                  </div>
                </div>

                {/* Instant Play Badge */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="rounded-full bg-amber-400 px-3 py-1 text-[11px] font-black text-[#0f212e] shadow-lg shadow-amber-400/40">
                    Spin Demo
                  </div>
                </div>
              </div>

              <div className="z-10 space-y-0.5">
                <h3 className="text-xs sm:text-sm font-black text-white group-hover:text-amber-400 transition-colors truncate">
                  {slot.title}
                </h3>
                <p className="text-[10px] text-[#b1bad3] truncate">{slot.provider}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. GAMES CATALOG: SECTION 3: LIVE CASINO & GAME SHOWS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/15 text-red-400">
              <Activity className="h-4 w-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">Live Casino & Shows</h2>
            <span className="rounded-full bg-[#213743] px-2 py-0.5 text-[11px] font-bold text-red-400">
              Live Dealers
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {liveShows.map((live) => (
            <div
              key={live.id}
              onClick={() => setActiveSlotModal(live)}
              className="group relative flex flex-col justify-between rounded-2xl border border-[#213743] bg-[#1a2c38] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-red-500/50 hover:shadow-xl cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase border ${live.badgeColor}`}>
                  {live.badge}
                </span>
                <span className="text-xs font-bold text-[#b1bad3]">{live.rtp}</span>
              </div>

              <div className="my-4">
                <h3 className="text-base font-black text-white group-hover:text-red-400 transition-colors">
                  {live.title}
                </h3>
                <p className="text-xs text-[#b1bad3] mt-1">{live.desc}</p>
              </div>

              <div className="flex items-center justify-between border-t border-[#213743] pt-3">
                <span className="text-[11px] font-bold text-[#b1bad3]">{live.provider}</span>
                <div className="flex items-center gap-1 text-xs font-bold text-[#00e701]">
                  <span>Launch Live</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. REAL-TIME LIVE BETS FEED (DUAL RESPONSIVE PARITY) */}
      <LiveBetsFeed />

      {/* 7. AUTHENTIC STAKE FOOTER & SPONSORSHIPS */}
      <footer className="border-t border-[#213743] pt-8 pb-12 space-y-8 text-xs text-[#b1bad3]">
        {/* Sponsorship Banner */}
        <div className="rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 space-y-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-white text-center">
            Official Global Partners
          </div>
          <div className="flex flex-wrap items-center justify-around gap-6">
            <div className="flex items-center gap-2 font-black text-white text-sm sm:text-base tracking-wider">
              <span className="rounded bg-[#00e701] px-2 py-0.5 text-xs text-[#0f212e] font-black">F1</span>
              <span>STAKE F1 TEAM SAUBER</span>
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

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6 pt-4 border-t border-[#213743]/50">
          <div className="space-y-2">
            <div className="font-bold text-white uppercase text-[11px]">Casino</div>
            <ul className="space-y-1.5">
              <li><Link href="/games/mines" className="hover:text-white">Mines</Link></li>
              <li><Link href="/games/crash" className="hover:text-white">Crash</Link></li>
              <li><Link href="/games/plinko" className="hover:text-white">Plinko</Link></li>
              <li><Link href="/games/dice" className="hover:text-white">Dice</Link></li>
            </ul>
          </div>
          <div className="space-y-2">
            <div className="font-bold text-white uppercase text-[11px]">Originals</div>
            <ul className="space-y-1.5">
              <li><Link href="/games/limbo" className="hover:text-white">Limbo</Link></li>
              <li><Link href="/games/keno" className="hover:text-white">Keno</Link></li>
              <li><Link href="/games/wheel" className="hover:text-white">Wheel</Link></li>
              <li><Link href="/games/blackjack" className="hover:text-white">Blackjack</Link></li>
            </ul>
          </div>
          <div className="space-y-2">
            <div className="font-bold text-white uppercase text-[11px]">Sports</div>
            <ul className="space-y-1.5">
              <li className="hover:text-white cursor-pointer">Live Events</li>
              <li className="hover:text-white cursor-pointer">Soccer</li>
              <li className="hover:text-white cursor-pointer">Basketball</li>
              <li className="hover:text-white cursor-pointer">Tennis</li>
            </ul>
          </div>
          <div className="space-y-2">
            <div className="font-bold text-white uppercase text-[11px]">Promo</div>
            <ul className="space-y-1.5">
              <li className="hover:text-white cursor-pointer">VIP Club</li>
              <li className="hover:text-white cursor-pointer">Daily Race</li>
              <li className="hover:text-white cursor-pointer">Weekly Raffle</li>
              <li className="hover:text-white cursor-pointer">Affiliate</li>
            </ul>
          </div>
          <div className="space-y-2">
            <div className="font-bold text-white uppercase text-[11px]">Support</div>
            <ul className="space-y-1.5">
              <li className="hover:text-white cursor-pointer">Live Support (24/7)</li>
              <li className="hover:text-white cursor-pointer">Help Center</li>
              <li className="hover:text-white cursor-pointer">Provably Fair</li>
            </ul>
          </div>
          <div className="space-y-2">
            <div className="font-bold text-white uppercase text-[11px]">Legal</div>
            <ul className="space-y-1.5">
              <li className="hover:text-white cursor-pointer">Terms of Service</li>
              <li className="hover:text-white cursor-pointer">Privacy Policy</li>
              <li className="hover:text-white cursor-pointer">Responsible Gaming</li>
            </ul>
          </div>
        </div>

        {/* 18+ Responsible Gaming Notice */}
        <div className="text-center pt-4 border-t border-[#213743]/50 space-y-2">
          <div className="inline-block rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 font-bold text-red-400 text-[10px]">
            18+ ONLY • GAMBLE RESPONSIBLY
          </div>
          <p className="max-w-2xl mx-auto text-[11px] text-[#b1bad3]/80">
            Stake is committed to responsible gaming. Players must be of legal age. This website is a demo clone created for educational and entertainment purposes.
          </p>
        </div>
      </footer>

      {/* 8. INTERACTIVE SLOT / LIVE GAME DEMO PLAYER MODAL */}
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
                  <p className="text-xs text-[#b1bad3]">{activeSlotModal.provider} • {activeSlotModal.rtp}</p>
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
