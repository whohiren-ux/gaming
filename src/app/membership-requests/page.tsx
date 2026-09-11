import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MembershipRequestsList } from "@/components/membership/membership-requests-list";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function MembershipRequestsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const requests = await prisma.membershipRequest.findMany({
    where: { userId: session.user.id },
    include: { plan: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <main className="container py-12">
      <Badge variant="outline">My Requests</Badge>
      <h1 className="mt-4 text-3xl font-black text-white">Membership Requests</h1>
      <p className="mt-2 text-muted-foreground">Track the status of your membership requests.</p>
      <div className="mt-8">
        <MembershipRequestsList requests={requests.map((r) => ({
          ...r,
          preferredDate: r.preferredDate.toISOString(),
          createdAt: r.createdAt.toISOString(),
          plan: { ...r.plan, price: Number(r.plan.price) }
        }))} />
      </div>
    </main>
  );
}
