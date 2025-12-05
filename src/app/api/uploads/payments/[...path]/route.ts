import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    // Authentication check - must be logged in
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get file path from params
    const filePath = params.path.join("/");

    // Security: Prevent path traversal attacks
    if (filePath.includes("..") || filePath.includes("\\")) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    // Security: Only allow image files
    const ext = path.extname(filePath).toLowerCase();
    if (![".png", ".jpg", ".jpeg"].includes(ext)) {
      return NextResponse.json(
        { error: "Invalid file type" },
        { status: 400 }
      );
    }

    // Construct full file path
    const fullPath = path.join(
      process.cwd(),
      "public",
      "uploads",
      "payments",
      filePath
    );

    // Read file from disk
    const fileBuffer = await readFile(fullPath);

    // Determine content type
    const contentType =
      ext === ".png" ? "image/png" : ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "application/octet-stream";

    // Return file with appropriate headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    // Handle file not found
    if (error.code === "ENOENT") {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Handle other errors
    console.error("Error serving file:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
