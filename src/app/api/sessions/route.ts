import { NextRequest } from "next/server";

import { auth } from "@/auth";
import { apiError, ok } from "@/lib/api";
import { assertRole } from "@/lib/access-control";
import { prisma } from "@/lib/prisma";
import { startSession } from "@/lib/session-service";
import { sessionStartSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    assertRole(session, ["ADMIN", "STAFF"]);
    const status = request.nextUrl.searchParams.get("status");

    const sessions = await prisma.setupSession.findMany({
      where: status ? { status: status as never } : undefined,
      include: {
        setup: true,
        customer: { select: { id: true, name: true, email: true, phone: true } },
        booking: true,
        payments: true
      },
      orderBy: { startedAt: "desc" },
      take: 200
    });

    return ok({ sessions });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const actor = assertRole(session, ["ADMIN", "STAFF"]);
    const input = sessionStartSchema.parse(await request.json());

    const setupSession = await startSession({
      ...input,
      createdById: actor.id
    });

    return ok({ session: setupSession }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
