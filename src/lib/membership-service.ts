import { Prisma, type PrismaClient } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { publishRealtime } from "@/lib/realtime";
import { REALTIME_CHANNELS, REALTIME_EVENTS } from "@/lib/realtime-events";

type DbClient = PrismaClient | Prisma.TransactionClient;

export async function getActiveMembershipForUser(
  userId: string,
  client: DbClient = prisma
) {
  return client.membership.findFirst({
    where: {
      userId,
      status: "ACTIVE",
      startsAt: { lte: new Date() },
      endsAt: { gt: new Date() }
    },
    include: { plan: true },
    orderBy: { endsAt: "desc" }
  });
}

export async function getActiveMembershipDiscountForUser(
  userId: string,
  client: DbClient = prisma
) {
  const membership = await getActiveMembershipForUser(userId, client);
  return membership?.plan.discountPercent ?? 0;
}

export async function deductMembershipMinutes(
  userId: string,
  minutes: number,
  client: DbClient = prisma
) {
  const membership = await getActiveMembershipForUser(userId, client);
  if (!membership || membership.remainingMinutes <= 0) return null;

  const newRemaining = Math.max(0, membership.remainingMinutes - minutes);
  return client.membership.update({
    where: { id: membership.id },
    data: { remainingMinutes: newRemaining }
  });
}

export async function getMembershipPlans() {
  return prisma.membershipPlan.findMany({
    where: { isActive: true },
    orderBy: [{ priorityBooking: "desc" }, { price: "asc" }]
  });
}

function getMembershipDurationMs(type: string): number {
  switch (type) {
    case "MONTHLY":
      return 1000 * 60 * 60 * 24 * 30;
    case "HOURS":
      return 1000 * 60 * 60 * 24 * 7;
    case "VIP":
      return 1000 * 60 * 60 * 24 * 90;
    default:
      return 1000 * 60 * 60 * 24 * 30;
  }
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

  const durationMs = getMembershipDurationMs(plan.type);

  const membership = await prisma.membership.create({
    data: {
      userId: input.userId,
      planId: input.planId,
      startsAt,
      endsAt: new Date(startsAt.getTime() + durationMs),
      remainingMinutes: plan.includedMinutes
    },
    include: { plan: true, user: true }
  });

  await publishRealtime(REALTIME_CHANNELS.admin, REALTIME_EVENTS.analyticsChanged, {
    membershipId: membership.id
  });

  return membership;
}

export async function expireOverdueMemberships() {
  const now = new Date();
  const result = await prisma.membership.updateMany({
    where: {
      status: "ACTIVE",
      endsAt: { lt: now }
    },
    data: {
      status: "EXPIRED"
    }
  });

  return result.count;
}
