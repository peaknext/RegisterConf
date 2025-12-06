import { generateCsrfToken } from "@/lib/csrf";
import { NextResponse } from "next/server";

// GET - Generate CSRF token
export async function GET() {
  const token = generateCsrfToken();

  const response = NextResponse.json({ csrfToken: token });

  // Also set as cookie for convenience
  response.cookies.set("csrf-token", token, {
    httpOnly: false, // Needs to be readable by JavaScript
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60, // 1 hour
    path: "/",
  });

  return response;
}
