import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON request payload" }, { status: 400 });
    }

    const { username, password } = body;

    const cleanUsername = typeof username === "string" ? username.trim() : "";
    if (!cleanUsername) {
      return NextResponse.json({ success: false, error: "Username is required." }, { status: 400 });
    }
    if (!password || typeof password !== "string") {
      return NextResponse.json({ success: false, error: "Password is required." }, { status: 400 });
    }

    // 1. Look up user by Username OR Email (case-insensitive)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: cleanUsername },
          { username: { equals: cleanUsername, mode: "insensitive" } },
          { email: cleanUsername.toLowerCase() },
          { email: { equals: cleanUsername, mode: "insensitive" } },
        ],
      },
      include: {
        wallets: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // 2. Validate Password
    const isPasswordValid =
      verifyPassword(password, user.password) ||
      verifyPassword(password, user.passwordHash) ||
      user.password === password ||
      user.passwordHash === password;

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Incorrect password" },
        { status: 401 }
      );
    }

    console.log("[Auth Login API] User successfully authenticated:", {
      id: user.id,
      username: user.username,
    });

    const approvedDepositCount = await prisma.transaction.count({
      where: {
        userId: user.id,
        type: "DEPOSIT",
        status: "APPROVED",
      },
    });
    const unlockedBonusTier = Math.min(4, approvedDepositCount + 1);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatarColor: "#00e701",
        approvedDepositCount,
        depositCount: approvedDepositCount,
        unlockedBonusTier,
      },
      approvedDepositCount,
      unlockedBonusTier,
    });

    response.cookies.set({
      name: "stake_user_id",
      value: user.id,
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
    });

    return response;
  } catch (err: any) {
    console.error("[Auth Login API] Error authenticating user:", err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Internal server error occurred during login",
      },
      { status: 500 }
    );
  }
}
