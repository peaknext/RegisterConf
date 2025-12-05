import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { StatsClient } from "./StatsClient";

// Data labels
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

export default async function StatsPage() {
  // Auth check
  const session = await auth();
  if (!session) redirect("/login");

  // Admin check
  if (session.user.memberType !== 99) {
    redirect("/portal/dashboard");
  }

  // Fetch all required data in parallel
  const [
    // Summary stats
    total,
    pending,
    reviewing,
    paid,
    // Master data
    zones,
    hospitals,
    regTypes,
    positions,
    hotels,
    // Attendee data for grouping
    attendees,
  ] = await Promise.all([
    // Summary counts
    prisma.attendee.count(),
    prisma.attendee.count({ where: { status: 1 } }),
    prisma.attendee.count({ where: { status: 2 } }),
    prisma.attendee.count({ where: { status: 9 } }),
    // Master data
    prisma.zone.findMany({ orderBy: { code: "asc" } }),
    prisma.hospital.findMany({
      include: { zone: true },
      orderBy: { name: "asc" },
    }),
    prisma.regType.findMany({ orderBy: { id: "asc" } }),
    prisma.position.findMany({ orderBy: { code: "asc" } }),
    prisma.hotel.findMany({
      where: { status: "y" },
      orderBy: { name: "asc" },
    }),
    // All attendees with relations
    prisma.attendee.findMany({
      select: {
        hospitalCode: true,
        status: true,
        regTypeId: true,
        positionCode: true,
        foodType: true,
        vehicleType: true,
        hotelId: true,
        busToMeet: true,
      },
    }),
  ]);

  // Create lookup maps
  const hospitalMap = new Map(
    hospitals.map((h) => [h.code, { name: h.name, zoneCode: h.zoneCode }])
  );
  const zoneMap = new Map(zones.map((z) => [z.code, z.name]));
  const regTypeMap = new Map(regTypes.map((r) => [r.id, r.name]));
  const positionMap = new Map(positions.map((p) => [p.code, p.name]));
  const hotelMap = new Map(hotels.map((h) => [h.id, h.name]));

  // Process by Zone
  const zoneStats = new Map<
    string,
    { paid: number; reviewing: number; pending: number }
  >();
  zones.forEach((z) => {
    zoneStats.set(z.code, { paid: 0, reviewing: 0, pending: 0 });
  });

  // Process by Hospital
  const hospitalStats = new Map<
    string,
    { paid: number; reviewing: number; pending: number }
  >();
  hospitals.forEach((h) => {
    hospitalStats.set(h.code, { paid: 0, reviewing: 0, pending: 0 });
  });

  // Process other stats
  const regTypeStats = new Map<number, number>();
  const positionStats = new Map<string, number>();
  const foodStats = new Map<number, number>();
  const vehicleStats = new Map<number, number>();
  const hotelStats = new Map<number, number>();
  const shuttleStats = new Map<number, number>();

  // Loop through attendees once
  attendees.forEach((a) => {
    const hospital = a.hospitalCode ? hospitalMap.get(a.hospitalCode) : null;
    const zoneCode = hospital?.zoneCode;

    // Zone stats
    if (zoneCode && zoneStats.has(zoneCode)) {
      const zs = zoneStats.get(zoneCode)!;
      if (a.status === 9) zs.paid++;
      else if (a.status === 2) zs.reviewing++;
      else if (a.status === 1) zs.pending++;
    }

    // Hospital stats
    if (a.hospitalCode && hospitalStats.has(a.hospitalCode)) {
      const hs = hospitalStats.get(a.hospitalCode)!;
      if (a.status === 9) hs.paid++;
      else if (a.status === 2) hs.reviewing++;
      else if (a.status === 1) hs.pending++;
    }

    // RegType stats
    if (a.regTypeId) {
      regTypeStats.set(a.regTypeId, (regTypeStats.get(a.regTypeId) || 0) + 1);
    }

    // Position stats
    if (a.positionCode) {
      positionStats.set(
        a.positionCode,
        (positionStats.get(a.positionCode) || 0) + 1
      );
    }

    // Food stats
    if (a.foodType) {
      foodStats.set(a.foodType, (foodStats.get(a.foodType) || 0) + 1);
    }

    // Vehicle stats
    if (a.vehicleType) {
      vehicleStats.set(a.vehicleType, (vehicleStats.get(a.vehicleType) || 0) + 1);
    }

    // Hotel stats
    if (a.hotelId) {
      hotelStats.set(a.hotelId, (hotelStats.get(a.hotelId) || 0) + 1);
    }

    // Shuttle stats
    if (a.busToMeet) {
      shuttleStats.set(a.busToMeet, (shuttleStats.get(a.busToMeet) || 0) + 1);
    }
  });

  // Transform data for client
  const byZone = zones.map((z) => {
    const stats = zoneStats.get(z.code) || { paid: 0, reviewing: 0, pending: 0 };
    return {
      name: z.name,
      code: z.code,
      paid: stats.paid,
      reviewing: stats.reviewing,
      pending: stats.pending,
      total: stats.paid + stats.reviewing + stats.pending,
    };
  });

  const byHospital = hospitals
    .map((h) => {
      const stats = hospitalStats.get(h.code) || {
        paid: 0,
        reviewing: 0,
        pending: 0,
      };
      const totalH = stats.paid + stats.reviewing + stats.pending;
      return {
        name: h.name,
        code: h.code,
        zoneCode: h.zoneCode || "",
        paid: stats.paid,
        reviewing: stats.reviewing,
        pending: stats.pending,
        total: totalH,
      };
    })
    .filter((h) => h.total > 0) // Only show hospitals with registrations
    .sort((a, b) => b.total - a.total); // Sort by total desc

  const byRegType = Array.from(regTypeStats.entries())
    .map(([id, count]) => ({
      name: regTypeMap.get(id) || "ไม่ระบุ",
      value: count,
    }))
    .sort((a, b) => b.value - a.value);

  const byPosition = Array.from(positionStats.entries())
    .map(([code, count]) => ({
      name: positionMap.get(code) || "ไม่ระบุ",
      value: count,
    }))
    .sort((a, b) => b.value - a.value);

  const byFood = Array.from(foodStats.entries())
    .map(([type, count]) => ({
      name: foodLabels[type] || "ไม่ระบุ",
      value: count,
    }))
    .sort((a, b) => b.value - a.value);

  const byVehicle = Array.from(vehicleStats.entries())
    .map(([type, count]) => ({
      name: vehicleLabels[type] || "ไม่ระบุ",
      value: count,
    }))
    .sort((a, b) => b.value - a.value);

  const byHotel = Array.from(hotelStats.entries())
    .map(([id, count]) => ({
      name: hotelMap.get(id) || "อื่นๆ",
      value: count,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // Top 10 hotels

  const byShuttle = Array.from(shuttleStats.entries())
    .map(([type, count]) => ({
      name: shuttleLabels[type] || "ไม่ระบุ",
      value: count,
    }))
    .sort((a, b) => a.name.localeCompare(b.name)); // Sort by name (ต้องการ first)

  return (
    <StatsClient
      summary={{ total, pending, reviewing, paid }}
      zones={zones.map((z) => ({ code: z.code, name: z.name }))}
      byZone={byZone}
      byHospital={byHospital}
      byRegType={byRegType}
      byPosition={byPosition}
      byFood={byFood}
      byVehicle={byVehicle}
      byHotel={byHotel}
      byShuttle={byShuttle}
    />
  );
}
