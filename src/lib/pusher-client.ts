"use client";

import Pusher from "pusher-js";

let client: Pusher | null = null;

export function getPusherClient() {
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap2";

  if (!key) {
    return null;
  }

  if (!client) {
    client = new Pusher(key, {
      cluster,
      channelAuthorization: {
        endpoint: "/api/realtime/auth",
        transport: "ajax"
      }
    });
  }

  return client;
}
