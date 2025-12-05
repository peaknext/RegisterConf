import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createHash } from "crypto";

// MD5 hash function (same as auth.ts)
function md5(str: string): string {
  return createHash("md5").update(str).digest("hex");
}

// Email validation helper
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

interface ImportResult {
  success: boolean;
  successCount: number;
  failedCount: number;
  errors: Array<{ row: number; email: string; error: string }>;
}

// POST bulk import members from CSV
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || session.user.memberType !== 99) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.endsWith(".csv")) {
      return NextResponse.json(
        { error: "File must be a CSV file" },
        { status: 400 }
      );
    }

    // Read file content
    const fileContent = await file.text();
    const lines = fileContent.split("\n").map((line) => line.trim());

    if (lines.length < 2) {
      return NextResponse.json(
        { error: "CSV file must contain header and at least one data row" },
        { status: 400 }
      );
    }

    // Parse header
    const header = lines[0].split(",").map((col) => col.trim());
    const requiredColumns = ["email", "password", "hospitalCode", "memberType"];

    // Validate header
    const missingColumns = requiredColumns.filter(
      (col) => !header.includes(col)
    );
    if (missingColumns.length > 0) {
      return NextResponse.json(
        {
          error: `Missing required columns: ${missingColumns.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const result: ImportResult = {
      success: true,
      successCount: 0,
      failedCount: 0,
      errors: [],
    };

    // Get all existing emails for uniqueness check
    const existingMembers = await prisma.member.findMany({
      select: { email: true },
    });
    const existingEmails = new Set(existingMembers.map((m) => m.email));

    // Get all valid hospital codes
    const hospitals = await prisma.hospital.findMany({
      select: { code: true },
    });
    const validHospitalCodes = new Set(hospitals.map((h) => h.code));

    // Track emails in this import batch
    const importedEmailsInBatch = new Set<string>();

    // Process each data row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue; // Skip empty lines

      const rowNumber = i + 1;
      const values = line.split(",").map((val) => val.trim());

      // Create object from header and values
      const row: Record<string, string> = {};
      header.forEach((col, index) => {
        row[col] = values[index] || "";
      });

      const email = row.email;
      const password = row.password;
      const hospitalCode = row.hospitalCode;
      const memberTypeStr = row.memberType;

      // Validate email
      if (!email) {
        result.errors.push({
          row: rowNumber,
          email: email || "(empty)",
          error: "Email is required",
        });
        result.failedCount++;
        continue;
      }

      if (!isValidEmail(email)) {
        result.errors.push({
          row: rowNumber,
          email,
          error: "Invalid email format",
        });
        result.failedCount++;
        continue;
      }

      // Check email uniqueness (existing in DB)
      if (existingEmails.has(email)) {
        result.errors.push({
          row: rowNumber,
          email,
          error: "Email already exists in database",
        });
        result.failedCount++;
        continue;
      }

      // Check email uniqueness (within this batch)
      if (importedEmailsInBatch.has(email)) {
        result.errors.push({
          row: rowNumber,
          email,
          error: "Duplicate email in CSV file",
        });
        result.failedCount++;
        continue;
      }

      // Validate password
      if (!password || password.length < 6) {
        result.errors.push({
          row: rowNumber,
          email,
          error: "Password must be at least 6 characters",
        });
        result.failedCount++;
        continue;
      }

      // Validate memberType
      const memberType = parseInt(memberTypeStr);
      if (isNaN(memberType) || (memberType !== 1 && memberType !== 99)) {
        result.errors.push({
          row: rowNumber,
          email,
          error: "Member type must be 1 (Hospital) or 99 (Admin)",
        });
        result.failedCount++;
        continue;
      }

      // Validate hospitalCode
      // Admin (99) should have null/empty hospitalCode
      // Hospital (1) must have valid hospitalCode
      if (memberType === 99) {
        // Admin should not have hospitalCode
        if (hospitalCode && hospitalCode !== "") {
          result.errors.push({
            row: rowNumber,
            email,
            error: "Admin users should not have hospital code",
          });
          result.failedCount++;
          continue;
        }
      } else if (memberType === 1) {
        // Hospital must have valid code
        if (!hospitalCode || hospitalCode === "") {
          result.errors.push({
            row: rowNumber,
            email,
            error: "Hospital code is required for hospital users",
          });
          result.failedCount++;
          continue;
        }

        if (!validHospitalCodes.has(hospitalCode)) {
          result.errors.push({
            row: rowNumber,
            email,
            error: `Hospital code '${hospitalCode}' does not exist`,
          });
          result.failedCount++;
          continue;
        }
      }

      // All validations passed - create member
      try {
        const hashedPassword = md5(password);

        await prisma.member.create({
          data: {
            email,
            password: hashedPassword,
            hospitalCode: hospitalCode && hospitalCode !== "" ? hospitalCode : null,
            memberType,
          },
        });

        result.successCount++;
        importedEmailsInBatch.add(email);
        existingEmails.add(email); // Add to set to prevent duplicates in subsequent rows
      } catch (error) {
        console.error(`Error creating member at row ${rowNumber}:`, error);
        result.errors.push({
          row: rowNumber,
          email,
          error: "Failed to create member in database",
        });
        result.failedCount++;
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error importing CSV:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
