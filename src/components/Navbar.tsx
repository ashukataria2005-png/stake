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
  Award,
  Sparkles,
  ShieldCheck,
  Gift,
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
  } = useGame();

  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
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
        {/* Left Section: Sidebar Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            aria-label="Toggle Navigation Sidebar"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[#b1bad3] transition-colors hover:bg-[#213743] hover:text-white"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/" className="flex items-center gap-2 group">
            {/* Stake-style geometric brand icon */}
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00e701] font-black text-[#0f212e] shadow-sm transition-transform group-hover:scale-105">
              <span className="text-xl leading-none font-extrabold italic">S</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black tracking-tight text-white group-hover:text-gray-100">
                STAKE
              </span>
              <span className="rounded bg-[#00e701]/15 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-[#00e701] uppercase border border-[#00e701]/30">
                CLONE
              </span>
            </div>
          </Link>
        </div>

        {/* Center / Right-Center Section: Balance Pill & Wallet Button */}
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
        </div>

        {/* Right Section: Desktop Action Icons (Bell, Chat, VIP Pill) */}
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
                    <div className="flex items-center gap-2 text-[#b1bad3]">
                      <span>🔒</span>
                      <span>Dedicated VIP Host (Platinum)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Upgraded Crypto Deposit & Withdrawal Wallet Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </>
  );
}
