import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getLoggedInAdmin } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  try {
    const admin = await getLoggedInAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { transactionId } = body;

    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: "Missing required transactionId" },
        { status: 400 }
      );
    }

    // 1. Fetch current transaction
    const targetTx = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        user: {
          include: {
            wallets: true,
          },
        },
      },
    });

    if (!targetTx) {
      return NextResponse.json(
        { success: false, error: `Transaction ${transactionId} not found` },
        { status: 404 }
      );
    }

    if (targetTx.status !== "PENDING") {
      return NextResponse.json(
        {
          success: false,
          error: `Transaction is already ${targetTx.status}. Only PENDING transactions can be approved.`,
        },
        { status: 400 }
      );
    }

    const txAmount = targetTx.amount;
    const txCurrency = (targetTx.currency || "INR").toUpperCase();
    const now = new Date();

    // 2. Execute Atomic Prisma Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Step A: Update Transaction status
      const updatedTx = await tx.transaction.update({
        where: { id: targetTx.id },
        data: {
          status: "APPROVED",
          approvedAt: now,
          approvedBy: admin.username || "SUPER_ADMIN",
          rejectionReason: null,
        },
      });

      // Step B: Update user Wallet balance based on transaction type
      let updatedWallet;
      if (targetTx.type === "DEPOSIT") {
        // Increment wallet balance for deposits - robust match on currency
        let existingWallet = await tx.wallet.findFirst({
          where: {
            userId: targetTx.userId,
            OR: [
              { currency: txCurrency },
              { currency: txCurrency.toLowerCase() },
              { currency: "INR" },
            ],
          },
        });

        if (existingWallet) {
          updatedWallet = await tx.wallet.update({
            where: { id: existingWallet.id },
            data: {
              balance: { increment: txAmount },
              totalDeposited: { increment: txAmount },
            },
          });
        } else {
          updatedWallet = await tx.wallet.create({
            data: {
              userId: targetTx.userId,
              currency: txCurrency,
              balance: txAmount,
              totalDeposited: txAmount,
            },
          });
        }

        console.log(`[Approve API] Deposit approved for user ${targetTx.userId}. Credited: ₹${Number(txAmount)}. New balance: ₹${Number(updatedWallet.balance)}`);
      } else {
        // For WITHDRAWALS: Balance was already decremented upon withdrawal request.
        // Retrieve latest wallet and guarantee non-negative balance.
        updatedWallet = await tx.wallet.findFirst({
          where: {
            userId: targetTx.userId,
            OR: [
              { currency: txCurrency },
              { currency: txCurrency.toLowerCase() },
              { currency: "INR" },
            ],
          },
        });

        if (updatedWallet && Number(updatedWallet.balance) < 0) {
          updatedWallet = await tx.wallet.update({
            where: { id: updatedWallet.id },
            data: { balance: 0 },
          });
        }
      }

      return {
        transaction: updatedTx,
        wallet: updatedWallet,
      };
    });

    return NextResponse.json({
      success: true,
      message: `Transaction ${transactionId} successfully approved.`,
      transaction: {
        id: result.transaction.id,
        status: result.transaction.status,
        approvedAt: result.transaction.approvedAt?.toISOString(),
        approvedBy: result.transaction.approvedBy,
      },
      wallet: result.wallet
        ? {
            id: result.wallet.id,
            currency: result.wallet.currency,
            balance: Number(result.wallet.balance),
          }
        : null,
    });
  } catch (error: any) {
    console.error("[Admin Transactions Approve Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to approve transaction" },
      { status: 500 }
    );
  }
}
