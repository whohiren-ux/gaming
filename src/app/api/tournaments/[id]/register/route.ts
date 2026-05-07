import { NextRequest } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { apiError, ok } from "@/lib/api";
import { assertAuthenticated } from "@/lib/access-control";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string }>;
};

const registrationSchema = z.object({
  gamerTag: z.string().min(2).max(40)
});

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    const user = assertAuthenticated(session);
    const { id } = await params;
    const input = registrationSchema.parse(await request.json());
    const tournament = await prisma.tournament.findUniqueOrThrow({
      where: { id },
      include: { registrations: true }
    });

    if (!["UPCOMING", "LIVE"].includes(tournament.status)) {
      throw new Error("Tournament registration is closed.");
    }

    if (tournament.registrations.length >= tournament.maxPlayers) {
      throw new Error("Tournament is full.");
    }

    const registration = await prisma.tournamentRegistration.upsert({
      where: {
        tournamentId_userId: {
          tournamentId: id,
          userId: user.id
        }
      },
      update: {
        gamerTag: input.gamerTag
      },
      create: {
        tournamentId: id,
        userId: user.id,
        gamerTag: input.gamerTag,
        paid: Number(tournament.entryFee) === 0
      }
    });

    return ok({ registration }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
