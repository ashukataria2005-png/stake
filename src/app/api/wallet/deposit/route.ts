import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/dbUser";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      amount,
      currency = "INR",
      utrNumber,
      screenshotUrl,
      orderId,
      method = "UPI",
      autoCredit = true,
    } = body;

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return NextResponse.json({ error: "Invalid deposit amount" }, { status: 400 });
    }

    const numericAmount = parseFloat(amount);
    const { user, wallet } = await getOrCreateUser(userId || "demo_player");

    // 1. Create Transaction record in Neon
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        type: "DEPOSIT",
        amount: numericAmount,
        currency,
        utrNumber: utrNumber || null,
        screenshotUrl: screenshotUrl || null,
        status: autoCredit ? "APPROVED" : "PENDING",
        approvedBy: autoCredit ? "SYSTEM_AUTO" : null,
        method: method || "UPI",
        txHash: orderId || null,
      },
    });

    // 2. Persist balance updates to Wallet table in Neon
    let updatedWallet = wallet;
    if (autoCredit) {
      updatedWallet = await prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { increment: numericAmount },
          totalDeposited: { increment: numericAmount },
        },
      });
    }

    return NextResponse.json({
      success: true,
      transaction,
      wallet: {
        id: updatedWallet.id,
        balance: Number(updatedWallet.balance),
        currency: updatedWallet.currency,
        totalDeposited: Number(updatedWallet.totalDeposited),
      },
    });
  } catch (error: any) {
    console.error("Deposit API error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
