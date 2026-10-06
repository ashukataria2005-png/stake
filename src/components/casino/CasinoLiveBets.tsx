"use client";

import React, { useState, useEffect } from "react";
import { Gamepad2, Bomb, TrendingUp, CircleDot, Dice5, Zap } from "lucide-react";
import { useGame } from "@/context/GameContext";

interface CasinoBetItem {
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
}

export default function CasinoLiveBets() {
  const { currency } = useGame();
  const [activeTab, setActiveTab] = useState<"all" | "my" | "high">("all");
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const initialBets: CasinoBetItem[] = [
    {
      id: "cb-1",
      game: "Mines",
      iconName: "mines",
      user: "Hidden",
      time: "Just now",
      betAmount: 150.0,
      multiplier: 3.25,
      payout: 487.5,
      isWin: true,
      currencyBadge: "USDT ₮",
      currencySymbol: "$",
    },
    {
      id: "cb-2",
      game: "Plinko",
      iconName: "plinko",
      user: "Satoshi_88",
      time: "1s ago",
      betAmount: 50.0,
      multiplier: 29.0,
      payout: 1450.0,
      isWin: true,
      currencyBadge: "CA$",
      currencySymbol: "CA$",
    },
    {
      id: "cb-3",
      game: "Crash",
      iconName: "crash",
      user: "CryptoViper",
      time: "2s ago",
      betAmount: 800.0,
      multiplier: 0.0,
      payout: 0.0,
      isWin: false,
      currencyBadge: "ARS",
      currencySymbol: "ARS",
    },
    {
      id: "cb-4",
      game: "Dice",
      iconName: "dice",
      user: "ApexBettor",
      time: "3s ago",
      betAmount: 200.0,
      multiplier: 1.98,
      payout: 396.0,
      isWin: true,
      currencyBadge: "INR ₹",
      currencySymbol: "₹",
    },
    {
      id: "cb-5",
      game: "Limbo",
      iconName: "limbo",
      user: "NeonGhost",
      time: "4s ago",
      betAmount: 100.0,
      multiplier: 12.5,
      payout: 1250.0,
      isWin: true,
      currencyBadge: "DOGE Ð",
      currencySymbol: "Ð",
    },
    {
      id: "cb-6",
      game: "Sweet Bonanza 1000",
      iconName: "slots",
      user: "SugarKing",
      time: "5s ago",
      betAmount: 40.0,
      multiplier: 48.0,
      payout: 1920.0,
      isWin: true,
      currencyBadge: "USDT ₮",
      currencySymbol: "$",
    },
  ];

  const [betsList, setBetsList] = useState<CasinoBetItem[]>(initialBets);

  // Live auto-streaming every 1.5s
  useEffect(() => {
    if (isPaused) return;

    const games = ["Mines", "Crash", "Plinko", "Dice", "Limbo", "Gates of Olympus", "Sugar Rush", "Blackjack"];
    const users = ["Hidden", "mocker35", "Satoshi_88", "CryptoViper", "AlphaWolf", "GoldRush", "ZeusMaster", "ApexKing"];
    const localizedCurrencies = [
      { badge: "USDT ₮", symbol: "$" },
      { badge: "CA$", symbol: "CA$" },
      { badge: "ARS", symbol: "ARS" },
      { badge: "INR ₹", symbol: "₹" },
      { badge: "DOGE Ð", symbol: "Ð" },
    ];

    const interval = setInterval(() => {
      const g = games[Math.floor(Math.random() * games.length)];
      const u = users[Math.floor(Math.random() * users.length)];
      const curr = localizedCurrencies[Math.floor(Math.random() * localizedCurrencies.length)];

      const isHigh = Math.random() > 0.8;
      const betAmt = isHigh
        ? parseFloat((Math.random() * 2000 + 500).toFixed(2))
        : parseFloat((Math.random() * 100 + 10).toFixed(2));

      const isWin = Math.random() > 0.45;
      const multiplier = isWin
        ? parseFloat((Math.random() * 12 + 1.2).toFixed(2))
        : 0.0;
      const payout = isWin ? parseFloat((betAmt * multiplier).toFixed(2)) : 0.0;

      const newBet: CasinoBetItem = {
        id: `bet-${Date.now()}`,
        game: g,
        iconName: g.toLowerCase().split(" ")[0],
        user: u,
        time: "Just now",
        betAmount: betAmt,
        multiplier,
        payout,
        isWin,
        currencyBadge: curr.badge,
        currencySymbol: curr.symbol,
      };

      setBetsList((prev) => [newBet, ...prev.slice(0, 11)]);
    }, 1500);

    return () => clearInterval(interval);
  }, [isPaused]);

  const renderIcon = (iconName: string) => {
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
      default:
        return <Gamepad2 className="h-4 w-4 text-[#b1bad3]" />;
    }
  };

  const filteredBets = betsList.filter((b) => {
    if (activeTab === "high") return b.betAmount >= 400 || b.payout >= 1000;
    if (activeTab === "my") return b.user === "You" || b.user === "mocker35";
    return true;
  });

  return (
    <section className="rounded-2xl border border-[#213743] bg-[#1a2c38] overflow-hidden shadow-xl my-8">
      {/* 3 Tabs: "My Bets", "All Bets" (active), "High Rollers" */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-[#213743] p-4 sm:px-6 gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 select-none">
          <button
            onClick={() => setActiveTab("my")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "my"
                ? "bg-[#1475e1] text-white shadow-md"
                : "text-[#b1bad3] hover:text-white hover:bg-[#213743]"
            }`}
          >
            My Bets
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "all"
                ? "bg-[#1475e1] text-white shadow-md"
                : "text-[#b1bad3] hover:text-white hover:bg-[#213743]"
            }`}
          >
            All Bets
          </button>
          <button
            onClick={() => setActiveTab("high")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === "high"
                ? "bg-[#1475e1] text-white shadow-md"
                : "text-[#b1bad3] hover:text-white hover:bg-[#213743]"
            }`}
          >
            High Rollers
          </button>
        </div>

        {/* Live Feed Toggle Button */}
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
            <span>{isPaused ? "Paused" : "Live Ticker"}</span>
          </button>
        </div>
      </div>

      {/* Mobile View: Compact 2-Col Table */}
      <div className="block md:hidden divide-y divide-[#213743]/60">
        {filteredBets.map((bet) => (
          <div
            key={bet.id}
            className="flex items-center justify-between p-3.5 hover:bg-[#213743]/40 transition-colors animate-in fade-in slide-in-from-top-1 duration-200"
          >
            {/* Left: Game icon + Game Title */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0f212e] border border-[#213743] flex-shrink-0">
                {renderIcon(bet.iconName)}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">{bet.game}</div>
                <div className="text-[10px] text-[#b1bad3] truncate">
                  {bet.user} • {bet.time}
                </div>
              </div>
            </div>

            {/* Right: Payout with Localized Currency Pill Badge */}
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
                <span className="rounded bg-[#0f212e] px-1.5 py-0.5 text-[9px] font-bold border border-[#213743] text-slate-300">
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

      {/* Desktop View: Full 6-Col Data Grid */}
      <div className="hidden md:block w-full overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#0f212e]/60 border-b border-[#213743] text-[11px] font-bold uppercase tracking-wider text-[#b1bad3]">
            <tr>
              <th className="px-5 py-3">Game</th>
              <th className="px-5 py-3">Player</th>
              <th className="px-5 py-3">Time</th>
              <th className="px-5 py-3 text-right">Bet Amount</th>
              <th className="px-5 py-3 text-right">Multiplier</th>
              <th className="px-5 py-3 text-right">Payout</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#213743]/50">
            {filteredBets.map((bet) => (
              <tr
                key={bet.id}
                className="hover:bg-[#213743]/40 transition-colors animate-in fade-in slide-in-from-top-1 duration-200"
              >
                {/* Game */}
                <td className="px-5 py-3 font-bold text-white flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0f212e] border border-[#213743]">
                    {renderIcon(bet.iconName)}
                  </span>
                  <span className="truncate max-w-[180px]">{bet.game}</span>
                </td>

                {/* Player */}
                <td className="px-5 py-3 font-semibold text-[#b1bad3]">{bet.user}</td>

                {/* Time */}
                <td className="px-5 py-3 text-[#b1bad3] font-mono text-[11px]">{bet.time}</td>

                {/* Bet Amount */}
                <td className="px-5 py-3 text-right font-mono font-semibold text-[#b1bad3]">
                  ${bet.betAmount.toFixed(2)}
                </td>

                {/* Multiplier */}
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

                {/* Payout */}
                <td className="px-5 py-3 text-right font-mono font-bold">
                  {bet.isWin ? (
                    <span className="text-[#00e701] flex items-center justify-end gap-1.5">
                      <span>+${bet.payout.toFixed(2)}</span>
                      <span className="rounded bg-[#0f212e] px-1.5 py-0.5 text-[9px] font-bold border border-[#213743] text-slate-300">
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
    </section>
  );
}
