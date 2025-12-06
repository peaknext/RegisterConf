/**
 * Schedule management endpoint for admin.
 *
 * Allows admin to create conference schedule entries for the landing page.
 *
 * @route POST /api/admin/schedule
 * @security Admin only (memberType === 99)
 *
 * Request body:
 * - dayNumber: number - Day of conference (1, 2, 3, etc.)
 * - date: string - ISO date string
 * - startTime: string - Start time (HH:MM format)
 * - endTime: string - End time (HH:MM format)
 * - title: string - Session title
 * - description?: string - Optional session description
 * - location?: string - Optional venue/room
 * - speaker?: string - Optional speaker name(s)
 * - sortOrder?: number - Display order (default: 0)
 *
 * Response:
 * - 200: Created schedule object
 * - 401: Unauthorized
 * - 500: Server error
 *
 * @module api/admin/schedule
 */
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * Create a new schedule entry.
 *
 * @param request - HTTP request with schedule data in body
 * @returns Created schedule object or error JSON
 */
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
