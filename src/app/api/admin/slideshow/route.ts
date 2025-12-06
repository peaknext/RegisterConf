/**
 * Slideshow management endpoint for admin.
 *
 * Allows admin to create slideshow slides for the landing page carousel.
 *
 * @route POST /api/admin/slideshow
 * @security Admin only (memberType === 99)
 *
 * Request body:
 * - title?: string - Optional slide title/alt text
 * - imageUrl: string - Slide image URL (required)
 * - linkUrl?: string - Optional click-through URL
 * - sortOrder?: number - Display order (default: 0)
 * - isActive: boolean - Active status
 *
 * Response:
 * - 200: Created slideshow object
 * - 401: Unauthorized
 * - 500: Server error
 *
 * @module api/admin/slideshow
 */
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * Create a new slideshow slide.
 *
 * @param request - HTTP request with slideshow data in body
 * @returns Created slideshow object or error JSON
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.memberType !== 99) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const slideshow = await prisma.slideshow.create({
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
    console.error("Error creating slideshow:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
