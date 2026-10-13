import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/dbUser";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      gameName,
      betAmount,
      payoutMultiplier = 0.0,
      payoutAmount = 0.0,
      outcome = "LOSS",
      gameData = {},
    } = body;

    const numericBet = parseFloat(betAmount);
    if (!gameName || isNaN(numericBet) || numericBet <= 0) {
      return NextResponse.json({ error: "Invalid bet details" }, { status: 400 });
    }

    const { user, wallet } = await getOrCreateUser(userId || "demo_player");

    // 1. Create BetHistory entry in Neon
    const betHistory = await prisma.betHistory.create({
      data: {
        userId: user.id,
        gameName,
        betAmount: numericBet,
        payoutMultiplier: parseFloat(payoutMultiplier) || 0.0,
        payoutAmount: parseFloat(payoutAmount) || 0.0,
        outcome: outcome.toUpperCase(),
        gameData,
      },
    });

    // 2. Atomically update wallet balance & wagered in Neon PostgreSQL
    // betAmount is deducted, payoutAmount is credited (net delta = payoutAmount - numericBet)
    const netDelta = (parseFloat(payoutAmount) || 0.0) - numericBet;
    const updatedWallet = await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: { increment: netDelta },
        totalWagered: { increment: numericBet },
      },
    });

    return NextResponse.json({
      success: true,
      wallet: {
        id: updatedWallet.id,
        balance: Number(updatedWallet.balance),
        currency: updatedWallet.currency,
      },
      betHistory: {
        id: betHistory.id,
        gameName: betHistory.gameName,
        betAmount: Number(betHistory.betAmount),
        payoutMultiplier: betHistory.payoutMultiplier,
        payoutAmount: Number(betHistory.payoutAmount),
        outcome: betHistory.outcome,
        createdAt: betHistory.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Bet Record API error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "demo_player";
    const limit = parseInt(searchParams.get("limit") || "30", 10);

    const { user } = await getOrCreateUser(userId);

    const bets = await prisma.betHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 100),
    });

    return NextResponse.json({
      success: true,
      bets,
    });
  } catch (error: any) {
    console.error("Bet History GET API error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
