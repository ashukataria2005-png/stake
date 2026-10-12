import prisma from "@/lib/prisma";

export interface UserLookupOptions {
  userId?: string | null;
  username?: string | null;
  email?: string | null;
}

/**
 * Resolves an existing user in Neon PostgreSQL by ID, username, or email.
 * If the user does not exist, safely creates them and ensures INR & USD wallets exist.
 * Uses atomic upsert for wallets to guarantee ZERO unique constraint collisions.
 */
export async function getOrCreateUser(
  identifier?: string | null | UserLookupOptions,
  emailHint?: string | null,
  usernameHint?: string | null
) {
  let searchId: string | null = null;
  let searchUsername: string | null = null;
  let searchEmail: string | null = null;

  if (identifier && typeof identifier === "object") {
    searchId = identifier.userId?.trim() || null;
    searchUsername = identifier.username?.trim() || null;
    searchEmail = identifier.email?.trim() || null;
  } else if (typeof identifier === "string") {
    searchId = identifier.trim() || null;
  }

  if (emailHint && emailHint.trim()) searchEmail = emailHint.trim();
  if (usernameHint && usernameHint.trim()) searchUsername = usernameHint.trim();

  // If searchId looks like an email, use it as email too
  if (searchId && searchId.includes("@") && !searchEmail) {
    searchEmail = searchId;
  }

  const primarySearchKey = searchId || searchUsername || searchEmail || "guest_player";

  console.log("[dbUser] Resolving user:", {
    searchId,
    searchUsername,
    searchEmail,
    primarySearchKey,
  });

  try {
    // 1. Try to find existing user by ID, username, or email
    const orConditions: any[] = [];
    if (searchId) orConditions.push({ id: searchId });
    if (searchUsername) orConditions.push({ username: searchUsername });
    if (searchEmail) orConditions.push({ email: searchEmail });
    if (primarySearchKey) {
      orConditions.push({ username: primarySearchKey });
      orConditions.push({ email: primarySearchKey });
    }

    let user = await prisma.user.findFirst({
      where: {
        OR: orConditions,
      },
      include: {
        wallets: true,
      },
    });

    // 2. If not found, create new user safely
    if (!user) {
      const cleanUsername = (searchUsername || primarySearchKey)
        .replace(/[^a-zA-Z0-9_]/g, "_")
        .slice(0, 30) || `user_${Date.now()}`;

      const cleanEmail = searchEmail || `${cleanUsername}@stake.internal`;

      console.log("[dbUser] Creating new user record:", {
        cleanUsername,
        cleanEmail,
      });

      try {
        user = await prisma.user.create({
          data: {
            username: cleanUsername,
            email: cleanEmail,
            role: "USER",
            luckMode: "NO_CONTROL",
          },
          include: {
            wallets: true,
          },
        });
      } catch (createErr: any) {
        console.warn("[dbUser] Initial user.create collided, fetching existing record:", createErr?.message);
        // If collision happened (username or email already taken), fetch existing user
        user = await prisma.user.findFirst({
          where: {
            OR: [
              { username: cleanUsername },
              { email: cleanEmail },
            ],
          },
          include: {
            wallets: true,
          },
        });

        if (!user) {
          // If still not found, create with guaranteed unique credentials
          const uniqueUsername = `${cleanUsername.slice(0, 20)}_${Date.now().toString().slice(-6)}`;
          const uniqueEmail = `${uniqueUsername}@stake.internal`;
          user = await prisma.user.create({
            data: {
              username: uniqueUsername,
              email: uniqueEmail,
              role: "USER",
              luckMode: "NO_CONTROL",
            },
            include: {
              wallets: true,
            },
          });
        }
      }
    }

    // 3. Ensure INR and USD wallets exist using atomic upsert (guaranteed 0 unique constraint collisions)
    const inrWallet = await prisma.wallet.upsert({
      where: {
        userId_currency: {
          userId: user.id,
          currency: "INR",
        },
      },
      update: {},
      create: {
        userId: user.id,
        currency: "INR",
        balance: 10000.0,
        totalDeposited: 10000.0,
      },
    });

    // Also ensure USD wallet exists
    await prisma.wallet.upsert({
      where: {
        userId_currency: {
          userId: user.id,
          currency: "USD",
        },
      },
      update: {},
      create: {
        userId: user.id,
        currency: "USD",
        balance: 115.6,
        totalDeposited: 115.6,
      },
    });

    console.log("[dbUser] User and wallet successfully resolved:", {
      userId: user.id,
      username: user.username,
      walletId: inrWallet.id,
      balance: Number(inrWallet.balance),
    });

    return { user, wallet: inrWallet };
  } catch (error: any) {
    console.error("[dbUser] Critical error in getOrCreateUser:", error);
    throw error;
  }
}
