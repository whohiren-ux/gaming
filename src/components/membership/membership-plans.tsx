"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Crown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatINR } from "@/lib/money";

type Plan = {
  id: string;
  name: string;
  type: string;
  price: string | number;
  includedMinutes: number;
  discountPercent: number;
  priorityBooking: boolean;
  description?: string | null;
};

export function MembershipPlans({ plans }: { plans: Plan[] }) {
  const { data: session } = useSession();

  useEffect(() => {
    if (window.Razorpay || document.getElementById("razorpay-checkout")) {
      return;
    }

    const script = document.createElement("script");
    script.id = "razorpay-checkout";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  async function buy(plan: Plan) {
    if (!session?.user) {
      toast.error("Please login before buying a membership.");
      return;
    }

    const response = await fetch("/api/payments/razorpay/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        membershipPlanId: plan.id,
        amount: Number(plan.price),
        paymentType: "MEMBERSHIP"
      })
    });
    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error || "Unable to start membership payment.");
      return;
    }

    if (!data.keyId || !window.Razorpay) {
      toast.success("Membership order created. Configure Razorpay to accept live payments.");
      return;
    }

    new window.Razorpay({
      key: data.keyId,
      amount: data.order.amount,
      currency: data.order.currency,
      name: "Neon Nexus Gaming Cafe",
      description: plan.name,
      order_id: data.order.id,
      handler: async (paymentResponse) => {
        const verify = await fetch("/api/payments/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentResponse)
        });

        if (verify.ok) {
          toast.success("Membership activated.");
        } else {
          toast.warning("Payment received. Membership will sync after webhook confirmation.");
        }
      },
      theme: { color: "#00A3FF" }
    }).open();
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {plans.map((plan) => (
        <Card key={plan.id} className={plan.priorityBooking ? "border-neon-cyan/30 shadow-neon-sm" : ""}>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>{plan.name}</CardTitle>
              {plan.priorityBooking ? <Badge variant="success">VIP</Badge> : <Badge variant="muted">{plan.type}</Badge>}
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <p className="text-4xl font-black text-white">{formatINR(plan.price)}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {Math.floor(plan.includedMinutes / 60)} hours · {plan.discountPercent}% discount
              </p>
            </div>
            <p className="min-h-12 text-sm leading-6 text-muted-foreground">{plan.description}</p>
            <Button className="w-full" onClick={() => buy(plan)}>
              <Crown />
              Buy plan
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
