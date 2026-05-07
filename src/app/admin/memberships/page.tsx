import { createMembershipPlanAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatINR } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminMembershipsPage() {
  const plans = await prisma.membershipPlan.findMany({
    include: { memberships: true },
    orderBy: { price: "asc" }
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <Card className="xl:sticky xl:top-24 xl:self-start">
        <CardHeader><CardTitle>New membership plan</CardTitle></CardHeader>
        <CardContent>
          <form action={createMembershipPlanAction} className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input name="name" required /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Type</Label><Input name="type" defaultValue="MONTHLY" /></div>
              <div className="space-y-2"><Label>Price</Label><Input name="price" type="number" required /></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Minutes</Label><Input name="includedMinutes" type="number" required /></div>
              <div className="space-y-2"><Label>Discount %</Label><Input name="discountPercent" type="number" required /></div>
            </div>
            <label className="flex items-center gap-2 text-sm"><input name="priorityBooking" type="checkbox" /> Priority booking</label>
            <div className="space-y-2"><Label>Description</Label><Textarea name="description" /></div>
            <Button className="w-full">Create plan</Button>
          </form>
        </CardContent>
      </Card>
      <div className="grid gap-4">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardContent className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-bold text-white">{plan.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {Math.floor(plan.includedMinutes / 60)} hours · {plan.discountPercent}% discount · {plan.memberships.length} members
                </p>
              </div>
              <p className="text-xl font-black text-white">{formatINR(plan.price)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
