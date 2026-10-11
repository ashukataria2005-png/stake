"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  ShieldCheck,
  Maximize2,
  Minimize2,
  TrendingUp,
  X,
  Copy,
  Check,
  Sparkles,
  Zap,
  Box,
  Layers,
  Award,
  Crown,
  Gem,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

export type CaseRarity = "common" | "rare" | "epic" | "legendary";

export interface CaseItem {
  id: string;
  name: string;
  multiplier: number;
  probability: number; // percentage (e.g. 35.0)
  rarity: CaseRarity;
  iconName: string;
}

export interface CaseTier {
  id: string;
  name: string;
  basePrice: number;
  color: string;
  border: string;
  glow: string;
  items: CaseItem[];
}

const CASE_TIERS: CaseTier[] = [
  {
    id: "novice",
    name: "Novice Crate",
    basePrice: 1.0,
    color: "from-slate-800 to-slate-950",
    border: "border-slate-600",
    glow: "rgba(100, 116, 139, 0.3)",
    items: [
      { id: "n1", name: "Rusty Iron Shiv", multiplier: 0.1, probability: 40.0, rarity: "common", iconName: "Layers" },
      { id: "n2", name: "Combat Dagger", multiplier: 0.5, probability: 35.0, rarity: "common", iconName: "Award" },
      { id: "n3", name: "Tactical Grips", multiplier: 1.5, probability: 15.0, rarity: "rare", iconName: "Gem" },
      { id: "n4", name: "Neon Hyperbeast", multiplier: 3.5, probability: 7.0, rarity: "epic", iconName: "Sparkles" },
      { id: "n5", name: "Crimson Karambit", multiplier: 10.0, probability: 2.5, rarity: "legendary", iconName: "Crown" },
      { id: "n6", name: "Dragon Lore AWP", multiplier: 55.0, probability: 0.5, rarity: "legendary", iconName: "Crown" },
    ],
  },
  {
    id: "veteran",
    name: "Veteran Armory",
    basePrice: 5.0,
    color: "from-blue-950 to-slate-950",
    border: "border-blue-600",
    glow: "rgba(37, 99, 235, 0.35)",
    items: [
      { id: "v1", name: "Safari Mesh M4", multiplier: 0.15, probability: 36.0, rarity: "common", iconName: "Layers" },
      { id: "v2", name: "Blue Steel Bayonet", multiplier: 0.6, probability: 34.0, rarity: "common", iconName: "Award" },
      { id: "v3", name: "Ultraviolet Gloves", multiplier: 1.8, probability: 18.0, rarity: "rare", iconName: "Gem" },
      { id: "v4", name: "Kill Confirmed USP", multiplier: 4.5, probability: 8.0, rarity: "epic", iconName: "Sparkles" },
      { id: "v5", name: "Marble Fade Butterfly", multiplier: 12.0, probability: 3.5, rarity: "legendary", iconName: "Crown" },
      { id: "v6", name: "Gungnir Prism Sniper", multiplier: 75.0, probability: 0.5, rarity: "legendary", iconName: "Crown" },
    ],
  },
  {
    id: "highroller",
    name: "High Roller Vault",
    basePrice: 20.0,
    color: "from-purple-950 to-slate-950",
    border: "border-purple-600",
    glow: "rgba(168, 85, 247, 0.4)",
    items: [
      { id: "h1", name: "Asiimov AK-47", multiplier: 0.2, probability: 34.0, rarity: "common", iconName: "Layers" },
      { id: "h2", name: "Vulcan Carbine", multiplier: 0.7, probability: 32.0, rarity: "common", iconName: "Award" },
      { id: "h3", name: "Printstream Deagle", multiplier: 2.0, probability: 20.0, rarity: "rare", iconName: "Gem" },
      { id: "h4", name: "Doppler Phase 2", multiplier: 5.0, probability: 9.0, rarity: "epic", iconName: "Sparkles" },
      { id: "h5", name: "Lore Skeleton Knife", multiplier: 15.0, probability: 4.5, rarity: "legendary", iconName: "Crown" },
      { id: "h6", name: "Howl M4A4 StatTrak", multiplier: 120.0, probability: 0.5, rarity: "legendary", iconName: "Crown" },
    ],
  },
  {
    id: "master",
    name: "Master Royale",
    basePrice: 100.0,
    color: "from-amber-950 to-slate-950",
    border: "border-amber-500",
    glow: "rgba(245, 158, 11, 0.45)",
    items: [
      { id: "m1", name: "Prismatic Talon", multiplier: 0.25, probability: 32.0, rarity: "common", iconName: "Layers" },
      { id: "m2", name: "Stiletto Sapphire", multiplier: 0.8, probability: 32.0, rarity: "common", iconName: "Award" },
      { id: "m3", name: "Pandora Sports Gloves", multiplier: 2.2, probability: 20.0, rarity: "rare", iconName: "Gem" },
      { id: "m4", name: "Vice Driver Gloves", multiplier: 6.0, probability: 10.0, rarity: "epic", iconName: "Sparkles" },
      { id: "m5", name: "Emerald Karambit", multiplier: 25.0, probability: 5.2, rarity: "legendary", iconName: "Crown" },
      { id: "m6", name: "Souvenir Dragon Lore", multiplier: 250.0, probability: 0.8, rarity: "legendary", iconName: "Crown" },
    ],
  },
];

