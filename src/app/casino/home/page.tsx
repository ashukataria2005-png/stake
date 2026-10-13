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
  PRAGMATIC_GAMES,
  HACKSAW_GAMES,
  GameItem,
  masterGameMap,
  getGameItem,
} from "@/data/stakeGames";
import { CASINO_LAYOUT_CATEGORIES, CASINO_LOBBY_CATEGORIES } from "@/config/casinoLayoutConfig";
import { getGameThumbnail } from "@/data/gameThumbnails";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";
import {
  StakeProviderLogo,
  PragmaticPlayLogo,
  StakeEngineLogo,
  EvolutionLogo,
  HacksawGamingLogo,
  ValkyrieLogo,
  PaperclipGamingLogo,
  NolimitCityLogo,
  DonutGamingLogo,
  ColorfulPlayLogo,
  PGSoftLogo,
  SpribeLogo,
  TwistGamingLogo,
  UppercutGamingLogo,
  PlayngoLogo,
  PocketPlayLogo,
  GamesGlobalLogo,
  BGamingLogo,
  DegenLabLogo,
  HyperPlayLogo,
  SmartSoftLogo,
} from "@/components/casino/ProviderLogos";

export default function CasinoHomePage() {
  const { balance, updateBalance, currency, openGamePreview } = useGame();
  const [activeCategory, setActiveCategory] = useState<string>("home");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Real-time instant search across ALL_GAMES strictly matching (title, name, slug, provider)
  const isSearching = searchQuery.trim().length > 0;
  const searchResults: GameItem[] = isSearching
    ? ALL_GAMES.filter((g) => {
      const q = searchQuery.trim().toLowerCase();
      return (
        g.title.toLowerCase().includes(q) ||
        (g.name && g.name.toLowerCase().includes(q)) ||
        g.slug.toLowerCase().includes(q) ||
        (g.provider && g.provider.toLowerCase().includes(q))
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

  // 3. Publishers (Exact 1:1 Stake Providers with Real Vector SVGs & Active Player Counts)
  const publishers: CasinoCardData[] = [
    {
      id: "pub-stake",
      title: "Stake",
      provider: "Stake Originals",
      graphic: <StakeProviderLogo />,
      isPublisherCard: true,
      playersCount: 48920,
      href: "/casino/group/stake-originals",
    },
    {
      id: "pub-pragmatic",
      title: "Pragmatic Play",
      provider: "Pragmatic Play",
      graphic: <PragmaticPlayLogo />,
      isPublisherCard: true,
      playersCount: 38400,
      href: "/casino/group/pragmatic-play",
    },
    {
      id: "pub-stake-engine",
      title: "Stake Engine",
      provider: "Stake Engine",
      graphic: <StakeEngineLogo />,
      isPublisherCard: true,
      playersCount: 19450,
      href: "/casino/group/stake-originals",
    },
    {
      id: "pub-evolution",
      title: "Evolution",
      provider: "Evolution",
      graphic: <EvolutionLogo />,
      isPublisherCard: true,
      playersCount: 31200,
      href: "/casino/group/live-casino",
    },
    {
      id: "pub-hacksaw",
      title: "Hacksaw Gaming",
      provider: "Hacksaw Gaming",
      graphic: <HacksawGamingLogo />,
      isPublisherCard: true,
      playersCount: 22840,
      href: "/casino/group/hacksaw-gaming",
    },
    {
      id: "pub-valkyrie",
      title: "Valkyrie",
      provider: "Valkyrie",
      graphic: <ValkyrieLogo />,
      isPublisherCard: true,
      playersCount: 16210,
      href: "/casino/collection/providers",
    },
    {
      id: "pub-paperclip",
      title: "Paperclip Gaming",
      provider: "Paperclip Gaming",
      graphic: <PaperclipGamingLogo />,
      isPublisherCard: true,
      playersCount: 12480,
      href: "/casino/collection/providers",
    },
    {
      id: "pub-nolimit",
      title: "Nolimit City",
      provider: "Nolimit City",
      graphic: <NolimitCityLogo />,
      isPublisherCard: true,
      playersCount: 14800,
      href: "/casino/collection/providers",
    },
    {
      id: "pub-donut",
      title: "Donut Gaming",
      provider: "Donut Gaming",
      graphic: <DonutGamingLogo />,
      isPublisherCard: true,
      playersCount: 9830,
      href: "/casino/collection/providers",
    },
    {
      id: "pub-colorful",
      title: "Colorful Play",
      provider: "Colorful Play",
      graphic: <ColorfulPlayLogo />,
      isPublisherCard: true,
      playersCount: 8410,
      href: "/casino/collection/providers",
    },
    {
      id: "pub-pgsoft",
      title: "PG Soft",
      provider: "Pocket Games Soft",
      graphic: <PGSoftLogo />,
      isPublisherCard: true,
      playersCount: 18720,
      href: "/casino/collection/providers",
    },
    {
      id: "pub-spribe",
      title: "Spribe",
      provider: "Spribe",
      graphic: <SpribeLogo />,
      isPublisherCard: true,
      playersCount: 38400,
      href: "/casino/group/spribe",
    },
    {
      id: "pub-twist",
      title: "Twist Gaming",
      provider: "Twist Gaming",
      graphic: <TwistGamingLogo />,
      isPublisherCard: true,
      playersCount: 11240,
      href: "/casino/collection/providers",
    },
    {
      id: "pub-uppercut",
      title: "Uppercut Gaming",
      provider: "Uppercut Gaming",
      graphic: <UppercutGamingLogo />,
      isPublisherCard: true,
      playersCount: 7920,
      href: "/casino/collection/providers",
    },
    {
      id: "pub-playngo",
      title: "Play'n GO",
      provider: "Play'n GO",
      graphic: <PlayngoLogo />,
      isPublisherCard: true,
      playersCount: 26400,
      href: "/casino/collection/providers",
    },
    {
      id: "pub-pocketplay",
      title: "Pocket Play",
      provider: "Pocket Play",
      graphic: <PocketPlayLogo />,
      isPublisherCard: true,
      playersCount: 6850,
      href: "/casino/collection/providers",
    },
    {
      id: "pub-gamesglobal",
      title: "Games Global",
      provider: "Games Global",
      graphic: <GamesGlobalLogo />,
      isPublisherCard: true,
      playersCount: 15300,
      href: "/casino/collection/providers",
    },
    {
      id: "pub-bgaming",
      title: "BGaming",
      provider: "BGaming",
      graphic: <BGamingLogo />,
      isPublisherCard: true,
      playersCount: 11600,
      href: "/casino/collection/providers",
    },
    {
      id: "pub-degenlab",
      title: "Degen Lab",
      provider: "Degen Lab",
      graphic: <DegenLabLogo />,
      isPublisherCard: true,
      playersCount: 9410,
      href: "/casino/collection/providers",
    },
    {
      id: "pub-hyperplay",
      title: "Hyper Play",
      provider: "Hyper Play",
      graphic: <HyperPlayLogo />,
      isPublisherCard: true,
      playersCount: 13750,
      href: "/casino/collection/providers",
    },
    {
      id: "pub-smartsoft",
      title: "SmartSoft",
      provider: "SmartSoft",
      graphic: <SmartSoftLogo />,
      isPublisherCard: true,
      playersCount: 29800,
      href: "/casino/group/turbogames",
    },
  ];

  // 4. Live Casino (Dynamic Multi-Provider Aggregation)
  const liveCasinoGames: CasinoCardData[] = LIVE_CASINO_GAMES.map((game) => ({
    id: game.id,
    title: game.title,
    provider: game.provider,
    playersCount: game.playersCount,
    badge: game.badge,
    badgeColor: game.badgeColor,
    href: game.href || "/casino/group/live-casino",
    image: game.image,
  }));

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


  // Task 31 & 37 Card Mappings
  const ezugiGames: CasinoCardData[] = EZUGI_GAMES.map((game) => ({
    id: game.id,
    title: game.title,
    provider: "Ezugi",
    playersCount: game.livePlayerCount || game.playersCount,
    badge: game.badge,
    badgeColor: game.badgeColor,
    href: "/casino/live",
    image: game.image,
    bgGradient: "from-blue-950/80 via-[#1a2c38] to-[#0f212e]",
  }));

  const mac88Games: CasinoCardData[] = MAC88_GAMES.map((game) => ({
    id: game.id,
    title: game.title,
    provider: "Mac88",
    playersCount: game.livePlayerCount || game.playersCount,
    badge: game.badge,
    badgeColor: game.badgeColor,
    href: "/casino/group/mac88",
    image: game.image,
    bgGradient: "from-emerald-950/80 via-[#1a2c38] to-[#0f212e]",
  }));

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

  const hp100Games: CasinoCardData[] = HP100_GAMES.map((game) => ({
    id: game.id,
    title: game.title,
    provider: "100hp Gaming",
    playersCount: game.livePlayerCount || game.playersCount,
    badge: game.badge,
    badgeColor: game.badgeColor,
    href: "/casino/group/100hp",
    image: game.image,
    bgGradient: "from-orange-950/80 via-[#1a2c38] to-[#0f212e]",
  }));

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

  // 6. Featured Publishers (Authentic Vector Studios)
  const featuredPublishers: CasinoCardData[] = [
    {
      id: "fpub-stake-engine",
      title: "Stake Engine",
      provider: "Stake Engine",
      playersCount: 19450,
      graphic: <StakeEngineLogo />,
      isPublisherCard: true,
      href: "/casino/group/stake-originals",
    },
    {
      id: "fpub-valkyrie",
      title: "Valkyrie",
      provider: "Valkyrie",
      playersCount: 16210,
      graphic: <ValkyrieLogo />,
      isPublisherCard: true,
      href: "/casino/collection/providers",
    },
    {
      id: "fpub-paperclip",
      title: "Paperclip Gaming",
      provider: "Paperclip Gaming",
      playersCount: 12480,
      graphic: <PaperclipGamingLogo />,
      isPublisherCard: true,
      href: "/casino/collection/providers",
    },
    {
      id: "fpub-donut",
      title: "Donut Gaming",
      provider: "Donut Gaming",
      playersCount: 9830,
      graphic: <DonutGamingLogo />,
      isPublisherCard: true,
      href: "/casino/collection/providers",
    },
    {
      id: "fpub-colorful",
      title: "Colorful Play",
      provider: "Colorful Play",
      playersCount: 8410,
      graphic: <ColorfulPlayLogo />,
      isPublisherCard: true,
      href: "/casino/collection/providers",
    },
    {
      id: "fpub-twist",
      title: "Twist Gaming",
      provider: "Twist Gaming",
      playersCount: 11240,
      graphic: <TwistGamingLogo />,
      isPublisherCard: true,
      href: "/casino/collection/providers",
    },
    {
      id: "fpub-uppercut",
      title: "Uppercut Gaming",
      provider: "Uppercut Gaming",
      playersCount: 7920,
      graphic: <UppercutGamingLogo />,
      isPublisherCard: true,
      href: "/casino/collection/providers",
    },
    {
      id: "fpub-pocketplay",
      title: "Pocket Play",
      provider: "Pocket Play",
      playersCount: 6850,
      graphic: <PocketPlayLogo />,
      isPublisherCard: true,
      href: "/casino/collection/providers",
    },
    {
      id: "fpub-degenlab",
      title: "Degen Lab",
      provider: "Degen Lab",
      playersCount: 9410,
      graphic: <DegenLabLogo />,
      isPublisherCard: true,
      href: "/casino/collection/providers",
    },
    {
      id: "fpub-hyperplay",
      title: "Hyper Play",
      provider: "Hyper Play",
      playersCount: 13750,
      graphic: <HyperPlayLogo />,
      isPublisherCard: true,
      href: "/casino/collection/providers",
    },
    {
      id: "fpub-smartsoft",
      title: "SmartSoft",
      provider: "SmartSoft",
      playersCount: 29800,
      graphic: <SmartSoftLogo />,
      isPublisherCard: true,
      href: "/casino/group/turbogames",
    },
  ];

  // 7. Chicken Games (Crossing & Road Rush Mechanics)
  const chickenGames: CasinoCardData[] = [
    {
      id: "chicken",
      title: "Chicken",
      provider: "Stake Originals",
      playersCount: 3420,
      badge: "CROSSING",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-400/40",
      graphic: <span className="text-3xl">🍗🐔</span>,
      bgGradient: "from-amber-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "chicken-road",
      title: "Chicken Road",
      provider: "INOUT",
      playersCount: 2890,
      badge: "CROSSING",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40",
      graphic: <span className="text-3xl">🐔🛣️</span>,
      bgGradient: "from-emerald-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "chicken-road-2",
      title: "Chicken Road 2",
      provider: "INOUT",
      playersCount: 3120,
      badge: "HOT",
      badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-400/40",
      graphic: <span className="text-3xl">🐔⚡</span>,
      bgGradient: "from-yellow-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "chicken-road-gold",
      title: "Chicken Road Gold",
      provider: "INOUT",
      playersCount: 1920,
      badge: "GOLD",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-400/40",
      graphic: <span className="text-3xl">🐔🥇</span>,
      bgGradient: "from-amber-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "uncrossable-rush",
      title: "Uncrossable Rush",
      provider: "Evoplay",
      playersCount: 2240,
      badge: "CROSSING",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-400/40",
      graphic: <span className="text-3xl">🐸🚗</span>,
      bgGradient: "from-cyan-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "hp100-chicken-tour",
      title: "Chicken Tour",
      provider: "100HP Gaming",
      playersCount: 1850,
      badge: "ACTION",
      badgeColor: "bg-orange-500/20 text-orange-300 border-orange-400/40",
      graphic: <span className="text-3xl">🐔🗺️</span>,
      bgGradient: "from-orange-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "hp100-chicken-vs-train",
      title: "Chicken vs Train",
      provider: "100HP Gaming",
      playersCount: 2110,
      badge: "VS BATTLE",
      badgeColor: "bg-red-500/20 text-red-300 border-red-500/30",
      graphic: <span className="text-3xl">🐔🚂</span>,
      bgGradient: "from-red-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "chicken-banana",
      title: "Chicken Banana",
      provider: "INOUT",
      playersCount: 1540,
      badge: "FUN",
      badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-400/40",
      graphic: <span className="text-3xl">🐔🍌</span>,
      bgGradient: "from-yellow-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "chicken-road-2-bonus",
      title: "Chicken Road 2 Bonus",
      provider: "INOUT",
      playersCount: 1680,
      badge: "BONUS",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-400/40",
      graphic: <span className="text-3xl">🐔🎁</span>,
      bgGradient: "from-purple-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "uncrossable-rush-x-mas",
      title: "Uncrossable Rush Xmas",
      provider: "Evoplay",
      playersCount: 1290,
      badge: "FESTIVE",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-400/40",
      graphic: <span className="text-3xl">❄️🐔</span>,
      bgGradient: "from-blue-950/80 via-[#1a2c38] to-[#0f212e]",
    },
  ];
  const onlyOnStakeGames = chickenGames;

  // 8. Burst Games (Strictly Aviator/Crash curve multiplier games)
  const burstGames: CasinoCardData[] = [
    {
      id: "spribe-aviator",
      title: "Aviator",
      provider: "SPRIBE",
      playersCount: 3840,
      badge: "BURST",
      badgeColor: "bg-red-500/20 text-red-300 border-red-500/30",
      href: "/games/crash",
      graphic: <span className="text-3xl">✈️💨</span>,
      bgGradient: "from-red-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "smartsoft-jetx",
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
      id: "aviafly",
      title: "Aviafly",
      provider: "INOUT",
      playersCount: 1440,
      badge: "BURST",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      href: "/games/crash",
      graphic: <span className="text-3xl">✈️📈</span>,
      bgGradient: "from-emerald-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "aviafly-2",
      title: "Aviafly 2",
      provider: "INOUT",
      playersCount: 1670,
      badge: "BURST",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      href: "/games/crash",
      graphic: <span className="text-3xl">🛫💥</span>,
      bgGradient: "from-cyan-950/80 via-[#1a2c38] to-[#0f212e]",
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
      id: "turbo-vortex-aero",
      title: "Vortex Aero",
      provider: "Turbo Games",
      playersCount: 1120,
      badge: "BURST",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      href: "/games/crash",
      graphic: <span className="text-3xl">🚀📈</span>,
      bgGradient: "from-amber-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "crash-x",
      title: "Crash X",
      provider: "Turbo Games",
      playersCount: 1890,
      badge: "BURST",
      badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/30",
      href: "/games/crash",
      graphic: <span className="text-3xl">💥📈</span>,
      bgGradient: "from-orange-950/80 via-[#1a2c38] to-[#0f212e]",
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
      id: "crash",
      title: "Crash",
      provider: "Stake Originals",
      playersCount: 3950,
      badge: "ORIGINAL",
      badgeColor: "bg-[#00e701]/20 text-[#00e701] border-[#00e701]/30",
      href: "/games/crash",
      graphic: <span className="text-3xl">🚀📈</span>,
      bgGradient: "from-emerald-950/80 via-[#1a2c38] to-[#0f212e]",
    },
  ];

  // 9. New Releases (Curated Trending Games with 100% Verified Artwork)
  const newReleasesGames: CasinoCardData[] = [
    {
      id: "stock-market",
      title: "Stock Market",
      provider: "Evolution",
      playersCount: 1890,
      badge: "HOT",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      graphic: <span className="text-3xl">📈💹</span>,
      bgGradient: "from-emerald-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "bac-bo",
      title: "Bac Bo",
      provider: "Evolution",
      playersCount: 2380,
      badge: "LIVE",
      badgeColor: "bg-red-500/20 text-red-300 border-red-500/30",
      graphic: <span className="text-3xl">🎲🀄</span>,
      bgGradient: "from-red-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "auto-roulette",
      title: "Auto Roulette",
      provider: "Ezugi",
      playersCount: 1420,
      badge: "LIVE",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      graphic: <span className="text-3xl">🎡🔴</span>,
      bgGradient: "from-purple-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "gates-of-olympus-1000",
      title: "Gates of Olympus 1000",
      provider: "Pragmatic Play",
      playersCount: 3950,
      badge: "NEW",
      badgeColor: "bg-[#00e701]/20 text-[#00e701] border-[#00e701]/30",
      graphic: <span className="text-3xl">⚡🏺</span>,
      bgGradient: "from-amber-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "sweet-bonanza-1000",
      title: "Sweet Bonanza 1000",
      provider: "Pragmatic Play",
      playersCount: 3410,
      badge: "NEW",
      badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/30",
      graphic: <span className="text-3xl">🍭🍬</span>,
      bgGradient: "from-pink-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "sugar-rush-1000",
      title: "Sugar Rush 1000",
      provider: "Pragmatic Play",
      playersCount: 2890,
      badge: "NEW",
      badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      graphic: <span className="text-3xl">🐻🍬</span>,
      bgGradient: "from-yellow-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "wanted-dead-or-a-wild",
      title: "Wanted Dead or a Wild",
      provider: "Hacksaw Gaming",
      playersCount: 2740,
      badge: "TOP",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      graphic: <span className="text-3xl">🤠🔫</span>,
      bgGradient: "from-amber-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "rip-city",
      title: "Rip City",
      provider: "Hacksaw Gaming",
      playersCount: 1980,
      badge: "HOT",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      graphic: <span className="text-3xl">🐱🐭</span>,
      bgGradient: "from-cyan-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "dork-unit",
      title: "Dork Unit",
      provider: "Hacksaw Gaming",
      playersCount: 1620,
      badge: "NEW",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      graphic: <span className="text-3xl">🤡🎁</span>,
      bgGradient: "from-purple-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "big-bass-splash",
      title: "Big Bass Splash",
      provider: "Pragmatic Play",
      playersCount: 3120,
      badge: "POPULAR",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      graphic: <span className="text-3xl">🐟🎣</span>,
      bgGradient: "from-blue-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "crazy-time",
      title: "Crazy Time",
      provider: "Evolution",
      playersCount: 4210,
      badge: "LIVE SHOW",
      badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/30",
      graphic: <span className="text-3xl">🎡🎪</span>,
      bgGradient: "from-pink-950/80 via-[#1a2c38] to-[#0f212e]",
    },
  ];

  // Handle slot card clicks to open game preview
  const handleCardClick = (card: CasinoCardData) => {
    openGamePreview(card);
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
            } catch { }
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

      {/* 2. AUTHENTIC STAKE SEARCH BAR */}
      <div className="relative w-full my-3 flex items-center bg-[#0f212e] border border-[#213743] focus-within:border-[#2f4553] rounded-lg shadow-sm transition-colors px-3.5 py-2 sm:py-2.5">
        <Search className="stroke-[2.2] text-[#b1bad3] w-4 h-4 shrink-0 mr-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Stake.com"
          className="text-sm font-semibold text-white placeholder:text-[#b1bad3] tracking-wide outline-none bg-transparent w-full"
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
            <h2 className="text-[16px] sm:text-[17px] font-semibold text-white tracking-[-0.015em] flex items-center gap-2">
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
            <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl bg-[#071824] border border-[#213743] text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#1a2c38] flex items-center justify-center text-[#879097]">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                No games found matching &quot;{searchQuery}&quot;
              </h3>
              <p className="text-xs sm:text-sm text-[#879097] max-w-sm">
                Try searching with another keyword or provider.
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-2 px-4 py-2 rounded-lg bg-[#213743] text-white hover:bg-[#2a4454] font-semibold text-xs sm:text-sm transition-all cursor-pointer"
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
                      openGamePreview(game);
                    }}
                    className="group relative flex flex-col select-none cursor-pointer"
                  >
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
                    </div>
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

          {/* Dynamic Category Rows from layoutConfig */}
          {CASINO_LOBBY_CATEGORIES.filter((cat) => cat.enabled).map((cat) => {
            let cards: CasinoCardData[] = [];

            if (cat.id === "publishers") {
              cards = publishers;
            } else if (cat.id === "featured-publishers") {
              cards = featuredPublishers;
            } else if (cat.id === "only-on-stake" || cat.id === "chicken-games") {
              cards = chickenGames;
            } else if (cat.id === "burst-games") {
              cards = burstGames;
            } else if (cat.id === "new-releases") {
              cards = newReleasesGames;
            } else if (cat.id === "pragmatic-play") {
              cards = pragmaticGames;
            } else if (cat.id === "hacksaw-gaming") {
              cards = hacksawGames;
            } else if (cat.id === "turbogames") {
              cards = turboGames;
            } else {
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
            }

            return (
              <CasinoGameRow
                key={cat.id}
                title={cat.title}
                rowBadge={cat.rowBadge}
                linkHref={cat.viewAllLink || `/casino/group/${cat.id}`}
                cards={cards}
                onCardClick={handleCardClick}
                sectionId={cat.id}
                showGameTitle={cat.showGameTitle ?? true}
                showProviderName={cat.showProviderName ?? true}
              />
            );
          })}

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
                        className={`h-12 sm:h-14 rounded-lg bg-[#1a2c38] border border-[#213743] flex items-center justify-center text-2xl shadow-sm transition-all ${isSpinningSlot ? "animate-pulse" : ""
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
