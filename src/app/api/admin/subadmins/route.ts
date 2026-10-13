import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getLoggedInAdmin, hashPassword } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

// GET /api/admin/subadmins - List all admin & sub-admin roster
export async function GET(req: NextRequest) {
  try {
    const admin = await getLoggedInAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const admins = await prisma.adminUser.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      success: true,
      admins: admins.map((a) => ({
        id: a.id,
        username: a.username,
        role: a.role,
        isSuperAdmin: a.role === "SUPER_ADMIN" || a.username === "admin",
        createdAt: a.createdAt.toISOString(),
      })),
    });
  } catch (err: any) {
    console.error("[Subadmins API GET Error]:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to fetch admin roster" },
      { status: 500 }
    );
  }
}

// POST /api/admin/subadmins - Create new sub-admin
export async function POST(req: NextRequest) {
  try {
    const admin = await getLoggedInAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { username, password, role } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Username and password are required" },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();
    const existing = await prisma.adminUser.findUnique({
      where: { username: cleanUsername },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Username already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const created = await prisma.adminUser.create({
      data: {
        username: cleanUsername,
        passwordHash: hashedPassword,
        role: role || "SUPPORT_STAFF",
      },
    });

    return NextResponse.json({
      success: true,
      admin: {
        id: created.id,
        username: created.username,
        role: created.role,
        isSuperAdmin: false,
        createdAt: created.createdAt.toISOString(),
      },
    });
  } catch (err: any) {
    console.error("[Subadmins API POST Error]:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to create sub-admin" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/subadmins - Update sub-admin permissions/password
export async function PUT(req: NextRequest) {
  try {
    const admin = await getLoggedInAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, role, password } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing admin id" }, { status: 400 });
    }

    const target = await prisma.adminUser.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ success: false, error: "Admin not found" }, { status: 404 });
    }

    // Strict rule: Main Super Admin cannot be downgraded or edited via sub-admin route
    if (target.role === "SUPER_ADMIN" || target.username === "admin") {
      return NextResponse.json(
        { success: false, error: "Main Super Admin is protected and cannot be modified here" },
        { status: 403 }
      );
    }

    const dataToUpdate: any = {};
    if (role) dataToUpdate.role = role;
    if (password && password.trim()) {
      dataToUpdate.passwordHash = await hashPassword(password.trim());
    }

    const updated = await prisma.adminUser.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({
      success: true,
      admin: {
        id: updated.id,
        username: updated.username,
        role: updated.role,
        isSuperAdmin: false,
        createdAt: updated.createdAt.toISOString(),
      },
    });
  } catch (err: any) {
    console.error("[Subadmins API PUT Error]:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to update sub-admin" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/subadmins - Delete sub-admin
export async function DELETE(req: NextRequest) {
  try {
    const admin = await getLoggedInAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing admin id" }, { status: 400 });
    }

    const target = await prisma.adminUser.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ success: false, error: "Admin not found" }, { status: 404 });
    }

    // Strict Rule: Super Admin cannot be deleted
    if (target.role === "SUPER_ADMIN" || target.username === "admin") {
      return NextResponse.json(
        { success: false, error: "Main Super Admin cannot be deleted" },
        { status: 403 }
      );
    }

    await prisma.adminUser.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Sub-admin @${target.username} deleted successfully`,
    });
  } catch (err: any) {
    console.error("[Subadmins API DELETE Error]:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to delete sub-admin" },
      { status: 500 }
    );
  }
}
