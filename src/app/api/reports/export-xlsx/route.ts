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

const shuttleLabels: Record<number, string> = {
  1: "ต้องการ",
  2: "ไม่ต้องการ",
};

const regStatusLabels: Record<number, string> = {
  1: "ผู้อำนวยการ / ผู้บริหาร",
  2: "ผู้เกษียณอายุราชการ",
  3: "ผู้เข้าร่วมประชุม",
};

function formatDate(date: Date | null): string {
  if (!date) return "";
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admin can export reports
    if (session.user.memberType !== 99) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get("reportType") || "all";
    const zoneCode = searchParams.get("zoneCode");
    const province = searchParams.get("province");
    const hospitalCode = searchParams.get("hospitalCode");

    // Dynamic filters based on report type
    const positionCode = searchParams.get("positionCode");
    const positionGroup = searchParams.get("positionGroup");
    const levelCode = searchParams.get("levelCode");
    const regTypeId = searchParams.get("regTypeId");
    const foodType = searchParams.get("foodType");
    const hotelId = searchParams.get("hotelId");
    const busToMeet = searchParams.get("busToMeet");
    const vehicleType = searchParams.get("vehicleType");
    const airShuttle = searchParams.get("shuttle") || searchParams.get("airShuttle");
    const status = searchParams.get("paymentStatus") || searchParams.get("status");

    const isAdmin = session.user.memberType === 99;
    const userHospitalCode = session.user.hospitalCode;

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
        where.hospital = { province };
      } else if (zoneCode && zoneCode !== "all") {
        where.hospital = { zoneCode };
      }
    }

    // Report type specific filters
    if (reportType === "position") {
      if (positionCode && positionCode !== "all") {
        where.positionCode = positionCode;
      }
      if (positionGroup && positionGroup !== "all") {
        where.level = { ...where.level, group: positionGroup };
      }
      if (levelCode && levelCode !== "all") {
        where.levelCode = levelCode;
      }
    } else if (reportType === "regStatus") {
      if (regTypeId && regTypeId !== "all") {
        where.regTypeId = parseInt(regTypeId);
      }
    } else if (reportType === "food") {
      if (foodType && foodType !== "all") {
        where.foodType = parseInt(foodType);
      }
    } else if (reportType === "hotel") {
      if (hotelId && hotelId !== "all") {
        where.hotelId = parseInt(hotelId);
      }
      if (busToMeet && busToMeet !== "all") {
        where.busToMeet = parseInt(busToMeet);
      }
    } else if (reportType === "vehicle") {
      if (vehicleType && vehicleType !== "all") {
        where.vehicleType = parseInt(vehicleType);
      }
      if (airShuttle && airShuttle !== "all") {
        where.airShuttle = parseInt(airShuttle);
      }
    } else if (reportType === "payment") {
      if (status && status !== "all") {
        where.status = parseInt(status);
      }
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
      orderBy: { id: "asc" },
    });

    // Fetch finance data for payment status dates
    const attendeeIds = attendees.map((a) => a.id);
    const finances = await prisma.finance.findMany({
      where: {
        attendeeIds: {
          not: null,
        },
      },
      orderBy: { confirmedAt: "desc" },
    });

    // Create map of attendee ID to confirmed payment date
    const paymentDates = new Map<number, Date | null>();
    finances.forEach((f) => {
      if (f.attendeeIds && f.status === 2) {
        const ids = f.attendeeIds.split(",").map((id) => parseInt(id.trim()));
        ids.forEach((id) => {
          if (!paymentDates.has(id) && attendeeIds.includes(id)) {
            paymentDates.set(id, f.confirmedAt);
          }
        });
      }
    });

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Conference Registration System";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet("รายงาน", {
      properties: { defaultRowHeight: 20 },
    });

    // Define columns (30 columns)
    worksheet.columns = [
      { header: "ลำดับ", key: "index", width: 8 },
      { header: "เขตสุขภาพ / หน่วยราชการ", key: "zone", width: 25 },
      { header: "ชื่อ - สกุล", key: "fullName", width: 30 },
      { header: "สถานที่ปฏิบัติงาน", key: "hospital", width: 35 },
      { header: "วิชาชีพ", key: "position", width: 20 },
      { header: "ตำแหน่ง", key: "positionDetail", width: 25 },
      { header: "ระดับ", key: "level", width: 20 },
      { header: "เบอร์โทรศัพท์", key: "phone", width: 15 },
      { header: "Line ID", key: "line", width: 15 },
      { header: "อีเมล", key: "email", width: 25 },
      { header: "สถานะของผู้ลงทะเบียน", key: "regType", width: 20 },
      { header: "ประเภทอาหาร", key: "foodType", width: 15 },
      { header: "โรงแรมที่พัก", key: "hotel", width: 25 },
      { header: "ประเภทการเดินทาง", key: "vehicleType", width: 18 },
      { header: "สายการบินมา", key: "airline1", width: 15 },
      { header: "วันที่เดินทางมา (เครื่องบิน)", key: "airDate1", width: 22 },
      { header: "สายการบินกลับ", key: "airline2", width: 15 },
      { header: "วันที่เดินทางกลับ (เครื่องบิน)", key: "airDate2", width: 22 },
      { header: "เที่ยวรถมา", key: "busLine1", width: 20 },
      { header: "วันที่เดินทางมา (รถ)", key: "busDate1", width: 20 },
      { header: "เที่ยวรถกลับ", key: "busLine2", width: 20 },
      { header: "วันที่เดินทางกลับ (รถ)", key: "busDate2", width: 20 },
      { header: "ขบวนรถไฟมา", key: "trainLine1", width: 20 },
      { header: "วันที่เดินทางมา (รถไฟ)", key: "trainDate1", width: 20 },
      { header: "ขบวนรถไฟกลับ", key: "trainLine2", width: 20 },
      { header: "วันที่เดินทางกลับ (รถไฟ)", key: "trainDate2", width: 20 },
      { header: "รถรับ-ส่ง สนามบิน-ที่พัก", key: "airShuttle", width: 22 },
      { header: "รถรับ-ส่ง ที่พัก-ที่ประชุม", key: "busToMeet", width: 22 },
      { header: "สถานะการชำระเงิน", key: "status", width: 18 },
      { header: "วันที่โอนเงิน", key: "paidDate", width: 15 },
    ];

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, size: 11 };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE2E8F0" },
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    headerRow.height = 30;

    // Add data rows
    attendees.forEach((a, index) => {
      const row = worksheet.addRow({
        index: index + 1,
        zone: a.hospital?.zone?.name || "",
        fullName: `${a.prefix || ""}${a.firstName || ""} ${a.lastName || ""}`.trim(),
        hospital: a.hospital ? `${a.hospital.name}${a.hospital.province ? `, ${a.hospital.province}` : ""}` : "",
        position: a.position?.name || "",
        positionDetail: a.level?.group || "",
        level: a.level?.name || "",
        phone: a.phone || "",
        line: a.line || "",
        email: a.email || "",
        regType: a.regType?.name || (a.regTypeId ? regStatusLabels[a.regTypeId] : ""),
        foodType: a.foodType ? foodLabels[a.foodType] : "",
        hotel: a.hotel?.name || a.hotelOther || "",
        vehicleType: a.vehicleType ? vehicleLabels[a.vehicleType] : "",
        airline1: a.airline1 ? `${a.airline1} ${a.flightNo1 || ""}` : "",
        airDate1: formatDate(a.airDate1),
        airline2: a.airline2 ? `${a.airline2} ${a.flightNo2 || ""}` : "",
        airDate2: formatDate(a.airDate2),
        busLine1: a.busLine1 || "",
        busDate1: formatDate(a.busDate1),
        busLine2: a.busLine2 || "",
        busDate2: formatDate(a.busDate2),
        trainLine1: a.trainLine1 || "",
        trainDate1: formatDate(a.trainDate1),
        trainLine2: a.trainLine2 || "",
        trainDate2: formatDate(a.trainDate2),
        airShuttle: a.airShuttle ? shuttleLabels[a.airShuttle] : "",
        busToMeet: a.busToMeet ? shuttleLabels[a.busToMeet] : "",
        status: statusLabels[a.status] || "",
        paidDate: formatDate(paymentDates.get(a.id) || null),
      });

      // Style data rows
      row.alignment = { vertical: "middle" };
      row.height = 22;

      // Color coding for payment status
      const statusCell = row.getCell("status");
      if (a.status === 9) {
        statusCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFD1FAE5" },
        };
      } else if (a.status === 1) {
        statusCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFEF3C7" },
        };
      } else if (a.status === 2) {
        statusCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFCFFAFE" },
        };
      }
    });

    // Add borders to all cells
    worksheet.eachRow((row, rowNumber) => {
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
    const filename = `report_${reportType}_${dateStr}.xlsx`;

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
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
