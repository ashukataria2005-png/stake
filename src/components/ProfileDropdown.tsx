"use client";

import React, { useState } from "react";
import {
  Briefcase,
  Lock,
  Trophy,
  Users,
  BarChart2,
  Receipt,
  Settings,
  LogOut,
  ChevronRight,
  User,
  ShieldCheck,
  Headphones,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { calculateVIPProgress } from "@/lib/vip";
import FiatCoinIcon from "@/components/FiatCoinIcon";
import VaultModal from "@/components/profile/VaultModal";
import VIPModal from "@/components/profile/VIPModal";
import AffiliateModal from "@/components/profile/AffiliateModal";
import StatisticsModal from "@/components/profile/StatisticsModal";

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileDropdown({ isOpen, onClose }: ProfileDropdownProps) {
  const {
    user,
    logout,
    realBalance,
    totalWagered = 0,
    openWalletModal,
    openTransactionsModal,
    openSettingsModal,
    toggleChat,
    formatDisplayBalance,
  } = useGame();

  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isVIPOpen, setIsVIPOpen] = useState(false);
  const [isAffiliateOpen, setIsAffiliateOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  const vip = calculateVIPProgress(totalWagered);
  const username = user?.username || user?.name || "Player";
  const displayBal = formatDisplayBalance(realBalance);

  const menuItems = [
    {
      id: "wallet",
      label: "Wallet",
      icon: Briefcase,
      action: () => {
        onClose();
        openWalletModal("deposit");
      },
    },
    {
      id: "vault",
      label: "Vault",
      icon: Lock,
      action: () => {
        onClose();
        setIsVaultOpen(true);
      },
    },
    {
      id: "vip",
      label: "VIP Club",
      icon: Trophy,
      action: () => {
        onClose();
        setIsVIPOpen(true);
      },
    },
    {
      id: "affiliate",
      label: "Affiliate",
      icon: Users,
      action: () => {
        onClose();
        setIsAffiliateOpen(true);
      },
    },
    {
      id: "statistics",
      label: "Statistics",
      icon: BarChart2,
      action: () => {
        onClose();
        setIsStatsOpen(true);
      },
    },
    {
      id: "transactions",
      label: "Transactions",
      icon: Receipt,
      action: () => {
        onClose();
        openTransactionsModal();
      },
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      action: () => {
        onClose();
        openSettingsModal();
      },
    },
    {
      id: "live-support",
      label: "Live Support",
      icon: Headphones,
      action: () => {
        onClose();
        toggleChat();
      },
    },
    {
      id: "logout",
      label: "Logout",
      icon: LogOut,
      action: () => {
        logout();
        onClose();
      },
    },
  ];

  return (
    <>
      {isOpen && (
        <>
          {/* Click outside backdrop dismiss */}
          <div className="fixed inset-0 z-40" onClick={onClose} />

          {/* Authentic Stake Profile Dropdown Menu - Scaled to 160%-175% */}
          <div className="fixed right-0 top-14 sm:top-16 z-50 w-[270px] sm:w-[300px] max-w-[90vw] bg-[#1a2c38] border-l border-b border-[#2f4553] rounded-bl-2xl shadow-2xl overflow-hidden flex flex-col text-[#b1bad3] animate-in fade-in zoom-in-95 duration-150 select-none">
            {/* 1. User Profile Header */}
            <div className="p-4 border-b border-[#213743] bg-[#14232d]">
              <div className="flex items-center gap-3">
                {/* User Avatar Circle */}
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#00e701]/20 to-[#1475e1]/20 border border-[#2f4553] text-white font-black text-base uppercase">
                  {username.charAt(0).toUpperCase()}
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#00e701] rounded-full border-2 border-[#14232d]" />
                </div>

                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-black text-white truncate block">
                      {username}
                    </span>
                  </div>

                  {/* VIP Tier Badge */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{vip.tierIcon}</span>
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                      {vip.currentTier}
                    </span>
                    <span className="text-[11px] text-[#7a889b] font-mono">
                      ({vip.progressFormatted})
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Balance Pill */}
              <div className="mt-3 flex items-center justify-between bg-[#0f212e] border border-[#213743] rounded-xl px-3 py-2 text-xs">
                <span className="text-xs font-bold text-[#7a889b] uppercase">Balance</span>
                <div className="flex items-center gap-1.5">
                  <FiatCoinIcon currency="INR" size={15} />
                  <span className="font-mono font-black text-white text-sm">
                    {displayBal.symbol}{displayBal.amount}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Dropdown Menu Items - Compact & Small Scale */}
            <div className="py-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isLogout = item.id === "logout";
                return (
                  <button
                    key={item.id}
                    onClick={item.action}
                    className={`w-full px-3 py-1.5 flex items-center justify-between text-xs font-semibold transition-colors cursor-pointer select-none text-left tracking-normal group ${isLogout
                        ? "text-red-400 hover:text-red-300 hover:bg-red-500/15"
                        : "text-[#b1bad3] hover:text-white hover:bg-[#213743]"
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-3.5 h-3.5 shrink-0 transition-colors ${isLogout ? "text-red-400" : "text-[#7a889b] group-hover:text-white"}`} />
                      <span>{item.label}</span>
                    </div>
                    {!isLogout && (
                      <ChevronRight className="w-3.5 h-3.5 text-[#557086] group-hover:text-white group-hover:translate-x-0.5 transition-all opacity-70" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Profile Suite Modals */}
      <VaultModal isOpen={isVaultOpen} onClose={() => setIsVaultOpen(false)} />
      <VIPModal isOpen={isVIPOpen} onClose={() => setIsVIPOpen(false)} />
      <AffiliateModal isOpen={isAffiliateOpen} onClose={() => setIsAffiliateOpen(false)} />
      <StatisticsModal isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} />
    </>
  );
}
