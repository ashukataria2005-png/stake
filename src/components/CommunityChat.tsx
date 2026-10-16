"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Smile,
  ChevronDown,
  FileText,
  Star,
  ExternalLink,
  Coins,
  CloudRain,
  Sparkles,
  Send,
  AlertCircle,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import { calculateVIPProgress } from "@/lib/vip";

export interface ChatMessage {
  id: string;
  user: string;
  badge: string; // "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond" | "Unranked"
  badgeIcon?: string;
  badgeColor?: string;
  time: string;
  text: string;
  isSelf?: boolean;
  isTip?: boolean;
  tipData?: {
    sender: string;
    recipient: string;
    amount: number;
  };
  isRain?: boolean;
  rainData?: {
    id: string;
    totalPool: number;
    shareAmount: number;
  };
}

const TIER_BADGE_STYLES: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  Unranked: { bg: "bg-[#213743]", text: "text-[#b1bad3]", border: "border-[#2f4553]", icon: "🛡️" },
  Bronze: { bg: "bg-[#cd7f32]/20", text: "text-[#e69a58]", border: "border-[#cd7f32]/40", icon: "🥉" },
  Silver: { bg: "bg-[#c0c0c0]/20", text: "text-[#e0e0e0]", border: "border-[#c0c0c0]/40", icon: "🥈" },
  Gold: { bg: "bg-[#ffd700]/20", text: "text-[#ffd700]", border: "border-[#ffd700]/40", icon: "🥇" },
  Platinum: { bg: "bg-[#00e701]/20", text: "text-[#00e701]", border: "border-[#00e701]/40", icon: "💎" },
  Diamond: { bg: "bg-[#00c0f7]/20", text: "text-[#00c0f7]", border: "border-[#00c0f7]/40", icon: "👑" },
};

const initialMessages: ChatMessage[] = [
  {
    id: "m1",
    user: "Satoshi_88",
    badge: "Platinum",
    badgeIcon: "💎",
    time: "02:40",
    text: "gg @CryptoWolf on that 24x crash run! 🚀",
  },
  {
    id: "rain-init",
    user: "Stake Rain Bot",
    badge: "Diamond",
    badgeIcon: "👑",
    time: "02:41",
    text: "🌧️ Rain incoming! ₹500 pool for active players",
    isRain: true,
    rainData: {
      id: "rain-init-drop",
      totalPool: 500,
      shareAmount: 25,
    },
  },
  {
    id: "m2",
    user: "CryptoWolf",
    badge: "Gold",
    badgeIcon: "🥇",
    time: "02:41",
    text: "mines 3 gems and cashout is the only way brothers 💎",
  },
  {
    id: "tip-init",
    user: "ApexPredator",
    badge: "Platinum",
    badgeIcon: "💎",
    time: "02:42",
    text: "ApexPredator tipped ₹250 to Satoshi_88! 💸",
    isTip: true,
    tipData: {
      sender: "ApexPredator",
      recipient: "Satoshi_88",
      amount: 250,
    },
  },
  {
    id: "m3",
    user: "Valkyrie",
    badge: "Diamond",
    badgeIcon: "👑",
    time: "02:42",
    text: "@ApexPredator Zeus gave a 120x tumble on Gates ⚡",
  },
  {
    id: "m4",
    user: "LuckyStrike",
    badge: "Silver",
    badgeIcon: "🥈",
    time: "02:43",
    text: "@Satoshi_88 tip me some luck brother! Use /tip 💸",
  },
  {
    id: "m5",
    user: "ApexPredator",
    badge: "Platinum",
    badgeIcon: "💎",
    time: "02:44",
    text: "just hit 110x on Plinko 16 rows!! 🤑",
  },
];

const cannedChatter = [
  "plinko 16 rows is paying today 🎯",
  "@CryptoWolf who's leading the $100k daily race? 🏆",
  "mines is wild right now 💣",
  "gg brothers! 💎",
  "@Valkyrie cashout early or get wrecked haha 😂",
  "zeus 500x multiplier dropped on stream! ⚡",
  "stake VIP weekly bonus was huge 💰",
  "@LuckyStrike rocket went to 48x on crash! 🚀",
  "1 more game before sleep lol 😴",
  "dropping 50 balls on plinko wish me luck 🍀",
  "rakeback claimed, time to send it on Limbo 🚀",
  "always 1 gem away from 100x on mines 💎",
];

