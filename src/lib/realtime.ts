import Pusher from "pusher";

import { getOptionalEnv } from "@/lib/env";

let pusher: Pusher | null = null;

export function getPusherServer() {
  const appId = getOptionalEnv("PUSHER_APP_ID");
  const key = getOptionalEnv("NEXT_PUBLIC_PUSHER_KEY");
  const secret = getOptionalEnv("PUSHER_SECRET");
  const cluster = getOptionalEnv("NEXT_PUBLIC_PUSHER_CLUSTER") || "ap2";

  if (!appId || !key || !secret) {
    return null;
  }

  if (!pusher) {
    pusher = new Pusher({
      appId,
      key,
      secret,
      cluster,
      useTLS: true
    });
  }

  return pusher;
}

export async function publishRealtime<TPayload>(
  channel: string,
  event: string,
  payload: TPayload
) {
  const server = getPusherServer();

  if (!server) {
    if (process.env.NODE_ENV === "development") {
      console.info(`[realtime:local] ${channel}:${event}`, payload);
    }
    return;
  }

  await server.trigger(channel, event, payload);
}

export function authorizePusherChannel(socketId: string, channelName: string) {
  const server = getPusherServer();

  if (!server) {
    throw new Error("Realtime server is not configured.");
  }

  return server.authorizeChannel(socketId, channelName);
}
