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
