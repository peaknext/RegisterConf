/**
 * Audit logging for tracking user actions in the conference registration system.
 *
 * This module provides structured audit trails for:
 * - Attendee management (create, update, delete, view)
 * - Payment operations (submit, approve, reject)
 * - Member management (create, update, delete, password changes, imports)
 * - Content management (news, schedules, slideshow)
 * - System settings updates
 * - Data exports
 *
 * Audit logs are essential for:
 * - Compliance and accountability
 * - Debugging and troubleshooting
 * - Security incident investigation
 * - Usage analytics
 *
 * Currently logs to console. Database integration is prepared but commented out
 * pending addition of audit_logs table to the Prisma schema.
 *
 * @module audit-logger
 * @see {@link ./security-logger.ts} for authentication-specific logging
 */
import { prisma } from "./prisma";

/**
 * Types of auditable actions in the system.
 * Organized by resource type for easier filtering and analysis.
 */
export enum AuditAction {
  // ===== Attendee actions =====
  /** New attendee registration created */
  ATTENDEE_CREATE = "ATTENDEE_CREATE",
  /** Attendee information updated */
  ATTENDEE_UPDATE = "ATTENDEE_UPDATE",
  /** Attendee record deleted */
  ATTENDEE_DELETE = "ATTENDEE_DELETE",
  /** Attendee details viewed (for sensitive data access tracking) */
  ATTENDEE_VIEW = "ATTENDEE_VIEW",

  // ===== Payment actions =====
  /** Payment proof submitted for review */
  PAYMENT_SUBMIT = "PAYMENT_SUBMIT",
  /** Payment approved by admin */
  PAYMENT_APPROVE = "PAYMENT_APPROVE",
  /** Payment rejected by admin */
  PAYMENT_REJECT = "PAYMENT_REJECT",

  // ===== Member actions =====
  /** New member account created */
  MEMBER_CREATE = "MEMBER_CREATE",
  /** Member information updated */
  MEMBER_UPDATE = "MEMBER_UPDATE",
  /** Member account deleted */
  MEMBER_DELETE = "MEMBER_DELETE",
  /** Single member password changed */
  MEMBER_PASSWORD_CHANGE = "MEMBER_PASSWORD_CHANGE",
  /** Bulk password reset performed */
  MEMBER_BULK_PASSWORD_CHANGE = "MEMBER_BULK_PASSWORD_CHANGE",
  /** Members imported from CSV */
  MEMBER_IMPORT = "MEMBER_IMPORT",

  // ===== Content management actions =====
  /** News article created */
  NEWS_CREATE = "NEWS_CREATE",
  /** News article updated */
  NEWS_UPDATE = "NEWS_UPDATE",
  /** News article deleted */
  NEWS_DELETE = "NEWS_DELETE",
  /** Schedule item created */
  SCHEDULE_CREATE = "SCHEDULE_CREATE",
  /** Schedule item updated */
  SCHEDULE_UPDATE = "SCHEDULE_UPDATE",
  /** Schedule item deleted */
  SCHEDULE_DELETE = "SCHEDULE_DELETE",
  /** Slideshow image created */
  SLIDESHOW_CREATE = "SLIDESHOW_CREATE",
  /** Slideshow image updated */
  SLIDESHOW_UPDATE = "SLIDESHOW_UPDATE",
  /** Slideshow image deleted */
  SLIDESHOW_DELETE = "SLIDESHOW_DELETE",

  // ===== Settings actions =====
  /** System settings updated (config, footer, payment settings) */
  SETTINGS_UPDATE = "SETTINGS_UPDATE",

  // ===== Export actions =====
  /** Data exported (CSV, Excel) */
  EXPORT_DATA = "EXPORT_DATA",
}

/**
 * Structure of an audit log entry.
 *
 * @property action - The type of action performed (from AuditAction enum)
 * @property userId - Database ID of the user who performed the action
 * @property userEmail - Email of the user (optional, for readability in logs)
 * @property targetType - Type of resource affected (e.g., "attendee", "finance", "member")
 * @property targetId - Database ID of the affected resource
 * @property details - Additional context about the action as key-value pairs
 * @property ip - Client IP address (from x-forwarded-for or x-real-ip)
 * @property userAgent - Browser/client user agent string
 */
export interface AuditLogEntry {
  action: AuditAction;
  userId: string;
  userEmail?: string;
  targetType?: string;
  targetId?: string;
  details?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}

