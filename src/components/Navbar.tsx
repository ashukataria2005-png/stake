"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Menu,
  Wallet,
  Bell,
  MessageSquare,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import WalletModal from "@/components/WalletModal";
import WalletSettingsModal from "@/components/WalletSettingsModal";
import CurrencyDropdown from "@/components/CurrencyDropdown";
import UserProfileMenu from "@/components/UserProfileMenu";
import CryptoIcon from "@/components/CryptoIcon";
import StakeLogo from "@/components/StakeLogo";

export default function Navbar() {
  const {
    balance,
    currency,
    resetBalance,
    toggleSidebar,
    isSidebarOpen,
    toggleChat,
    isChatOpen,
    isMounted,
    isAuthenticated,
    user,
    openOneTap,
    isWalletModalOpen,
    openWalletModal,
    closeWalletModal,
    isWalletSettingsOpen,
    closeWalletSettings,
    formatDisplayBalance,
  } = useGame();

  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [notificationActive, setNotificationActive] = useState(true);
  const [showVipPopover, setShowVipPopover] = useState(false);

  // Close dropdowns on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsCurrencyDropdownOpen(false);
        setIsProfileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const displayInfo = isMounted
    ? formatDisplayBalance()
    : { amount: "1,000.00", symbol: "$", code: "USDT", isFiat: false };

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[#213743] bg-[#1a2c38] px-3 sm:px-5 select-none">
        {/* Left Section: Sidebar Toggle & Authentic Stake Cursive Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={toggleSidebar}
            aria-label="Toggle Navigation Sidebar"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[#b1bad3] transition-colors hover:bg-[#213743] hover:text-white cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link
            href="/"
            className="flex items-center gap-1.5 focus:outline-none"
            aria-label="Stake Home"
          >
            <StakeLogo className="h-7 w-auto text-white hover:opacity-90 transition-opacity" />
          </Link>
        </div>

        {/* Right Section: Guest vs Authenticated State */}
        {!isAuthenticated ? (
          /* Guest View: Sign In & Register Buttons */
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={openOneTap}
              className="text-[#b1bad3] hover:text-white font-semibold text-sm px-3.5 py-2 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={openOneTap}
              className="bg-[#1475e1] hover:bg-[#1268c7] text-white font-bold text-sm px-4 py-2 rounded-md shadow-sm transition-all cursor-pointer"
            >
              Register
            </button>
          </div>
        ) : (
          /* Authenticated View: Balance Pill, Wallet Button & Action Icons */
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Balance Pill with Dynamic Crypto or Fiat Symbol */}
            <div className="relative">
              <div className="flex items-center rounded-lg border border-[#213743] bg-[#0f212e] p-1 shadow-inner">
                <div
                  onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                  className="flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold text-[#b1bad3] transition-colors hover:bg-[#213743] hover:text-white sm:text-sm"
                >
                  {displayInfo.isFiat ? (
                    <span className="font-bold text-white text-sm sm:text-base leading-none mr-0.5">
                      {displayInfo.symbol}
                    </span>
                  ) : (
                    <CryptoIcon symbol={currency} size={18} className="w-4.5 h-4.5 shrink-0" />
                  )}
                  <span className="font-mono text-white tracking-wide tabular-nums font-bold">
                    {displayInfo.isFiat ? displayInfo.amount : `${displayInfo.symbol} ${displayInfo.amount}`}
                  </span>
                  {!displayInfo.isFiat && (
                    <span className="text-[11px] font-semibold text-[#b1bad3] hidden sm:inline uppercase">
                      {displayInfo.code}
                    </span>
                  )}
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-[#b1bad3] transition-transform duration-200 ${
                      isCurrencyDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>

                {/* Quick Reset Demo Balance Button */}
                <button
                  onClick={resetBalance}
                  title="Reset Demo Balance to $1,000"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-[#b1bad3] transition-colors hover:bg-[#213743] hover:text-[#00e701] cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Currency Dropdown Floating Menu */}
              <CurrencyDropdown
                isOpen={isCurrencyDropdownOpen}
                onClose={() => setIsCurrencyDropdownOpen(false)}
              />
            </div>

            {/* Wallet CTA Button */}
            <button
              onClick={openWalletModal}
              className="flex items-center gap-1.5 rounded-lg bg-[#1475e1] px-3 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-[#0f5cbd] active:scale-95 sm:px-4 sm:text-sm cursor-pointer"
            >
              <Wallet className="h-4 w-4" />
              <span>Wallet</span>
            </button>

            {/* Desktop Action Icons (Bell, Chat, VIP, User Menu) */}
            <div className="hidden items-center gap-2 md:flex">
              {/* Notifications */}
              <button
                onClick={() => setNotificationActive(false)}
                title="Notifications"
                className="relative flex h-10 w-10 items-center justify-center rounded-lg text-[#b1bad3] transition-colors hover:bg-[#213743] hover:text-white cursor-pointer"
              >
                <Bell className="h-5 w-5" />
                {notificationActive && (
                  <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-[#00e701]" />
                )}
              </button>

              {/* Live Community Chat Trigger */}
              <button
                onClick={toggleChat}
                title="Toggle Community Chat"
                className={`relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors cursor-pointer ${
                  isChatOpen
                    ? "bg-[#213743] text-[#00e701]"
                    : "text-[#b1bad3] hover:bg-[#213743] hover:text-white"
                }`}
              >
                <MessageSquare className="h-5 w-5" />
                <span className="absolute top-2 right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e701] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00e701]" />
                </span>
              </button>

              {/* VIP Progress Pill with Hover Popover */}
              <div
                className="relative"
                onMouseEnter={() => setShowVipPopover(true)}
                onMouseLeave={() => setShowVipPopover(false)}
              >
                <div className="ml-1 flex items-center gap-2.5 rounded-xl border border-[#213743] bg-[#0f212e] px-3 py-1.5 hover:border-[#2f4553] cursor-pointer">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-slate-500 to-slate-300 text-xs font-black text-[#0f212e] shadow-sm">
                    🥈
                  </div>
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-white">Silver II</span>
                      <span className="text-[10px] font-bold text-[#00e701] font-mono">68%</span>
                    </div>
                    {/* Micro Progress Bar */}
                    <div className="w-20 h-1.5 rounded-full bg-[#213743] overflow-hidden mt-0.5">
                      <div className="h-full bg-[#00e701] rounded-full" style={{ width: "68%" }} />
                    </div>
                  </div>
                </div>

                {/* VIP Popover */}
                {showVipPopover && (
                  <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-[#213743] bg-[#1a2c38] p-4 shadow-2xl z-50 space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between border-b border-[#213743] pb-2.5">
                      <div>
                        <div className="text-xs font-black text-white">VIP Club Progress</div>
                        <div className="text-[10px] text-[#b1bad3]">Tier: Silver II</div>
                      </div>
                      <span className="rounded-md bg-[#00e701]/15 px-2 py-0.5 text-[10px] font-bold text-[#00e701] border border-[#00e701]/30">
                        68.4%
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-[#b1bad3] font-bold">
                        <span>Wagered to Silver III</span>
                        <span className="text-white font-mono">$3,420 / $5,000</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#0f212e] overflow-hidden border border-[#213743]">
                        <div className="h-full bg-gradient-to-r from-[#00e701] to-[#38bdf8] rounded-full" style={{ width: "68.4%" }} />
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#b1bad3]">
                        Active Tier Perks
                      </div>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-2 text-white">
                          <span className="text-[#00e701]">⚡</span>
                          <span>10% Instant Rakeback (Active)</span>
                        </div>
                        <div className="flex items-center gap-2 text-white">
                          <span className="text-amber-400">🎁</span>
                          <span>Weekly Boost Bonus</span>
                        </div>
                        <div className="flex items-center gap-2 text-white">
                          <span className="text-blue-400">🏆</span>
                          <span>Monthly VIP Bonus</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar Menu Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-[#213743] transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-bold text-sm text-white shadow-md">
                    {user?.name?.[0] || "U"}
                  </div>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-[#b1bad3] transition-transform duration-200 ${
                      isProfileMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <UserProfileMenu
                  isOpen={isProfileMenuOpen}
                  onClose={() => setIsProfileMenuOpen(false)}
                />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Crypto Deposit & Withdrawal Wallet Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={closeWalletModal}
      />

      {/* Wallet Display & Fiat Settings Modal */}
      <WalletSettingsModal
        isOpen={isWalletSettingsOpen}
        onClose={closeWalletSettings}
      />
    </>
  );
}
