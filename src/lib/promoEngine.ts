import fs from "fs";
import path from "path";

export interface PromoCode {
  id: string;
  code: string;
  discountPercent: number; // e.g. 10 (10% discount on deposit)
  maxDepositLimit: number; // e.g. 5000 (promo applicable on deposits up to ₹5,000)
  bonusType: "PERCENT" | "FIXED";
  bonusValue: number;
  isPublic: boolean;
  maxUses: number;
  usedCount: number;
  duration: string;
  status: "ACTIVE" | "EXPIRED";
  createdAt: string;
}

const DEFAULT_PROMOS: PromoCode[] = [
  {
    id: "promo-welcome10",
    code: "WELCOME10",
    discountPercent: 10,
    maxDepositLimit: 5000,
    bonusType: "PERCENT",
    bonusValue: 10,
    isPublic: true,
    maxUses: 1000,
    usedCount: 142,
    duration: "30 Days",
    status: "ACTIVE",
    createdAt: "2026-10-01",
  },
  {
    id: "promo-vip20",
    code: "VIP20",
    discountPercent: 20,
    maxDepositLimit: 10000,
    bonusType: "PERCENT",
    bonusValue: 20,
    isPublic: false,
    maxUses: 200,
    usedCount: 48,
    duration: "7 Days",
    status: "ACTIVE",
    createdAt: "2026-10-05",
  },
  {
    id: "promo-stake50",
    code: "STAKE50",
    discountPercent: 50,
    maxDepositLimit: 2000,
    bonusType: "PERCENT",
    bonusValue: 50,
    isPublic: true,
    maxUses: 500,
    usedCount: 312,
    duration: "3 Days",
    status: "ACTIVE",
    createdAt: "2026-10-08",
  },
  {
    id: "promo-mega15",
    code: "MEGA15",
    discountPercent: 15,
    maxDepositLimit: 20000,
    bonusType: "PERCENT",
    bonusValue: 15,
    isPublic: true,
    maxUses: 1000,
    usedCount: 95,
    duration: "14 Days",
    status: "ACTIVE",
    createdAt: "2026-10-10",
  },
];

// Persistent File Path for Promotions
const DATA_DIR = path.join(process.cwd(), "src", "data");
const PROMOS_FILE = path.join(DATA_DIR, "promotions.json");

// In-memory cache
let inMemoryPromos: PromoCode[] | null = null;

export function loadPromos(): PromoCode[] {
  if (inMemoryPromos && inMemoryPromos.length > 0) {
    return inMemoryPromos;
  }

  try {
    if (fs.existsSync(PROMOS_FILE)) {
      const raw = fs.readFileSync(PROMOS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryPromos = parsed;
        return inMemoryPromos;
      }
    }
  } catch (err) {
    console.error("[promoEngine] Error reading promotions.json:", err);
  }

  inMemoryPromos = [...DEFAULT_PROMOS];
  savePromos(inMemoryPromos);
  return inMemoryPromos;
}

export function savePromos(promos: PromoCode[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(PROMOS_FILE, JSON.stringify(promos, null, 2), "utf-8");
    inMemoryPromos = promos;
  } catch (err) {
    console.error("[promoEngine] Error saving promotions.json:", err);
    inMemoryPromos = promos;
  }
}

export function createPromo(promoData: Omit<PromoCode, "id" | "usedCount" | "createdAt">): PromoCode {
  const promos = loadPromos();
  const newPromo: PromoCode = {
    ...promoData,
    id: `promo-${Date.now()}`,
    code: promoData.code.trim().toUpperCase(),
    usedCount: 0,
    createdAt: new Date().toISOString().split("T")[0],
  };

  // Replace if code exists or add to front
  const existingIdx = promos.findIndex((p) => p.code === newPromo.code);
  if (existingIdx >= 0) {
    promos[existingIdx] = { ...newPromo, id: promos[existingIdx].id };
  } else {
    promos.unshift(newPromo);
  }

  savePromos(promos);
  return newPromo;
}

export function togglePromoStatus(id: string): PromoCode | null {
  const promos = loadPromos();
  const target = promos.find((p) => p.id === id);
  if (!target) return null;

  target.status = target.status === "ACTIVE" ? "EXPIRED" : "ACTIVE";
  savePromos(promos);
  return target;
}

