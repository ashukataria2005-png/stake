"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  Wallet,
  Bell,
  MessageSquare,
  User,
  ChevronDown,
  RotateCcw,
  Plus,
  Check,
} from "lucide-react";
import { useGame } from "@/context/GameContext";

export default function Navbar() {
  const {
    balance,
    currency,
    setCurrency,
    formatBalance,
    updateBalance,
    resetBalance,
    toggleSidebar,
    isSidebarOpen,
    isMounted,
  } = useGame();

  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [notificationActive, setNotificationActive] = useState(true);

  const currencies = [
    { code: "USDT", symbol: "$", name: "Tether USD" },
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "BTC", symbol: "₿", name: "Bitcoin" },
    { code: "ETH", symbol: "Ξ", name: "Ethereum" },
  ];

  const handleDeposit = (amount: number) => {
    updateBalance(amount);
    setIsWalletModalOpen(false);
  };

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
            {isSidebarOpen ? (
              <Menu className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
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
                <span className="font-mono text-white tracking-wide">
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

        {/* Right Section: Desktop Action Icons (Bell, Chat, Profile) */}
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

          {/* Live Chat */}
          <button
            title="Community Chat"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[#b1bad3] transition-colors hover:bg-[#213743] hover:text-white"
          >
            <MessageSquare className="h-5 w-5" />
          </button>

          {/* User Profile Pill */}
          <div className="ml-1 flex items-center gap-2 rounded-lg border border-[#213743] bg-[#0f212e] px-2.5 py-1.5 transition-colors hover:border-[#2f4553] cursor-pointer">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-[#1475e1] to-[#00e701] text-xs font-black text-white">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold leading-none text-white">VIP Player</span>
              <span className="text-[10px] font-semibold text-[#00e701]">Bronze IV</span>
            </div>
          </div>
        </div>
      </header>

      {/* Wallet / Demo Top-up Modal */}
      {isWalletModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-xl border border-[#213743] bg-[#1a2c38] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#213743] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1475e1]/20 text-[#1475e1]">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Demo Wallet</h3>
                  <p className="text-xs text-[#b1bad3]">Instant demo credit for testing games</p>
                </div>
              </div>
              <button
                onClick={() => setIsWalletModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#b1bad3] hover:bg-[#213743] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="my-5 rounded-lg border border-[#213743] bg-[#0f212e] p-4 text-center">
              <div className="text-xs font-semibold text-[#b1bad3] uppercase tracking-wider">
                Current Available Balance
              </div>
              <div className="mt-1 flex items-center justify-center gap-1">
                <span className="text-xl font-bold text-[#00e701]">$</span>
                <span className="text-3xl font-black text-white font-mono">
                  {formatBalance(balance)}
                </span>
                <span className="text-sm font-semibold text-[#b1bad3]">{currency}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-[#b1bad3]">
                Quick Demo Deposit
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {[100, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => handleDeposit(amt)}
                    className="flex flex-col items-center justify-center rounded-lg border border-[#213743] bg-[#0f212e] py-3 font-semibold text-white transition-all hover:border-[#00e701] hover:bg-[#213743]"
                  >
                    <span className="text-xs text-[#00e701] font-bold">+{amt}</span>
                    <span className="text-sm font-bold">${amt} {currency}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-3 border-t border-[#213743] pt-4">
              <button
                onClick={() => {
                  resetBalance();
                  setIsWalletModalOpen(false);
                }}
                className="flex-1 rounded-lg border border-[#213743] bg-[#213743] py-2.5 text-xs font-bold text-[#b1bad3] transition-colors hover:bg-[#2f4553] hover:text-white"
              >
                Reset to $1,000.00
              </button>
              <button
                onClick={() => handleDeposit(500)}
                className="flex-1 rounded-lg bg-[#00e701] py-2.5 text-xs font-bold text-[#0f212e] transition-colors hover:bg-[#00c701] shadow-sm flex items-center justify-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                Add $500.00
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
