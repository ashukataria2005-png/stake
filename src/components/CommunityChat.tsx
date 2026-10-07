"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Smile,
  ChevronDown,
  FileText,
  Star,
  ExternalLink,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";

interface ChatMessage {
  id: string;
  user: string;
  badge: "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond";
  badgeColor?: string;
  time: string;
  text: string;
  isSelf?: boolean;
}

const initialMessages: ChatMessage[] = [
  {
    id: "m1",
    user: "Satoshi_88",
    badge: "Platinum",
    time: "02:40",
    text: "gg @CryptoWolf on that 24x crash run! 🚀",
  },
  {
    id: "m2",
    user: "CryptoWolf",
    badge: "Gold",
    time: "02:41",
    text: "mines 3 gems and cashout is the only way brothers 💎",
  },
  {
    id: "m3",
    user: "Valkyrie",
    badge: "Diamond",
    time: "02:42",
    text: "@ApexPredator Zeus gave a 120x tumble on Gates ⚡",
  },
  {
    id: "m4",
    user: "LuckyStrike",
    badge: "Silver",
    time: "02:43",
    text: "@Satoshi_88 rain when?? 🌧️",
  },
  {
    id: "m5",
    user: "ApexPredator",
    badge: "Platinum",
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
  const { isChatOpen, toggleChat } = useGame();
  const [selectedChannel, setSelectedChannel] = useState(CHANNELS[0]);
  const [isChannelDropdownOpen, setIsChannelDropdownOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [onlineCount, setOnlineCount] = useState<number>(56926);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [emojiTab, setEmojiTab] = useState<"popular" | "gaming" | "faces">("popular");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatInputRef = useRef<HTMLInputElement | null>(null);

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
      const badges: Array<"Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond"> = [
        "Bronze",
        "Silver",
        "Gold",
        "Platinum",
        "Diamond",
      ];
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

      const chosenBadge = badges[Math.floor(Math.random() * badges.length)];
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
        time: timeStr,
        text,
      };

      setMessages((prev) => [...prev.slice(-35), newMsg]);
      setOnlineCount((c) => c + (Math.random() > 0.5 ? Math.floor(Math.random() * 5 + 1) : -Math.floor(Math.random() * 4 + 1)));
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  // Send user message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    sounds.playClick();
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    const newMsg: ChatMessage = {
      id: `my-${Date.now()}`,
      user: "You",
      badge: "Gold",
      time: timeStr,
      text: inputText.trim(),
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
  const handleMentionUser = (user: string) => {
    const mention = `@${user} `;
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
      <aside className="fixed top-14 sm:top-16 bottom-0 right-0 z-50 w-full sm:w-[350px] bg-[#1a2c38] border-l border-[#213743] shadow-2xl flex flex-col select-none animate-in slide-in-from-right duration-200">
        {/* 1. Channel Header: Dropdown Pill with Flag (e.g. 🇮🇳 India ⌄) & Minimal Close '✕' */}
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

          {/* Minimal Clean '✕' Dismiss Button */}
          <button
            onClick={toggleChat}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors cursor-pointer text-sm font-semibold"
            aria-label="Close Chat"
          >
            ✕
          </button>
        </div>

        {/* 2. Scrollable Message Cards (Isolated Bubbles matching Screenshot 18) */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`bg-[#1a2c38] rounded-xl p-3 my-1.5 border border-[#213743]/50 flex flex-col gap-1 text-xs sm:text-sm ${
                m.isSelf ? "border-[#00e701]/40 shadow-[0_0_8px_rgba(0,231,1,0.05)]" : ""
              }`}
            >
              {/* User Header Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Star className="w-3.5 h-3.5 fill-[#00e701] text-[#00e701] shrink-0" />
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
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* 3. Input Bar & Bottom Action Row matching Screenshots 18, 19, 20 */}
        <div className="relative border-t border-[#213743] p-3 bg-[#14232f] shrink-0 space-y-2">
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
                placeholder="Type your message"
                value={inputText}
                maxLength={MAX_CHARS}
                onChange={(e) => setInputText(e.target.value)}
                className="bg-[#0f212e] border border-[#213743] focus:border-[#2f4553] rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#b1bad3] outline-none w-full pr-10"
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
      </aside>

      {/* 4. Chat Rules Modal (Screenshots 19 & 20) with all 12 rules verbatim and forum link */}
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

            {/* Modal Rules Content - 12 Rules Verbatim */}
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
