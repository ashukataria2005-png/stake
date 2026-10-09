"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
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
import ProfileDropdown from "@/components/ProfileDropdown";
import CryptoIcon from "@/components/CryptoIcon";
import FiatCoinIcon from "@/components/FiatCoinIcon";
import StakeLogo from "@/components/common/StakeLogo";
import NotificationsDrawer from "@/components/NotificationsDrawer";

export default function Navbar() {
  const {
    balance,
    realBalance,
    currency,
    resetBalance,
    toggleSidebar,
    isSidebarOpen,
    toggleChat,
    isChatOpen,
    isMounted,
    isAuthenticated,
    user,
    openSignIn,
    openRegister,
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
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(3);
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
    ? formatDisplayBalance(realBalance)
    : { amount: "0.00", symbol: "₹", code: "INR", isFiat: true };

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 sm:h-16 w-full items-center justify-between gap-2 px-3 sm:px-4 md:px-6 bg-[#1a2c38] border-b border-[#213743] select-none">
        {/* Left Section: Stake cursive Logo (Clean Direct Start) */}
        <div className="flex items-center shrink-0">
          <Link
            href="/"
            className="flex items-center focus:outline-none"
            aria-label="Stake Home"
          >
            {/* Mobile cursive 'S' emblem with zero dead whitespace */}
            <StakeLogo collapsed className="h-8 sm:h-9 w-auto text-white fill-current sm:hidden" />
            {/* Desktop full cursive Stake logo */}
            <StakeLogo className="h-8 sm:h-9 w-auto text-white hover:opacity-90 transition-opacity hidden sm:block" />
          </Link>
        </div>

        {/* Center / Middle Section: Dynamically Expanded Wallet Balance Pill with comfortable separation */}
        {isAuthenticated ? (
          <div className="flex-1 flex items-center justify-center min-w-0 max-w-[280px] sm:max-w-[340px] ml-3 sm:ml-4">
            <div className="flex items-center w-full min-w-0 transition-all h-10">
              {/* Balance Pill Container */}
              <div className="relative flex-1 min-w-0 h-10">
                <div
                  onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                  className="flex items-center justify-between gap-1.5 sm:gap-2 rounded-l-xl border border-r-0 border-[#213743] bg-[#0f212e] h-10 px-2.5 sm:px-3 shadow-inner cursor-pointer hover:border-[#2f4553] transition-colors w-full"
                >
                  {/* Left part: Coin Badge + Centered Bold Balance Typography */}
                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                    {displayInfo.isFiat ? (
                      <FiatCoinIcon
                        currency={displayInfo.code}
                        size={20}
                        className="w-5 h-5 shrink-0"
                      />
                    ) : (
                      <CryptoIcon
                        symbol={currency}
                        size={20}
                        className="w-5 h-5 shrink-0"
                      />
                    )}

                    <span className="font-mono text-white tracking-wide tabular-nums font-extrabold text-sm sm:text-base md:text-lg truncate text-center">
                      {displayInfo.amount}
                    </span>

                    <span className="text-xs font-semibold text-[#b1bad3] hidden md:inline uppercase shrink-0">
                      {displayInfo.code}
                    </span>
                  </div>

                  {/* Right part of pill: Chevron toggle & quick reset button */}
                  <div className="flex items-center gap-1 shrink-0 ml-1">
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-[#b1bad3] transition-transform duration-200 ${
                        isCurrencyDropdownOpen ? "rotate-180" : ""
                      }`}
                    />

                    {/* Quick Demo Balance Reset Button (Desktop) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        resetBalance();
                      }}
                      title="Reset Demo Balance to $1,000"
                      className="hidden sm:flex h-5 w-5 ml-0.5 items-center justify-center rounded text-[#b1bad3] transition-colors hover:text-[#00e701] cursor-pointer"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Currency Dropdown Floating Menu */}
                <CurrencyDropdown
                  isOpen={isCurrencyDropdownOpen}
                  onClose={() => setIsCurrencyDropdownOpen(false)}
                />
              </div>

              {/* Vibrant Blue Wallet Button Attached Cleanly to the Right of Balance Pill */}
              <button
                onClick={openWalletModal}
                className="flex items-center justify-center gap-1 sm:gap-1.5 h-10 w-10 sm:h-10 sm:w-auto rounded-r-xl bg-[#1475e1] hover:bg-[#1268c7] px-2.5 sm:px-4 text-sm sm:text-base font-bold text-white shadow-md transition-all active:scale-95 cursor-pointer border border-[#1475e1] shrink-0"
                title="Wallet"
              >
                <Wallet className="h-4.5 w-4.5" />
                <span className="hidden sm:inline">Wallet</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {/* Right Section: Guest vs Authenticated Controls with exact gap-2 */}
        {!isAuthenticated ? (
          /* Guest View: Sign In & Register Buttons */
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={openSignIn}
              className="text-[#b1bad3] hover:text-white font-semibold text-sm sm:text-base px-3 py-2 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={openRegister}
              className="bg-[#1475e1] hover:bg-[#1268c7] text-white font-bold text-sm sm:text-base px-3.5 py-2 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              Register
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            {/* Notification Bell (Visible on Both Mobile & Desktop - Border-free per Screenshots 7-15) */}
            <button
              onClick={() => setIsNotificationsOpen(true)}
              title="Notifications"
              aria-label="Notifications"
              className="relative p-2 text-[#b1bad3] hover:text-white transition-colors bg-transparent border-none outline-none cursor-pointer flex items-center justify-center shrink-0"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#fe2247] rounded-full" />
              )}
            </button>

            {/* Desktop Only Actions (Community Chat, VIP progress pill) */}
            <div className="hidden md:flex items-center gap-2">
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
                <div className="flex items-center gap-2.5 rounded-xl border border-[#213743] bg-[#0f212e] px-3 py-1.5 hover:border-[#2f4553] cursor-pointer">
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
            </div>

            {/* User Profile Avatar Icon (Visible on Both Mobile & Desktop) */}
            <div className="relative shrink-0">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-1.5 p-0.5 rounded-full hover:ring-2 hover:ring-[#2f4553] transition-all cursor-pointer"
                aria-label="User Profile Menu"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#2f4553] flex items-center justify-center text-white text-xs sm:text-sm font-bold hover:brightness-110 transition-all border border-[#213743]">
                  {user?.name?.[0] || "A"}
                </div>
                <ChevronDown
                  className={`hidden sm:block h-3.5 w-3.5 text-[#b1bad3] transition-transform duration-200 ${
                    isProfileMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <ProfileDropdown
                isOpen={isProfileMenuOpen}
                onClose={() => setIsProfileMenuOpen(false)}
              />
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

      {/* Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onUnreadCountChange={setUnreadNotifsCount}
      />
    </>
  );
}
