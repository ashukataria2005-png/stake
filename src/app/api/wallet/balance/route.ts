import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/dbUser";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawUserId = searchParams.get("userId");
    const userId = (rawUserId && rawUserId !== "undefined" && rawUserId !== "null" && rawUserId.trim().length > 0)
      ? rawUserId.trim()
      : "guest_player";

    const { user, wallet } = await getOrCreateUser(userId);

    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    let safeBalance = Math.max(0, Number(wallet.balance));
    if (Number(wallet.balance) < 0) {
      try {
        await prisma.wallet.update({
          where: { id: wallet.id },
          data: { balance: 0 },
        });
        safeBalance = 0;
      } catch {}
    }

    const approvedDepositCount = await prisma.transaction.count({
      where: {
        userId: user.id,
        type: "DEPOSIT",
        status: "APPROVED",
      },
    });

    // Progressive milestone calculation:
    // 0 approved deposits: 1st unlocked (bonus-1).
    // 1 approved deposit: 1st & 2nd unlocked (bonus-2).
    // 2 approved deposits: 1st, 2nd, & 3rd unlocked (bonus-3).
    // 3+ approved deposits: All 4 bonuses unlocked (bonus-4).
    const unlockedBonusTier = Math.min(4, approvedDepositCount + 1);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        luckMode: user.luckMode,
      },
      wallet: {
        id: wallet.id,
        currency: wallet.currency,
        balance: safeBalance,
        totalDeposited: Math.max(0, Number(wallet.totalDeposited)),
        totalWithdrawn: Math.max(0, Number(wallet.totalWithdrawn)),
        totalWagered: Math.max(0, Number(wallet.totalWagered)),
        depositCount: approvedDepositCount,
        approvedDepositCount,
        unlockedBonusTier,
      },
      approvedDepositCount,
      unlockedBonusTier,
      transactions,
    });
  } catch (error: any) {
    console.error("Balance GET API error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId: rawUserId, balance, delta, wagerAmount } = body;

    const userId = (rawUserId && rawUserId !== "undefined" && rawUserId !== "null" && String(rawUserId).trim().length > 0)
      ? String(rawUserId).trim()
      : "guest_player";

    const { wallet } = await getOrCreateUser(userId);

    const numericWager = (typeof wagerAmount === "number" && wagerAmount > 0)
      ? Math.max(0, parseFloat(wagerAmount.toFixed(2)))
      : 0;

    let updatedWallet;
    if (typeof balance === "number") {
      const safeBalance = Math.max(0, parseFloat(Number(balance).toFixed(2)));
      updatedWallet = await prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: safeBalance,
          ...(numericWager > 0 ? { totalWagered: { increment: numericWager } } : {}),
        },
      });
    } else if (typeof delta === "number") {
      const current = Number(wallet.balance);
      const newBal = Math.max(0, parseFloat((current + delta).toFixed(2)));
      updatedWallet = await prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: newBal,
          ...(numericWager > 0 ? { totalWagered: { increment: numericWager } } : {}),
        },
      });
    } else if (numericWager > 0) {
      updatedWallet = await prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          totalWagered: { increment: numericWager },
        },
      });
    } else {
      updatedWallet = wallet;
    }

    return NextResponse.json({
      success: true,
      wallet: {
        id: updatedWallet.id,
        balance: Number(updatedWallet.balance),
        currency: updatedWallet.currency,
        totalWagered: Number(updatedWallet.totalWagered),
      },
    });
  } catch (error: any) {
    console.error("Balance POST API error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
