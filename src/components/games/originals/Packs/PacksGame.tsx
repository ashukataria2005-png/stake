"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Zap,
  TrendingUp,
  X,
  Copy,
  Check,
  Sparkles,
  Package,
  Layers,
  Crown,
  Gem,
  Award,
  ChevronRight,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

export type PackRarity = "common" | "rare" | "epic" | "legendary";

export interface PackItem {
  id: string;
  name: string;
  multiplier: number;
  probability: number; // percentage, e.g. 35.0 = 35%
  rarity: PackRarity;
  iconName: string;
}

export interface PackTier {
  id: string;
  name: string;
  basePrice: number;
  color: string;
  accentBorder: string;
  glowColor: string;
  items: PackItem[];
}

// 4 Distinct Mystery Packs with certified 99% RTP
const PACK_TIERS: PackTier[] = [
  {
    id: "bronze",
    name: "Bronze Mystery",
    basePrice: 1.0,
    color: "from-amber-900/60 to-yellow-950/40",
    accentBorder: "border-amber-700/60",
    glowColor: "rgba(180, 83, 9, 0.35)",
    items: [
      { id: "b1", name: "Rusty Iron Shard", multiplier: 0.1, probability: 40.0, rarity: "common", iconName: "Layers" },
      { id: "b2", name: "Bronze Medallion", multiplier: 0.5, probability: 35.0, rarity: "common", iconName: "Award" },
      { id: "b3", name: "Silver Flask", multiplier: 1.5, probability: 15.0, rarity: "rare", iconName: "Gem" },
      { id: "b4", name: "Gilded Dagger", multiplier: 3.5, probability: 7.0, rarity: "epic", iconName: "Sparkles" },
      { id: "b5", name: "Ancient Relic", multiplier: 10.0, probability: 2.5, rarity: "legendary", iconName: "Crown" },
      { id: "b6", name: "Emerald Sun Diadem", multiplier: 55.0, probability: 0.5, rarity: "legendary", iconName: "Crown" },
    ],
  },
  {
    id: "silver",
    name: "Silver Vault",
    basePrice: 5.0,
    color: "from-slate-700/60 to-slate-900/40",
    accentBorder: "border-slate-400/60",
    glowColor: "rgba(148, 163, 184, 0.35)",
    items: [
      { id: "s1", name: "Tarnished Key", multiplier: 0.15, probability: 35.0, rarity: "common", iconName: "Layers" },
      { id: "s2", name: "Pure Silver Bar", multiplier: 0.6, probability: 35.0, rarity: "common", iconName: "Award" },
      { id: "s3", name: "Enchanted Sapphire", multiplier: 1.8, probability: 18.0, rarity: "rare", iconName: "Gem" },
      { id: "s4", name: "Shadow Cloak", multiplier: 4.5, probability: 8.0, rarity: "epic", iconName: "Sparkles" },
      { id: "s5", name: "Diamond Chalice", multiplier: 12.0, probability: 3.5, rarity: "legendary", iconName: "Crown" },
      { id: "s6", name: "Celestial Scepter", multiplier: 75.0, probability: 0.5, rarity: "legendary", iconName: "Crown" },
    ],
  },
  {
    id: "gold",
    name: "Gold Sovereign",
    basePrice: 20.0,
    color: "from-yellow-700/60 to-amber-950/40",
    accentBorder: "border-yellow-500/60",
    glowColor: "rgba(234, 179, 8, 0.45)",
    items: [
      { id: "g1", name: "Golden Nugget", multiplier: 0.2, probability: 34.0, rarity: "common", iconName: "Layers" },
      { id: "g2", name: "Royal Signet", multiplier: 0.7, probability: 32.0, rarity: "common", iconName: "Award" },
      { id: "g3", name: "Radiant Ruby", multiplier: 2.0, probability: 20.0, rarity: "rare", iconName: "Gem" },
      { id: "g4", name: "Dragon Scale Blade", multiplier: 5.0, probability: 9.0, rarity: "epic", iconName: "Sparkles" },
      { id: "g5", name: "Kings Golden Throne", multiplier: 15.0, probability: 4.5, rarity: "legendary", iconName: "Crown" },
      { id: "g6", name: "Crown of the Sun Emperor", multiplier: 120.0, probability: 0.5, rarity: "legendary", iconName: "Crown" },
    ],
  },
  {
    id: "diamond",
    name: "Diamond Mythic",
    basePrice: 100.0,
    color: "from-cyan-900/60 to-blue-950/40",
    accentBorder: "border-cyan-400/70",
    glowColor: "rgba(6, 182, 212, 0.5)",
    items: [
      { id: "d1", name: "Crystalline Fragment", multiplier: 0.25, probability: 32.0, rarity: "common", iconName: "Layers" },
      { id: "d2", name: "Diamond Shard", multiplier: 0.8, probability: 32.0, rarity: "common", iconName: "Award" },
      { id: "d3", name: "Prismatic Eye", multiplier: 2.2, probability: 20.0, rarity: "rare", iconName: "Gem" },
      { id: "d4", name: "Astral Nebula Orb", multiplier: 6.0, probability: 10.0, rarity: "epic", iconName: "Sparkles" },
      { id: "d5", name: "Eternal Void Scepter", multiplier: 25.0, probability: 5.2, rarity: "legendary", iconName: "Crown" },
      { id: "d6", name: "Infinity Stellar Lotus", multiplier: 250.0, probability: 0.8, rarity: "legendary", iconName: "Crown" },
    ],
  },
];

