import prisma from "@/lib/prisma";

export async function getOrCreateUser(identifier: string = "demo_player") {
  try {
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ id: identifier }, { username: identifier }],
      },
      include: {
        wallets: true,
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          username: identifier,
          email: `${identifier}@stake.internal`,
          role: "USER",
          luckMode: "NO_CONTROL",
          wallets: {
            create: [
              {
                currency: "INR",
                balance: 10000.0,
                totalDeposited: 10000.0,
              },
              {
                currency: "USD",
                balance: 115.6,
                totalDeposited: 115.6,
              },
            ],
          },
        },
        include: {
          wallets: true,
        },
      });
    }

    let inrWallet = user.wallets.find((w) => w.currency === "INR");
    if (!inrWallet) {
      inrWallet = await prisma.wallet.create({
        data: {
          userId: user.id,
          currency: "INR",
          balance: 10000.0,
        },
      });
    }

    return { user, wallet: inrWallet };
  } catch (error) {
    console.error("Error in getOrCreateUser:", error);
    throw error;
  }
}
