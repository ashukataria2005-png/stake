import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getLoggedInAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  try {
    const admin = await getLoggedInAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const defaultGames = [
      "Mines",
      "Plinko",
      "Dice",
      "Crash",
      "Limbo",
      "Keno",
      "Wheel",
      "Dragon Tower",
      "HiLo",
      "Blackjack",
      "Roulette",
      "Video Poker",
    ];

    // Ensure initial records exist
    for (const g of defaultGames) {
      await prisma.gameControl.upsert({
        where: { gameName: g },
        create: {
          gameName: g,
          mode: "NORMAL",
          houseEdgePercent: 2.5,
          isActive: true,
        },
        update: {},
      });
    }

    const controls = await prisma.gameControl.findMany({
      orderBy: { gameName: "asc" },
    });

    return NextResponse.json({
      success: true,
      controls,
    });
  } catch (err: any) {
    console.error("[Game Control API Error]:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to fetch game controls" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getLoggedInAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { gameName, mode, houseEdgePercent, isActive, forcedMultiplier } = body;

    if (!gameName) {
      return NextResponse.json({ success: false, error: "Missing gameName" }, { status: 400 });
    }

    const defaultGames = [
      "GLOBAL",
      "Mines",
      "Crash",
      "Dice",
      "Limbo",
      "Plinko",
      "Roulette",
      "Blackjack",
      "Keno",
      "Wheel",
      "Dragon Tower",
      "HiLo",
      "Video Poker",
    ];

    if (gameName === "ALL" || gameName === "ALL_GAMES") {
      for (const g of defaultGames) {
        await prisma.gameControl.upsert({
          where: { gameName: g },
          update: {
            mode: mode || "NORMAL",
            isActive: true,
          },
          create: {
            gameName: g,
            mode: mode || "NORMAL",
            houseEdgePercent: 2.5,
            isActive: true,
          },
        });
      }
      return NextResponse.json({
        success: true,
        message: `Updated all games to mode: ${mode}`,
      });
    }

    const updated = await prisma.gameControl.upsert({
      where: { gameName },
      update: {
        mode: mode || "NORMAL",
        houseEdgePercent: houseEdgePercent !== undefined ? parseFloat(houseEdgePercent) : 2.5,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        forcedMultiplier: forcedMultiplier !== undefined && forcedMultiplier !== null ? parseFloat(forcedMultiplier) : null,
      },
      create: {
        gameName,
        mode: mode || "NORMAL",
        houseEdgePercent: houseEdgePercent !== undefined ? parseFloat(houseEdgePercent) : 2.5,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        forcedMultiplier: forcedMultiplier !== undefined && forcedMultiplier !== null ? parseFloat(forcedMultiplier) : null,
      },
    });

    return NextResponse.json({
      success: true,
      control: updated,
    });
  } catch (err: any) {
    console.error("[Game Control Update Error]:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to update game control" },
      { status: 500 }
    );
  }
}
