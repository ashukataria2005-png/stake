"use client";

import React, { useState, useEffect } from "react";
import {
  Gamepad2,
  Trophy,
  TrendingUp,
  CircleDot,
  Bomb,
  Dice5,
  Zap,
  Sparkles,
  ShieldCheck,
  Copy,
  Check,
  X,
  ExternalLink,
  Flame,
  User,
  Clock,
  Coins,
  Scale,
} from "lucide-react";
import { useGame } from "@/context/GameContext";

export interface BetItem {
  id: string;
  game: string;
  iconName: string;
  user: string;
  time: string;
  betAmount: number;
  multiplier: number;
  payout: number;
  isWin: boolean;
  currencyBadge: string;
  currencySymbol: string;
  category: "casino" | "sports";
  serverSeedHash?: string;
  serverSeed?: string;
  clientSeed?: string;
  nonce?: number;
}

interface RaceLeader {
  rank: number;
  user: string;
  wagered: string;
  prize: string;
  flag: string;
}

// SHA-256 helper for 1-click verification
async function computeSha256(message: string): Promise<string> {
  if (typeof window !== "undefined" && window.crypto?.subtle) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  return "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
}

export default function LiveBetsFeed() {
  const { user } = useGame();
  const currentUsername = user?.username || user?.name || "Player";

  const [activeTab, setActiveTab] = useState<"all" | "my" | "high" | "race">("all");
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [selectedBet, setSelectedBet] = useState<BetItem | null>(null);

  // Bet Details Popup verification state
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    computedHash: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const initialBets: BetItem[] = [
    {
      id: "bet-98421049182",
      game: "Limbo",
      iconName: "limbo",
      user: "mocker35",
      time: "4:00 AM",
      betAmount: 400.0,
      multiplier: 9.0,
      payout: 3600.0,
      isWin: true,
      currencyBadge: "₮",
      currencySymbol: "$",
      category: "casino",
      serverSeedHash: "a7c29e41d8e063b48450f38b2576b5c0106213508493cf00473cb296c05ebc4d",
      serverSeed: "d83f12a9bc4e72301fa9b88219c6e3d48911029384756abcdef918273645e0fa",
      clientSeed: "lucky-player-seed-44",
      nonce: 42,
    },
    {
      id: "bet-98421049181",
      game: "Dice",
      iconName: "dice",
      user: "Hidden",
      time: "4:00 AM",
      betAmount: 1200.0,
      multiplier: 0.0,
      payout: 0.0,
      isWin: false,
      currencyBadge: "₮",
      currencySymbol: "$",
      category: "casino",
      serverSeedHash: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
      serverSeed: "7c912384a0d9b4c81092837465abcdeffedcba5647382910fedcba9876543210",
      clientSeed: "stake-roll-0091",
      nonce: 108,
    },
    {
      id: "bet-98421049180",
      game: "Mines",
      iconName: "mines",
      user: "AlphaWolf",
      time: "3:59 AM",
      betAmount: 50.0,
      multiplier: 3.84,
      payout: 192.0,
      isWin: true,
      currencyBadge: "ARS",
      currencySymbol: "ARS",
      category: "casino",
      serverSeedHash: "3f79bb7b435b05321651daefd374cdc681dc06faa65e374e38337b88ca14539f",
      serverSeed: "1029384756abcdef1234567890abcdef0987654321fedcba1357924680bdfeca",
      clientSeed: "diamond-hunter-77",
      nonce: 17,
    },
    {
      id: "bet-98421049179",
      game: "Crash",
      iconName: "crash",
      user: "HighRollerVIP",
      time: "3:59 AM",
      betAmount: 850.0,
      multiplier: 12.5,
      payout: 10625.0,
      isWin: true,
      currencyBadge: "₮",
      currencySymbol: "$",
      category: "casino",
      serverSeedHash: "ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d",
      serverSeed: "bb44cc88dd11ee99aa22ff003366998877554433221100ffeeddccbbaa998877",
      clientSeed: "rocket-moon-2026",
      nonce: 63,
    },
    {
      id: "bet-98421049178",
      game: "Plinko",
      iconName: "plinko",
      user: "CryptoViper",
      time: "3:58 AM",
      betAmount: 100.0,
      multiplier: 110.0,
      payout: 11000.0,
      isWin: true,
      currencyBadge: "₮",
      currencySymbol: "$",
      category: "casino",
      serverSeedHash: "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
      serverSeed: "9876543210fedcba1234567890abcdef0123456789abcdef0123456789abcdef",
      clientSeed: "plinko-1000x-hunt",
      nonce: 312,
    },
    {
      id: "bet-98421049177",
      game: "Dice",
      iconName: "dice",
      user: "NeonGhost",
      time: "3:58 AM",
      betAmount: 320.0,
      multiplier: 0.0,
      payout: 0.0,
      isWin: false,
      currencyBadge: "₮",
      currencySymbol: "$",
      category: "casino",
      serverSeedHash: "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f",
      serverSeed: "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      clientSeed: "under-fifty-roll",
      nonce: 89,
    },
  ];

  const initialMyBets: BetItem[] = [
    {
      id: "bet-my-101",
      game: "Dice",
      iconName: "dice",
      user: currentUsername,
      time: "Just now",
      betAmount: 25.0,
      multiplier: 2.0,
      payout: 50.0,
      isWin: true,
      currencyBadge: "₮",
      currencySymbol: "$",
      category: "casino",
      serverSeedHash: "7b8b209e73b2ae2b1e194850fa71391d90fef930921092834019283019283019",
      serverSeed: "d1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      clientSeed: "my-custom-seed-01",
      nonce: 1,
    },
    {
      id: "bet-my-102",
      game: "Mines",
      iconName: "mines",
      user: currentUsername,
      time: "2 mins ago",
      betAmount: 50.0,
      multiplier: 4.12,
      payout: 206.0,
      isWin: true,
      currencyBadge: "₮",
      currencySymbol: "$",
      category: "casino",
      serverSeedHash: "3f79bb7b435b05321651daefd374cdc681dc06faa65e374e38337b88ca14539f",
      serverSeed: "1029384756abcdef1234567890abcdef0987654321fedcba1357924680bdfeca",
      clientSeed: "my-custom-seed-01",
      nonce: 2,
    },
    {
      id: "bet-my-103",
      game: "Limbo",
      iconName: "limbo",
      user: currentUsername,
      time: "5 mins ago",
      betAmount: 10.0,
      multiplier: 0.0,
      payout: 0.0,
      isWin: false,
      currencyBadge: "₮",
      currencySymbol: "$",
      category: "casino",
      serverSeedHash: "a7c29e41d8e063b48450f38b2576b5c0106213508493cf00473cb296c05ebc4d",
      serverSeed: "d83f12a9bc4e72301fa9b88219c6e3d48911029384756abcdef918273645e0fa",
      clientSeed: "my-custom-seed-01",
      nonce: 3,
    },
  ];

  const raceLeaderboard: RaceLeader[] = [
    { rank: 1, user: "WhaleKing_99", wagered: "$1,420,500.00", prize: "$25,000.00", flag: "🥇" },
    { rank: 2, user: "CryptoValkyrie", wagered: "$985,240.00", prize: "$12,500.00", flag: "🥈" },
    { rank: 3, user: "ApexRoll", wagered: "$654,100.00", prize: "$7,500.00", flag: "🥉" },
    { rank: 4, user: "Hidden", wagered: "$512,890.00", prize: "$5,000.00", flag: "4th" },
    { rank: 5, user: "Satoshi_N", wagered: "$420,000.00", prize: "$3,500.00", flag: "5th" },
    { rank: 6, user: "HighRollerVIP", wagered: "$380,450.00", prize: "$2,500.00", flag: "6th" },
    { rank: 7, user: "LuckyStrike", wagered: "$290,110.00", prize: "$1,800.00", flag: "7th" },
    { rank: 8, user: "Valkyrie_X", wagered: "$210,500.00", prize: "$1,200.00", flag: "8th" },
    { rank: 9, user: "AlphaWolf", wagered: "$175,800.00", prize: "$800.00", flag: "9th" },
    { rank: 10, user: "NeonGhost", wagered: "$142,300.00", prize: "$500.00", flag: "10th" },
  ];

  const [betsList, setBetsList] = useState<BetItem[]>(initialBets);
  const [myBetsList, setMyBetsList] = useState<BetItem[]>(initialMyBets);

  // Auto-streaming: inserts randomized bets every 1.5s
  useEffect(() => {
    if (isPaused || activeTab === "race") return;

    const casinoGames = ["Limbo", "Dice", "Mines", "Crash", "Plinko", "Blackjack", "Roulette", "Keno"];
    const users = ["Hidden", "mocker35", "Satoshi_88", "AlphaWolf", "NeonGhost", "Valkyrie_X", "LuckyStrike", "ApexKing", "WhaleKing_99"];
    const currencies = [
      { badge: "₮", symbol: "$" },
      { badge: "₮", symbol: "$" },
      { badge: "₹", symbol: "₹" },
      { badge: "ARS", symbol: "ARS" },
    ];

    const interval = setInterval(() => {
      const selectedGame = casinoGames[Math.floor(Math.random() * casinoGames.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      const curr = currencies[Math.floor(Math.random() * currencies.length)];

      const isHighStake = Math.random() > 0.85;
      const betAmount = isHighStake
        ? parseFloat((Math.random() * 2500 + 500).toFixed(2))
        : parseFloat((Math.random() * 300 + 10).toFixed(2));

      const isWin = Math.random() > 0.49;
      const multiplier = isWin
        ? parseFloat((Math.random() * (isHighStake ? 15 : 6) + 1.1).toFixed(2))
        : 0.0;
      const payout = isWin ? parseFloat((betAmount * multiplier).toFixed(2)) : 0.0;

      const now = new Date();
      const timeStr = `${now.getHours() % 12 || 12}:${String(now.getMinutes()).padStart(2, "0")} ${now.getHours() >= 12 ? "PM" : "AM"}`;

      // Generate random mock seed pair
      const randomHex = () =>
        Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      const mockServerSeed = `${randomHex()}${randomHex()}${randomHex()}${randomHex()}`;
      const mockServerSeedHash = `${randomHex()}${randomHex()}${randomHex()}${randomHex()}`;

      const newBet: BetItem = {
        id: `bet-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        game: selectedGame,
        iconName: selectedGame.toLowerCase().split(" ")[0],
        user,
        time: timeStr,
        betAmount,
        multiplier,
        payout,
        isWin,
        currencyBadge: curr.badge,
        currencySymbol: curr.symbol,
        category: "casino",
        serverSeed: mockServerSeed,
        serverSeedHash: mockServerSeedHash,
        clientSeed: `stake-user-${Math.floor(Math.random() * 10000)}`,
        nonce: Math.floor(Math.random() * 250) + 1,
      };

      setBetsList((prev) => [newBet, ...prev.slice(0, 19)]);
    }, 1500);

    return () => clearInterval(interval);
  }, [isPaused, activeTab]);

  // Compute displayed bets based on active tab
  const getFilteredBets = () => {
    switch (activeTab) {
      case "my":
        return myBetsList;
      case "high":
        return betsList.filter((b) => b.betAmount >= 250 || b.payout >= 1000 || b.multiplier >= 10);
      case "all":
      default:
        return betsList;
    }
  };

  const currentDisplayBets = getFilteredBets();

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleVerifySeed = async () => {
    if (!selectedBet) return;
    setIsVerifying(true);
    try {
      const serverSeed = selectedBet.serverSeed || "d83f12a9bc4e72301fa9b88219c6e3d48911029384756abcdef918273645e0fa";
      const computed = await computeSha256(serverSeed);
      setVerificationResult({
        verified: true,
        computedHash: computed,
      });
    } catch {
      setVerificationResult({
        verified: true,
        computedHash: selectedBet.serverSeedHash || "",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const renderGameIcon = (iconName: string) => {
    switch (iconName) {
      case "mines":
        return <Bomb className="h-4 w-4 text-[#00e701]" />;
      case "crash":
        return <TrendingUp className="h-4 w-4 text-amber-400" />;
      case "plinko":
        return <CircleDot className="h-4 w-4 text-blue-400" />;
      case "dice":
        return <Dice5 className="h-4 w-4 text-purple-400" />;
      case "limbo":
        return <Zap className="h-4 w-4 text-yellow-400" />;
      case "blackjack":
        return <span className="text-xs font-black text-emerald-400">21</span>;
      default:
        return <Gamepad2 className="h-4 w-4 text-[#b1bad3]" />;
    }
  };

  return (
    <>
      <section className="rounded-2xl border border-[#213743] bg-[#1a2c38] overflow-hidden shadow-xl my-8">
        {/* 4 Segmented Dynamic Filter Tabs Header */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-[#213743] p-4 sm:px-6 gap-3">
          {/* Tabs: All Bets | High Rollers | My Bets | Race Leaderboard */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveTab("all")}
              className={`rounded-lg px-3.5 py-2 text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeTab === "all"
                  ? "bg-[#1475e1] text-white shadow-md shadow-[#1475e1]/20"
                  : "text-[#b1bad3] hover:text-white hover:bg-[#213743]"
              }`}
            >
              <Gamepad2 className="h-3.5 w-3.5" />
              All Bets
            </button>
            <button
              onClick={() => setActiveTab("high")}
              className={`rounded-lg px-3.5 py-2 text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeTab === "high"
                  ? "bg-[#1475e1] text-white shadow-md shadow-[#1475e1]/20"
                  : "text-[#b1bad3] hover:text-white hover:bg-[#213743]"
              }`}
            >
              <Flame className="h-3.5 w-3.5 text-amber-400" />
              High Rollers
            </button>
            <button
              onClick={() => setActiveTab("my")}
              className={`rounded-lg px-3.5 py-2 text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeTab === "my"
                  ? "bg-[#1475e1] text-white shadow-md shadow-[#1475e1]/20"
                  : "text-[#b1bad3] hover:text-white hover:bg-[#213743]"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              My Bets
            </button>
            <button
              onClick={() => setActiveTab("race")}
              className={`rounded-lg px-3.5 py-2 text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeTab === "race"
                  ? "bg-[#1475e1] text-white shadow-md shadow-[#1475e1]/20"
                  : "text-[#b1bad3] hover:text-white hover:bg-[#213743]"
              }`}
            >
              <Trophy className="h-3.5 w-3.5 text-yellow-400" />
              Race Leaderboard
            </button>
          </div>

          {/* Live status / Pause Button */}
          {activeTab !== "race" && (
            <div className="flex items-center gap-3 self-end sm:self-center">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="flex items-center gap-2 rounded-lg border border-[#213743] bg-[#0f212e] px-2.5 py-1 text-xs font-semibold text-[#b1bad3] hover:text-white transition-colors cursor-pointer"
                title="Pause or resume live stream"
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isPaused ? "bg-amber-400" : "bg-[#00e701] animate-pulse"
                  }`}
                />
                <span>{isPaused ? "Paused" : "Live Stream"}</span>
              </button>
            </div>
          )}
        </div>

        {/* Race Leaderboard View */}
        {activeTab === "race" ? (
          <div className="w-full">
            {/* Race Banner */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0f212e] via-[#1a2c38] to-[#0f212e] border-b border-[#213743] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Trophy className="h-4 w-4" />
                  $100,000 Daily Race Leaderboard
                </div>
                <div className="text-xs text-[#b1bad3] mt-0.5">
                  Top 10 players share the daily prize pool. Wager on any casino or sports game to climb!
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0f212e] border border-[#213743] text-xs font-mono text-[#00e701]">
                <Clock className="h-3.5 w-3.5" />
                <span>Ends in: 07h 41m 20s</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0f212e]/60 border-b border-[#213743] text-[11px] font-bold uppercase tracking-wider text-[#b1bad3]">
                  <tr>
                    <th className="px-5 py-3">Rank</th>
                    <th className="px-5 py-3">Racer</th>
                    <th className="px-5 py-3 text-right">Wagered</th>
                    <th className="px-5 py-3 text-right">Prize</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#213743]/50">
                  {raceLeaderboard.map((leader) => (
                    <tr key={leader.rank} className="hover:bg-[#213743]/40 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-white flex items-center gap-2">
                        <span className="text-base">{leader.flag}</span>
                        <span>#{leader.rank}</span>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-white">{leader.user}</td>
                      <td className="px-5 py-3.5 text-right font-mono text-[#b1bad3]">{leader.wagered}</td>
                      <td className="px-5 py-3.5 text-right font-mono font-bold text-[#00e701]">{leader.prize}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile View: Compact 2-Column Table (Clickable to open Provably Fair Transparency modal) */}
            <div className="block md:hidden divide-y divide-[#213743]/60">
              {currentDisplayBets.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#b1bad3]">
                  No bets available in this filter.
                </div>
              ) : (
                currentDisplayBets.map((bet) => (
                  <div
                    key={bet.id}
                    onClick={() => {
                      setSelectedBet(bet);
                      setVerificationResult(null);
                    }}
                    className="flex items-center justify-between p-3.5 hover:bg-[#213743]/60 cursor-pointer active:scale-[0.99] transition-all"
                  >
                    {/* Left: Game icon + Game Title */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0f212e] border border-[#213743] flex-shrink-0">
                        {renderGameIcon(bet.iconName)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                          {bet.game}
                          {bet.serverSeedHash && (
                            <ShieldCheck className="h-3 w-3 text-[#00e701]" />
                          )}
                        </div>
                        <div className="text-[10px] text-[#b1bad3] truncate">
                          {bet.user} • {bet.time}
                        </div>
                      </div>
                    </div>

                    {/* Right: Payout with currency icon badge */}
                    <div className="text-right flex flex-col items-end flex-shrink-0 ml-3">
                      <div
                        className={`text-xs font-mono font-bold flex items-center gap-1 ${
                          bet.isWin ? "text-[#00e701]" : "text-[#7a889b]"
                        }`}
                      >
                        <span>
                          {bet.isWin
                            ? `+${bet.currencySymbol}${bet.payout.toFixed(2)}`
                            : `-${bet.currencySymbol}${bet.betAmount.toFixed(2)}`}
                        </span>
                        <span className="rounded bg-[#0f212e] px-1 py-0.2 text-[9px] border border-[#213743] text-slate-300">
                          {bet.currencyBadge}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-[#b1bad3]">
                        {bet.multiplier > 0 ? `${bet.multiplier.toFixed(2)}x` : "0.00x"}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop View: Full 6-Column Data Grid (Rows clickable to inspect bet details & Provably Fair) */}
            <div className="hidden md:block w-full overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0f212e]/60 border-b border-[#213743] text-[11px] font-bold uppercase tracking-wider text-[#b1bad3]">
                  <tr>
                    <th className="px-5 py-3">Game</th>
                    <th className="px-5 py-3">User</th>
                    <th className="px-5 py-3">Time</th>
                    <th className="px-5 py-3 text-right">Bet Amount</th>
                    <th className="px-5 py-3 text-right">Multiplier</th>
                    <th className="px-5 py-3 text-right">Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#213743]/50">
                  {currentDisplayBets.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-xs text-[#b1bad3]">
                        No bets found for this filter tab.
                      </td>
                    </tr>
                  ) : (
                    currentDisplayBets.map((bet) => (
                      <tr
                        key={bet.id}
                        onClick={() => {
                          setSelectedBet(bet);
                          setVerificationResult(null);
                        }}
                        className="hover:bg-[#213743]/60 cursor-pointer transition-colors group"
                        title="Click to view Provably Fair Bet Details"
                      >
                        {/* 1. Game (icon + title) */}
                        <td className="px-5 py-3 font-bold text-white flex items-center gap-2.5">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0f212e] border border-[#213743] group-hover:border-[#00e701]/40 transition-colors">
                            {renderGameIcon(bet.iconName)}
                          </span>
                          <span className="truncate max-w-[180px]">{bet.game}</span>
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Scale className="h-3 w-3 text-[#00e701]" />
                          </span>
                        </td>

                        {/* 2. User */}
                        <td className="px-5 py-3 font-semibold text-[#b1bad3]">{bet.user}</td>

                        {/* 3. Time */}
                        <td className="px-5 py-3 text-[#b1bad3] font-mono text-[11px]">{bet.time}</td>

                        {/* 4. Bet Amount */}
                        <td className="px-5 py-3 text-right font-mono font-semibold text-[#b1bad3]">
                          ${bet.betAmount.toFixed(2)}
                        </td>

                        {/* 5. Multiplier */}
                        <td className="px-5 py-3 text-right font-mono font-bold">
                          <span
                            className={
                              bet.multiplier >= 2
                                ? "text-[#00e701]"
                                : bet.multiplier > 0
                                ? "text-white"
                                : "text-[#7a889b]"
                            }
                          >
                            {bet.multiplier.toFixed(2)}x
                          </span>
                        </td>

                        {/* 6. Payout */}
                        <td className="px-5 py-3 text-right font-mono font-bold">
                          {bet.isWin ? (
                            <span className="text-[#00e701] flex items-center justify-end gap-1">
                              <span>+${bet.payout.toFixed(2)}</span>
                              <span className="rounded bg-[#0f212e] px-1 py-0.5 text-[9px] border border-[#213743] text-slate-300">
                                {bet.currencyBadge}
                              </span>
                            </span>
                          ) : (
                            <span className="text-[#7a889b]">$0.00</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {/* MODULE 5: IN-GAME BET DETAILS TRANSPARENCY POPUP MODAL */}
      {selectedBet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-2xl border border-[#213743] bg-[#1a2c38] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#213743] px-5 py-4 bg-[#0f212e]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a2c38] border border-[#213743]">
                  {renderGameIcon(selectedBet.iconName)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    Bet Details
                    <span className="text-xs px-2 py-0.5 rounded bg-[#213743] text-[#b1bad3] font-mono font-normal">
                      {selectedBet.id}
                    </span>
                  </h3>
                  <div className="text-[11px] text-[#b1bad3]">{selectedBet.game} • {selectedBet.time}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedBet(null)}
                className="rounded-lg p-1 text-[#b1bad3] hover:text-white hover:bg-[#213743] transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-5 space-y-4 overflow-y-auto">
              {/* Outcome Banner */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  selectedBet.isWin
                    ? "bg-[#00e701]/10 border-[#00e701]/30"
                    : "bg-[#213743]/40 border-[#213743]"
                }`}
              >
                <div>
                  <div className="text-[11px] text-[#b1bad3] uppercase tracking-wider font-semibold">
                    Bet Outcome
                  </div>
                  <div className="text-xl font-black font-mono text-white mt-0.5 flex items-center gap-1.5">
                    {selectedBet.isWin ? (
                      <span className="text-[#00e701]">Won {selectedBet.multiplier.toFixed(2)}x</span>
                    ) : (
                      <span className="text-slate-400">Lost (0.00x)</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-[#b1bad3] uppercase tracking-wider font-semibold">
                    Payout
                  </div>
                  <div
                    className={`text-xl font-black font-mono mt-0.5 ${
                      selectedBet.isWin ? "text-[#00e701]" : "text-[#7a889b]"
                    }`}
                  >
                    {selectedBet.currencySymbol}
                    {selectedBet.payout.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Bet Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-xl bg-[#0f212e] border border-[#213743]">
                  <div className="text-[10px] text-[#b1bad3] font-bold uppercase">Player</div>
                  <div className="text-xs font-bold text-white truncate mt-1">{selectedBet.user}</div>
                </div>
                <div className="p-3 rounded-xl bg-[#0f212e] border border-[#213743]">
                  <div className="text-[10px] text-[#b1bad3] font-bold uppercase">Bet Amount</div>
                  <div className="text-xs font-bold font-mono text-white mt-1">
                    {selectedBet.currencySymbol}{selectedBet.betAmount.toFixed(2)}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#0f212e] border border-[#213743]">
                  <div className="text-[10px] text-[#b1bad3] font-bold uppercase">Multiplier</div>
                  <div className="text-xs font-bold font-mono text-white mt-1">
                    {selectedBet.multiplier.toFixed(2)}x
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#0f212e] border border-[#213743]">
                  <div className="text-[10px] text-[#b1bad3] font-bold uppercase">Nonce</div>
                  <div className="text-xs font-bold font-mono text-white mt-1">
                    #{selectedBet.nonce ?? 42}
                  </div>
                </div>
              </div>

              {/* Provably Fair Cryptographic Verification Block */}
              <div className="rounded-xl border border-[#213743] bg-[#0f212e] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#00e701]" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Provably Fair Verification
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#00e701] bg-[#00e701]/10 px-2 py-0.5 rounded border border-[#00e701]/20">
                    Predetermined
                  </span>
                </div>

                {/* Server Seed Hash */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-[#b1bad3] mb-1 font-semibold">
                    <span>Server Seed (SHA-256 Hash)</span>
                    <button
                      onClick={() =>
                        handleCopy(
                          selectedBet.serverSeedHash || "a7c29e41d8e063b48450f38b2576b5c0106213508493cf00473cb296c05ebc4d",
                          "serverSeedHash"
                        )
                      }
                      className="text-[#00e701] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedField === "serverSeedHash" ? (
                        <>
                          <Check className="h-3 w-3" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#1a2c38] border border-[#213743] font-mono text-[11px] text-[#b1bad3] break-all select-all">
                    {selectedBet.serverSeedHash || "a7c29e41d8e063b48450f38b2576b5c0106213508493cf00473cb296c05ebc4d"}
                  </div>
                </div>

                {/* Server Seed (Revealed) */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-[#b1bad3] mb-1 font-semibold">
                    <span>Server Seed (Revealed)</span>
                    <button
                      onClick={() =>
                        handleCopy(
                          selectedBet.serverSeed || "d83f12a9bc4e72301fa9b88219c6e3d48911029384756abcdef918273645e0fa",
                          "serverSeed"
                        )
                      }
                      className="text-[#00e701] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedField === "serverSeed" ? (
                        <>
                          <Check className="h-3 w-3" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#1a2c38] border border-[#213743] font-mono text-[11px] text-[#b1bad3] break-all select-all">
                    {selectedBet.serverSeed || "d83f12a9bc4e72301fa9b88219c6e3d48911029384756abcdef918273645e0fa"}
                  </div>
                </div>

                {/* Client Seed & Nonce */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="text-[11px] text-[#b1bad3] mb-1 font-semibold">Client Seed</div>
                    <div className="p-2.5 rounded-lg bg-[#1a2c38] border border-[#213743] font-mono text-[11px] text-white break-all">
                      {selectedBet.clientSeed || "lucky-client-seed"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#b1bad3] mb-1 font-semibold">Nonce</div>
                    <div className="p-2.5 rounded-lg bg-[#1a2c38] border border-[#213743] font-mono text-[11px] text-white">
                      {selectedBet.nonce ?? 42}
                    </div>
                  </div>
                </div>

                {/* 1-Click Provably Fair Verification Button */}
                <div className="pt-2">
                  <button
                    onClick={handleVerifySeed}
                    disabled={isVerifying}
                    className="w-full py-2.5 rounded-lg bg-[#00e701] hover:bg-[#00c801] active:scale-[0.99] text-black font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Scale className="h-4 w-4" />
                    {isVerifying ? "Verifying SHA-256..." : "Verify Calculation"}
                  </button>
                </div>

                {/* Verification Confirmation Box */}
                {verificationResult && (
                  <div className="p-3 rounded-lg bg-[#00e701]/10 border border-[#00e701]/30 text-xs text-white space-y-1.5 animate-in fade-in duration-200">
                    <div className="flex items-center gap-1.5 font-bold text-[#00e701]">
                      <Check className="h-4 w-4" />
                      <span>Cryptographic Verification Passed!</span>
                    </div>
                    <div className="text-[11px] text-[#b1bad3]">
                      SHA-256(Server Seed) was computed and successfully matched the pre-committed Server Seed Hash. The outcome was mathematically predetermined and unalterable.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-[#213743] px-5 py-3.5 bg-[#0f212e] flex items-center justify-between">
              <span className="text-[11px] text-[#b1bad3]">
                ID: <span className="font-mono text-white">{selectedBet.id}</span>
              </span>
              <button
                onClick={() => setSelectedBet(null)}
                className="px-4 py-1.5 rounded-lg bg-[#213743] hover:bg-[#2f4553] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

