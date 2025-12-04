import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AttendeeRegisterForm } from "@/components/portal/AttendeeRegisterForm";

export default async function RegisterPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const isAdmin = session.user.memberType === 99;

  // Load all master data in parallel
  const [
    regTypes,
    positions,
    levels,
    hotels,
    airlines,
    zones,
    hospitals,
    userHospital,
  ] = await Promise.all([
    prisma.regType.findMany({
      orderBy: { id: "asc" },
    }),
    prisma.position.findMany({
      orderBy: { code: "asc" },
    }),
    prisma.level.findMany({
      where: { status: 1 },
      orderBy: { code: "asc" },
    }),
    prisma.hotel.findMany({
      where: { status: "y" },
      orderBy: { id: "asc" },
    }),
    prisma.airline.findMany({
      where: { status: "y" },
      orderBy: { id: "asc" },
    }),
    // Zones for cascade selection
    prisma.zone.findMany({
      orderBy: { code: "asc" },
    }),
    // All hospitals for admin
    isAdmin
      ? prisma.hospital.findMany({
          select: {
            code: true,
            name: true,
            province: true,
            zoneCode: true,
          },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
    // User's hospital info
    session.user.hospitalCode
      ? prisma.hospital.findUnique({
          where: { code: session.user.hospitalCode },
          include: { zone: true },
        })
      : Promise.resolve(null),
  ]);

  // Get distinct level groups
  const levelGroups = [
    ...new Set(
      levels.map((l) => l.group).filter((g): g is string => g !== null)
    ),
  ];

  return (
    <AttendeeRegisterForm
      regTypes={regTypes}
      positions={positions}
      levels={levels}
      levelGroups={levelGroups}
      hotels={hotels}
      airlines={airlines}
      zones={zones}
      hospitals={hospitals}
      userHospital={userHospital}
      isAdmin={isAdmin}
    />
  );
}
