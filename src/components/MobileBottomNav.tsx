"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { useGame } from "@/context/GameContext";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { toggleChat, isChatOpen } = useGame();
  const [activeTab, setActiveTab] = useState<string>("casino");

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === "chat") {
      toggleChat();
    } else if (tabId === "browse") {
      // Focus game search input if present
      const searchInput = document.getElementById("game-search-input");
      if (searchInput) {
        searchInput.focus();
        searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const isCasinoActive = (pathname === "/" || pathname?.startsWith("/games")) && activeTab === "casino" && !isChatOpen;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#0f212e] border-t border-[#213743] px-2 py-1.5 pb-safe select-none shadow-2xl">
      <div className="flex items-center justify-between">
        {/* Tab 1: Browse */}
        <button
          onClick={() => handleTabClick("browse")}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === "browse" && !isChatOpen
              ? "text-[#00e701]"
              : "text-[#b1bad3] hover:text-white"
          }`}
        >
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition-transform ${
              activeTab === "browse" && !isChatOpen
                ? "bg-[#00e701]/15 text-[#00e701] scale-110"
                : ""
            }`}
          >
            <Search className="h-5 w-5" />
          </div>
          <span
            className={`text-[10px] mt-0.5 tracking-wide ${
              activeTab === "browse" && !isChatOpen
                ? "text-[#00e701] font-bold"
                : "text-[#b1bad3] font-medium"
            }`}
          >
            Browse
          </span>
        </button>

        {/* Tab 2: Casino (Cards with heart icon - default active) */}
        <Link
          href="/casino/home"
          onClick={() => handleTabClick("casino")}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            isCasinoActive
              ? "text-[#00e701]"
              : "text-[#b1bad3] hover:text-white"
          }`}
        >
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition-transform ${
              isCasinoActive
                ? "bg-[#00e701]/15 text-[#00e701] scale-110"
                : ""
            }`}
          >
            {/* Playing cards icon */}
            <svg
              className="h-5 w-5 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 15l-4-4 1.4-1.4 2.6 2.6 5.6-5.6L19 11l-7 7z" opacity="0.3" />
              <path d="M19 2H9C7.9 2 7 2.9 7 4v2h12c1.1 0 2 .9 2 2v10h2c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-4 6H5C3.9 8 3 8.9 3 10v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-3 8.5c-.8 0-1.5-.7-1.5-1.5s1.5-2.5 1.5-2.5 1.5 1.7 1.5 2.5-.7 1.5-1.5 1.5z" />
            </svg>
          </div>
          <span
            className={`text-[10px] mt-0.5 tracking-wide ${
              isCasinoActive ? "text-[#00e701] font-bold" : "text-[#b1bad3] font-medium"
            }`}
          >
            Casino
          </span>
        </Link>

        {/* Tab 3: For You (Sparkle / Gift star icon) */}
        <button
          onClick={() => handleTabClick("foryou")}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === "foryou" && !isChatOpen
              ? "text-[#00e701]"
              : "text-[#b1bad3] hover:text-white"
          }`}
        >
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition-transform ${
              activeTab === "foryou" && !isChatOpen
                ? "bg-[#00e701]/15 text-[#00e701] scale-110"
                : ""
            }`}
          >
            <Sparkles className="h-5 w-5" />
          </div>
          <span
            className={`text-[10px] mt-0.5 tracking-wide ${
              activeTab === "foryou" && !isChatOpen
                ? "text-[#00e701] font-bold"
                : "text-[#b1bad3] font-medium"
            }`}
          >
            For You
          </span>
        </button>

        {/* Tab 4: Sports (Basketball / Soccer ball icon) */}
        <button
          onClick={() => handleTabClick("sports")}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === "sports" && !isChatOpen
              ? "text-[#00e701]"
              : "text-[#b1bad3] hover:text-white"
          }`}
        >
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition-transform ${
              activeTab === "sports" && !isChatOpen
                ? "bg-[#00e701]/15 text-[#00e701] scale-110"
                : ""
            }`}
          >
            {/* Basketball / Sports SVG */}
            <svg
              className="h-5 w-5 fill-none stroke-current stroke-2"
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
            className={`text-[10px] mt-0.5 tracking-wide ${
              activeTab === "sports" && !isChatOpen
                ? "text-[#00e701] font-bold"
                : "text-[#b1bad3] font-medium"
            }`}
          >
            Sports
          </span>
        </button>

        {/* Tab 5: Chat (Chat bubble icon, toggles CommunityChat drawer) */}
        <button
          onClick={() => handleTabClick("chat")}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all relative ${
            isChatOpen
              ? "text-[#00e701]"
              : "text-[#b1bad3] hover:text-white"
          }`}
        >
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition-transform relative ${
              isChatOpen
                ? "bg-[#00e701]/15 text-[#00e701] scale-110"
                : ""
            }`}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e701] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00e701]" />
            </span>
          </div>
          <span
            className={`text-[10px] mt-0.5 tracking-wide ${
              isChatOpen ? "text-[#00e701] font-bold" : "text-[#b1bad3] font-medium"
            }`}
          >
            Chat
          </span>
        </button>
      </div>
    </nav>
  );
}
