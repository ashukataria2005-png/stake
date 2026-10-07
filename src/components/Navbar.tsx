"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Wallet,
  Bell,
  Search,
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
import StakeLogo from "@/components/StakeLogo";
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

  const handleSearchClick = () => {
    const searchInput = document.getElementById("game-search-input") as HTMLInputElement | null;
    if (searchInput) {
      searchInput.focus();
      searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      window.location.href = "/casino/home";
    }
  };

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
            {/* Mobile cursive 'S' logo with zero dead whitespace */}
            <svg viewBox="0 0 24 40" className="h-8 sm:h-9 w-auto text-white fill-current sm:hidden">
              <path d="M17.408 19.336c2.432-1.048 4.296-2.568 5.6-4.568 1.304-2 1.952-4.4 1.952-7.2 0-2.48-.568-4.6-1.704-6.36C22.12.968 20.512 0 18.424 0c-.88 0-1.68.216-2.4.648s-1.32 1.056-1.8 1.872l-1.488 2.544C11.664 6.944 9.8 8.04 7.144 8.352v-2.88c0-1.552-.408-2.768-1.224-3.648C5.104.944 4.016.504 2.656.504c-.816 0-1.504.288-2.064.864C.032 1.944-.144 2.68.048 3.576l3.52 16.512c.384 1.76 1.168 3.2 2.352 4.32 1.184 1.12 2.688 1.68 4.512 1.68h.864c3.424-.48 5.92-1.92 7.488-4.32.48-.736.88-1.544 1.2-2.424l-2.576-.008zm5.728 10.368c-1.28 1.84-3.08 3.248-5.4 4.224-2.32.976-5.04 1.464-8.16 1.464-2.848 0-5.184-.52-7.008-1.56-1.824-1.04-2.736-2.488-2.736-4.344 0-1.2.392-2.2 1.176-3 .784-.8 1.832-1.2 3.144-1.2.704 0 1.344.152 1.92.456.576.304 1.056.768 1.44 1.392.512.832 1.152 1.488 1.92 1.968.768.48 1.76.72 2.976.72 1.472 0 2.624-.312 3.456-.936.832-.624 1.248-1.448 1.248-2.472 0-.896-.344-1.632-1.032-2.208-.688-.576-1.872-1.096-3.552-1.56l-2.784-.768c-3.136-.864-5.344-2.008-6.624-3.432-1.28-1.424-1.92-3.32-1.92-5.688 0-2.368.808-4.352 2.424-5.952C9.176 1.048 11.4.248 14.288.248c2.4 0 4.416.48 6.048 1.44 1.632.96 2.448 2.272 2.448 3.936 0 1.056-.368 1.952-1.104 2.688-.736.736-1.712 1.104-2.928 1.104-.64 0-1.216-.144-1.728-.432-.512-.288-.952-.72-1.32-1.296-.448-.672-1.04-1.192-1.776-1.56-.736-.368-1.632-.552-2.688-.552-1.216 0-2.16.272-2.832.816-.672.544-1.008 1.288-1.008 2.232 0 .864.336 1.56 1.008 2.088.672.528 1.808 1.008 3.408 1.44l2.784.768c3.296.928 5.616 2.152 6.96 3.672 1.344 1.52 2.016 3.472 2.016 5.856.008 2.656-.84 4.888-2.544 6.696z" />
            </svg>
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
          /* Guest View: Search, Sign In & Register Buttons */
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSearchClick}
              title="Search Games"
              aria-label="Search Games"
              className="w-10 h-10 rounded-xl bg-[#213743]/60 hover:bg-[#213743] flex items-center justify-center text-[#b1bad3] hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={openOneTap}
              className="text-[#b1bad3] hover:text-white font-semibold text-sm sm:text-base px-3 py-2 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={openOneTap}
              className="bg-[#1475e1] hover:bg-[#1268c7] text-white font-bold text-sm sm:text-base px-3.5 py-2 rounded-xl shadow-sm transition-all cursor-pointer"
            >
              Register
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            {/* Dedicated Header Search Button */}
            <button
              onClick={handleSearchClick}
              title="Search Games"
              aria-label="Search Games"
              className="w-10 h-10 rounded-xl bg-[#213743]/60 hover:bg-[#213743] flex items-center justify-center text-[#b1bad3] hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notification Bell (Visible on Both Mobile & Desktop) */}
            <button
              onClick={() => setIsNotificationsOpen(true)}
              title="Notifications"
              aria-label="Notifications"
              className="relative w-10 h-10 rounded-xl bg-[#213743]/60 hover:bg-[#213743] flex items-center justify-center text-[#b1bad3] hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <Bell className="w-5 h-5 text-[#b1bad3]" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#1a2c38] shadow-[0_0_6px_#ef4444]" />
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
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-bold text-sm sm:text-base text-white shadow-md">
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
