import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET all schedules
export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.memberType !== 99) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const schedules = await prisma.schedule.findMany({
      orderBy: [{ dayNumber: "asc" }, { sortOrder: "asc" }],
    });
    return NextResponse.json(schedules);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create schedule
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.memberType !== 99) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const schedule = await prisma.schedule.create({
      data: {
        dayNumber: body.dayNumber,
        date: new Date(body.date),
        startTime: body.startTime,
        endTime: body.endTime,
        title: body.title,
        description: body.description || null,
        location: body.location || null,
        speaker: body.speaker || null,
        sortOrder: body.sortOrder ?? 0,
      },
    });
    return NextResponse.json(schedule);
  } catch (error) {
    console.error("Error creating schedule:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
