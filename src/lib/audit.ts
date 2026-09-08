import { prisma } from "@/lib/prisma";

export type AuditAction =
  | "USER_ROLE_CHANGED"
  | "SETUP_CREATED"
  | "SETUP_UPDATED"
  | "SETUP_DELETED"
  | "SESSION_FORCE_STOPPED"
  | "SESSION_ENDED"
  | "BOOKING_CONFIRMED"
  | "BOOKING_CANCELLED"
  | "PAYMENT_CONFIRMED"
  | "MEMBERSHIP_CREATED"
  | "TOURNAMENT_CREATED";

export async function auditLog(input: {
  action: AuditAction;
  actorUserId?: string;
  targetId?: string;
  targetType?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await prisma.notification.create({
      data: {
        type: "SYSTEM",
        channel: "DASHBOARD",
        title: `Audit: ${input.action}`,
        message: JSON.stringify({
          action: input.action,
          actorUserId: input.actorUserId,
          targetId: input.targetId,
          targetType: input.targetType,
          timestamp: new Date().toISOString(),
          ...input.metadata
        }),
        metadata: {
          audit: true,
          action: input.action,
          actorUserId: input.actorUserId,
          targetId: input.targetId,
          targetType: input.targetType,
          ...input.metadata
        }
      }
    });
  } catch {
    console.error("[AUDIT] Failed to write audit log:", input.action);
  }
}
