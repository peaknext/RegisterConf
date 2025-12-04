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
