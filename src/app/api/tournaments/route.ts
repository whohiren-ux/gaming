import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";

import { auth } from "@/auth";
import { apiError, ok } from "@/lib/api";
import { assertRole } from "@/lib/access-control";
import { prisma } from "@/lib/prisma";
import { tournamentSchema } from "@/lib/validations";

export async function GET() {
  try {
    const tournaments = await prisma.tournament.findMany({
      where: { status: { in: ["UPCOMING", "LIVE"] } },
      include: { registrations: true },
      orderBy: { startsAt: "asc" }
    });

    return ok({ tournaments });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    assertRole(session, ["ADMIN", "STAFF"]);
    const input = tournamentSchema.parse(await request.json());
    const tournament = await prisma.tournament.create({
      data: {
        ...input,
        entryFee: new Prisma.Decimal(input.entryFee),
        prizePool: new Prisma.Decimal(input.prizePool)
      }
    });

    return ok({ tournament }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
