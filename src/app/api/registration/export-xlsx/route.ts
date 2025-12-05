import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

// Status mappings
const statusLabels: Record<number, string> = {
  1: "ค้างชำระ",
  2: "รอตรวจสอบ",
  3: "ยกเลิก",
  9: "ชำระแล้ว",
};

const foodLabels: Record<number, string> = {
  1: "อาหารทั่วไป",
  2: "อาหารอิสลาม",
  3: "อาหารมังสวิรัติ",
  4: "อาหารเจ",
};

const vehicleLabels: Record<number, string> = {
  1: "เครื่องบิน",
  2: "รถโดยสาร",
  3: "รถยนต์ส่วนตัว/ราชการ",
  4: "รถไฟ",
};

function formatDate(date: Date | null): string {
  if (!date) return "";
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatDateTime(date: Date | null, time: Date | null): string {
  if (!date) return "";
  const dateStr = formatDate(date);
  if (!time) return dateStr;
  const timeStr = time.toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${dateStr} เวลา ${timeStr}`;
}

function formatTravelDetails(attendee: {
  vehicleType: number | null;
  // Plane
  airDate1: Date | null;
  airTime1: Date | null;
  airline1: string | null;
  flightNo1: string | null;
  airDate2: Date | null;
  airTime2: Date | null;
  airline2: string | null;
  flightNo2: string | null;
  // Bus
  busDate1: Date | null;
  busTime1: Date | null;
  busLine1: string | null;
  busDate2: Date | null;
  busTime2: Date | null;
  busLine2: string | null;
  // Train
  trainDate1: Date | null;
  trainTime1: Date | null;
  trainLine1: string | null;
  trainDate2: Date | null;
  trainTime2: Date | null;
  trainLine2: string | null;
}): string {
  const lines: string[] = [];

  if (attendee.vehicleType === 1) {
    // Plane
    if (attendee.airDate1) {
      const airlineInfo = [attendee.airline1, attendee.flightNo1]
        .filter(Boolean)
        .join(" ");
      lines.push(
        `เดินทางถึงวันที่ ${formatDateTime(
          attendee.airDate1,
          attendee.airTime1
        )}${airlineInfo ? ` (${airlineInfo})` : ""}`
      );
    }
    if (attendee.airDate2) {
      const airlineInfo = [attendee.airline2, attendee.flightNo2]
        .filter(Boolean)
        .join(" ");
      lines.push(
        `เดินทางกลับวันที่ ${formatDateTime(
          attendee.airDate2,
          attendee.airTime2
        )}${airlineInfo ? ` (${airlineInfo})` : ""}`
      );
    }
  } else if (attendee.vehicleType === 2) {
    // Bus
    if (attendee.busDate1) {
      lines.push(
        `เดินทางถึงวันที่ ${formatDateTime(
          attendee.busDate1,
          attendee.busTime1
        )}${attendee.busLine1 ? ` (${attendee.busLine1})` : ""}`
      );
    }
    if (attendee.busDate2) {
      lines.push(
        `เดินทางกลับวันที่ ${formatDateTime(
          attendee.busDate2,
          attendee.busTime2
        )}${attendee.busLine2 ? ` (${attendee.busLine2})` : ""}`
      );
    }
  } else if (attendee.vehicleType === 4) {
    // Train
    if (attendee.trainDate1) {
      lines.push(
        `เดินทางถึงวันที่ ${formatDateTime(
          attendee.trainDate1,
          attendee.trainTime1
        )}${attendee.trainLine1 ? ` (${attendee.trainLine1})` : ""}`
      );
    }
    if (attendee.trainDate2) {
      lines.push(
        `เดินทางกลับวันที่ ${formatDateTime(
          attendee.trainDate2,
          attendee.trainTime2
        )}${attendee.trainLine2 ? ` (${attendee.trainLine2})` : ""}`
      );
    }
  }

  return lines.join("\n");
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const isAdmin = session.user.memberType === 99;
    const userHospitalCode = session.user.hospitalCode;

    // Get filter params from URL (same as registration page)
    const search = searchParams.get("search");
    const zoneCode = searchParams.get("zone");
    const province = searchParams.get("province");
    const hospitalCode = searchParams.get("hospital");
    const paymentStatus = searchParams.get("status");

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    // Hospital access control
    if (!isAdmin) {
      where.hospitalCode = userHospitalCode;
    } else {
      // Admin filters
      if (hospitalCode && hospitalCode !== "all") {
        where.hospitalCode = hospitalCode;
      } else if (province && province !== "all") {
        where.hospital = { ...where.hospital, province };
      }
      if (zoneCode && zoneCode !== "all") {
        where.hospital = { ...where.hospital, zoneCode };
      }
    }

    // Payment status filter
    if (paymentStatus && paymentStatus !== "all") {
      where.status = parseInt(paymentStatus);
    }

    // Search filter
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { hospital: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Fetch attendees
    const attendees = await prisma.attendee.findMany({
      where,
      include: {
        regType: true,
        position: true,
        level: true,
        hotel: true,
        hospital: {
          include: {
            zone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Fetch finance data for payment dates
    const attendeeIds = attendees.map((a) => a.id);
    const finances = await prisma.finance.findMany({
      where: {
        attendeeIds: {
          not: null,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Create maps for finance data
    const financeData = new Map<
      number,
      {
        paidDate: Date | null;
        createdAt: Date | null;
        confirmedAt: Date | null;
      }
    >();
    finances.forEach((f) => {
      if (f.attendeeIds) {
        const ids = f.attendeeIds.split(",").map((id) => parseInt(id.trim()));
        ids.forEach((id) => {
          if (attendeeIds.includes(id) && !financeData.has(id)) {
            financeData.set(id, {
              paidDate: f.paidDate,
              createdAt: f.createdAt,
              confirmedAt: f.status === 2 ? f.confirmedAt : null,
            });
          }
        });
      }
    });

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Conference Registration System";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("รายการลงทะเบียน", {
      properties: { defaultRowHeight: 22 },
    });

    // Define columns (16 columns as requested)
    worksheet.columns = [
      { header: "ลำดับ", key: "index", width: 8 },
      { header: "วัน-เดือน-ปี ที่ลงทะเบียน", key: "createdAt", width: 18 },
      { header: "สถานที่ปฏิบัติงาน", key: "hospital", width: 30 },
      { header: "ประเภทผู้เข้าร่วมประชุม", key: "regType", width: 22 },
      { header: "ชื่อ - สกุล", key: "fullName", width: 28 },
      { header: "ตำแหน่ง", key: "position", width: 22 },
      { header: "เบอร์โทรศัพท์", key: "phone", width: 14 },
      { header: "อีเมล", key: "email", width: 26 },
      { header: "อาหาร", key: "food", width: 16 },
      { header: "ที่พัก", key: "hotel", width: 24 },
      { header: "ประเภทการเดินทาง", key: "vehicleType", width: 18 },
      { header: "รายละเอียดการเดินทาง", key: "travelDetails", width: 45 },
      { header: "สถานะ", key: "status", width: 14 },
      { header: "วันที่โอนเงิน", key: "paidDate", width: 16 },
      { header: "วันที่แจ้งชำระเงิน", key: "notifyDate", width: 16 },
      { header: "วันที่ยืนยันชำระเงิน", key: "confirmedDate", width: 18 },
    ];

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, size: 11, color: { argb: "FF1E3A5F" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0F2FE" },
    };
    headerRow.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    headerRow.height = 32;

    // Add data rows
    attendees.forEach((a, index) => {
      const finance = financeData.get(a.id);
      const positionName = a.position?.name || a.positionOther || "";
      const levelName = a.level?.name || "";
      const positionDisplay = [positionName, levelName]
        .filter(Boolean)
        .join("");

      const row = worksheet.addRow({
        index: index + 1,
        createdAt: formatDate(a.createdAt),
        hospital: a.hospital?.name || "",
        regType: a.regType?.name || "",
        fullName: `${a.prefix || ""}${a.firstName || ""} ${
          a.lastName || ""
        }`.trim(),
        position: positionDisplay,
        phone: a.phone || "",
        email: a.email || "",
        food: a.foodType ? foodLabels[a.foodType] : "",
        hotel: a.hotel?.name || a.hotelOther || "",
        vehicleType: a.vehicleType ? vehicleLabels[a.vehicleType] : "",
        travelDetails: formatTravelDetails(a),
        status: statusLabels[a.status] || "",
        paidDate: finance?.paidDate ? formatDate(finance.paidDate) : "",
        notifyDate: finance?.createdAt ? formatDate(finance.createdAt) : "",
        confirmedDate: finance?.confirmedAt
          ? formatDate(finance.confirmedAt)
          : "",
      });

      // Style data rows
      row.alignment = { vertical: "middle", wrapText: true };
      row.height = 26;

      // Alternating row colors
      if (index % 2 === 1) {
        row.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF8FAFC" },
        };
      }

      // Color coding for payment status
      const statusCell = row.getCell("status");
      if (a.status === 9) {
        statusCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFD1FAE5" },
        };
        statusCell.font = { color: { argb: "FF047857" }, bold: true };
      } else if (a.status === 1) {
        statusCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFEF3C7" },
        };
        statusCell.font = { color: { argb: "FFB45309" }, bold: true };
      } else if (a.status === 2) {
        statusCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFCFFAFE" },
        };
        statusCell.font = { color: { argb: "FF0E7490" }, bold: true };
      } else if (a.status === 3) {
        statusCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFEE2E2" },
        };
        statusCell.font = { color: { argb: "FFDC2626" }, bold: true };
      }
    });

    // Add borders to all cells
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FFE2E8F0" } },
          left: { style: "thin", color: { argb: "FFE2E8F0" } },
          bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
          right: { style: "thin", color: { argb: "FFE2E8F0" } },
        };
      });
    });

    // Freeze header row
    worksheet.views = [{ state: "frozen", ySplit: 1 }];

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Create filename
    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `registration_${dateStr}.xlsx`;

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
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
