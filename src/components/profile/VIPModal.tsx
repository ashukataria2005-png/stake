"use client";

import React, { useState, useEffect } from "react";
import {
  Trophy,
  X,
  Shield,
  Award,
  Sparkles,
  Gift,
  Check,
  ChevronRight,
  TrendingUp,
  Coins,
  CheckCircle2,
  Wallet,
} from "lucide-react";
import { useGame } from "@/context/GameContext";
import {
  calculateVIPProgress,
  calculateClaimableRakeback,
  getTierMilestoneReward,
} from "@/lib/vip";
import { sounds } from "@/utils/audio";
import confetti from "canvas-confetti";

interface VIPModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VIP_TIER_DETAILS = [
  {
    tier: "Bronze",
    wager: "$10,000",
    icon: "🥉",
    color: "from-amber-700 to-amber-600",
    perks: [
      "Live Rakeback on all bets",
      "Weekly VIP Boost Bonus",
      "Monthly Reload Bonus",
      "Level Up Cash Reward",
    ],
  },
  {
    tier: "Silver",
    wager: "$50,000",
    icon: "🥈",
    color: "from-slate-400 to-slate-300",
    perks: [
      "Enhanced Weekly & Monthly Boosts",
      "VIP Telegram Channel Access",
      "Higher Level Up Bonus",
      "Priority Withdrawal Processing",
    ],
  },
  {
    tier: "Gold",
    wager: "$100,000",
    icon: "🥇",
    color: "from-amber-400 to-yellow-500",
    perks: [
      "Dedicated VIP Host Access",
      "Customized Weekly Reloads",
      "Elevated Rakeback Percentage",
      "Exclusive High-Roller Tournaments",
    ],
  },
  {
    tier: "Platinum",
    wager: "$250,000+",
    icon: "💎",
    color: "from-cyan-400 to-blue-500",
    perks: [
      "24/7 Dedicated Personal VIP Host",
      "Daily Reload Bonuses",
      "Tailored Lossback Rewards",
      "Bespoke High-Stakes Limits",
    ],
  },
  {
    tier: "Diamond",
    wager: "$1,000,000+",
    icon: "👑",
    color: "from-purple-400 to-pink-500",
    perks: [
      "All-Expenses Paid Real-World Trips",
      "Luxury Real-World Gifts",
      "Unlimited Bespoke Bonuses",
      "Highest Tier Stake Privileges",
    ],
  },
];

