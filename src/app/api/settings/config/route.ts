import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET site config
export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.memberType !== 99) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const config = await prisma.siteConfig.findFirst();
    return NextResponse.json(config);
  } catch (error) {
    console.error("Error fetching site config:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT update site config
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.memberType !== 99) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Check if a config exists
    const existingConfig = await prisma.siteConfig.findFirst();

    let config;
    if (existingConfig) {
      config = await prisma.siteConfig.update({
        where: { id: existingConfig.id },
        data: {
          logoUrl: body.logoUrl || null,
          googleDriveUrl: body.googleDriveUrl || null,
        },
      });
    } else {
      config = await prisma.siteConfig.create({
        data: {
          logoUrl: body.logoUrl || null,
          googleDriveUrl: body.googleDriveUrl || null,
        },
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error updating site config:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
