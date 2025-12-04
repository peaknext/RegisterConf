import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { AttendeeRegisterForm } from "@/components/portal/AttendeeRegisterForm";

async function getAttendee(id: number, hospitalCode: string | null, isAdmin: boolean) {
  const attendee = await prisma.attendee.findFirst({
    where: isAdmin
      ? { id }
      : { id, hospitalCode: hospitalCode || undefined },
    include: {
      regType: true,
      position: true,
      level: true,
    },
  });

  if (!attendee) return null;

  // Query hospital separately with zone
  const hospital = attendee.hospitalCode
    ? await prisma.hospital.findUnique({
        where: { code: attendee.hospitalCode },
        include: { zone: true },
      })
    : null;

  return { ...attendee, hospital };
}

export default async function AttendeeEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const isAdmin = session.user.memberType === 99;
  const { id } = await params;

  // Load attendee and all master data in parallel
  const [
    attendee,
    regTypes,
    positions,
    levels,
    hotels,
    airlines,
    zones,
    hospitals,
    userHospital,
  ] = await Promise.all([
    getAttendee(parseInt(id), session.user.hospitalCode, isAdmin),
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

  if (!attendee) {
    notFound();
  }

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
      mode="edit"
      attendee={attendee}
    />
  );
}
