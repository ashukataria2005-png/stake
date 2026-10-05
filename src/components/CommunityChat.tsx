"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Send,
  Smile,
  CloudRain,
  Flame,
  ShieldCheck,
  Check,
  Award,
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
    text: "mines 3 gems and cashout is the only way brothers",
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
  "plinko 16 rows is paying today",
  "who's leading the $100k daily race?",
  "mines is wild right now",
  "gg brothers! 💎",
  "cashout early or get wrecked haha",
  "zeus 500x multiplier dropped on stream!",
  "stake VIP weekly bonus was huge",
  "rocket went to 48x on crash!",
  "1 more game before sleep lol",
  "dropping 50 balls on plinko wish me luck",
  "rakeback claimed, time to send it on Limbo 🚀",
  "always 1 gem away from 100x on mines",
];

export default function CommunityChat() {
  const { isChatOpen, toggleChat, updateBalance, currency } = useGame();
  const [channel, setChannel] = useState<"Global" | "Hindi" | "High Rollers" | "Sports">("Global");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [hasRain, setHasRain] = useState<boolean>(true);
  const [rainClaimed, setRainClaimed] = useState<boolean>(false);
  const [onlineCount, setOnlineCount] = useState<number>(1482);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

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
        Bronze: "bg-amber-800/20 text-amber-500 border-amber-800/30",
        Silver: "bg-slate-400/20 text-slate-300 border-slate-400/30",
        Gold: "bg-amber-500/20 text-amber-400 border-amber-500/30",
        Platinum: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
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
      badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      time: timeStr,
      text: inputText.trim(),
      isSelf: true,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");
  };

  // Claim Community Rain
  const handleClaimRain = () => {
    if (rainClaimed) return;
    updateBalance(1.5);
    setRainClaimed(true);
    sounds.playDiceWin();
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

  return (
    <aside className="fixed top-16 bottom-0 right-0 z-40 w-full sm:w-[340px] bg-[#1a2c38] border-l border-[#213743] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 select-none">
      {/* 1. Chat Header */}
      <div className="flex items-center justify-between border-b border-[#213743] p-3.5 bg-[#14232f]">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-[#00e701] animate-pulse" />
          <span className="text-xs font-black text-white tracking-wide">Community Chat</span>
          <span className="rounded-md bg-[#213743] px-1.5 py-0.5 text-[10px] font-mono text-[#b1bad3]">
            {onlineCount.toLocaleString()}
          </span>
        </div>
        <button
          onClick={toggleChat}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* 2. Channel Selector */}
      <div className="flex gap-1 border-b border-[#213743] px-3 py-2 bg-[#1a2c38]">
        {(["Global", "Hindi", "High Rollers", "Sports"] as const).map((ch) => (
          <button
            key={ch}
            onClick={() => {
              sounds.playClick();
              setChannel(ch);
            }}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
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
        <div className="m-2.5 rounded-xl border border-sky-500/40 bg-gradient-to-r from-sky-950/60 to-blue-950/60 p-3 shadow-lg flex items-center justify-between animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2">
            <CloudRain className="h-5 w-5 text-sky-400 animate-bounce" />
            <div>
              <div className="text-[11px] font-black text-white">Crypto Rain Active!</div>
              <div className="text-[10px] text-sky-300">$25.00 shared among chat</div>
            </div>
          </div>
          <button
            onClick={handleClaimRain}
            disabled={rainClaimed}
            className={`rounded-lg px-3 py-1.5 text-xs font-black transition-all ${
              rainClaimed
                ? "bg-slate-700 text-slate-400 cursor-default"
                : "bg-sky-400 text-[#0f212e] shadow-md hover:bg-sky-300 active:scale-95"
            }`}
          >
            {rainClaimed ? "Claimed ✓" : "Claim $1.50"}
          </button>
        </div>
      )}

      {/* 4. Scrollable Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`rounded-xl p-2.5 space-y-1 transition-all text-xs ${
              m.isSelf
                ? "bg-[#00e701]/10 border border-[#00e701]/30 ml-4"
                : "bg-[#0f212e] border border-[#213743]"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span
                  className={`rounded px-1 py-0.2 text-[9px] font-black uppercase border ${m.badgeColor}`}
                >
                  {m.badge}
                </span>
                <span className="font-bold text-white tracking-tight">{m.user}</span>
              </div>
              <span className="text-[10px] text-[#b1bad3]/70 font-mono">{m.time}</span>
            </div>
            <p className="text-white text-[12px] leading-relaxed break-words">{m.text}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 5. Chat Input Box */}
      <form onSubmit={handleSendMessage} className="border-t border-[#213743] p-3 bg-[#14232f] space-y-2">
        <div className="flex items-center gap-2">
          {/* Quick emoji reaction buttons */}
          {["🔥", "💎", "🚀", "🤑"].map((em) => (
            <button
              key={em}
              type="button"
              onClick={() => setInputText((prev) => prev + " " + em)}
              className="rounded-lg bg-[#1a2c38] px-2 py-1 text-xs hover:bg-[#213743] transition-colors"
            >
              {em}
            </button>
          ))}
        </div>

        <div className="flex items-center rounded-xl border border-[#213743] bg-[#0f212e] p-1.5 focus-within:border-[#00e701] transition-colors">
          <input
            type="text"
            placeholder="Type in chat..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full bg-transparent px-2.5 py-1 text-xs text-white placeholder-[#b1bad3]/60 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00e701] text-[#0f212e] disabled:opacity-40 transition-all hover:bg-[#00c701]"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </aside>
  );
}
