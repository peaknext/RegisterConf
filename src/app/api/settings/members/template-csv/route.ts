import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// GET download CSV template
export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.memberType !== 99) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create CSV template with header and example rows
    const csvContent = `email,password,hospitalCode,memberType
example@hospital.com,password123,H001,1
admin@system.com,adminpass,,,99`;

    // Return CSV file
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=members_template.csv`,
      },
    });
  } catch (error) {
    console.error("Error downloading template:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
