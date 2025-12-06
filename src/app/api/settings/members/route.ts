import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/password";
import { csrfProtection } from "@/lib/csrf";
import { sanitizeEmail, sanitizeCode } from "@/lib/sanitize";
import { memberCreateSchema, validate } from "@/lib/validation";
import { auditMemberCreate } from "@/lib/audit-logger";

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
    // CSRF protection
    const csrfError = csrfProtection(request);
    if (csrfError) return csrfError;

    const session = await auth();
    if (!session || session.user.memberType !== 99) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input using Zod schema
    const validation = validate(memberCreateSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.message },
        { status: 400 }
      );
    }

    const data = validation.data!;

    // Sanitize inputs
    const sanitizedEmail = sanitizeEmail(data.email);
    const sanitizedHospitalCode = data.hospitalCode ? sanitizeCode(data.hospitalCode) : null;

    // Check email uniqueness
    const existing = await prisma.member.findUnique({
      where: { email: sanitizedEmail }
    });
    if (existing) {
      return NextResponse.json(
        { error: "อีเมลนี้มีอยู่ในระบบแล้ว" },
        { status: 400 }
      );
    }

    // Validate hospitalCode if provided
    if (sanitizedHospitalCode) {
      const hospital = await prisma.hospital.findUnique({
        where: { code: sanitizedHospitalCode }
      });
      if (!hospital) {
        return NextResponse.json(
          { error: "ไม่พบรหัสโรงพยาบาล" },
          { status: 400 }
        );
      }
    }

    // Hash password with bcrypt
    const hashedPassword = await hashPassword(data.password);

    const member = await prisma.member.create({
      data: {
        email: sanitizedEmail,
        password: hashedPassword,
        hospitalCode: sanitizedHospitalCode,
        memberType: data.memberType,
      },
      include: {
        hospital: {
          select: { code: true, name: true }
        }
      },
    });

    // Audit log
    await auditMemberCreate(request, session.user.id, member.id, sanitizedEmail);

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