const CHANNELS = [
  { id: "india", label: "India", flag: "🇮🇳" },
  { id: "global", label: "English", flag: "🌍" },
  { id: "philippines", label: "Philippines", flag: "🇵🇭" },
  { id: "brazil", label: "Brazil", flag: "🇧🇷" },
  { id: "japan", label: "Japan", flag: "🇯🇵" },
  { id: "germany", label: "Germany", flag: "🇩🇪" },
];

const EMOJI_CATEGORIES = {
  popular: ["🔥", "💎", "🚀", "🤑", "👑", "💰", "⚡", "🍀", "💸", "🦄", "🏆", "🎯"],
  gaming: ["🎰", "🎲", "🃏", "💣", "🪙", "🔮", "🥇", "🎪", "🎈", "👾", "🕹️", "🎳"],
  faces: ["😂", "🥳", "😎", "🤩", "👏", "🙌", "💀", "🤝", "🫡", "🤖", "🤯", "✨"],
};

const STAKE_CHAT_RULES = [
  "Do not spam, harass, or be offensive towards other members or staff.",
  "No begging, asking for loans, rain, or tips.",
  "No posting cryptocurrency addresses or attempting to buy/sell/trade in chat.",
  "No advertising or promotion of external sites, Telegram groups, referral links, or codes.",
  "Avoid excessive use of caps, symbols, or repetitive text.",
  "Do not share personal information (yours or others).",
  "Use the designated channel for appropriate languages.",
  "No discussing alternate accounts or ban evasion.",
  "No political or religious debates.",
  "No fake giveaways or deceptive behavior.",
  "Respect moderators and staff decisions.",
  "Adhere to Stake terms of service at all times.",
];

const MAX_CHARS = 160;

