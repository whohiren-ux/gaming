import { Prisma, type PaymentMethod } from "@prisma/client";

import { SESSION_ENDING_ALERT_MINUTES } from "@/lib/constants";
import { addMinutesSafe, minutesBetween } from "@/lib/dates";
import { assertSetupWindowAvailable } from "@/lib/booking-service";
import { calculateSessionAmount, toDecimal, toNumber } from "@/lib/money";
import { createNotification } from "@/lib/notification-service";
import { createLedgerPayment } from "@/lib/payment-service";
import { prisma } from "@/lib/prisma";
import { publishRealtime } from "@/lib/realtime";
import { REALTIME_CHANNELS, REALTIME_EVENTS } from "@/lib/realtime-events";

async function setSetupPostSessionStatus(tx: Prisma.TransactionClient, setupId: string) {
  const setup = await tx.setup.findUniqueOrThrow({ where: { id: setupId } });
  const now = new Date();
  const nextBooking = await tx.booking.findFirst({
    where: {
      setupId,
      status: { in: ["PENDING", "CONFIRMED"] },
      startTime: { lte: addMinutesSafe(now, setup.bufferMinutes) },
      endTime: { gt: now }
    },
    orderBy: { startTime: "asc" }
  });

  await tx.setup.update({
    where: { id: setupId },
    data: {
      status: nextBooking ? "RESERVED" : "AVAILABLE",
      lastSeenAt: new Date()
    }
  });
}

async function publishSessionChange(sessionId: string, setupId?: string) {
  await publishRealtime(REALTIME_CHANNELS.availability, REALTIME_EVENTS.sessionChanged, {
    sessionId,
    setupId
  });
  await publishRealtime(REALTIME_CHANNELS.admin, REALTIME_EVENTS.sessionChanged, {
    sessionId,
    setupId
  });
}

export async function expireOverdueSessions() {
  const now = new Date();
  const sessions = await prisma.setupSession.findMany({
    where: {
      status: "ACTIVE",
      endsAt: { lt: now }
    },
    include: { setup: true, customer: true }
  });

  for (const session of sessions) {
    await prisma.$transaction(async (tx) => {
      await tx.setupSession.update({
        where: { id: session.id },
        data: { status: "EXPIRED" }
      });
      await tx.setup.update({
        where: { id: session.setupId },
        data: { status: "EXPIRED", lastSeenAt: now }
      });
    });

    const alreadySent = await prisma.notification.findFirst({
      where: {
        type: "SESSION_EXPIRED",
        metadata: {
          path: ["sessionId"],
          equals: session.id
        }
      }
    });

    if (!alreadySent) {
      await createNotification({
        type: "SESSION_EXPIRED",
        title: "Session expired",
        message: `${session.setup.name} has crossed its scheduled end time.`,
        metadata: {
          sessionId: session.id,
          setupId: session.setupId
        }
      });
    }

    await publishSessionChange(session.id, session.setupId);
  }

  return sessions.length;
}

export async function emitEndingSoonAlerts() {
  const now = new Date();
  const threshold = addMinutesSafe(now, SESSION_ENDING_ALERT_MINUTES);
  const sessions = await prisma.setupSession.findMany({
    where: {
      status: "ACTIVE",
      endsAt: {
        gt: now,
        lte: threshold
      }
    },
    include: { setup: true, customer: true }
  });

  for (const session of sessions) {
    const existing = await prisma.notification.findFirst({
      where: {
        type: "SESSION_ENDING",
        metadata: {
          path: ["sessionId"],
          equals: session.id
        }
      }
    });

    if (!existing) {
      await createNotification({
        userId: session.customerId,
        type: "SESSION_ENDING",
        title: "10 minutes remaining",
        message: `${session.setup.name} session is ending soon.`,
        metadata: {
          sessionId: session.id,
          setupId: session.setupId
        }
      });
    }
  }

  return sessions.length;
}

