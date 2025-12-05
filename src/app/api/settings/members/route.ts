import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createHash } from "crypto";

// MD5 hash function (same as auth.ts)
function md5(str: string): string {
  return createHash("md5").update(str).digest("hex");
}

// GET all members
export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.memberType !== 99) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const members = await prisma.member.findMany({
      include: {
        hospital: {
          select: { code: true, name: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    // Remove password from response
    const membersWithoutPassword = members.map(({ password, ...member }) => member);

    return NextResponse.json(membersWithoutPassword);
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create member
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.memberType !== 99) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validation
    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (body.password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check email uniqueness
    const existing = await prisma.member.findUnique({
      where: { email: body.email }
    });
    if (existing) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    // Validate hospitalCode if provided
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

    // Validate memberType
    const memberType = body.memberType || 1;
    if (![1, 99].includes(memberType)) {
      return NextResponse.json(
        { error: "Member type must be 1 or 99" },
        { status: 400 }
      );
    }

    // Hash password with MD5
    const hashedPassword = md5(body.password);

    const member = await prisma.member.create({
      data: {
        email: body.email,
        password: hashedPassword,
        hospitalCode: body.hospitalCode || null,
        memberType,
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
    console.error("Error creating member:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
