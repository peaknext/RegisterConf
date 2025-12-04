import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.prefix || !body.firstName || !body.lastName) {
      return NextResponse.json(
        { error: "กรุณากรอกชื่อ-นามสกุลให้ครบถ้วน" },
        { status: 400 }
      );
    }

    if (!body.regTypeId) {
      return NextResponse.json(
        { error: "กรุณาเลือกประเภทการลงทะเบียน" },
        { status: 400 }
      );
    }

    if (!body.phone) {
      return NextResponse.json(
        { error: "กรุณากรอกเบอร์โทรศัพท์" },
        { status: 400 }
      );
    }

    // Create attendee
    const attendee = await prisma.attendee.create({
      data: {
        // Personal Info
        prefix: body.prefix,
        firstName: body.firstName,
        lastName: body.lastName,
        regTypeId: body.regTypeId ? parseInt(body.regTypeId) : null,
        positionCode: body.positionCode || null,
        positionOther: body.positionOther || null,
        levelCode: body.levelCode || null,

        // Contact
        phone: body.phone,
        email: body.email || null,
        line: body.line || null,

        // Preferences
        foodType: body.foodType ? parseInt(body.foodType) : 1,
        vehicleType: body.vehicleType ? parseInt(body.vehicleType) : null,

        // Air Travel - Arrival
        airDate1: body.airDate1 ? new Date(body.airDate1) : null,
        airline1: body.airline1 || null,
        flightNo1: body.flightNo1 || null,
        airTime1: combineDateAndTime(body.airDate1, body.airTime1),

        // Air Travel - Departure
        airDate2: body.airDate2 ? new Date(body.airDate2) : null,
        airline2: body.airline2 || null,
        flightNo2: body.flightNo2 || null,
        airTime2: combineDateAndTime(body.airDate2, body.airTime2),
        airShuttle: body.airShuttle ? parseInt(body.airShuttle) : null,

        // Bus Travel
        busDate1: body.busDate1 ? new Date(body.busDate1) : null,
        busLine1: body.busLine1 || null,
        busTime1: combineDateAndTime(body.busDate1, body.busTime1),
        busDate2: body.busDate2 ? new Date(body.busDate2) : null,
        busLine2: body.busLine2 || null,
        busTime2: combineDateAndTime(body.busDate2, body.busTime2),
        busShuttle: body.busShuttle ? parseInt(body.busShuttle) : null,

        // Train Travel
        trainDate1: body.trainDate1 ? new Date(body.trainDate1) : null,
        trainLine1: body.trainLine1 || null,
        trainTime1: combineDateAndTime(body.trainDate1, body.trainTime1),
        trainDate2: body.trainDate2 ? new Date(body.trainDate2) : null,
        trainLine2: body.trainLine2 || null,
        trainTime2: combineDateAndTime(body.trainDate2, body.trainTime2),
        trainShuttle: body.trainShuttle ? parseInt(body.trainShuttle) : null,

        // Accommodation
        hotelId: body.hotelId ? parseInt(body.hotelId) : null,
        hotelOther: body.hotelOther || null,
        busToMeet: body.busToMeet ? parseInt(body.busToMeet) : null,

        // Status & Audit
        // Admin (memberType=99) can specify hospitalCode, others use their own
        hospitalCode:
          session.user.memberType === 99 && body.hospitalCode
            ? body.hospitalCode
            : session.user.hospitalCode,
        createdBy: parseInt(session.user.id),
        status: 1, // ค้างชำระ
      },
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
    const search = searchParams.get("search");

    const where: {
      hospitalCode: string | null;
      OR?: Array<
        | { firstName?: { contains: string; mode: "insensitive" } }
        | { lastName?: { contains: string; mode: "insensitive" } }
        | { email?: { contains: string; mode: "insensitive" } }
      >;
    } = { hospitalCode: session.user.hospitalCode };

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
