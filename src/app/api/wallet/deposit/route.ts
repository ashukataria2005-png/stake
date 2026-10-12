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
        { success: false, error: "Invalid JSON request body: " + (parseErr?.message || "Unknown error") },
        { status: 400 }
      );
    }

    const {
      userId,
      username,
      email,
      amount,
      currency = "INR",
      utrNumber,
      screenshotUrl,
      orderId,
      method = "UPI",
      status = "PENDING",
      autoCredit = true,
    } = body;

    console.log("Deposit payload received:", {
      userId,
      username,
      email,
      amount,
      currency,
      utrNumber,
      orderId,
      hasScreenshot: Boolean(screenshotUrl),
      screenshotLength: screenshotUrl?.length || 0,
      status,
      autoCredit,
    });

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      console.error("[Deposit API] Rejected invalid amount:", amount);
      return NextResponse.json(
        { success: false, error: "Invalid deposit amount: must be greater than 0" },
        { status: 400 }
      );
    }

    const numericAmount = parseFloat(amount);

    // 1. Resolve or create user in Neon PostgreSQL
    let resolvedUser;
    let resolvedWallet;
    try {
      const userRes = await getOrCreateUser({
        userId,
        username,
        email,
      });
      resolvedUser = userRes.user;
      resolvedWallet = userRes.wallet;
    } catch (userErr: any) {
      console.error("Prisma Deposit Error (User Resolution):", userErr);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to resolve user account in database: ${userErr?.message || "Unknown user error"}`,
        },
        { status: 500 }
      );
    }

    const txStatus = status === "APPROVED" ? "APPROVED" : "PENDING";
    const approvedBy = txStatus === "APPROVED" ? (autoCredit ? "SYSTEM_AUTO" : "ADMIN") : null;

    // 2. Insert Transaction record in Neon PostgreSQL
    let transaction;
    try {
      transaction = await prisma.transaction.create({
        data: {
          userId: resolvedUser.id,
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
        currency: transaction.currency,
        status: transaction.status,
        utrNumber: transaction.utrNumber,
      });
    } catch (txErr: any) {
      console.error("Prisma Deposit Error:", txErr);
      return NextResponse.json(
        {
          success: false,
          error: `Database transaction insert failed: ${txErr?.message || "Prisma Transaction Error"}`,
        },
        { status: 500 }
      );
    }

    // 3. Update Wallet balance if approved or autoCredit
    let updatedWallet = resolvedWallet;
    if (autoCredit || txStatus === "APPROVED") {
      try {
        updatedWallet = await prisma.wallet.update({
          where: { id: resolvedWallet.id },
          data: {
            balance: { increment: numericAmount },
            totalDeposited: { increment: numericAmount },
          },
        });
        console.log("[Deposit API] Wallet balance updated:", {
          walletId: updatedWallet.id,
          newBalance: Number(updatedWallet.balance),
        });
      } catch (walletErr: any) {
        console.error("Prisma Deposit Error (Wallet Balance Update):", walletErr);
        // Note: Transaction record was already created, don't crash deposit
      }
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
    console.error("Prisma Deposit Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Internal server error occurred while processing deposit",
      },
      { status: 500 }
    );
  }
}
