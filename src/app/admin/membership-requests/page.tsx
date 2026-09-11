import { prisma } from "@/lib/prisma";
import { MembershipRequestsManager } from "@/components/admin/membership-requests-manager";

export const dynamic = "force-dynamic";

export default async function AdminMembershipRequestsPage() {
  const requests = await prisma.membershipRequest.findMany({
    include: {
      plan: true,
      user: { select: { id: true, name: true, email: true, phone: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  const serialized = requests.map((r) => ({
    ...r,
    preferredDate: r.preferredDate.toISOString(),
    createdAt: r.createdAt.toISOString(),
    plan: { ...r.plan, price: Number(r.plan.price) }
  }));

  return <MembershipRequestsManager requests={serialized} />;
}
