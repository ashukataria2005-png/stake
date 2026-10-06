"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Lock,
  Trophy,
  Share2,
  BarChart2,
  Receipt,
  FileText,
  Settings,
  ShieldCheck,
  Headphones,
  LogOut,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import { useGame } from "@/context/GameContext";

interface UserProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileMenu({ isOpen, onClose }: UserProfileMenuProps) {
  const {
    user,
    logout,
    resetBalance,
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
      badge: "Safe",
      action: () => {
        onClose();
        openWalletModal();
      },
    },
    {
      id: "vip",
      label: "VIP",
      icon: Trophy,
      badge: "Silver II",
      badgeColor: "text-amber-400 bg-amber-400/10",
      action: () => onClose(),
    },
    {
      id: "affiliate",
      label: "Affiliate",
      icon: Share2,
      action: () => onClose(),
    },
    {
      id: "statistics",
      label: "Statistics",
      icon: BarChart2,
      action: () => onClose(),
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
      action: () => onClose(),
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
      badge: "Responsible",
      action: () => onClose(),
    },
    {
      id: "live-support",
      label: "Live support",
      icon: Headphones,
      badge: "24/7",
      action: () => {
        onClose();
        toggleChat();
      },
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Floating Menu Card */}
      <div className="absolute right-0 top-full mt-2.5 z-50 w-64 rounded-xl border border-[#213743] bg-[#1a2c38] shadow-2xl py-2 animate-in fade-in zoom-in-95 duration-150 select-none space-y-1">
        {/* User Info Header */}
        <div className="px-4 py-2.5 border-b border-[#213743] flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-bold text-sm text-white shadow-md shrink-0">
            {user?.name?.[0] || "U"}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{user?.name || "Player"}</p>
            <p className="text-[10px] text-[#7a889b] font-mono truncate">{user?.email || "demo@stake.com"}</p>
          </div>
        </div>

        {/* Primary Menu Items */}
        <div className="py-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.action}
                className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-[#b1bad3] hover:text-white hover:bg-[#213743] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-[#7a889b] group-hover:text-white transition-colors" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                      item.badgeColor || "text-[#00e701] bg-[#00e701]/10"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Demo Reset Helper */}
        <div className="border-t border-[#213743] px-2 py-1">
          <button
            onClick={() => {
              resetBalance();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-2 py-1.5 text-[11px] font-semibold text-[#00e701] hover:bg-[#213743] rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Balance ($1,000)</span>
          </button>
        </div>

        {/* Logout Item */}
        <div className="border-t border-[#213743] px-2 pt-1">
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-2 py-2 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-[#213743] rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
