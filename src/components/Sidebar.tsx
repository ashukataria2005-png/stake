"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Flame,
  Bomb,
  TrendingUp,
  CircleDot,
  Dice5,
  Gamepad2,
  ShieldCheck,
  Headphones,
  Trophy,
  Gift,
  HelpCircle,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Zap,
} from "lucide-react";
import { useGame } from "@/context/GameContext";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  isOriginal?: boolean;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, setSidebarOpen } = useGame();

  const originalGames: NavItem[] = [
    { name: "Mines", href: "/games/mines", icon: Bomb, badge: "Popular", isOriginal: true },
    { name: "Crash", href: "/games/crash", icon: TrendingUp, badge: "Hot", isOriginal: true },
    { name: "Plinko", href: "/games/plinko", icon: CircleDot, badge: "Original", isOriginal: true },
    { name: "Dice", href: "/games/dice", icon: Dice5, badge: "Classic", isOriginal: true },
    { name: "Limbo", href: "/games/limbo", icon: Zap, badge: "Original", isOriginal: true },
    { name: "Blackjack", href: "/games/blackjack", icon: Trophy, badge: "21", isOriginal: true },
    { name: "Roulette", href: "/games/roulette", icon: Sparkles, badge: "Classic", isOriginal: true },
    { name: "Keno", href: "/games/keno", icon: Sparkles, badge: "Original", isOriginal: true },
    { name: "Wheel", href: "/games/wheel", icon: CircleDot, badge: "Original", isOriginal: true },
  ];

  const mainCategories: NavItem[] = [
    { name: "Casino Lobby", href: "/casino/home", icon: Gamepad2 },
    { name: "Stake Originals", href: "/casino/group/stake-originals", icon: Flame, badge: "31" },
    { name: "Live Casino", href: "/casino/group/live-casino", icon: Sparkles, badge: "Live" },
    { name: "Slots", href: "/casino/group/slots", icon: Trophy },
    { name: "Providers", href: "/casino/collection/providers", icon: Gift, badge: "19" },
  ];

  const bottomLinks = [
    { name: "Provably Fair", href: "#provably-fair", icon: ShieldCheck },
    { name: "Live Support", href: "#support", icon: Headphones, badge: "24/7" },
    { name: "Help Center", href: "#help", icon: HelpCircle },
  ];

  return (
    <>
      {/* Mobile backdrop when sidebar is open on small viewports */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-30 flex flex-col border-r border-[#213743] bg-[#1a2c38] transition-all duration-300 ease-in-out ${
          isSidebarOpen
            ? "w-64 translate-x-0"
            : "-translate-x-full lg:w-16 lg:translate-x-0"
        }`}
      >
        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-6">
          {/* Main Navigation */}
          <div>
            {isSidebarOpen && (
              <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-[#b1bad3]">
                Casino
              </div>
            )}
            <div className="space-y-1">
              {mainCategories.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    title={!isSidebarOpen ? item.name : undefined}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-[#213743] text-white shadow-sm"
                        : "text-[#b1bad3] hover:bg-[#213743]/70 hover:text-white"
                    } ${!isSidebarOpen ? "justify-center px-0" : ""}`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-colors ${
                        isActive
                          ? "text-[#00e701]"
                          : "text-[#b1bad3] group-hover:text-white"
                      }`}
                    />
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
              <div className="flex items-center justify-between px-3 pb-2">
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
                  31 Games &gt;
                </Link>
              </div>
            ) : (
              <div className="my-2 border-t border-[#213743]" />
            )}

            <div className="space-y-1">
              {originalGames.map((game) => {
                const Icon = game.icon;
                const isActive = pathname === game.href;
                return (
                  <Link
                    key={game.name}
                    href={game.href}
                    title={!isSidebarOpen ? game.name : undefined}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                      isActive
                        ? "bg-[#213743] text-white font-semibold"
                        : "text-[#b1bad3] hover:bg-[#213743]/80 hover:text-white"
                    } ${!isSidebarOpen ? "justify-center px-0" : ""}`}
                  >
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors ${
                        isActive
                          ? "bg-[#00e701]/20 text-[#00e701]"
                          : "bg-[#0f212e] text-[#b1bad3] group-hover:bg-[#2f4553] group-hover:text-[#00e701]"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>

                    {isSidebarOpen && (
                      <div className="flex flex-1 items-center justify-between">
                        <span className="font-semibold text-white tracking-wide">
                          {game.name}
                        </span>
                        {game.badge && (
                          <span
                            className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                              game.badge === "Hot"
                                ? "bg-red-500/20 text-red-400"
                                : game.badge === "Popular"
                                ? "bg-[#00e701]/20 text-[#00e701]"
                                : "bg-blue-500/20 text-blue-400"
                            }`}
                          >
                            {game.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Stake Community / Features */}
          {isSidebarOpen && (
            <div className="rounded-xl border border-[#213743] bg-[#0f212e]/70 p-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-[#00e701] animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-white">
                  Rakeback Active
                </span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-[#b1bad3]">
                Enjoy up to 10% instant rakeback on all game wagers.
              </p>
              <div className="mt-2 flex items-center justify-between text-[11px] font-bold text-[#00e701]">
                <span>Claim Bonus</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </div>
          )}
        </div>

        {/* Bottom Section (Provably Fair, Live Support) */}
        <div className="border-t border-[#213743] p-2 space-y-1 bg-[#1a2c38]">
          {bottomLinks.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.href}
                title={!isSidebarOpen ? item.name : undefined}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-[#b1bad3] transition-colors hover:bg-[#213743] hover:text-white ${
                  !isSidebarOpen ? "justify-center px-0" : ""
                }`}
              >
                <Icon className="h-4 w-4 shrink-0 text-[#b1bad3] group-hover:text-[#00e701]" />
                {isSidebarOpen && (
                  <div className="flex flex-1 items-center justify-between">
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className="rounded bg-[#00e701]/10 px-1 py-0.5 text-[9px] font-bold text-[#00e701]">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </a>
            );
          })}
        </div>
      </aside>
    </>
  );
}
