import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createHash } from "crypto";

// MD5 hash function (same as auth.ts)
function md5(str: string): string {
  return createHash("md5").update(str).digest("hex");
}

// PATCH change password for multiple members
export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.memberType !== 99) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate memberIds
    if (!body.memberIds || !Array.isArray(body.memberIds) || body.memberIds.length === 0) {
      return NextResponse.json(
        { error: "Member IDs are required" },
        { status: 400 }
      );
    }

    // Validate new password
    if (!body.newPassword || body.newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Hash password with MD5
    const hashedPassword = md5(body.newPassword);

    // Prevent changing own password in bulk operations (safety measure)
    const filteredIds = body.memberIds.filter(
      (id: number) => id !== parseInt(session.user.id)
    );

    // Update all selected members
    const result = await prisma.member.updateMany({
      where: { id: { in: filteredIds } },
      data: { password: hashedPassword }
    });

    return NextResponse.json({
      success: true,
      updated: result.count
    });
  } catch (error) {
    console.error("Error changing bulk passwords:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
