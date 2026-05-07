import type { SetupStatus } from "@prisma/client";

import { emitEndingSoonAlerts, expireOverdueSessions } from "@/lib/session-service";
import { formatClock, minutesFromNow } from "@/lib/dates";
import { toNumber } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { releaseStalePendingBookings } from "@/lib/booking-service";
import type { AvailabilitySetup } from "@/types";

function displayStatus(input: {
  setupStatus: SetupStatus;
  remainingMinutes: number | null;
  hasCurrentBooking: boolean;
}) {
  if (input.setupStatus === "MAINTENANCE") {
    return "MAINTENANCE" as const;
  }

  if (input.remainingMinutes !== null) {
    if (input.remainingMinutes <= 0) {
      return "EXPIRED" as const;
    }
    if (input.remainingMinutes <= 10) {
      return "ENDING_SOON" as const;
    }
    return "ACTIVE" as const;
  }

  if (input.hasCurrentBooking || input.setupStatus === "RESERVED") {
    return "RESERVED" as const;
  }

  return "AVAILABLE" as const;
}

export async function getLiveAvailability(): Promise<AvailabilitySetup[]> {
  await releaseStalePendingBookings();
  await expireOverdueSessions();
  await emitEndingSoonAlerts();

  const now = new Date();
  const setups = await prisma.setup.findMany({
    include: {
      setupSessions: {
        where: {
          status: { in: ["ACTIVE", "PAUSED", "EXPIRED"] }
        },
        include: {
          customer: {
            select: { name: true, phone: true }
          }
        },
        orderBy: { startedAt: "desc" },
        take: 1
      },
      bookings: {
        where: {
          status: { in: ["PENDING", "CONFIRMED"] },
          endTime: { gt: now }
        },
        include: {
          customer: {
            select: { name: true, phone: true }
          }
        },
        orderBy: { startTime: "asc" },
        take: 4
      }
    },
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }]
  });

  return setups.map((setup) => {
    const activeSession = setup.setupSessions[0];
    const remainingMinutes = activeSession ? minutesFromNow(activeSession.endsAt) : null;
    const currentBooking = setup.bookings.find(
      (booking) => booking.startTime <= now && booking.endTime > now
    );
    const nextBooking = setup.bookings.find((booking) => booking.startTime > now);
    const status = displayStatus({
      setupStatus: setup.status,
      remainingMinutes,
      hasCurrentBooking: Boolean(currentBooking)
    });

    let availabilityLabel = "Available now";
    let availableAt: string | null = null;

    if (status === "MAINTENANCE") {
      availabilityLabel = "Maintenance";
    } else if (activeSession) {
      availabilityLabel =
        remainingMinutes && remainingMinutes > 0
          ? `Occupied - ${remainingMinutes} mins remaining`
          : "Expired - needs checkout";
      availableAt = activeSession.endsAt.toISOString();
    } else if (currentBooking) {
      availabilityLabel = `Booked until ${formatClock(currentBooking.endTime)}`;
      availableAt = currentBooking.endTime.toISOString();
    } else if (nextBooking) {
      availabilityLabel = `Available until ${formatClock(nextBooking.startTime)}`;
      availableAt = nextBooking.startTime.toISOString();
    }

    return {
      id: setup.id,
      stationCode: setup.stationCode,
      name: setup.name,
      type: setup.type,
      hourlyPrice: toNumber(setup.hourlyPrice),
      status: setup.status,
      displayStatus: status,
      availabilityLabel,
      remainingMinutes,
      availableAt,
      currentCustomer:
        activeSession?.customer?.name ||
        activeSession?.customer?.phone ||
        currentBooking?.customer?.name ||
        null,
      activeSessionId: activeSession?.id ?? null,
      currentAmount: activeSession ? toNumber(activeSession.billedAmount) : 0,
      queue: setup.bookings.map((booking) => ({
        id: booking.id,
        reference: booking.reference,
        status: booking.status,
        startsAt: booking.startTime.toISOString(),
        endsAt: booking.endTime.toISOString(),
        customerName: booking.customer.name
      }))
    };
  });
}

export async function getPublicPricing() {
  const setups = await prisma.setup.groupBy({
    by: ["type"],
    where: { isBookable: true },
    _min: { hourlyPrice: true },
    _max: { hourlyPrice: true },
    _count: { id: true }
  });

  return setups.map((setup) => ({
    type: setup.type,
    minHourlyPrice: toNumber(setup._min.hourlyPrice),
    maxHourlyPrice: toNumber(setup._max.hourlyPrice),
    setupCount: setup._count.id
  }));
}
