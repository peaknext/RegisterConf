import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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