const ITEM_CARD_WIDTH = 130; // px
const REEL_TARGET_INDEX = 38; // landing index in reel

export default function CasesGame() {
  const { balance, updateBalance, currencySymbol, addRecentlyPlayedGame } = useGame();
  const activeSym = currencySymbol || "$";

  // Register in Recently Played once on mount
  useEffect(() => {
    if (addRecentlyPlayedGame) {
      addRecentlyPlayedGame({
        id: "stake-originals-cases",
        title: "Cases",
        image: "/games/stake-originals/stake-originals-cases.webp",
        href: "/games/cases",
      });
    }
  }, []);

  // Selected Tier
  const [selectedTierId, setSelectedTierId] = useState<string>("novice");
  const activeTier = CASE_TIERS.find((t) => t.id === selectedTierId) || CASE_TIERS[0];

  // Betting Controls
  const [betAmount, setBetAmount] = useState<number>(activeTier.basePrice);
  const [betInput, setBetInput] = useState<string>(activeTier.basePrice.toString());
  const [isFastOpen, setIsFastOpen] = useState<boolean>(false);

  // Sync bet amount when tier changes
  const handleSelectTier = (tierId: string) => {
    if (isUnboxing) return;
    setSelectedTierId(tierId);
    const tier = CASE_TIERS.find((t) => t.id === tierId) || CASE_TIERS[0];
    setBetAmount(tier.basePrice);
    setBetInput(tier.basePrice.toString());
  };

  useEffect(() => {
    if (betInput !== "" && parseFloat(betInput) === betAmount) return;
    setBetInput(betAmount.toString());
  }, [betAmount]);

  // Reel State
  const [isUnboxing, setIsUnboxing] = useState<boolean>(false);
  const [reelItems, setReelItems] = useState<CaseItem[]>([]);
  const [reelOffset, setReelOffset] = useState<number>(0);
  const [winningItem, setWinningItem] = useState<CaseItem | null>(null);
  const [lastPayout, setLastPayout] = useState<number | null>(null);

  // Settings & Modals
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [showFairnessModal, setShowFairnessModal] = useState<boolean>(false);
  const [showLiveStats, setShowLiveStats] = useState<boolean>(false);
  const [copiedSeed, setCopiedSeed] = useState<boolean>(false);

  // Live Stats
  const [stats, setStats] = useState({
    rounds: 0,
    wins: 0,
    losses: 0,
    wagered: 0,
    profit: 0,
  });

  // Pick weighted random item based on exact distribution
  const pickItem = (tier: CaseTier): CaseItem => {
    const rand = Math.random() * 100;
    let cumulative = 0;
    for (const item of tier.items) {
      cumulative += item.probability;
      if (rand <= cumulative) return item;
    }
    return tier.items[tier.items.length - 1];
  };

  // Pre-generate idle reel
  useEffect(() => {
    const initialItems: CaseItem[] = [];
    for (let i = 0; i < 50; i++) {
      initialItems.push(pickItem(activeTier));
    }
    setReelItems(initialItems);
    setReelOffset(0);
  }, [selectedTierId]);

  // Quick Bet Modifiers
  const handleHalfBet = () => {
    if (isUnboxing) return;
    if (soundEnabled) sounds.playClick();
    const next = Math.max(0.01, parseFloat((betAmount / 2).toFixed(2)));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  const handleDoubleBet = () => {
    if (isUnboxing) return;
    if (soundEnabled) sounds.playClick();
    const next = parseFloat((betAmount * 2).toFixed(2));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  const handleMaxBet = () => {
    if (isUnboxing) return;
    if (soundEnabled) sounds.playClick();
    const next = Math.max(0.01, parseFloat(balance.toFixed(2)));
    setBetAmount(next);
    setBetInput(next.toString());
  };

  // Open Case Action
  const handleOpenCase = () => {
    if (isUnboxing) return;
    if (balance < betAmount) {
      alert("Insufficient balance!");
      return;
    }

    updateBalance(-betAmount);
    setIsUnboxing(true);
    setWinningItem(null);
    setLastPayout(null);

    if (soundEnabled) sounds.playBet();

    // Determine winning item
    const won = pickItem(activeTier);

    // Build 50-item reel strip with winning item at REEL_TARGET_INDEX
    const newStrip: CaseItem[] = [];
    for (let i = 0; i < 50; i++) {
      if (i === REEL_TARGET_INDEX) {
        newStrip.push(won);
      } else {
        newStrip.push(pickItem(activeTier));
      }
    }

    setReelItems(newStrip);

    // Reset offset first
    setReelOffset(0);

    const targetOffset =
      REEL_TARGET_INDEX * ITEM_CARD_WIDTH - 280 + ITEM_CARD_WIDTH / 2 + (-20 + Math.random() * 40);

    const animDuration = isFastOpen ? 300 : 3600;

    // Start reel slide
    setTimeout(() => {
      setReelOffset(targetOffset);

      // Sound ticks during unbox
      if (!isFastOpen && soundEnabled) {
        let tickCount = 0;
        const tickInt = setInterval(() => {
          tickCount++;
          sounds.playCaseReelTick();
          if (tickCount >= 20) clearInterval(tickInt);
        }, 160);
      }
    }, 50);

    setTimeout(() => {
      setIsUnboxing(false);
      setWinningItem(won);

      if (soundEnabled) sounds.playCaseMarkerSnap();

      const payout = parseFloat((betAmount * won.multiplier).toFixed(2));
      const profitDelta = parseFloat((payout - betAmount).toFixed(2));

      if (payout > 0) {
        updateBalance(payout);
        setLastPayout(payout);
        if (soundEnabled) {
          if (won.rarity === "legendary" || won.multiplier >= 10.0) {
            sounds.playCashout();
          } else {
            sounds.playGemShimmer();
          }
        }
        if (won.multiplier >= 2.0) {
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.55 } });
        }
      }

      setStats((prev) => ({
        ...prev,
        rounds: prev.rounds + 1,
        wins: won.multiplier >= 1.0 ? prev.wins + 1 : prev.wins,
        losses: won.multiplier < 1.0 ? prev.losses + 1 : prev.losses,
        wagered: parseFloat((prev.wagered + betAmount).toFixed(2)),
        profit: parseFloat((prev.profit + profitDelta).toFixed(2)),
      }));
    }, animDuration + 150);
  };

  const getRarityBadge = (rarity: CaseRarity) => {
    switch (rarity) {
      case "common":
        return "bg-slate-700/60 border-slate-500 text-slate-300";
      case "rare":
        return "bg-blue-900/60 border-blue-500 text-blue-300";
      case "epic":
        return "bg-purple-900/60 border-purple-500 text-purple-300";
      case "legendary":
        return "bg-amber-900/60 border-yellow-400 text-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.4)]";
    }
  };

  const toggleFullscreen = () => {
    if (!gameContainerRef.current) return;
    if (!document.fullscreenElement) {
      gameContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div
      ref={gameContainerRef}
      className="flex flex-col items-center w-full min-h-[calc(100vh-64px)] bg-[#0f212e] text-white p-3 sm:p-6 select-none font-sans"
    >
      {/* =========================================================================
          TOP: HORIZONTAL ROLLING REEL & CASE ARENA (Top of View)
      ========================================================================== */}
      <div className="w-full max-w-4xl bg-[#1a2c38] rounded-2xl p-4 sm:p-6 border border-[#213743] shadow-2xl flex flex-col items-center relative overflow-hidden mb-5">
        
        {/* Tier Selector Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full mb-5">
          {CASE_TIERS.map((tier) => {
            const isSelected = tier.id === selectedTierId;
            return (
              <button
                key={tier.id}
                disabled={isUnboxing}
                onClick={() => handleSelectTier(tier.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? `bg-gradient-to-b ${tier.color} ${tier.border} shadow-lg ring-1 ring-white/20 scale-[1.02]`
                    : "bg-[#0f212e]/70 border-[#213743] hover:bg-[#213743] text-[#b1bad3]"
                } ${isUnboxing ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Box className={`h-4 w-4 ${isSelected ? "text-white" : "text-[#b1bad3]"}`} />
                  <span className="text-xs font-black tracking-wide uppercase truncate">{tier.name}</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-[#00e701]">
                  {activeSym}{tier.basePrice.toFixed(2)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Center Horizontal Rolling Reel Viewport */}
        <div className="relative w-full max-w-2xl h-44 sm:h-52 my-2 bg-[#0c161d] border-2 border-[#213743] rounded-2xl overflow-hidden shadow-inner flex items-center">
          
          {/* Top & Bottom Center Needle Marker */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 z-30 flex flex-col justify-between items-center pointer-events-none">
            <div className="w-0 h-0 border-x-8 border-x-transparent border-t-[14px] border-t-[#00e701] drop-shadow-[0_0_8px_#00e701]" />
            <div className="w-0.5 h-full bg-[#00e701]/80 shadow-[0_0_8px_#00e701]" />
            <div className="w-0 h-0 border-x-8 border-x-transparent border-b-[14px] border-b-[#00e701] drop-shadow-[0_0_8px_#00e701]" />
          </div>

          {/* Left and Right Shading Overlays */}
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#0c161d] to-transparent z-20 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#0c161d] to-transparent z-20 pointer-events-none" />

          {/* Sliding Cards Strip */}
          <div
            className="flex items-center gap-2 pl-4 py-2 absolute left-0"
            style={{
              transform: `translateX(-${reelOffset}px)`,
              transition: isUnboxing
                ? `transform ${isFastOpen ? "300ms" : "3600ms"} cubic-bezier(0.1, 0.85, 0.2, 1)`
                : "none",
            }}
          >
            {reelItems.map((item, idx) => (
              <div
                key={idx}
                className={`w-[122px] h-36 sm:h-44 shrink-0 rounded-xl bg-gradient-to-b from-[#1a2c38] to-[#0f212e] border-2 flex flex-col items-center justify-between p-2 shadow-lg ${
                  item.rarity === "legendary"
                    ? "border-yellow-400"
                    : item.rarity === "epic"
                    ? "border-purple-500"
                    : item.rarity === "rare"
                    ? "border-blue-500"
                    : "border-slate-600"
                }`}
              >
                <div className="w-full flex justify-between items-center text-[9px] font-black uppercase text-[#b1bad3]">
                  <span className={`px-1.5 py-0.5 rounded ${getRarityBadge(item.rarity)}`}>
                    {item.rarity}
                  </span>
                  <span className="text-[#00e701] font-mono">{item.multiplier.toFixed(2)}×</span>
                </div>

                <div className="my-auto flex items-center justify-center">
                  {item.rarity === "legendary" ? (
                    <Crown className="h-10 w-10 text-yellow-400 animate-pulse" />
                  ) : item.rarity === "epic" ? (
                    <Sparkles className="h-10 w-10 text-purple-400" />
                  ) : item.rarity === "rare" ? (
                    <Gem className="h-10 w-10 text-blue-400" />
                  ) : (
                    <Award className="h-10 w-10 text-slate-400" />
                  )}
                </div>

                <div className="w-full text-center text-[10px] font-bold text-white truncate">
                  {item.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revealed Outcome Badge */}
        {winningItem && (
          <div className="mt-3 px-6 py-2 rounded-xl bg-[#00e701]/10 border border-[#00e701]/40 flex items-center gap-2 animate-in zoom-in-95">
            <Sparkles className="h-4 w-4 text-[#00e701]" />
            <span className="text-xs sm:text-sm font-bold text-[#00e701]">
              Unboxed: {winningItem.name} ({winningItem.multiplier.toFixed(2)}×)! Won {activeSym}{lastPayout?.toFixed(2)}
            </span>
          </div>
        )}

        {/* Case Loot Drop Odds Table */}
        <div className="w-full mt-4 bg-[#0f212e]/70 border border-[#213743] rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#b1bad3] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#00e701]" />
              <span>Potential Items & Odds ({activeTier.name})</span>
            </span>
            <span className="text-[11px] text-[#00e701] font-mono font-bold">99.0% RTP</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {activeTier.items.map((item) => (
              <div
                key={item.id}
                className="p-2 rounded-lg border bg-[#1a2c38]/60 border-[#213743] text-center"
              >
                <div className="text-[10px] font-bold text-white truncate">{item.name}</div>
                <div className="text-xs font-black font-mono text-[#00e701] my-0.5">
                  {item.multiplier}×
                </div>
                <div className="flex justify-between items-center text-[9px] text-[#b1bad3]">
                  <span className="capitalize">{item.rarity}</span>
                  <span className="font-mono">{item.probability}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =========================================================================
          CONTROLS: DIRECTLY BENEATH ARENA (Vertical Flow)
      ========================================================================== */}
      <div className="w-full max-w-4xl bg-[#1a2c38] rounded-2xl p-5 border border-[#213743] shadow-xl space-y-4">
        
        {/* Row 1: Bet Amount & Fast Open Toggle */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          
          {/* Bet Amount Input with Quick Modifiers */}
          <div className="md:col-span-2 space-y-1.5">
            <div className="flex justify-between items-center text-xs text-[#b1bad3] font-semibold">
              <label>Case Cost / Bet Amount</label>
              <span>{activeSym}{balance.toFixed(2)}</span>
            </div>
            <div className="relative flex items-center">
              <div className="absolute left-3 text-sm font-bold text-[#b1bad3]">
                {activeSym}
              </div>
              <input
                type="number"
                disabled={isUnboxing}
                value={betInput}
                onChange={(e) => {
                  setBetInput(e.target.value);
                  const parsed = parseFloat(e.target.value);
                  if (!isNaN(parsed) && parsed > 0) setBetAmount(parsed);
                }}
                className="w-full bg-[#0f212e] border border-[#213743] rounded-xl pl-8 pr-32 py-2.5 text-sm font-bold font-mono text-white focus:outline-none focus:border-[#00e701] disabled:opacity-50"
                step="any"
                min="0.01"
              />
              <div className="absolute right-1.5 flex items-center gap-1">
                <button
                  type="button"
                  disabled={isUnboxing}
                  onClick={handleHalfBet}
                  className="px-2 py-1 text-xs font-bold rounded-lg bg-[#213743] text-[#b1bad3] hover:text-white hover:bg-[#2f4553] transition-colors disabled:opacity-50"
                >
                  ½
                </button>
                <button
                  type="button"
                  disabled={isUnboxing}
                  onClick={handleDoubleBet}
                  className="px-2 py-1 text-xs font-bold rounded-lg bg-[#213743] text-[#b1bad3] hover:text-white hover:bg-[#2f4553] transition-colors disabled:opacity-50"
                >
                  2×
                </button>
                <button
                  type="button"
                  disabled={isUnboxing}
                  onClick={handleMaxBet}
                  className="px-2 py-1 text-xs font-bold rounded-lg bg-[#213743] text-[#b1bad3] hover:text-white hover:bg-[#2f4553] transition-colors disabled:opacity-50"
                >
                  Max
                </button>
              </div>
            </div>
          </div>

          {/* Fast Open / Turbo Toggle */}
          <div className="flex items-center justify-end md:justify-center pt-2 md:pt-4">
            <button
              type="button"
              disabled={isUnboxing}
              onClick={() => setIsFastOpen(!isFastOpen)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isFastOpen
                  ? "bg-[#00e701]/10 border-[#00e701] text-[#00e701]"
                  : "bg-[#0f212e] border-[#213743] text-[#b1bad3] hover:text-white"
              }`}
            >
              <Zap className={`h-4 w-4 ${isFastOpen ? "fill-[#00e701]" : ""}`} />
              <span>Fast Open</span>
            </button>
          </div>
        </div>

        {/* Row 2: Stake Green `#00e701` CTA Button */}
        <div>
          <button
            onClick={handleOpenCase}
            disabled={isUnboxing}
            className={`w-full py-4 rounded-xl font-black text-sm tracking-wide uppercase transition-all duration-200 transform active:scale-[0.99] ${
              !isUnboxing
                ? "bg-[#00e701] hover:bg-[#00c701] text-black shadow-[0_0_20px_rgba(0,231,1,0.4)] cursor-pointer"
                : "bg-[#213743] text-[#b1bad3] cursor-not-allowed"
            }`}
          >
            {isUnboxing ? "Unboxing Case..." : `Open Case (${activeSym}${betAmount.toFixed(2)})`}
          </button>
        </div>

        {/* Footer Utility Icons: Sound, Stats, Fairness, Fullscreen */}
        <div className="flex items-center justify-between pt-2 border-t border-[#213743] text-[#b1bad3]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-lg hover:bg-[#213743] hover:text-white transition-colors"
              title={soundEnabled ? "Mute" : "Unmute"}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>

            <button
              onClick={() => setShowLiveStats(true)}
              className="p-2 rounded-lg hover:bg-[#213743] hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Live Stats</span>
            </button>

            <button
              onClick={() => setShowFairnessModal(true)}
              className="p-2 rounded-lg hover:bg-[#213743] hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <ShieldCheck className="h-4 w-4 text-[#00e701]" />
              <span className="hidden sm:inline">Provably Fair</span>
            </button>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg hover:bg-[#213743] hover:text-white transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* =========================================================================
          MODALS: PROVABLY FAIR & LIVE STATS
      ========================================================================== */}
      {showFairnessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#00e701]" />
                <span>Provably Fair: Cases</span>
              </div>
              <button
                onClick={() => setShowFairnessModal(false)}
                className="p-1 rounded-lg text-[#b1bad3] hover:text-white hover:bg-[#213743]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-[#b1bad3]">
              <p>
                Case drop outcomes are generated using HMAC-SHA256 from your Client Seed and
                Server Seed with certified 99% Return to Player (RTP).
              </p>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#b1bad3]">Server Seed (Hashed)</label>
                <div className="flex items-center justify-between rounded-xl bg-[#0f212e] border border-[#213743] p-2.5 font-mono text-white text-[11px] truncate">
                  <span className="truncate">d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5");
                      setCopiedSeed(true);
                      setTimeout(() => setCopiedSeed(false), 2000);
                    }}
                    className="ml-2 text-[#00e701]"
                  >
                    {copiedSeed ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowFairnessModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#213743] text-white text-xs font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showLiveStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-[#213743] bg-[#1a2c38] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#213743] pb-3">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#00e701]" />
                <span>Cases Session Stats</span>
              </div>
              <button
                onClick={() => setShowLiveStats(false)}
                className="p-1 rounded-lg text-[#b1bad3] hover:text-white hover:bg-[#213743]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-[#0f212e] border border-[#213743] p-3">
                <div className="text-[11px] font-bold text-[#b1bad3]">Total Unboxed</div>
                <div className="text-lg font-black text-white font-mono">{stats.rounds}</div>
              </div>
              <div className="rounded-xl bg-[#0f212e] border border-[#213743] p-3">
                <div className="text-[11px] font-bold text-[#b1bad3]">Win Rate (≥1×)</div>
                <div className="text-lg font-black text-[#00e701] font-mono">
                  {stats.rounds > 0 ? ((stats.wins / stats.rounds) * 100).toFixed(1) : "0.0"}%
                </div>
              </div>
              <div className="rounded-xl bg-[#0f212e] border border-[#213743] p-3">
                <div className="text-[11px] font-bold text-[#b1bad3]">Wagered</div>
                <div className="text-lg font-black text-white font-mono">
                  {activeSym}
                  {stats.wagered.toFixed(2)}
                </div>
              </div>
              <div className="rounded-xl bg-[#0f212e] border border-[#213743] p-3">
                <div className="text-[11px] font-bold text-[#b1bad3]">Profit</div>
                <div
                  className={`text-lg font-black font-mono ${
                    stats.profit >= 0 ? "text-[#00e701]" : "text-[#e9113c]"
                  }`}
                >
                  {stats.profit >= 0 ? "+" : ""}
                  {activeSym}
                  {stats.profit.toFixed(2)}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowLiveStats(false)}
              className="w-full py-2.5 rounded-xl bg-[#213743] text-white text-xs font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
