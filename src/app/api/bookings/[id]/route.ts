import { NextRequest } from "next/server";

import { auth } from "@/auth";
import { apiError, ok } from "@/lib/api";
import { assertAuthenticated, assertRole, isAdminRole } from "@/lib/access-control";
import { cancelBooking } from "@/lib/booking-service";
import { prisma } from "@/lib/prisma";
import { publishRealtime } from "@/lib/realtime";
import { REALTIME_CHANNELS, REALTIME_EVENTS } from "@/lib/realtime-events";
import { bookingUpdateSchema } from "@/lib/validations";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    const user = assertAuthenticated(session);
    const { id } = await params;
    const booking = await prisma.booking.findUniqueOrThrow({
      where: { id },
      include: { setup: true, customer: true, payments: true }
    });

    if (!isAdminRole(user.role) && booking.customerId !== user.id) {
      throw new Error("Forbidden");
    }

    return ok({ booking });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    const user = assertAuthenticated(session);
    const { id } = await params;
    const input = bookingUpdateSchema.parse(await request.json());

    if (input.status === "CANCELLED") {
      const booking = await prisma.booking.findUniqueOrThrow({ where: { id } });
      if (!isAdminRole(user.role) && booking.customerId !== user.id) {
        throw new Error("Forbidden");
      }
      return ok({ booking: await cancelBooking(id, user.id, input.notes) });
    }

    assertRole(session, ["ADMIN", "STAFF"]);

    const booking = await prisma.booking.update({
      where: { id },
      data: input,
      include: { setup: true, customer: true }
    });

    await publishRealtime(REALTIME_CHANNELS.availability, REALTIME_EVENTS.bookingChanged, {
      bookingId: booking.id,
      setupId: booking.setupId,
      status: booking.status
    });

    return ok({ booking });
  } catch (error) {
    return apiError(error);
  }
}
