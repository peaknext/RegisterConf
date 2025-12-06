import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { hashPassword, validatePasswordMinLength } from "@/lib/password";
import { csrfProtection } from "@/lib/csrf";

// PATCH change password for multiple members
export async function PATCH(request: Request) {
  try {
    // CSRF protection
    const csrfError = csrfProtection(request);
    if (csrfError) return csrfError;

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
    const passwordError = validatePasswordMinLength(body.newPassword, 6);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    // Hash password with bcrypt
    const hashedPassword = await hashPassword(body.newPassword);

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
