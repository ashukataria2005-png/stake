import { NextRequest, NextResponse } from "next/server";
import { getLoggedInAdmin } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  try {
    const admin = await getLoggedInAdmin();

    if (!admin) {
      return NextResponse.json(
        { success: false, authenticated: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
      },
    });
  } catch (err: any) {
    console.error("[Admin Me API Error]:", err);
    return NextResponse.json(
      { success: false, authenticated: false, error: "Server error" },
      { status: 500 }
    );
  }
}
