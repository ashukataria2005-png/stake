import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getLoggedInAdmin } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  try {
    const admin = await getLoggedInAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userId, userIds, luckMode } = body;

    if ((!userId && (!userIds || !userIds.length)) || !luckMode) {
      return NextResponse.json({ success: false, error: "Missing userId/userIds or luckMode" }, { status: 400 });
    }

    const validModes = ["HIGH_WIN", "MEDIUM_WIN", "LOW_WIN", "NO_CONTROL"];
    if (!validModes.includes(luckMode)) {
      return NextResponse.json({ success: false, error: "Invalid luckMode value" }, { status: 400 });
    }

    const targets = Array.isArray(userIds) ? userIds : [userId];

    await prisma.user.updateMany({
      where: { id: { in: targets } },
      data: { luckMode },
    });

    return NextResponse.json({
      success: true,
      message: `Updated luck mode to ${luckMode} for ${targets.length} user(s)`,
    });
  } catch (err: any) {
    console.error("[Admin Luck Mode Update Error]:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to update luck mode" },
      { status: 500 }
    );
  }
}
