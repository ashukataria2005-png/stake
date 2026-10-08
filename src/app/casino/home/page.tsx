"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bomb,
  TrendingUp,
  CircleDot,
  Dice5,
  Zap,
  Sparkles,
  Flame,
  Award,
  Play,
  X,
  Search,
} from "lucide-react";
import CasinoPromoCarousel from "@/components/casino/CasinoPromoCarousel";
import CasinoCategoryPills from "@/components/casino/CasinoCategoryPills";
import CasinoGameRow, { CasinoCardData } from "@/components/casino/CasinoGameRow";
import CasinoLiveBets from "@/components/casino/CasinoLiveBets";
import StakeGameArtwork from "@/components/casino/StakeGameArtwork";
import { useGame } from "@/context/GameContext";
import {
  ALL_GAMES,
  EVOLUTION_GAMES,
  EZUGI_GAMES,
  INOUT_GAMES,
  PRAGMATIC_GAMES,
  HACKSAW_GAMES,
  HP100_GAMES,
  SPRIBE_GAMES,
  SMARTSOFT_GAMES,
  JILI_GAMES,
  EVOPLAY_GAMES,
  PRAGMATIC_LIVE_GAMES,
  TURBOGAMES_GAMES,
  GameItem,
} from "@/data/stakeGames";
import { getGameThumbnail } from "@/data/gameThumbnails";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

