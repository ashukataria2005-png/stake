import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/dbUser";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, username, rainId, amount } = body;

    const claimAmount = Number(amount);
    if (!claimAmount || isNaN(claimAmount) || claimAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid rain claim amount." },
        { status: 400 }
      );
    }

    const userLookup = userId || username || "guest_player";
    const { user, wallet } = await getOrCreateUser(userLookup);

    // Atomically increment user wallet balance
    const updatedWallet = await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: { increment: claimAmount },
      },
    });

    // Record transaction
    try {
      await prisma.transaction.create({
        data: {
          userId: user.id,
          type: "DEPOSIT",
          amount: claimAmount,
          currency: wallet.currency || "INR",
          status: "APPROVED",
          method: "CHAT_RAIN_CLAIM",
          txHash: `rain-${rainId || "global"}-${Date.now()}`,
        },
      });
    } catch (txErr) {
      console.warn("Could not record rain claim tx:", txErr);
    }

    return NextResponse.json({
      success: true,
      rainId,
      claimedAmount: claimAmount,
      newBalance: Number(updatedWallet.balance),
    });
  } catch (error: any) {
    console.error("Error in /api/chat/rain:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to claim rain." },
      { status: 500 }
    );
  }
}
