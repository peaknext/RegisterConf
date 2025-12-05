import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// PATCH update member (except password)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.memberType !== 99) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const memberId = parseInt(id);
    const body = await request.json();

    // Validate email uniqueness (if changing email)
    if (body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return NextResponse.json(
          { error: "Invalid email format" },
          { status: 400 }
        );
      }

      const existing = await prisma.member.findFirst({
        where: {
          email: body.email,
          NOT: { id: memberId }
        }
      });
      if (existing) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 }
        );
      }
    }

    // Validate hospitalCode if provided
    if (body.hospitalCode !== undefined) {
      if (body.hospitalCode) {
        const hospital = await prisma.hospital.findUnique({
          where: { code: body.hospitalCode }
        });
        if (!hospital) {
          return NextResponse.json(
            { error: "Hospital code not found" },
            { status: 400 }
          );
        }
      }
    }

    // Validate memberType if provided
    if (body.memberType !== undefined && ![1, 99].includes(body.memberType)) {
      return NextResponse.json(
        { error: "Member type must be 1 or 99" },
        { status: 400 }
      );
    }

    const member = await prisma.member.update({
      where: { id: memberId },
      data: {
        ...(body.email && { email: body.email }),
        ...(body.hospitalCode !== undefined && { hospitalCode: body.hospitalCode || null }),
        ...(body.memberType !== undefined && { memberType: body.memberType }),
      },
      include: {
        hospital: {
          select: { code: true, name: true }
        }
      },
    });

    // Remove password from response
    const { password, ...memberWithoutPassword } = member;
    return NextResponse.json(memberWithoutPassword);
  } catch (error) {
    console.error("Error updating member:", error);

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

// DELETE member
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.memberType !== 99) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const memberId = parseInt(id);

    // Prevent deleting self
    if (memberId === parseInt(session.user.id)) {
      return NextResponse.json(
        { error: "Cannot delete yourself" },
        { status: 400 }
      );
    }

    await prisma.member.delete({
      where: { id: memberId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting member:", error);

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
