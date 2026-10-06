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
} from "lucide-react";
import CasinoPromoCarousel from "@/components/casino/CasinoPromoCarousel";
import CasinoCategoryPills from "@/components/casino/CasinoCategoryPills";
import CasinoGameRow, { CasinoCardData } from "@/components/casino/CasinoGameRow";
import CasinoLiveBets from "@/components/casino/CasinoLiveBets";
import LiveStatusAndSearch from "@/components/LiveStatusAndSearch";
import StakeGameArtwork from "@/components/casino/StakeGameArtwork";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

export default function CasinoHomePage() {
  const { balance, updateBalance, currency } = useGame();
  const [activeCategory, setActiveCategory] = useState<string>("home");
  const [searchQuery, setSearchQuery] = useState<string>("");

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

  // 1. Row 1: Stake Originals
  const row1Originals: CasinoCardData[] = [
    {
      id: "dice",
      title: "Dice",
      provider: "Stake Originals",
      playersCount: 2480,
      badge: "ORIGINAL",
      badgeColor: "bg-[#00e701]/20 text-[#00e701] border-[#00e701]/30",
      href: "/games/dice",
      image: "https://mediumrare.imgix.net/3b470acf1e794ecb437a535c35a20f12e8f7caf1a1153b6601dab4a2d34607e4?auto=format",
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
      image: "https://mediumrare.imgix.net/3b470acf1e794ecb437a535c35a20f12e8f7caf1a1153b6601dab4a2d34607e4?auto=format",
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
      image: "https://mediumrare.imgix.net/8c1768b783a43931a4ebc8784ce64085e39139d262e6bb50da242b9f3fda70da?auto=format",
      graphic: <StakeGameArtwork gameId="plinko" className="w-16 h-16 sm:w-20 sm:h-20" />,
      bgGradient: "from-blue-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "keno",
      title: "Keno",
      provider: "Stake Originals",
      playersCount: 1250,
      badge: "ORIGINAL",
      badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/30",
      href: "/games/keno",
      image: "https://mediumrare.imgix.net/edfa399c2e46da7e0593a0e543ba66b129e306bdc6c77a8632c320fec8a04bed?auto=format",
      graphic: <StakeGameArtwork gameId="keno" className="w-16 h-16 sm:w-20 sm:h-20" />,
      bgGradient: "from-pink-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "crash",
      title: "Crash",
      provider: "Stake Originals",
      playersCount: 5120,
      badge: "HOT",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      href: "/games/crash",
      image: "https://mediumrare.imgix.net/edfa399c2e46da7e0593a0e543ba66b129e306bdc6c77a8632c320fec8a04bed?auto=format",
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
      image: "https://mediumrare.imgix.net/edfa399c2e46da7e0593a0e543ba66b129e306bdc6c77a8632c320fec8a04bed?auto=format",
      graphic: <StakeGameArtwork gameId="limbo" className="w-16 h-16 sm:w-20 sm:h-20" />,
      bgGradient: "from-yellow-950/80 via-[#1a2c38] to-[#0f212e]",
    },
  ];

  // 2. Row 2: Slots
  const row2Slots: CasinoCardData[] = [
    {
      id: "gates-olympus-1000",
      title: "Gates of Olympus 1000",
      provider: "Pragmatic Play",
      playersCount: 1554,
      badge: "1,000X MULTI",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      image: "https://mediumrare.imgix.net/3b470acf1e794ecb437a535c35a20f12e8f7caf1a1153b6601dab4a2d34607e4?auto=format",
      graphic: <span className="text-3xl">⚡👑</span>,
      bgGradient: "from-amber-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "waylanders-forge",
      title: "Waylanders Forge",
      provider: "Stake Originals",
      playersCount: 940,
      badge: "ORIGINAL",
      badgeColor: "bg-[#00e701]/20 text-[#00e701] border-[#00e701]/30",
      image: "https://mediumrare.imgix.net/8c1768b783a43931a4ebc8784ce64085e39139d262e6bb50da242b9f3fda70da?auto=format",
      graphic: <span className="text-3xl">⚔️🔥</span>,
      bgGradient: "from-emerald-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "sweet-bonanza-1000",
      title: "Sweet Bonanza 1000",
      provider: "Pragmatic Play",
      playersCount: 1420,
      badge: "CANDY BOMB",
      badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/30",
      image: "https://mediumrare.imgix.net/edfa399c2e46da7e0593a0e543ba66b129e306bdc6c77a8632c320fec8a04bed?auto=format",
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
      image: "https://mediumrare.imgix.net/3b470acf1e794ecb437a535c35a20f12e8f7caf1a1153b6601dab4a2d34607e4?auto=format",
      graphic: <span className="text-3xl">💀🔫</span>,
      bgGradient: "from-red-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "le-catcher",
      title: "Le Catcher",
      provider: "Hacksaw Gaming",
      playersCount: 820,
      badge: "MEGA BONUS",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      image: "https://mediumrare.imgix.net/edfa399c2e46da7e0593a0e543ba66b129e306bdc6c77a8632c320fec8a04bed?auto=format",
      graphic: <span className="text-3xl">🎩💎</span>,
      bgGradient: "from-purple-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "sugar-rush-1000",
      title: "Sugar Rush 1000",
      provider: "Pragmatic Play",
      playersCount: 1670,
      badge: "1,024X SPOTS",
      badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/30",
      image: "https://mediumrare.imgix.net/edfa399c2e46da7e0593a0e543ba66b129e306bdc6c77a8632c320fec8a04bed?auto=format",
      graphic: <span className="text-3xl">🧁🐻</span>,
      bgGradient: "from-pink-950/80 via-[#1a2c38] to-[#0f212e]",
    },
  ];

  // 3. Row 3: Publishers
  const row3Publishers: CasinoCardData[] = [
    {
      id: "pub-stake",
      title: "Stake Originals",
      provider: "42 Games",
      badge: "EXCLUSIVE",
      badgeColor: "bg-[#00e701]/20 text-[#00e701] border-[#00e701]/30",
      graphic: <span className="font-black italic text-2xl text-white">stake</span>,
      bgGradient: "from-emerald-950 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "pub-pragmatic",
      title: "Pragmatic Play",
      provider: "380 Games",
      badge: "POPULAR",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      graphic: <span className="font-bold text-lg text-amber-400">PRAGMATIC</span>,
      bgGradient: "from-amber-950 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "pub-hacksaw",
      title: "Hacksaw Gaming",
      provider: "140 Games",
      badge: "HOT",
      badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      graphic: <span className="font-mono font-bold text-lg text-yellow-400">HACKSAW</span>,
      bgGradient: "from-stone-900 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "pub-evolution",
      title: "Evolution Live",
      provider: "110 Games",
      badge: "LIVE DEALERS",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      graphic: <span className="font-bold text-lg text-blue-400">Evolution</span>,
      bgGradient: "from-blue-950 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "pub-nolimit",
      title: "Nolimit City",
      provider: "95 Games",
      badge: "XTREME VOL",
      badgeColor: "bg-red-500/20 text-red-300 border-red-500/30",
      graphic: <span className="font-black text-lg text-red-400">NOLIMIT</span>,
      bgGradient: "from-red-950 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "pub-twist",
      title: "Twist Gaming",
      provider: "60 Games",
      badge: "VERIFIED",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      graphic: <span className="font-bold text-lg text-cyan-400">TWIST</span>,
      bgGradient: "from-cyan-950 via-[#1a2c38] to-[#0f212e]",
    },
  ];

  // 4. Row 4: Featured Publishers
  const row4FeaturedPublishers: CasinoCardData[] = [
    {
      id: "fpub-evoslot",
      title: "evoslot",
      provider: "Featured Studio",
      playersCount: 3820,
      badge: "FEATURED",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      graphic: <span className="font-black text-xl text-purple-400">EVOSLOT</span>,
      bgGradient: "from-purple-950 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "fpub-no2ap",
      title: "NO2AP LABS",
      provider: "Experimental Studio",
      playersCount: 2940,
      badge: "STUDIO",
      badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/30",
      graphic: <span className="font-mono font-bold text-lg text-teal-300">NO2AP LABS</span>,
      bgGradient: "from-teal-950 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "fpub-ovryx",
      title: "OVRYX",
      provider: "Next-Gen Gaming",
      playersCount: 4120,
      badge: "NEW STUDIO",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      graphic: <span className="font-black text-2xl text-blue-400">OVRYX</span>,
      bgGradient: "from-blue-950 via-[#1a2c38] to-[#0f212e]",
    },
  ];

  // 5. Row 5: Only on Stake with '2x VIP' badge
  const row5OnlyOnStake: CasinoCardData[] = [
    {
      id: "sharks",
      title: "Sharks!",
      provider: "Push Gaming",
      playersCount: 1840,
      badge: "2X VIP",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      image: "https://mediumrare.imgix.net/edfa399c2e46da7e0593a0e543ba66b129e306bdc6c77a8632c320fec8a04bed?auto=format",
      graphic: <span className="text-3xl">🦈🌊</span>,
      bgGradient: "from-cyan-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "wicked-grin",
      title: "Wicked Grin",
      provider: "Only on Stake",
      playersCount: 920,
      badge: "2X VIP",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      image: "https://mediumrare.imgix.net/3b470acf1e794ecb437a535c35a20f12e8f7caf1a1153b6601dab4a2d34607e4?auto=format",
      graphic: <span className="text-3xl">😈🎃</span>,
      bgGradient: "from-purple-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "tongue",
      title: "Tongue",
      provider: "Only on Stake",
      playersCount: 760,
      badge: "2X VIP",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      image: "https://mediumrare.imgix.net/edfa399c2e46da7e0593a0e543ba66b129e306bdc6c77a8632c320fec8a04bed?auto=format",
      graphic: <span className="text-3xl">👅🍬</span>,
      bgGradient: "from-pink-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "toon-sailor",
      title: "Toon Sailor",
      provider: "Only on Stake",
      playersCount: 680,
      badge: "2X VIP",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      image: "https://mediumrare.imgix.net/8c1768b783a43931a4ebc8784ce64085e39139d262e6bb50da242b9f3fda70da?auto=format",
      graphic: <span className="text-3xl">⚓⛵</span>,
      bgGradient: "from-sky-950/80 via-[#1a2c38] to-[#0f212e]",
    },
  ];

  // 6. Row 6: Burst Games
  const row6BurstGames: CasinoCardData[] = [
    {
      id: "aviator",
      title: "Aviator",
      provider: "Spribe",
      playersCount: 3840,
      badge: "BURST",
      badgeColor: "bg-red-500/20 text-red-300 border-red-500/30",
      href: "/games/crash",
      image: "https://mediumrare.imgix.net/edfa399c2e46da7e0593a0e543ba66b129e306bdc6c77a8632c320fec8a04bed?auto=format",
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
      image: "https://mediumrare.imgix.net/3b470acf1e794ecb437a535c35a20f12e8f7caf1a1153b6601dab4a2d34607e4?auto=format",
      graphic: <span className="text-3xl">💣💎</span>,
      bgGradient: "from-emerald-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "keno-xtreme",
      title: "Keno Xtreme",
      provider: "Stake Originals",
      playersCount: 890,
      badge: "BURST",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      href: "/games/keno",
      image: "https://mediumrare.imgix.net/edfa399c2e46da7e0593a0e543ba66b129e306bdc6c77a8632c320fec8a04bed?auto=format",
      graphic: <span className="text-3xl">🎯✨</span>,
      bgGradient: "from-amber-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "aviamasters",
      title: "Aviamasters",
      provider: "BGaming",
      playersCount: 1120,
      badge: "BURST",
      badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      image: "https://mediumrare.imgix.net/edfa399c2e46da7e0593a0e543ba66b129e306bdc6c77a8632c320fec8a04bed?auto=format",
      graphic: <span className="text-3xl">🚀🌌</span>,
      bgGradient: "from-cyan-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "jet-x",
      title: "Jet X",
      provider: "SmartSoft",
      playersCount: 2210,
      badge: "BURST",
      badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      href: "/games/crash",
      graphic: <span className="text-3xl">🛩️⚡</span>,
      bgGradient: "from-yellow-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "angry-balls",
      title: "Angry Balls",
      provider: "Stake Originals",
      playersCount: 1450,
      badge: "BURST",
      badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/30",
      href: "/games/plinko",
      graphic: <span className="text-3xl">🔴💥</span>,
      bgGradient: "from-orange-950/80 via-[#1a2c38] to-[#0f212e]",
    },
  ];

  // 7. Row 7: Top Picks
  const row7TopPicks: CasinoCardData[] = [
    {
      id: "hot-chili-chica",
      title: "Hot Chili Chica",
      provider: "Stake Exclusive",
      playersCount: 2310,
      badge: "HOT",
      badgeColor: "bg-red-500/20 text-red-300 border-red-500/30",
      image: "https://mediumrare.imgix.net/edfa399c2e46da7e0593a0e543ba66b129e306bdc6c77a8632c320fec8a04bed?auto=format",
      graphic: <span className="text-3xl">🌶️🔥</span>,
      bgGradient: "from-red-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "moles-gone-wild",
      title: "Moles Gone Wild",
      provider: "Hacksaw Gaming",
      playersCount: 1780,
      badge: "FEATURED",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      image: "https://mediumrare.imgix.net/3b470acf1e794ecb437a535c35a20f12e8f7caf1a1153b6601dab4a2d34607e4?auto=format",
      graphic: <span className="text-3xl">🦔💰</span>,
      bgGradient: "from-amber-950/80 via-[#1a2c38] to-[#0f212e]",
    },
    {
      id: "blind-viking",
      title: "Blind Viking",
      provider: "NoLimit City",
      playersCount: 1640,
      badge: "VIKING REELS",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      image: "https://mediumrare.imgix.net/edfa399c2e46da7e0593a0e543ba66b129e306bdc6c77a8632c320fec8a04bed?auto=format",
      graphic: <span className="text-3xl">🛡️🪓</span>,
      bgGradient: "from-blue-950/80 via-[#1a2c38] to-[#0f212e]",
    },
  ];

  // 8. Row 8: New Releases
  const row8NewReleases: CasinoCardData[] = [
    {
      id: "gates-olympus-2500",
      title: "Gates of Olympus 2500",
      provider: "Pragmatic Play",
      playersCount: 2950,
      badge: "NEW",
      badgeColor: "bg-[#00e701]/20 text-[#00e701] border-[#00e701]/30",
      image: "https://mediumrare.imgix.net/3b470acf1e794ecb437a535c35a20f12e8f7caf1a1153b6601dab4a2d34607e4?auto=format",
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
      image: "https://mediumrare.imgix.net/edfa399c2e46da7e0593a0e543ba66b129e306bdc6c77a8632c320fec8a04bed?auto=format",
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
      image: "https://mediumrare.imgix.net/edfa399c2e46da7e0593a0e543ba66b129e306bdc6c77a8632c320fec8a04bed?auto=format",
      graphic: <span className="text-3xl">🤡🎪</span>,
      bgGradient: "from-pink-950/80 via-[#1a2c38] to-[#0f212e]",
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
      {/* 1. TOP PROMOTIONAL BANNER CAROUSEL */}
      <CasinoPromoCarousel />

      {/* 2. HORIZONTAL CATEGORY NAVIGATION PILLS */}
      <CasinoCategoryPills
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />

      {/* 3. LIVE STATUS & SEARCH SUB-HEADER */}
      <LiveStatusAndSearch
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* 4. STRUCTURED GAME ROWS & CAROUSELS */}
      {/* Row 1: Stake Originals > */}
      <CasinoGameRow
        title="Stake Originals"
        linkHref="/casino/group/stake-originals"
        cards={row1Originals}
        onCardClick={handleCardClick}
      />

      {/* Row 2: Slots > */}
      <CasinoGameRow
        title="Slots"
        linkHref="/casino/group/slots"
        cards={row2Slots}
        onCardClick={handleCardClick}
      />

      {/* Row 3: Publishers > */}
      <CasinoGameRow
        title="Publishers"
        linkHref="/casino/collection/providers"
        cards={row3Publishers}
        onCardClick={handleCardClick}
      />

      {/* Row 4: Featured Publishers > */}
      <CasinoGameRow
        title="Featured Publishers"
        linkHref="/casino/collection/providers"
        cards={row4FeaturedPublishers}
        onCardClick={handleCardClick}
      />

      {/* Row 5: Only on Stake > with '2x VIP' badge */}
      <CasinoGameRow
        title="Only on Stake"
        linkHref="/casino/group/stake-originals"
        rowBadge="2x VIP"
        cards={row5OnlyOnStake}
        onCardClick={handleCardClick}
      />

      {/* Row 6: Burst Games > */}
      <CasinoGameRow
        title="Burst Games"
        linkHref="#burst-games"
        cards={row6BurstGames}
        onCardClick={handleCardClick}
      />

      {/* Row 7: Top Picks > */}
      <CasinoGameRow
        title="Top Picks"
        linkHref="#top-picks"
        cards={row7TopPicks}
        onCardClick={handleCardClick}
      />

      {/* Row 8: New Releases > */}
      <CasinoGameRow
        title="New Releases"
        linkHref="#new-releases"
        cards={row8NewReleases}
        onCardClick={handleCardClick}
      />

      {/* 5. CONTEXTUAL CASINO LIVE BETS TICKER */}
      <CasinoLiveBets />

      {/* 6. INTERACTIVE SLOT DEMO PLAYER MODAL */}
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
                className="flex-1 rounded-xl bg-[#00e701] py-3 text-sm font-extrabold text-[#0f212e] shadow-lg shadow-[#00e701]/30 hover:bg-[#00c701] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
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
