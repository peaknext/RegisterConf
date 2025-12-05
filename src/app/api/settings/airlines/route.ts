import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET all airlines
export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.memberType !== 99) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const airlines = await prisma.airline.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(airlines);
  } catch (error) {
    console.error("Error fetching airlines:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create airline
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.memberType !== 99) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const airline = await prisma.airline.create({
      data: {
        name: body.name,
        status: body.status ?? "y",
      },
    });
    return NextResponse.json(airline);
  } catch (error) {
    console.error("Error creating airline:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
