import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { csrfProtection } from "@/lib/csrf";
import { sanitizeNumeric } from "@/lib/sanitize";
import { paymentSchema, validate } from "@/lib/validation";
import { auditPaymentSubmit } from "@/lib/audit-logger";

// File upload constraints
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg"];
const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg"];

export async function POST(request: Request) {
  try {
    // CSRF protection
    const csrfError = csrfProtection(request);
    if (csrfError) return csrfError;

    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const attendeeIds = formData.get("attendeeIds") as string;
    const memberId = formData.get("memberId") as string;
    const paidDateStr = formData.get("paidDate") as string | null;

    // Validate input
    const validation = validate(paymentSchema, { attendeeIds, memberId, paidDate: paidDateStr });
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.message },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: "กรุณาอัปโหลดไฟล์หลักฐานการชำระเงิน" },
        { status: 400 }
      );
    }

    // File size validation
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 5MB)" },
        { status: 400 }
      );
    }

    // File type validation
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: "ประเภทไฟล์ไม่ถูกต้อง (รองรับเฉพาะ .png, .jpg, .jpeg)" },
        { status: 400 }
      );
    }

    // MIME type validation
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "ประเภทไฟล์ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    // Sanitize and parse attendee IDs
    const sanitizedAttendeeIds = sanitizeNumeric(attendeeIds.replace(/,/g, " ")).trim();
    const attendeeIdArray = attendeeIds
      .split(",")
      .map((id) => parseInt(sanitizeNumeric(id)))
      .filter((id) => !isNaN(id) && id > 0);

    if (attendeeIdArray.length === 0) {
      return NextResponse.json(
        { error: "กรุณาเลือกผู้ลงทะเบียน" },
        { status: 400 }
      );
    }

    const sanitizedMemberId = parseInt(sanitizeNumeric(memberId));
    if (isNaN(sanitizedMemberId) || sanitizedMemberId <= 0) {
      return NextResponse.json(
        { error: "Member ID ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const isAdmin = session.user.memberType === 99;

    // IDOR Protection: Validate that ALL attendee IDs belong to the user's hospital
    // (Admin can access any attendee)
    if (!isAdmin) {
      const validAttendees = await prisma.attendee.findMany({
        where: {
          id: { in: attendeeIdArray },
          hospitalCode: session.user.hospitalCode,
        },
        select: { id: true },
      });

      if (validAttendees.length !== attendeeIdArray.length) {
        return NextResponse.json(
          { error: "ไม่มีสิทธิ์เข้าถึงผู้ลงทะเบียนบางราย" },
          { status: 403 }
        );
      }
    }

    // Parse paid date from ISO string
    const paidDate = paidDateStr ? new Date(paidDateStr) : null;

    // Validate date if provided
    if (paidDate && isNaN(paidDate.getTime())) {
      return NextResponse.json(
        { error: "วันที่ชำระเงินไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    // Generate unique filename with sanitized extension
    const timestamp = Date.now();
    const sanitizedExt = ext.replace(/[^a-z.]/gi, "");
    const fileName = `payment_${sanitizedMemberId}_${timestamp}${sanitizedExt}`;

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), "public", "uploads", "payments");
    await mkdir(uploadDir, { recursive: true });

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(path.join(uploadDir, fileName), buffer);

    // Create finance record
    const finance = await prisma.finance.create({
      data: {
        memberId: sanitizedMemberId,
        attendeeIds: attendeeIdArray.join(","),
        fileName: `/api/uploads/payments/${fileName}`,
        status: 1, // รอตรวจสอบ
        paidDate: paidDate,
      },
    });

    // Update attendee status to "รอตรวจสอบ"
    await prisma.attendee.updateMany({
      where: {
        id: { in: attendeeIdArray },
        // Admin can update any attendee, regular users only their hospital's
        ...(isAdmin ? {} : { hospitalCode: session.user.hospitalCode }),
      },
      data: {
        status: 2, // รอตรวจสอบ
      },
    });

    // Audit log
    await auditPaymentSubmit(request, session.user.id, finance.id, attendeeIdArray);

    return NextResponse.json({ success: true, finance });
  } catch (error) {
    console.error("Error processing payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
