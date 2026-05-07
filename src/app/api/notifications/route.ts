import { NextRequest } from "next/server";

import { auth } from "@/auth";
import { apiError, ok } from "@/lib/api";
import { assertAuthenticated } from "@/lib/access-control";
import { getUserNotifications, markNotificationsRead } from "@/lib/notification-service";

export async function GET() {
  try {
    const session = await auth();
    const user = assertAuthenticated(session);
    const notifications = await getUserNotifications(user.id);
    return ok({ notifications });
  } catch (error) {
    return apiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    const user = assertAuthenticated(session);
    const body = (await request.json().catch(() => ({}))) as { ids?: string[] };
    const result = await markNotificationsRead(user.id, body.ids);
    return ok({ updated: result.count });
  } catch (error) {
    return apiError(error);
  }
}
