"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";
import { toast } from "sonner";

import { Toaster } from "@/components/ui/sonner";
import { getPusherClient } from "@/lib/pusher-client";
import { getNotificationChannel, REALTIME_CHANNELS, REALTIME_EVENTS } from "@/lib/realtime-events";

type NotificationPayload = {
  notification: {
    id: string;
    userId?: string | null;
    title: string;
    message: string;
  };
};

function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw").catch(() => undefined);
    }
  }, []);

  return null;
}

function NotificationSubscriber() {
  const { data: session } = useSession();

  useEffect(() => {
    const userId = session?.user?.id;
    const client = getPusherClient();

    if (!userId || !client) {
      return;
    }

    const showNotification = ({ notification }: NotificationPayload) => {
      if (notification.userId && notification.userId !== userId) {
        return;
      }

      toast(notification.title, {
        description: notification.message
      });
    };

    const channels = [
      client.subscribe(getNotificationChannel(userId)),
      client.subscribe(REALTIME_CHANNELS.notifications)
    ];

    channels.forEach((channel) => {
      channel.bind(REALTIME_EVENTS.notificationCreated, showNotification);
    });

    return () => {
      channels.forEach((channel) => {
        channel.unbind(REALTIME_EVENTS.notificationCreated, showNotification);
        client.unsubscribe(channel.name);
      });
    };
  }, [session?.user?.id]);

  return null;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <PwaRegister />
      <NotificationSubscriber />
      <Toaster />
    </SessionProvider>
  );
}
