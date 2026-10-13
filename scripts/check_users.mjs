import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: { wallets: true },
  });
  console.log(`Found ${users.length} users:`);
  for (const u of users) {
    console.log(`User: ${u.username} (${u.id})`);
    for (const w of u.wallets) {
      console.log(`  Wallet: ${w.currency} = ${w.balance}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
