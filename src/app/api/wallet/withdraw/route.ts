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

    const cookieUserId = req.cookies.get("stake_user_id")?.value;
    const headerUserId = req.headers.get("x-user-id");
    const targetUserId = userId || cookieUserId || headerUserId || "guest_player";

    const { user } = await getOrCreateUser({
      userId: targetUserId,
      username: username || (targetUserId && !targetUserId.startsWith("usr_") && !targetUserId.includes("-") ? targetUserId : undefined),
      email: email || undefined,
    });

    let userWallet = await prisma.wallet.findFirst({
      where: { userId: user.id, currency: currency || "INR" },
    });
    if (!userWallet) {
      userWallet = await prisma.wallet.findFirst({
        where: { userId: user.id },
      });
    }

    if (!userWallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    const currentBal = Number(userWallet.balance);
    const requestedAmt = Number(numericAmount);

    if (currentBal < requestedAmt) {
      return NextResponse.json(
        { error: `Insufficient balance. Current balance: ₹${currentBal}` },
        { status: 400 }
      );
    }

    const remainingBal = Math.max(0, parseFloat((currentBal - requestedAmt).toFixed(2)));

    // Atomically update wallet to REMAINING balance (do NOT set to 0 or requestedAmt)
    const updatedWallet = await prisma.wallet.update({
      where: { id: userWallet.id },
      data: {
        balance: remainingBal,
        totalWithdrawn: { increment: requestedAmt },
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
        amount: requestedAmt,
        currency,
        status: "PENDING",
        method: method.toUpperCase(),
        txHash: txIdentifier,
      },
    });

    return NextResponse.json({
      success: true,
      transaction,
      balance: remainingBal,
      currency: updatedWallet.currency,
      totalWithdrawn: Number(updatedWallet.totalWithdrawn),
      wallet: {
        id: updatedWallet.id,
        balance: remainingBal,
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
