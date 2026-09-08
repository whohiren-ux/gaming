import { prisma } from "@/lib/prisma";
import { MembershipManager } from "@/components/admin/membership-manager";

export const dynamic = "force-dynamic";

export default async function AdminMembershipsPage() {
  const [plans, users] = await Promise.all([
    prisma.membershipPlan.findMany({
      include: {
        memberships: {
          include: { user: { select: { name: true, email: true } } }
        }
      },
      orderBy: { price: "asc" }
    }),
    prisma.user.findMany({
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" }
    })
  ]);

  return <MembershipManager plans={plans} users={users} />;
}
