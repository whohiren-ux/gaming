import { NextRequest } from "next/server";

import { auth } from "@/auth";
import { apiError, ok } from "@/lib/api";
import { assertAuthenticated, assertRole } from "@/lib/access-control";
import { getMembershipPlans } from "@/lib/membership-service";
import { prisma } from "@/lib/prisma";
import { membershipPlanSchema } from "@/lib/validations";

export async function GET() {
  try {
    const plans = await getMembershipPlans();
    return ok({ plans });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    assertAuthenticated(session);
    assertRole(session, ["ADMIN", "STAFF"]);
    const input = membershipPlanSchema.parse(await request.json());
    const plan = await prisma.membershipPlan.create({
      data: input
    });

    return ok({ plan }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
