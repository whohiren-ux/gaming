"use server";

import { revalidatePath } from "next/cache";
import { Prisma, type Role } from "@prisma/client";

import { auth } from "@/auth";
import { assertRole } from "@/lib/access-control";
import { prisma } from "@/lib/prisma";
import { expenseSchema, membershipPlanSchema, tournamentSchema } from "@/lib/validations";

export async function createExpenseAction(formData: FormData) {
  const session = await auth();
  const actor = assertRole(session, ["ADMIN", "STAFF"]);
  const input = expenseSchema.parse({
    title: formData.get("title"),
    category: formData.get("category"),
    amount: formData.get("amount"),
    incurredAt: formData.get("incurredAt") || new Date(),
    notes: formData.get("notes") || undefined
  });

  await prisma.expense.create({
    data: {
      ...input,
      amount: new Prisma.Decimal(input.amount),
      createdById: actor.id
    }
  });

  revalidatePath("/admin/expenses");
}

export async function createTournamentAction(formData: FormData) {
  const session = await auth();
  assertRole(session, ["ADMIN", "STAFF"]);
  const input = tournamentSchema.parse({
    title: formData.get("title"),
    game: formData.get("game"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt") || undefined,
    entryFee: formData.get("entryFee"),
    prizePool: formData.get("prizePool"),
    maxPlayers: formData.get("maxPlayers"),
    status: formData.get("status") || "UPCOMING",
    description: formData.get("description") || undefined,
    rules: formData.get("rules") || undefined
  });

  await prisma.tournament.create({
    data: {
      ...input,
      entryFee: new Prisma.Decimal(input.entryFee),
      prizePool: new Prisma.Decimal(input.prizePool)
    }
  });

  revalidatePath("/admin/tournaments");
  revalidatePath("/tournaments");
}

export async function createMembershipPlanAction(formData: FormData) {
  const session = await auth();
  assertRole(session, ["ADMIN"]);
  const input = membershipPlanSchema.parse({
    name: formData.get("name"),
    type: formData.get("type"),
    price: formData.get("price"),
    includedMinutes: formData.get("includedMinutes"),
    playerCount: formData.get("playerCount") || 1,
    discountPercent: formData.get("discountPercent"),
    priorityBooking: formData.get("priorityBooking") === "on",
    maxDailyMinutes: formData.get("maxDailyMinutes") || undefined,
    description: formData.get("description") || undefined
  });

  await prisma.membershipPlan.create({
    data: {
      ...input,
      price: new Prisma.Decimal(input.price)
    }
  });

  revalidatePath("/admin/memberships");
  revalidatePath("/memberships");
}

export async function updateMembershipPlanAction(planId: string, formData: FormData) {
  const session = await auth();
  assertRole(session, ["ADMIN"]);
  const input = membershipPlanSchema.parse({
    name: formData.get("name"),
    type: formData.get("type"),
    price: formData.get("price"),
    includedMinutes: formData.get("includedMinutes"),
    playerCount: formData.get("playerCount") || 1,
    discountPercent: formData.get("discountPercent"),
    priorityBooking: formData.get("priorityBooking") === "on",
    maxDailyMinutes: formData.get("maxDailyMinutes") || undefined,
    description: formData.get("description") || undefined
  });

  await prisma.membershipPlan.update({
    where: { id: planId },
    data: {
      ...input,
      price: new Prisma.Decimal(input.price)
    }
  });

  revalidatePath("/admin/memberships");
  revalidatePath("/memberships");
}

export async function toggleMembershipPlanActiveAction(planId: string) {
  const session = await auth();
  assertRole(session, ["ADMIN"]);

  const plan = await prisma.membershipPlan.findUniqueOrThrow({ where: { id: planId } });
  await prisma.membershipPlan.update({
    where: { id: planId },
    data: { isActive: !plan.isActive }
  });

  revalidatePath("/admin/memberships");
  revalidatePath("/memberships");
}

export async function deleteMembershipPlanAction(planId: string) {
  const session = await auth();
  assertRole(session, ["ADMIN"]);

  const activeCount = await prisma.membership.count({
    where: { planId, status: "ACTIVE" }
  });
  if (activeCount > 0) {
    throw new Error("Cannot delete plan with active members. Deactivate it instead.");
  }

  await prisma.membership.deleteMany({ where: { planId } });
  await prisma.membershipPlan.delete({ where: { id: planId } });

  revalidatePath("/admin/memberships");
  revalidatePath("/memberships");
}

export async function assignMembershipAction(formData: FormData) {
  const session = await auth();
  assertRole(session, ["ADMIN"]);

  const userId = String(formData.get("userId") || "");
  const planId = String(formData.get("planId") || "");
  if (!userId || !planId) throw new Error("userId and planId required");

  const { activateMembership } = await import("@/lib/membership-service");
  await activateMembership({ userId, planId });

  revalidatePath("/admin/memberships");
}

export async function cancelMembershipAction(membershipId: string) {
  const session = await auth();
  assertRole(session, ["ADMIN"]);

  await prisma.membership.update({
    where: { id: membershipId },
    data: { status: "CANCELLED", remainingMinutes: 0 }
  });

  revalidatePath("/admin/memberships");
}

export async function updateUserRoleAction(formData: FormData) {
  const session = await auth();
  assertRole(session, ["ADMIN"]);
  const userId = String(formData.get("userId") || "");
  const role = String(formData.get("role") || "CUSTOMER") as Role;

  await prisma.user.update({
    where: { id: userId },
    data: { role }
  });

  revalidatePath("/admin/users");
}

export async function approveMembershipRequestAction(requestId: string) {
  const session = await auth();
  assertRole(session, ["ADMIN"]);

  const request = await prisma.membershipRequest.findUnique({
    where: { id: requestId },
    include: { plan: true, user: { select: { name: true, email: true } } }
  });

  if (!request) throw new Error("Request not found.");
  if (request.status !== "PENDING") throw new Error("Request is not pending.");

  const { activateMembership } = await import("@/lib/membership-service");
  await activateMembership({ userId: request.userId, planId: request.planId });

  await prisma.membershipRequest.update({
    where: { id: requestId },
    data: { status: "APPROVED" }
  });

  const { createNotification } = await import("@/lib/notification-service");
  await createNotification({
    userId: request.userId,
    type: "SYSTEM",
    title: "Membership approved",
    message: `Your ${request.plan.name} membership has been approved and activated.`,
    metadata: { requestId, planName: request.plan.name }
  });

  revalidatePath("/admin/membership-requests");
  revalidatePath("/membership-requests");
}

export async function rejectMembershipRequestAction(requestId: string, adminNote?: string) {
  const session = await auth();
  assertRole(session, ["ADMIN"]);

  const request = await prisma.membershipRequest.findUnique({
    where: { id: requestId },
    include: { plan: true }
  });

  if (!request) throw new Error("Request not found.");
  if (request.status !== "PENDING") throw new Error("Request is not pending.");

  await prisma.membershipRequest.update({
    where: { id: requestId },
    data: { status: "REJECTED", adminNote: adminNote || undefined }
  });

  const { createNotification } = await import("@/lib/notification-service");
  await createNotification({
    userId: request.userId,
    type: "SYSTEM",
    title: "Membership request declined",
    message: `Your ${request.plan.name} membership request has been declined.${adminNote ? ` Reason: ${adminNote}` : ""}`,
    metadata: { requestId, planName: request.plan.name }
  });

  revalidatePath("/admin/membership-requests");
}
