import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Admin logged out successfully",
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (err: any) {
    console.error("[Admin Logout Error]:", err);
    return NextResponse.json({ success: false, error: "Logout failed" }, { status: 500 });
  }
}
