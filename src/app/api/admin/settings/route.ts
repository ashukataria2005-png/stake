import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";
import { getLoggedInAdmin, hashPassword, verifyPassword } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const SETTINGS_FILE = path.join(DATA_DIR, "platformSettings.json");

import { sanitizeGatewayBaseUrl } from "@/lib/payment/universalGateway";

export interface PlatformSettings {
  upiId: string;
  upiName: string;
  gatewayMode?: "MANUAL" | "LGPAY_AUTO";
  paymentChannel?: "MANUAL_QR" | "LGPAY_STANDARD" | "RUPAYEX" | "CUSTOM_API";
  lgpayMerchantId?: string;
  lgpayApiKey?: string;
  lgpayBaseUrl?: string;
  tradeType?: string;
  amountUnit?: "PAISE" | "RUPEES";
  updatedAt?: string;
}

const DEFAULT_SETTINGS: PlatformSettings = {
  upiId: "stakeofficial@upi",
  upiName: "Stake Gaming",
  gatewayMode: "MANUAL",
  paymentChannel: "MANUAL_QR",
  lgpayMerchantId: "stake_lgpay_merchant",
  lgpayApiKey: "lgpay_secret_key_prod_8829",
  lgpayBaseUrl: "https://www.lg-pay.com",
  tradeType: "INRUPI",
  amountUnit: "PAISE",
};

export function getPlatformSettings(): PlatformSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const raw = fs.readFileSync(SETTINGS_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && parsed.upiId) {
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    }
  } catch (err) {
    console.error("Error reading platformSettings.json:", err);
  }
  return DEFAULT_SETTINGS;
}

export function savePlatformSettings(settings: PlatformSettings): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing platformSettings.json:", err);
  }
}

// GET /api/admin/settings
export async function GET(req: NextRequest) {
  try {
    // Also try reading from GameControl "SYSTEM_UPI" for DB backup
    let dbSetting = null;
    try {
      dbSetting = await prisma.gameControl.findUnique({
        where: { gameName: "SYSTEM_UPI" },
      });
    } catch {}

    const fileSettings = getPlatformSettings();
    let upiId = fileSettings.upiId;
    let upiName = fileSettings.upiName;
    let gatewayMode = fileSettings.gatewayMode || "MANUAL";
    let paymentChannel = fileSettings.paymentChannel || (gatewayMode === "LGPAY_AUTO" ? "LGPAY_STANDARD" : "MANUAL_QR");
    let lgpayMerchantId = fileSettings.lgpayMerchantId || "stake_lgpay_merchant";
    let lgpayApiKey = fileSettings.lgpayApiKey || "lgpay_secret_key_prod_8829";
    let lgpayBaseUrl = sanitizeGatewayBaseUrl(fileSettings.lgpayBaseUrl || "https://www.lg-pay.com");
    let tradeType = fileSettings.tradeType || "INRUPI";
    let amountUnit = fileSettings.amountUnit || "PAISE";

    if (dbSetting && dbSetting.mode) {
      try {
        const parsed = JSON.parse(dbSetting.mode);
        if (parsed.upiId) upiId = parsed.upiId;
        if (parsed.upiName) upiName = parsed.upiName;
        if (parsed.gatewayMode) gatewayMode = parsed.gatewayMode;
        if (parsed.paymentChannel) paymentChannel = parsed.paymentChannel;
        if (parsed.lgpayMerchantId) lgpayMerchantId = parsed.lgpayMerchantId;
        if (parsed.lgpayApiKey) lgpayApiKey = parsed.lgpayApiKey;
        if (parsed.lgpayBaseUrl) lgpayBaseUrl = sanitizeGatewayBaseUrl(parsed.lgpayBaseUrl);
        if (parsed.tradeType) tradeType = parsed.tradeType;
        if (parsed.amountUnit) amountUnit = parsed.amountUnit;
      } catch {}
    }

    return NextResponse.json({
      success: true,
      settings: {
        upiId,
        upiName,
        gatewayMode,
        paymentChannel,
        lgpayMerchantId,
        lgpayApiKey,
        lgpayBaseUrl,
        tradeType,
        amountUnit,
      },
    });
  } catch (err: any) {
    console.error("[Settings API GET Error]:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to load settings" },
      { status: 500 }
    );
  }
}

