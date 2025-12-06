/**
 * Slideshow update/delete endpoint for admin.
 *
 * Allows admin to update or delete existing slideshow slides.
 *
 * @route PATCH /api/admin/slideshow/[id]
 * @route DELETE /api/admin/slideshow/[id]
 * @security Admin only (memberType === 99)
 *
 * PATCH Request body:
 * - title?: string - Optional slide title/alt text
 * - imageUrl: string - Slide image URL (required)
 * - linkUrl?: string - Optional click-through URL
 * - sortOrder?: number - Display order (default: 0)
 * - isActive: boolean - Active status
 *
 * Response:
 * - 200: Updated/deleted slideshow object or success status
 * - 401: Unauthorized
 * - 500: Server error
 *
 * @module api/admin/slideshow/[id]
 */
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * Update an existing slideshow slide.
 *
 * @param request - HTTP request with updated slideshow data in body
 * @param params - Route params containing slideshow ID
 * @returns Updated slideshow object or error JSON
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

    const slideshow = await prisma.slideshow.update({
      where: { id: parseInt(id) },
      data: {
        title: body.title || null,
        imageUrl: body.imageUrl,
        linkUrl: body.linkUrl || null,
        sortOrder: body.sortOrder || 0,
        isActive: body.isActive,
      },
    });

    return NextResponse.json(slideshow);
  } catch (error) {
    console.error("Error updating slideshow:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Delete a slideshow slide.
 *
 * @param request - HTTP request
 * @param params - Route params containing slideshow ID
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

    await prisma.slideshow.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting slideshow:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
