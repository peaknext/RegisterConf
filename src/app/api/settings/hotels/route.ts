import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET all hotels
export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.memberType !== 99) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hotels = await prisma.hotel.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(hotels);
  } catch (error) {
    console.error("Error fetching hotels:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create hotel
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.memberType !== 99) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const hotel = await prisma.hotel.create({
      data: {
        name: body.name,
        phone: body.phone || null,
        website: body.website || null,
        mapUrl: body.mapUrl || null,
        busFlag: body.busFlag ?? "Y",
        status: body.status ?? "y",
      },
    });
    return NextResponse.json(hotel);
  } catch (error) {
    console.error("Error creating hotel:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
