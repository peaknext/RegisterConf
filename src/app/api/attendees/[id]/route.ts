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
    const datePart = new Date(dateStr);
    if (isNaN(datePart.getTime())) return null;

    const timeParts = timeStr.split(":");
    if (timeParts.length < 2) return null;

    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    const seconds = timeParts[2] ? parseInt(timeParts[2], 10) : 0;

    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return null;

    const combined = new Date(datePart);
    combined.setHours(hours, minutes, seconds, 0);

    return combined;
  } catch {
    return null;
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const attendeeId = parseInt(id);
    const body = await request.json();

    // Verify attendee belongs to user's hospital (or admin can update any)
    const isAdmin = session.user.memberType === 99;
    const existingAttendee = await prisma.attendee.findFirst({
      where: isAdmin
        ? { id: attendeeId }
        : { id: attendeeId, hospitalCode: session.user.hospitalCode },
    });

    if (!existingAttendee) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Full update with all fields
    const updatedAttendee = await prisma.attendee.update({
      where: { id: attendeeId },
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

        // Hospital Code (admin only)
        ...(isAdmin && body.hospitalCode
          ? { hospitalCode: body.hospitalCode }
          : {}),
      },
    });

    return NextResponse.json(updatedAttendee);
  } catch (error) {
    console.error("Error updating attendee:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const attendeeId = parseInt(id);
    const body = await request.json();

    // Verify attendee belongs to user's hospital
    const existingAttendee = await prisma.attendee.findFirst({
      where: {
        id: attendeeId,
        hospitalCode: session.user.hospitalCode,
      },
    });

    if (!existingAttendee) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Update attendee
    const updatedAttendee = await prisma.attendee.update({
      where: { id: attendeeId },
      data: {
        prefix: body.prefix,
        firstName: body.firstName,
        lastName: body.lastName,
        regTypeId: body.regTypeId,
        positionCode: body.positionCode,
        positionOther: body.positionOther,
        levelCode: body.levelCode,
        phone: body.phone,
        email: body.email,
        line: body.line,
        foodType: body.foodType,
      },
    });

    return NextResponse.json(updatedAttendee);
  } catch (error) {
    console.error("Error updating attendee:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const attendeeId = parseInt(id);

    const attendee = await prisma.attendee.findFirst({
      where: {
        id: attendeeId,
        hospitalCode: session.user.hospitalCode,
      },
      include: {
        regType: true,
        position: true,
        level: true,
      },
    });

    if (!attendee) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(attendee);
  } catch (error) {
    console.error("Error fetching attendee:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
