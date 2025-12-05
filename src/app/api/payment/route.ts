import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const attendeeIds = formData.get("attendeeIds") as string;
    const memberId = formData.get("memberId") as string;
    const paidDateStr = formData.get("paidDate") as string | null;

    if (!file || !attendeeIds) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Parse paid date from ISO string
    const paidDate = paidDateStr ? new Date(paidDateStr) : null;

    // Generate unique filename
    const timestamp = Date.now();
    const ext = path.extname(file.name);
    const fileName = `payment_${memberId}_${timestamp}${ext}`;

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
        memberId: parseInt(memberId),
        attendeeIds: attendeeIds,
        fileName: `/uploads/payments/${fileName}`,
        status: 1, // รอตรวจสอบ
        paidDate: paidDate,
      },
    });

    // Update attendee status to "รอตรวจสอบ"
    const attendeeIdArray = attendeeIds.split(",").map((id) => parseInt(id));
    const isAdmin = session.user.memberType === 99;

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

    return NextResponse.json({ success: true, finance });
  } catch (error) {
    console.error("Error processing payment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