/**
 * Log an audit event to console (and optionally database).
 *
 * Events are logged as structured JSON for easy parsing by log aggregation tools.
 * Format: [AUDIT] {"timestamp": "...", "action": "...", ...}
 *
 * @param entry - The audit log entry to record
 * @returns Promise that resolves when log is written
 *
 * @example
 * await logAuditEvent({
 *   action: AuditAction.ATTENDEE_CREATE,
 *   userId: "123",
 *   userEmail: "admin@example.com",
 *   targetType: "attendee",
 *   targetId: "456",
 *   details: { hospitalCode: "H001" }
 * });
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  const timestamp = new Date().toISOString();

  // Format log entry with timestamp
  const logEntry = {
    timestamp,
    ...entry,
  };

  // Console logging (structured JSON)
  console.log(`[AUDIT] ${JSON.stringify(logEntry)}`);

  // TODO: Store in database if AuditLog table exists
  // This can be enabled when audit_logs table is added to schema
  /*
  try {
    await prisma.auditLog.create({
      data: {
        action: entry.action,
        userId: parseInt(entry.userId),
        targetType: entry.targetType,
        targetId: entry.targetId,
        details: entry.details ? JSON.stringify(entry.details) : null,
        ip: entry.ip,
        userAgent: entry.userAgent,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Failed to store audit log:", error);
  }
  */
}

/**
 * Create an audit logger factory bound to a specific request context.
 *
 * Returns a logger object with a `log` method that automatically includes
 * the IP address and user agent from the original request.
 *
 * @param request - The HTTP request object for IP/user-agent extraction
 * @param userId - Database ID of the user performing actions
 * @param userEmail - Optional email for log readability
 * @returns An object with a `log` method for logging audit events
 *
 * @example
 * const logger = createAuditLogger(request, session.user.id, session.user.email);
 *
 * // Log multiple actions with same context
 * await logger.log(AuditAction.ATTENDEE_CREATE, {
 *   targetType: "attendee",
 *   targetId: "123"
 * });
 *
 * await logger.log(AuditAction.PAYMENT_SUBMIT, {
 *   targetType: "finance",
 *   targetId: "456"
 * });
 */
export function createAuditLogger(
  request: Request,
  userId: string,
  userEmail?: string
) {
  // Extract client IP from headers (supports proxied requests)
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded
    ? forwarded.split(",")[0].trim()
    : request.headers.get("x-real-ip") || "unknown";
  const userAgent = request.headers.get("user-agent") || undefined;

  return {
    /**
     * Log an audit event with the pre-configured context.
     *
     * @param action - The type of action being logged
     * @param options - Additional details about the action
     */
    log: async (
      action: AuditAction,
      options?: {
        targetType?: string;
        targetId?: string;
        details?: Record<string, unknown>;
      }
    ) => {
      await logAuditEvent({
        action,
        userId,
        userEmail,
        ip,
        userAgent,
        ...options,
      });
    },
  };
}

// ===== Convenience functions for common audit actions =====

/**
 * Log an attendee creation event.
 *
 * @param request - HTTP request for context extraction
 * @param userId - ID of the user creating the attendee
 * @param attendeeId - ID of the newly created attendee
 * @param details - Optional additional details (e.g., hospitalCode)
 * @returns Promise that resolves when log is written
 *
 * @example
 * await auditAttendeeCreate(request, session.user.id, newAttendee.id, {
 *   hospitalCode: session.user.hospitalCode
 * });
 */
export async function auditAttendeeCreate(
  request: Request,
  userId: string,
  attendeeId: number,
  details?: Record<string, unknown>
): Promise<void> {
  const logger = createAuditLogger(request, userId);
  await logger.log(AuditAction.ATTENDEE_CREATE, {
    targetType: "attendee",
    targetId: attendeeId.toString(),
    details,
  });
}

/**
 * Log an attendee update event.
 *
 * @param request - HTTP request for context extraction
 * @param userId - ID of the user updating the attendee
 * @param attendeeId - ID of the attendee being updated
 * @param changes - Optional object containing the fields that were changed
 * @returns Promise that resolves when log is written
 *
 * @example
 * await auditAttendeeUpdate(request, session.user.id, attendee.id, {
 *   firstName: "Updated",
 *   lastName: "Name"
 * });
 */
export async function auditAttendeeUpdate(
  request: Request,
  userId: string,
  attendeeId: number,
  changes?: Record<string, unknown>
): Promise<void> {
  const logger = createAuditLogger(request, userId);
  await logger.log(AuditAction.ATTENDEE_UPDATE, {
    targetType: "attendee",
    targetId: attendeeId.toString(),
    details: { changes },
  });
}