export function updatePromo(id: string, updates: Partial<PromoCode>): PromoCode | null {
  const promos = loadPromos();
  const index = promos.findIndex((p) => p.id === id);
  if (index === -1) return null;

  promos[index] = {
    ...promos[index],
    ...updates,
    discountPercent: updates.discountPercent !== undefined ? updates.discountPercent : promos[index].discountPercent,
    bonusValue: updates.discountPercent !== undefined ? updates.discountPercent : (updates.bonusValue !== undefined ? updates.bonusValue : promos[index].bonusValue),
    maxDepositLimit: updates.maxDepositLimit !== undefined ? updates.maxDepositLimit : promos[index].maxDepositLimit,
    maxUses: updates.maxUses !== undefined ? updates.maxUses : promos[index].maxUses,
  };
  savePromos(promos);
  return promos[index];
}

export function deletePromo(id: string): boolean {
  const promos = loadPromos();
  const filtered = promos.filter((p) => p.id !== id);
  if (filtered.length === promos.length) return false;
  savePromos(filtered);
  return true;
}

export function deletePromos(ids: string[]): number {
  const promos = loadPromos();
  const filtered = promos.filter((p) => !ids.includes(p.id));
  const deletedCount = promos.length - filtered.length;
  savePromos(filtered);
  return deletedCount;
}

export interface PromoValidationResult {
  valid: boolean;
  error?: string;
  promo?: PromoCode;
  depositAmount: number;
  discountPercent: number;
  maxDepositLimit: number;
  discountAmount: number;
  payableAmount: number;
  creditedAmount: number;
}

export function validateAndCalculatePromo(code: string, depositAmount: number): PromoValidationResult {
  const cleanCode = (code || "").trim().toUpperCase();
  const numAmount = Math.max(0, Number(depositAmount) || 0);

  if (!cleanCode) {
    return {
      valid: false,
      error: "Please enter a promo code.",
      depositAmount: numAmount,
      discountPercent: 0,
      maxDepositLimit: 0,
      discountAmount: 0,
      payableAmount: numAmount,
      creditedAmount: numAmount,
    };
  }

  const promos = loadPromos();
  const promo = promos.find((p) => p.code === cleanCode);

  if (!promo) {
    return {
      valid: false,
      error: `Promo code "${cleanCode}" is invalid.`,
      depositAmount: numAmount,
      discountPercent: 0,
      maxDepositLimit: 0,
      discountAmount: 0,
      payableAmount: numAmount,
      creditedAmount: numAmount,
    };
  }

  if (promo.status !== "ACTIVE") {
    return {
      valid: false,
      error: `Promo code "${cleanCode}" has expired.`,
      depositAmount: numAmount,
      discountPercent: 0,
      maxDepositLimit: 0,
      discountAmount: 0,
      payableAmount: numAmount,
      creditedAmount: numAmount,
    };
  }

  if (promo.usedCount >= promo.maxUses) {
    return {
      valid: false,
      error: `Promo code "${cleanCode}" has reached its maximum redemptions limit (${promo.maxUses}).`,
      depositAmount: numAmount,
      discountPercent: 0,
      maxDepositLimit: 0,
      discountAmount: 0,
      payableAmount: numAmount,
      creditedAmount: numAmount,
    };
  }

  const discountPercent = Math.min(100, Math.max(1, promo.discountPercent || promo.bonusValue || 10));
  const maxDepositLimit = Math.max(100, promo.maxDepositLimit || 5000);

  // Eligible amount capped at maxDepositLimit
  const eligibleAmount = Math.min(numAmount, maxDepositLimit);
  const discountAmount = Math.round(eligibleAmount * (discountPercent / 100));
  const payableAmount = Math.max(0, numAmount - discountAmount);
  const creditedAmount = numAmount; // Full amount is credited to wallet

  return {
    valid: true,
    promo,
    depositAmount: numAmount,
    discountPercent,
    maxDepositLimit,
    discountAmount,
    payableAmount,
    creditedAmount,
  };
}
