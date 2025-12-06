import { prisma } from "./prisma";

/**
 * Audit event types for tracking user actions
 */
export enum AuditAction {
  // Attendee actions
  ATTENDEE_CREATE = "ATTENDEE_CREATE",
  ATTENDEE_UPDATE = "ATTENDEE_UPDATE",
  ATTENDEE_DELETE = "ATTENDEE_DELETE",
  ATTENDEE_VIEW = "ATTENDEE_VIEW",

  // Payment actions
  PAYMENT_SUBMIT = "PAYMENT_SUBMIT",
  PAYMENT_APPROVE = "PAYMENT_APPROVE",
  PAYMENT_REJECT = "PAYMENT_REJECT",

  // Member actions
  MEMBER_CREATE = "MEMBER_CREATE",
  MEMBER_UPDATE = "MEMBER_UPDATE",
  MEMBER_DELETE = "MEMBER_DELETE",
  MEMBER_PASSWORD_CHANGE = "MEMBER_PASSWORD_CHANGE",
  MEMBER_BULK_PASSWORD_CHANGE = "MEMBER_BULK_PASSWORD_CHANGE",
  MEMBER_IMPORT = "MEMBER_IMPORT",

  // Content actions
  NEWS_CREATE = "NEWS_CREATE",
  NEWS_UPDATE = "NEWS_UPDATE",
  NEWS_DELETE = "NEWS_DELETE",
  SCHEDULE_CREATE = "SCHEDULE_CREATE",
  SCHEDULE_UPDATE = "SCHEDULE_UPDATE",
  SCHEDULE_DELETE = "SCHEDULE_DELETE",
  SLIDESHOW_CREATE = "SLIDESHOW_CREATE",
  SLIDESHOW_UPDATE = "SLIDESHOW_UPDATE",
  SLIDESHOW_DELETE = "SLIDESHOW_DELETE",

  // Settings actions
  SETTINGS_UPDATE = "SETTINGS_UPDATE",

  // Export actions
  EXPORT_DATA = "EXPORT_DATA",
}

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
 * Log an audit event
 * Stores in both console and can be extended to database/external service
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  const timestamp = new Date().toISOString();

  // Format log entry
  const logEntry = {
    timestamp,
    ...entry,
  };

  // Console logging (structured)
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
 * Create audit logger helper from request context
 */
export function createAuditLogger(
  request: Request,
  userId: string,
  userEmail?: string
) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded
    ? forwarded.split(",")[0].trim()
    : request.headers.get("x-real-ip") || "unknown";
  const userAgent = request.headers.get("user-agent") || undefined;

  return {
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
