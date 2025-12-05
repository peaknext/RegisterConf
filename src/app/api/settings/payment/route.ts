import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET payment settings
export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.memberType !== 99) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.setting.findFirst();
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching payment settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT update payment settings
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.memberType !== 99) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Check if settings exist
    const existingSettings = await prisma.setting.findFirst();

    let settings;
    if (existingSettings) {
      settings = await prisma.setting.update({
        where: { id: existingSettings.id },
        data: {
          name: body.name || null,
          accountName: body.accountName || null,
          accountBank: body.accountBank || null,
          accountNo: body.accountNo || null,
          meetPrice: body.meetPrice || null,
          condition1: body.condition1 || null,
          condition2: body.condition2 || null,
          accountFollowName: body.accountFollowName || null,
          accountFollowBank: body.accountFollowBank || null,
          accountFollowNo: body.accountFollowNo || null,
          meetPriceFollow: body.meetPriceFollow || null,
        },
      });
    } else {
      settings = await prisma.setting.create({
        data: {
          name: body.name || null,
          accountName: body.accountName || null,
          accountBank: body.accountBank || null,
          accountNo: body.accountNo || null,
          meetPrice: body.meetPrice || null,
          condition1: body.condition1 || null,
          condition2: body.condition2 || null,
          accountFollowName: body.accountFollowName || null,
          accountFollowBank: body.accountFollowBank || null,
          accountFollowNo: body.accountFollowNo || null,
          meetPriceFollow: body.meetPriceFollow || null,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating payment settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
