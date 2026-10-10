"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import CommunityChat from "@/components/CommunityChat";
import AuthModal from "@/components/auth/AuthModal";
import ScrollToTop from "@/components/ScrollToTop";
import StakeFooter from "@/components/StakeFooter";
import { useGame } from "@/context/GameContext";

export default function MainLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSidebarOpen, isChatOpen } = useGame();
  const pathname = usePathname();
  const isGamePage = pathname?.startsWith("/games") || pathname?.startsWith("/casino/games");

  return (
    <div className="min-h-screen bg-[#0f212e] text-white flex flex-col font-sans selection:bg-[#00e701] selection:text-[#0f212e]">
      {/* Top Navbar */}
      <Navbar />

      <div className="flex flex-1">
        {/* Collapsible Sidebar */}
        <Sidebar />

        {/* Dynamic Responsive Main Content Area */}
        <main
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "lg:pl-64" : "lg:pl-16"
          } ${isChatOpen ? "xl:pr-[350px]" : ""} ${isGamePage ? "" : "min-h-[calc(100vh-60px)]"}`}
        >
          <div
            className={`w-full relative ${
              isGamePage ? "pb-4 sm:pb-6" : "flex-1 app-bottom-spacer min-h-screen"
            }`}
          >
            {children}
            {/* Dedicated safety spacer so lowest button or table row can ALWAYS scroll 100% cleanly (hidden on game pages) */}
            {!isGamePage && (
              <div className="h-20 sm:h-24 w-full shrink-0 pointer-events-none" />
            )}
          </div>
          {/* Universal Stake Footer */}
          <StakeFooter />
        </main>

        {/* Community Chat Slide-over Drawer */}
        <CommunityChat />
      </div>

      {/* Mobile Fixed Bottom Navigation */}
      <MobileBottomNav />

      {/* Authentic Stake Sign In & Register Modal */}
      <AuthModal />

      {/* Floating Scroll-To-Top Button */}
      <ScrollToTop />
    </div>
  );
}
