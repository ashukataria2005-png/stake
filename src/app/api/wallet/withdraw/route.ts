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
      method = "UPI",
      details,
    } = body;

    let minWithdrawalAmount = 500;
    try {
      const dbSetting = await prisma.gameControl.findUnique({
        where: { gameName: "SYSTEM_UPI" },
      });
      if (dbSetting?.mode) {
        const parsed = JSON.parse(dbSetting.mode);
        if (parsed.minWithdrawalAmount !== undefined && !isNaN(Number(parsed.minWithdrawalAmount))) {
          minWithdrawalAmount = Math.max(1, Number(parsed.minWithdrawalAmount));
        }
      }
    } catch {}

    const numericAmount = parseFloat(amount);
    if (!amount || isNaN(numericAmount) || numericAmount < minWithdrawalAmount) {
      return NextResponse.json(
        { error: `Minimum withdrawal amount is ₹${minWithdrawalAmount}` },
        { status: 400 }
      );
    }

    const { user, wallet } = await getOrCreateUser(userId || "demo_player");
    const currentBalance = Number(wallet.balance);

    if (currentBalance < numericAmount) {
      return NextResponse.json(
        { error: `Insufficient balance. Current balance: ₹${currentBalance}` },
        { status: 400 }
      );
    }

    // 1. Deduct balance and record in Neon Wallet table
    const updatedWallet = await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: { decrement: numericAmount },
        totalWithdrawn: { increment: numericAmount },
      },
    });

    // 2. Create Transaction record in Neon
    const txIdentifier =
      method === "bank"
        ? `ACC:${details?.bankAccount || "N/A"}|IFSC:${details?.ifscCode || "N/A"}`
        : details?.upiId || "UPI_TX";

    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        type: "WITHDRAWAL",
        amount: numericAmount,
        currency,
        status: "PENDING",
        method: method.toUpperCase(),
        txHash: txIdentifier,
      },
    });

    return NextResponse.json({
      success: true,
      transaction,
      wallet: {
        id: updatedWallet.id,
        balance: Number(updatedWallet.balance),
        currency: updatedWallet.currency,
        totalWithdrawn: Number(updatedWallet.totalWithdrawn),
      },
    });
  } catch (error: any) {
    console.error("Withdraw API error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
