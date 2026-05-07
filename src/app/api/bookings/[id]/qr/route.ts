import QRCode from "qrcode";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { apiError } from "@/lib/api";
import { assertAuthenticated, isAdminRole } from "@/lib/access-control";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: NextRequest, { params }: Params) {
  try {
    const session = await auth();
    const user = assertAuthenticated(session);
    const { id } = await params;
    const booking = await prisma.booking.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        customerId: true,
        qrPayload: true,
        reference: true
      }
    });

    if (!isAdminRole(user.role) && booking.customerId !== user.id) {
      throw new Error("Forbidden");
    }

    const svg = await QRCode.toString(booking.qrPayload || booking.reference, {
      type: "svg",
      margin: 1,
      width: 256,
      color: {
        dark: "#07111f",
        light: "#f8fbff"
      }
    });

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "private, max-age=60"
      }
    });
  } catch (error) {
    return apiError(error);
  }
}
