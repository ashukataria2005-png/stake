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
        _count: {
          select: {
            transactions: true,
            bets: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const formatted = users.map((u) => {
      const primaryWallet = u.wallets[0] || null;
      return {
        id: u.id,
        username: u.username,
        email: u.email,
        phone: u.phone,
        role: u.role,
        luckMode: u.luckMode,
        walletBalance: primaryWallet ? Number(primaryWallet.balance) : 0,
        currency: primaryWallet ? primaryWallet.currency : "INR",
        totalDeposited: primaryWallet ? Number(primaryWallet.totalDeposited) : 0,
        totalWithdrawn: primaryWallet ? Number(primaryWallet.totalWithdrawn) : 0,
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
