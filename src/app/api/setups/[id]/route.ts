import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";

import { auth } from "@/auth";
import { apiError, ok } from "@/lib/api";
import { assertRole } from "@/lib/access-control";
import { prisma } from "@/lib/prisma";
import { publishRealtime } from "@/lib/realtime";
import { REALTIME_CHANNELS, REALTIME_EVENTS } from "@/lib/realtime-events";
import { setupUpdateSchema } from "@/lib/validations";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const setup = await prisma.setup.findUniqueOrThrow({
      where: { id },
      include: {
        bookings: {
          where: { status: { in: ["PENDING", "CONFIRMED"] } },
          orderBy: { startTime: "asc" },
          take: 10
        },
        setupSessions: {
          orderBy: { startedAt: "desc" },
          take: 10
        }
      }
    });

    return ok({ setup });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    assertRole(session, ["ADMIN", "STAFF"]);
    const { id } = await params;
    const input = setupUpdateSchema.parse(await request.json());

    const setup = await prisma.setup.update({
      where: { id },
      data: {
        stationCode: input.stationCode,
        name: input.name,
        type: input.type,
        status: input.status,
        floor: input.floor,
        displayOrder: input.displayOrder,
        bufferMinutes: input.bufferMinutes,
        isBookable: input.isBookable,
        specs: input.specs as Prisma.InputJsonValue | undefined,
        hourlyPrice:
          input.hourlyPrice === undefined ? undefined : new Prisma.Decimal(input.hourlyPrice)
      }
    });

    await publishRealtime(REALTIME_CHANNELS.availability, REALTIME_EVENTS.availabilityChanged, {
      setupId: setup.id,
      reason: "setup-updated"
    });

    return ok({ setup });
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    assertRole(session, ["ADMIN"]);
    const { id } = await params;

    const setup = await prisma.setup.update({
      where: { id },
      data: {
        isBookable: false,
        status: "MAINTENANCE"
      }
    });

    await publishRealtime(REALTIME_CHANNELS.availability, REALTIME_EVENTS.availabilityChanged, {
      setupId: setup.id,
      reason: "setup-disabled"
    });

    return ok({ setup });
  } catch (error) {
    return apiError(error);
  }
}