export default function CasinoHomePage() {
  const { balance, updateBalance, currency } = useGame();
  const [activeCategory, setActiveCategory] = useState<string>("home");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Real-time instant search across ALL_GAMES (title, name, provider, category)
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

  // Slot Demo Player Modal State
  const [activeSlotModal, setActiveSlotModal] = useState<any | null>(null);
  const [slotBet, setSlotBet] = useState<number>(10);
  const [slotReels, setSlotReels] = useState<string[][]>([
    ["⚡", "👑", "💎", "⭐", "🏺"],
    ["💎", "⚡", "👑", "🏺", "⭐"],
    ["⭐", "🏺", "💎", "⚡", "👑"],
  ]);
  const [isSpinningSlot, setIsSpinningSlot] = useState<boolean>(false);
  const [slotLastWin, setSlotLastWin] = useState<number | null>(null);

  // 1. Stake Originals (9 Games)
  const stakeOriginals: CasinoCardData[] = [
    {
      id: "dice",
      title: "Dice",
      provider: "Stake Originals",
      playersCount: 2480,
      badge: "ORIGINAL",
      badgeColor: "bg-[#00e701]/20 text-[#00e701] border-[#00e701]/30",
      href: "/games/dice",
      graphic: <StakeGameArtwork gameId="dice" className="w-16 h-16 sm:w-20 sm:h-20" />,
      bgGradient: "from-purple-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "mines",
      title: "Mines",
      provider: "Stake Originals",
      playersCount: 3820,
      badge: "TOP PICK",
      badgeColor: "bg-[#00e701]/20 text-[#00e701] border-[#00e701]/30",
      href: "/games/mines",
      graphic: <StakeGameArtwork gameId="mines" className="w-16 h-16 sm:w-20 sm:h-20" />,
      bgGradient: "from-emerald-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "plinko",
      title: "Plinko",
      provider: "Stake Originals",
      playersCount: 4190,
      badge: "ORIGINAL",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      href: "/games/plinko",
      graphic: <StakeGameArtwork gameId="plinko" className="w-16 h-16 sm:w-20 sm:h-20" />,
      bgGradient: "from-blue-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "crash",
      title: "Crash",
      provider: "Stake Originals",
      playersCount: 5120,
      badge: "HOT",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      href: "/games/crash",
      graphic: <StakeGameArtwork gameId="crash" className="w-16 h-16 sm:w-20 sm:h-20" />,
      bgGradient: "from-amber-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "limbo",
      title: "Limbo",
      provider: "Stake Originals",
      playersCount: 2890,
      badge: "1,000,000X",
      badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      href: "/games/limbo",
      graphic: <StakeGameArtwork gameId="limbo" className="w-16 h-16 sm:w-20 sm:h-20" />,
      bgGradient: "from-yellow-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "keno",
      title: "Keno",
      provider: "Stake Originals",
      playersCount: 1250,
      badge: "ORIGINAL",
      badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/30",
      href: "/games/keno",
      graphic: <StakeGameArtwork gameId="keno" className="w-16 h-16 sm:w-20 sm:h-20" />,
      bgGradient: "from-pink-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "blackjack",
      title: "Blackjack",
      provider: "Stake Originals",
      playersCount: 1680,
      badge: "TABLE",
      badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
      href: "/games/blackjack",
      graphic: <StakeGameArtwork gameId="blackjack" className="w-16 h-16 sm:w-20 sm:h-20" />,
      bgGradient: "from-indigo-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "roulette",
      title: "Roulette",
      provider: "Stake Originals",
      playersCount: 1430,
      badge: "CLASSIC",
      badgeColor: "bg-red-500/20 text-red-300 border-red-500/30",
      href: "/games/roulette",
      graphic: <StakeGameArtwork gameId="roulette" className="w-16 h-16 sm:w-20 sm:h-20" />,
      bgGradient: "from-red-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "wheel",
      title: "Wheel",
      provider: "Stake Originals",
      playersCount: 970,
      badge: "ORIGINAL",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      href: "/games/wheel",
      graphic: <StakeGameArtwork gameId="wheel" className="w-16 h-16 sm:w-20 sm:h-20" />,
      bgGradient: "from-emerald-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "diamonds",
      title: "Diamonds",
      provider: "Stake Originals",
      playersCount: 1320,
      badge: "ORIGINAL",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      href: "/games/dice",
      graphic: <span className="text-3xl">💎✨</span>,
      bgGradient: "from-cyan-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "hilo",
      title: "Hilo",
      provider: "Stake Originals",
      playersCount: 1740,
      badge: "ORIGINAL",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      href: "/games/dice",
      graphic: <span className="text-3xl">🃏📈</span>,
      bgGradient: "from-blue-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "video-poker",
      title: "Video Poker",
      provider: "Stake Originals",
      playersCount: 1450,
      badge: "ORIGINAL",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      href: "/games/blackjack",
      graphic: <span className="text-3xl">♠️♥️</span>,
      bgGradient: "from-purple-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "baccarat",
      title: "Baccarat",
      provider: "Stake Originals",
      playersCount: 1890,
      badge: "TABLE",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      href: "/games/blackjack",
      graphic: <span className="text-3xl">🎴🪙</span>,
      bgGradient: "from-amber-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "slide",
      title: "Slide",
      provider: "Stake Originals",
      playersCount: 2150,
      badge: "MULTIPLIER",
      badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/30",
      href: "/games/crash",
      graphic: <span className="text-3xl">🎢💥</span>,
      bgGradient: "from-orange-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "dragon-tower",
      title: "Dragon Tower",
      provider: "Stake Originals",
      playersCount: 2680,
      badge: "ORIGINAL",
      badgeColor: "bg-red-500/20 text-red-300 border-red-500/30",
      href: "/games/mines",
      graphic: <span className="text-3xl">🐉🏰</span>,
      bgGradient: "from-red-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "scarab-auto",
      title: "Scarab Auto",
      provider: "Stake Originals",
      playersCount: 1120,
      badge: "ORIGINAL",
      badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/30",
      href: "/games/dice",
      graphic: <span className="text-3xl">🪲🏺</span>,
      bgGradient: "from-teal-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "blue-samurai",
      title: "Blue Samurai",
      provider: "Stake Originals",
      playersCount: 1530,
      badge: "ORIGINAL",
      badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
      href: "/games/dice",
      graphic: <span className="text-3xl">⚔️🎎</span>,
      bgGradient: "from-indigo-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "tome-of-life",
      title: "Tome of Life",
      provider: "Stake Originals",
      playersCount: 1620,
      badge: "ORIGINAL",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      href: "/games/dice",
      graphic: <span className="text-3xl">📖✨</span>,
      bgGradient: "from-emerald-950/80 via-[#1a2c38] to-[#0f212e]",
    },
  ];

  // 2. Slots (9 Games)
  const slotsGames: CasinoCardData[] = [
    {
      id: "gates-olympus-1000",
      title: "Gates of Olympus 1000",
      provider: "Pragmatic Play",
      playersCount: 1554,
      badge: "1,000X MULTI",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      graphic: <span className="text-3xl">⚡👑</span>,
      bgGradient: "from-amber-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "sweet-bonanza-1000",
      title: "Sweet Bonanza 1000",
      provider: "Pragmatic Play",
      playersCount: 1420,
      badge: "CANDY BOMB",
      badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/30",
      graphic: <span className="text-3xl">🍭🍬</span>,
      bgGradient: "from-pink-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "wanted-dead-or-a-wild",
      title: "Wanted Dead or a Wild",
      provider: "Hacksaw Gaming",
      playersCount: 1110,
      badge: "VS DUEL",
      badgeColor: "bg-red-500/20 text-red-300 border-red-500/30",
      graphic: <span className="text-3xl">💀🔫</span>,
      bgGradient: "from-red-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "sugar-rush-1000",
      title: "Sugar Rush 1000",
      provider: "Pragmatic Play",
      playersCount: 1670,
      badge: "1,024X SPOTS",
      badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/30",
      graphic: <span className="text-3xl">🧁🐻</span>,
      bgGradient: "from-pink-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "dork-unit",
      title: "Dork Unit",
      provider: "Hacksaw Gaming",
      playersCount: 890,
      badge: "GIFT BOX",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      graphic: <span className="text-3xl">🤡🎁</span>,
      bgGradient: "from-purple-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "rip-city",
      title: "Rip City",
      provider: "Hacksaw Gaming",
      playersCount: 950,
      badge: "FEATURED",
      badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      graphic: <span className="text-3xl">🐱🐭</span>,
      bgGradient: "from-stone-900 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "chaos-crew-2",
      title: "Chaos Crew 2",
      provider: "Hacksaw Gaming",
      playersCount: 780,
      badge: "GRAFFITI",
      badgeColor: "bg-lime-500/20 text-lime-300 border-lime-500/30",
      graphic: <span className="text-3xl">🎨💀</span>,
      bgGradient: "from-neutral-900 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "starlight-princess-1000",
      title: "Starlight Princess 1000",
      provider: "Pragmatic Play",
      playersCount: 1240,
      badge: "1,000X MULTI",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      graphic: <span className="text-3xl">⭐👸</span>,
      bgGradient: "from-blue-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "le-catcher",
      title: "Le Catcher",
      provider: "Hacksaw Gaming",
      playersCount: 820,
      badge: "MEGA BONUS",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      graphic: <span className="text-3xl">🎩💎</span>,
      bgGradient: "from-purple-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "dog-house",
      title: "The Dog House Megaways",
      provider: "Pragmatic Play",
      playersCount: 1840,
      badge: "STICKY WILDS",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      graphic: <span className="text-3xl">🐶🦴</span>,
      bgGradient: "from-amber-950 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "big-bass-splash",
      title: "Big Bass Splash",
      provider: "Pragmatic Play",
      playersCount: 2240,
      badge: "FREE SPINS",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      graphic: <span className="text-3xl">🎣🐟</span>,
      bgGradient: "from-cyan-950 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "madame-destiny",
      title: "Madame Destiny Megaways",
      provider: "Pragmatic Play",
      playersCount: 1410,
      badge: "25X MULTI",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      graphic: <span className="text-3xl">🔮🌙</span>,
      bgGradient: "from-purple-950 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "hand-of-anubis",
      title: "Hand of Anubis",
      provider: "Hacksaw Gaming",
      playersCount: 1980,
      badge: "UNDERWORLD",
      badgeColor: "bg-red-500/20 text-red-300 border-red-500/30",
      graphic: <span className="text-3xl">🐺⚖️</span>,
      bgGradient: "from-red-950 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "razor-shark",
      title: "Razor Shark",
      provider: "Push Gaming",
      playersCount: 1350,
      badge: "MYSTERY",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      graphic: <span className="text-3xl">🦈🌊</span>,
      bgGradient: "from-blue-950 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "fruit-party-2",
      title: "Fruit Party 2",
      provider: "Pragmatic Play",
      playersCount: 1620,
      badge: "TUMBLE",
      badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/30",
      graphic: <span className="text-3xl">🍓🍇</span>,
      bgGradient: "from-pink-950 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "zeus-vs-hades",
      title: "Zeus vs Hades",
      provider: "Pragmatic Play",
      playersCount: 2190,
      badge: "15,000X",
      badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/30",
      graphic: <span className="text-3xl">⚡🔥</span>,
      bgGradient: "from-orange-950 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "floating-dragon",
      title: "Floating Dragon",
      provider: "Pragmatic Play",
      playersCount: 1180,
      badge: "HOLD & SPIN",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      graphic: <span className="text-3xl">🪁🌸</span>,
      bgGradient: "from-emerald-950 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "wild-west-gold",
      title: "Wild West Gold",
      provider: "Pragmatic Play",
      playersCount: 1290,
      badge: "BOUNTY",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      graphic: <span className="text-3xl">🤠💰</span>,
      bgGradient: "from-amber-950 via-[#1a2c38] to-[#0f212e]",
    },
  ];

  // 3. Publishers (9 Providers - Task 19: High-contrast white provider brand typography)
  const publishers: CasinoCardData[] = [
    {
      id: "pub-stake",
      title: "Stake Originals",
      provider: "42 Games",
      badge: "EXCLUSIVE",
      badgeColor: "bg-[#00e701]/20 text-[#00e701] border-[#00e701]/30",
      graphic: <span className="font-black italic text-xl tracking-tight text-white">stake</span>,
      bgGradient: "from-emerald-950 via-[#1a2c38] to-[#0f212e]",
      isPublisherCard: true,
      playersCount: 48920,
      href: "/casino/group/stake-originals",
    },
    {
      id: "pub-pragmatic",
      title: "Pragmatic Play",
      provider: "380 Games",
      badge: "POPULAR",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      graphic: <span className="font-extrabold tracking-wider text-xs sm:text-sm text-white">PRAGMATIC PLAY</span>,
      bgGradient: "from-amber-950 via-[#1a2c38] to-[#0f212e]",
      isPublisherCard: true,
      playersCount: 38400,
      href: "/casino/collection/providers",
    },
    {
      id: "pub-hacksaw",
      title: "Hacksaw Gaming",
      provider: "140 Games",
      badge: "HOT",
      badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      graphic: <span className="font-mono font-black tracking-wider text-xs sm:text-sm text-white">HACKSAW</span>,
      bgGradient: "from-stone-900 via-[#1a2c38] to-[#0f212e]",
      isPublisherCard: true,
      playersCount: 22840,
      href: "/casino/collection/providers",
    },
    {
      id: "pub-nolimit",
      title: "Nolimit City",
      provider: "95 Games",
      badge: "XTREME VOL",
      badgeColor: "bg-red-500/20 text-red-300 border-red-500/30",
      graphic: <span className="font-black tracking-wider text-xs sm:text-sm text-white">NOLIMIT CITY</span>,
      bgGradient: "from-red-950 via-[#1a2c38] to-[#0f212e]",
      isPublisherCard: true,
      playersCount: 14800,
      href: "/casino/collection/providers",
    },
    {
      id: "pub-evolution",
      title: "Evolution Live",
      provider: "110 Games",
      badge: "LIVE DEALERS",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      graphic: <span className="font-extrabold tracking-wide text-xs sm:text-sm text-white">EVOLUTION</span>,
      bgGradient: "from-blue-950 via-[#1a2c38] to-[#0f212e]",
      isPublisherCard: true,
      playersCount: 31200,
      href: "/casino/collection/providers",
    },
    {
      id: "pub-push",
      title: "Push Gaming",
      provider: "60 Games",
      badge: "VERIFIED",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      graphic: <span className="font-extrabold tracking-wide text-xs sm:text-sm text-white">PUSH GAMING</span>,
      bgGradient: "from-cyan-950 via-[#1a2c38] to-[#0f212e]",
      isPublisherCard: true,
      playersCount: 9750,
      href: "/casino/collection/providers",
    },
    {
      id: "pub-spribe",
      title: "Spribe",
      provider: "15 Games",
      badge: "TURBO",
      badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/30",
      graphic: <span className="font-black tracking-wider text-xs sm:text-sm text-white">SPRIBE</span>,
      bgGradient: "from-orange-950 via-[#1a2c38] to-[#0f212e]",
      isPublisherCard: true,
      playersCount: 17400,
      href: "/casino/collection/providers",
    },
    {
      id: "pub-bgaming",
      title: "BGaming",
      provider: "85 Games",
      badge: "TOP PICK",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      graphic: <span className="font-black tracking-wide text-xs sm:text-sm text-white">BGAMING</span>,
      bgGradient: "from-purple-950 via-[#1a2c38] to-[#0f212e]",
      isPublisherCard: true,
      playersCount: 11600,
      href: "/casino/collection/providers",
    },
    {
      id: "pub-relax",
      title: "Relax Gaming",
      provider: "120 Games",
      badge: "FEATURED",
      badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/30",
      graphic: <span className="font-black tracking-wide text-xs sm:text-sm text-white">RELAX GAMING</span>,
      bgGradient: "from-teal-950 via-[#1a2c38] to-[#0f212e]",
      isPublisherCard: true,
      playersCount: 13900,
      href: "/casino/collection/providers",
    },
    {
      id: "pub-playngo",
      title: "Play'n GO",
      provider: "290 Games",
      badge: "TOP TIER",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      graphic: <span className="font-black tracking-wider text-xs sm:text-sm text-white">PLAY'N GO</span>,
      bgGradient: "from-blue-950 via-[#1a2c38] to-[#0f212e]",
      isPublisherCard: true,
      playersCount: 26400,
      href: "/casino/collection/providers",
    },
    {
      id: "pub-netent",
      title: "NetEnt",
      provider: "210 Games",
      badge: "CLASSIC",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      graphic: <span className="font-black tracking-wide text-xs sm:text-sm text-white">NETENT</span>,
      bgGradient: "from-emerald-950 via-[#1a2c38] to-[#0f212e]",
      isPublisherCard: true,
      playersCount: 19800,
      href: "/casino/collection/providers",
    },
    {
      id: "pub-redtiger",
      title: "Red Tiger",
      provider: "185 Games",
      badge: "DAILY JACKPOT",
      badgeColor: "bg-red-500/20 text-red-300 border-red-500/30",
      graphic: <span className="font-black tracking-wide text-xs sm:text-sm text-white">RED TIGER</span>,
      bgGradient: "from-red-950 via-[#1a2c38] to-[#0f212e]",
      isPublisherCard: true,
      playersCount: 15700,
      href: "/casino/collection/providers",
    },
    {
      id: "pub-quickspin",
      title: "Quickspin",
      provider: "95 Games",
      badge: "SLOTS",
      badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/30",
      graphic: <span className="font-black tracking-wide text-xs sm:text-sm text-white">QUICKSPIN</span>,
      bgGradient: "from-orange-950 via-[#1a2c38] to-[#0f212e]",
      isPublisherCard: true,
      playersCount: 8900,
      href: "/casino/collection/providers",
    },
    {
      id: "pub-thunderkick",
      title: "Thunderkick",
      provider: "65 Games",
      badge: "CREATIVE",
      badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      graphic: <span className="font-mono font-black tracking-wide text-xs sm:text-sm text-white">THUNDERKICK</span>,
      bgGradient: "from-amber-950 via-[#1a2c38] to-[#0f212e]",
      isPublisherCard: true,
      playersCount: 7400,
      href: "/casino/collection/providers",
    },
    {
      id: "pub-elk",
      title: "ELK Studios",
      provider: "80 Games",
      badge: "X-ITER",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      graphic: <span className="font-black tracking-wide text-xs sm:text-sm text-white">ELK STUDIOS</span>,
      bgGradient: "from-purple-950 via-[#1a2c38] to-[#0f212e]",
      isPublisherCard: true,
      playersCount: 10800,
      href: "/casino/collection/providers",
    },
    {
      id: "pub-yggdrasil",
      title: "Yggdrasil",
      provider: "135 Games",
      badge: "GIGA",
      badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/30",
      graphic: <span className="font-black tracking-wider text-xs sm:text-sm text-white">YGGDRASIL</span>,
      bgGradient: "from-teal-950 via-[#1a2c38] to-[#0f212e]",
      isPublisherCard: true,
      playersCount: 12100,
      href: "/casino/collection/providers",
    },
    {
      id: "pub-blueprint",
      title: "Blueprint",
      provider: "150 Games",
      badge: "JACKPOT KING",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      graphic: <span className="font-black tracking-wide text-xs sm:text-sm text-white">BLUEPRINT</span>,
      bgGradient: "from-cyan-950 via-[#1a2c38] to-[#0f212e]",
      isPublisherCard: true,
      playersCount: 11400,
      href: "/casino/collection/providers",
    },
    {
      id: "pub-btg",
      title: "Big Time Gaming",
      provider: "50 Games",
      badge: "MEGAWAYS",
      badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
      graphic: <span className="font-black tracking-wide text-xs sm:text-sm text-white">BTG</span>,
      bgGradient: "from-indigo-950 via-[#1a2c38] to-[#0f212e]",
      isPublisherCard: true,
      playersCount: 14600,
      href: "/casino/collection/providers",
    },
  ];

  // 4. Live Casino (9 Games)
  const liveCasinoGames: CasinoCardData[] = [
    {
      id: "lightning-roulette",
      title: "Lightning Roulette",
      provider: "Evolution Live",
      playersCount: 3420,
      badge: "500X MULTI",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      href: "/casino/group/live-casino",
      graphic: <span className="text-3xl">⚡🎡</span>,
      bgGradient: "from-amber-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "live-blackjack",
      title: "Live Blackjack",
      provider: "Evolution Live",
      playersCount: 4120,
      badge: "POPULAR",
      badgeColor: "bg-[#00e701]/20 text-[#00e701] border-[#00e701]/30",
      href: "/casino/group/live-casino",
      graphic: <span className="text-3xl">♠️♣️</span>,
      bgGradient: "from-emerald-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "crazy-time",
      title: "Crazy Time",
      provider: "Evolution Live",
      playersCount: 5890,
      badge: "HOT",
      badgeColor: "bg-red-500/20 text-red-300 border-red-500/30",
      href: "/casino/group/live-casino",
      graphic: <span className="text-3xl">🎡✨</span>,
      bgGradient: "from-red-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "baccarat-live",
      title: "Baccarat Live",
      provider: "Evolution Live",
      playersCount: 2150,
      badge: "SPEED",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      href: "/casino/group/live-casino",
      graphic: <span className="text-3xl">🎴🎲</span>,
      bgGradient: "from-purple-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "roulette-live",
      title: "Roulette Live",
      provider: "Evolution Live",
      playersCount: 1890,
      badge: "CLASSIC",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      href: "/casino/group/live-casino",
      graphic: <span className="text-3xl">🔴⚫</span>,
      bgGradient: "from-blue-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "dragon-tiger",
      title: "Dragon Tiger",
      provider: "Evolution Live",
      playersCount: 1430,
      badge: "FAST",
      badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/30",
      href: "/casino/group/live-casino",
      graphic: <span className="text-3xl">🐉🐯</span>,
      bgGradient: "from-orange-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "extreme-texas-holdem",
      title: "Extreme Texas Hold'em",
      provider: "Evolution Live",
      playersCount: 1120,
      badge: "POKER",
      badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
      href: "/casino/group/live-casino",
      graphic: <span className="text-3xl">🃏🏆</span>,
      bgGradient: "from-indigo-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "bac-bo",
      title: "Bac Bo",
      provider: "Evolution Live",
      playersCount: 980,
      badge: "DICE",
      badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/30",
      href: "/casino/group/live-casino",
      graphic: <span className="text-3xl">🎲🎋</span>,
      bgGradient: "from-teal-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "red-door-roulette",
      title: "Red Door Roulette",
      provider: "Evolution Live",
      playersCount: 1340,
      badge: "KEYS",
      badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
      href: "/casino/group/live-casino",
      graphic: <span className="text-3xl">🚪🔑</span>,
      bgGradient: "from-rose-950/80 via-[#1a2c38] to-[#0f212e]",
    },
  ];

  // 4.5. Evolution Gaming Suite (80 Games strictly ordered by popularity hierarchy)
  const evolutionGames: CasinoCardData[] = EVOLUTION_GAMES.map((game) => ({
    id: game.id,
    title: game.title,
    provider: "Evolution",
    playersCount: game.playersCount,
    badge: game.badge,
    badgeColor: game.badgeColor,
    href: "/casino/live",
    image: game.image,
    bgGradient: game.bgGradient || "from-red-950/80 via-[#1a2c38] to-[#0f212e]",
  }));

  // 4.55. Ezugi Live Casino Suite (35 Games strictly ordered by popularity hierarchy - Task 28)
  const ezugiGames: CasinoCardData[] = EZUGI_GAMES.map((game) => ({
    id: game.id,
    title: game.title,
    provider: "Ezugi",
    playersCount: game.livePlayerCount || game.playersCount,
    badge: game.badge,
    badgeColor: game.badgeColor,
    href: "/casino/live",
    image: game.image,
    bgGradient: game.bgGradient || "from-blue-950/80 via-[#1a2c38] to-[#0f212e]",
  }));


  // 4.61. Pragmatic Play Games (32 Games)
  const pragmaticGames: CasinoCardData[] = PRAGMATIC_GAMES.map((game) => ({
    id: game.id,
    title: game.title,
    provider: "Pragmatic Play",
    playersCount: game.livePlayerCount || game.playersCount,
    badge: game.badge,
    badgeColor: game.badgeColor,
    href: "/casino/group/pragmatic-play",
    image: game.image,
    bgGradient: "from-amber-950/80 via-[#1a2c38] to-[#0f212e]",
  }));

  // 4.62. Hacksaw Gaming (32 Games)
  const hacksawGames: CasinoCardData[] = HACKSAW_GAMES.map((game) => ({
    id: game.id,
    title: game.title,
    provider: "Hacksaw Gaming",
    playersCount: game.livePlayerCount || game.playersCount,
    badge: game.badge,
    badgeColor: game.badgeColor,
    href: "/casino/group/hacksaw-gaming",
    image: game.image,
    bgGradient: "from-blue-950/80 via-[#1a2c38] to-[#0f212e]",
  }));

  // 4.63. 100 HP Gaming (30 Games)
  const hp100Games: CasinoCardData[] = HP100_GAMES.map((game) => ({
    id: game.id,
    title: game.title,
    provider: "100 HP Gaming",
    playersCount: game.livePlayerCount || game.playersCount,
    badge: game.badge,
    badgeColor: game.badgeColor,
    href: "/casino/group/100hp",
    image: game.image,
    bgGradient: "from-red-950/80 via-[#1a2c38] to-[#0f212e]",
  }));

  // 4.64. Spribe Turbo Arcade (30 Games)
  const spribeGames: CasinoCardData[] = SPRIBE_GAMES.map((game) => ({
    id: game.id,
    title: game.title,
    provider: "Spribe",
    playersCount: game.livePlayerCount || game.playersCount,
    badge: game.badge,
    badgeColor: game.badgeColor,
    href: "/casino/group/spribe",
    image: game.image,
    bgGradient: "from-red-950/80 via-[#1a2c38] to-[#0f212e]",
  }));

  // 4.65. SmartSoft Gaming (30 Games)
  const smartsoftGames: CasinoCardData[] = SMARTSOFT_GAMES.map((game) => ({
    id: game.id,
    title: game.title,
    provider: "SmartSoft",
    playersCount: game.livePlayerCount || game.playersCount,
    badge: game.badge,
    badgeColor: game.badgeColor,
    href: "/casino/group/smartsoft",
    image: game.image,
    bgGradient: "from-amber-950/80 via-[#1a2c38] to-[#0f212e]",
  }));

  // 4.66. Jili Games (30 Games)
  const jiliGames: CasinoCardData[] = JILI_GAMES.map((game) => ({
    id: game.id,
    title: game.title,
    provider: "Jili Games",
    playersCount: game.livePlayerCount || game.playersCount,
    badge: game.badge,
    badgeColor: game.badgeColor,
    href: "/casino/group/jili",
    image: game.image,
    bgGradient: "from-yellow-950/80 via-[#1a2c38] to-[#0f212e]",
  }));

  // 4.67. Evoplay (30 Games)
  const evoplayGames: CasinoCardData[] = EVOPLAY_GAMES.map((game) => ({
    id: game.id,
    title: game.title,
    provider: "Evoplay",
    playersCount: game.livePlayerCount || game.playersCount,
    badge: game.badge,
    badgeColor: game.badgeColor,
    href: "/casino/group/evoplay",
    image: game.image,
    bgGradient: "from-emerald-950/80 via-[#1a2c38] to-[#0f212e]",
  }));

  // 4.68. Pragmatic Play Live (30 Games)
  const pragmaticLiveGames: CasinoCardData[] = PRAGMATIC_LIVE_GAMES.map((game) => ({
    id: game.id,
    title: game.title,
    provider: "Pragmatic Play Live",
    playersCount: game.livePlayerCount || game.playersCount,
    badge: game.badge,
    badgeColor: game.badgeColor,
    href: "/casino/group/pragmatic-live",
    image: game.image,
    bgGradient: "from-cyan-950/80 via-[#1a2c38] to-[#0f212e]",
  }));

  // 4.69. Turbo Games (30 Games)
  const turboGames: CasinoCardData[] = TURBOGAMES_GAMES.map((game) => ({
    id: game.id,
    title: game.title,
    provider: "Turbo Games",
    playersCount: game.livePlayerCount || game.playersCount,
    badge: game.badge,
    badgeColor: game.badgeColor,
    href: "/casino/group/turbogames",
    image: game.image,
    bgGradient: "from-orange-950/80 via-[#1a2c38] to-[#0f212e]",
  }));

  // 4.6. INOUT Games (30 Games strictly ordered by player count hierarchy)
  const inoutGames: CasinoCardData[] = INOUT_GAMES.map((game) => ({
    id: game.id,
    title: game.title,
    provider: "INOUT",
    playersCount: game.livePlayerCount || game.playersCount,
    badge: game.badge,
    badgeColor: game.badgeColor,
    href: "/casino/group/inout",
    image: game.image || game.bannerImage,
    bgGradient: game.bgGradient || "from-amber-950/80 via-[#1a2c38] to-[#0f212e]",
  }));

  // 5. Game Shows (9 Games)
  const gameShowsGames: CasinoCardData[] = [
    {
      id: "crazy-time",
      title: "Crazy Time",
      provider: "Evolution",
      playersCount: 5890,
      badge: "HOT",
      badgeColor: "bg-red-500/20 text-red-300 border-red-500/30",
      href: "/casino/group/game-shows",
      graphic: <span className="text-3xl">🎡🎉</span>,
      bgGradient: "from-red-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "monopoly-live",
      title: "Monopoly Live",
      provider: "Evolution",
      playersCount: 3210,
      badge: "3D ROLLS",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      href: "/casino/group/game-shows",
      graphic: <span className="text-3xl">🎩🎲</span>,
      bgGradient: "from-amber-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "funky-time",
      title: "Funky Time",
      provider: "Evolution",
      playersCount: 2840,
      badge: "DISCO",
      badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/30",
      href: "/casino/group/game-shows",
      graphic: <span className="text-3xl">🪩🕺</span>,
      bgGradient: "from-pink-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "mega-ball",
      title: "Mega Ball",
      provider: "Evolution",
      playersCount: 1920,
      badge: "100X MULTI",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      href: "/casino/group/game-shows",
      graphic: <span className="text-3xl">🎱💰</span>,
      bgGradient: "from-emerald-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "crazy-coin-flip",
      title: "Crazy Coin Flip",
      provider: "Evolution",
      playersCount: 1680,
      badge: "SLOT SHOW",
      badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      href: "/casino/group/game-shows",
      graphic: <span className="text-3xl">🪙✨</span>,
      bgGradient: "from-yellow-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "crazy-pachinko",
      title: "Crazy Pachinko",
      provider: "Evolution",
      playersCount: 2140,
      badge: "DROP BALL",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      href: "/casino/group/game-shows",
      graphic: <span className="text-3xl">🔮🎯</span>,
      bgGradient: "from-purple-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "monopoly-big-baller",
      title: "Monopoly Big Baller",
      provider: "Evolution",
      playersCount: 1820,
      badge: "BINGO",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      href: "/casino/group/game-shows",
      graphic: <span className="text-3xl">🚢🎩</span>,
      bgGradient: "from-blue-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "stock-market",
      title: "Stock Market",
      provider: "Evolution",
      playersCount: 1450,
      badge: "TRADING",
      badgeColor: "bg-[#00e701]/20 text-[#00e701] border-[#00e701]/30",
      href: "/casino/group/game-shows",
      graphic: <span className="text-3xl">📈💹</span>,
      bgGradient: "from-emerald-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "lightning-dice",
      title: "Lightning Dice",
      provider: "Evolution",
      playersCount: 1210,
      badge: "1,000X",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      href: "/casino/group/game-shows",
      graphic: <span className="text-3xl">⚡🎲</span>,
      bgGradient: "from-amber-950/80 via-[#1a2c38] to-[#0f212e]",
    },
  ];

  // 6. Featured Publishers (9 Studios - Task 19: High-contrast white brand typography)
  const featuredPublishers: CasinoCardData[] = [
    {
      id: "fpub-evoslot",
      title: "evoslot",
      provider: "Featured Studio",
      playersCount: 3820,
      badge: "FEATURED",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      graphic: <span className="font-black text-xs sm:text-sm tracking-wider text-white">EVOSLOT</span>,
      bgGradient: "from-purple-950 via-[#1a2c38] to-[#0f212e]",
      isPublisherCard: true,
      href: "/casino/collection/providers",
    },
    {
      id: "fpub-no2ap",
      title: "NO2AP LABS",
      provider: "Experimental Studio",
      playersCount: 2940,
      badge: "STUDIO",
      badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/30",
      graphic: <span className="font-mono font-black text-xs sm:text-sm tracking-wider text-white">NO2AP LABS</span>,
      bgGradient: "from-teal-950 via-[#1a2c38] to-[#0f212e]",
      isPublisherCard: true,
      href: "/casino/collection/providers",
    },
    {
      id: "fpub-ovryx",
      title: "OVRYX",
      provider: "Next-Gen Gaming",
      playersCount: 4120,
      badge: "NEW STUDIO",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      graphic: <span className="font-black text-xs sm:text-sm tracking-wider text-white">OVRYX</span>,
      bgGradient: "from-blue-950 via-[#1a2c38] to-[#0f212e]",
      isPublisherCard: true,
      href: "/casino/collection/providers",
    },
    {
      id: "fpub-titan",
      title: "TITAN GAMING",
      provider: "High-Roller Studio",
      playersCount: 2540,
      badge: "HIGH VOL",
      badgeColor: "bg-red-500/20 text-red-300 border-red-500/30",
      graphic: <span className="font-black text-xs sm:text-sm tracking-wider text-white">TITAN GAMING</span>,
      bgGradient: "from-red-950 via-[#1a2c38] to-[#0f212e]",
      isPublisherCard: true,
      href: "/casino/collection/providers",
    },
    {
      id: "fpub-apex",
      title: "APEX LABS",
      provider: "Multiplier Studio",
      playersCount: 3110,
      badge: "TOP MATH",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      graphic: <span className="font-black text-xs sm:text-sm tracking-wider text-white">APEX LABS</span>,
      bgGradient: "from-amber-950 via-[#1a2c38] to-[#0f212e]",
      isPublisherCard: true,
      href: "/casino/collection/providers",
    },
    {
      id: "fpub-spinpulse",
      title: "SPINPULSE",
      provider: "Action Slots",
      playersCount: 2780,
      badge: "FAST SPIN",
      badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/30",
      graphic: <span className="font-black text-xs sm:text-sm tracking-wider text-white">SPINPULSE</span>,
      bgGradient: "from-pink-950 via-[#1a2c38] to-[#0f212e]",
      isPublisherCard: true,
      href: "/casino/collection/providers",
    },
    {
      id: "fpub-volt",
      title: "VOLT PLAY",
      provider: "Lightning Games",
      playersCount: 1980,
      badge: "TURBO",
      badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      graphic: <span className="font-black text-xs sm:text-sm tracking-wider text-white">VOLT PLAY</span>,
      bgGradient: "from-yellow-950 via-[#1a2c38] to-[#0f212e]",
      isPublisherCard: true,
      href: "/casino/collection/providers",
    },
    {
      id: "fpub-quant",
      title: "QUANTUM REELS",
      provider: "Next-Gen Math",
      playersCount: 2350,
      badge: "CASCADE",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      graphic: <span className="font-black text-xs sm:text-sm tracking-wider text-white">QUANTUM REELS</span>,
      bgGradient: "from-cyan-950 via-[#1a2c38] to-[#0f212e]",
      isPublisherCard: true,
      href: "/casino/collection/providers",
    },
    {
      id: "fpub-hyper",
      title: "HYPER X",
      provider: "Extreme Volatility",
      playersCount: 3450,
      badge: "XTREME",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      graphic: <span className="font-black text-xs sm:text-sm tracking-wider text-white">HYPER X</span>,
      bgGradient: "from-emerald-950 via-[#1a2c38] to-[#0f212e]",
      isPublisherCard: true,
      href: "/casino/collection/providers",
    },
    {
      id: "fpub-octoplay",
      title: "Octoplay",
      provider: "Smash Games",
      playersCount: 2890,
      badge: "SMASH",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      graphic: <span className="font-black text-xs sm:text-sm tracking-wider text-white">OCTOPLAY</span>,
      bgGradient: "from-purple-950 via-[#1a2c38] to-[#0f212e]",
      isPublisherCard: true,
      href: "/casino/collection/providers",
    },
    {
      id: "fpub-print",
      title: "Print Studios",
      provider: "Craft Studios",
      playersCount: 2150,
      badge: "BOARDS",
      badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/30",
      graphic: <span className="font-black text-xs sm:text-sm tracking-wider text-white">PRINT STUDIOS</span>,
      bgGradient: "from-orange-950 via-[#1a2c38] to-[#0f212e]",
      isPublisherCard: true,
      href: "/casino/collection/providers",
    },
    {
      id: "fpub-slotmill",
      title: "Slotmill",
      provider: "Fast Burst",
      playersCount: 1780,
      badge: "BURST",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      graphic: <span className="font-black text-xs sm:text-sm tracking-wider text-white">SLOTMILL</span>,
      bgGradient: "from-cyan-950 via-[#1a2c38] to-[#0f212e]",
      isPublisherCard: true,
      href: "/casino/collection/providers",
    },
    {
      id: "fpub-avatarux",
      title: "AvatarUX",
      provider: "PopWins Studio",
      playersCount: 3120,
      badge: "POPWINS",
      badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/30",
      graphic: <span className="font-black text-xs sm:text-sm tracking-wider text-white">AVATARUX</span>,
      bgGradient: "from-pink-950 via-[#1a2c38] to-[#0f212e]",
      isPublisherCard: true,
      href: "/casino/collection/providers",
    },
    {
      id: "fpub-peter",
      title: "Peter & Sons",
      provider: "Artisan Studio",
      playersCount: 1940,
      badge: "ARTISAN",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      graphic: <span className="font-black text-xs sm:text-sm tracking-wider text-white">PETER & SONS</span>,
      bgGradient: "from-amber-950 via-[#1a2c38] to-[#0f212e]",
      isPublisherCard: true,
      href: "/casino/collection/providers",
    },
    {
      id: "fpub-fourleaf",
      title: "Four Leaf Gaming",
      provider: "Nitro Spins",
      playersCount: 1650,
      badge: "NITRO",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      graphic: <span className="font-black text-xs sm:text-sm tracking-wider text-white">FOUR LEAF</span>,
      bgGradient: "from-emerald-950 via-[#1a2c38] to-[#0f212e]",
      isPublisherCard: true,
      href: "/casino/collection/providers",
    },
    {
      id: "fpub-blueguru",
      title: "Blue Guru Games",
      provider: "Story Slots",
      playersCount: 1420,
      badge: "STORY",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      graphic: <span className="font-black text-xs sm:text-sm tracking-wider text-white">BLUE GURU</span>,
      bgGradient: "from-blue-950 via-[#1a2c38] to-[#0f212e]",
      isPublisherCard: true,
      href: "/casino/collection/providers",
    },
    {
      id: "fpub-fantasma",
      title: "Fantasma Games",
      provider: "Next Era",
      playersCount: 2210,
      badge: "NEXT GEN",
      badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/30",
      graphic: <span className="font-black text-xs sm:text-sm tracking-wider text-white">FANTASMA</span>,
      bgGradient: "from-teal-950 via-[#1a2c38] to-[#0f212e]",
      isPublisherCard: true,
      href: "/casino/collection/providers",
    },
    {
      id: "fpub-bullshark",
      title: "Bullshark Games",
      provider: "Action Play",
      playersCount: 1890,
      badge: "ACTION",
      badgeColor: "bg-red-500/20 text-red-300 border-red-500/30",
      graphic: <span className="font-black text-xs sm:text-sm tracking-wider text-white">BULLSHARK</span>,
      bgGradient: "from-red-950 via-[#1a2c38] to-[#0f212e]",
      isPublisherCard: true,
      href: "/casino/collection/providers",
    },
  ];

  // 7. Only on Stake with '2x VIP' badge (9 Games)
  const onlyOnStakeGames: CasinoCardData[] = [
    {
      id: "sharks",
      title: "Sharks!",
      provider: "Push Gaming",
      playersCount: 1840,
      badge: "2X VIP",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-400/40",
      graphic: <span className="text-3xl">🦈🌊</span>,
      bgGradient: "from-cyan-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "wicked-grin",
      title: "Wicked Grin",
      provider: "Only on Stake",
      playersCount: 920,
      badge: "2X VIP",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-400/40",
      graphic: <span className="text-3xl">😈🎃</span>,
      bgGradient: "from-purple-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "tongue",
      title: "Tongue",
      provider: "Only on Stake",
      playersCount: 760,
      badge: "2X VIP",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-400/40",
      graphic: <span className="text-3xl">👅🍬</span>,
      bgGradient: "from-pink-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "toon-sailor",
      title: "Toon Sailor",
      provider: "Only on Stake",
      playersCount: 680,
      badge: "2X VIP",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-400/40",
      graphic: <span className="text-3xl">⚓⛵</span>,
      bgGradient: "from-sky-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "dracs-stacks",
      title: "Dracs Stacks",
      provider: "Only on Stake",
      playersCount: 850,
      badge: "2X VIP",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-400/40",
      graphic: <span className="text-3xl">🧛‍♂️🏰</span>,
      bgGradient: "from-purple-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "nuukd",
      title: "Nuukd",
      provider: "Only on Stake",
      playersCount: 910,
      badge: "2X VIP",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-400/40",
      graphic: <span className="text-3xl">☣️⚡</span>,
      bgGradient: "from-yellow-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "skyscraper-crash",
      title: "Skyscraper Crash",
      provider: "Only on Stake",
      playersCount: 1120,
      badge: "2X VIP",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-400/40",
      graphic: <span className="text-3xl">🏙️💥</span>,
      bgGradient: "from-amber-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "waylanders-forge",
      title: "Waylanders Forge",
      provider: "Only on Stake",
      playersCount: 1040,
      badge: "2X VIP",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-400/40",
      graphic: <span className="text-3xl">⚔️🔥</span>,
      bgGradient: "from-emerald-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "odins-vault",
      title: "Odins Vault",
      provider: "Only on Stake",
      playersCount: 880,
      badge: "2X VIP",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-400/40",
      graphic: <span className="text-3xl">🛡️⚡</span>,
      bgGradient: "from-blue-950/80 via-[#1a2c38] to-[#0f212e]",
    },
  ];

  // 8. Burst Games (9 Games)
  const burstGames: CasinoCardData[] = [
    {
      id: "aviator",
      title: "Aviator",
      provider: "Spribe",
      playersCount: 3840,
      badge: "BURST",
      badgeColor: "bg-red-500/20 text-red-300 border-red-500/30",
      href: "/games/crash",
      graphic: <span className="text-3xl">✈️💨</span>,
      bgGradient: "from-red-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "mine-drop-2",
      title: "Mine Drop 2",
      provider: "Stake Originals",
      playersCount: 1940,
      badge: "BURST",
      badgeColor: "bg-[#00e701]/20 text-[#00e701] border-[#00e701]/30",
      href: "/games/mines",
      graphic: <span className="text-3xl">💣💎</span>,
      bgGradient: "from-emerald-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "jetx",
      title: "JetX",
      provider: "SmartSoft",
      playersCount: 2210,
      badge: "BURST",
      badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      href: "/games/crash",
      graphic: <span className="text-3xl">🛩️⚡</span>,
      bgGradient: "from-yellow-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "crash",
      title: "Crash",
      provider: "Stake Originals",
      playersCount: 5120,
      badge: "BURST",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      href: "/games/crash",
      graphic: <span className="text-3xl">🚀📈</span>,
      bgGradient: "from-amber-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "spaceman",
      title: "Spaceman",
      provider: "Pragmatic Play",
      playersCount: 2450,
      badge: "BURST",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      href: "/games/crash",
      graphic: <span className="text-3xl">👨‍🚀🌌</span>,
      bgGradient: "from-blue-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "high-flyer",
      title: "High Flyer",
      provider: "Pragmatic Play",
      playersCount: 1320,
      badge: "BURST",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      href: "/games/crash",
      graphic: <span className="text-3xl">🎈☁️</span>,
      bgGradient: "from-purple-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "balloon",
      title: "Balloon",
      provider: "SmartSoft",
      playersCount: 1490,
      badge: "BURST",
      badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/30",
      href: "/games/crash",
      graphic: <span className="text-3xl">🎈💥</span>,
      bgGradient: "from-pink-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "comet-crash",
      title: "Comet Crash",
      provider: "Spribe",
      playersCount: 1680,
      badge: "BURST",
      badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/30",
      href: "/games/crash",
      graphic: <span className="text-3xl">☄️🔥</span>,
      bgGradient: "from-orange-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "rocket-dice",
      title: "Rocket Dice",
      provider: "Stake Originals",
      playersCount: 1120,
      badge: "BURST",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      href: "/games/dice",
      graphic: <span className="text-3xl">🚀🎲</span>,
      bgGradient: "from-emerald-950/80 via-[#1a2c38] to-[#0f212e]",
    },
  ];

  // 9. New Releases (9 Games)
  const newReleasesGames: CasinoCardData[] = [
    {
      id: "gates-olympus-2500",
      title: "Gates of Olympus 2500",
      provider: "Pragmatic Play",
      playersCount: 2950,
      badge: "NEW",
      badgeColor: "bg-[#00e701]/20 text-[#00e701] border-[#00e701]/30",
      graphic: <span className="text-3xl">⚡🏺</span>,
      bgGradient: "from-amber-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "zombie-academy",
      title: "Zombie Academy Megaways",
      provider: "Iron Dog",
      playersCount: 1220,
      badge: "NEW",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      graphic: <span className="text-3xl">🧟‍♂️🏫</span>,
      bgGradient: "from-purple-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "dork-show",
      title: "Dork Show",
      provider: "Hacksaw Gaming",
      playersCount: 1480,
      badge: "NEW",
      badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/30",
      graphic: <span className="text-3xl">🤡🎪</span>,
      bgGradient: "from-pink-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "big-bass-vegas-1000",
      title: "Big Bass Vegas 1000",
      provider: "Pragmatic Play",
      playersCount: 2150,
      badge: "NEW",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      graphic: <span className="text-3xl">🐟🎰</span>,
      bgGradient: "from-cyan-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "super-scatter-olympus",
      title: "Super Scatter Olympus",
      provider: "Pragmatic Play",
      playersCount: 1870,
      badge: "NEW",
      badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      graphic: <span className="text-3xl">⚡✨</span>,
      bgGradient: "from-yellow-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "blind-viking",
      title: "Blind Viking",
      provider: "NoLimit City",
      playersCount: 1640,
      badge: "NEW",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      graphic: <span className="text-3xl">🛡️🪓</span>,
      bgGradient: "from-blue-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "hot-chili-chica",
      title: "Hot Chili Chica",
      provider: "Stake Exclusive",
      playersCount: 2310,
      badge: "NEW",
      badgeColor: "bg-red-500/20 text-red-300 border-red-500/30",
      graphic: <span className="text-3xl">🌶️🔥</span>,
      bgGradient: "from-red-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "moles-gone-wild",
      title: "Moles Gone Wild",
      provider: "Hacksaw Gaming",
      playersCount: 1780,
      badge: "NEW",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      graphic: <span className="text-3xl">🦔💰</span>,
      bgGradient: "from-amber-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "rotten",
      title: "Rotten",
      provider: "Hacksaw Gaming",
      playersCount: 1520,
      badge: "NEW",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      graphic: <span className="text-3xl">🧟☣️</span>,
      bgGradient: "from-emerald-950/80 via-[#1a2c38] to-[#0f212e]",
    },
  ];

  // Handle slot card clicks to open demo spin modal
  const handleCardClick = (card: CasinoCardData) => {
    if (card.href) return;
    setActiveSlotModal(card);
  };

  const spinSlotDemo = (game: CasinoCardData) => {
    if (isSpinningSlot) return;
    if (slotBet > balance) {
      alert("Insufficient demo balance! Please reset via the balance dropdown.");
      return;
    }
    if (slotBet <= 0) return;

    updateBalance(-slotBet);
    setIsSpinningSlot(true);
    setSlotLastWin(null);
    sounds.playDiceRoll();

    const pool = ["💎", "⚡", "👑", "⭐", "🏺", "🍒"];

    let count = 0;
    const interval = setInterval(() => {
      setSlotReels([
        Array.from({ length: 5 }, () => pool[Math.floor(Math.random() * pool.length)]),
        Array.from({ length: 5 }, () => pool[Math.floor(Math.random() * pool.length)]),
        Array.from({ length: 5 }, () => pool[Math.floor(Math.random() * pool.length)]),
      ]);
      count++;
      if (count >= 7) {
        clearInterval(interval);
        setIsSpinningSlot(false);

        const isWin = Math.random() > 0.45;
        if (isWin) {
          const mult = parseFloat((Math.random() * 8 + 1.5).toFixed(2));
          const payout = parseFloat((slotBet * mult).toFixed(2));
          updateBalance(payout);
          setSlotLastWin(payout);
          sounds.playDiceWin();

          if (mult >= 5) {
            try {
              confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
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
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 space-y-6 select-none">
      {/* 1. TOP PROMOTIONAL HERO BANNER CAROUSEL */}
      <CasinoPromoCarousel />

      {/* 2. AUTHENTIC BOLD SEARCH BAR */}
      <div className="relative w-full my-3 flex items-center border-2 border-[#2f4553] focus-within:border-[#557086] bg-[#0f212e] rounded-xl shadow-md transition-colors px-4 py-2 sm:py-2.5">
        <Search className="stroke-[2.5] text-white w-4 h-4 shrink-0 mr-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Stake.com"
          className="font-bold text-white placeholder:font-semibold placeholder-[#b1bad3] tracking-wide text-sm sm:text-base outline-none bg-transparent w-full"
        />
        {searchQuery.trim().length > 0 && (
          <button
            onClick={() => setSearchQuery("")}
            className="p-1 text-[#b1bad3] hover:text-white transition-colors cursor-pointer ml-2"
            title="Clear Search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isSearching ? (
        /* DYNAMIC LIVE SEARCH RESULTS VIEW */
        <section className="space-y-4 my-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Search className="h-4 w-4 text-[#00e701]" />
              <span>
                Search Results for &quot;{searchQuery}&quot; ({searchResults.length} {searchResults.length === 1 ? "game" : "games"} found)
              </span>
            </h2>
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs font-bold text-[#b1bad3] hover:text-white px-2.5 py-1 rounded-lg bg-[#213743] hover:bg-[#2a4454] transition-colors cursor-pointer"
            >
              Clear Search
            </button>
          </div>

          {searchResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl bg-[#14232d] border border-[#213743] text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#213743] flex items-center justify-center text-[#b1bad3]">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                No games found for &quot;{searchQuery}&quot;
              </h3>
              <p className="text-xs sm:text-sm text-[#b1bad3] max-w-sm">
                Try searching with another keyword, provider (e.g. Pragmatic, Evolution, INOUT, Hacksaw), or category.
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-2 px-4 py-2 rounded-xl bg-[#00e701] text-[#0f212e] font-black text-xs sm:text-sm hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-[#00e701]/20"
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
                  <div
                    key={game.id}
                    onClick={() => {
                      if (!game.href) {
                        handleCardClick({
                          id: game.id,
                          title: game.title,
                          provider: game.provider,
                          playersCount: game.playersCount,
                          badge: game.badge,
                          badgeColor: game.badgeColor,
                          image: thumb,
                        });
                      }
                    }}
                    className="group relative flex flex-col select-none cursor-pointer"
                  >
                    <Link href={gameHref} className="block">
                      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-[#1a2c38] border border-[#213743] hover:border-[#2f4553] transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={game.title}
                            className="w-full h-full object-cover object-center rounded-xl"
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
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00e701] text-[#0f212e] shadow-lg shadow-[#00e701]/40 transform scale-75 group-hover:scale-100 transition-transform">
                            <Play className="h-4 w-4 fill-current ml-0.5" />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col mt-1.5 px-0.5">
                        <span className="font-black uppercase tracking-wider text-xs sm:text-sm text-white truncate">
                          {game.title}
                        </span>
                        <span className="text-[9px] sm:text-[10px] uppercase font-bold text-white/70 truncate">
                          {game.provider}
                        </span>
                        <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5 text-[10px] sm:text-xs font-semibold text-[#b1bad3] truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00e701] shadow-[0_0_6px_#00e701] animate-pulse shrink-0" />
                          <span className="truncate">{(game.playersCount || 1250).toLocaleString("en-US")} playing</span>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ) : (
        <>
          {/* 3. HORIZONTAL CATEGORY NAVIGATION PILLS: [Casino Home | My Casino | Favorites] */}
          <CasinoCategoryPills
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />

      {/* 4. STAKE ORIGINALS > */}
      <CasinoGameRow
        title="Stake Originals"
        linkHref="/casino/group/stake-originals"
        cards={stakeOriginals}
        onCardClick={handleCardClick}
        sectionId="stake-originals"
      />

      {/* 5. SLOTS > */}
      <CasinoGameRow
        title="Slots"
        linkHref="/casino/group/slots"
        cards={slotsGames}
        onCardClick={handleCardClick}
        sectionId="slots"
      />

      {/* 6. PUBLISHERS > (Stake, Pragmatic Play, Hacksaw Gaming...) */}
      <CasinoGameRow
        title="Publishers"
        linkHref="/casino/collection/providers"
        cards={publishers}
        onCardClick={handleCardClick}
        sectionId="publishers"
      />

      {/* 7. LIVE CASINO > */}
      <CasinoGameRow
        title="Live Casino"
        linkHref="/casino/group/live-casino"
        cards={liveCasinoGames}
        onCardClick={handleCardClick}
        sectionId="live-casino"
      />

      {/* 7.5. EVOLUTION > */}
      <CasinoGameRow
        title="Evolution"
        linkHref="/casino/group/evolution"
        cards={evolutionGames}
        onCardClick={handleCardClick}
        sectionId="evolution"
      />

      {/* 7.55. EZUGI > (Directly below Evolution - Task 28) */}
      <CasinoGameRow
        title="Ezugi"
        linkHref="/casino/group/ezugi"
        cards={ezugiGames}
        onCardClick={handleCardClick}
        sectionId="ezugi"
      />

      {/* 7.6. INOUT GAMES > */}
      <CasinoGameRow
        title="INOUT Games"
        linkHref="/casino/group/inout"
        cards={inoutGames}
        onCardClick={handleCardClick}
        sectionId="inout-games"
      />


      {/* 7.61. PRAGMATIC PLAY > */}
      <CasinoGameRow
        title="Pragmatic Play"
        linkHref="/casino/group/pragmatic-play"
        cards={pragmaticGames}
        onCardClick={handleCardClick}
        sectionId="pragmatic-play"
      />

      {/* 7.62. HACKSAW GAMING > */}
      <CasinoGameRow
        title="Hacksaw Gaming"
        linkHref="/casino/group/hacksaw-gaming"
        cards={hacksawGames}
        onCardClick={handleCardClick}
        sectionId="hacksaw-gaming"
      />

      {/* 7.63. 100 HP GAMING > */}
      <CasinoGameRow
        title="100 HP Gaming"
        linkHref="/casino/group/100hp"
        cards={hp100Games}
        onCardClick={handleCardClick}
        sectionId="100hp"
      />

      {/* 7.64. SPRIBE > */}
      <CasinoGameRow
        title="Spribe"
        linkHref="/casino/group/spribe"
        cards={spribeGames}
        onCardClick={handleCardClick}
        sectionId="spribe"
      />

      {/* 7.65. SMARTSOFT > */}
      <CasinoGameRow
        title="SmartSoft"
        linkHref="/casino/group/smartsoft"
        cards={smartsoftGames}
        onCardClick={handleCardClick}
        sectionId="smartsoft"
      />

      {/* 7.66. JILI GAMES > */}
      <CasinoGameRow
        title="Jili Games"
        linkHref="/casino/group/jili"
        cards={jiliGames}
        onCardClick={handleCardClick}
        sectionId="jili"
      />

      {/* 7.67. EVOPLAY > */}
      <CasinoGameRow
        title="Evoplay"
        linkHref="/casino/group/evoplay"
        cards={evoplayGames}
        onCardClick={handleCardClick}
        sectionId="evoplay"
      />

      {/* 7.68. PRAGMATIC PLAY LIVE > */}
      <CasinoGameRow
        title="Pragmatic Play Live"
        linkHref="/casino/group/pragmatic-live"
        cards={pragmaticLiveGames}
        onCardClick={handleCardClick}
        sectionId="pragmatic-live"
      />

      {/* 7.69. TURBO GAMES > */}
      <CasinoGameRow
        title="Turbo Games"
        linkHref="/casino/group/turbogames"
        cards={turboGames}
        onCardClick={handleCardClick}
        sectionId="turbogames"
      />

      {/* 8. GAME SHOWS > */}
      <CasinoGameRow
        title="Game Shows"
        linkHref="/casino/group/game-shows"
        cards={gameShowsGames}
        onCardClick={handleCardClick}
        sectionId="game-shows"
      />

      {/* 9. FEATURED PUBLISHERS > */}
      <CasinoGameRow
        title="Featured Publishers"
        linkHref="/casino/collection/providers"
        cards={featuredPublishers}
        onCardClick={handleCardClick}
        sectionId="featured-publishers"
      />

      {/* 10. ONLY ON STAKE > with '2x VIP' cyan badge */}
      <CasinoGameRow
        title="Only on Stake"
        linkHref="/casino/group/stake-originals"
        rowBadge="2x VIP"
        cards={onlyOnStakeGames}
        onCardClick={handleCardClick}
        sectionId="only-on-stake"
      />

      {/* 11. BURST GAMES > (Aviator, Mine Drop 2, JetX...) */}
      <CasinoGameRow
        title="Burst Games"
        linkHref="#burst-games"
        cards={burstGames}
        onCardClick={handleCardClick}
        sectionId="burst-games"
      />

      {/* 12. NEW RELEASES > */}
      <CasinoGameRow
        title="New Releases"
        linkHref="#new-releases"
        cards={newReleasesGames}
        onCardClick={handleCardClick}
        sectionId="new-releases"
      />

      {/* 13. BETS FEED TICKER: Tabs for [ My Bets | All Bets | High Rollers ] + Live Table (Game | Payout) */}
      <CasinoLiveBets />
        </>
      )}

      {/* INTERACTIVE SLOT DEMO PLAYER MODAL */}
      {activeSlotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-2xl border border-[#213743] bg-[#1a2c38] shadow-2xl overflow-hidden space-y-4">
            <div className="flex items-center justify-between border-b border-[#213743] p-4 bg-[#14232f]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 font-bold">
                  🎰
                </div>
                <div>
                  <h3 className="text-base font-black text-white">{activeSlotModal.title}</h3>
                  <p className="text-xs text-[#b1bad3]">{activeSlotModal.provider || "Stake Verified"}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveSlotModal(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#b1bad3] hover:bg-[#213743] hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 bg-[#0f212e] mx-4 rounded-xl border border-[#213743] flex flex-col items-center space-y-4 shadow-inner">
              <div className="text-xs font-bold text-[#b1bad3] uppercase tracking-wider">
                5-Reel Tumble Grid Demo
              </div>

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

              {slotLastWin !== null && (
                <div className="text-center font-mono animate-in zoom-in-95 duration-150">
                  {slotLastWin > 0 ? (
                    <span className="text-[#00e701] font-extrabold text-base sm:text-lg">
                      WIN +₹{slotLastWin.toFixed(2)}!
                    </span>
                  ) : (
                    <span className="text-[#b1bad3] text-sm">No win this spin</span>
                  )}
                </div>
              )}

              <div className="w-full flex items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#b1bad3]">Bet:</span>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={slotBet}
                    onChange={(e) => setSlotBet(Math.max(1, Number(e.target.value)))}
                    className="w-20 rounded-lg bg-[#14232f] border border-[#213743] px-2 py-1 text-sm font-bold text-white text-center focus:border-[#00e701] outline-none"
                  />
                </div>

                <button
                  onClick={() => spinSlotDemo(activeSlotModal)}
                  disabled={isSpinningSlot}
                  className="rounded-xl bg-[#00e701] hover:bg-[#00c701] disabled:opacity-50 text-[#0f212e] font-black text-sm px-6 py-2.5 shadow-lg shadow-[#00e701]/25 transition-transform active:scale-95 cursor-pointer"
                >
                  {isSpinningSlot ? "Spinning..." : "SPIN"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
