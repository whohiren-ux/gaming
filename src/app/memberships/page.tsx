import { MembershipPlans } from "@/components/membership/membership-plans";
import { Badge } from "@/components/ui/badge";
import { getMembershipPlans } from "@/lib/membership-service";

export const dynamic = "force-dynamic";

export default async function MembershipPage() {
  const plans = await getMembershipPlans();

  return (
    <main className="container py-12">
      <Badge variant="outline">Memberships</Badge>
      <h1 className="mt-4 text-4xl font-black tracking-normal text-white">Monthly, hour, and VIP packages</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Discounts and priority booking are applied by backend booking logic.
      </p>
      <div className="mt-8">
        <MembershipPlans plans={plans.map((plan) => ({ ...plan, price: Number(plan.price) }))} />
      </div>
    </main>
  );
}
