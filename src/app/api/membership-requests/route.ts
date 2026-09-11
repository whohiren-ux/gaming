import { NextRequest } from "next/server";

import { auth } from "@/auth";
import { apiError, ok } from "@/lib/api";
import { assertAuthenticated } from "@/lib/access-control";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notification-service";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const membershipRequestSchema = z.object({
  planId: z.string().min(1),
  preferredDate: z.coerce.date(),
  deviceType: z.string().min(1).max(80)
});

export async function POST(request: NextRequest) {
  const limited = rateLimit(request, "membership-request", 5, 60_000);
  if (limited) {
    return limited;
  }

  try {
    const session = await auth();
    const user = assertAuthenticated(session);
    const input = membershipRequestSchema.parse(await request.json());

    const plan = await prisma.membershipPlan.findUnique({
      where: { id: input.planId, isActive: true }
    });

    if (!plan) {
      return apiError(new Error("Plan not found or inactive."));
    }

    const existingRequest = await prisma.membershipRequest.findFirst({
      where: {
        userId: user.id,
        planId: input.planId,
        status: "PENDING"
      }
    });

    if (existingRequest) {
      return apiError(new Error("You already have a pending request for this plan."));
    }

    const membershipRequest = await prisma.membershipRequest.create({
      data: {
        userId: user.id,
        planId: input.planId,
        preferredDate: input.preferredDate,
        deviceType: input.deviceType,
        status: "PENDING"
      },
      include: {
        plan: true,
        user: { select: { name: true, email: true } }
      }
    });

    await createNotification({
      type: "MEMBERSHIP_REQUEST",
      title: "New membership request",
      message: `${membershipRequest.user.name || membershipRequest.user.email} requested ${plan.name} plan for ${input.deviceType} on ${input.preferredDate.toLocaleDateString()}.`,
      metadata: {
        requestId: membershipRequest.id,
        planName: plan.name,
        userId: user.id
      }
    });

    return ok({ request: membershipRequest }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const user = assertAuthenticated(session);

    const requests = await prisma.membershipRequest.findMany({
      where: { userId: user.id },
      include: { plan: true },
      orderBy: { createdAt: "desc" }
    });

    return ok({ requests });
  } catch (error) {
    return apiError(error);
  }
}
