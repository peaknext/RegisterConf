import { createHash, randomBytes } from "crypto";

const CSRF_SECRET = process.env.CSRF_SECRET || process.env.AUTH_SECRET || "default-csrf-secret";
const CSRF_TOKEN_LENGTH = 32;
const CSRF_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

/**
 * Generate CSRF token
 * Token format: timestamp.randomBytes.signature
 */
export function generateCsrfToken(): string {
  const timestamp = Date.now().toString(36);
  const random = randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
  const data = `${timestamp}.${random}`;
  const signature = createHash("sha256")
    .update(`${data}.${CSRF_SECRET}`)
    .digest("hex")
    .substring(0, 16);

  return `${data}.${signature}`;
}

/**
 * Validate CSRF token
 */
export function validateCsrfToken(token: string | null): boolean {
  if (!token) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [timestamp, random, signature] = parts;

  // Verify signature
  const data = `${timestamp}.${random}`;
  const expectedSignature = createHash("sha256")
    .update(`${data}.${CSRF_SECRET}`)
    .digest("hex")
    .substring(0, 16);

  if (signature !== expectedSignature) return false;

  // Check expiry
  const tokenTime = parseInt(timestamp, 36);
  if (isNaN(tokenTime)) return false;

  const now = Date.now();
  if (now - tokenTime > CSRF_TOKEN_EXPIRY) return false;

  return true;
}

/**
 * Get CSRF token from request headers
 */
export function getCsrfTokenFromRequest(request: Request): string | null {
  // Check header first (preferred for AJAX)
  const headerToken = request.headers.get("x-csrf-token");
  if (headerToken) return headerToken;

  // Check custom header alternative
  const xsrfToken = request.headers.get("x-xsrf-token");
  if (xsrfToken) return xsrfToken;

  return null;
}

/**
 * Validate CSRF for state-changing requests
 * Returns true if valid, false if invalid
 */
export function validateCsrfRequest(request: Request): boolean {
  // Skip validation for GET, HEAD, OPTIONS requests
  const method = request.method.toUpperCase();
  if (["GET", "HEAD", "OPTIONS"].includes(method)) {
    return true;
  }

  // Check origin header for same-origin requests
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (origin && host) {
    try {
      const originUrl = new URL(origin);
      // Allow same-origin requests
      if (originUrl.host === host) {
        return true;
      }
    } catch {
      // Invalid origin URL
    }
  }

  // For cross-origin or missing origin, require CSRF token
  const token = getCsrfTokenFromRequest(request);
  return validateCsrfToken(token);
}

/**
 * CSRF validation middleware helper
 * Returns error response if validation fails, null if valid
 */
export function csrfProtection(request: Request): Response | null {
  if (!validateCsrfRequest(request)) {
    return new Response(
      JSON.stringify({ error: "CSRF validation failed" }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
  return null;
}
