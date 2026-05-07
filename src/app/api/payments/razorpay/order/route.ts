import { NextRequest } from "next/server";

import { auth } from "@/auth";
import { apiError, ok } from "@/lib/api";
import { assertAuthenticated, isAdminRole } from "@/lib/access-control";
import { toNumber } from "@/lib/money";
import { createRazorpayOrder } from "@/lib/payment-service";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { razorpayOrderSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, "razorpay-order", 20, 60_000);
  if (limited) {
    return limited;
  }

  try {
    const session = await auth();
    const user = assertAuthenticated(session);
    const input = razorpayOrderSchema.parse(await request.json());
    let amount = input.amount;
    let membershipPlanId: string | undefined;

    if (input.bookingId) {
      const booking = await prisma.booking.findUniqueOrThrow({
        where: { id: input.bookingId }
      });

      if (!isAdminRole(user.role) && booking.customerId !== user.id) {
        throw new Error("Forbidden");
      }

      const due = Math.max(0, toNumber(booking.priceTotal) - toNumber(booking.paidAmount));
      const minimum = Math.max(0, toNumber(booking.tokenAmount) - toNumber(booking.paidAmount));

      if (amount < minimum || amount > due) {
        throw new Error(`Payment amount must be between ₹${minimum} and ₹${due}.`);
      }
    }

    if (input.sessionId) {
      const setupSession = await prisma.setupSession.findUniqueOrThrow({
        where: { id: input.sessionId }
      });

      if (!isAdminRole(user.role) && setupSession.customerId !== user.id) {
        throw new Error("Forbidden");
      }

      const due = Math.max(0, toNumber(setupSession.billedAmount) - toNumber(setupSession.paidAmount));
      if (amount > due) {
        amount = due;
      }
    }

    if (input.membershipPlanId) {
      const plan = await prisma.membershipPlan.findUniqueOrThrow({
        where: { id: input.membershipPlanId }
      });
      membershipPlanId = plan.id;
      amount = toNumber(plan.price);
    }

    const order = await createRazorpayOrder({
      userId: user.id,
      bookingId: input.bookingId,
      sessionId: input.sessionId,
      membershipPlanId,
      amount,
      paymentType: input.paymentType
    });

    return ok({
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      ...order
    });
  } catch (error) {
    return apiError(error);
  }
}
