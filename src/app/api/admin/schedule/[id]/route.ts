/**
 * Schedule update/delete endpoint for admin.
 *
 * Allows admin to update or delete existing schedule entries.
 *
 * @route PATCH /api/admin/schedule/[id]
 * @route DELETE /api/admin/schedule/[id]
 * @security Admin only (memberType === 99)
 *
 * PATCH Request body:
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
 * - 200: Updated/deleted schedule object or success status
 * - 401: Unauthorized
 * - 500: Server error
 *
 * @module api/admin/schedule/[id]
 */
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * Update an existing schedule entry.
 *
 * @param request - HTTP request with updated schedule data in body
 * @param params - Route params containing schedule ID
 * @returns Updated schedule object or error JSON
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.memberType !== 99) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const schedule = await prisma.schedule.update({
      where: { id: parseInt(id) },
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
    console.error("Error updating schedule:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Delete a schedule entry.
 *
 * @param request - HTTP request
 * @param params - Route params containing schedule ID
 * @returns Success status or error JSON
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.memberType !== 99) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.schedule.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
