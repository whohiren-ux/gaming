"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { CheckCircle2, Clock, Crown, Mail, Tag, Calendar, Monitor } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { formatINR } from "@/lib/money";
import { formatDateTimeLocalInput } from "@/lib/dates";

const HOURLY_RATE = 100;

type Plan = {
  id: string;
  name: string;
  type: string;
  price: string | number;
  includedMinutes: number;
  playerCount: number;
  discountPercent: number;
  priorityBooking: boolean;
  description?: string | null;
};

function calcRegularPrice(includedMinutes: number, playerCount: number) {
  return Math.ceil((includedMinutes / 60) * HOURLY_RATE * playerCount);
}

function calcSavings(includedMinutes: number, playerCount: number, planPrice: number) {
  return Math.max(0, calcRegularPrice(includedMinutes, playerCount) - planPrice);
}

export function MembershipPlans({ plans }: { plans: Plan[] }) {
  const { data: session } = useSession();

  const [formOpen, setFormOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [preferredDate, setPreferredDate] = useState("");
  const [deviceType, setDeviceType] = useState("PS5");
  const [submitting, setSubmitting] = useState(false);

  const [successOpen, setSuccessOpen] = useState(false);
  const [bookedPlanName, setBookedPlanName] = useState("");

  function handleBuyClick(plan: Plan) {
    if (!session?.user) {
      toast.error("Please login before requesting a membership.");
      return;
    }
    setSelectedPlan(plan);
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    tomorrow.setSeconds(0, 0);
    setPreferredDate(formatDateTimeLocalInput(tomorrow));
    setDeviceType("PS5");
    setFormOpen(true);
  }

  async function handleSubmit() {
    if (!selectedPlan || !preferredDate) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/membership-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan.id,
          preferredDate: new Date(preferredDate).toISOString(),
          deviceType
        })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to submit request.");
      }

      setFormOpen(false);
      setBookedPlanName(selectedPlan.name);
      setSuccessOpen(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Request failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => {
          const planPrice = Number(plan.price);
          const regularPrice = calcRegularPrice(plan.includedMinutes, plan.playerCount);
          const savings = calcSavings(plan.includedMinutes, plan.playerCount, planPrice);

          return (
            <Card key={plan.id} className={plan.priorityBooking ? "border-neon-cyan/30 shadow-neon-sm" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.priorityBooking ? <Badge variant="success">VIP</Badge> : <Badge variant="muted">{plan.type}</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {plan.playerCount > 1 ? `${plan.playerCount} players × ` : ""}
                    {Math.floor(plan.includedMinutes / 60)} hours × {formatINR(HOURLY_RATE)}/hr
                  </p>
                  {regularPrice > planPrice && (
                    <p className="text-sm text-muted-foreground line-through">{formatINR(regularPrice)}</p>
                  )}
                  <p className="text-4xl font-black text-white">{formatINR(planPrice)}</p>
                  {savings > 0 && (
                    <div className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-neon-green">
                      <Tag className="h-3.5 w-3.5" />
                      Save up to {formatINR(savings)}
                    </div>
                  )}
                  <p className="mt-2 text-sm text-muted-foreground">
                    {plan.discountPercent}% off on all sessions
                  </p>
                </div>
                <p className="min-h-12 text-sm leading-6 text-muted-foreground">{plan.description}</p>
                <Button className="w-full" onClick={() => handleBuyClick(plan)}>
                  <Crown />
                  Buy plan
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-neon-blue/15">
              <Crown className="h-7 w-7 text-neon-blue" />
            </div>
            <DialogTitle className="text-center text-xl">
              Book Membership
            </DialogTitle>
            <DialogDescription className="text-center">
              Select your preferred date and device for the{" "}
              <span className="font-semibold text-foreground">{selectedPlan?.name}</span> plan.
            </DialogDescription>
          </DialogHeader>

          {selectedPlan && (() => {
            const planPrice = Number(selectedPlan.price);
            const regularPrice = calcRegularPrice(selectedPlan.includedMinutes, selectedPlan.playerCount);
            const savings = calcSavings(selectedPlan.includedMinutes, selectedPlan.playerCount, planPrice);

            return (
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Plan</span>
                  <span className="font-semibold text-foreground">{selectedPlan.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Players</span>
                  <span className="font-semibold text-foreground">{selectedPlan.playerCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <span className="font-semibold text-foreground">{Math.floor(selectedPlan.includedMinutes / 60)} hours</span>
                </div>
                {savings > 0 && (
                  <div className="flex items-center justify-between text-neon-green text-sm font-semibold">
                    <span>You save</span>
                    <span>{formatINR(savings)}</span>
                  </div>
                )}
                <div className="border-t border-white/10 pt-2 space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Regular price</span>
                    <span className="line-through">{formatINR(regularPrice)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Amount</span>
                    <span className="text-lg font-black text-neon-cyan">{formatINR(planPrice)}</span>
                  </div>
                </div>
              </div>
            );
          })()}

          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="preferredDate" className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Preferred date
              </Label>
              <Input
                id="preferredDate"
                type="datetime-local"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Monitor className="h-3.5 w-3.5" />
                Device
              </Label>
              <Select value={deviceType} onValueChange={setDeviceType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PS5">PlayStation 5</SelectItem>
                  <SelectItem value="GAMING_PC">Racing Wheel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button className="w-full sm:w-auto" onClick={handleSubmit} disabled={submitting || !preferredDate}>
              {submitting ? "Submitting..." : "Request booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-neon-blue/15">
              <CheckCircle2 className="h-7 w-7 text-neon-blue" />
            </div>
            <DialogTitle className="text-center text-xl">
              Thank You for Your Request!
            </DialogTitle>
            <DialogDescription className="text-center">
              Your <span className="font-semibold text-foreground">{bookedPlanName}</span> membership
              request has been submitted. Our team will review it shortly.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2.5 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-neon-blue" />
              <p>
                A confirmation email will be sent once your request is approved.
                It usually arrives within <span className="font-semibold text-foreground">10–20 minutes</span>.
                {" "}If you cannot find it in your <span className="font-semibold text-neon-cyan">Inbox</span>,
                please check your <span className="font-semibold text-neon-amber">Spam / Junk</span> folder.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-neon-cyan" />
              <p>
                Our team will <span className="font-semibold text-foreground">review and approve</span> your
                request. You will receive an email with your membership details once confirmed.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button className="w-full" onClick={() => setSuccessOpen(false)}>
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
