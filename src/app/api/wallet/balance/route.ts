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
      },
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
    const { userId: rawUserId, balance, delta } = body;

    const userId = (rawUserId && rawUserId !== "undefined" && rawUserId !== "null" && String(rawUserId).trim().length > 0)
      ? String(rawUserId).trim()
      : "guest_player";

    const { wallet } = await getOrCreateUser(userId);

    let updatedWallet;
    if (typeof balance === "number") {
      const safeBalance = Math.max(0, parseFloat(Number(balance).toFixed(2)));
      updatedWallet = await prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: safeBalance,
        },
      });
    } else if (typeof delta === "number") {
      const current = Number(wallet.balance);
      const newBal = Math.max(0, parseFloat((current + delta).toFixed(2)));
      updatedWallet = await prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: newBal,
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
