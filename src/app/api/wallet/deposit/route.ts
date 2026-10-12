import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/dbUser";

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch (parseErr: any) {
      console.error("[Deposit API] Failed to parse JSON request body:", parseErr);
      return NextResponse.json(
        { error: "Invalid JSON request body: " + (parseErr?.message || "Unknown error") },
        { status: 400 }
      );
    }

    const {
      userId,
      amount,
      currency = "INR",
      utrNumber,
      screenshotUrl,
      orderId,
      method = "UPI",
      status = "PENDING",
      autoCredit = false,
    } = body;

    console.log("[Deposit API] Processing deposit request:", {
      userId: userId || "guest_user",
      amount,
      currency,
      utrNumber,
      hasScreenshot: Boolean(screenshotUrl),
      status,
      orderId,
    });

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      console.error("[Deposit API] Rejected invalid amount:", amount);
      return NextResponse.json({ error: "Invalid deposit amount" }, { status: 400 });
    }

    const numericAmount = parseFloat(amount);

    // Resolve or automatically create guest/demo user in PostgreSQL
    const { user, wallet } = await getOrCreateUser(userId || "guest_user");

    const txStatus = status === "APPROVED" ? "APPROVED" : "PENDING";
    const approvedBy = txStatus === "APPROVED" ? (autoCredit ? "SYSTEM_AUTO" : "ADMIN") : null;

    // 1. Create Transaction ledger record in Neon PostgreSQL
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        type: "DEPOSIT",
        amount: numericAmount,
        currency: currency.toUpperCase(),
        utrNumber: utrNumber ? String(utrNumber).trim() : null,
        screenshotUrl: screenshotUrl || null,
        status: txStatus,
        approvedBy,
        method: method || "UPI",
        txHash: orderId ? String(orderId) : null,
      },
    });

    console.log("[Deposit API] Transaction created in Neon DB:", {
      id: transaction.id,
      userId: transaction.userId,
      amount: Number(transaction.amount),
      status: transaction.status,
      utr: transaction.utrNumber,
    });

    // 2. Persist balance updates to Wallet table if approved or autoCredit
    let updatedWallet = wallet;
    if (autoCredit || txStatus === "APPROVED") {
      updatedWallet = await prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { increment: numericAmount },
          totalDeposited: { increment: numericAmount },
        },
      });
      console.log("[Deposit API] Wallet balance updated:", {
        walletId: updatedWallet.id,
        newBalance: Number(updatedWallet.balance),
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
    console.error("[Deposit API] Unhandled error creating deposit:", error);
    return NextResponse.json(
      {
        error: error?.message || "Internal server error occurred while recording deposit",
        details: String(error),
      },
      { status: 500 }
    );
  }
}
