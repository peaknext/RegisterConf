/**
 * Security event logging for authentication and authorization events.
 *
 * This module provides structured logging for security-sensitive operations
 * including login attempts, rate limiting, unauthorized access, and admin actions.
 *
 * Events are logged to console with severity-based formatting:
 * - Warning (console.warn): Failed logins, rate limits, unauthorized access, CSRF failures
 * - Info (console.info): Successful logins, password migrations, admin actions
 *
 * In production, events should be forwarded to external services (CloudWatch, Datadog)
 * for monitoring, alerting, and compliance requirements.
 *
 * @module security-logger
 * @see {@link ./audit-logger.ts} for general audit logging
 * @see {@link ./auth.ts} for authentication integration
 */

/**
 * Types of security events that can be logged.
 * Used for categorizing, filtering, and routing security logs.
 */
export enum SecurityEventType {
  /** User successfully authenticated */
  LOGIN_SUCCESS = "LOGIN_SUCCESS",
  /** User failed to authenticate (wrong password, user not found) */
  LOGIN_FAILED = "LOGIN_FAILED",
  /** User exceeded rate limit for login attempts */
  LOGIN_RATE_LIMITED = "LOGIN_RATE_LIMITED",
  /** User logged out of the system */
  LOGOUT = "LOGOUT",
  /** User changed their password */
  PASSWORD_CHANGED = "PASSWORD_CHANGED",
  /** User's password was migrated from MD5 to bcrypt */
  PASSWORD_MIGRATED = "PASSWORD_MIGRATED",
  /** User attempted to access unauthorized resource */
  UNAUTHORIZED_ACCESS = "UNAUTHORIZED_ACCESS",
  /** CSRF token validation failed */
  CSRF_VALIDATION_FAILED = "CSRF_VALIDATION_FAILED",
  /** User's session expired */
  SESSION_EXPIRED = "SESSION_EXPIRED",
  /** Admin performed a privileged action */
  ADMIN_ACTION = "ADMIN_ACTION",
}

/**
 * Structure of a security event log entry.
 *
 * @property type - The category of security event (from SecurityEventType enum)
 * @property timestamp - When the event occurred (ISO 8601)
 * @property ip - Client IP address (from x-forwarded-for or x-real-ip headers)
 * @property userAgent - Browser/client user agent string (optional)
 * @property userId - Database ID of authenticated user (optional, for logged-in users)
 * @property email - Email address involved in the event (optional, for login events)
 * @property details - Additional context-specific information as key-value pairs
 */
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
 * Format a security event into a human-readable log string.
 *
 * Output format: [SECURITY] | [EVENT_TYPE] | IP: x.x.x.x | Email: ... | UserID: ... | Details: {...}
 *
 * @param event - The security event to format
 * @returns Formatted string suitable for console logging
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
 * Log a security event to the console.
 *
 * Events are logged with appropriate severity:
 * - console.warn: LOGIN_FAILED, LOGIN_RATE_LIMITED, UNAUTHORIZED_ACCESS, CSRF_VALIDATION_FAILED
 * - console.info: All other events (success, migrations, admin actions)
 *
 * In production, this should be extended to send events to external logging
 * services (CloudWatch, Datadog, etc.) for monitoring and alerting.
 *
 * @param event - The security event to log
 *
 * @example
 * logSecurityEvent({
 *   type: SecurityEventType.LOGIN_SUCCESS,
 *   timestamp: new Date(),
 *   ip: "192.168.1.1",
 *   userId: "123",
 *   email: "user@example.com"
 * });
 */
export function logSecurityEvent(event: SecurityEvent): void {
  const formattedEvent = formatSecurityEvent(event);

  // Log based on event type - warnings for security concerns
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
 * Create a security event object from an HTTP request.
 *
 * Automatically extracts IP address and user agent from request headers.
 * IP is extracted from x-forwarded-for (first value) or x-real-ip headers.
 *
 * @param type - The type of security event
 * @param request - The HTTP request object for extracting client info
 * @param additionalData - Optional additional fields to include in the event
 * @returns A complete SecurityEvent object ready for logging
 *
 * @example
 * const event = createSecurityEvent(
 *   SecurityEventType.LOGIN_FAILED,
 *   request,
 *   { email: "user@example.com", details: { reason: "Invalid password" } }
 * );
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
 * Log a successful login event.
 *
 * @param request - The HTTP request object for IP/user-agent extraction
 * @param userId - The database ID of the user who logged in
 * @param email - The email address used for login
 *
 * @example
 * logLoginSuccess(request, member.id.toString(), member.email);
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
 * Log a failed login attempt.
 *
 * @param request - The HTTP request object for IP/user-agent extraction
 * @param email - The email address that attempted to login
 * @param reason - Optional reason for failure (e.g., "Invalid password", "User not found")
 *
 * @example
 * logLoginFailed(request, email, "Invalid password");
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
 * Log a rate-limited login attempt.
 *
 * Called when a user exceeds the maximum number of login attempts
 * within the rate limit window (5 attempts per 15 minutes).
 *
 * @param request - The HTTP request object for IP/user-agent extraction
 * @param email - Optional email address that was rate limited
 *
 * @example
 * logRateLimited(request, "user@example.com");
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
 * Log an unauthorized access attempt.
 *
 * Called when a user attempts to access a resource they don't have
 * permission for (e.g., non-admin accessing admin endpoints).
 *
 * @param request - The HTTP request object for IP/user-agent extraction
 * @param endpoint - The API endpoint or resource that was accessed
 * @param userId - Optional ID of the user who attempted access
 *
 * @example
 * logUnauthorizedAccess(request, "/api/admin/users", session.user.id);
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
 * Log a password migration event.
 *
 * Called when a user's password is automatically migrated from
 * legacy MD5 hash to bcrypt on successful login.
 *
 * @param request - The HTTP request object for IP/user-agent extraction
 * @param userId - The database ID of the user whose password was migrated
 * @param email - The email address of the user
 *
 * @example
 * logPasswordMigrated(request, member.id.toString(), member.email);
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
 * Log an admin action.
 *
 * Called when an admin performs a privileged action such as
 * approving payments, modifying users, or changing system settings.
 *
 * @param request - The HTTP request object for IP/user-agent extraction
 * @param adminId - The database ID of the admin performing the action
 * @param action - Description of the action performed (e.g., "approve_payment", "delete_user")
 * @param targetId - Optional ID of the resource being acted upon
 *
 * @example
 * logAdminAction(request, session.user.id, "approve_payment", financeId);
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
