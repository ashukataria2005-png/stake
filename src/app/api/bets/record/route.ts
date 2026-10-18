import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/dbUser";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      username,
      email,
      gameId: rawGameId,
      gameName: rawGameName,
      gameSlug: rawGameSlug,
      wager: rawWager,
      betAmount: rawBetAmount,
      payout: rawPayout,
      payoutAmount: rawPayoutAmount,
      multiplier: rawMultiplier,
      payoutMultiplier: rawPayoutMultiplier,
      isWin: rawIsWin,
      outcome: rawOutcome,
      gameData = {},
    } = body;

    const gameId = String(rawGameId || rawGameName || rawGameSlug || "general").trim();
    const wager = parseFloat(rawWager !== undefined ? rawWager : (rawBetAmount !== undefined ? rawBetAmount : 0));
    const payout = parseFloat(rawPayout !== undefined ? rawPayout : (rawPayoutAmount !== undefined ? rawPayoutAmount : 0));

    if (!gameId || isNaN(wager) || wager <= 0) {
      return NextResponse.json({ error: "Invalid bet parameters: gameId and positive wager required" }, { status: 400 });
    }

    const calculatedMultiplier = parseFloat(
      (rawMultiplier !== undefined ? rawMultiplier : (rawPayoutMultiplier !== undefined ? rawPayoutMultiplier : (wager > 0 ? payout / wager : 0))).toFixed(2)
    );

    const isWin = rawIsWin !== undefined
      ? Boolean(rawIsWin)
      : (rawOutcome === "WIN" || rawOutcome === "CASHOUT" || payout > wager);

    const outcome = rawOutcome || (isWin ? "WIN" : "LOSS");

    // Clean user identity resolution from body, cookies, or headers
    const cookieUserId = req.cookies.get("stake_user_id")?.value;
    const headerUserId = req.headers.get("x-user-id");
    const targetUserId = userId || cookieUserId || headerUserId || "guest_player";

    const { user, wallet } = await getOrCreateUser({
      userId: targetUserId,
      username: username || (targetUserId && !targetUserId.startsWith("usr_") && !targetUserId.includes("-") ? targetUserId : undefined),
      email: email || undefined,
    });

    // 1. Create permanent BetHistory record
    const betHistory = await prisma.betHistory.create({
      data: {
        userId: user.id,
        gameName: gameId,
        betAmount: wager,
        payoutMultiplier: calculatedMultiplier,
        payoutAmount: Math.max(0, payout),
        outcome: outcome.toUpperCase(),
        gameData: gameData || {},
      },
    });

    // 2. Also record in Bet table for cross-compatibility
    try {
      await prisma.bet.create({
        data: {
          userId: user.id,
          gameSlug: gameId.toLowerCase(),
          provider: "stake-originals",
          amount: wager,
          currency: wallet.currency || "INR",
          multiplier: calculatedMultiplier,
          payout: Math.max(0, payout),
          status: outcome.toUpperCase(),
        },
      });
    } catch (e) {
      // Non-blocking fallback
    }

    // 3. Atomically update wallet totalWagered in Neon PostgreSQL
    let updatedWallet = wallet;
    const netDelta = payout - wager;

    if (body.updateWallet !== false) {
      if (typeof body.balance === "number") {
        updatedWallet = await prisma.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: Math.max(0, parseFloat(Number(body.balance).toFixed(2))),
            totalWagered: { increment: wager },
          },
        });
      } else {
        const currentBal = Number(wallet.balance);
        const newBal = Math.max(0, parseFloat((currentBal + netDelta).toFixed(2)));
        updatedWallet = await prisma.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: newBal,
            totalWagered: { increment: wager },
          },
        });
      }
    } else {
      updatedWallet = await prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          totalWagered: { increment: wager },
        },
      });
    }

    return NextResponse.json({
      success: true,
      betHistory: {
        id: betHistory.id,
        userId: user.id,
        gameId: betHistory.gameName,
        gameName: betHistory.gameName,
        wager: Number(betHistory.betAmount),
        payout: Number(betHistory.payoutAmount),
        multiplier: betHistory.payoutMultiplier,
        isWin,
        outcome: betHistory.outcome,
        gameData: betHistory.gameData,
        createdAt: betHistory.createdAt,
      },
      wallet: {
        id: updatedWallet.id,
        balance: Number(updatedWallet.balance),
        currency: updatedWallet.currency,
        totalWagered: Number(updatedWallet.totalWagered),
      },
    });
  } catch (error: any) {
    console.error("[Bet Record API] Error saving bet:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cookieUserId = req.cookies.get("stake_user_id")?.value;
    const headerUserId = req.headers.get("x-user-id");
    const rawUserId = searchParams.get("userId") || cookieUserId || headerUserId || "guest_player";
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const gameId = searchParams.get("gameId") || searchParams.get("game");

    const { user } = await getOrCreateUser(rawUserId);

    const whereClause: any = { userId: user.id };
    if (gameId && gameId !== "all" && gameId !== "general") {
      whereClause.gameName = { equals: gameId, mode: "insensitive" };
    }

    const bets = await prisma.betHistory.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 100),
    });

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
    });
  } catch (error: any) {
    console.error("[Bet Record GET API] Error fetching bets:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
