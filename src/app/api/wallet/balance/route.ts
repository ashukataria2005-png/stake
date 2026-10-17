import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/dbUser";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const paramUserId = searchParams.get("userId") || searchParams.get("id");
    const paramUsername = searchParams.get("username");
    const paramEmail = searchParams.get("email");

    const cookieUserId = req.cookies.get("stake_user_id")?.value;
    const headerUserId = req.headers.get("x-user-id");

    const rawUserId = paramUserId || cookieUserId || headerUserId;
    const userId = (rawUserId && rawUserId !== "undefined" && rawUserId !== "null" && rawUserId.trim().length > 0)
      ? rawUserId.trim()
      : undefined;

    const { user, wallet } = await getOrCreateUser({
      userId,
      username: paramUsername || (userId && !userId.startsWith("usr_") && !userId.includes("-") ? userId : undefined),
      email: paramEmail || undefined,
    });

    let userWallet = await prisma.wallet.findFirst({
      where: { userId: user.id },
    }) || wallet;

    if (!userWallet) {
      userWallet = await prisma.wallet.create({
        data: {
          userId: user.id,
          currency: "INR",
          balance: 0.00,
          totalDeposited: 0.00,
          totalWithdrawn: 0.00,
          totalWagered: 0.00,
        },
      });
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    let safeBalance = Math.max(0, Number(userWallet.balance));
    if (Number(userWallet.balance) < 0) {
      try {
        await prisma.wallet.update({
          where: { id: userWallet.id },
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

    const totalDeposited = Math.max(0, Number(userWallet.totalDeposited));
    const totalWithdrawn = Math.max(0, Number(userWallet.totalWithdrawn));
    const totalWagered = Math.max(0, Number(userWallet.totalWagered));

    return NextResponse.json({
      success: true,
      balance: safeBalance,
      currency: userWallet.currency || "INR",
      totalDeposited,
      totalWithdrawn,
      totalWagered,
      wallet: {
        id: userWallet.id,
        currency: userWallet.currency || "INR",
        balance: safeBalance,
        totalDeposited,
        totalWithdrawn,
        totalWagered,
        depositCount: approvedDepositCount,
        approvedDepositCount,
        unlockedBonusTier,
      },
      user: {
        id: user.id,
        username: user.username,
        luckMode: user.luckMode,
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
    const { userId: rawUserId, username, email, balance, delta, wagerAmount } = body;

    const cookieUserId = req.cookies.get("stake_user_id")?.value;
    const headerUserId = req.headers.get("x-user-id");

    const rawId = (rawUserId && rawUserId !== "undefined" && rawUserId !== "null" && String(rawUserId).trim().length > 0)
      ? String(rawUserId).trim()
      : (cookieUserId || headerUserId || undefined);

    const { user, wallet } = await getOrCreateUser({
      userId: rawId,
      username: username || (rawId && !rawId.startsWith("usr_") && !rawId.includes("-") ? rawId : undefined),
      email: email || undefined,
    });

    let targetWallet = await prisma.wallet.findFirst({
      where: { userId: user.id },
    }) || wallet;

    const numericWager = (typeof wagerAmount === "number" && wagerAmount > 0)
      ? Math.max(0, parseFloat(wagerAmount.toFixed(2)))
      : 0;

    let updatedWallet;
    if (typeof balance === "number") {
      const safeBalance = Math.max(0, parseFloat(Number(balance).toFixed(2)));
      updatedWallet = await prisma.wallet.update({
        where: { id: targetWallet.id },
        data: {
          balance: safeBalance,
          ...(numericWager > 0 ? { totalWagered: { increment: numericWager } } : {}),
        },
      });
    } else if (typeof delta === "number") {
      const current = Number(targetWallet.balance);
      const newBal = Math.max(0, parseFloat((current + delta).toFixed(2)));
      updatedWallet = await prisma.wallet.update({
        where: { id: targetWallet.id },
        data: {
          balance: newBal,
          ...(numericWager > 0 ? { totalWagered: { increment: numericWager } } : {}),
        },
      });
    } else if (numericWager > 0) {
      updatedWallet = await prisma.wallet.update({
        where: { id: targetWallet.id },
        data: {
          totalWagered: { increment: numericWager },
        },
      });
    } else {
      updatedWallet = targetWallet;
    }

    return NextResponse.json({
      success: true,
      balance: Number(updatedWallet.balance),
      currency: updatedWallet.currency,
      totalWagered: Number(updatedWallet.totalWagered),
      totalDeposited: Number(updatedWallet.totalDeposited),
      wallet: {
        id: updatedWallet.id,
        balance: Number(updatedWallet.balance),
        currency: updatedWallet.currency,
        totalWagered: Number(updatedWallet.totalWagered),
        totalDeposited: Number(updatedWallet.totalDeposited),
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
