import { Prisma, type NotificationChannel, type NotificationType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { publishRealtime } from "@/lib/realtime";
import { REALTIME_CHANNELS, REALTIME_EVENTS } from "@/lib/realtime-events";

type CreateNotificationInput = {
  userId?: string | null;
  type: NotificationType;
  channel?: NotificationChannel;
  title: string;
  message: string;
  metadata?: Prisma.InputJsonValue;
};

export async function createNotification(input: CreateNotificationInput) {
  const notification = await prisma.notification.create({
    data: {
      userId: input.userId ?? null,
      type: input.type,
      channel: input.channel ?? "DASHBOARD",
      title: input.title,
      message: input.message,
      metadata: input.metadata ?? Prisma.JsonNull
    }
  });

  await publishRealtime(REALTIME_CHANNELS.notifications, REALTIME_EVENTS.notificationCreated, {
    notification
  });

  if (!input.userId) {
    await publishRealtime(REALTIME_CHANNELS.admin, REALTIME_EVENTS.notificationCreated, {
      notification
    });
  }

  return notification;
}

export async function getUserNotifications(userId: string) {
  return prisma.notification.findMany({
    where: {
      OR: [{ userId }, { userId: null }]
    },
    orderBy: { createdAt: "desc" },
    take: 50
  });
}

export async function markNotificationsRead(userId: string, ids?: string[]) {
  return prisma.notification.updateMany({
    where: {
      userId,
      readAt: null,
      ...(ids?.length ? { id: { in: ids } } : {})
    },
    data: {
      readAt: new Date()
    }
  });
}