export async function startSession(input: {
  setupId: string;
  bookingId?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  durationMinutes: number;
  paymentMethod?: PaymentMethod;
  paidAmount?: number;
  notes?: string;
  createdById: string;
}) {
  await expireOverdueSessions();

  const session = await prisma.$transaction(
    async (tx) => {
      const booking = input.bookingId
        ? await tx.booking.findUniqueOrThrow({
            where: { id: input.bookingId },
            include: { setup: true, customer: true }
          })
        : null;

      if (booking && ["CANCELLED", "COMPLETED", "NO_SHOW"].includes(booking.status)) {
        throw new Error("This booking cannot be started.");
      }

      const setup = booking?.setup ?? (await tx.setup.findUniqueOrThrow({ where: { id: input.setupId } }));
      const startedAt = new Date();
      const durationMinutes = booking?.durationMinutes ?? input.durationMinutes;
      const endsAt = addMinutesSafe(startedAt, durationMinutes);

      await assertSetupWindowAvailable(tx, setup, startedAt, endsAt, {
        ignoreBookingId: booking?.id
      });

      let customerId = booking?.customerId ?? input.customerId ?? null;

      if (!customerId && input.customerName) {
        const customer = await tx.user.create({
          data: {
            name: input.customerName,
            phone: input.customerPhone,
            role: "CUSTOMER"
          }
        });
        customerId = customer.id;
      }

      const billedAmount = calculateSessionAmount(setup.hourlyPrice, durationMinutes);
      const paidAmount = toDecimal((booking ? toNumber(booking.paidAmount) : 0) + (input.paidAmount ?? 0));

      const created = await tx.setupSession.create({
        data: {
          setupId: setup.id,
          bookingId: booking?.id,
          customerId,
          status: "ACTIVE",
          startedAt,
          endsAt,
          ratePerHour: setup.hourlyPrice,
          billedAmount,
          paidAmount,
          notes: input.notes,
          createdById: input.createdById
        },
        include: {
          setup: true,
          customer: true,
          booking: true
        }
      });

      await tx.setup.update({
        where: { id: setup.id },
        data: { status: "ACTIVE", lastSeenAt: new Date() }
      });

      if (booking) {
        await tx.booking.update({
          where: { id: booking.id },
          data: {
            status: "CONFIRMED"
          }
        });
      }

      if (input.paidAmount && input.paidAmount > 0 && input.paymentMethod) {
        await createLedgerPayment(tx, {
          bookingId: booking?.id,
          sessionId: created.id,
          userId: customerId,
          amount: input.paidAmount,
          method: input.paymentMethod,
          type: booking ? "FULL" : "WALK_IN",
          status: "PAID",
          lineItemName: "Session payment"
        });
      }

      return created;
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable
    }
  );

  await publishSessionChange(session.id, session.setupId);

  return session;
}

export async function pauseSession(sessionId: string) {
  const session = await prisma.setupSession.update({
    where: { id: sessionId },
    data: {
      status: "PAUSED",
      pausedAt: new Date()
    },
    include: { setup: true, customer: true }
  });

  await publishSessionChange(session.id, session.setupId);
  return session;
}

export async function resumeSession(sessionId: string) {
  const existing = await prisma.setupSession.findUniqueOrThrow({ where: { id: sessionId } });

  if (existing.status !== "PAUSED" || !existing.pausedAt) {
    throw new Error("Only paused sessions can be resumed.");
  }

  const pausedSeconds = Math.floor((Date.now() - existing.pausedAt.getTime()) / 1000);
  const session = await prisma.setupSession.update({
    where: { id: sessionId },
    data: {
      status: "ACTIVE",
      pausedAt: null,
      totalPausedSeconds: { increment: pausedSeconds },
      endsAt: new Date(existing.endsAt.getTime() + pausedSeconds * 1000)
    },
    include: { setup: true, customer: true }
  });

  await publishSessionChange(session.id, session.setupId);
  return session;
}

export async function extendSession(
  sessionId: string,
  input: {
    minutes: number;
    paymentMethod?: PaymentMethod;
    paidAmount?: number;
  }
) {
  const session = await prisma.$transaction(
    async (tx) => {
      const existing = await tx.setupSession.findUniqueOrThrow({
        where: { id: sessionId },
        include: { setup: true }
      });

      if (!["ACTIVE", "PAUSED", "EXPIRED"].includes(existing.status)) {
        throw new Error("Only active, paused, or expired sessions can be extended.");
      }

      const newEndsAt = addMinutesSafe(existing.endsAt, input.minutes);

      await assertSetupWindowAvailable(tx, existing.setup, existing.startedAt, newEndsAt, {
        ignoreBookingId: existing.bookingId ?? undefined,
        ignoreSessionId: existing.id
      });

      const extensionAmount = calculateSessionAmount(existing.ratePerHour, input.minutes);
      const paidAmount = input.paidAmount ?? 0;

      const updated = await tx.setupSession.update({
        where: { id: sessionId },
        data: {
          status: existing.status === "EXPIRED" ? "ACTIVE" : existing.status,
          endsAt: newEndsAt,
          billedAmount: { increment: extensionAmount },
          paidAmount: paidAmount > 0 ? { increment: toDecimal(paidAmount) } : undefined
        },
        include: {
          setup: true,
          customer: true
        }
      });

      await tx.setup.update({
        where: { id: existing.setupId },
        data: { status: "ACTIVE", lastSeenAt: new Date() }
      });

      if (paidAmount > 0 && input.paymentMethod) {
        await createLedgerPayment(tx, {
          bookingId: existing.bookingId,
          sessionId: existing.id,
          userId: existing.customerId,
          amount: paidAmount,
          method: input.paymentMethod,
          type: "SESSION_EXTENSION",
          status: "PAID",
          lineItemName: `${input.minutes} minute extension`
        });
      }

      return updated;
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable
    }
  );

  await publishSessionChange(session.id, session.setupId);
  return session;
}

