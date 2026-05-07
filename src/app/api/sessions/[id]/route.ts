import { NextRequest } from "next/server";

import { auth } from "@/auth";
import { apiError, ok } from "@/lib/api";
import { assertRole } from "@/lib/access-control";
import { prisma } from "@/lib/prisma";
import {
  addSessionNote,
  endSession,
  extendSession,
  forceStopSession,
  pauseSession,
  resumeSession,
  switchSessionSetup
} from "@/lib/session-service";
import { sessionActionSchema } from "@/lib/validations";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    assertRole(session, ["ADMIN", "STAFF"]);
    const { id } = await params;
    const setupSession = await prisma.setupSession.findUniqueOrThrow({
      where: { id },
      include: {
        setup: true,
        customer: true,
        booking: true,
        payments: true
      }
    });

    return ok({ session: setupSession });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const authSession = await auth();
    const actor = assertRole(authSession, ["ADMIN", "STAFF"]);
    const { id } = await params;
    const input = sessionActionSchema.parse(await request.json());

    if (input.action === "PAUSE") {
      return ok({ session: await pauseSession(id) });
    }

    if (input.action === "RESUME") {
      return ok({ session: await resumeSession(id) });
    }

    if (input.action === "EXTEND") {
      return ok({
        session: await extendSession(id, {
          minutes: input.minutes,
          paymentMethod: input.paymentMethod,
          paidAmount: input.paidAmount
        })
      });
    }

    if (input.action === "END") {
      return ok({
        session: await endSession(id, {
          endedById: actor.id,
          paymentMethod: input.paymentMethod,
          paidAmount: input.paidAmount,
          notes: input.notes
        })
      });
    }

    if (input.action === "FORCE_STOP") {
      return ok({ session: await forceStopSession(id, actor.id, input.notes) });
    }

    if (input.action === "SWITCH_SETUP") {
      return ok({ session: await switchSessionSetup(id, input.targetSetupId) });
    }

    return ok({ session: await addSessionNote(id, input.notes) });
  } catch (error) {
    return apiError(error);
  }
}
