import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";

import { auth } from "@/auth";
import { apiError, ok } from "@/lib/api";
import { assertRole } from "@/lib/access-control";
import { prisma } from "@/lib/prisma";
import { publishRealtime } from "@/lib/realtime";
import { REALTIME_CHANNELS, REALTIME_EVENTS } from "@/lib/realtime-events";
import { getLiveAvailability } from "@/lib/setup-service";
import { setupCreateSchema } from "@/lib/validations";

export async function GET() {
  try {
    const setups = await getLiveAvailability();
    return ok({ setups });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    assertRole(session, ["ADMIN", "STAFF"]);
    const input = setupCreateSchema.parse(await request.json());

    const setup = await prisma.setup.create({
      data: {
        stationCode: input.stationCode,
        name: input.name,
        type: input.type,
        hourlyPrice: new Prisma.Decimal(input.hourlyPrice),
        status: input.status,
        floor: input.floor,
        displayOrder: input.displayOrder,
        bufferMinutes: input.bufferMinutes,
        isBookable: input.isBookable,
        specs: input.specs as Prisma.InputJsonValue | undefined
      }
    });

    await publishRealtime(REALTIME_CHANNELS.availability, REALTIME_EVENTS.availabilityChanged, {
      setupId: setup.id,
      reason: "setup-created"
    });

    return ok({ setup }, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
