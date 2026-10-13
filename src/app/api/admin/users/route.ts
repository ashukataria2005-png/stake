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

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";

    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { id: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        wallets: true,
        bets: {
          select: {
            amount: true,
            payout: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 200,
        },
        transactions: {
          select: {
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: {
          select: {
            transactions: true,
            bets: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 150,
    });

    const formatted = users.map((u) => {
      const primaryWallet = u.wallets[0] || null;
      const totalDep = primaryWallet ? Number(primaryWallet.totalDeposited) : 0;
      const totalWdr = primaryWallet ? Number(primaryWallet.totalWithdrawn) : 0;
      const netPL = totalWdr - totalDep; // From user perspective: positive means net won from casino

      let winCount = 0;
      u.bets.forEach((b) => {
        if (Number(b.payout) > Number(b.amount)) {
          winCount++;
        }
      });
      const winRate = u.bets.length > 0 ? Math.round((winCount / u.bets.length) * 100) : 0;

      // Last active date from latest bet or transaction or updatedAt
      const lastBetDate = u.bets[0]?.createdAt;
      const lastTxDate = u.transactions[0]?.createdAt;
      const lastActive = lastBetDate || lastTxDate || u.updatedAt || u.createdAt;

      return {
        id: u.id,
        username: u.username,
        email: u.email,
        phone: u.phone,
        role: u.role,
        luckMode: u.luckMode,
        walletBalance: primaryWallet ? Number(primaryWallet.balance) : 0,
        currency: primaryWallet ? primaryWallet.currency : "INR",
        totalDeposited: totalDep,
        totalWithdrawn: totalWdr,
        netPL,
        winRate,
        lastActive: new Date(lastActive).toISOString(),
        transactionsCount: u._count.transactions,
        betsCount: u._count.bets,
        createdAt: u.createdAt.toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      users: formatted,
      totalCount: formatted.length,
    });
  } catch (err: any) {
    console.error("[Admin Users API Error]:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}
