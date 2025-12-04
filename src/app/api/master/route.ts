import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const zoneCode = searchParams.get("zoneCode");
    const province = searchParams.get("province");

    switch (type) {
      case "zones":
        const zones = await prisma.zone.findMany({
          orderBy: { code: "asc" },
        });
        return NextResponse.json(zones);

      case "provinces":
        // Get distinct provinces from hospitals, optionally filtered by zone
        const whereProvince: { zoneCode?: string; province: { not: null } } = {
          province: { not: null },
        };
        if (zoneCode) {
          whereProvince.zoneCode = zoneCode;
        }
        const hospitals = await prisma.hospital.findMany({
          where: whereProvince,
          select: { province: true },
          distinct: ["province"],
          orderBy: { province: "asc" },
        });
        const provinces = hospitals
          .map((h) => h.province)
          .filter((p): p is string => p !== null);
        return NextResponse.json(provinces);

      case "hospitals":
        // Get hospitals filtered by zone and/or province
        const whereHospital: {
          zoneCode?: string;
          province?: string;
        } = {};
        if (zoneCode) {
          whereHospital.zoneCode = zoneCode;
        }
        if (province) {
          whereHospital.province = province;
        }
        const hospitalList = await prisma.hospital.findMany({
          where: whereHospital,
          select: {
            code: true,
            name: true,
            province: true,
            zoneCode: true,
          },
          orderBy: { name: "asc" },
        });
        return NextResponse.json(hospitalList);

      case "levelGroups":
        // Get distinct level groups
        const levels = await prisma.level.findMany({
          where: { status: 1, group: { not: null } },
          select: { group: true },
          distinct: ["group"],
          orderBy: { group: "asc" },
        });
        const groups = levels
          .map((l) => l.group)
          .filter((g): g is string => g !== null);
        return NextResponse.json(groups);

      case "levelsByGroup":
        const group = searchParams.get("group");
        if (!group) {
          return NextResponse.json(
            { error: "group parameter required" },
            { status: 400 }
          );
        }
        const levelsByGroup = await prisma.level.findMany({
          where: { status: 1, group },
          select: { code: true, name: true },
          orderBy: { code: "asc" },
        });
        return NextResponse.json(levelsByGroup);

      default:
        return NextResponse.json(
          { error: "Invalid type parameter" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error fetching master data:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูล" },
      { status: 500 }
    );
  }
}
