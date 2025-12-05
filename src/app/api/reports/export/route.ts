import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const statusLabels: Record<number, string> = {
  1: "ค้างชำระ",
  2: "รอตรวจสอบ",
  3: "ยกเลิก",
  9: "ชำระแล้ว",
};

const vehicleLabels: Record<number, string> = {
  1: "เครื่องบิน",
  2: "รถโดยสาร",
  3: "รถยนต์ส่วนตัว/ราชการ",
  4: "รถไฟ",
};

const foodLabels: Record<number, string> = {
  1: "อาหารทั่วไป",
  2: "อาหารอิสลาม",
  3: "อาหารมังสวิรัติ",
  4: "อาหารเจ",
};

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const format = searchParams.get("format");
    const hospitalCode = session.user.hospitalCode;

    if (!hospitalCode) {
      return NextResponse.json({ error: "No hospital code" }, { status: 400 });
    }

    const attendees = await prisma.attendee.findMany({
      where: { hospitalCode },
      include: {
        regType: true,
        position: true,
        level: true,
      },
      orderBy: { id: "asc" },
    });

    let csvContent = "";
    const BOM = "\uFEFF"; // UTF-8 BOM for Thai characters

    if (type === "attendees" || type === "full") {
      // Headers
      const headers = [
        "ลำดับ",
        "คำนำหน้า",
        "ชื่อ",
        "นามสกุล",
        "ประเภท",
        "ตำแหน่ง",
        "ระดับ",
        "โทรศัพท์",
        "อีเมล",
        "LINE",
        "อาหาร",
        "สถานะ",
      ];

      csvContent = BOM + headers.join(",") + "\n";

      attendees.forEach((a, index) => {
        const row = [
          index + 1,
          a.prefix || "",
          a.firstName || "",
          a.lastName || "",
          a.regType?.name || "",
          a.position?.name || a.positionOther || "",
          a.level?.name || "",
          a.phone || "",
          a.email || "",
          a.line || "",
          a.foodType ? foodLabels[a.foodType] : "",
          statusLabels[a.status] || "",
        ];
        csvContent += row.map((v) => `"${v}"`).join(",") + "\n";
      });
    }

    if (type === "travel") {
      const headers = [
        "ลำดับ",
        "ชื่อ-นามสกุล",
        "การเดินทาง",
        "ขาไป",
        "สายการบิน/เส้นทาง",
        "ขากลับ",
        "สายการบิน/เส้นทาง",
        "รถรับ-ส่ง",
      ];

      csvContent = BOM + headers.join(",") + "\n";

      attendees
        .filter((a) => a.vehicleType)
        .forEach((a, index) => {
          let outDate = "";
          let outLine = "";
          let inDate = "";
          let inLine = "";

          if (a.vehicleType === 1) {
            outDate = a.airDate1?.toISOString().split("T")[0] || "";
            outLine = `${a.airline1 || ""} ${a.flightNo1 || ""}`;
            inDate = a.airDate2?.toISOString().split("T")[0] || "";
            inLine = `${a.airline2 || ""} ${a.flightNo2 || ""}`;
          } else if (a.vehicleType === 2) {
            outDate = a.busDate1?.toISOString().split("T")[0] || "";
            outLine = a.busLine1 || "";
            inDate = a.busDate2?.toISOString().split("T")[0] || "";
            inLine = a.busLine2 || "";
          } else if (a.vehicleType === 4) {
            outDate = a.trainDate1?.toISOString().split("T")[0] || "";
            outLine = a.trainLine1 || "";
            inDate = a.trainDate2?.toISOString().split("T")[0] || "";
            inLine = a.trainLine2 || "";
          }

          const row = [
            index + 1,
            `${a.prefix || ""}${a.firstName || ""} ${a.lastName || ""}`,
            a.vehicleType ? vehicleLabels[a.vehicleType] : "",
            outDate,
            outLine,
            inDate,
            inLine,
            a.busToMeet === 1 ? "ต้องการ" : "ไม่ต้องการ",
          ];
          csvContent += row.map((v) => `"${v}"`).join(",") + "\n";
        });
    }

    if (type === "payment") {
      const finances = await prisma.finance.findMany({
        where: { member: { hospitalCode } },
        include: { member: true },
        orderBy: { createdAt: "desc" },
      });

      const headers = [
        "ลำดับ",
        "รายการ",
        "จำนวนคน",
        "วันที่ส่ง",
        "สถานะ",
        "วันที่ยืนยัน",
      ];

      csvContent = BOM + headers.join(",") + "\n";

      finances.forEach((f, index) => {
        const attendeeCount = f.attendeeIds?.split(",").length || 0;
        const row = [
          index + 1,
          `#${f.id}`,
          attendeeCount,
          f.createdAt.toISOString().split("T")[0],
          f.status === 1 ? "รอตรวจสอบ" : f.status === 2 ? "ผ่าน" : "ไม่ผ่าน",
          f.confirmedAt?.toISOString().split("T")[0] || "-",
        ];
        csvContent += row.map((v) => `"${v}"`).join(",") + "\n";
      });
    }

    // Return CSV file
    const contentType =
      format === "excel"
        ? "application/vnd.ms-excel"
        : "text/csv;charset=utf-8";

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="report_${type}_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