// POST /api/admin/settings (Update UPI and/or Admin Password)
export async function POST(req: NextRequest) {
  try {
    const admin = await getLoggedInAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, upiId, upiName, currentPassword, newPassword } = body;

    // Action 1: Update Platform UPI details
    if (action === "UPDATE_UPI" || (upiId && upiName && !newPassword)) {
      if (!upiId || !upiName) {
        return NextResponse.json({ success: false, error: "Missing UPI ID or Name" }, { status: 400 });
      }

      const updated = {
        upiId: upiId.trim(),
        upiName: upiName.trim(),
        updatedAt: new Date().toISOString(),
      };

      savePlatformSettings(updated);

      // Persist to Neon DB
      try {
        await prisma.gameControl.upsert({
          where: { gameName: "SYSTEM_UPI" },
          update: {
            mode: JSON.stringify(updated),
            isActive: true,
          },
          create: {
            gameName: "SYSTEM_UPI",
            mode: JSON.stringify(updated),
            isActive: true,
          },
        });
      } catch (e) {
        console.warn("DB backup for SYSTEM_UPI failed:", e);
      }

      return NextResponse.json({
        success: true,
        message: "UPI Settings saved successfully and persisted.",
        settings: updated,
      });
    }

    // Action 1B: Update Universal Payment Gateway parameters
    if (action === "UPDATE_GATEWAY") {
      const current = getPlatformSettings();
      const chosenChannel = body.paymentChannel || (body.gatewayMode === "LGPAY_AUTO" ? "LGPAY_STANDARD" : "MANUAL_QR");
      const chosenGatewayMode: "MANUAL" | "LGPAY_AUTO" = chosenChannel === "MANUAL_QR" ? "MANUAL" : "LGPAY_AUTO";

      const updated = {
        ...current,
        paymentChannel: chosenChannel,
        gatewayMode: chosenGatewayMode,
        lgpayMerchantId: body.lgpayMerchantId !== undefined ? String(body.lgpayMerchantId).trim() : current.lgpayMerchantId,
        lgpayApiKey: body.lgpayApiKey !== undefined ? String(body.lgpayApiKey).trim() : current.lgpayApiKey,
        lgpayBaseUrl: sanitizeGatewayBaseUrl(body.lgpayBaseUrl || current.lgpayBaseUrl, chosenChannel),
        tradeType: body.tradeType !== undefined ? String(body.tradeType).trim() : current.tradeType || "INRUPI",
        amountUnit: body.amountUnit || (chosenChannel === "RUPAYEX" ? "RUPEES" : current.amountUnit || "PAISE"),
        updatedAt: new Date().toISOString(),
      };

      savePlatformSettings(updated);

      try {
        await prisma.gameControl.upsert({
          where: { gameName: "SYSTEM_UPI" },
          update: {
            mode: JSON.stringify(updated),
            isActive: true,
          },
          create: {
            gameName: "SYSTEM_UPI",
            mode: JSON.stringify(updated),
            isActive: true,
          },
        });
      } catch (e) {
        console.warn("DB backup for SYSTEM_UPI failed:", e);
      }

      return NextResponse.json({
        success: true,
        message: "Payment Gateway settings saved and persisted.",
        settings: updated,
      });
    }

    // Action 2: Update Main Admin Password
    if (action === "UPDATE_PASSWORD") {
      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { success: false, error: "Current and new password required" },
          { status: 400 }
        );
      }

      const adminUser = await prisma.adminUser.findUnique({
        where: { id: admin.id },
      });

      if (!adminUser) {
        return NextResponse.json({ success: false, error: "Admin user not found" }, { status: 404 });
      }

      const isValid = await verifyPassword(currentPassword, adminUser.passwordHash);
      if (!isValid) {
        return NextResponse.json({ success: false, error: "Incorrect current password" }, { status: 400 });
      }

      const newHash = await hashPassword(newPassword);
      await prisma.adminUser.update({
        where: { id: admin.id },
        data: { passwordHash: newHash },
      });

      return NextResponse.json({
        success: true,
        message: "Main Admin password updated successfully.",
      });
    }

    return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    console.error("[Settings API POST Error]:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to update settings" },
      { status: 500 }
    );
  }
}
