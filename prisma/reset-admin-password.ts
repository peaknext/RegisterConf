import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";

const prisma = new PrismaClient();

function md5(str: string): string {
  return createHash("md5").update(str).digest("hex");
}

async function main() {
  const newPassword = "admin123";
  const hashedPassword = md5(newPassword);

  console.log(`Setting admin password to: ${newPassword}`);
  console.log(`MD5 hash: ${hashedPassword}`);

  // Update admin account
  const result = await prisma.member.update({
    where: { email: "admin@gmail.com" },
    data: { password: hashedPassword },
  });

  console.log(`\nUpdated member ID: ${result.id}`);
  console.log(`Email: ${result.email}`);
  console.log(`\n✅ You can now login with:`);
  console.log(`   Email: admin@gmail.com`);
  console.log(`   Password: admin123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
