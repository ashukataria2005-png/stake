import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { signAdminToken, ensureInitialAdmin, ADMIN_COOKIE_NAME } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON payload" }, { status: 400 });
    }

    const { username, password } = body;
    const cleanUsername = typeof username === "string" ? username.trim() : "";
    const cleanPassword = typeof password === "string" ? password : "";

    if (!cleanUsername || !cleanPassword) {
      return NextResponse.json(
        { success: false, error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Ensure bootstrap admin exists
    await ensureInitialAdmin().catch(() => {});

    // Look up admin in Neon PostgreSQL
    const admin = await prisma.adminUser.findFirst({
      where: {
        username: {
          equals: cleanUsername,
          mode: "insensitive",
        },
      },
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Invalid admin credentials" },
        { status: 401 }
      );
    }

    // Verify hashed password
    const isPasswordValid = verifyPassword(cleanPassword, admin.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Invalid admin credentials" },
        { status: 401 }
      );
    }

    // Generate signed admin session token
    const token = signAdminToken({
      id: admin.id,
      username: admin.username,
      role: admin.role,
    });

    const response = NextResponse.json({
      success: true,
      message: "Admin authentication successful",
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
      },
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    console.log(`[Admin Auth] Successful login for: ${admin.username} (${admin.role})`);
    return response;
  } catch (err: any) {
    console.error("[Admin Login API Error]:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
