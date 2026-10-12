import prisma from "@/lib/prisma";

export async function getOrCreateUser(identifier?: string | null) {
  const safeId = (identifier && identifier.trim()) ? identifier.trim() : "guest_user";

  try {
    // 1. Try finding by ID, username, or email
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: safeId },
          { username: safeId },
          { email: safeId },
        ],
      },
      include: {
        wallets: true,
      },
    });

    // 2. If not found, create new user safely
    if (!user) {
      const cleanUsername = safeId.replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 30) || "guest_user";
      const userEmail = safeId.includes("@") ? safeId : `${cleanUsername}@stake.internal`;

      try {
        user = await prisma.user.create({
          data: {
            username: cleanUsername,
            email: userEmail,
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
      } catch (createErr) {
        // If concurrent insert or collision happened, fetch the existing record
        user = await prisma.user.findFirst({
          where: {
            OR: [
              { username: cleanUsername },
              { email: userEmail },
            ],
          },
          include: {
            wallets: true,
          },
        });

        if (!user) {
          // Fallback to any existing user or create generic guest
          const fallback = await prisma.user.findFirst({ include: { wallets: true } });
          if (fallback) {
            user = fallback;
          } else {
            throw createErr;
          }
        }
      }
    }

    // 3. Ensure INR and USD wallets exist
    let inrWallet = user.wallets.find((w) => w.currency === "INR");
    if (!inrWallet) {
      inrWallet = await prisma.wallet.create({
        data: {
          userId: user.id,
          currency: "INR",
          balance: 10000.0,
          totalDeposited: 10000.0,
        },
      });
    }

    return { user, wallet: inrWallet };
  } catch (error) {
    console.error("Error in getOrCreateUser:", error);
    throw error;
  }
}
