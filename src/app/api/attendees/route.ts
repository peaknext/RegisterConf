import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { csrfProtection } from "@/lib/csrf";
import { sanitizeString, sanitizeEmail, sanitizePhone, sanitizeCode } from "@/lib/sanitize";
import { attendeeCreateSchema, validate } from "@/lib/validation";
import { auditAttendeeCreate } from "@/lib/audit-logger";

// Helper function to combine date and time strings into a valid Date object
function combineDateAndTime(
  dateStr: string | null | undefined,
  timeStr: string | null | undefined
): Date | null {
  if (!dateStr || !timeStr) return null;

  try {
    // Parse the date part
    const datePart = new Date(dateStr);
    if (isNaN(datePart.getTime())) return null;

    // Parse the time part (format: "HH:mm" or "HH:mm:ss")
    const timeParts = timeStr.split(":");
    if (timeParts.length < 2) return null;

    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    const seconds = timeParts[2] ? parseInt(timeParts[2], 10) : 0;

    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return null;

    // Create a new date with combined values
    const combined = new Date(datePart);
    combined.setHours(hours, minutes, seconds, 0);

    return combined;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    // CSRF protection
    const csrfError = csrfProtection(request);
    if (csrfError) return csrfError;

    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input using Zod schema
    const validation = validate(attendeeCreateSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.message },
        { status: 400 }
      );
    }

    const data = validation.data!;

    // Sanitize string inputs
    const sanitizedData = {
      prefix: sanitizeString(data.prefix),
      firstName: sanitizeString(data.firstName),
      lastName: sanitizeString(data.lastName),
      positionOther: sanitizeString(data.positionOther),
      phone: sanitizePhone(data.phone),
      email: data.email ? sanitizeEmail(data.email) : null,
      line: sanitizeString(data.line),
      airline1: sanitizeString(data.airline1),
      flightNo1: sanitizeString(data.flightNo1),
      airline2: sanitizeString(data.airline2),
      flightNo2: sanitizeString(data.flightNo2),
      busLine1: sanitizeString(data.busLine1),
      busLine2: sanitizeString(data.busLine2),
      trainLine1: sanitizeString(data.trainLine1),
      trainLine2: sanitizeString(data.trainLine2),
      hotelOther: sanitizeString(data.hotelOther),
      hospitalCode: data.hospitalCode ? sanitizeCode(data.hospitalCode) : null,
    };

    // Admin (memberType=99) can specify hospitalCode, others use their own
    const isAdmin = session.user.memberType === 99;
    let hospitalCode = session.user.hospitalCode;

    // Admin specifying hospitalCode - validate it exists
    if (isAdmin && sanitizedData.hospitalCode) {
      const hospital = await prisma.hospital.findUnique({
        where: { code: sanitizedData.hospitalCode },
      });
      if (!hospital) {
        return NextResponse.json(
          { error: "รหัสโรงพยาบาลไม่ถูกต้อง" },
          { status: 400 }
        );
      }
      hospitalCode = sanitizedData.hospitalCode;
    }

    // Create attendee
    const attendee = await prisma.attendee.create({
      data: {
        // Personal Info
        prefix: sanitizedData.prefix,
        firstName: sanitizedData.firstName,
        lastName: sanitizedData.lastName,
        regTypeId: data.regTypeId,
        positionCode: data.positionCode || null,
        positionOther: sanitizedData.positionOther || null,
        levelCode: data.levelCode || null,

        // Contact
        phone: sanitizedData.phone,
        email: sanitizedData.email,
        line: sanitizedData.line || null,

        // Preferences
        foodType: data.foodType,
        vehicleType: data.vehicleType || null,

        // Air Travel - Arrival
        airDate1: data.airDate1 ? new Date(data.airDate1) : null,
        airline1: sanitizedData.airline1 || null,
        flightNo1: sanitizedData.flightNo1 || null,
        airTime1: combineDateAndTime(data.airDate1, data.airTime1),

        // Air Travel - Departure
        airDate2: data.airDate2 ? new Date(data.airDate2) : null,
        airline2: sanitizedData.airline2 || null,
        flightNo2: sanitizedData.flightNo2 || null,
        airTime2: combineDateAndTime(data.airDate2, data.airTime2),
        airShuttle: data.airShuttle || null,

        // Bus Travel
        busDate1: data.busDate1 ? new Date(data.busDate1) : null,
        busLine1: sanitizedData.busLine1 || null,
        busTime1: combineDateAndTime(data.busDate1, data.busTime1),
        busDate2: data.busDate2 ? new Date(data.busDate2) : null,
        busLine2: sanitizedData.busLine2 || null,
        busTime2: combineDateAndTime(data.busDate2, data.busTime2),
        busShuttle: data.busShuttle || null,

        // Train Travel
        trainDate1: data.trainDate1 ? new Date(data.trainDate1) : null,
        trainLine1: sanitizedData.trainLine1 || null,
        trainTime1: combineDateAndTime(data.trainDate1, data.trainTime1),
        trainDate2: data.trainDate2 ? new Date(data.trainDate2) : null,
        trainLine2: sanitizedData.trainLine2 || null,
        trainTime2: combineDateAndTime(data.trainDate2, data.trainTime2),
        trainShuttle: data.trainShuttle || null,

        // Accommodation
        hotelId: data.hotelId || null,
        hotelOther: sanitizedData.hotelOther || null,
        busToMeet: data.busToMeet || null,

        // Status & Audit
        hospitalCode,
        createdBy: parseInt(session.user.id),
        status: 1, // ค้างชำระ
      },
    });

    // Audit log
    await auditAttendeeCreate(request, session.user.id, attendee.id, {
      hospitalCode,
      regTypeId: data.regTypeId,
    });

    return NextResponse.json(attendee, { status: 201 });
  } catch (error) {
    console.error("Error creating attendee:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const rawSearch = searchParams.get("search");
    const isAdmin = session.user.memberType === 99;

    // Sanitize search input
    const search = rawSearch ? sanitizeString(rawSearch) : null;

    // Build where clause - Admin can see all, regular users only their hospital
    const where: {
      hospitalCode?: string | null;
      OR?: Array<
        | { firstName?: { contains: string; mode: "insensitive" } }
        | { lastName?: { contains: string; mode: "insensitive" } }
        | { email?: { contains: string; mode: "insensitive" } }
      >;
    } = {};

    // Non-admin users can only see their hospital's attendees
    if (!isAdmin) {
      where.hospitalCode = session.user.hospitalCode;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const attendees = await prisma.attendee.findMany({
      where,
      include: {
        regType: true,
        position: true,
        level: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(attendees);
  } catch (error) {
    console.error("Error fetching attendees:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูล" },
      { status: 500 }
    );
  }
}
