import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET all hospitals
export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.memberType !== 99) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hospitals = await prisma.hospital.findMany({
      include: { zone: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(hospitals);
  } catch (error) {
    console.error("Error fetching hospitals:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create hospital
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.memberType !== 99) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const hospital = await prisma.hospital.create({
      data: {
        code: body.code,
        name: body.name,
        province: body.province || null,
        hospitalType: body.hospitalType || null,
        zoneCode: body.zoneCode || null,
      },
      include: { zone: true },
    });
    return NextResponse.json(hospital);
  } catch (error) {
    console.error("Error creating hospital:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
