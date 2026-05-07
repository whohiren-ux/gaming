import { Prisma, type BookingStatus, type PaymentMethod, type PrismaClient, type Setup, type SetupType } from "@prisma/client";

import { BOOKING_HOLD_MINUTES, BOOKING_TOKEN_MINIMUM_INR } from "@/lib/constants";
import { addMinutesSafe, formatClock } from "@/lib/dates";
import { getActiveMembershipDiscountForUser } from "@/lib/membership-service";
import { calculateSessionAmount, toDecimal, toNumber } from "@/lib/money";
import { createNotification } from "@/lib/notification-service";
import { prisma } from "@/lib/prisma";
import { publishRealtime } from "@/lib/realtime";
import { REALTIME_CHANNELS, REALTIME_EVENTS } from "@/lib/realtime-events";
import { absoluteUrl } from "@/lib/utils";

type DbClient = PrismaClient | Prisma.TransactionClient;

const blockingBookingStatuses: BookingStatus[] = ["PENDING", "CONFIRMED"];

function createBookingReference() {
  const stamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `NNX-${stamp}-${random}`;
}

function bufferedWindow(startTime: Date, endTime: Date, bufferMinutes: number) {
  return {
    bufferedStart: addMinutesSafe(startTime, -bufferMinutes),
    bufferedEnd: addMinutesSafe(endTime, bufferMinutes)
  };
}

export async function releaseStalePendingBookings(client: DbClient = prisma) {
  const expiresBefore = new Date(Date.now() - BOOKING_HOLD_MINUTES * 60_000);
  const result = await client.booking.updateMany({
    where: {
      status: "PENDING",
      paidAmount: toDecimal(0),
      createdAt: { lt: expiresBefore }
    },
    data: {
      status: "CANCELLED"
    }
  });

  if (result.count > 0) {
    await publishRealtime(REALTIME_CHANNELS.availability, REALTIME_EVENTS.availabilityChanged, {
      reason: "stale-pending-bookings-released",
      count: result.count
    });
  }

  return result.count;
}

export async function getSetupConflictCount(
  client: DbClient,
  setupId: string,
  startTime: Date,
  endTime: Date,
  bufferMinutes: number,
  options?: {
    ignoreBookingId?: string;
    ignoreSessionId?: string;
  }
) {
  const { bufferedStart, bufferedEnd } = bufferedWindow(startTime, endTime, bufferMinutes);

  const [bookingCount, sessionCount] = await Promise.all([
    client.booking.count({
      where: {
        setupId,
        id: options?.ignoreBookingId ? { not: options.ignoreBookingId } : undefined,
        status: { in: blockingBookingStatuses },
        startTime: { lt: bufferedEnd },
        endTime: { gt: bufferedStart }
      }
    }),
    client.setupSession.count({
      where: {
        setupId,
        id: options?.ignoreSessionId ? { not: options.ignoreSessionId } : undefined,
        status: { in: ["ACTIVE", "PAUSED", "EXPIRED"] },
        startedAt: { lt: bufferedEnd },
        endsAt: { gt: bufferedStart }
      }
    })
  ]);

  return bookingCount + sessionCount;
}

export async function assertSetupWindowAvailable(
  client: DbClient,
  setup: Pick<Setup, "id" | "status" | "isBookable" | "bufferMinutes">,
  startTime: Date,
  endTime: Date,
  options?: {
    ignoreBookingId?: string;
    ignoreSessionId?: string;
  }
) {
  if (!setup.isBookable || setup.status === "MAINTENANCE") {
    throw new Error("This setup is not available for booking.");
  }

  const conflicts = await getSetupConflictCount(
    client,
    setup.id,
    startTime,
    endTime,
    setup.bufferMinutes,
    options
  );

  if (conflicts > 0) {
    throw new Error("This slot overlaps with an existing booking or active session.");
  }
}

export async function findAvailableSetupForWindow(
  client: DbClient,
  input: {
    setupType: SetupType;
    startTime: Date;
    endTime: Date;
    preferredSetupId?: string;
    ignoreBookingId?: string;
  }
) {
  const candidates = await client.setup.findMany({
    where: input.preferredSetupId
      ? { id: input.preferredSetupId, type: input.setupType }
      : { type: input.setupType, isBookable: true, status: { not: "MAINTENANCE" } },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }]
  });

  for (const setup of candidates) {
    const conflicts = await getSetupConflictCount(
      client,
      setup.id,
      input.startTime,
      input.endTime,
      setup.bufferMinutes,
      { ignoreBookingId: input.ignoreBookingId }
    );

    if (conflicts === 0) {
      return setup;
    }
  }

  throw new Error("No setup is available for the requested time window.");
}

