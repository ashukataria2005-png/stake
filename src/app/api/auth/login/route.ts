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

    // 1. Look up the user strictly by Username in Neon PostgreSQL (case-insensitive search supported)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: cleanUsername },
          { username: { equals: cleanUsername, mode: "insensitive" } },
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

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatarColor: "#00e701",
      },
    });
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