export default function VIPModal({ isOpen, onClose }: VIPModalProps) {
  const { user, totalWagered = 0, updateBalance, currencySymbol } = useGame();
  const activeSym = currencySymbol || "₹";

  const [claimedRakeback, setClaimedRakeback] = useState<number>(0);
  const [claimedLevelUps, setClaimedLevelUps] = useState<string[]>([]);
  const [isClaimingRakeback, setIsClaimingRakeback] = useState<boolean>(false);
  const [isClaimingLevelUp, setIsClaimingLevelUp] = useState<boolean>(false);

  // Load persistence for claimed perks
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedRakeback = localStorage.getItem("stake_claimed_rakeback");
        if (storedRakeback) {
          setClaimedRakeback(parseFloat(storedRakeback) || 0);
        }
        const storedLevelUps = localStorage.getItem("stake_claimed_levelups");
        if (storedLevelUps) {
          setClaimedLevelUps(JSON.parse(storedLevelUps));
        }
      } catch {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const vip = calculateVIPProgress(totalWagered);
  const claimableRakeback = calculateClaimableRakeback(totalWagered, claimedRakeback);
  const currentTierReward = getTierMilestoneReward(vip.currentTier);
  const isCurrentTierClaimed = claimedLevelUps.includes(vip.currentTier);
  const hasUnlockedMilestone = vip.currentTier !== "Unranked" && currentTierReward > 0;

  // Claim Rakeback Action
  const handleClaimRakeback = async () => {
    if (claimableRakeback <= 0 || isClaimingRakeback) return;
    setIsClaimingRakeback(true);
    sounds.playClick();

    try {
      const res = await fetch("/api/wallet/claim-perks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id || user?.username || "guest_player",
          action: "rakeback",
          amount: claimableRakeback,
        }),
      });

      const data = await res.json();
      if (data.success) {
        updateBalance(claimableRakeback);
        const newClaimed = claimedRakeback + claimableRakeback;
        setClaimedRakeback(newClaimed);
        if (typeof window !== "undefined") {
          localStorage.setItem("stake_claimed_rakeback", newClaimed.toString());
        }

        sounds.playCashout();
        try {
          confetti({
            particleCount: 75,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#00e701", "#ffffff", "#ffd700"],
          });
        } catch {}
      } else {
        alert(data.error || "Failed to claim rakeback.");
      }
    } catch (err) {
      console.error("Rakeback claim error:", err);
    } finally {
      setIsClaimingRakeback(false);
    }
  };

  // Claim Level Up Bonus Action
  const handleClaimLevelUp = async () => {
    if (!hasUnlockedMilestone || isCurrentTierClaimed || isClaimingLevelUp) return;
    setIsClaimingLevelUp(true);
    sounds.playClick();

    try {
      const res = await fetch("/api/wallet/claim-perks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id || user?.username || "guest_player",
          action: "levelup",
          tier: vip.currentTier,
        }),
      });

      const data = await res.json();
      if (data.success) {
        updateBalance(currentTierReward);
        const nextClaimed = [...claimedLevelUps, vip.currentTier];
        setClaimedLevelUps(nextClaimed);
        if (typeof window !== "undefined") {
          localStorage.setItem("stake_claimed_levelups", JSON.stringify(nextClaimed));
        }

        sounds.playCashout();
        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.5 },
            colors: ["#ffd700", "#ffea00", "#00e701", "#ffffff"],
          });
        } catch {}
      } else {
        alert(data.error || "Failed to claim milestone bonus.");
      }
    } catch (err) {
      console.error("Level-up claim error:", err);
    } finally {
      setIsClaimingLevelUp(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-[#213743] bg-[#1a2c38] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#213743] px-5 py-4 bg-[#14232d] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                <span>Stake VIP Club</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Live
                </span>
              </h2>
              <p className="text-xs text-[#b1bad3]">Track your live progression to elite casino perks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#b1bad3] hover:bg-[#213743] hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4 overscroll-contain custom-scrollbar">
          {/* Current VIP Level Overview Card */}
          <div className="bg-[#0f212e] border border-[#213743] rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{vip.tierIcon}</span>
                <div>
                  <div className="text-xs text-[#b1bad3] font-bold uppercase tracking-wider">Current Tier</div>
                  <div className="text-lg font-black text-white">{vip.currentTier}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-[#b1bad3] font-bold uppercase tracking-wider">Progress</div>
                <div className="text-lg font-mono font-black text-amber-400">{vip.progressFormatted}</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-2.5 rounded-full bg-[#1a2c38] border border-[#213743] overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${Math.max(2, Math.min(100, vip.progressPercent))}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-semibold text-[#b1bad3]">
                <span>
                  Wagered: <strong className="text-white font-mono">${totalWagered.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong>
                </span>
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <span>Target: ${vip.nextThreshold.toLocaleString("en-US")}</span>
                  <span>({vip.nextTier})</span>
                </span>
              </div>
            </div>
          </div>

          {/* MODULE 3: RAKEBACK VAULT & LEVEL-UP REWARDS DESK */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Rakeback Vault Card */}
            <div className="bg-[#0f212e] border border-[#213743] hover:border-[#2f4553] rounded-xl p-3.5 space-y-2.5 transition-all shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#00e701]/15 text-[#00e701] flex items-center justify-center">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#b1bad3] uppercase tracking-wider block">Live Rakeback</span>
                    <span className="text-sm font-black text-white font-mono">
                      {activeSym}{claimableRakeback.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-[#7a889b] leading-tight">
                Calculated dynamically at 10% of house edge wagered across all games.
              </p>
              <button
                type="button"
                onClick={handleClaimRakeback}
                disabled={claimableRakeback <= 0 || isClaimingRakeback}
                className={`w-full py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  claimableRakeback > 0
                    ? "bg-[#00e701] hover:bg-[#00c801] active:scale-95 text-[#0f212e] shadow-md"
                    : "bg-[#213743]/50 text-[#7a889b] cursor-not-allowed"
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>{isClaimingRakeback ? "Claiming..." : claimableRakeback > 0 ? "Claim Rakeback" : "No Rakeback Yet"}</span>
              </button>
            </div>

            {/* 2. Level-Up Milestone Cash Reward Card */}
            <div className="bg-[#0f212e] border border-[#213743] hover:border-[#2f4553] rounded-xl p-3.5 space-y-2.5 transition-all shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#b1bad3] uppercase tracking-wider block">Level-Up Bonus</span>
                    <span className="text-sm font-black text-white font-mono">
                      {hasUnlockedMilestone ? `${activeSym}${currentTierReward.toLocaleString()}` : "Locked"}
                    </span>
                  </div>
                </div>
                {hasUnlockedMilestone && (
                  <span className="text-xs">{vip.tierIcon}</span>
                )}
              </div>
              <p className="text-[11px] text-[#7a889b] leading-tight">
                {hasUnlockedMilestone
                  ? `Instant cash milestone unlocked for reaching ${vip.currentTier} tier!`
                  : "Advance to Bronze tier to unlock your first ₹2,000 cash reward."}
              </p>
              <button
                type="button"
                onClick={handleClaimLevelUp}
                disabled={!hasUnlockedMilestone || isCurrentTierClaimed || isClaimingLevelUp}
                className={`w-full py-2 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  hasUnlockedMilestone && !isCurrentTierClaimed
                    ? "bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 active:scale-95 text-[#0f212e] shadow-md"
                    : isCurrentTierClaimed
                    ? "bg-[#00e701]/15 text-[#00e701] border border-[#00e701]/30 cursor-default"
                    : "bg-[#213743]/50 text-[#7a889b] cursor-not-allowed"
                }`}
              >
                {isCurrentTierClaimed ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00e701]" />
                    <span>Claimed ✓</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isClaimingLevelUp ? "Claiming..." : hasUnlockedMilestone ? "Claim Level-Up Cash" : "Locked (Unranked)"}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Perks Overview */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-[#b1bad3] uppercase tracking-wider flex items-center gap-1.5 px-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>VIP Tier Milestones & Privileges</span>
            </div>

            <div className="space-y-2.5">
              {VIP_TIER_DETAILS.map((t) => {
                const isCurrent = vip.currentTier.toLowerCase().includes(t.tier.toLowerCase());
                return (
                  <div
                    key={t.tier}
                    className={`rounded-xl border p-3.5 transition-all ${
                      isCurrent
                        ? "bg-[#14232d] border-amber-500/40 shadow-sm"
                        : "bg-[#0f212e]/70 border-[#213743]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{t.icon}</span>
                        <span className="text-sm font-black text-white">{t.tier}</span>
                        {isCurrent && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-400 font-black px-2 py-0.5 rounded-full border border-amber-500/30">
                            Current
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono font-bold text-[#b1bad3]">Req: {t.wager}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-[#b1bad3]">
                      {t.perks.map((p, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-[#00e701] shrink-0" />
                          <span className="truncate">{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
