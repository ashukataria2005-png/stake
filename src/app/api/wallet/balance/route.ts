import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/dbUser";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "demo_player";

    const { user, wallet } = await getOrCreateUser(userId);

    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

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
        balance: Number(wallet.balance),
        totalDeposited: Number(wallet.totalDeposited),
        totalWithdrawn: Number(wallet.totalWithdrawn),
        totalWagered: Number(wallet.totalWagered),
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
    const { userId, balance, delta } = body;

    const { wallet } = await getOrCreateUser(userId || "demo_player");

    let updatedWallet;
    if (typeof delta === "number") {
      updatedWallet = await prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { increment: delta },
        },
      });
    } else if (typeof balance === "number") {
      updatedWallet = await prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          balance,
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
