import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ReportsClient from "./ReportsClient";

async function getReportData(hospitalCode: string | null, isAdmin: boolean) {
  // Fetch all reference data
  const [zones, hospitals, positions, levels, hotels, regTypes] = await Promise.all([
    prisma.zone.findMany({
      orderBy: { code: "asc" },
    }),
    prisma.hospital.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.position.findMany({
      orderBy: { code: "asc" },
    }),
    prisma.level.findMany({
      orderBy: { code: "asc" },
    }),
    prisma.hotel.findMany({
      where: { status: "1" },
      orderBy: { id: "asc" },
    }),
    prisma.regType.findMany({
      orderBy: { id: "asc" },
    }),
  ]);

  // Fetch attendees - Admin sees all, hospital rep sees only their hospital
  const attendees = await prisma.attendee.findMany({
    where: isAdmin ? {} : { hospitalCode: hospitalCode || "" },
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

  return {
    zones,
    hospitals,
    positions,
    levels,
    hotels,
    regTypes,
    attendees,
  };
}

export default async function ReportsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const isAdmin = session.user.memberType === 99;

  // Only admin can access reports page
  if (!isAdmin) redirect("/portal/dashboard");

  const { zones, hospitals, positions, levels, hotels, regTypes, attendees } =
    await getReportData(session.user.hospitalCode, isAdmin);

  return (
    <ReportsClient
      zones={zones}
      hospitals={hospitals}
      positions={positions}
      levels={levels}
      hotels={hotels}
      regTypes={regTypes}
      attendees={attendees}
      isAdmin={isAdmin}
    />
  );
}
