import type { Session } from "next-auth";

import type { Role } from "@prisma/client";

export function hasRole(session: Session | null, roles: Role[]) {
  return Boolean(session?.user?.role && roles.includes(session.user.role));
}

export function assertAuthenticated(session: Session | null) {
  if (!session?.user?.id) {
    throw new Response("Unauthorized", { status: 401 });
  }

  return session.user;
}

export function assertRole(session: Session | null, roles: Role[]) {
  const user = assertAuthenticated(session);

  if (!roles.includes(user.role)) {
    throw new Response("Forbidden", { status: 403 });
  }

  return user;
}

export function isAdminRole(role?: Role | null) {
  return role === "ADMIN" || role === "STAFF";
}
