"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, Bomb, TrendingUp, Dice5, CircleDot } from "lucide-react";

export default function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Lobby", href: "/", icon: Gamepad2 },
    { name: "Mines", href: "/games/mines", icon: Bomb },
    { name: "Crash", href: "/games/crash", icon: TrendingUp },
    { name: "Plinko", href: "/games/plinko", icon: CircleDot },
    { name: "Dice", href: "/games/dice", icon: Dice5 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-[#213743] bg-[#1a2c38]/95 backdrop-blur-md px-2 lg:hidden shadow-lg select-none">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all ${
              isActive
                ? "text-[#00e701]"
                : "text-[#b1bad3] hover:text-white"
            }`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-transform ${
                isActive
                  ? "bg-[#00e701]/15 text-[#00e701] scale-105"
                  : "hover:bg-[#213743]"
              }`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <span
              className={`text-[10px] font-semibold tracking-wide ${
                isActive ? "text-[#00e701] font-bold" : "text-[#b1bad3]"
              }`}
            >
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
