import { NextRequest } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { apiError, ok } from "@/lib/api";
import { assertAuthenticated } from "@/lib/access-control";
import { prisma } from "@/lib/prisma";
import { createRazorpayOrder } from "@/lib/payment-service";

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

    const isFree = Number(tournament.entryFee) === 0;

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
        paid: isFree
      }
    });

    let paymentOrder = null;
    if (!isFree) {
      const { order } = await createRazorpayOrder({
        userId: user.id,
        amount: Number(tournament.entryFee),
        paymentType: "FULL"
      });
      paymentOrder = {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
      };
    }

    return ok({ registration, paymentOrder }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
