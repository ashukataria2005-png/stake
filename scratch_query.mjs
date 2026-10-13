import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: { wallets: true },
    take: 20,
    orderBy: { createdAt: "desc" },
  });
  console.log("USERS AND WALLETS:");
  for (const u of users) {
    console.log(`User: ${u.username} (${u.id}), Email: ${u.email}, Role: ${u.role}`);
    for (const w of u.wallets) {
      console.log(`  Wallet: ${w.currency} = ${w.balance}`);
    }
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
