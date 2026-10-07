"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  MessageSquare,
} from "lucide-react";
import { useGame } from "@/context/GameContext";

export default function MobileBottomNav() {
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

  const isHomeActive = pathname === "/";
  const isCasinoActive = (pathname === "/casino/home" || pathname?.startsWith("/games") || pathname?.startsWith("/casino")) && !isHomeActive && !isChatOpen;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#0f212e] border-t-2 border-[#2f4553] px-2 py-1.5 pb-safe select-none shadow-2xl">
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
          <div className="flex h-8 w-8 items-center justify-center bg-transparent">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-colors ${isSidebarOpen && !isChatOpen
                  ? "stroke-[#00e701] text-[#00e701]"
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
                ? "text-[#00e701]"
                : "text-[#b1bad3]"
              }`}
          >
            Browse
          </span>
        </button>

        {/* Tab 2: Casino */}
        <Link
          href="/casino/home"
          onClick={() => handleTabClick("casino")}
          className="flex flex-col items-center justify-center flex-1 py-1 transition-colors bg-transparent hover:bg-transparent active:bg-transparent cursor-pointer"
        >
          <div className="flex h-7 w-7 items-center justify-center bg-transparent">
            <svg
              className={`h-6 w-6 transition-colors ${isCasinoActive
                ? "fill-[#00e701] text-[#00e701]"
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
            className={`text-xs font-bold tracking-tight mt-0.5 transition-colors ${isCasinoActive ? "text-[#00e701]" : "text-[#b1bad3]"
              }`}
          >
            Casino
          </span>
        </Link>

        {/* Tab 3 (CENTER): S Logo Contained Comfortably Inside Flush Curve (+80% default, +20% active) */}
        <Link
          href="/"
          onClick={() => handleTabClick("home")}
          aria-label="Stake Home"
          className="flex items-center justify-center flex-1 py-1 -translate-y-3 relative z-20 cursor-pointer select-none bg-transparent hover:bg-transparent active:bg-transparent"
        >
          <svg
            viewBox="0 0 25 40"
            className={`w-5 h-5 transition-all duration-200 ease-out origin-center active:scale-[2.05] ${isHomeActive
              ? "scale-[2.85] fill-[#00e701] text-[#00e701] drop-shadow-[0_0_8px_rgba(0,231,1,0.6)]"
              : "scale-[2.25] fill-[#b1bad3] text-[#b1bad3]"
              }`}
          >
            <path d="M17.408 19.336c2.432-1.048 4.296-2.568 5.6-4.568 1.304-2 1.952-4.4 1.952-7.2 0-2.48-.568-4.6-1.704-6.36C22.12.968 20.512 0 18.424 0c-.88 0-1.68.216-2.4.648s-1.32 1.056-1.8 1.872l-1.488 2.544C11.664 6.944 9.8 8.04 7.144 8.352v-2.88c0-1.552-.408-2.768-1.224-3.648C5.104.944 4.016.504 2.656.504c-.816 0-1.504.288-2.064.864C.032 1.944-.144 2.68.048 3.576l3.52 16.512c.384 1.76 1.168 3.2 2.352 4.32 1.184 1.12 2.688 1.68 4.512 1.68h.864c3.424-.48 5.92-1.92 7.488-4.32.48-.736.88-1.544 1.2-2.424l-2.576-.008zm5.728 10.368c-1.28 1.84-3.08 3.248-5.4 4.224-2.32.976-5.04 1.464-8.16 1.464-2.848 0-5.184-.52-7.008-1.56-1.824-1.04-2.736-2.488-2.736-4.344 0-1.2.392-2.2 1.176-3 .784-.8 1.832-1.2 3.144-1.2.704 0 1.344.152 1.92.456.576.304 1.056.768 1.44 1.392.512.832 1.152 1.488 1.92 1.968.768.48 1.76.72 2.976.72 1.472 0 2.624-.312 3.456-.936.832-.624 1.248-1.448 1.248-2.472 0-.896-.344-1.632-1.032-2.208-.688-.576-1.872-1.096-3.552-1.56l-2.784-.768c-3.136-.864-5.344-2.008-6.624-3.432-1.28-1.424-1.92-3.32-1.92-5.688 0-2.368.808-4.352 2.424-5.952C9.176 1.048 11.4.248 14.288.248c2.4 0 4.416.48 6.048 1.44 1.632.96 2.448 2.272 2.448 3.936 0 1.056-.368 1.952-1.104 2.688-.736.736-1.712 1.104-2.928 1.104-.64 0-1.216-.144-1.728-.432-.512-.288-.952-.72-1.32-1.296-.448-.672-1.04-1.192-1.776-1.56-.736-.368-1.632-.552-2.688-.552-1.216 0-2.16.272-2.832.816-.672.544-1.008 1.288-1.008 2.232 0 .864.336 1.56 1.008 2.088.672.528 1.808 1.008 3.408 1.44l2.784.768c3.296.928 5.616 2.152 6.96 3.672 1.344 1.52 2.016 3.472 2.016 5.856.008 2.656-.84 4.888-2.544 6.696z" />
          </svg>
        </Link>

        {/* Tab 4: Sports */}
        <Link
          href="/sports"
          onClick={() => handleTabClick("sports")}
          className="flex flex-col items-center justify-center flex-1 py-1 transition-colors bg-transparent hover:bg-transparent active:bg-transparent cursor-pointer"
        >
          <div className="flex h-7 w-7 items-center justify-center bg-transparent">
            <svg
              className={`h-6 w-6 fill-none stroke-[2.2] transition-colors ${pathname === "/sports" && !isChatOpen
                ? "stroke-[#00e701] text-[#00e701]"
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
              ? "text-[#00e701]"
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
                ? "text-[#00e701] stroke-[#00e701]"
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
            className={`text-xs font-bold tracking-tight mt-0.5 transition-colors ${isChatOpen ? "text-[#00e701]" : "text-[#b1bad3]"
              }`}
          >
            Chat
          </span>
        </button>
      </div>
    </nav>
  );
}
