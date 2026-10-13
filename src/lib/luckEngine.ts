/**
 * Central Luck & RTP Engine for Stake Clone
 * Controls game outcome probabilities according to per-user and global luck settings.
 *
 * Supported Modes:
 * - HIGH_WIN: Heavily tilts outcomes in user's favor (85%-90% win rate / high multipliers)
 * - LOW_WIN: Heavily tilts outcomes in house's favor (early loss / bust / low multipliers)
 * - NO_CONTROL: Standard fair RNG / default House RTP
 */

export type LuckMode = "HIGH_WIN" | "MEDIUM_WIN" | "LOW_WIN" | "NO_CONTROL";

/**
 * User POV Mode Definitions:
 * 1. USER WIN (High Win) -> Player wins heavily / favor player (85%-90% win rate)
 * 2. HOUSE WIN (Low Win) -> House wins / player loses / busts early
 * 3. BALANCED (Fair Play / Default) -> Standard RTP / No manipulation
 * 4. JACKPOT MODE (Super User Win) -> Mega multipliers / streak wins
 */
export const LUCK_MODE_DEFINITIONS = [
  {
    mode: "HIGH_WIN" as LuckMode,
    label: "USER WIN (High Win)",
    shortLabel: "User Win",
    description: "Player wins heavily (85%-90% win rate / high multipliers)",
    badgeColor: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
    icon: "🟢",
  },
  {
    mode: "LOW_WIN" as LuckMode,
    label: "HOUSE WIN (Low Win)",
    shortLabel: "House Win",
    description: "House wins / player loses / early bust & mine traps",
    badgeColor: "bg-rose-500/15 border-rose-500/30 text-rose-300",
    icon: "🔴",
  },
  {
    mode: "NO_CONTROL" as LuckMode,
    label: "BALANCED (Fair Play / Default)",
    shortLabel: "Balanced (Fair)",
    description: "Standard certified RTP / No manipulation / Natural RNG",
    badgeColor: "bg-[#0e1017] border-[#1e2433] text-slate-400",
    icon: "⚖️",
  },
  {
    mode: "MEDIUM_WIN" as LuckMode,
    label: "JACKPOT MODE (Super User Win)",
    shortLabel: "Jackpot Mode",
    description: "Mega streak multipliers & frequent bonus cashouts",
    badgeColor: "bg-amber-500/15 border-amber-500/30 text-amber-300",
    icon: "⭐",
  },
];

export interface GameControlConfig {
  mode?: string;
  houseEdgePercent?: number;
  forcedMultiplier?: number | null;
  isActive?: boolean;
}

/**
 * 1. Crash / Aviator Outcome Resolution
 */
export function resolveCrashPoint(
  luckMode: LuckMode = "NO_CONTROL",
  defaultCrashPoint: number,
  targetAutoCashout?: number
): number {
  if (luckMode === "HIGH_WIN") {
    // 88% chance to hit a high multiplier or exceed user target
    const willWin = Math.random() < 0.88;
    if (willWin) {
      if (targetAutoCashout && targetAutoCashout > 1.0) {
        // Exceed user target by a healthy margin
        const extra = Math.random() * 2.5 + 0.35;
        return parseFloat((targetAutoCashout + extra).toFixed(2));
      }
      // Generate a generous multiplier between 2.8x and 38.0x
      const rand = Math.random();
      if (rand < 0.65) {
        return parseFloat((2.5 + Math.random() * 6.5).toFixed(2)); // 2.5x - 9.0x
      } else if (rand < 0.90) {
        return parseFloat((9.0 + Math.random() * 15.0).toFixed(2)); // 9.0x - 24.0x
      } else {
        return parseFloat((24.0 + Math.random() * 45.0).toFixed(2)); // 24.0x - 69.0x
      }
    } else {
      // 12% rare early crash
      return parseFloat((1.1 + Math.random() * 0.7).toFixed(2));
    }
  }

  if (luckMode === "LOW_WIN") {
    // 85% chance to crash immediately or below user target
    const willCrashEarly = Math.random() < 0.85;
    if (willCrashEarly) {
      if (targetAutoCashout && targetAutoCashout > 1.1) {
        // Crash just under user target
        const bustBefore = Math.max(1.02, targetAutoCashout - 0.2 - Math.random() * 0.4);
        return parseFloat(bustBefore.toFixed(2));
      }
      // Early crash between 1.01x and 1.38x
      return parseFloat((1.01 + Math.random() * 0.37).toFixed(2));
    }
    // 15% standard small bounce
    return parseFloat((1.4 + Math.random() * 1.5).toFixed(2));
  }

  return defaultCrashPoint;
}

