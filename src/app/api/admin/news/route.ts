/**
 * News management endpoint for admin.
 *
 * Allows admin to create news articles for the landing page.
 *
 * @route POST /api/admin/news
 * @security Admin only (memberType === 99)
 *
 * Request body:
 * - title: string - News headline
 * - content: string - News article content
 * - imageUrl?: string - Optional featured image URL
 * - isPublished: boolean - Publish status
 *
 * Response:
 * - 200: Created news object
 * - 401: Unauthorized
 * - 500: Server error
 *
 * @module api/admin/news
 */
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * Create a new news article.
 *
 * @param request - HTTP request with news data in body
 * @returns Created news object or error JSON
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.memberType !== 99) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const news = await prisma.news.create({
      data: {
        title: body.title,
        content: body.content,
        imageUrl: body.imageUrl || null,
        isPublished: body.isPublished,
      },
    });

    return NextResponse.json(news);
  } catch (error) {
    console.error("Error creating news:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
