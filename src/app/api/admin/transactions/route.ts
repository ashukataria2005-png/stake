import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getLoggedInAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  try {
    const admin = await getLoggedInAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status")?.toUpperCase() || "ALL";
    const typeParam = searchParams.get("type")?.toUpperCase() || "ALL";
    const search = searchParams.get("search")?.trim() || "";

    // Build Prisma where filter
    const whereClause: any = {};

    if (statusParam && statusParam !== "ALL") {
      whereClause.status = statusParam;
    }

    if (typeParam && typeParam !== "ALL") {
      whereClause.type = typeParam;
    }

    if (search) {
      whereClause.OR = [
        { id: { contains: search, mode: "insensitive" } },
        { utrNumber: { contains: search, mode: "insensitive" } },
        { txHash: { contains: search, mode: "insensitive" } },
        {
          user: {
            OR: [
              { username: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    // Fetch transactions with user & wallet relations
    const [transactions, pendingCount, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              phone: true,
              wallets: {
                select: {
                  currency: true,
                  balance: true,
                  lockedBalance: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 200,
      }),
      prisma.transaction.count({
        where: { status: "PENDING" },
      }),
      prisma.transaction.count(),
    ]);

    // Format for clean client payload
    const formatted = transactions.map((tx) => {
      // Find matching wallet or first wallet
      const userWallet =
        tx.user?.wallets?.find((w) => w.currency === tx.currency) ||
        tx.user?.wallets?.[0] ||
        null;

      return {
        id: tx.id,
        userId: tx.userId,
        type: tx.type, // "DEPOSIT" | "WITHDRAWAL"
        amount: Number(tx.amount),
        currency: tx.currency,
        utrNumber: tx.utrNumber,
        screenshotUrl: tx.screenshotUrl,
        status: tx.status, // "PENDING" | "APPROVED" | "REJECTED"
        approvedBy: tx.approvedBy,
        approvedAt: tx.approvedAt ? tx.approvedAt.toISOString() : null,
        rejectionReason: tx.rejectionReason,
        isLateSubmission: Boolean(tx.isLateSubmission),
        method: tx.method,
        txHash: tx.txHash,
        createdAt: tx.createdAt.toISOString(),
        updatedAt: tx.updatedAt.toISOString(),
        user: {
          id: tx.user?.id || tx.userId,
          username: tx.user?.username || "unknown",
          email: tx.user?.email || null,
          phone: tx.user?.phone || null,
          currentBalance: userWallet ? Number(userWallet.balance) : 0,
          currency: userWallet?.currency || tx.currency || "INR",
        },
      };
    });

    return NextResponse.json({
      success: true,
      transactions: formatted,
      counts: {
        pending: pendingCount,
        total: totalCount,
      },
    });
  } catch (error: any) {
    console.error("[Admin Transactions GET Error]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch admin transactions" },
      { status: 500 }
    );
  }
}
