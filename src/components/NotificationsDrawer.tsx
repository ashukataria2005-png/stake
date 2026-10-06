"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  X,
  ArrowDownCircle,
  ArrowUpCircle,
  ShieldAlert,
  MailCheck,
  Trophy,
  CheckCheck,
  Check,
} from "lucide-react";

export interface NotificationItem {
  id: string;
  type: "Transactions" | "Security" | "Promotions";
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  iconType: "deposit" | "withdrawal" | "security" | "email" | "vip";
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    type: "Transactions",
    title: "Deposit Confirmed",
    description: "Your deposit of 50.00 USDT has been successfully credited to your wallet.",
    time: "10m ago",
    isRead: false,
    iconType: "deposit",
  },
  {
    id: "notif-2",
    type: "Transactions",
    title: "Withdrawal Processed",
    description: "Your withdrawal of 120.00 USDT has been sent to your external address.",
    time: "2h ago",
    isRead: false,
    iconType: "withdrawal",
  },
  {
    id: "notif-3",
    type: "Security",
    title: "Password Changed",
    description: "Your account password was updated successfully from Chrome on Android.",
    time: "1d ago",
    isRead: true,
    iconType: "security",
  },
  {
    id: "notif-4",
    type: "Security",
    title: "Email Verified",
    description: "Your email address was confirmed.",
    time: "3d ago",
    isRead: true,
    iconType: "email",
  },
  {
    id: "notif-5",
    type: "Promotions",
    title: "VIP Reward",
    description: "Congratulations! You earned a $10.00 weekly reload bonus.",
    time: "5d ago",
    isRead: false,
    iconType: "vip",
  },
];

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export default function NotificationsDrawer({
  isOpen,
  onClose,
  onUnreadCountChange,
}: NotificationsDrawerProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<"All" | "Transactions" | "Security" | "Promotions">("All");

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const loadNotifs = () => {
      try {
        const saved = localStorage.getItem("stake_notifications");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setNotifications(parsed);
          }
        }
      } catch {}
    };
    loadNotifs();

    window.addEventListener("stake_notifications_updated", loadNotifs);
    return () => window.removeEventListener("stake_notifications_updated", loadNotifs);
  }, []);

  useEffect(() => {
    if (onUnreadCountChange) {
      onUnreadCountChange(unreadCount);
    }
  }, [unreadCount, onUnreadCountChange]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    setNotifications(updated);
    try {
      localStorage.setItem("stake_notifications", JSON.stringify(updated));
    } catch {}
  };

  const toggleReadStatus = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n));
    setNotifications(updated);
    try {
      localStorage.setItem("stake_notifications", JSON.stringify(updated));
    } catch {}
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "All") return true;
    return n.type === activeTab;
  });

  const renderIcon = (type: NotificationItem["iconType"]) => {
    switch (type) {
      case "deposit":
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#00e701]/15 text-[#00e701]">
            <ArrowDownCircle className="h-5 w-5" />
          </div>
        );
      case "withdrawal":
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
            <ArrowUpCircle className="h-5 w-5" />
          </div>
        );
      case "security":
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/15 text-red-400">
            <ShieldAlert className="h-5 w-5" />
          </div>
        );
      case "email":
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
            <MailCheck className="h-5 w-5" />
          </div>
        );
      case "vip":
        return (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-purple-400">
            <Trophy className="h-5 w-5" />
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* Drawer Container (Right-aligned) */}
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-[#1a2c38] border-l border-[#213743] shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right duration-250">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#213743] px-4 py-3.5 bg-[#14232d]">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#213743] text-white">
                <Bell className="h-4.5 w-4.5 text-[#00e701]" />
              </div>
              <h2 className="text-base font-black text-white">Notifications</h2>
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 text-[10px] font-black">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  title="Mark all as read"
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-[#b1bad3] hover:text-white rounded-lg hover:bg-[#213743] transition-colors cursor-pointer"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Mark all read</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-[#213743] bg-[#0f212e] overflow-x-auto no-scrollbar">
            {(["All", "Transactions", "Security", "Promotions"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeTab === tab
                    ? "bg-[#213743] text-white shadow-sm border border-[#2f4553]"
                    : "text-[#b1bad3] hover:text-white hover:bg-[#213743]/50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-2.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0f212e] border border-[#213743] text-[#7a889b]">
                  <Bell className="h-6 w-6" />
                </div>
                <div className="text-sm font-bold text-white">No new notifications</div>
                <p className="text-xs text-[#b1bad3] max-w-xs">
                  You are all caught up! When you receive alerts or bonuses, they will appear here.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => toggleReadStatus(notif.id)}
                  className={`group relative flex items-start gap-3 rounded-xl border p-3 transition-all cursor-pointer ${
                    notif.isRead
                      ? "bg-[#14232d]/60 border-[#213743] hover:border-[#2f4553] opacity-80 hover:opacity-100"
                      : "bg-[#1a2c38] border-[#2f4553] hover:border-[#00e701]/40 shadow-sm"
                  }`}
                >
                  {/* Icon */}
                  {renderIcon(notif.iconType)}

                  {/* Body Content */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-white">{notif.title}</span>
                        {!notif.isRead && (
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0 shadow-[0_0_6px_#ef4444]" />
                        )}
                      </div>
                      <span className="text-[10px] font-semibold text-[#7a889b] shrink-0 font-mono">
                        {notif.time}
                      </span>
                    </div>

                    <p className="text-xs text-[#b1bad3] leading-relaxed break-words">
                      {notif.description}
                    </p>
                  </div>

                  {/* Read status icon */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity self-center">
                    <span
                      title={notif.isRead ? "Mark as unread" : "Mark as read"}
                      className="p-1 rounded hover:bg-[#213743] text-[#7a889b] hover:text-white inline-block"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Action */}
          <div className="border-t border-[#213743] p-3 bg-[#14232d] flex justify-between items-center text-xs text-[#b1bad3]">
            <span>Real-time notifications</span>
            <button
              onClick={markAllAsRead}
              className="text-[#00e701] font-bold hover:underline cursor-pointer"
            >
              Clear unread
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
