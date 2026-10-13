import { NextRequest, NextResponse } from "next/server";
import {
  loadPromos,
  createPromo,
  togglePromoStatus,
  validateAndCalculatePromo,
} from "@/lib/promoEngine";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const amountStr = searchParams.get("amount");

    // If code and amount are provided, perform validation and discount calculation
    if (code) {
      const amount = parseFloat(amountStr || "1000") || 1000;
      const result = validateAndCalculatePromo(code, amount);
      if (!result.valid) {
        return NextResponse.json(
          { success: false, error: result.error, result },
          { status: 400 }
        );
      }
      return NextResponse.json({ success: true, ...result });
    }

    // Otherwise, return all promos
    const promos = loadPromos();
    return NextResponse.json({ success: true, promos });
  } catch (err: any) {
    console.error("[Promotions API] GET Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to load promotions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      code,
      discountPercent,
      maxDepositLimit,
      bonusType = "PERCENT",
      bonusValue = 10,
      isPublic = true,
      maxUses = 100,
      duration = "7 Days",
      status = "ACTIVE",
    } = body;

    if (!code || !code.trim()) {
      return NextResponse.json(
        { success: false, error: "Promo code is required." },
        { status: 400 }
      );
    }

    const created = createPromo({
      code: code.trim().toUpperCase(),
      discountPercent: parseFloat(discountPercent || bonusValue) || 10,
      maxDepositLimit: parseFloat(maxDepositLimit) || 5000,
      bonusType: bonusType || "PERCENT",
      bonusValue: parseFloat(bonusValue || discountPercent) || 10,
      isPublic: Boolean(isPublic),
      maxUses: parseInt(maxUses) || 100,
      duration: duration || "7 Days",
      status: status === "EXPIRED" ? "EXPIRED" : "ACTIVE",
    });

    return NextResponse.json({ success: true, promo: created });
  } catch (err: any) {
    console.error("[Promotions API] POST Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to create promo" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing promo id" },
        { status: 400 }
      );
    }

    const updated = togglePromoStatus(id);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Promo not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, promo: updated });
  } catch (err: any) {
    console.error("[Promotions API] PATCH Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to update promo" },
      { status: 500 }
    );
  }
}
