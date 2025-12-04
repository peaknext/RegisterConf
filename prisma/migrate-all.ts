import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

// Simpler parser for MySQL INSERT statements
function parseInsertValues(sql: string, tableName: string): string[][] {
  const results: string[][] = [];

  // Find all INSERT statements for the table
  const pattern = new RegExp(
    `INSERT INTO \`${tableName}\`[^;]*;`,
    "gi"
  );

  let match;
  while ((match = pattern.exec(sql)) !== null) {
    const statement = match[0];

    // Extract the VALUES part
    const valuesMatch = statement.match(/VALUES\s*([\s\S]*?);$/i);
    if (!valuesMatch) continue;

    const valuesStr = valuesMatch[1];

    // Split into individual rows - find each (...) group
    let depth = 0;
    let currentRow = "";
    let inString = false;
    let stringChar = "";

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
          if (depth === 1) {
            currentRow = "";
          } else {
            currentRow += char;
          }
        } else if (char === ")") {
          depth--;
          if (depth === 0) {
            // End of row
            const values = parseRowValues(currentRow);
            if (values.length > 0) {
              results.push(values);
            }
            currentRow = "";
          } else {
            currentRow += char;
          }
        } else if (depth > 0) {
          currentRow += char;
        }
      } else {
        currentRow += char;
        if (char === stringChar && prevChar !== "\\") {
          // Check for escaped quote ('')
          if (valuesStr[i + 1] !== stringChar) {
            inString = false;
          } else {
            // Skip next quote (escaped)
            currentRow += valuesStr[i + 1];
            i++;
          }
        }
      }
    }
  }

  return results;
}

