import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId")?.trim();
    const username = searchParams.get("username")?.trim();

    console.log("[Transactions API] Fetching transactions for:", { userId, username });

    let targetUserId: string | null = null;

    if (userId) {
      const user = await prisma.user.findFirst({
        where: {
          OR: [{ id: userId }, { username: userId }],
        },
        select: { id: true },
      });
      if (user) targetUserId = user.id;
    }

    if (!targetUserId && username) {
      const user = await prisma.user.findFirst({
        where: {
          username: {
            equals: username,
            mode: "insensitive",
          },
        },
        select: { id: true },
      });
      if (user) targetUserId = user.id;
    }

    if (!targetUserId) {
      // Fallback: look for the most recently active or created user
      const latestUser = await prisma.user.findFirst({
        orderBy: { createdAt: "desc" },
        select: { id: true },
      });
      if (latestUser) targetUserId = latestUser.id;
    }

    if (!targetUserId) {
      return NextResponse.json({
        success: true,
        transactions: [],
      });
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId: targetUserId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const formatted = transactions.map((tx) => ({
      id: tx.id,
      userId: tx.userId,
      type: tx.type, // "DEPOSIT" | "WITHDRAWAL"
      amount: Number(tx.amount),
      currency: tx.currency,
      utrNumber: tx.utrNumber,
      screenshotUrl: tx.screenshotUrl,
      method: tx.method,
      status: tx.status, // "PENDING" | "APPROVED" | "REJECTED"
      createdAt: tx.createdAt.toISOString(),
      updatedAt: tx.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      transactions: formatted,
    });
  } catch (error: any) {
    console.error("[Transactions API Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
