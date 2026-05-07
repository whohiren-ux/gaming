import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { apiError } from "@/lib/api";
import { isAdminRole } from "@/lib/access-control";
import { authorizePusherChannel } from "@/lib/realtime";
import { REALTIME_CHANNELS } from "@/lib/realtime-events";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const formData = await request.formData();
    const socketId = String(formData.get("socket_id") || "");
    const channelName = String(formData.get("channel_name") || "");

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (channelName === REALTIME_CHANNELS.admin && !isAdminRole(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (
      channelName !== REALTIME_CHANNELS.admin &&
      channelName !== REALTIME_CHANNELS.notifications
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(authorizePusherChannel(socketId, channelName));
  } catch (error) {
    return apiError(error);
  }
}
