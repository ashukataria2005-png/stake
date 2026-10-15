"use client";

import React, { useState } from "react";
import {
  Briefcase,
  Lock,
  Trophy,
  Users,
  BarChart2,
  Receipt,
  FileText,
  Settings,
  ShieldCheck,
  Headphones,
  LogOut,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
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
    logout,
    openWalletModal,
    openTransactionsModal,
    openSettingsModal,
    toggleChat,
  } = useGame();

  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isVIPOpen, setIsVIPOpen] = useState(false);
  const [isAffiliateOpen, setIsAffiliateOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

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
      id: "my-bets",
      label: "My Bets",
      icon: FileText,
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
      id: "stake-smart",
      label: "Stake Smart",
      icon: ShieldCheck,
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

          {/* Compact Stake Dropdown Box */}
          <div className="fixed right-2 sm:right-3 top-[54px] sm:top-[60px] z-50 w-[176px] bg-[#1a2c38] border border-[#2f4553] rounded-xl shadow-2xl overflow-hidden py-1.5 flex flex-col text-white animate-in fade-in zoom-in-95 duration-100 select-none">
            {/* Top Pointer Caret */}
            <div className="absolute -top-1.5 right-6 w-3 h-3 bg-[#1a2c38] border-t border-l border-[#2f4553] rotate-45 pointer-events-none" />

            {/* Menu Options List */}
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="w-full px-3.5 py-2.5 flex items-center gap-3 text-[16px] font-semibold text-white/90 hover:text-white hover:bg-[#213743] transition-colors cursor-pointer text-left"
                >
                  <Icon className="w-5 h-5 text-[#879097] shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
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