/**
 * Log a payment submission event.
 *
 * Called when a hospital representative submits payment proof for review.
 *
 * @param request - HTTP request for context extraction
 * @param userId - ID of the user submitting payment
 * @param financeId - ID of the created finance record
 * @param attendeeIds - Array of attendee IDs included in this payment
 * @returns Promise that resolves when log is written
 *
 * @example
 * await auditPaymentSubmit(request, session.user.id, finance.id, [101, 102, 103]);
 */
export async function auditPaymentSubmit(
  request: Request,
  userId: string,
  financeId: number,
  attendeeIds: number[]
): Promise<void> {
  const logger = createAuditLogger(request, userId);
  await logger.log(AuditAction.PAYMENT_SUBMIT, {
    targetType: "finance",
    targetId: financeId.toString(),
    details: { attendeeIds },
  });
}

/**
 * Log a payment approval event.
 *
 * Called when an admin approves a payment submission.
 * This action also updates the associated attendees' status to "paid" (9).
 *
 * @param request - HTTP request for context extraction
 * @param userId - ID of the admin approving the payment
 * @param financeId - ID of the finance record being approved
 * @returns Promise that resolves when log is written
 *
 * @example
 * await auditPaymentApprove(request, session.user.id, financeId);
 */
export async function auditPaymentApprove(
  request: Request,
  userId: string,
  financeId: number
): Promise<void> {
  const logger = createAuditLogger(request, userId);
  await logger.log(AuditAction.PAYMENT_APPROVE, {
    targetType: "finance",
    targetId: financeId.toString(),
  });
}

/**
 * Log a payment rejection event.
 *
 * Called when an admin rejects a payment submission.
 * This action also resets the associated attendees' status to "pending" (1).
 *
 * @param request - HTTP request for context extraction
 * @param userId - ID of the admin rejecting the payment
 * @param financeId - ID of the finance record being rejected
 * @param reason - Optional reason for rejection
 * @returns Promise that resolves when log is written
 *
 * @example
 * await auditPaymentReject(request, session.user.id, financeId, "Invalid transfer slip");
 */
export async function auditPaymentReject(
  request: Request,
  userId: string,
  financeId: number,
  reason?: string
): Promise<void> {
  const logger = createAuditLogger(request, userId);
  await logger.log(AuditAction.PAYMENT_REJECT, {
    targetType: "finance",
    targetId: financeId.toString(),
    details: { reason },
  });
}

/**
 * Log a member creation event.
 *
 * Called when an admin creates a new member account.
 *
 * @param request - HTTP request for context extraction
 * @param adminId - ID of the admin creating the member
 * @param memberId - ID of the newly created member
 * @param email - Email address of the new member
 * @returns Promise that resolves when log is written
 *
 * @example
 * await auditMemberCreate(request, session.user.id, newMember.id, newMember.email);
 */
export async function auditMemberCreate(
  request: Request,
  adminId: string,
  memberId: number,
  email: string
): Promise<void> {
  const logger = createAuditLogger(request, adminId);
  await logger.log(AuditAction.MEMBER_CREATE, {
    targetType: "member",
    targetId: memberId.toString(),
    details: { email },
  });
}

/**
 * Log a member password change event.
 *
 * Called when an admin changes a member's password.
 *
 * @param request - HTTP request for context extraction
 * @param adminId - ID of the admin changing the password
 * @param targetMemberId - ID of the member whose password is being changed
 * @returns Promise that resolves when log is written
 *
 * @example
 * await auditMemberPasswordChange(request, session.user.id, memberId);
 */
export async function auditMemberPasswordChange(
  request: Request,
  adminId: string,
  targetMemberId: number
): Promise<void> {
  const logger = createAuditLogger(request, adminId);
  await logger.log(AuditAction.MEMBER_PASSWORD_CHANGE, {
    targetType: "member",
    targetId: targetMemberId.toString(),
  });
}

/**
 * Log a data export event.
 *
 * Called when a user exports data (CSV, Excel) from the system.
 * Important for tracking data access and potential data breaches.
 *
 * @param request - HTTP request for context extraction
 * @param userId - ID of the user exporting data
 * @param exportType - Type of export (e.g., "attendees-xlsx", "payment-csv")
 * @param recordCount - Optional count of records exported
 * @returns Promise that resolves when log is written
 *
 * @example
 * await auditDataExport(request, session.user.id, "attendees-xlsx", 150);
 */
export async function auditDataExport(
  request: Request,
  userId: string,
  exportType: string,
  recordCount?: number
): Promise<void> {
  const logger = createAuditLogger(request, userId);
  await logger.log(AuditAction.EXPORT_DATA, {
    targetType: "export",
    details: { exportType, recordCount },
  });
}
