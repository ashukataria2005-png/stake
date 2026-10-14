import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";
import { getLoggedInAdmin, hashPassword, verifyPassword } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const SETTINGS_FILE = path.join(DATA_DIR, "platformSettings.json");

interface PlatformSettings {
  upiId: string;
  upiName: string;
  gatewayMode?: "MANUAL" | "LGPAY_AUTO";
  lgpayMerchantId?: string;
  lgpayApiKey?: string;
  lgpayBaseUrl?: string;
  updatedAt?: string;
}

const DEFAULT_SETTINGS: PlatformSettings = {
  upiId: "stakeofficial@upi",
  upiName: "Stake Gaming",
  gatewayMode: "MANUAL",
  lgpayMerchantId: "stake_lgpay_merchant",
  lgpayApiKey: "lgpay_secret_key_prod_8829",
  lgpayBaseUrl: "https://www.lg-pay.com",
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
    let lgpayMerchantId = fileSettings.lgpayMerchantId || "stake_lgpay_merchant";
    let lgpayApiKey = fileSettings.lgpayApiKey || "lgpay_secret_key_prod_8829";
    let lgpayBaseUrl = fileSettings.lgpayBaseUrl || "https://www.lg-pay.com";

    if (dbSetting && dbSetting.mode) {
      try {
        const parsed = JSON.parse(dbSetting.mode);
        if (parsed.upiId) upiId = parsed.upiId;
        if (parsed.upiName) upiName = parsed.upiName;
        if (parsed.gatewayMode) gatewayMode = parsed.gatewayMode;
        if (parsed.lgpayMerchantId) lgpayMerchantId = parsed.lgpayMerchantId;
        if (parsed.lgpayApiKey) lgpayApiKey = parsed.lgpayApiKey;
        if (parsed.lgpayBaseUrl) lgpayBaseUrl = parsed.lgpayBaseUrl;
      } catch {}
    }

    return NextResponse.json({
      success: true,
      settings: {
        upiId,
        upiName,
        gatewayMode,
        lgpayMerchantId,
        lgpayApiKey,
        lgpayBaseUrl,
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

    // Action 1B: Update LG-Pay Automatic Gateway parameters
    if (action === "UPDATE_GATEWAY") {
      const current = getPlatformSettings();
      const updated = {
        ...current,
        gatewayMode: body.gatewayMode || "MANUAL",
        lgpayMerchantId: body.lgpayMerchantId || current.lgpayMerchantId,
        lgpayApiKey: body.lgpayApiKey || current.lgpayApiKey,
        lgpayBaseUrl: body.lgpayBaseUrl || current.lgpayBaseUrl,
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