export async function createBooking(input: {
  customerId: string;
  setupId?: string;
  setupType: SetupType;
  startTime: Date;
  durationMinutes: number;
  paymentIntent: "TOKEN" | "FULL";
  source?: "ONLINE" | "WALK_IN" | "ADMIN";
  notes?: string;
}) {
  await releaseStalePendingBookings();

  const now = new Date();
  const startTime = new Date(input.startTime);

  if (startTime.getTime() < now.getTime() - 2 * 60_000) {
    throw new Error("Booking start time cannot be in the past.");
  }

  const endTime = addMinutesSafe(startTime, input.durationMinutes);

  const booking = await prisma.$transaction(
    async (tx) => {
      const setup = await findAvailableSetupForWindow(tx, {
        setupType: input.setupType,
        preferredSetupId: input.setupId,
        startTime,
        endTime
      });

      const basePrice = calculateSessionAmount(setup.hourlyPrice, input.durationMinutes);
      const discountPercent = await getActiveMembershipDiscountForUser(input.customerId, tx);
      const discountedTotal = toDecimal(
        Math.ceil(toNumber(basePrice) * ((100 - discountPercent) / 100))
      );
      const tokenAmount =
        input.paymentIntent === "FULL"
          ? discountedTotal
          : toDecimal(Math.min(toNumber(discountedTotal), Math.max(BOOKING_TOKEN_MINIMUM_INR, Math.ceil(toNumber(discountedTotal) * 0.25))));
      const reference = createBookingReference();

      return tx.booking.create({
        data: {
          reference,
          setupId: setup.id,
          customerId: input.customerId,
          setupType: setup.type,
          status: "PENDING",
          source: input.source ?? "ONLINE",
          startTime,
          endTime,
          durationMinutes: input.durationMinutes,
          bufferMinutes: setup.bufferMinutes,
          priceTotal: discountedTotal,
          tokenAmount,
          paidAmount: toDecimal(0),
          paymentStatus: "PENDING",
          notes: input.notes,
          qrPayload: absoluteUrl(`/booking?reference=${reference}`)
        },
        include: {
          setup: true,
          customer: true
        }
      });
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable
    }
  );

  await publishRealtime(REALTIME_CHANNELS.availability, REALTIME_EVENTS.bookingChanged, {
    bookingId: booking.id,
    setupId: booking.setupId,
    status: booking.status
  });

  await publishRealtime(REALTIME_CHANNELS.admin, REALTIME_EVENTS.bookingChanged, {
    bookingId: booking.id,
    setupName: booking.setup.name,
    status: booking.status
  });

  return booking;
}

export async function confirmBookingPayment(
  bookingId: string,
  amountPaid: number,
  paymentMode: PaymentMethod
) {
  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
    include: { setup: true, customer: true }
  });

  const paidAmount = toNumber(booking.paidAmount) + amountPaid;
  const total = toNumber(booking.priceTotal);
  const token = toNumber(booking.tokenAmount);
  const paymentStatus = paidAmount >= total ? "PAID" : paidAmount > 0 ? "PARTIAL" : "PENDING";
  const status = paidAmount >= token ? "CONFIRMED" : booking.status;

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      paidAmount: toDecimal(paidAmount),
      paymentStatus,
      paymentMode,
      status
    },
    include: { setup: true, customer: true }
  });

  if (status === "CONFIRMED") {
    await createNotification({
      userId: updated.customerId,
      type: "BOOKING_CONFIRMATION",
      title: "Booking confirmed",
      message: `${updated.setup.name} is confirmed for ${formatClock(updated.startTime)}.`,
      metadata: {
        bookingId: updated.id,
        reference: updated.reference
      }
    });
  }

  await publishRealtime(REALTIME_CHANNELS.availability, REALTIME_EVENTS.bookingChanged, {
    bookingId: updated.id,
    setupId: updated.setupId,
    status: updated.status
  });

  await publishRealtime(REALTIME_CHANNELS.admin, REALTIME_EVENTS.paymentChanged, {
    bookingId: updated.id,
    paidAmount
  });

  return updated;
}

export async function cancelBooking(bookingId: string, actorUserId: string, reason?: string) {
  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "CANCELLED",
      notes: reason
    },
    include: {
      customer: true,
      setup: true
    }
  });

  await createNotification({
    userId: booking.customerId,
    type: "SYSTEM",
    title: "Booking cancelled",
    message: `${booking.reference} for ${booking.setup.name} was cancelled.`,
    metadata: {
      bookingId,
      actorUserId,
      reason
    }
  });

  await publishRealtime(REALTIME_CHANNELS.availability, REALTIME_EVENTS.bookingChanged, {
    bookingId,
    setupId: booking.setupId,
    status: "CANCELLED"
  });

  return booking;
}

export async function listBookings(input: {
  userId?: string;
  isAdmin?: boolean;
  status?: BookingStatus;
  take?: number;
}) {
  return prisma.booking.findMany({
    where: {
      ...(input.isAdmin ? {} : { customerId: input.userId }),
      ...(input.status ? { status: input.status } : {})
    },
    include: {
      setup: true,
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true
        }
      },
      payments: true
    },
    orderBy: { startTime: "desc" },
    take: input.take ?? 100
  });
}
