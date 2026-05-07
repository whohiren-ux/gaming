import { Prisma, type PrismaClient } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { publishRealtime } from "@/lib/realtime";
import { REALTIME_CHANNELS, REALTIME_EVENTS } from "@/lib/realtime-events";

type DbClient = PrismaClient | Prisma.TransactionClient;

export async function getActiveMembershipDiscountForUser(
  userId: string,
  client: DbClient = prisma
) {
  const membership = await client.membership.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      startsAt: { lte: new Date() },
      endsAt: { gt: new Date() }
    },
    include: { plan: true },
    orderBy: { endsAt: "desc" }
  });

  return membership?.plan.discountPercent ?? 0;
}

export async function getMembershipPlans() {
  return prisma.membershipPlan.findMany({
    where: { isActive: true },
    orderBy: [{ priorityBooking: "desc" }, { price: "asc" }]
  });
}

export async function activateMembership(input: {
  userId: string;
  planId: string;
  startsAt?: Date;
}) {
  const startsAt = input.startsAt ?? new Date();
  const plan = await prisma.membershipPlan.findUniqueOrThrow({
    where: { id: input.planId }
  });

  const membership = await prisma.membership.create({
    data: {
      userId: input.userId,
      planId: input.planId,
      startsAt,
      endsAt: new Date(startsAt.getTime() + 1000 * 60 * 60 * 24 * 30),
      remainingMinutes: plan.includedMinutes
    },
    include: { plan: true, user: true }
  });

  await publishRealtime(REALTIME_CHANNELS.admin, REALTIME_EVENTS.analyticsChanged, {
    membershipId: membership.id
  });

  return membership;
}
