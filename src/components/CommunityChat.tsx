"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Send,
  Smile,
  CloudRain,
  ShieldCheck,
  Info,
  ChevronDown,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

interface ChatMessage {
  id: string;
  user: string;
  badge: "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond";
  badgeColor: string;
  time: string;
  text: string;
  isSelf?: boolean;
}

const initialMessages: ChatMessage[] = [
  {
    id: "m1",
    user: "Satoshi_88",
    badge: "Platinum",
    badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    time: "02:40",
    text: "gg on that 24x crash run! 🚀",
  },
  {
    id: "m2",
    user: "CryptoWolf",
    badge: "Gold",
    badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    time: "02:41",
    text: "mines 3 gems and cashout is the only way brothers 💎",
  },
  {
    id: "m3",
    user: "Valkyrie",
    badge: "Diamond",
    badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    time: "02:42",
    text: "Zeus gave a 120x tumble on Gates ⚡",
  },
  {
    id: "m4",
    user: "LuckyStrike",
    badge: "Silver",
    badgeColor: "bg-slate-400/20 text-slate-300 border-slate-400/30",
    time: "02:43",
    text: "rain when?? 🌧️",
  },
  {
    id: "m5",
    user: "ApexPredator",
    badge: "Platinum",
    badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    time: "02:44",
    text: "just hit 110x on Plinko 16 rows!! 🤑",
  },
];

const cannedChatter = [
  "plinko 16 rows is paying today 🎯",
  "who's leading the $100k daily race? 🏆",
  "mines is wild right now 💣",
  "gg brothers! 💎",
  "cashout early or get wrecked haha 😂",
  "zeus 500x multiplier dropped on stream! ⚡",
  "stake VIP weekly bonus was huge 💰",
  "rocket went to 48x on crash! 🚀",
  "1 more game before sleep lol 😴",
  "dropping 50 balls on plinko wish me luck 🍀",
  "rakeback claimed, time to send it on Limbo 🚀",
  "always 1 gem away from 100x on mines 💎",
];

const EMOJI_CATEGORIES = {
  popular: ["🔥", "💎", "🚀", "🤑", "👑", "💰", "⚡", "🍀", "💸", "🦄", "🏆", "🎯"],
  gaming: ["🎰", "🎲", "🃏", "💣", "🪙", "🔮", "🥇", "🎪", "🎈", "👾", "🕹️", "🎳"],
  faces: ["😂", "🥳", "😎", "🤩", "👏", "🙌", "💀", "🤝", "🫡", "🤖", "🤯", "✨"],
};

const MAX_CHARS = 160;

