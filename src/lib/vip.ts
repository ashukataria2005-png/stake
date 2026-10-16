export interface VIPTierInfo {
  currentTier: string;
  nextTier: string;
  tierIcon: string;
  nextTierIcon: string;
  progressPercent: number; // 0 to 100
  progressFormatted: string; // e.g. "14.50%"
  wagered: number;
  nextThreshold: number;
  currentThreshold: number;
}

export const VIP_TIERS = [
  { name: "Unranked", threshold: 0, next: 10000, icon: "🛡️", nextIcon: "🥉" },
  { name: "Bronze", threshold: 10000, next: 50000, icon: "🥉", nextIcon: "🥈" },
  { name: "Silver", threshold: 50000, next: 100000, icon: "🥈", nextIcon: "🥇" },
  { name: "Gold", threshold: 100000, next: 250000, icon: "🥇", nextIcon: "💎" },
  { name: "Platinum", threshold: 250000, next: 1000000, icon: "💎", nextIcon: "👑" },
  { name: "Diamond", threshold: 1000000, next: 10000000, icon: "👑", nextIcon: "🏆" },
];

/**
 * Calculates current VIP tier, next target, and exact progress percentage based on actual totalWagered.
 */
export function calculateVIPProgress(totalWagered: number = 0): VIPTierInfo {
  const wager = Math.max(0, Number(totalWagered || 0));

  let current = VIP_TIERS[0];
  for (let i = VIP_TIERS.length - 1; i >= 0; i--) {
    if (wager >= VIP_TIERS[i].threshold) {
      current = VIP_TIERS[i];
      break;
    }
  }

  const nextTarget = current.next;
  const range = Math.max(1, nextTarget - current.threshold);
  const progress = Math.min(100, Math.max(0, ((wager - current.threshold) / range) * 100));

  return {
    currentTier: current.name,
    nextTier: current.name === "Diamond" ? "Max Level" : VIP_TIERS.find(t => t.threshold === current.next)?.name || "Bronze",
    tierIcon: current.icon,
    nextTierIcon: current.nextIcon,
    progressPercent: parseFloat(progress.toFixed(2)),
    progressFormatted: `${progress.toFixed(2)}%`,
    wagered: wager,
    nextThreshold: nextTarget,
    currentThreshold: current.threshold,
  };
}

export const VIP_MILESTONE_REWARDS: Record<string, number> = {
  Bronze: 2000, // ₹2,000 (~$25)
  Silver: 4000, // ₹4,000 (~$50)
  Gold: 8000, // ₹8,000 (~$100)
  Platinum: 20000, // ₹20,000 (~$250)
  Diamond: 80000, // ₹80,000 (~$1,000)
};

export const RAKEBACK_PERCENT = 0.001; // 10% of 1% House Edge = 0.1% of total wagered

export function getTierMilestoneReward(tier: string): number {
  return VIP_MILESTONE_REWARDS[tier] || 0;
}

export function calculateClaimableRakeback(totalWagered: number = 0, alreadyClaimed: number = 0): number {
  const totalAccumulated = Math.max(0, Number(totalWagered || 0) * RAKEBACK_PERCENT);
  return Math.max(0, parseFloat((totalAccumulated - Math.max(0, Number(alreadyClaimed || 0))).toFixed(2)));
}
