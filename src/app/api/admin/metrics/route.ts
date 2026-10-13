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

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      todayUsers,
      pendingDepositsCount,
      pendingWithdrawalsCount,
      approvedDepositsAggregate,
      todayApprovedDepositsAggregate,
      approvedWithdrawalsAggregate,
      todayApprovedWithdrawalsAggregate,
      walletBalanceAggregate,
      totalWageredAggregate,
      betsCount,
      activeGamesCount,
      recentTransactions,
    ] = await Promise.all([
      // 1. Total Registered Users
      prisma.user.count(),

      // 2. Today's Joined Users
      prisma.user.count({
        where: { createdAt: { gte: startOfToday } },
      }),

      // 3. Pending Deposits Count
      prisma.transaction.count({
        where: { status: "PENDING", type: "DEPOSIT" },
      }),

      // 4. Pending Withdrawals Count
      prisma.transaction.count({
        where: { status: "PENDING", type: "WITHDRAWAL" },
      }),

      // 5. Total Approved Deposits Volume
      prisma.transaction.aggregate({
        where: { status: "APPROVED", type: "DEPOSIT" },
        _sum: { amount: true },
      }),

      // 6. Today's Approved Deposits Volume
      prisma.transaction.aggregate({
        where: { status: "APPROVED", type: "DEPOSIT", createdAt: { gte: startOfToday } },
        _sum: { amount: true },
      }),

      // 7. Total Approved Withdrawals Volume
      prisma.transaction.aggregate({
        where: { status: "APPROVED", type: "WITHDRAWAL" },
        _sum: { amount: true },
      }),

      // 8. Today's Approved Withdrawals Volume
      prisma.transaction.aggregate({
        where: { status: "APPROVED", type: "WITHDRAWAL", createdAt: { gte: startOfToday } },
        _sum: { amount: true },
      }),

      // 9. Total Wallets Balance Volume across all players
      prisma.wallet.aggregate({
        _sum: { balance: true },
      }),

      // 10. Total Turnover (Wagered volume)
      prisma.wallet.aggregate({
        _sum: { totalWagered: true },
      }),

      // 11. Total Bets Placed
      prisma.bet.count(),

      // 12. Active Games Count
      prisma.gameControl.count({
        where: { isActive: true },
      }),

      // 13. Recent Transactions Feed
      prisma.transaction.findMany({
        take: 10,
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
      }),
    ]);

    const totalDepositsVolume = Number(approvedDepositsAggregate._sum.amount || 0);
    const todayDepositsVolume = Number(todayApprovedDepositsAggregate._sum.amount || 0);
    const totalWithdrawalsVolume = Number(approvedWithdrawalsAggregate._sum.amount || 0);
    const todayWithdrawalsVolume = Number(todayApprovedWithdrawalsAggregate._sum.amount || 0);
    const totalWalletsBalance = Number(walletBalanceAggregate._sum.balance || 0);
    const totalTurnover = Number(totalWageredAggregate._sum.totalWagered || 0);
    const totalRevenue = totalDepositsVolume - totalWithdrawalsVolume;
    const todayRevenue = todayDepositsVolume - todayWithdrawalsVolume;

    return NextResponse.json({
      success: true,
      metrics: {
        totalUsers,
        todayUsers,
        pendingDepositsCount,
        pendingWithdrawalsCount,
        pendingTotalCount: pendingDepositsCount + pendingWithdrawalsCount,
        totalDepositsVolume,
        todayDepositsVolume,
        totalWithdrawalsVolume,
        todayWithdrawalsVolume,
        totalWalletsBalance,
        totalTurnover,
        totalRevenue,
        todayRevenue,
        totalBetsCount: betsCount,
        activeGamesCount: activeGamesCount || 12,
      },
      recentTransactions: recentTransactions.map((tx) => ({
        id: tx.id,
        username: tx.user?.username || "Player",
        email: tx.user?.email || null,
        phone: tx.user?.phone || null,
        type: tx.type,
        amount: Number(tx.amount),
        currency: tx.currency,
        utrNumber: tx.utrNumber,
        status: tx.status,
        method: tx.method,
        isLateSubmission: Boolean(tx.isLateSubmission),
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
