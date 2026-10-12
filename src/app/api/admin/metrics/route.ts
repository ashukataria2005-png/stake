import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getLoggedInAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const admin = await getLoggedInAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // 1. Total Registered Users
    const totalUsers = await prisma.user.count();

    // 2. Pending Deposits Count
    const pendingDepositsCount = await prisma.transaction.count({
      where: {
        status: "PENDING",
        type: "DEPOSIT",
      },
    });

    // 3. Pending Withdrawals Count
    const pendingWithdrawalsCount = await prisma.transaction.count({
      where: {
        status: "PENDING",
        type: "WITHDRAWAL",
      },
    });

    // 4. Total Deposits Volume (Sum of APPROVED deposits)
    const approvedDepositsAggregate = await prisma.transaction.aggregate({
      where: {
        status: "APPROVED",
        type: "DEPOSIT",
      },
      _sum: {
        amount: true,
      },
    });
    const totalDepositsVolume = Number(approvedDepositsAggregate._sum.amount || 0);

    // 5. Total Wallets Balance Volume
    const walletBalanceAggregate = await prisma.wallet.aggregate({
      _sum: {
        balance: true,
      },
    });
    const totalWalletsBalance = Number(walletBalanceAggregate._sum.balance || 0);

    // 6. Recent 5 Transactions
    const recentTransactions = await prisma.transaction.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            username: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      metrics: {
        totalUsers,
        pendingDepositsCount,
        pendingWithdrawalsCount,
        totalDepositsVolume,
        totalWalletsBalance,
      },
      recentTransactions: recentTransactions.map((tx) => ({
        id: tx.id,
        username: tx.user?.username || "Player",
        type: tx.type,
        amount: Number(tx.amount),
        currency: tx.currency,
        utrNumber: tx.utrNumber,
        status: tx.status,
        method: tx.method,
        createdAt: tx.createdAt.toISOString(),
      })),
    });
  } catch (err: any) {
    console.error("[Admin Metrics API Error]:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
