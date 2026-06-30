"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { CalendarClock, CreditCard, Gamepad2 } from "lucide-react";

import { AvailabilityBoard } from "@/components/booking/availability-board";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { CAFE_NAME, getSetupDisplayName, SETUP_TYPE_LABELS } from "@/lib/constants";
import { formatDateTimeLocalInput } from "@/lib/dates";
import { useCafeStore } from "@/store/cafe-store";

type BookingResponse = {
  booking: {
    id: string;
    reference: string;
    tokenAmount: string | number;
    priceTotal: string | number;
    setup: { name: string; type?: string };
  };
};

export function BookingConsole() {
  const { data: session, status } = useSession();
  const { setups, fetchAvailability, subscribeAvailability } = useCafeStore();
  const [setupType, setSetupType] = useState<"PS5" | "PS4" | "GAMING_PC">("PS5");
  const [setupId, setSetupId] = useState<string>("AUTO");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [startTime, setStartTime] = useState(() => {
    const date = new Date(Date.now() + 10 * 60_000);
    date.setSeconds(0, 0);
    return formatDateTimeLocalInput(date);
  });
  const [paymentIntent, setPaymentIntent] = useState<"TOKEN" | "FULL">("TOKEN");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAvailability();
    return subscribeAvailability();
  }, [fetchAvailability, subscribeAvailability]);

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

  const selectableSetups = useMemo(
    () => setups.filter((setup) => setup.type === setupType),
    [setupType, setups]
  );

  async function createRazorpayPayment(booking: BookingResponse["booking"]) {
    const amount =
      paymentIntent === "FULL" ? Number(booking.priceTotal) : Number(booking.tokenAmount);

    const response = await fetch("/api/payments/razorpay/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingId: booking.id,
        amount,
        paymentType: paymentIntent
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Unable to create payment order.");
    }

    if (!data.keyId || !window.Razorpay) {
      toast.success("Booking held. Razorpay is not configured in this environment.");
      return;
    }

    const checkout = new window.Razorpay({
      key: data.keyId,
      amount: data.order.amount,
      currency: data.order.currency,
      name: CAFE_NAME,
      description: `${booking.reference} · ${getSetupDisplayName(booking.setup)}`,
      order_id: data.order.id,
      handler: async (paymentResponse) => {
        const verify = await fetch("/api/payments/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentResponse)
        });

        if (verify.ok) {
          toast.success("Payment successful. Booking confirmed.");
          fetchAvailability();
        } else {
          toast.warning("Payment received. Confirmation will update after webhook sync.");
        }
      },
      theme: {
        color: "#C20A16"
      }
    });

    checkout.open();
  }

  async function submitBooking(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session?.user) {
      toast.error("Please login before booking.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          setupType,
          setupId: setupId === "AUTO" ? undefined : setupId,
          startTime: new Date(startTime).toISOString(),
          durationMinutes: Number(durationMinutes),
          paymentIntent
        })
      });
      const data = (await response.json()) as BookingResponse & { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Unable to create booking.");
      }

      toast.success(`Slot held: ${data.booking.reference}`);
      await createRazorpayPayment(data.booking);
      fetchAvailability();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Booking failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <Card className="xl:sticky xl:top-6 xl:self-start">
        <CardHeader>
          <Badge variant="outline" className="w-fit">Online Booking</Badge>
          <CardTitle className="text-2xl">Reserve your setup</CardTitle>
          <p className="text-sm text-muted-foreground">
            Pick console type, duration, and token/full payment. Server-side rules prevent overlaps.
          </p>
        </CardHeader>
        <CardContent>
          {status !== "loading" && !session?.user ? (
            <div className="mb-5 rounded-md border border-neon-amber/30 bg-neon-amber/10 p-4 text-sm text-neon-amber">
              Login is required for QR confirmation and payment tracking.
              <Button asChild className="mt-3 w-full" variant="warning">
                <Link href="/login">Login to book</Link>
              </Button>
            </div>
          ) : null}

          <form className="space-y-4" onSubmit={submitBooking}>
            <div className="space-y-2">
              <Label>Setup type</Label>
              <Select
                value={setupType}
                onValueChange={(value) => {
                  setSetupType(value as typeof setupType);
                  setSetupId("AUTO");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PS5">PS5</SelectItem>
                  <SelectItem value="PS4">PS4</SelectItem>
                  <SelectItem value="GAMING_PC">{SETUP_TYPE_LABELS.GAMING_PC}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Setup</Label>
              <Select value={setupId} onValueChange={setSetupId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AUTO">Auto assign best available</SelectItem>
                  {selectableSetups.map((setup) => (
                    <SelectItem key={setup.id} value={setup.id}>
                      {getSetupDisplayName(setup)} · {setup.availabilityLabel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Start time</Label>
                <Input
                  type="datetime-local"
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
                <Select value={durationMinutes} onValueChange={setDurationMinutes}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="180">3 hours</SelectItem>
                    <SelectItem value="240">4 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setPaymentIntent("TOKEN")}
                className={`rounded-md border p-4 text-left transition ${
                  paymentIntent === "TOKEN"
                    ? "border-neon-cyan bg-neon-blue/10"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <CalendarClock className="size-5 text-neon-cyan" />
                <p className="mt-3 font-semibold">Token</p>
                <p className="text-xs text-muted-foreground">Pay minimum hold amount</p>
              </button>
              <button
                type="button"
                onClick={() => setPaymentIntent("FULL")}
                className={`rounded-md border p-4 text-left transition ${
                  paymentIntent === "FULL"
                    ? "border-neon-cyan bg-neon-blue/10"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <CreditCard className="size-5 text-neon-green" />
                <p className="mt-3 font-semibold">Full</p>
                <p className="text-xs text-muted-foreground">Settle the slot upfront</p>
              </button>
            </div>

            <Button className="w-full" disabled={submitting || !session?.user} size="lg">
              <Gamepad2 />
              {submitting ? "Creating booking..." : `Book ${SETUP_TYPE_LABELS[setupType]}`}
            </Button>
          </form>
        </CardContent>
      </Card>

      <AvailabilityBoard compact />
    </div>
  );
}
