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
      label: "VIP",
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
      label: "Live support",
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
          {/* Click outside backdrop */}
          <div className="fixed inset-0 z-40" onClick={onClose} />

          {/* Compact Dropdown - Tight right edge and clean width matching text */}
          <div className="fixed right-1 sm:right-2 top-14 sm:top-16 z-50 w-[210px] sm:w-[220px] max-w-[92vw] bg-[#1a2c38] border border-[#2f4553] rounded-xl shadow-2xl overflow-hidden flex flex-col text-[#b1bad3] animate-in fade-in zoom-in-95 duration-100 select-none">
            {/* 1. User Profile Header */}
            <div className="p-3 border-b border-[#213743] bg-[#14232d]">
              <div className="flex items-center gap-2">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-[#00e701]/20 to-[#1475e1]/20 border border-[#2f4553] text-white font-black text-xs uppercase">
                  {username.charAt(0).toUpperCase()}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#00e701] rounded-full border-2 border-[#14232d]" />
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-xs font-black text-white truncate block">
                    {username}
                  </span>

                  <div className="flex items-center gap-1">
                    <span className="text-[11px]">{vip.tierIcon}</span>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider font-mono">
                      {vip.currentTier}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Balance */}
              <div className="mt-2 flex items-center justify-between bg-[#0f212e] border border-[#213743] rounded-lg px-2 py-1 text-xs">
                <span className="text-[10px] font-bold text-[#7a889b] uppercase">Bal</span>
                <div className="flex items-center gap-1">
                  <FiatCoinIcon currency="INR" size={13} />
                  <span className="font-mono font-black text-white text-xs">
                    {displayBal.symbol}{displayBal.amount}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Menu Items - Exact screenshot size & NO arrows */}
            <div className="py-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isLogout = item.id === "logout";
                return (
                  <button
                    key={item.id}
                    onClick={item.action}
                    className={`w-full px-3 py-2 flex items-center gap-2.5 text-[14px] font-semibold transition-colors cursor-pointer select-none text-left tracking-normal group ${isLogout
                      ? "text-red-400 hover:text-red-300 hover:bg-red-500/15"
                      : "text-[#b1bad3] hover:text-white hover:bg-[#213743]"
                      }`}
                  >
                    <Icon
                      className={`w-[17px] h-[17px] shrink-0 transition-colors ${isLogout ? "text-red-400" : "text-[#7a889b] group-hover:text-white"
                        }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      <VaultModal isOpen={isVaultOpen} onClose={() => setIsVaultOpen(false)} />
      <VIPModal isOpen={isVIPOpen} onClose={() => setIsVIPOpen(false)} />
      <AffiliateModal isOpen={isAffiliateOpen} onClose={() => setIsAffiliateOpen(false)} />
      <StatisticsModal isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} />
    </>
  );
}