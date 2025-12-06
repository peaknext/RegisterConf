import { handlers, setAuthRequest } from "@/lib/auth";
import { NextRequest } from "next/server";

// Wrap POST handler to capture request for security logging
const originalPost = handlers.POST;

export const GET = handlers.GET;

export async function POST(request: NextRequest) {
  // Set request context for security logging in auth
  setAuthRequest(request);
  return originalPost(request);
}