export default function CommunityChat() {
  const { isChatOpen, toggleChat, updateBalance } = useGame();
  const [channel, setChannel] = useState<"English" | "Hindi" | "High Rollers" | "Sports">("English");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [hasRain, setHasRain] = useState<boolean>(true);
  const [rainClaimed, setRainClaimed] = useState<boolean>(false);
  const [onlineCount, setOnlineCount] = useState<number>(1482);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [emojiTab, setEmojiTab] = useState<"popular" | "gaming" | "faces">("popular");
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);

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
      const badgeStyles: Record<string, string> = {
        Bronze: "bg-amber-800/20 text-[#cd7f32] border-[#cd7f32]/40",
        Silver: "bg-slate-400/20 text-slate-300 border-slate-400/40",
        Gold: "bg-amber-500/20 text-amber-400 border-amber-500/40",
        Platinum: "bg-cyan-500/20 text-cyan-400 border-cyan-500/40",
        Diamond: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      };
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
        badgeColor: badgeStyles[chosenBadge],
        time: timeStr,
        text,
      };

      setMessages((prev) => [...prev.slice(-30), newMsg]);
      setOnlineCount((c) => c + (Math.random() > 0.5 ? 1 : -1));
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  // Send user message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    if (!isSoundMuted) {
      sounds.playClick();
    }
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    const newMsg: ChatMessage = {
      id: `my-${Date.now()}`,
      user: "You",
      badge: "Gold",
      badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/40",
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

  // Claim Community Rain
  const handleClaimRain = () => {
    if (rainClaimed) return;
    updateBalance(1.5);
    setRainClaimed(true);
    if (!isSoundMuted) {
      sounds.playDiceWin();
    }
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.5 },
        colors: ["#38bdf8", "#00e701", "#ffffff"],
      });
    } catch {}

    setTimeout(() => {
      setHasRain(false);
    }, 3000);
  };

  if (!isChatOpen) return null;

  const charsRemaining = MAX_CHARS - inputText.length;

  return (
    <>
      <aside className="fixed top-14 sm:top-16 bottom-0 right-0 z-50 w-full sm:w-[350px] bg-[#1a2c38] border-l border-[#213743] shadow-2xl flex flex-col select-none animate-in slide-in-from-right duration-200">
        {/* 1. Live Online Header */}
        <div className="flex items-center justify-between border-b border-[#213743] px-3.5 py-3 bg-[#14232f] shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[#00e701] shadow-[0_0_8px_#00e701] animate-pulse" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white tracking-wide">Stake Chat</span>
                <span className="rounded bg-[#213743] px-1.5 py-0.2 text-[9px] font-mono font-bold text-[#00e701]">
                  {channel}
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#b1bad3]">
                {onlineCount.toLocaleString()} online
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Sound Toggle */}
            <button
              onClick={() => setIsSoundMuted(!isSoundMuted)}
              title={isSoundMuted ? "Unmute sounds" : "Mute sounds"}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors cursor-pointer"
            >
              {isSoundMuted ? (
                <VolumeX className="h-3.5 w-3.5 text-red-400" />
              ) : (
                <Volume2 className="h-3.5 w-3.5" />
              )}
            </button>

            {/* Chat Rules Info Button */}
            <button
              onClick={() => setShowRulesModal(true)}
              title="Stake Chat Rules"
              className="flex items-center gap-1 text-[11px] font-bold text-[#b1bad3] hover:text-white px-2 py-1 rounded-lg hover:bg-[#213743] transition-colors cursor-pointer"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-[#00e701]" />
              <span className="hidden sm:inline">Rules</span>
            </button>

            {/* Close Chat */}
            <button
              onClick={toggleChat}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors cursor-pointer"
              aria-label="Close Chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 2. Channel Selector */}
        <div className="flex gap-1 border-b border-[#213743] px-3 py-2 bg-[#1a2c38] shrink-0">
          {(["English", "Hindi", "High Rollers", "Sports"] as const).map((ch) => (
            <button
              key={ch}
              onClick={() => {
                if (!isSoundMuted) sounds.playClick();
                setChannel(ch);
              }}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                channel === ch
                  ? "bg-[#213743] text-[#00e701] shadow-sm border border-[#00e701]/30"
                  : "text-[#b1bad3] hover:text-white"
              }`}
            >
              {ch}
            </button>
          ))}
        </div>

        {/* 3. Community Crypto Rain Banner */}
        {hasRain && (
          <div className="m-2.5 rounded-xl border border-sky-500/40 bg-gradient-to-r from-sky-950/60 to-blue-950/60 p-2.5 shadow-lg flex items-center justify-between shrink-0 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2">
              <CloudRain className="h-5 w-5 text-sky-400 animate-bounce" />
              <div>
                <div className="text-[11px] font-black text-white">Crypto Rain Active!</div>
                <div className="text-[10px] text-sky-300 font-medium">$25.00 shared among chat</div>
              </div>
            </div>
            <button
              onClick={handleClaimRain}
              disabled={rainClaimed}
              className={`rounded-lg px-3 py-1.5 text-xs font-black transition-all cursor-pointer ${
                rainClaimed
                  ? "bg-slate-700 text-slate-400 cursor-default"
                  : "bg-sky-400 text-[#0f212e] shadow-md hover:bg-sky-300 active:scale-95"
              }`}
            >
              {rainClaimed ? "Claimed ✓" : "Claim $1.50"}
            </button>
          </div>
        )}

        {/* 4. Scrollable Chat Messages Area (Isolated Bubble Containers) */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`rounded-xl p-2.5 space-y-1 transition-all text-xs ${
                m.isSelf
                  ? "bg-[#0f212e] border border-[#00e701]/40 shadow-[0_0_12px_rgba(0,231,1,0.06)]"
                  : "bg-[#0f212e] border border-[#213743] hover:border-[#2f4553]"
              }`}
            >
              {/* Header with VIP Badge & Username */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`rounded px-1.5 py-0.2 text-[9px] font-black uppercase border tracking-wider ${m.badgeColor}`}
                  >
                    {m.badge}
                  </span>
                  <button
                    onClick={() => handleMentionUser(m.user)}
                    title={`Mention ${m.user}`}
                    className="font-bold text-[#b1bad3] hover:text-white hover:underline transition-colors cursor-pointer"
                  >
                    {m.user}
                  </button>
                </div>
                <span className="text-[10px] text-[#b1bad3]/60 font-mono">{m.time}</span>
              </div>

              {/* Message text */}
              <p className="text-white text-[12px] sm:text-[13px] leading-relaxed break-words font-medium">
                {m.text}
              </p>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* 5. Chat Input Box with Emoji Picker & 160 Char Counter */}
        <div className="relative border-t border-[#213743] p-3 bg-[#14232f] shrink-0">
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
                  className="text-[#b1bad3] hover:text-white p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
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

          {/* Quick Reaction Bar */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              {["🔥", "💎", "🚀", "🤑", "⚡"].map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => handleInsertEmoji(em)}
                  className="rounded-lg bg-[#1a2c38] px-2 py-0.5 text-xs hover:bg-[#213743] hover:scale-105 transition-all cursor-pointer"
                >
                  {em}
                </button>
              ))}
            </div>

            {/* 160 Char Counter */}
            <span
              className={`text-[10px] font-mono font-bold transition-colors ${
                charsRemaining <= 10
                  ? "text-red-400"
                  : charsRemaining <= 30
                  ? "text-amber-400"
                  : "text-[#b1bad3]/60"
              }`}
            >
              {charsRemaining}
            </span>
          </div>

          {/* Input & Action Buttons */}
          <form onSubmit={handleSendMessage} className="flex items-center gap-1.5">
            <div className="flex flex-1 items-center rounded-xl border border-[#213743] bg-[#0f212e] px-2 py-1.5 focus-within:border-[#00e701] transition-colors">
              <input
                ref={chatInputRef}
                type="text"
                placeholder="Type in chat..."
                value={inputText}
                maxLength={MAX_CHARS}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full bg-transparent px-1 text-xs text-white placeholder-[#b1bad3]/60 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors cursor-pointer ${
                  showEmojiPicker
                    ? "text-[#00e701] bg-[#213743]"
                    : "text-[#b1bad3] hover:text-white hover:bg-[#1a2c38]"
                }`}
                aria-label="Open Emoji Picker"
              >
                <Smile className="h-4 w-4" />
              </button>
            </div>

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00e701] text-[#0f212e] disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:bg-[#00c701] active:scale-95 cursor-pointer shrink-0 shadow-sm"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </aside>

      {/* 6. Stake Chat Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150 select-none">
          <div className="w-full max-w-sm rounded-2xl bg-[#1a2c38] border border-[#2f4553] shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150 text-white">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#00e701]" />
                <h3 className="text-base font-extrabold tracking-wide">Stake Chat Rules</h3>
              </div>
              <button
                onClick={() => setShowRulesModal(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Rules Content */}
            <div className="space-y-3 text-xs leading-relaxed text-[#b1bad3]">
              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00e701]/20 text-[#00e701] font-bold text-[10px]">
                  1
                </span>
                <p>
                  <strong className="text-white">No spamming or flooding:</strong> Do not repeat messages, post walls of text, or type in ALL CAPS.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00e701]/20 text-[#00e701] font-bold text-[10px]">
                  2
                </span>
                <p>
                  <strong className="text-white">No begging or loans:</strong> Asking for rain, tips, crypto loans, or posting wallet addresses is strictly forbidden.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00e701]/20 text-[#00e701] font-bold text-[10px]">
                  3
                </span>
                <p>
                  <strong className="text-white">No toxicity or harassment:</strong> Treat other players and moderators with respect. Zero tolerance for hate speech or racism.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00e701]/20 text-[#00e701] font-bold text-[10px]">
                  4
                </span>
                <p>
                  <strong className="text-white">No advertising or promotion:</strong> External referral codes, social links, or competing services will result in an instant ban.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00e701]/20 text-[#00e701] font-bold text-[10px]">
                  5
                </span>
                <p>
                  <strong className="text-white">Protect your security:</strong> Never share passwords or seed phrases. Stake staff will never ask for your private keys.
                </p>
              </div>
            </div>

            {/* Acknowledge Button */}
            <button
              onClick={() => setShowRulesModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#00e701] hover:bg-[#00c701] text-[#0f212e] font-extrabold text-sm transition-all shadow-md active:scale-95 cursor-pointer"
            >
              I Understand
            </button>
          </div>
        </div>
      )}
    </>
  );
}
