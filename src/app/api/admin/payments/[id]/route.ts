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
    const paymentId = parseInt(id);

    const finance = await prisma.finance.findUnique({
      where: { id: paymentId },
    });

    if (!finance) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (body.action === "approve") {
      // Update finance status to approved (2)
      await prisma.finance.update({
        where: { id: paymentId },
        data: {
          status: 2,
          confirmedBy: parseInt(session.user.id),
          confirmedAt: new Date(),
          paidDate: new Date(),
        },
      });

      // Update attendee status to paid (9)
      if (finance.attendeeIds) {
        const attendeeIds = finance.attendeeIds.split(",").map((id) => parseInt(id));
        await prisma.attendee.updateMany({
          where: { id: { in: attendeeIds } },
          data: { status: 9 },
        });
      }
    } else if (body.action === "reject") {
      // Update finance status to rejected (9)
      await prisma.finance.update({
        where: { id: paymentId },
        data: {
          status: 9,
          confirmedBy: parseInt(session.user.id),
          confirmedAt: new Date(),
        },
      });

      // Reset attendee status to pending (1)
      if (finance.attendeeIds) {
        const attendeeIds = finance.attendeeIds.split(",").map((id) => parseInt(id));
        await prisma.attendee.updateMany({
          where: { id: { in: attendeeIds } },
          data: { status: 1 },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