export default function CommunityChat() {
  const {
    isChatOpen,
    toggleChat,
    setChatOpen,
    user,
    isAuthenticated,
    balance,
    updateBalance,
    syncWalletBalance,
    totalWagered,
  } = useGame();

  const [selectedChannel, setSelectedChannel] = useState(CHANNELS[0]);
  const [isChannelDropdownOpen, setIsChannelDropdownOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [onlineCount, setOnlineCount] = useState<number>(56926);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [emojiTab, setEmojiTab] = useState<"popular" | "gaming" | "faces">("popular");
  const [tipStatus, setTipStatus] = useState<{ msg: string; isError?: boolean } | null>(null);
  const [claimedRainIds, setClaimedRainIds] = useState<Set<string>>(new Set());
  const [isClaimingRain, setIsClaimingRain] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatInputRef = useRef<HTMLInputElement | null>(null);

  // Compute current authenticated user VIP badge dynamically
  const userVip = calculateVIPProgress(totalWagered);

  // Clear stale chat messages / local cache upon new user login or session start
  const previousUserIdRef = useRef<string | undefined>(user?.id);
  useEffect(() => {
    if (previousUserIdRef.current !== user?.id) {
      previousUserIdRef.current = user?.id;
      setMessages(initialMessages);
      try {
        localStorage.removeItem("stake_chat_history");
        localStorage.removeItem("stake_community_chat");
      } catch {}
    }
  }, [user?.id, isAuthenticated]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [messages, isChatOpen]);

  // Periodic simulated authentic chat messages
  useEffect(() => {
    const interval = setInterval(() => {
      const tierList = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];
      const users = [
        "Staker_77",
        "GoldRush",
        "AlphaWolf",
        "NeonRider",
        "Shadow_X",
        "Valkyrie",
        "AcesHigh",
        "WhaleHunter",
        "LuckyStrike",
        "CryptoWolf",
        "ApexPredator",
      ];

      const chosenBadge = tierList[Math.floor(Math.random() * tierList.length)];
      const chosenIcon = TIER_BADGE_STYLES[chosenBadge]?.icon || "🥉";
      const chosenUser = users[Math.floor(Math.random() * users.length)];
      const text = cannedChatter[Math.floor(Math.random() * cannedChatter.length)];

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random()}`,
        user: chosenUser,
        badge: chosenBadge,
        badgeIcon: chosenIcon,
        time: timeStr,
        text,
      };

      setMessages((prev) => [...prev.slice(-40), newMsg]);
      setOnlineCount((c) =>
        c + (Math.random() > 0.5 ? Math.floor(Math.random() * 5 + 1) : -Math.floor(Math.random() * 4 + 1))
      );
    }, 4200);

    return () => clearInterval(interval);
  }, []);

  // Periodic Community Rain Bot trigger (every 85 seconds)
  useEffect(() => {
    const rainInterval = setInterval(() => {
      const pools = [250, 500, 1000, 1500];
      const pool = pools[Math.floor(Math.random() * pools.length)];
      const share = Math.round(pool / 20);

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;

      const rainMsg: ChatMessage = {
        id: `rain-${Date.now()}`,
        user: "Stake Rain Bot",
        badge: "Diamond",
        badgeIcon: "👑",
        time: timeStr,
        text: `🌧️ Rain incoming! ₹${pool.toLocaleString()} pool for active players`,
        isRain: true,
        rainData: {
          id: `rain-drop-${Date.now()}`,
          totalPool: pool,
          shareAmount: share,
        },
      };

      setMessages((prev) => [...prev.slice(-40), rainMsg]);
    }, 85000);

    return () => clearInterval(rainInterval);
  }, []);

  // Handle claiming rain share
  const handleClaimRain = async (rainId: string, shareAmount: number) => {
    if (claimedRainIds.has(rainId) || isClaimingRain) return;

    setIsClaimingRain(rainId);
    try {
      const res = await fetch("/api/chat/rain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          username: user?.username || user?.name || "Player",
          rainId,
          amount: shareAmount,
        }),
      });

      const data = await res.json();
      if (data.success) {
        sounds.playSuccessChime();
        setClaimedRainIds((prev) => new Set(prev).add(rainId));
        updateBalance(shareAmount);
        if (syncWalletBalance) {
          syncWalletBalance(true);
        }
      } else {
        // Fallback optimistic credit
        sounds.playSuccessChime();
        setClaimedRainIds((prev) => new Set(prev).add(rainId));
        updateBalance(shareAmount);
      }
    } catch (err) {
      console.warn("Rain claim API error, falling back locally:", err);
      sounds.playSuccessChime();
      setClaimedRainIds((prev) => new Set(prev).add(rainId));
      updateBalance(shareAmount);
    } finally {
      setIsClaimingRain(null);
    }
  };

  // Send message or handle tipping command
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanInput = inputText.trim();
    if (!cleanInput) return;

    // Check for `/tip <username> <amount>` command
    const tipRegex = /^\/tip\s+@?([a-zA-Z0-9_-]+)\s+(\d+(?:\.\d+)?)$/i;
    const tipMatch = cleanInput.match(tipRegex);

    if (cleanInput.startsWith("/tip") && !tipMatch) {
      setTipStatus({
        msg: "Tip format: /tip <username> <amount> (e.g. /tip CryptoWolf 100)",
        isError: true,
      });
      setTimeout(() => setTipStatus(null), 5000);
      return;
    }

    if (tipMatch) {
      const targetUser = tipMatch[1].trim();
      const tipAmount = parseFloat(tipMatch[2]);

      if (tipAmount <= 0) {
        setTipStatus({ msg: "Tip amount must be greater than 0.", isError: true });
        setTimeout(() => setTipStatus(null), 4000);
        return;
      }

      if (balance < tipAmount) {
        setTipStatus({
          msg: `Insufficient balance (₹${balance.toFixed(2)}). Needed: ₹${tipAmount.toFixed(2)}`,
          isError: true,
        });
        setTimeout(() => setTipStatus(null), 4000);
        return;
      }

      // Execute Tip Transfer
      try {
        const res = await fetch("/api/chat/tip", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderId: user?.id,
            senderUsername: user?.username || user?.name || "You",
            recipientUsername: targetUser,
            amount: tipAmount,
          }),
        });

        const data = await res.json();
        if (!data.success) {
          setTipStatus({ msg: data.error || "Failed to send tip.", isError: true });
          setTimeout(() => setTipStatus(null), 4000);
          return;
        }

        // Deduct from sender wallet & play cashout sound
        updateBalance(-tipAmount);
        if (syncWalletBalance) {
          syncWalletBalance(true);
        }
        sounds.playCashout();

        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now
          .getMinutes()
          .toString()
          .padStart(2, "0")}`;

        const tipMsg: ChatMessage = {
          id: `tip-${Date.now()}`,
          user: user?.username || user?.name || "You",
          badge: userVip.currentTier,
          badgeIcon: userVip.tierIcon,
          time: timeStr,
          text: `${user?.username || user?.name || "You"} tipped ₹${tipAmount.toLocaleString()} to ${targetUser}! 💸`,
          isTip: true,
          tipData: {
            sender: user?.username || user?.name || "You",
            recipient: targetUser,
            amount: tipAmount,
          },
        };

        setMessages((prev) => [...prev, tipMsg]);
        setInputText("");
        setShowEmojiPicker(false);
        setTipStatus({ msg: `Successfully tipped ₹${tipAmount} to ${targetUser}!`, isError: false });
        setTimeout(() => setTipStatus(null), 4000);
        return;
      } catch (err: any) {
        console.error("Tip processing failed:", err);
        setTipStatus({ msg: "Connection error sending tip.", isError: true });
        setTimeout(() => setTipStatus(null), 4000);
        return;
      }
    }

    // Standard Chat Message
    sounds.playClick();
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    const newMsg: ChatMessage = {
      id: `my-${Date.now()}`,
      user: user?.username || user?.name || "You",
      badge: userVip.currentTier,
      badgeIcon: userVip.tierIcon,
      time: timeStr,
      text: cleanInput,
      isSelf: true,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");
    setShowEmojiPicker(false);
  };

  // Insert emoji into input
  const handleInsertEmoji = (emoji: string) => {
    if (inputText.length + emoji.length <= MAX_CHARS) {
      setInputText((prev) => prev + emoji);
    }
    chatInputRef.current?.focus();
  };

  // Mention user when clicking username
  const handleMentionUser = (clickedUser: string) => {
    const mention = `@${clickedUser} `;
    if (inputText.length + mention.length <= MAX_CHARS) {
      setInputText((prev) => prev + mention);
    }
    chatInputRef.current?.focus();
  };

  // Render message text with styled @mention pills
  const renderMessageText = (text: string) => {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith("@")) {
        return (
          <span
            key={index}
            onClick={() => handleMentionUser(part.slice(1))}
            className="bg-[#213743] text-[#b1bad3] px-2 py-0.5 rounded-md font-medium text-xs cursor-pointer hover:text-white transition-colors inline-block my-0.5 mx-0.5"
          >
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  if (!isChatOpen) return null;

  const charsRemaining = MAX_CHARS - inputText.length;

  return (
    <>
      {/* Mobile backdrop for outside dismissal */}
      <div
        onClick={() => setChatOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] md:hidden pointer-events-auto transition-opacity"
        aria-hidden="true"
      />
      <aside className="fixed top-14 sm:top-16 bottom-[58px] md:bottom-0 right-0 z-[9999] pointer-events-auto w-full sm:w-[360px] bg-[#1a2c38] border-l border-[#213743] shadow-2xl flex flex-col select-none animate-in slide-in-from-right duration-200">
        <div className="h-full flex flex-col justify-between overflow-hidden">
          {/* 1. Channel Header: Dropdown Pill with Flag & Minimal Close '✕' */}
          <div className="flex items-center justify-between border-b border-[#213743] px-3.5 py-3 bg-[#14232f] shrink-0 relative">
            {/* Channel Dropdown Pill */}
            <div className="relative">
              <button
                onClick={() => setIsChannelDropdownOpen(!isChannelDropdownOpen)}
                className="flex items-center gap-2 bg-[#213743] hover:bg-[#2a4454] text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-[#2f4553]/60 transition-colors cursor-pointer"
              >
                <span>{selectedChannel.flag}</span>
                <span>{selectedChannel.label}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#b1bad3]" />
              </button>

              {/* Dropdown Menu */}
              {isChannelDropdownOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-44 bg-[#1a2c38] border border-[#2f4553] rounded-xl shadow-2xl py-1 z-30 animate-in zoom-in-95 duration-150">
                  {CHANNELS.map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => {
                        setSelectedChannel(ch);
                        setIsChannelDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-left transition-colors cursor-pointer ${
                        selectedChannel.id === ch.id
                          ? "bg-[#213743] text-[#00e701]"
                          : "text-[#b1bad3] hover:bg-[#213743] hover:text-white"
                      }`}
                    >
                      <span>{ch.flag}</span>
                      <span>{ch.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Tip info indicator */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#b1bad3]/80 hidden sm:inline-block font-mono bg-[#213743]/50 px-2 py-0.5 rounded border border-white/5">
                /tip @user 50
              </span>

              {/* Minimal Clean '✕' Dismiss Button */}
              <button
                onClick={() => setChatOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors cursor-pointer text-sm font-semibold"
                aria-label="Close Chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* 2. Scrollable Message Stream */}
          <div className="flex-1 overflow-y-auto min-h-0 px-3 py-2 space-y-2">
            {messages.map((m) => {
              // 2a. Golden Tip Alert Card
              if (m.isTip && m.tipData) {
                return (
                  <div
                    key={m.id}
                    className="bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-[#1a2c38] border border-amber-400/40 rounded-xl p-3 my-1.5 shadow-[0_0_15px_rgba(251,191,36,0.12)] flex flex-col gap-1.5 animate-in zoom-in-95 duration-200"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-amber-400 font-extrabold tracking-wide">
                        <Coins className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-[11px] uppercase tracking-wider">COMMUNITY TIP ALERT</span>
                      </div>
                      <span className="text-[10px] text-[#b1bad3]/60 font-mono">{m.time}</span>
                    </div>
                    <div className="text-white text-xs sm:text-sm font-medium leading-snug">
                      <span className="text-amber-300 font-bold">{m.tipData.sender}</span> tipped{" "}
                      <span className="text-[#00e701] font-black text-sm">
                        ₹{m.tipData.amount.toLocaleString()}
                      </span>{" "}
                      to <span className="text-white font-bold underline">@{m.tipData.recipient}</span>! 💸
                    </div>
                  </div>
                );
              }

              // 2b. Interactive Rain Bot Card
              if (m.isRain && m.rainData) {
                const isClaimed = claimedRainIds.has(m.rainData.id);
                return (
                  <div
                    key={m.id}
                    className="bg-gradient-to-r from-cyan-950/70 via-[#1475e1]/25 to-sky-950/50 border border-[#1475e1]/50 rounded-xl p-3.5 my-2 shadow-[0_0_20px_rgba(20,117,225,0.22)] flex flex-col gap-2.5 animate-in slide-in-from-top-2 duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#1475e1]/30 border border-[#1475e1]/50 flex items-center justify-center text-lg animate-pulse">
                          🌧️
                        </div>
                        <div>
                          <div className="text-xs font-black text-cyan-300 tracking-wider uppercase flex items-center gap-1.5">
                            <span>Stake Rain Bot</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                              BOT
                            </span>
                          </div>
                          <div className="text-[11px] text-[#b1bad3]">Community reward drop active!</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-[#b1bad3]/60">{m.time}</span>
                    </div>

                    <div className="bg-[#0f212e]/85 border border-white/5 rounded-lg p-2.5 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-[#b1bad3] font-medium uppercase tracking-wider">
                          Total Rain Pool
                        </div>
                        <div className="text-sm font-black text-white">
                          ₹{m.rainData.totalPool.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-[#b1bad3] font-medium uppercase tracking-wider">
                          Player Share
                        </div>
                        <div className="text-sm font-black text-[#00e701]">
                          +₹{m.rainData.shareAmount.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isClaimed || isClaimingRain === m.rainData.id}
                      onClick={() => handleClaimRain(m.rainData!.id, m.rainData!.shareAmount)}
                      className={`w-full py-2.5 rounded-lg font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                        isClaimed
                          ? "bg-[#213743] text-[#b1bad3] cursor-not-allowed border border-white/10"
                          : "bg-gradient-to-r from-[#00e701] to-[#00c901] hover:brightness-110 text-black font-extrabold active:scale-95 shadow-[0_0_12px_rgba(0,231,1,0.3)]"
                      }`}
                    >
                      {isClaimed ? (
                        <>
                          <span className="text-emerald-400 font-bold">✓</span>
                          <span>Claimed to Balance</span>
                        </>
                      ) : isClaimingRain === m.rainData.id ? (
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <CloudRain className="w-4 h-4" />
                          <span>Claim Rain (+₹{m.rainData.shareAmount})</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              }

              // 2c. Regular Chat Message with Dynamic VIP Badge
              const badgeStyle =
                TIER_BADGE_STYLES[m.badge] || TIER_BADGE_STYLES.Bronze;

              return (
                <div
                  key={m.id}
                  className={`bg-[#1a2c38] rounded-xl p-3 border border-[#213743]/50 flex flex-col gap-1 text-xs sm:text-sm ${
                    m.isSelf ? "border-[#00e701]/40 shadow-[0_0_8px_rgba(0,231,1,0.05)]" : ""
                  }`}
                >
                  {/* User Header Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Real Dynamic VIP Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                        title={`VIP Tier: ${m.badge}`}
                      >
                        <span>{m.badgeIcon || badgeStyle.icon}</span>
                        <span>{m.badge}</span>
                      </span>

                      <span
                        onClick={() => handleMentionUser(m.user)}
                        className="font-bold text-white mr-1.5 hover:underline cursor-pointer tracking-tight"
                      >
                        {m.user}:
                      </span>
                    </div>
                    <span className="text-[10px] text-[#b1bad3]/60 font-mono shrink-0">
                      {m.time}
                    </span>
                  </div>

                  {/* Message Text with authentic Stake @mention pills */}
                  <p className="text-[#d5dceb] leading-relaxed break-words font-normal">
                    {renderMessageText(m.text)}
                  </p>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Feedback/Status Toast for /tip */}
          {tipStatus && (
            <div
              className={`mx-3 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 border animate-in slide-in-from-bottom-2 duration-150 ${
                tipStatus.isError
                  ? "bg-rose-500/15 border-rose-500/30 text-rose-300"
                  : "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{tipStatus.msg}</span>
            </div>
          )}

          {/* 3. Input Bar & Bottom Action Row */}
          <div className="relative z-30 shrink-0 w-full border-t border-[#213743] p-3 bg-[#1a2c38] space-y-2">
            {/* Full Emoji Picker Popover */}
            {showEmojiPicker && (
              <div className="absolute bottom-full mb-2 left-2 right-2 bg-[#1a2c38] border border-[#2f4553] rounded-2xl shadow-2xl p-3 z-30 animate-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-[#213743] pb-2 mb-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEmojiTab("popular")}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                        emojiTab === "popular"
                          ? "bg-[#00e701]/20 text-[#00e701]"
                          : "text-[#b1bad3] hover:text-white"
                      }`}
                    >
                      Popular
                    </button>
                    <button
                      onClick={() => setEmojiTab("gaming")}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                        emojiTab === "gaming"
                          ? "bg-[#00e701]/20 text-[#00e701]"
                          : "text-[#b1bad3] hover:text-white"
                      }`}
                    >
                      Gaming
                    </button>
                    <button
                      onClick={() => setEmojiTab("faces")}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                        emojiTab === "faces"
                          ? "bg-[#00e701]/20 text-[#00e701]"
                          : "text-[#b1bad3] hover:text-white"
                      }`}
                    >
                      Faces
                    </button>
                  </div>
                  <button
                    onClick={() => setShowEmojiPicker(false)}
                    className="text-[#b1bad3] hover:text-white p-0.5 cursor-pointer text-xs"
                  >
                    ✕
                  </button>
                </div>

                {/* Emoji Grid */}
                <div className="grid grid-cols-6 gap-1.5 max-h-36 overflow-y-auto">
                  {EMOJI_CATEGORIES[emojiTab].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleInsertEmoji(emoji)}
                      className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-[#213743] active:scale-90 text-lg transition-all cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Form with Input Field & Smile Icon */}
            <form onSubmit={handleSendMessage} className="space-y-2">
              <div className="relative flex items-center w-full">
                <input
                  ref={chatInputRef}
                  type="text"
                  placeholder="Type a message or /tip @user amount..."
                  value={inputText}
                  maxLength={MAX_CHARS}
                  onChange={(e) => setInputText(e.target.value)}
                  className="bg-[#0f212e] border border-[#213743] focus:border-[#2f4553] rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white placeholder-[#b1bad3]/70 outline-none w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="absolute right-3 text-amber-400 hover:scale-110 transition-transform cursor-pointer flex items-center justify-center"
                  aria-label="Emoji Picker"
                >
                  <Smile className="w-5 h-5 fill-amber-400/20 text-amber-400" />
                </button>
              </div>

              {/* Bottom Controls Bar */}
              <div className="flex items-center justify-between pt-1">
                {/* Left: Live User Count */}
                <span className="flex items-center gap-1.5 text-xs text-[#b1bad3]">
                  <span className="w-2 h-2 rounded-full bg-[#00e701] shadow-[0_0_6px_#00e701] animate-pulse"></span>
                  <span>Online: {onlineCount.toLocaleString()}</span>
                </span>

                {/* Right Grouping */}
                <div className="flex items-center gap-2">
                  {/* Character limit countdown */}
                  <span className="text-xs font-semibold text-[#b1bad3]">
                    {charsRemaining}
                  </span>

                  {/* Notepad Rules Button */}
                  <button
                    type="button"
                    onClick={() => setShowRulesModal(true)}
                    title="Chat Rules"
                    className="bg-[#213743] hover:bg-[#2f4553] text-[#b1bad3] hover:text-white rounded-lg p-2 cursor-pointer transition-colors flex items-center justify-center"
                  >
                    <FileText className="w-4 h-4" />
                  </button>

                  {/* Send Button: Solid Stake Blue */}
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="bg-[#1475e1] hover:bg-[#1164c2] text-white font-bold px-4 py-2 rounded-lg text-xs sm:text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95 shadow-sm"
                  >
                    Send
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </aside>

      {/* 4. Chat Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150 select-none">
          <div className="w-full max-w-md rounded-2xl bg-[#1a2c38] border border-[#2f4553] shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150 text-white max-h-[90dvh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#213743] pb-3 shrink-0">
              <h3 className="text-base font-extrabold tracking-wide flex items-center gap-2">
                <span>📋</span>
                <span>Chat Rules</span>
              </h3>
              <button
                onClick={() => setShowRulesModal(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors cursor-pointer text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            {/* Modal Rules Content */}
            <div className="space-y-2.5 text-xs leading-relaxed text-[#b1bad3] overflow-y-auto pr-1 flex-1">
              {STAKE_CHAT_RULES.map((rule, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#213743] text-white font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <p className="text-[#d5dceb]">{rule}</p>
                </div>
              ))}
            </div>

            {/* Modal Footer with Forum Link & Dismiss Button */}
            <div className="space-y-3 pt-2 border-t border-[#213743] shrink-0">
              <a
                href="#forum"
                onClick={() => setShowRulesModal(false)}
                className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#1475e1] hover:underline"
              >
                <span>Read the full Stake Chat Rules on our Forum</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => setShowRulesModal(false)}
                className="w-full py-2.5 rounded-xl bg-[#1475e1] hover:bg-[#1164c2] text-white font-extrabold text-sm transition-all shadow-md active:scale-95 cursor-pointer"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
