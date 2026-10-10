"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  MessageSquare,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { StakeLogo } from "@/components/common/StakeLogo";

export default function MobileBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { toggleChat, isChatOpen, toggleSidebar, isSidebarOpen } = useGame();
  const [activeTab, setActiveTab] = useState<string>("casino");

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === "chat") {
      toggleChat();
    } else if (tabId === "menu") {
      toggleSidebar();
    }
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleTabClick("home");
    if (typeof window !== "undefined") {
      if (window.location.pathname === "/casino/home" || window.location.pathname === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        window.location.assign("/casino/home");
      }
    }
  };

  const handleCasinoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleTabClick("casino");
    if (typeof window !== "undefined") {
      if (window.location.pathname === "/casino/home" || window.location.pathname === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        window.location.assign("/casino/home");
      }
    }
  };

  const isHomeActive = pathname === "/";
  const isCasinoActive = (pathname === "/casino/home" || pathname?.startsWith("/games") || pathname?.startsWith("/casino")) && !isHomeActive && !isChatOpen;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[9990] md:hidden bg-[#0f212e] border-t-2 border-[#2f4553] px-2 py-1.5 pb-safe select-none shadow-2xl">
      {/* Seamless Flush Arch Curve on Top Border (Zero Downward Overflow Tails) */}
      <div className="absolute -top-[24px] left-1/2 -translate-x-1/2 w-28 sm:w-32 h-[26px] pointer-events-none z-10 overflow-visible">
        <svg
          viewBox="0 0 120 26"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Background fill seamlessly masking the straight horizontal border below */}
          <path
            d="M 0 24 C 28 24, 40 2, 60 2 C 80 2, 92 24, 120 24 L 120 30 L 0 30 Z"
            fill="#0f212e"
          />
          {/* Top border curve merging 100% flush horizontally into the top border line on both sides */}
          <path
            d="M 0 24 C 28 24, 40 2, 60 2 C 80 2, 92 24, 120 24"
            fill="none"
            stroke="#2f4553"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="flex items-center justify-between relative z-20">
        {/* Tab 1: 3-Line Hamburger Menu / Browse Drawer */}
        <button
          onClick={() => handleTabClick("menu")}
          aria-label="Toggle Navigation Drawer"
          className="flex flex-col items-center justify-center flex-1 py-1 transition-colors bg-transparent hover:bg-transparent active:bg-transparent cursor-pointer"
        >
          <div className="flex h-9 w-9 items-center justify-center bg-transparent">
            <svg
              width="27"
              height="27"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-colors ${isSidebarOpen && !isChatOpen
                ? "stroke-[#00e701]/85 text-[#00e701]/85"
                : "stroke-[#b1bad3] text-[#b1bad3]"
                }`}
            >
              <line x1="3" y1="6" x2="12" y2="6" />
              <line x1="3" y1="12" x2="10" y2="12" />
              <line x1="3" y1="18" x2="13" y2="18" />
              <circle cx="16" cy="12" r="4" />
              <path d="M19 15l3 3" />
            </svg>
          </div>
          <span
            className={`text-xs font-bold tracking-tight mt-0.5 transition-colors ${isSidebarOpen && !isChatOpen
              ? "text-[#00e701]/85"
              : "text-[#b1bad3]"
              }`}
          >
            Browse
          </span>
        </button>

        {/* Tab 2: Casino */}
        <button
          type="button"
          onClick={handleCasinoClick}
          aria-label="Casino"
          className="flex flex-col items-center justify-center flex-1 py-1 transition-colors bg-transparent hover:bg-transparent active:bg-transparent cursor-pointer border-none outline-none"
        >
          <div className="flex h-7 w-7 items-center justify-center bg-transparent">
            <svg
              className={`h-6 w-6 transition-colors ${isCasinoActive
                ? "fill-[#00e701]/85 text-[#00e701]/85"
                : "fill-[#b1bad3] text-[#b1bad3]"
                }`}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 15l-4-4 1.4-1.4 2.6 2.6 5.6-5.6L19 11l-7 7z" opacity="0.3" />
              <path d="M19 2H9C7.9 2 7 2.9 7 4v2h12c1.1 0 2 .9 2 2v10h2c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-4 6H5C3.9 8 3 8.9 3 10v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-3 8.5c-.8 0-1.5-.7-1.5-1.5s1.5-2.5 1.5-2.5 1.5 1.7 1.5 2.5-.7 1.5-1.5 1.5z" />
            </svg>
          </div>
          <span
            className={`text-xs font-bold tracking-tight mt-0.5 transition-colors ${isCasinoActive ? "text-[#00e701]/85" : "text-[#b1bad3]"
              }`}
          >
            Casino
          </span>
        </button>

        {/* Tab 3 (CENTER): S Logo Contained Comfortably Inside Flush Curve (Dampened micro-interaction) */}
        <button
          type="button"
          onClick={handleHomeClick}
          aria-label="Stake Home"
          className="flex items-center justify-center flex-1 py-1 -translate-y-3 relative z-[9999] pointer-events-auto cursor-pointer select-none bg-transparent hover:bg-transparent active:scale-95 transition-transform duration-150 border-none outline-none"
        >
          <StakeLogo
            collapsed={true}
            className={`w-5 h-5 transition-all duration-200 ease-out origin-center ${isHomeActive
              ? "scale-[2.35] fill-[#00e701]/90 text-[#00e701]/90"
              : "scale-[2.25] fill-[#b1bad3] text-[#b1bad3]"
              }`}
          />
        </button>

        {/* Tab 4: Sports */}
        <Link
          href="/sports"
          onClick={() => handleTabClick("sports")}
          className="flex flex-col items-center justify-center flex-1 py-1 transition-colors bg-transparent hover:bg-transparent active:bg-transparent cursor-pointer"
        >
          <div className="flex h-7 w-7 items-center justify-center bg-transparent">
            <svg
              className={`h-6 w-6 fill-none stroke-[2.2] transition-colors ${pathname === "/sports" && !isChatOpen
                ? "stroke-[#00e701]/85 text-[#00e701]/85"
                : "stroke-[#b1bad3] text-[#b1bad3]"
                }`}
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M4.93 4.93l4.24 4.24" />
              <path d="M14.83 9.17l4.24-4.24" />
              <path d="M14.83 14.83l4.24 4.24" />
              <path d="M9.17 14.83L4.93 19.07" />
              <line x1="12" y1="2" x2="12" y2="22" />
              <line x1="2" y1="12" x2="22" y2="12" />
            </svg>
          </div>
          <span
            className={`text-xs font-bold tracking-tight mt-0.5 transition-colors ${pathname === "/sports" && !isChatOpen
              ? "text-[#00e701]/85"
              : "text-[#b1bad3]"
              }`}
          >
            Sports
          </span>
        </Link>

        {/* Tab 5: Chat */}
        <button
          onClick={() => handleTabClick("chat")}
          className="flex flex-col items-center justify-center flex-1 py-1 transition-colors relative bg-transparent hover:bg-transparent active:bg-transparent cursor-pointer"
        >
          <div className="flex h-7 w-7 items-center justify-center relative bg-transparent">
            <MessageSquare
              className={`h-6 w-6 transition-colors ${isChatOpen
                ? "text-[#00e701]/85 stroke-[#00e701]/85"
                : "text-[#b1bad3] stroke-[#b1bad3]"
                }`}
              strokeWidth={2.2}
            />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e701] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00e701]" />
            </span>
          </div>
          <span
            className={`text-xs font-bold tracking-tight mt-0.5 transition-colors ${isChatOpen ? "text-[#00e701]/85" : "text-[#b1bad3]"
              }`}
          >
            Chat
          </span>
        </button>
      </div>
    </nav>
  );
}