// Parse individual row values
function parseRowValues(rowStr: string): string[] {
  const values: string[] = [];
  let current = "";
  let inString = false;
  let stringChar = "";

  for (let i = 0; i < rowStr.length; i++) {
    const char = rowStr[i];
    const prevChar = i > 0 ? rowStr[i - 1] : "";

    if (!inString) {
      if (char === "'" || char === '"') {
        inString = true;
        stringChar = char;
        // Don't add quote to value
      } else if (char === ",") {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    } else {
      if (char === stringChar) {
        // Check for escaped quote
        if (rowStr[i + 1] === stringChar) {
          current += char;
          i++; // Skip next char
        } else if (prevChar === "\\") {
          current += char;
        } else {
          // End of string
          inString = false;
        }
      } else if (char === "\\" && rowStr[i + 1] === stringChar) {
        // Skip escape char
      } else {
        current += char;
      }
    }
  }

  // Don't forget last value
  values.push(current.trim());

  return values;
}

// Helper to safely parse values
function toInt(val: string | undefined): number | null {
  if (!val || val === "NULL" || val === "null") return null;
  const num = parseInt(val, 10);
  return isNaN(num) ? null : num;
}

function toStr(val: string | undefined): string | null {
  if (!val || val === "NULL" || val === "null") return null;
  return val;
}

function toDate(val: string | undefined): Date | null {
  if (!val || val === "NULL" || val === "null") return null;
  // Skip placeholder dates
  if (val.startsWith("1976") || val.startsWith("0000")) return null;
  const date = new Date(val);
  return isNaN(date.getTime()) ? null : date;
}

async function main() {
  console.log("=== Full Data Migration ===\n");

  // Read SQL file
  const sqlPath = path.join(__dirname, "..", "vachira_register.sql");
  console.log("Reading SQL file...");
  const sql = fs.readFileSync(sqlPath, "utf-8");
  console.log(`SQL file size: ${(sql.length / 1024 / 1024).toFixed(2)} MB\n`);

  // === Migrate Zone C01 (central government) ===
  console.log("--- Adding Zone C01 ---");
  try {
    await prisma.zone.upsert({
      where: { code: "C01" },
      update: {},
      create: { code: "C01", name: "ส่วนกลาง" },
    });
    console.log("Zone C01 added\n");
  } catch (e) {
    console.log("Zone C01 already exists\n");
  }

  // === Migrate Hospitals ===
  console.log("--- Migrating Hospitals ---");
  const hospitalRows = parseInsertValues(sql, "hospital");
  console.log(`Found ${hospitalRows.length} hospital rows`);

  let hospitalCount = 0;
  for (const row of hospitalRows) {
    // Columns: id, hospital_type, hospital_name, zone, province
    const [id, hospitalType, name, zone, province] = row;

    try {
      await prisma.hospital.upsert({
        where: { code: id || "" },
        update: {
          hospitalType: toStr(hospitalType),
          name: name || "",
          province: toStr(province),
          zoneCode: toStr(zone),
        },
        create: {
          code: id || "",
          hospitalType: toStr(hospitalType),
          name: name || "",
          province: toStr(province),
          zoneCode: toStr(zone),
        },
      });
      hospitalCount++;
    } catch (error: unknown) {
      const err = error as Error;
      console.error(`Error hospital ${id}: ${err.message.substring(0, 50)}`);
    }
  }
  console.log(`Migrated/Updated ${hospitalCount} hospitals\n`);

  // === Migrate Members ===
  console.log("--- Migrating Members ---");
  const memberRows = parseInsertValues(sql, "member");
  console.log(`Found ${memberRows.length} member rows`);

  // Clear and migrate
  await prisma.member.deleteMany();

  let memberCount = 0;
  const memberSkipped: string[] = [];

  for (const row of memberRows) {
    // Columns: member_id, member_email, member_password, member_hospital, member_type, member_create
    const [id, email, password, hospital, memberType, created] = row;

    try {
      // Check for duplicate email
      const existing = await prisma.member.findUnique({ where: { email: email || "" } });
      if (existing) {
        memberSkipped.push(`${id}: ${email} (duplicate)`);
        continue;
      }

      await prisma.member.create({
        data: {
          id: toInt(id) || undefined,
          email: email || `member_${id}@temp.com`,
          password: password || "",
          hospitalCode: toStr(hospital),
          memberType: toInt(memberType) || 1,
          createdAt: toDate(created) || undefined,
        },
      });
      memberCount++;
    } catch (error: unknown) {
      const err = error as Error;
      console.error(`Error member ${id}: ${err.message}`);
    }
  }
  console.log(`Migrated ${memberCount} members (skipped ${memberSkipped.length} duplicates)\n`);

  // === Migrate Attendees ===
  console.log("--- Migrating Attendees ---");
  const attendeeRows = parseInsertValues(sql, "attendee");
  console.log(`Found ${attendeeRows.length} attendee rows`);

  // Get valid member IDs to check foreign key
  const validMembers = await prisma.member.findMany({ select: { id: true } });
  const validMemberIds = new Set(validMembers.map((m) => m.id));
  console.log(`Valid member IDs: ${validMemberIds.size}`);

  await prisma.attendee.deleteMany();

  let attendeeCount = 0;
  let nullCreatedByCount = 0;
  const batchSize = 100;

  for (let i = 0; i < attendeeRows.length; i += batchSize) {
    const batch = attendeeRows.slice(i, i + batchSize);

    for (const row of batch) {
      // Columns: att_id, att_hos, att_type, att_pname, att_fname, att_lname, att_position, att_positionother,
      //          att_gp, att_gpother, att_level, att_tel, att_email, att_line, att_food, att_vehicle,
      //          att_airdd1, att_airline1, att_airflights1, att_airtime1, att_airdd2, att_airline2, att_airflights2, att_airtime2, att_airsutter,
      //          att_busdd1, att_busline1, att_bustime1, att_busdd2, att_busline2, att_bustime2, att_bussutter,
      //          att_traindd1, att_trainline1, att_traintime1, att_traindd2, att_trainline2, att_traintime2, att_trainsutter,
      //          att_hotel, att_hotelother, att_who, att_datetime, att_status, att_lastupdate, att_whocancal, att_bustomeet
      const [
        id, hos, type, pname, fname, lname, position, positionOther,
        gp, gpOther, level, tel, email, line, food, vehicle,
        airdd1, airline1, airflights1, _airtime1, airdd2, airline2, airflights2, _airtime2, airsutter,
        busdd1, busline1, _bustime1, busdd2, busline2, _bustime2, bussutter,
        traindd1, trainline1, _traintime1, traindd2, trainline2, _traintime2, trainsutter,
        hotel, hotelOther, who, datetime, status, _lastupdate, whocancal, bustomeet
      ] = row;

      // Check if createdBy member exists, if not set to null
      const createdById = toInt(who);
      const validCreatedBy = createdById && validMemberIds.has(createdById) ? createdById : null;
      if (createdById && !validCreatedBy) {
        nullCreatedByCount++;
      }

      try {
        await prisma.attendee.create({
          data: {
            id: toInt(id) || undefined,
            hospitalCode: toStr(hos),
            regTypeId: toInt(type),
            prefix: toStr(pname),
            firstName: toStr(fname),
            lastName: toStr(lname),
            positionCode: toStr(position),
            positionOther: toStr(positionOther),
            gpCode: toStr(gp),
            gpOther: toStr(gpOther),
            levelCode: toStr(level),
            phone: toStr(tel),
            email: toStr(email),
            line: toStr(line),
            foodType: toInt(food),
            vehicleType: toInt(vehicle),
            airDate1: toDate(airdd1),
            airline1: toStr(airline1),
            flightNo1: toStr(airflights1),
            airDate2: toDate(airdd2),
            airline2: toStr(airline2),
            flightNo2: toStr(airflights2),
            airShuttle: toInt(airsutter),
            busDate1: toDate(busdd1),
            busLine1: toStr(busline1),
            busDate2: toDate(busdd2),
            busLine2: toStr(busline2),
            busShuttle: toInt(bussutter),
            trainDate1: toDate(traindd1),
            trainLine1: toStr(trainline1),
            trainDate2: toDate(traindd2),
            trainLine2: toStr(trainline2),
            trainShuttle: toInt(trainsutter),
            hotelId: toInt(hotel),
            hotelOther: toStr(hotelOther),
            createdBy: validCreatedBy,
            createdAt: toDate(datetime) || undefined,
            status: toInt(status) || 1,
            cancelledBy: toInt(whocancal),
            busToMeet: toInt(bustomeet),
          },
        });
        attendeeCount++;
      } catch (error: unknown) {
        const err = error as Error;
        if (!err.message.includes("Unique constraint")) {
          console.error(`Error attendee ${id}: ${err.message.substring(0, 100)}`);
        }
      }
    }

    process.stdout.write(`\rMigrated ${attendeeCount} attendees...`);
  }
  console.log(`\nMigrated ${attendeeCount} attendees total (${nullCreatedByCount} with createdBy set to null)\n`);

  // === Migrate Finances ===
  console.log("--- Migrating Finances ---");
  const financeRows = parseInsertValues(sql, "finance");
  console.log(`Found ${financeRows.length} finance rows`);

  await prisma.finance.deleteMany();

  let financeCount = 0;
  let nullMemberIdCount = 0;

  for (const row of financeRows) {
    // Columns: f_id, f_who, f_attid, f_filename, f_status, f_datetime, f_confirm, f_confirmdatetime, f_paid
    const [id, who, attid, filename, status, datetime, confirm, confirmdatetime, paid] = row;

    // Check if memberId exists, if not set to null
    const memberId = toInt(who);
    const validMemberId = memberId && validMemberIds.has(memberId) ? memberId : null;
    if (memberId && !validMemberId) {
      nullMemberIdCount++;
    }

    try {
      await prisma.finance.create({
        data: {
          id: toInt(id) || undefined,
          memberId: validMemberId,
          attendeeIds: toStr(attid),
          fileName: toStr(filename),
          status: toInt(status) || 1,
          createdAt: toDate(datetime) || undefined,
          confirmedBy: toInt(confirm),
          confirmedAt: toDate(confirmdatetime),
          paidDate: toDate(paid),
        },
      });
      financeCount++;
    } catch (error: unknown) {
      const err = error as Error;
      console.error(`Error finance ${id}: ${err.message.substring(0, 100)}`);
    }
  }
  console.log(`Migrated ${financeCount} finances (${nullMemberIdCount} with memberId set to null)\n`);

  // === Final Verification ===
  console.log("=== Migration Complete ===\n");
  console.log("Final counts:");
  console.log(`  Members: ${await prisma.member.count()}`);
  console.log(`  Attendees: ${await prisma.attendee.count()}`);
  console.log(`  Finances: ${await prisma.finance.count()}`);

  // Also print master data counts
  console.log("\nMaster data:");
  console.log(`  Zones: ${await prisma.zone.count()}`);
  console.log(`  Hospitals: ${await prisma.hospital.count()}`);
  console.log(`  Levels: ${await prisma.level.count()}`);
  console.log(`  Positions: ${await prisma.position.count()}`);
  console.log(`  RegTypes: ${await prisma.regType.count()}`);
  console.log(`  Airlines: ${await prisma.airline.count()}`);
  console.log(`  Hotels: ${await prisma.hotel.count()}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