export async function endSession(
  sessionId: string,
  input: {
    endedById: string;
    paymentMethod?: PaymentMethod;
    paidAmount?: number;
    notes?: string;
    forceExpired?: boolean;
  }
) {
  const session = await prisma.$transaction(async (tx) => {
    const existing = await tx.setupSession.findUniqueOrThrow({
      where: { id: sessionId },
      include: { setup: true, booking: true }
    });

    const endedAt = new Date();
    const currentPauseSeconds =
      existing.status === "PAUSED" && existing.pausedAt
        ? Math.floor((endedAt.getTime() - existing.pausedAt.getTime()) / 1000)
        : 0;
    const billableMinutes = Math.max(
      0,
      minutesBetween(existing.startedAt, endedAt) -
        Math.ceil((existing.totalPausedSeconds + currentPauseSeconds) / 60)
    );
    const calculatedAmount = calculateSessionAmount(existing.ratePerHour, billableMinutes);
    const billedAmount =
      toNumber(existing.billedAmount) > toNumber(calculatedAmount)
        ? existing.billedAmount
        : calculatedAmount;
    const paidAmount = input.paidAmount ?? 0;

    const updated = await tx.setupSession.update({
      where: { id: sessionId },
      data: {
        status: input.forceExpired ? "EXPIRED" : "COMPLETED",
        endedAt,
        endedById: input.endedById,
        pausedAt: null,
        totalPausedSeconds: existing.totalPausedSeconds + currentPauseSeconds,
        billedAmount,
        paidAmount: paidAmount > 0 ? { increment: toDecimal(paidAmount) } : undefined,
        notes: input.notes ? `${existing.notes ?? ""}\n${input.notes}`.trim() : existing.notes
      },
      include: {
        setup: true,
        customer: true,
        booking: true
      }
    });

    if (existing.bookingId) {
      await tx.booking.update({
        where: { id: existing.bookingId },
        data: {
          status: "COMPLETED",
          paymentStatus:
            toNumber(updated.paidAmount) + paidAmount >= toNumber(billedAmount)
              ? "PAID"
              : toNumber(updated.paidAmount) + paidAmount > 0
                ? "PARTIAL"
                : "PENDING"
        }
      });
    }

    if (paidAmount > 0 && input.paymentMethod) {
      await createLedgerPayment(tx, {
        bookingId: existing.bookingId,
        sessionId: existing.id,
        userId: existing.customerId,
        amount: paidAmount,
        method: input.paymentMethod,
        type: "FULL",
        status: "PAID",
        lineItemName: "Session settlement"
      });
    }

    await setSetupPostSessionStatus(tx, existing.setupId);

    return updated;
  });

  await publishSessionChange(session.id, session.setupId);
  return session;
}

export async function forceStopSession(sessionId: string, actorUserId: string, notes?: string) {
  const session = await prisma.$transaction(async (tx) => {
    const existing = await tx.setupSession.findUniqueOrThrow({ where: { id: sessionId } });
    const updated = await tx.setupSession.update({
      where: { id: sessionId },
      data: {
        status: "CANCELLED",
        endedAt: new Date(),
        endedById: actorUserId,
        notes: notes ? `${existing.notes ?? ""}\nForce stop: ${notes}`.trim() : existing.notes
      },
      include: { setup: true, customer: true }
    });

    await setSetupPostSessionStatus(tx, existing.setupId);
    return updated;
  });

  await createNotification({
    type: "SYSTEM",
    title: "Session force stopped",
    message: `${session.setup.name} was force stopped by staff.`,
    metadata: {
      sessionId,
      actorUserId
    }
  });

  await publishSessionChange(session.id, session.setupId);
  return session;
}

export async function switchSessionSetup(sessionId: string, targetSetupId: string) {
  const session = await prisma.$transaction(
    async (tx) => {
      const existing = await tx.setupSession.findUniqueOrThrow({
        where: { id: sessionId },
        include: { setup: true }
      });
      const target = await tx.setup.findUniqueOrThrow({ where: { id: targetSetupId } });

      await assertSetupWindowAvailable(tx, target, new Date(), existing.endsAt, {
        ignoreBookingId: existing.bookingId ?? undefined,
        ignoreSessionId: existing.id
      });

      const updated = await tx.setupSession.update({
        where: { id: sessionId },
        data: { setupId: target.id },
        include: { setup: true, customer: true }
      });

      await setSetupPostSessionStatus(tx, existing.setupId);
      await tx.setup.update({
        where: { id: target.id },
        data: { status: "ACTIVE", lastSeenAt: new Date() }
      });

      return updated;
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable
    }
  );

  await publishSessionChange(session.id, session.setupId);
  return session;
}

export async function addSessionNote(sessionId: string, notes: string) {
  const existing = await prisma.setupSession.findUniqueOrThrow({ where: { id: sessionId } });
  const session = await prisma.setupSession.update({
    where: { id: sessionId },
    data: {
      notes: `${existing.notes ?? ""}\n${notes}`.trim()
    },
    include: { setup: true, customer: true }
  });

  await publishSessionChange(session.id, session.setupId);
  return session;
}
