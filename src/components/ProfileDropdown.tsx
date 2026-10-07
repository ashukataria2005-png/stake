"use client";

import React from "react";
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

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileDropdown({ isOpen, onClose }: ProfileDropdownProps) {
  const {
    logout,
    openWalletModal,
    openWalletSettings,
    toggleChat,
  } = useGame();

  if (!isOpen) return null;

  const menuItems = [
    {
      id: "wallet",
      label: "Wallet",
      icon: Briefcase,
      action: () => {
        onClose();
        openWalletModal();
      },
    },
    {
      id: "vault",
      label: "Vault",
      icon: Lock,
      action: () => {
        onClose();
        openWalletModal();
      },
    },
    {
      id: "vip",
      label: "VIP",
      icon: Trophy,
      action: () => {
        onClose();
      },
    },
    {
      id: "affiliate",
      label: "Affiliate",
      icon: Users,
      action: () => {
        onClose();
      },
    },
    {
      id: "statistics",
      label: "Statistics",
      icon: BarChart2,
      action: () => {
        onClose();
      },
    },
    {
      id: "transactions",
      label: "Transactions",
      icon: Receipt,
      action: () => {
        onClose();
        openWalletModal();
      },
    },
    {
      id: "my-bets",
      label: "My Bets",
      icon: FileText,
      action: () => {
        onClose();
      },
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      action: () => {
        onClose();
        openWalletSettings();
      },
    },
    {
      id: "stake-smart",
      label: "Stake Smart",
      icon: ShieldCheck,
      action: () => {
        onClose();
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
      {/* Click outside backdrop dismiss */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Official Stake Profile Dropdown Menu - Strictly Matching Screenshot 2 */}
      <div className="absolute right-1 sm:right-2 top-full mt-1.5 w-[190px] sm:w-[200px] bg-[#1a2c38] border border-[#2f4553] rounded-xl shadow-2xl py-1.5 overflow-hidden flex flex-col text-[#b1bad3] animate-in fade-in zoom-in-95 duration-150 select-none z-50">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isLogout = item.id === "logout";
          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`w-full px-3 py-2 flex items-center gap-2.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer text-left whitespace-nowrap ${
                isLogout
                  ? "text-red-400 hover:text-red-300 hover:bg-[#213743]"
                  : "text-[#b1bad3] hover:bg-[#213743] hover:text-white"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isLogout ? "text-red-400" : "text-[#b1bad3]"}`} />
              <span className="truncate whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
