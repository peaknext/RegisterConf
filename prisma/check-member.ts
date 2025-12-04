import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Check if member 152 exists
  const member152 = await prisma.member.findUnique({ where: { id: 152 } });
  console.log("Member 152:", member152 ? member152.email : "NOT FOUND");

  // Check what members exist around that ID
  const members = await prisma.member.findMany({
    where: { id: { gte: 150, lte: 155 } },
    select: { id: true, email: true },
  });
  console.log("\nMembers 150-155:");
  members.forEach((m) => console.log(`  ${m.id}: ${m.email}`));

  // Check the schema constraint
  console.log("\n=== Checking Attendee schema ===");
  const attendeeWithCreatedBy = await prisma.attendee.findFirst({
    where: { createdBy: { not: null } },
    select: { id: true, createdBy: true },
  });
  console.log("Sample attendee with createdBy:", attendeeWithCreatedBy);

  await prisma.$disconnect();
}

main();
