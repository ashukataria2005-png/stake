import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getLoggedInAdmin } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  try {
    const admin = await getLoggedInAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userId, amount, mode = "ADD", remarks = "" } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: "Missing userId" }, { status: 400 });
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ success: false, error: "Amount must be a positive number" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { wallets: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const primaryWallet = user.wallets[0];
    const currency = primaryWallet?.currency || "INR";

    const result = await prisma.$transaction(async (tx) => {
      // 1. Get or create wallet
      let wallet = await tx.wallet.findUnique({
        where: {
          userId_currency: {
            userId: user.id,
            currency,
          },
        },
      });

      if (!wallet) {
        wallet = await tx.wallet.create({
          data: {
            userId: user.id,
            currency,
            balance: mode === "ADD" ? numericAmount : 0,
          },
        });
      } else {
        const delta = mode === "ADD" ? numericAmount : -numericAmount;
        const currentBal = Number(wallet.balance);
        if (mode === "DEDUCT" && currentBal < numericAmount) {
          throw new Error(`Cannot deduct ₹${numericAmount}. Current balance is ₹${currentBal}.`);
        }

        wallet = await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: { increment: delta },
          },
        });
      }

      // 2. Create Audit Transaction Record
      const auditTx = await tx.transaction.create({
        data: {
          userId: user.id,
          type: mode === "ADD" ? "DEPOSIT" : "WITHDRAWAL",
          amount: numericAmount,
          currency,
          status: "APPROVED",
          approvedBy: `ADMIN (${admin.username})`,
          approvedAt: new Date(),
          method: "MANUAL_ADJUSTMENT",
          txHash: `ADMIN_OVERRIDE_${Date.now()}`,
          rejectionReason: remarks ? `Remarks: ${remarks}` : `Manual admin ${mode.toLowerCase()}`,
        },
      });

      return { wallet, auditTx };
    });

    return NextResponse.json({
      success: true,
      message: `Successfully ${mode === "ADD" ? "credited" : "deducted"} ₹${numericAmount} for user @${user.username}.`,
      newBalance: Number(result.wallet.balance),
      currency: result.wallet.currency,
    });
  } catch (err: any) {
    console.error("[Admin Balance Update Error]:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to update balance" },
      { status: 500 }
    );
  }
}
