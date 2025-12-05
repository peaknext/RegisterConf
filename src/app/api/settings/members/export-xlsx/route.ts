import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

// GET export members list to Excel
export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.memberType !== 99) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all members with hospital info
    const members = await prisma.member.findMany({
      include: {
        hospital: {
          select: { code: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Members");

    // Define columns
    worksheet.columns = [
      { header: "Hospital", key: "hospital", width: 40 },
      { header: "Email", key: "email", width: 35 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true, size: 12 };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };
    worksheet.getRow(1).alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    // Add data rows
    members.forEach((member) => {
      worksheet.addRow({
        hospital: member.hospital
          ? `${member.hospital.name} (${member.hospital.code})`
          : "Admin",
        email: member.email,
      });
    });

    // Add borders to all cells
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Return file response
    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=members_${new Date().toISOString().split("T")[0]}.xlsx`,
      },
    });
  } catch (error) {
    console.error("Error exporting members:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
