/**
 * Security event logging for authentication and authorization events
 */

export enum SecurityEventType {
  LOGIN_SUCCESS = "LOGIN_SUCCESS",
  LOGIN_FAILED = "LOGIN_FAILED",
  LOGIN_RATE_LIMITED = "LOGIN_RATE_LIMITED",
  LOGOUT = "LOGOUT",
  PASSWORD_CHANGED = "PASSWORD_CHANGED",
  PASSWORD_MIGRATED = "PASSWORD_MIGRATED",
  UNAUTHORIZED_ACCESS = "UNAUTHORIZED_ACCESS",
  CSRF_VALIDATION_FAILED = "CSRF_VALIDATION_FAILED",
  SESSION_EXPIRED = "SESSION_EXPIRED",
  ADMIN_ACTION = "ADMIN_ACTION",
}

export interface SecurityEvent {
  type: SecurityEventType;
  timestamp: Date;
  ip: string;
  userAgent?: string;
  userId?: string;
  email?: string;
  details?: Record<string, unknown>;
}

/**
 * Format security event for logging
 */
function formatSecurityEvent(event: SecurityEvent): string {
  const parts = [
    `[SECURITY]`,
    `[${event.type}]`,
    `IP: ${event.ip}`,
    event.email ? `Email: ${event.email}` : null,
    event.userId ? `UserID: ${event.userId}` : null,
    event.details ? `Details: ${JSON.stringify(event.details)}` : null,
  ].filter(Boolean);

  return parts.join(" | ");
}

/**
 * Log security event
 * In production, this should be sent to a proper logging service (e.g., CloudWatch, Datadog)
 */
export function logSecurityEvent(event: SecurityEvent): void {
  const formattedEvent = formatSecurityEvent(event);

  // Log based on event type
  switch (event.type) {
    case SecurityEventType.LOGIN_FAILED:
    case SecurityEventType.LOGIN_RATE_LIMITED:
    case SecurityEventType.UNAUTHORIZED_ACCESS:
    case SecurityEventType.CSRF_VALIDATION_FAILED:
      console.warn(formattedEvent);
      break;
    default:
      console.info(formattedEvent);
  }

  // In production, you would also:
  // - Send to external logging service
  // - Store in database for audit trail
  // - Trigger alerts for suspicious activity
}

/**
 * Create security event helper
 */
export function createSecurityEvent(
  type: SecurityEventType,
  request: Request,
  additionalData?: Partial<SecurityEvent>
): SecurityEvent {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() :
             request.headers.get("x-real-ip") || "unknown";

  return {
    type,
    timestamp: new Date(),
    ip,
    userAgent: request.headers.get("user-agent") || undefined,
    ...additionalData,
  };
}

/**
 * Helper to log login success
 */
export function logLoginSuccess(
  request: Request,
  userId: string,
  email: string
): void {
  logSecurityEvent(
    createSecurityEvent(SecurityEventType.LOGIN_SUCCESS, request, {
      userId,
      email,
    })
  );
}

/**
 * Helper to log login failure
 */
export function logLoginFailed(
  request: Request,
  email: string,
  reason?: string
): void {
  logSecurityEvent(
    createSecurityEvent(SecurityEventType.LOGIN_FAILED, request, {
      email,
      details: reason ? { reason } : undefined,
    })
  );
}

/**
 * Helper to log rate limited attempt
 */
export function logRateLimited(
  request: Request,
  email?: string
): void {
  logSecurityEvent(
    createSecurityEvent(SecurityEventType.LOGIN_RATE_LIMITED, request, {
      email,
    })
  );
}

/**
 * Helper to log unauthorized access attempt
 */
export function logUnauthorizedAccess(
  request: Request,
  endpoint: string,
  userId?: string
): void {
  logSecurityEvent(
    createSecurityEvent(SecurityEventType.UNAUTHORIZED_ACCESS, request, {
      userId,
      details: { endpoint },
    })
  );
}

/**
 * Helper to log password migration
 */
export function logPasswordMigrated(
  request: Request,
  userId: string,
  email: string
): void {
  logSecurityEvent(
    createSecurityEvent(SecurityEventType.PASSWORD_MIGRATED, request, {
      userId,
      email,
    })
  );
}

/**
 * Helper to log admin action
 */
export function logAdminAction(
  request: Request,
  adminId: string,
  action: string,
  targetId?: string
): void {
  logSecurityEvent(
    createSecurityEvent(SecurityEventType.ADMIN_ACTION, request, {
      userId: adminId,
      details: { action, targetId },
    })
  );
}
