import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/dbUser";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cookieUserId = req.cookies.get("stake_user_id")?.value;
    const headerUserId = req.headers.get("x-user-id");
    const rawUserId = searchParams.get("userId") || cookieUserId || headerUserId || "guest_player";
    const gameId = searchParams.get("gameId") || searchParams.get("game");
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "50", 10)));
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const skip = (page - 1) * limit;

    const { user, wallet } = await getOrCreateUser(rawUserId);

    const whereClause: any = { userId: user.id };
    if (gameId && gameId !== "all" && gameId !== "general") {
      whereClause.gameName = { equals: gameId, mode: "insensitive" };
    }

    const [bets, totalBetsCount] = await Promise.all([
      prisma.betHistory.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.betHistory.count({ where: whereClause }),
    ]);

    // Aggregate statistics across user's bet history
    const allBetsForStats = await prisma.betHistory.findMany({
      where: whereClause,
      select: {
        betAmount: true,
        payoutAmount: true,
        outcome: true,
      },
    });

    let totalWagered = 0;
    let totalPayout = 0;
    let wins = 0;
    let losses = 0;

    for (const b of allBetsForStats) {
      const w = Number(b.betAmount) || 0;
      const p = Number(b.payoutAmount) || 0;
      totalWagered += w;
      totalPayout += p;
      if (b.outcome === "WIN" || b.outcome === "CASHOUT" || p > w) {
        wins += 1;
      } else {
        losses += 1;
      }
    }

    const netProfit = parseFloat((totalPayout - totalWagered).toFixed(4));

    return NextResponse.json({
      success: true,
      bets: bets.map((b) => ({
        id: b.id,
        userId: b.userId,
        gameId: b.gameName,
        gameName: b.gameName,
        wager: Number(b.betAmount),
        payout: Number(b.payoutAmount),
        multiplier: b.payoutMultiplier,
        isWin: b.outcome === "WIN" || b.outcome === "CASHOUT" || Number(b.payoutAmount) > Number(b.betAmount),
        outcome: b.outcome,
        gameData: b.gameData,
        createdAt: b.createdAt,
      })),
      pagination: {
        total: totalBetsCount,
        page,
        limit,
        totalPages: Math.ceil(totalBetsCount / limit) || 1,
      },
      stats: {
        totalBets: totalBetsCount,
        totalWagered: parseFloat(totalWagered.toFixed(4)),
        totalPayout: parseFloat(totalPayout.toFixed(4)),
        netProfit,
        wins,
        losses,
        walletTotalWagered: Number(wallet.totalWagered),
      },
    });
  } catch (error: any) {
    console.error("[Bet History API] Error fetching user history:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  // Forward to /api/bets/record handler for unified endpoints
  try {
    const { POST: recordPost } = await import("../record/route");
    return await recordPost(req);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to process bet" }, { status: 500 });
  }
}
