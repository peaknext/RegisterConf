import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET all footer info
export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.memberType !== 99) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const footerInfo = await prisma.footerInfo.findMany();
    return NextResponse.json(footerInfo);
  } catch (error) {
    console.error("Error fetching footer info:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT upsert footer info
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.memberType !== 99) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Define the footer fields to update
    const footerFields = [
      { key: "organizer_name", value: body.organizerName },
      { key: "address", value: body.address },
      { key: "phone", value: body.phone },
      { key: "email", value: body.email },
      { key: "fax", value: body.fax },
    ];

    // Upsert each field
    const results = await Promise.all(
      footerFields.map((field) =>
        prisma.footerInfo.upsert({
          where: { key: field.key },
          create: {
            key: field.key,
            value: field.value || "",
          },
          update: {
            value: field.value || "",
          },
        })
      )
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error updating footer info:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
