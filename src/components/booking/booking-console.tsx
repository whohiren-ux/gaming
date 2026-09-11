"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { CheckCircle2, Clock, Gamepad2, Mail, AlertTriangle } from "lucide-react";

import { AvailabilityBoard } from "@/components/booking/availability-board";
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
import { getSetupDisplayName, SETUP_TYPE_LABELS } from "@/lib/constants";
import { formatDateTimeLocalInput } from "@/lib/dates";
import { useCafeStore } from "@/store/cafe-store";

type BookingResponse = {
  booking: {
    id: string;
    reference: string;
  };
};

export function BookingConsole() {
  const { data: session, status } = useSession();
  const { setups, fetchAvailability, subscribeAvailability } = useCafeStore();
  const [setupType, setSetupType] = useState<"PS5" | "STERING_WHEEL">("PS5");
  const [setupId, setSetupId] = useState<string>("AUTO");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [startTime, setStartTime] = useState(() => {
    const date = new Date(Date.now() + 10 * 60_000);
    date.setSeconds(0, 0);
    return formatDateTimeLocalInput(date);
  });
  const [submitting, setSubmitting] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [bookedReference, setBookedReference] = useState("");
  const [bookedSetupType, setBookedSetupType] = useState("");

  useEffect(() => {
    fetchAvailability();
    return subscribeAvailability();
  }, [fetchAvailability, subscribeAvailability]);

  const selectableSetups = useMemo(
    () => setups.filter((setup) => setup.type === setupType),
    [setupType, setups]
  );

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
          durationMinutes: Number(durationMinutes)
        })
      });
      const data = (await response.json()) as BookingResponse & { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Unable to create booking.");
      }

      setBookedReference(data.booking.reference);
      setBookedSetupType(SETUP_TYPE_LABELS[setupType]);
      setConfirmOpen(true);
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
            Pick console type, duration, and time slot. Server-side rules prevent overlaps.
          </p>
        </CardHeader>
        <CardContent>
          {status !== "loading" && !session?.user ? (
            <div className="mb-5 rounded-md border border-neon-amber/30 bg-neon-amber/10 p-4 text-sm text-neon-amber">
              Login is required to book a setup.
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
                  <SelectItem value="STERING_WHEEL">{SETUP_TYPE_LABELS.STERING_WHEEL}</SelectItem>
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

            <Button className="w-full" disabled={submitting || !session?.user} size="lg">
              <Gamepad2 />
              {submitting ? "Creating booking..." : `Book ${SETUP_TYPE_LABELS[setupType]}`}
            </Button>
          </form>
        </CardContent>
      </Card>

      <AvailabilityBoard compact />

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-neon-blue/15">
              <CheckCircle2 className="h-7 w-7 text-neon-blue" />
            </div>
            <DialogTitle className="text-center text-xl">
              Thank You for Booking!
            </DialogTitle>
            <DialogDescription className="text-center">
              Your <span className="font-semibold text-foreground">{bookedSetupType}</span> slot
              has been reserved. We look forward to seeing you!
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs text-muted-foreground">Booking Reference</p>
            <p className="mt-0.5 font-mono text-sm font-bold tracking-wider text-neon-cyan">
              {bookedReference}
            </p>
          </div>

          <div className="space-y-2.5 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-neon-blue" />
              <p>
                A confirmation email is on its way.
                It usually arrives within <span className="font-semibold text-foreground">10–20 minutes</span>.
                {" "}If you cannot find it in your <span className="font-semibold text-neon-cyan">Inbox</span>,
                please check your <span className="font-semibold text-neon-amber">Spam / Junk</span> folder.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-neon-cyan" />
              <p>
                Kindly arrive <span className="font-semibold text-foreground">at least 10 minutes before</span> your
                scheduled time. Show the confirmation email at the counter to check in.
              </p>
            </div>
            <div className="flex items-start gap-2 rounded-md border border-neon-amber/30 bg-neon-amber/10 p-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-neon-amber" />
              <p className="text-neon-amber">
                If you do not arrive within <span className="font-semibold">10 minutes</span> of
                your booked time, your slot may be reassigned to another guest THANK YOU.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              className="w-full"
              onClick={() => setConfirmOpen(false)}
            >
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
