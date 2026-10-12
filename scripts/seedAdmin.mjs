import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function seedAdmin() {
  try {
    const existing = await prisma.adminUser.findFirst();
    if (existing) {
      console.log(`[Seed Admin] Admin account already exists in Neon DB: ${existing.username} (Role: ${existing.role})`);
      process.exit(0);
    }

    const defaultUsername = "admin";
    const defaultPassword = process.env.INITIAL_ADMIN_PASSWORD || "admin123";
    const hashedPassword = hashPassword(defaultPassword);

    const admin = await prisma.adminUser.create({
      data: {
        username: defaultUsername,
        passwordHash: hashedPassword,
        role: "SUPER_ADMIN",
      },
    });

    console.log(`[Seed Admin] Successfully created initial Super Admin in Neon DB: ${admin.username} (Password: ${defaultPassword})`);
  } catch (err) {
    console.error("[Seed Admin Error]:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();
