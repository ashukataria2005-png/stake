"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import CommunityChat from "@/components/CommunityChat";
import GoogleOneTap from "@/components/GoogleOneTap";
import { useGame } from "@/context/GameContext";

export default function MainLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSidebarOpen, isChatOpen } = useGame();

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
          } ${isChatOpen ? "xl:pr-[340px]" : ""} pb-20 lg:pb-8`}
        >
          {children}
        </main>

        {/* Community Chat Slide-over Drawer */}
        <CommunityChat />
      </div>

      {/* Mobile Fixed Bottom Navigation */}
      <MobileBottomNav />

      {/* Google One-Tap Bottom Sheet Drawer */}
      <GoogleOneTap />
    </div>
  );
}
