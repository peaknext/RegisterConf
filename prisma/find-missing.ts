import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

// Parse INSERT values from SQL
function parseInsertValues(sql: string, tableName: string): string[] {
  const results: string[] = [];
  const pattern = new RegExp(`INSERT INTO \`${tableName}\`[^;]*;`, "gi");
  let match;
  while ((match = pattern.exec(sql)) !== null) {
    const statement = match[0];
    const valuesMatch = statement.match(/VALUES\s*([\s\S]*?);$/i);
    if (!valuesMatch) continue;
    const valuesStr = valuesMatch[1];
    let depth = 0,
      currentRow = "",
      inString = false,
      stringChar = "";
    for (let i = 0; i < valuesStr.length; i++) {
      const char = valuesStr[i];
      const prevChar = i > 0 ? valuesStr[i - 1] : "";
      if (!inString) {
        if (char === "'" || char === '"') {
          inString = true;
          stringChar = char;
          currentRow += char;
        } else if (char === "(") {
          depth++;
          if (depth === 1) currentRow = "";
          else currentRow += char;
        } else if (char === ")") {
          depth--;
          if (depth === 0) {
            results.push(currentRow);
            currentRow = "";
          } else currentRow += char;
        } else if (depth > 0) currentRow += char;
      } else {
        currentRow += char;
        if (char === stringChar && prevChar !== "\\") {
          if (valuesStr[i + 1] !== stringChar) inString = false;
          else {
            currentRow += valuesStr[i + 1];
            i++;
          }
        }
      }
    }
  }
  return results;
}

async function main() {
  const sql = fs.readFileSync(
    path.join(__dirname, "..", "vachira_register.sql"),
    "utf-8"
  );
  const attendeeRows = parseInsertValues(sql, "attendee");

  // Get all migrated attendee IDs
  const migrated = await prisma.attendee.findMany({ select: { id: true } });
  const migratedIds = new Set(migrated.map((a) => a.id));

  // Find missing attendees
  interface MissingAttendee {
    id: number;
    hosCode: string;
    type: string;
    prefix: string;
    fname: string;
    lname: string;
  }

  const missing: MissingAttendee[] = [];
  for (const row of attendeeRows) {
    const idMatch = row.match(/^(\d+)/);
    if (idMatch) {
      const id = parseInt(idMatch[1], 10);
      if (!migratedIds.has(id)) {
        // Extract more info - split carefully
        const parts: string[] = [];
        let current = "";
        let inStr = false;
        let strChar = "";
        for (let i = 0; i < row.length; i++) {
          const c = row[i];
          if (!inStr) {
            if (c === "'" || c === '"') {
              inStr = true;
              strChar = c;
            } else if (c === ",") {
              parts.push(current.trim());
              current = "";
              continue;
            }
          } else {
            if (c === strChar && row[i + 1] !== strChar) {
              inStr = false;
            }
          }
          current += c;
        }
        parts.push(current.trim());

        const hosCode = parts[1]?.replace(/'/g, "") || "";
        const type = parts[2]?.replace(/'/g, "") || "";
        const prefix = parts[3]?.replace(/'/g, "") || "";
        const fname = parts[4]?.replace(/'/g, "") || "";
        const lname = parts[5]?.replace(/'/g, "") || "";
        missing.push({ id, hosCode, type, prefix, fname, lname });
      }
    }
  }

  console.log(
    `=== Attendees ที่ไม่ได้ migrate (${missing.length} รายการ) ===\n`
  );
  console.log("ID\t\tHospital\tType\tชื่อ");
  console.log("-------------------------------------------------------------");
  for (const m of missing) {
    console.log(`${m.id}\t\t${m.hosCode}\t\t${m.type}\t${m.prefix}${m.fname} ${m.lname}`);
  }

  // Check why they failed - look for hospitals that don't exist
  console.log("\n=== สาเหตุที่ไม่ได้ migrate ===");
  const hospitals = await prisma.hospital.findMany({ select: { code: true } });
  const hospitalCodes = new Set(hospitals.map((h) => h.code));

  const invalidHospitals = missing.filter((m) => !hospitalCodes.has(m.hosCode));
  if (invalidHospitals.length > 0) {
    console.log(
      `\nHospital code ไม่มีในระบบ (${invalidHospitals.length} รายการ):`
    );
    const uniqueHospitals = Array.from(new Set(invalidHospitals.map((m) => m.hosCode)));
    console.log(uniqueHospitals.join(", "));
  }

  const validHospitals = missing.filter((m) => hospitalCodes.has(m.hosCode));
  if (validHospitals.length > 0) {
    console.log(`\nมี Hospital code แต่ error อื่น (${validHospitals.length} รายการ):`);
    for (const m of validHospitals) {
      console.log(`  ${m.id}: ${m.hosCode} - ${m.prefix}${m.fname} ${m.lname}`);
    }
  }

  await prisma.$disconnect();
}

main();
