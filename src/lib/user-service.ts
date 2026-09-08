import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

export async function listUsers(input: {
  take?: number;
  cursor?: string;
  role?: Role;
} = {}) {
  const take = Math.min(input.take ?? 50, 100);
  return prisma.user.findMany({
    where: {
      ...(input.role ? { role: input.role } : {}),
      ...(input.cursor ? { createdAt: { lt: new Date(input.cursor) } } : {})
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      loyaltyPoints: true,
      createdAt: true,
      _count: {
        select: {
          bookings: true,
          setupSessions: true,
          payments: true
        }
      }
    },
    orderBy: { createdAt: "desc" },
    take: take + 1
  }).then((users) => ({
    items: users.slice(0, take),
    nextCursor: users.length > take ? users[take].createdAt.toISOString() : null
  }));
}

export async function updateUserRole(userId: string, role: Role) {
  return prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, name: true, email: true, role: true }
  });
}
