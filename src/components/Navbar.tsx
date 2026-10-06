"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Menu,
  Wallet,
  Bell,
  MessageSquare,
  User,
  ChevronDown,
  RotateCcw,
  Check,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import WalletModal from "@/components/WalletModal";

export default function Navbar() {
  const {
    balance,
    currency,
    setCurrency,
    formatBalance,
    resetBalance,
    toggleSidebar,
    isSidebarOpen,
    toggleChat,
    isChatOpen,
    isMounted,
    isAuthenticated,
    user,
    logout,
    openOneTap,
  } = useGame();

  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [notificationActive, setNotificationActive] = useState(true);
  const [showVipPopover, setShowVipPopover] = useState(false);

  const currencies = [
    { code: "USDT", symbol: "$", name: "Tether USD" },
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "BTC", symbol: "₿", name: "Bitcoin" },
    { code: "ETH", symbol: "Ξ", name: "Ethereum" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[#213743] bg-[#1a2c38] px-3 sm:px-5 select-none">
        {/* Left Section: Sidebar Toggle & Authentic Stake Cursive Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={toggleSidebar}
            aria-label="Toggle Navigation Sidebar"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[#b1bad3] transition-colors hover:bg-[#213743] hover:text-white"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/" className="flex items-center gap-2 group">
            {/* Authentic Stake Cursive Logo SVG */}
            <div className="flex items-center">
              <svg
                viewBox="0 0 114 43"
                className="h-7 sm:h-8 w-auto text-white fill-current transition-transform duration-200 group-hover:scale-105"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M19.387 18.067c-1.89-.472-3.64-.756-5.253-.85.663-1.23 1.516-2.036 2.559-2.415 1.042-.379 2.226-.379 3.55 0l1.09-3.884c-1.893-.568-3.884-.71-5.576-.202-1.692.508-3.138 1.587-4.337 3.237-.616-.853-1.421-1.564-2.415-2.132-.995-.569-2.18-.948-3.554-1.137-1.374-.19-2.892-.19-4.551 0L0 14.123c1.42-.19 2.557-.237 3.41-.142.853.095 1.516.355 1.99.853.474.497.71 1.184.71 2.06 0 .664-.19 1.564-.568 2.702-.853 2.463-1.682 4.263-2.487 5.399-.806 1.137-1.8 1.99-2.843 2.416l1.8 3.884c1.8-.758 3.27-1.942 4.406-3.553 1.137-1.611 2.108-3.673 2.913-6.183 1.327.094 2.701.284 4.122.568 1.42.284 2.653.616 3.695.995-.284.948-.663 1.942-1.137 2.984-.474 1.043-1.09 2.18-1.848 3.411-.758 1.232-1.705 2.416-2.842 3.553l3.032 2.842c1.516-1.516 2.795-3.126 3.837-4.832 1.042-1.705 1.848-3.41 2.416-5.116.568-1.705.852-3.316.852-4.831-.047-.616-.142-1.09-.284-1.422zm15.922 2.37l-1.09 3.884c.71.19 1.374.426 1.99.71.616.284 1.137.64 1.563 1.066.427.427.735.948.924 1.564.19.615.19 1.326 0 2.131-.426 1.516-1.137 2.7-2.132 3.553-.995.853-2.226 1.326-3.695 1.42-1.468.095-3.079-.142-4.831-.71l-1.09 3.885c2.132.663 4.193.971 6.183.923 1.99-.047 3.742-.616 5.258-1.705 1.516-1.089 2.676-2.629 3.482-4.619.568-1.421.758-2.89.568-4.405-.189-1.516-.805-2.818-1.848-3.908-1.042-1.09-2.77-1.942-5.282-2.984zm14.593-.853c-1.516 0-2.913.332-4.192.995-1.28.663-2.345 1.611-3.198 2.842-.616-1.231-1.469-2.179-2.558-2.842-1.09-.663-2.345-.995-3.766-.995-1.658 0-3.22.474-4.689 1.421l1.61 3.411c.995-.616 1.99-.924 2.985-.924.947 0 1.681.308 2.203.924.52.616.781 1.492.781 2.629v8.81h4.264v-8.526c0-1.042.284-1.824.853-2.345.568-.521 1.326-.782 2.274-.782.947 0 1.752.284 2.415.853.664.568 1.09 1.374 1.28 2.416.19 1.042.19 2.226 0 3.552l-1.137 4.832h4.264l1.137-4.832c.284-1.61.355-3.078.213-4.405-.142-1.326-.64-2.463-1.492-3.41-.853-.948-1.966-1.516-3.34-1.705-1.374-.19-2.913-.19-4.619 0zm19.8 0c-1.516 0-2.913.332-4.192.995-1.28.663-2.345 1.611-3.198 2.842-.616-1.231-1.469-2.179-2.558-2.842-1.09-.663-2.345-.995-3.766-.995-1.658 0-3.22.474-4.689 1.421l1.61 3.411c.995-.616 1.99-.924 2.985-.924.947 0 1.681.308 2.203.924.52.616.781 1.492.781 2.629v8.81h4.264v-8.526c0-1.042.284-1.824.853-2.345.568-.521 1.326-.782 2.274-.782.947 0 1.752.284 2.415.853.664.568 1.09 1.374 1.28 2.416.19 1.042.19 2.226 0 3.552l-1.137 4.832h4.264l1.137-4.832c.284-1.61.355-3.078.213-4.405-.142-1.326-.64-2.463-1.492-3.41-.853-.948-1.966-1.516-3.34-1.705-1.374-.19-2.913-.19-4.619 0z" />
              </svg>
            </div>
            <span className="font-bold tracking-tight text-xl text-white italic select-none">
              stake
            </span>
          </Link>
        </div>

        {/* Guest View: Sign In & Register Buttons */}
        {!isAuthenticated ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={openOneTap}
              className="text-[#b1bad3] hover:text-white font-semibold text-sm px-4 py-2 transition-colors cursor-pointer"
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
            {/* Balance Pill */}
            <div className="relative">
              <div className="flex items-center rounded-lg border border-[#213743] bg-[#0f212e] p-1 shadow-inner">
                <div
                  onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                  className="flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold text-[#b1bad3] transition-colors hover:bg-[#213743] hover:text-white sm:text-sm"
                >
                  <span className="font-bold text-[#00e701] text-sm sm:text-base">$</span>
                  <span className="font-mono text-white tracking-wide tabular-nums">
                    {isMounted ? formatBalance(balance) : "1,000.00"}
                  </span>
                  <span className="text-[11px] font-medium text-[#b1bad3] hidden sm:inline">
                    {currency}
                  </span>
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
                  className="flex h-7 w-7 items-center justify-center rounded-md text-[#b1bad3] transition-colors hover:bg-[#213743] hover:text-[#00e701]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Currency Dropdown Menu */}
              {isCurrencyDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsCurrencyDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 z-40 w-48 rounded-lg border border-[#213743] bg-[#1a2c38] py-1 shadow-xl">
                    <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#b1bad3] border-b border-[#213743]">
                      Display Currency
                    </div>
                    {currencies.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => {
                          setCurrency(c.code);
                          setIsCurrencyDropdownOpen(false);
                        }}
                        className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-[#213743]"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[#00e701] font-bold">{c.symbol}</span>
                          <span>{c.code}</span>
                          <span className="text-[#b1bad3] text-[10px]">({c.name})</span>
                        </div>
                        {currency === c.code && (
                          <Check className="h-3.5 w-3.5 text-[#00e701]" />
                        )}
                      </button>
                    ))}
                    <div className="border-t border-[#213743] mt-1 pt-1">
                      <button
                        onClick={() => {
                          resetBalance();
                          setIsCurrencyDropdownOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-[#00e701] transition-colors hover:bg-[#213743]"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Reset to $1,000.00
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Wallet CTA Button */}
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-[#1475e1] px-3 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-[#0f5cbd] active:scale-95 sm:px-4 sm:text-sm"
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
                className="relative flex h-10 w-10 items-center justify-center rounded-lg text-[#b1bad3] transition-colors hover:bg-[#213743] hover:text-white"
              >
                <Bell className="h-5 w-5" />
                {notificationActive && (
                  <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-[#00e701] ring-2 ring-[#1a2c38]" />
                )}
              </button>

              {/* Live Community Chat Trigger */}
              <button
                onClick={toggleChat}
                title="Toggle Community Chat"
                className={`relative flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
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

              {/* User Avatar Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-[#213743] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-bold text-sm text-white shadow-md">
                    {user?.name?.[0] || "U"}
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-[#b1bad3]" />
                </button>

                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 z-40 w-56 rounded-xl border border-[#213743] bg-[#1a2c38] p-2 shadow-2xl space-y-1">
                      <div className="px-3 py-2 border-b border-[#213743]">
                        <p className="text-xs font-bold text-white truncate">{user?.name || "Player"}</p>
                        <p className="text-[11px] text-[#b1bad3] truncate">{user?.email || "demo@stake.com"}</p>
                      </div>

                      <button
                        onClick={() => {
                          resetBalance();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#b1bad3] hover:text-white hover:bg-[#213743] rounded-lg transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-[#00e701]" />
                        <span>Reset Balance ($1,000)</span>
                      </button>

                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-[#213743] rounded-lg transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Crypto Deposit & Withdrawal Wallet Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </>
  );
}
