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
    const { transactionId, reason } = body;

    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: "Missing required transactionId" },
        { status: 400 }
      );
    }

    // 1. Fetch current transaction
    const targetTx = await prisma.transaction.findUnique({
      where: { id: transactionId },
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
          error: `Transaction is already ${targetTx.status}. Only PENDING transactions can be rejected.`,
        },
        { status: 400 }
      );
    }

    const txAmount = targetTx.amount;
    const txCurrency = targetTx.currency || "INR";
    const rejectionNote = reason?.trim() || "Rejected by administrator";

    // 2. Execute Atomic Prisma Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Step A: Mark transaction as REJECTED
      const updatedTx = await tx.transaction.update({
        where: { id: targetTx.id },
        data: {
          status: "REJECTED",
          rejectionReason: rejectionNote,
          approvedBy: admin.username || "SUPER_ADMIN",
        },
      });

      // Step B: If WITHDRAWAL, refund amount back to user's wallet
      let updatedWallet = null;
      if (targetTx.type === "WITHDRAWAL") {
        const existingWallet = await tx.wallet.findUnique({
          where: {
            userId_currency: {
              userId: targetTx.userId,
              currency: txCurrency,
            },
          },
        });

        if (existingWallet) {
          updatedWallet = await tx.wallet.update({
            where: { id: existingWallet.id },
            data: {
              balance: { increment: txAmount },
              totalWithdrawn: { decrement: txAmount },
            },
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
      message: `Transaction ${transactionId} has been rejected.`,
      transaction: {
        id: result.transaction.id,
        status: result.transaction.status,
        rejectionReason: result.transaction.rejectionReason,
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
    console.error("[Admin Transactions Reject Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to reject transaction" },
      { status: 500 }
    );
  }
}
