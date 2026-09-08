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

  const serializedPlans = plans.map((plan) => ({
    ...plan,
    price: plan.price.toNumber(),
    memberships: plan.memberships.map((m) => ({
      id: m.id,
      status: m.status,
      remainingMinutes: m.remainingMinutes,
      user: m.user
    }))
  }));

  return <MembershipManager plans={serializedPlans} users={users} />;
}
