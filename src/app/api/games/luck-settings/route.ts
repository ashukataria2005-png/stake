import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/dbUser";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "demo_player";
    const gameName = searchParams.get("gameName") || "GLOBAL";

    // 1. Fetch user's luck setting from Neon DB
    let userLuckMode = "NO_CONTROL";
    try {
      const { user } = await getOrCreateUser(userId);
      userLuckMode = user.luckMode || "NO_CONTROL";
    } catch {
      // fallback
    }

    // 2. Fetch game control or GLOBAL setting from Neon DB
    let gameControl = null;
    try {
      gameControl = await prisma.gameControl.findFirst({
        where: {
          OR: [
            { gameName: gameName },
            { gameName: "GLOBAL" },
          ],
        },
      });
    } catch {
      // fallback
    }

    // Effective luck: User-level luck takes precedence; if NO_CONTROL, fallback to game control mode
    let effectiveMode = userLuckMode;
    if (userLuckMode === "NO_CONTROL" && gameControl && gameControl.isActive) {
      if (gameControl.mode === "HIGH_WIN" || gameControl.mode === "LOW_WIN") {
        effectiveMode = gameControl.mode;
      }
    }

    return NextResponse.json({
      success: true,
      effectiveMode,
      userLuckMode,
      gameControl: gameControl
        ? {
            gameName: gameControl.gameName,
            mode: gameControl.mode,
            houseEdgePercent: gameControl.houseEdgePercent,
            forcedMultiplier: gameControl.forcedMultiplier,
            isActive: gameControl.isActive,
          }
        : null,
    });
  } catch (err: any) {
    console.error("Luck Settings GET Error:", err);
    return NextResponse.json(
      { success: false, effectiveMode: "NO_CONTROL", error: err?.message },
      { status: 500 }
    );
  }
}
