import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/dbUser";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      senderId,
      senderUsername,
      recipientUsername,
      amount,
    } = body;

    const tipAmount = Number(amount);
    if (!tipAmount || isNaN(tipAmount) || tipAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid tip amount." },
        { status: 400 }
      );
    }

    const cleanRecipient = String(recipientUsername || "")
      .replace(/^@/, "")
      .trim();

    if (!cleanRecipient) {
      return NextResponse.json(
        { success: false, error: "Recipient username is required." },
        { status: 400 }
      );
    }

    // 1. Resolve Sender
    const senderLookup = senderId || senderUsername || "guest_player";
    const { user: senderUser, wallet: senderWallet } = await getOrCreateUser(senderLookup);

    if (
      senderUser.username?.toLowerCase() === cleanRecipient.toLowerCase() ||
      senderUser.id === cleanRecipient
    ) {
      return NextResponse.json(
        { success: false, error: "You cannot tip yourself." },
        { status: 400 }
      );
    }

    // Check balance
    const currentSenderBalance = Number(senderWallet.balance);
    if (currentSenderBalance < tipAmount) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient balance (₹${currentSenderBalance.toFixed(2)}). Needed: ₹${tipAmount.toFixed(2)}`,
        },
        { status: 400 }
      );
    }

    // 2. Resolve Recipient
    const { user: recipientUser, wallet: recipientWallet } = await getOrCreateUser({
      username: cleanRecipient,
    });

    // 3. Atomically transfer tip via Prisma transaction
    const [updatedSenderWallet, updatedRecipientWallet] = await prisma.$transaction([
      prisma.wallet.update({
        where: { id: senderWallet.id },
        data: {
          balance: { decrement: tipAmount },
        },
      }),
      prisma.wallet.update({
        where: { id: recipientWallet.id },
        data: {
          balance: { increment: tipAmount },
        },
      }),
      prisma.transaction.create({
        data: {
          userId: senderUser.id,
          type: "WITHDRAWAL",
          amount: tipAmount,
          currency: senderWallet.currency || "INR",
          status: "APPROVED",
          method: "CHAT_TIP_SENT",
          txHash: `tip-send-${Date.now()}`,
        },
      }),
      prisma.transaction.create({
        data: {
          userId: recipientUser.id,
          type: "DEPOSIT",
          amount: tipAmount,
          currency: recipientWallet.currency || "INR",
          status: "APPROVED",
          method: "CHAT_TIP_RECEIVED",
          txHash: `tip-recv-${Date.now()}`,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      amount: tipAmount,
      senderUsername: senderUser.username || "You",
      recipientUsername: recipientUser.username,
      newSenderBalance: Number(updatedSenderWallet.balance),
    });
  } catch (error: any) {
    console.error("Error in /api/chat/tip:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to process tip transfer." },
      { status: 500 }
    );
  }
}
