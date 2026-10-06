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
} from "lucide-react";

interface BetItem {
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
}

interface RaceLeader {
  rank: number;
  user: string;
  wagered: string;
  prize: string;
  flag: string;
}

export default function LiveBetsFeed() {
  const [activeTab, setActiveTab] = useState<"casino" | "sports" | "race">("casino");
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const initialBets: BetItem[] = [
    {
      id: "bet-1",
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
    },
    {
      id: "bet-2",
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
    },
    {
      id: "bet-3",
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
    },
    {
      id: "bet-4",
      game: "Blackjack",
      iconName: "blackjack",
      user: "Satoshi_88",
      time: "3:59 AM",
      betAmount: 250.0,
      multiplier: 2.0,
      payout: 500.0,
      isWin: true,
      currencyBadge: "₹",
      currencySymbol: "₹",
      category: "casino",
    },
    {
      id: "bet-5",
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
    },
    {
      id: "bet-6",
      game: "Crash",
      iconName: "crash",
      user: "NeonGhost",
      time: "3:58 AM",
      betAmount: 320.0,
      multiplier: 0.0,
      payout: 0.0,
      isWin: false,
      currencyBadge: "₮",
      currencySymbol: "$",
      category: "casino",
    },
  ];

  const sportsBetsPool: BetItem[] = [
    {
      id: "sp-1",
      game: "Real Madrid vs Man City",
      iconName: "soccer",
      user: "ApexBettor",
      time: "4:01 AM",
      betAmount: 500.0,
      multiplier: 2.45,
      payout: 1225.0,
      isWin: true,
      currencyBadge: "₮",
      currencySymbol: "$",
      category: "sports",
    },
    {
      id: "sp-2",
      game: "Lakers vs Warriors",
      iconName: "basketball",
      user: "Hidden",
      time: "4:00 AM",
      betAmount: 850.0,
      multiplier: 0.0,
      payout: 0.0,
      isWin: false,
      currencyBadge: "₮",
      currencySymbol: "$",
      category: "sports",
    },
    {
      id: "sp-3",
      game: "Arsenal vs Chelsea",
      iconName: "soccer",
      user: "LondonRed",
      time: "3:59 AM",
      betAmount: 200.0,
      multiplier: 3.1,
      payout: 620.0,
      isWin: true,
      currencyBadge: "£",
      currencySymbol: "£",
      category: "sports",
    },
    {
      id: "sp-4",
      game: "Djokovic vs Alcaraz",
      iconName: "tennis",
      user: "AceKing",
      time: "3:58 AM",
      betAmount: 1000.0,
      multiplier: 1.85,
      payout: 1850.0,
      isWin: true,
      currencyBadge: "₮",
      currencySymbol: "$",
      category: "sports",
    },
  ];

  const raceLeaderboard: RaceLeader[] = [
    { rank: 1, user: "WhaleKing_99", wagered: "$1,420,500.00", prize: "$25,000.00", flag: "🥇" },
    { rank: 2, user: "CryptoValkyrie", wagered: "$985,240.00", prize: "$12,500.00", flag: "🥈" },
    { rank: 3, user: "ApexRoll", wagered: "$654,100.00", prize: "$7,500.00", flag: "🥉" },
    { rank: 4, user: "Hidden", wagered: "$512,890.00", prize: "$5,000.00", flag: "4th" },
    { rank: 5, user: "Satoshi_N", wagered: "$420,000.00", prize: "$3,500.00", flag: "5th" },
    { rank: 6, user: "HighRollerVIP", wagered: "$380,450.00", prize: "$2,500.00", flag: "6th" },
  ];

  const [betsList, setBetsList] = useState<BetItem[]>(initialBets);

  // Auto-streaming: inserts randomized bet every 1.5s
  useEffect(() => {
    if (isPaused || activeTab === "race") return;

    const casinoGames = ["Limbo", "Dice", "Mines", "Blackjack", "Plinko", "Crash", "Roulette", "Keno"];
    const sportsGames = ["Real Madrid vs Bayern", "Arsenal vs PSG", "Celtics vs Heat", "UFC 302 Main Event"];
    const users = ["Hidden", "mocker35", "Satoshi_88", "AlphaWolf", "NeonGhost", "Valkyrie_X", "LuckyStrike", "ApexKing"];
    const currencies = [
      { badge: "₮", symbol: "$" },
      { badge: "ARS", symbol: "ARS" },
      { badge: "₹", symbol: "₹" },
      { badge: "₮", symbol: "$" },
    ];

    const interval = setInterval(() => {
      const isCasino = activeTab === "casino";
      const gamePool = isCasino ? casinoGames : sportsGames;
      const selectedGame = gamePool[Math.floor(Math.random() * gamePool.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      const curr = currencies[Math.floor(Math.random() * currencies.length)];

      const betAmount = parseFloat((Math.random() * 400 + 10).toFixed(2));
      const isWin = Math.random() > 0.48;
      const multiplier = isWin
        ? parseFloat((Math.random() * 8 + 1.2).toFixed(2))
        : 0.0;
      const payout = isWin ? parseFloat((betAmount * multiplier).toFixed(2)) : 0.0;

      const now = new Date();
      const timeStr = `${now.getHours() % 12 || 12}:${String(now.getMinutes()).padStart(2, "0")} ${now.getHours() >= 12 ? "PM" : "AM"}`;

      const newBet: BetItem = {
        id: `stream-${Date.now()}`,
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
        category: isCasino ? "casino" : "sports",
      };

      setBetsList((prev) => [newBet, ...prev.slice(0, 11)]);
    }, 1500);

    return () => clearInterval(interval);
  }, [isPaused, activeTab]);

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
    <section className="rounded-2xl border border-[#213743] bg-[#1a2c38] overflow-hidden shadow-xl my-8">
      {/* 3 Segmented Filter Tabs Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-[#213743] p-4 sm:px-6 gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => {
              setActiveTab("casino");
              setBetsList(initialBets);
            }}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "casino"
                ? "bg-[#1475e1] text-white shadow-md"
                : "text-[#b1bad3] hover:text-white hover:bg-[#213743]"
            }`}
          >
            Casino Bets
          </button>
          <button
            onClick={() => {
              setActiveTab("sports");
              setBetsList(sportsBetsPool);
            }}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "sports"
                ? "bg-[#1475e1] text-white shadow-md"
                : "text-[#b1bad3] hover:text-white hover:bg-[#213743]"
            }`}
          >
            Sports Bets
          </button>
          <button
            onClick={() => setActiveTab("race")}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "race"
                ? "bg-[#1475e1] text-white shadow-md"
                : "text-[#b1bad3] hover:text-white hover:bg-[#213743]"
            }`}
          >
            Race Leaderboard
          </button>
        </div>

        {/* Live status / Pause Button */}
        {activeTab !== "race" && (
          <div className="flex items-center gap-3 self-end sm:self-center">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="flex items-center gap-2 rounded-lg border border-[#213743] bg-[#0f212e] px-2.5 py-1 text-xs font-semibold text-[#b1bad3] hover:text-white transition-colors cursor-pointer"
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isPaused ? "bg-amber-400" : "bg-[#00e701] animate-pulse"
                }`}
              />
              <span>{isPaused ? "Paused" : "Live Feed"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Race Leaderboard View */}
      {activeTab === "race" ? (
        <div className="w-full overflow-x-auto">
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
      ) : (
        <>
          {/* Mobile View: Compact 2-Column Table (Left: Game icon + title, Right: Payout with currency badge) */}
          <div className="block md:hidden divide-y divide-[#213743]/60">
            {betsList.map((bet) => (
              <div
                key={bet.id}
                className="flex items-center justify-between p-3.5 hover:bg-[#213743]/40 transition-colors animate-in fade-in slide-in-from-top-1 duration-200"
              >
                {/* Left: Game icon + Game Title */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0f212e] border border-[#213743] flex-shrink-0">
                    {renderGameIcon(bet.iconName)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{bet.game}</div>
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
            ))}
          </div>

          {/* Desktop View: Full 6-Column Data Grid */}
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
                {betsList.map((bet) => (
                  <tr
                    key={bet.id}
                    className="hover:bg-[#213743]/40 transition-colors animate-in fade-in slide-in-from-top-1 duration-200"
                  >
                    {/* 1. Game (icon + title) */}
                    <td className="px-5 py-3 font-bold text-white flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0f212e] border border-[#213743]">
                        {renderGameIcon(bet.iconName)}
                      </span>
                      <span className="truncate max-w-[180px]">{bet.game}</span>
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
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
