import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, EMAIL_REGEX, MOBILE_REGEX, USERNAME_REGEX } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON request payload" }, { status: 400 });
    }

    const {
      registerMethod = "email",
      identifier,
      username,
      password,
      confirmPassword,
      referralCode,
    } = body;

    // 1. Validate Username
    const cleanUsername = typeof username === "string" ? username.trim() : "";
    if (!cleanUsername) {
      return NextResponse.json({ success: false, error: "Username is required." }, { status: 400 });
    }
    if (!USERNAME_REGEX.test(cleanUsername)) {
      return NextResponse.json(
        {
          success: false,
          error: "Username must be 3-20 characters long and contain only letters, numbers, and underscores.",
        },
        { status: 400 }
      );
    }

    // 2. Validate Password & Confirmation
    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return NextResponse.json({ success: false, error: "Passwords do not match." }, { status: 400 });
    }

    // 3. Validate Identifier (Email or Mobile)
    let cleanEmail: string | null = null;
    let cleanPhone: string | null = null;

    const rawId = typeof identifier === "string" ? identifier.trim() : "";

    if (registerMethod === "mobile" || (/^\d+$/.test(rawId) && rawId.length === 10)) {
      const sanitizedPhone = rawId.replace(/\D/g, "");
      if (!MOBILE_REGEX.test(sanitizedPhone)) {
        return NextResponse.json(
          {
            success: false,
            error: "Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).",
          },
          { status: 400 }
        );
      }
      cleanPhone = sanitizedPhone;
      cleanEmail = `${cleanUsername}_${sanitizedPhone}@stake.internal`;
    } else {
      // Email method
      const sanitizedEmail = rawId.toLowerCase();
      if (!EMAIL_REGEX.test(sanitizedEmail)) {
        return NextResponse.json(
          {
            success: false,
            error: "Please enter a valid email address (e.g. user@example.com). Single character or invalid emails are not allowed.",
          },
          { status: 400 }
        );
      }
      cleanEmail = sanitizedEmail;
    }

    // 4. Check for duplicate Username in Neon PostgreSQL (case-insensitive)
    const existingUser = await prisma.user.findFirst({
      where: {
        username: {
          equals: cleanUsername,
          mode: "insensitive",
        },
      },
    });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Username is already taken", field: "username" },
        { status: 409 }
      );
    }

    // 5. Check for duplicate Email in Neon PostgreSQL (case-insensitive)
    if (cleanEmail && registerMethod === "email") {
      const existingEmail = await prisma.user.findFirst({
        where: {
          email: {
            equals: cleanEmail,
            mode: "insensitive",
          },
        },
      });
      if (existingEmail) {
        return NextResponse.json(
          { success: false, error: "Email is already registered with another account", field: "identifier" },
          { status: 409 }
        );
      }
    }

    // 6. Check for duplicate Phone in Neon PostgreSQL
    if (cleanPhone && registerMethod === "mobile") {
      const existingPhone = await prisma.user.findFirst({
        where: { phone: cleanPhone },
      });
      if (existingPhone) {
        return NextResponse.json(
          { success: false, error: "Mobile number is already registered with another account", field: "identifier" },
          { status: 409 }
        );
      }
    }

    // 7. Hash password & insert User into Neon PostgreSQL
    const hashedPassword = hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        username: cleanUsername,
        email: cleanEmail,
        phone: cleanPhone,
        password: hashedPassword,
        passwordHash: hashedPassword,
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

    console.log("[Auth Register API] User successfully registered in Neon DB:", {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      phone: newUser.phone,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        name: newUser.username,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        avatarColor: "#00e701",
      },
    });
  } catch (err: any) {
    console.error("[Auth Register API] Error registering user:", err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Internal server error occurred during registration",
      },
      { status: 500 }
    );
  }
}
