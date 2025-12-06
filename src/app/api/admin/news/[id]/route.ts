/**
 * News update/delete endpoint for admin.
 *
 * Allows admin to update or delete existing news articles.
 *
 * @route PATCH /api/admin/news/[id]
 * @route DELETE /api/admin/news/[id]
 * @security Admin only (memberType === 99)
 *
 * PATCH Request body:
 * - title: string - News headline
 * - content: string - News article content
 * - imageUrl?: string - Optional featured image URL
 * - isPublished: boolean - Publish status
 *
 * Response:
 * - 200: Updated/deleted news object or success status
 * - 401: Unauthorized
 * - 500: Server error
 *
 * @module api/admin/news/[id]
 */
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * Update an existing news article.
 *
 * @param request - HTTP request with updated news data in body
 * @param params - Route params containing news ID
 * @returns Updated news object or error JSON
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

    const news = await prisma.news.update({
      where: { id: parseInt(id) },
      data: {
        title: body.title,
        content: body.content,
        imageUrl: body.imageUrl || null,
        isPublished: body.isPublished,
      },
    });

    return NextResponse.json(news);
  } catch (error) {
    console.error("Error updating news:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Delete a news article.
 *
 * @param request - HTTP request
 * @param params - Route params containing news ID
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

    await prisma.news.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting news:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