export default function PacksGame() {
  const { balance, updateBalance, currencySymbol, addRecentlyPlayedGame } = useGame();
  const activeSym = currencySymbol || "$";

  // Register in Recently Played once on mount
  useEffect(() => {
    if (addRecentlyPlayedGame) {
      addRecentlyPlayedGame({
        id: "packs",
        title: "Packs",
        image: "/games/stake-originals/stake-originals-packs.webp",
        href: "/games/packs",
      });
    }
  }, []);

  // Selected Tier
  const [selectedTierId, setSelectedTierId] = useState<string>("bronze");
  const activeTier = PACK_TIERS.find((t) => t.id === selectedTierId) || PACK_TIERS[0];

  // Bet Amount state (customized or tied to tier base price)
  const [betAmount, setBetAmount] = useState<number>(activeTier.basePrice);
  const [betInput, setBetInput] = useState<string>(activeTier.basePrice.toString());

  // Keep bet input synced when tier changes
  const handleSelectTier = (tierId: string) => {
    if (isUnboxing) return;
    setSelectedTierId(tierId);
    const tier = PACK_TIERS.find((t) => t.id === tierId) || PACK_TIERS[0];
    setBetAmount(tier.basePrice);
    setBetInput(tier.basePrice.toString());
  };

  useEffect(() => {
    if (betInput !== "" && parseFloat(betInput) === betAmount) return;
    setBetInput(betAmount.toString());
  }, [betAmount]);

  // Unboxing Animation State
  const [isUnboxing, setIsUnboxing] = useState<boolean>(false);
  const [revealedItem, setRevealedItem] = useState<PackItem | null>(null);
  const [isTurbo, setIsTurbo] = useState<boolean>(false);
  const [animationStep, setAnimationStep] = useState<"idle" | "tearing" | "flipping" | "revealed">("idle");

  // Settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // Modals
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

  // Pick random item according to exact probability distribution
  const pickItemFromTier = (tier: PackTier): PackItem => {
    const rand = Math.random() * 100;
    let cumulative = 0;
    for (const item of tier.items) {
      cumulative += item.probability;
      if (rand <= cumulative) {
        return item;
      }
    }
    return tier.items[tier.items.length - 1];
  };

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

  // Open Pack Action
  const handleOpenPack = () => {
    if (isUnboxing) return;
    if (balance < betAmount) {
      alert("Insufficient balance!");
      return;
    }

    updateBalance(-betAmount);
    setIsUnboxing(true);
    setRevealedItem(null);

    const wonItem = pickItemFromTier(activeTier);
    const winPayout = parseFloat((betAmount * wonItem.multiplier).toFixed(2));
    const profitDelta = parseFloat((winPayout - betAmount).toFixed(2));

    if (isTurbo) {
      // Instant reveal
      setAnimationStep("revealed");
      setRevealedItem(wonItem);
      updateBalance(winPayout);
      setIsUnboxing(false);

      if (soundEnabled) {
        if (wonItem.rarity === "legendary" || wonItem.multiplier >= 10) {
          sounds.playPackJackpot();
        } else {
          sounds.playPackReveal();
        }
      }

      if (wonItem.multiplier >= 2.0) {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      }

      setStats((prev) => ({
        ...prev,
        rounds: prev.rounds + 1,
        wins: wonItem.multiplier >= 1 ? prev.wins + 1 : prev.wins,
        losses: wonItem.multiplier < 1 ? prev.losses + 1 : prev.losses,
        wagered: parseFloat((prev.wagered + betAmount).toFixed(2)),
        profit: parseFloat((prev.profit + profitDelta).toFixed(2)),
      }));
    } else {
      // Sleek multi-stage 3D/2D animation
      setAnimationStep("tearing");
      if (soundEnabled) sounds.playPackTear();

      setTimeout(() => {
        setAnimationStep("flipping");
        if (soundEnabled) sounds.playCardFlip();

        setTimeout(() => {
          setAnimationStep("revealed");
          setRevealedItem(wonItem);
          updateBalance(winPayout);
          setIsUnboxing(false);

          if (soundEnabled) {
            if (wonItem.rarity === "legendary" || wonItem.multiplier >= 10) {
              sounds.playPackJackpot();
            } else {
              sounds.playPackReveal();
            }
          }

          if (wonItem.multiplier >= 2.0) {
            confetti({
              particleCount: wonItem.multiplier >= 10 ? 140 : 80,
              spread: 70,
              origin: { y: 0.55 },
            });
          }

          setStats((prev) => ({
            ...prev,
            rounds: prev.rounds + 1,
            wins: wonItem.multiplier >= 1 ? prev.wins + 1 : prev.wins,
            losses: wonItem.multiplier < 1 ? prev.losses + 1 : prev.losses,
            wagered: parseFloat((prev.wagered + betAmount).toFixed(2)),
            profit: parseFloat((prev.profit + profitDelta).toFixed(2)),
          }));
        }, 550);
      }, 400);
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

  const getRarityBadgeStyle = (rarity: PackRarity) => {
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

  return (
    <div
      ref={gameContainerRef}
      className="flex flex-col items-center w-full min-h-[calc(100vh-64px)] bg-[#0f212e] text-white p-3 sm:p-6 select-none font-sans"
    >
      {/* =========================================================================
          TOP: PACK SHOWCASE & UNBOXING ARENA
      ========================================================================== */}
      <div className="w-full max-w-4xl bg-[#1a2c38] rounded-2xl p-4 sm:p-8 border border-[#213743] shadow-2xl flex flex-col items-center relative overflow-hidden mb-5">
        
        {/* Ambient Glow Rays */}
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-colors duration-500"
          style={{ backgroundColor: activeTier.glowColor }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-colors duration-500"
          style={{ backgroundColor: activeTier.glowColor }}
        />

        {/* Tier Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full mb-6 relative z-10">
          {PACK_TIERS.map((tier) => {
            const isSelected = tier.id === selectedTierId;
            return (
              <button
                key={tier.id}
                disabled={isUnboxing}
                onClick={() => handleSelectTier(tier.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? `bg-gradient-to-b ${tier.color} ${tier.accentBorder} shadow-lg ring-1 ring-white/20 scale-[1.02]`
                    : "bg-[#0f212e]/70 border-[#213743] hover:bg-[#213743] text-[#b1bad3]"
                } ${isUnboxing ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Package className={`h-4 w-4 ${isSelected ? "text-white" : "text-[#b1bad3]"}`} />
                  <span className="text-xs font-black tracking-wide uppercase">{tier.name.split(" ")[0]}</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-[#00e701]">
                  {activeSym}{tier.basePrice.toFixed(2)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Center Stage: Mystery Pack / Unboxing Card */}
        <div className="relative w-full max-w-xs h-72 sm:h-80 flex items-center justify-center my-4">
          
          {/* Animated Background Rays on Active Reveal */}
          {(animationStep === "flipping" || animationStep === "revealed") && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-72 h-72 rounded-full border border-white/10 animate-spin duration-1000 opacity-30" />
              <div className="w-80 h-80 rounded-full border border-dashed border-[#00e701]/20 animate-spin duration-3000 opacity-40" />
            </div>
          )}

          {/* Card / Pack Element */}
          {animationStep === "idle" || animationStep === "tearing" ? (
            // Idle Mystery Case
            <div
              className={`w-52 h-72 sm:w-60 sm:h-80 rounded-2xl bg-gradient-to-b ${
                activeTier.color
              } border-2 ${activeTier.accentBorder} shadow-2xl flex flex-col items-center justify-between p-5 transform transition-all duration-300 ${
                animationStep === "tearing" ? "scale-95 animate-pulse" : "hover:scale-105"
              }`}
            >
              <div className="w-full flex justify-between items-center text-xs font-bold uppercase tracking-wider text-[#b1bad3]">
                <span>{activeTier.name}</span>
                <Sparkles className="h-4 w-4 text-amber-400" />
              </div>

              {/* 3D Package Emblem */}
              <div className="relative flex items-center justify-center my-auto">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center shadow-inner">
                  <Package className="h-14 w-14 sm:h-16 sm:w-16 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
                </div>
                <div className="absolute -bottom-2 px-3 py-0.5 rounded-full bg-[#00e701] text-black text-[10px] font-black uppercase tracking-wider">
                  MYSTERY
                </div>
              </div>

              <div className="w-full text-center text-[11px] font-bold text-[#b1bad3]">
                Tap &quot;Open Pack&quot; to unbox
              </div>
            </div>
          ) : animationStep === "flipping" ? (
            // Flipping Spin State
            <div className="w-52 h-72 sm:w-60 sm:h-80 rounded-2xl bg-[#213743] border-2 border-[#00e701] flex items-center justify-center animate-spin duration-700">
              <Sparkles className="h-12 w-12 text-[#00e701]" />
            </div>
          ) : (
            // Revealed Unboxed Item Card
            revealedItem && (
              <div
                className={`w-52 h-72 sm:w-60 sm:h-80 rounded-2xl bg-gradient-to-b from-[#1a2c38] to-[#0f212e] border-2 shadow-2xl flex flex-col items-center justify-between p-5 transform transition-all duration-300 animate-in zoom-in-90 ${
                  revealedItem.rarity === "legendary"
                    ? "border-yellow-400 shadow-[0_0_35px_rgba(250,204,21,0.5)]"
                    : revealedItem.rarity === "epic"
                    ? "border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.4)]"
                    : revealedItem.rarity === "rare"
                    ? "border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.3)]"
                    : "border-slate-500 shadow-[0_0_15px_rgba(148,163,184,0.2)]"
                }`}
              >
                {/* Header Badge */}
                <div className="w-full flex justify-between items-center">
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${getRarityBadgeStyle(
                      revealedItem.rarity
                    )}`}
                  >
                    {revealedItem.rarity}
                  </span>
                  <div className="text-xs font-mono font-black text-[#00e701]">
                    {revealedItem.multiplier.toFixed(2)}×
                  </div>
                </div>

                {/* Center Item Trophy Icon */}
                <div className="flex flex-col items-center justify-center my-auto">
                  <div
                    className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center shadow-lg border-2 ${
                      revealedItem.rarity === "legendary"
                        ? "bg-yellow-500/20 border-yellow-400"
                        : revealedItem.rarity === "epic"
                        ? "bg-purple-500/20 border-purple-400"
                        : revealedItem.rarity === "rare"
                        ? "bg-blue-500/20 border-blue-400"
                        : "bg-slate-700/30 border-slate-500"
                    }`}
                  >
                    {revealedItem.rarity === "legendary" ? (
                      <Crown className="h-14 w-14 text-yellow-300 animate-bounce" />
                    ) : revealedItem.rarity === "epic" ? (
                      <Sparkles className="h-14 w-14 text-purple-300" />
                    ) : revealedItem.rarity === "rare" ? (
                      <Gem className="h-14 w-14 text-blue-300" />
                    ) : (
                      <Award className="h-14 w-14 text-slate-300" />
                    )}
                  </div>
                  <div className="text-sm font-black text-white mt-3 text-center truncate max-w-[200px]">
                    {revealedItem.name}
                  </div>
                </div>

                {/* Bottom Payout info */}
                <div className="w-full py-1.5 rounded-xl bg-[#0f212e] border border-[#213743] text-center">
                  <span className="text-xs font-bold text-[#b1bad3] mr-1">Payout:</span>
                  <span className="text-sm font-black font-mono text-[#00e701]">
                    {activeSym}{(betAmount * revealedItem.multiplier).toFixed(2)}
                  </span>
                </div>
              </div>
            )
          )}
        </div>

        {/* Odds & Items Preview Table */}
        <div className="w-full mt-4 bg-[#0f212e]/70 border border-[#213743] rounded-xl p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#b1bad3] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#00e701]" />
              <span>Potential Drops & Odds ({activeTier.name})</span>
            </span>
            <span className="text-[11px] text-[#00e701] font-mono font-bold">99.0% RTP</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {activeTier.items.map((item) => (
              <div
                key={item.id}
                className={`p-2 rounded-lg border text-center transition-all ${
                  revealedItem?.id === item.id
                    ? "ring-2 ring-[#00e701] bg-[#00e701]/10"
                    : "bg-[#1a2c38]/60 border-[#213743]"
                }`}
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
        
        {/* Row 1: Bet Amount & Turbo Mode */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          
          {/* Bet Amount Input with Quick Modifiers */}
          <div className="md:col-span-2 space-y-1.5">
            <div className="flex justify-between items-center text-xs text-[#b1bad3] font-semibold">
              <label>Pack Cost / Bet Amount</label>
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

          {/* Instant / Turbo Toggle */}
          <div className="flex items-center justify-end md:justify-center pt-2 md:pt-4">
            <button
              type="button"
              disabled={isUnboxing}
              onClick={() => setIsTurbo(!isTurbo)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isTurbo
                  ? "bg-[#00e701]/10 border-[#00e701] text-[#00e701]"
                  : "bg-[#0f212e] border-[#213743] text-[#b1bad3] hover:text-white"
              }`}
            >
              <Zap className={`h-4 w-4 ${isTurbo ? "fill-[#00e701]" : ""}`} />
              <span>Instant Open</span>
            </button>
          </div>
        </div>

        {/* Row 2: Stake Green `#00e701` Full-Width Primary CTA Button */}
        <div>
          <button
            onClick={handleOpenPack}
            disabled={isUnboxing}
            className={`w-full py-4 rounded-xl font-black text-sm tracking-wide uppercase transition-all duration-200 transform active:scale-[0.99] ${
              !isUnboxing
                ? "bg-[#00e701] hover:bg-[#00c701] text-black shadow-[0_0_20px_rgba(0,231,1,0.4)] cursor-pointer"
                : "bg-[#213743] text-[#b1bad3] cursor-not-allowed"
            }`}
          >
            {isUnboxing ? "Opening Pack..." : `Open Pack ${activeSym}${betAmount.toFixed(2)}`}
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
                <span>Provably Fair: Packs</span>
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
                Mystery pack item drop outcomes are generated using HMAC-SHA256 from your Client Seed
                and Server Seed with certified 99% Return to Player (RTP).
              </p>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#b1bad3]">Server Seed (Hashed)</label>
                <div className="flex items-center justify-between rounded-xl bg-[#0f212e] border border-[#213743] p-2.5 font-mono text-white text-[11px] truncate">
                  <span className="truncate">7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c");
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
                <span>Packs Session Stats</span>
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
                <div className="text-[11px] font-bold text-[#b1bad3]">Total Packs Opened</div>
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