/**
 * 2. Mines Outcome Resolution
 * Returns boolean indicating whether tile clicked is SAFE (GEM) or a MINE.
 */
export function resolveMinesTile(
  luckMode: LuckMode = "NO_CONTROL",
  isNaturalMine: boolean,
  currentGemsOpened: number,
  totalMines: number
): boolean {
  if (luckMode === "HIGH_WIN") {
    // In HIGH_WIN mode, 88% of clicks are guaranteed GEMS (convert mine to safe gem)
    if (isNaturalMine) {
      const saveChance = Math.random() < 0.88;
      if (saveChance) {
        return false; // Not a mine (saved!)
      }
    }
    return isNaturalMine;
  }

  if (luckMode === "LOW_WIN") {
    // In LOW_WIN mode, after 1-2 safe clicks, 82% chance to trigger early mine
    if (!isNaturalMine && currentGemsOpened >= 1) {
      const trapChance = Math.random() < 0.82;
      if (trapChance) {
        return true; // Force mine hit!
      }
    }
    return isNaturalMine;
  }

  return isNaturalMine;
}

/**
 * 3. Dice Outcome Resolution (0.00 to 100.00)
 */
export function resolveDiceRoll(
  luckMode: LuckMode = "NO_CONTROL",
  target: number,
  isRollOver: boolean,
  defaultRoll: number
): number {
  if (luckMode === "HIGH_WIN") {
    // 88% chance to land in winning zone
    const willWin = Math.random() < 0.88;
    if (willWin) {
      if (isRollOver) {
        // Needs roll > target
        const margin = Math.random() * Math.max(1, 99 - target);
        return parseFloat(Math.min(99.5, target + margin + 0.5).toFixed(2));
      } else {
        // Needs roll < target
        const margin = Math.random() * Math.max(1, target - 1);
        return parseFloat(Math.max(0.5, target - margin - 0.5).toFixed(2));
      }
    } else {
      // 12% losing roll
      if (isRollOver) {
        return parseFloat((Math.random() * (target - 0.5)).toFixed(2));
      } else {
        return parseFloat((target + 0.5 + Math.random() * (99 - target)).toFixed(2));
      }
    }
  }

  if (luckMode === "LOW_WIN") {
    // 85% chance to land in losing zone
    const willLose = Math.random() < 0.85;
    if (willLose) {
      if (isRollOver) {
        // Force roll <= target
        const loseVal = Math.max(0.5, target - Math.random() * 8.0);
        return parseFloat(loseVal.toFixed(2));
      } else {
        // Force roll >= target
        const loseVal = Math.min(99.5, target + Math.random() * 8.0);
        return parseFloat(loseVal.toFixed(2));
      }
    }
    return defaultRoll;
  }

  return defaultRoll;
}

/**
 * 4. Limbo Multiplier Outcome Resolution
 */
export function resolveLimboMultiplier(
  luckMode: LuckMode = "NO_CONTROL",
  targetMultiplier: number,
  defaultMultiplier: number
): number {
  if (luckMode === "HIGH_WIN") {
    const willWin = Math.random() < 0.88;
    if (willWin) {
      const extra = Math.random() * 2.0 + 0.1;
      return parseFloat((targetMultiplier + extra).toFixed(2));
    }
    return parseFloat((Math.max(1.01, targetMultiplier * 0.65)).toFixed(2));
  }

  if (luckMode === "LOW_WIN") {
    const willLose = Math.random() < 0.85;
    if (willLose) {
      return parseFloat((Math.max(1.01, targetMultiplier * 0.85 - Math.random() * 0.3)).toFixed(2));
    }
    return defaultMultiplier;
  }

  return defaultMultiplier;
}

/**
 * 5. Generic Win/Loss Decision Helper
 */
export function resolveGenericWin(
  luckMode: LuckMode = "NO_CONTROL",
  naturalWin: boolean
): boolean {
  if (luckMode === "HIGH_WIN") {
    return Math.random() < 0.88;
  }
  if (luckMode === "LOW_WIN") {
    return Math.random() < 0.15;
  }
  return naturalWin;
}
