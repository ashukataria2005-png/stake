import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/dbUser";
import { getTierMilestoneReward } from "@/lib/vip";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId = "guest_player", action, tier, amount } = body;

    const { user, wallet } = await getOrCreateUser(userId);

    if (action === "rakeback") {
      const claimAmount = Math.max(0, Number(amount || 0));
      if (claimAmount <= 0) {
        return NextResponse.json({
          success: false,
          error: "No claimable rakeback available at this time.",
        }, { status: 400 });
      }

      // Atomically credit rakeback to primary wallet
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
            method: "VIP_RAKEBACK",
            txHash: `rakeback-${Date.now()}`,
          },
        });
      } catch (txErr) {
        console.warn("Could not record rakeback tx:", txErr);
      }

      return NextResponse.json({
        success: true,
        action: "rakeback",
        claimedAmount: claimAmount,
        newBalance: Number(updatedWallet.balance),
      });
    }

    if (action === "levelup") {
      const tierName = String(tier || "").trim();
      const milestoneBonus = getTierMilestoneReward(tierName);

      if (milestoneBonus <= 0) {
        return NextResponse.json({
          success: false,
          error: "No milestone reward configured for this VIP tier.",
        }, { status: 400 });
      }

      // Atomically credit level-up reward
      const updatedWallet = await prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { increment: milestoneBonus },
        },
      });

      // Record transaction
      try {
        await prisma.transaction.create({
          data: {
            userId: user.id,
            type: "DEPOSIT",
            amount: milestoneBonus,
            currency: wallet.currency || "INR",
            status: "APPROVED",
            method: `VIP_LEVEL_UP_${tierName.toUpperCase()}`,
            txHash: `levelup-${tierName}-${Date.now()}`,
          },
        });
      } catch (txErr) {
        console.warn("Could not record level-up tx:", txErr);
      }

      return NextResponse.json({
        success: true,
        action: "levelup",
        tier: tierName,
        rewardAmount: milestoneBonus,
        newBalance: Number(updatedWallet.balance),
      });
    }

    return NextResponse.json({ success: false, error: "Invalid perk action." }, { status: 400 });
  } catch (error: any) {
    console.error("Error in /api/wallet/claim-perks:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
