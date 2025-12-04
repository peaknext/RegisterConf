import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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
        sortOrder: body.sortOrder || 0,
      },
    });

    return NextResponse.json(schedule);
  } catch (error) {
    console.error("Error creating schedule:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
