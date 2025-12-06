/**
 * Simple in-memory rate limiter for authentication
 * Note: For production with multiple instances, use Redis-based rate limiting
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(rateLimitStore.entries());
  for (let i = 0; i < entries.length; i++) {
    const [key, entry] = entries[i];
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number; // Time window in milliseconds
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: Date;
  retryAfterMs?: number;
}

/**
 * Check rate limit for a given key (IP address or email)
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // No entry or expired entry - allow request
  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return {
      success: true,
      remaining: config.maxAttempts - 1,
      resetAt: new Date(now + config.windowMs),
    };
  }

  // Entry exists and not expired
  if (entry.count >= config.maxAttempts) {
    return {
      success: false,
      remaining: 0,
      resetAt: new Date(entry.resetAt),
      retryAfterMs: entry.resetAt - now,
    };
  }

  // Increment count
  entry.count++;
  return {
    success: true,
    remaining: config.maxAttempts - entry.count,
    resetAt: new Date(entry.resetAt),
  };
}

/**
 * Reset rate limit for a key (e.g., after successful login)
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

/**
 * Get client IP from request headers
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  return "unknown";
}

// Default rate limit configurations
export const AUTH_RATE_LIMIT: RateLimitConfig = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
};

export const API_RATE_LIMIT: RateLimitConfig = {
  maxAttempts: 100,
  windowMs: 60 * 1000, // 1 minute
};
