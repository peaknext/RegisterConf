import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verify() {
  console.log("=== Data Verification ===\n");

  // Count all tables
  const counts = {
    zones: await prisma.zone.count(),
    hospitals: await prisma.hospital.count(),
    levels: await prisma.level.count(),
    positions: await prisma.position.count(),
    regTypes: await prisma.regType.count(),
    airlines: await prisma.airline.count(),
    hotels: await prisma.hotel.count(),
    members: await prisma.member.count(),
    attendees: await prisma.attendee.count(),
    finances: await prisma.finance.count(),
  };

  console.log("Table Counts:");
  console.log("-------------");
  Object.entries(counts).forEach(([table, count]) => {
    console.log(`${table.padEnd(12)}: ${count}`);
  });

  // Sample data
  console.log("\n=== Sample Data ===\n");

  // Sample zones
  console.log("Sample Zones:");
  const sampleZones = await prisma.zone.findMany({ take: 3 });
  sampleZones.forEach((z) => console.log(`  - ${z.code}: ${z.name}`));

  // Sample hospitals
  console.log("\nSample Hospitals:");
  const sampleHospitals = await prisma.hospital.findMany({
    take: 5,
    include: { zone: true },
  });
  sampleHospitals.forEach((h) =>
    console.log(`  - ${h.code}: ${h.name} (${h.zone?.name || "N/A"})`)
  );

  // Sample hotels
  console.log("\nSample Hotels:");
  const sampleHotels = await prisma.hotel.findMany({ take: 5 });
  sampleHotels.forEach((h) => console.log(`  - ${h.id}: ${h.name}`));

  // Sample members
  console.log("\nSample Members:");
  const sampleMembers = await prisma.member.findMany({
    take: 3,
    include: { hospital: true },
  });
  sampleMembers.forEach((m) =>
    console.log(
      `  - ${m.email} (${m.memberType === 99 ? "Admin" : "User"}) - ${m.hospital?.name || "N/A"}`
    )
  );

  // Sample levels
  console.log("\nSample Levels:");
  const sampleLevels = await prisma.level.findMany({ take: 5 });
  sampleLevels.forEach((l) =>
    console.log(`  - ${l.code}: ${l.group} - ${l.name}`)
  );

  console.log("\n=== Verification Complete ===");
}

verify()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
