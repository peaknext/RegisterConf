import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { hashPassword, validatePasswordMinLength } from "@/lib/password";
import { csrfProtection } from "@/lib/csrf";

// PATCH change single member password
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // CSRF protection
    const csrfError = csrfProtection(request);
    if (csrfError) return csrfError;

    const session = await auth();
    if (!session || session.user.memberType !== 99) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const memberId = parseInt(id);
    const body = await request.json();

    // Validate new password
    const passwordError = validatePasswordMinLength(body.newPassword, 6);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    // Hash password with bcrypt
    const hashedPassword = await hashPassword(body.newPassword);

    await prisma.member.update({
      where: { id: memberId },
      data: { password: hashedPassword }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error changing password:", error);

    // Handle record not found
    if (error && typeof error === "object" && "code" in error && error.code === "P2025") {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
