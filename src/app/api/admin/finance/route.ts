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

    const [
      approvedDepositsAgg,
      approvedWithdrawalsAgg,
      walletsAgg,
      allBets,
      usersWithWallets,
    ] = await Promise.all([
      prisma.transaction.aggregate({
        where: { status: "APPROVED", type: "DEPOSIT" },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { status: "APPROVED", type: "WITHDRAWAL" },
        _sum: { amount: true },
      }),
      prisma.wallet.aggregate({
        _sum: { balance: true, totalWagered: true },
      }),
      // Fetch bets for game-wise turnover & payout breakdown
      prisma.bet.findMany({
        select: {
          gameSlug: true,
          amount: true,
          payout: true,
        },
        take: 1000,
      }),
      // Fetch users for player risk / imbalance desk
      prisma.user.findMany({
        select: {
          id: true,
          username: true,
          phone: true,
          wallets: {
            select: {
              balance: true,
              totalDeposited: true,
              totalWithdrawn: true,
              totalWagered: true,
            },
          },
        },
        take: 150,
      }),
    ]);

    const totalGrossDeposits = Number(approvedDepositsAgg._sum.amount || 0);
    const totalGrossWithdrawals = Number(approvedWithdrawalsAgg._sum.amount || 0);
    const netPlatformProfit = totalGrossDeposits - totalGrossWithdrawals;
    const netProfitMargin =
      totalGrossDeposits > 0
        ? parseFloat(((netPlatformProfit / totalGrossDeposits) * 100).toFixed(2))
        : 0;

    // Aggregate game-wise stats
    const gameMap: Record<string, { turnover: number; payout: number; betsCount: number }> = {};
    const defaultGameList = ["Mines", "Crash", "Dice", "Limbo", "Plinko", "Roulette", "Blackjack", "Keno", "Wheel"];
    defaultGameList.forEach((g) => {
      gameMap[g.toLowerCase()] = { turnover: 0, payout: 0, betsCount: 0 };
    });

    allBets.forEach((b) => {
      const slug = (b.gameSlug || "unknown").toLowerCase();
      if (!gameMap[slug]) {
        gameMap[slug] = { turnover: 0, payout: 0, betsCount: 0 };
      }
      const amt = Number(b.amount || 0);
      const pay = Number(b.payout || 0);
      gameMap[slug].turnover += amt;
      gameMap[slug].payout += pay;
      gameMap[slug].betsCount += 1;
    });

    const gameStats = Object.keys(gameMap).map((slug) => {
      const stat = gameMap[slug];
      const houseProfit = stat.turnover - stat.payout;
      const margin = stat.turnover > 0 ? parseFloat(((houseProfit / stat.turnover) * 100).toFixed(2)) : 0;
      return {
        gameSlug: slug.toUpperCase(),
        turnover: stat.turnover,
        payout: stat.payout,
        houseProfit,
        margin,
        betsCount: stat.betsCount,
      };
    });

    // Player Risk Table: flag players where deposits are low but wins/withdrawals or balance are disproportionately high
    const playerRiskList = usersWithWallets.map((u) => {
      const w = u.wallets[0];
      const dep = w ? Number(w.totalDeposited) : 0;
      const wdr = w ? Number(w.totalWithdrawn) : 0;
      const bal = w ? Number(w.balance) : 0;
      const netGain = wdr + bal - dep;
      const isHighMarginWinner = (wdr > dep * 2 && wdr > 5000) || (bal > 20000 && dep < 5000);

      return {
        id: u.id,
        username: u.username,
        phone: u.phone,
        totalDeposited: dep,
        totalWithdrawn: wdr,
        currentBalance: bal,
        netGain,
        isFlagged: isHighMarginWinner,
        riskLevel: isHighMarginWinner ? "HIGH_MARGIN_WINNER" : "NORMAL",
      };
    });

    // Sort risk list with flagged players on top
    playerRiskList.sort((a, b) => (b.isFlagged ? 1 : 0) - (a.isFlagged ? 1 : 0) || b.netGain - a.netGain);

    return NextResponse.json({
      success: true,
      data: {
        totalGrossDeposits,
        totalGrossWithdrawals,
        netPlatformProfit,
        netProfitMargin,
        totalWalletsBalance: Number(walletsAgg._sum.balance || 0),
        totalTurnover: Number(walletsAgg._sum.totalWagered || 0),
        gameStats,
        playerRiskList: playerRiskList.slice(0, 50),
      },
    });
  } catch (err: any) {
    console.error("[Admin Finance API Error]:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to fetch financial data" },
      { status: 500 }
    );
  }
}
