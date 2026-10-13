import crypto from "crypto";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth";
export { hashPassword, verifyPassword };

export const ADMIN_COOKIE_NAME = "stake_admin_token";
const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET || "stake_super_admin_secret_key_2026_!@#";

export interface AdminPayload {
  id: string;
  username: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Sign an admin session token
 */
export function signAdminToken(admin: { id: string; username: string; role: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const payload: AdminPayload = {
    id: admin.id,
    username: admin.username,
    role: admin.role,
    iat: now,
    exp: now + 60 * 60 * 24 * 7, // 7 days
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", ADMIN_SECRET)
    .update(`${header}.${body}`)
    .digest("base64url");
  return `${header}.${body}.${signature}`;
}

/**
 * Verify an admin session token
 */
export function verifyAdminToken(token: string): AdminPayload | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;

  const expectedSignature = crypto
    .createHmac("sha256", ADMIN_SECRET)
    .update(`${header}.${body}`)
    .digest("base64url");

  if (signature !== expectedSignature) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf-8")) as AdminPayload;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Get the currently logged-in admin from cookies (Server Component / Route Handler)
 */
export async function getLoggedInAdmin(): Promise<AdminPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyAdminToken(token);
  } catch {
    return null;
  }
}

/**
 * Ensures at least one initial Super Admin exists in Neon PostgreSQL
 */
export async function ensureInitialAdmin(): Promise<{ username: string; isNew: boolean }> {
  try {
    const existing = await prisma.adminUser.findFirst();
    if (existing) {
      return { username: existing.username, isNew: false };
    }

    const defaultUsername = "admin";
    const defaultPassword = process.env.INITIAL_ADMIN_PASSWORD || "admin123";
    const hashedPassword = hashPassword(defaultPassword);

    const newAdmin = await prisma.adminUser.create({
      data: {
        username: defaultUsername,
        passwordHash: hashedPassword,
        role: "SUPER_ADMIN",
      },
    });

    console.log(`[Admin Bootstrap] Initial super admin created in Neon DB: ${newAdmin.username}`);
    return { username: newAdmin.username, isNew: true };
  } catch (err) {
    console.error("[Admin Bootstrap Error]:", err);
    throw err;
  }
}
