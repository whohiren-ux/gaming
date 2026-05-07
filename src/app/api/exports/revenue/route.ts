import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { apiError } from "@/lib/api";
import { assertRole } from "@/lib/access-control";
import { buildRevenueCsv } from "@/lib/analytics-service";

export async function GET() {
  try {
    const session = await auth();
    assertRole(session, ["ADMIN", "STAFF"]);
    const csv = await buildRevenueCsv();

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="gaming-cafe-revenue.csv"`
      }
    });
  } catch (error) {
    return apiError(error);
  }
}
