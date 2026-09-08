import { NextRequest } from "next/server";

import { auth } from "@/auth";
import { apiError, ok } from "@/lib/api";
import { assertAuthenticated, assertRole } from "@/lib/access-control";
import { prisma } from "@/lib/prisma";
import { membershipPlanSchema } from "@/lib/validations";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const plan = await prisma.membershipPlan.findUnique({
      where: { id },
      include: {
        memberships: {
          include: { user: { select: { id: true, name: true, email: true } } }
        }
      }
    });
    if (!plan) return apiError(new Error("Not found"));
    return ok({ plan });
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    assertAuthenticated(session);
    assertRole(session, ["ADMIN"]);
    const { id } = await params;
    const input = membershipPlanSchema.parse(await request.json());
    const plan = await prisma.membershipPlan.update({
      where: { id },
      data: input
    });
    return ok({ plan });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    assertAuthenticated(session);
    assertRole(session, ["ADMIN"]);
    const { id } = await params;

    const activeCount = await prisma.membership.count({
      where: { planId: id, status: "ACTIVE" }
    });
    if (activeCount > 0) {
      return apiError(new Error("Cannot delete plan with active members"));
    }

    await prisma.membership.deleteMany({ where: { planId: id } });
    await prisma.membershipPlan.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (error) {
    return apiError(error);
  }
}
