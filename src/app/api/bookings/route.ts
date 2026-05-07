import { NextRequest } from "next/server";

import { auth } from "@/auth";
import { apiError, ok } from "@/lib/api";
import { assertAuthenticated, isAdminRole } from "@/lib/access-control";
import { createBooking, listBookings } from "@/lib/booking-service";
import { rateLimit } from "@/lib/rate-limit";
import { bookingCreateSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const user = assertAuthenticated(session);
    const status = request.nextUrl.searchParams.get("status") || undefined;
    const bookings = await listBookings({
      userId: user.id,
      isAdmin: isAdminRole(user.role),
      status: status as never
    });

    return ok({ bookings });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, "booking-create", 20, 60_000);
  if (limited) {
    return limited;
  }

  try {
    const session = await auth();
    const user = assertAuthenticated(session);
    const input = bookingCreateSchema.parse(await request.json());

    const booking = await createBooking({
      customerId: user.id,
      setupId: input.setupId,
      setupType: input.setupType,
      startTime: input.startTime,
      durationMinutes: input.durationMinutes,
      paymentIntent: input.paymentIntent,
      source: input.source,
      notes: input.notes
    });

    return ok({ booking }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
