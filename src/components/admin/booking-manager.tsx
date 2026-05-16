"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSetupDisplayName } from "@/lib/constants";
import { formatINR } from "@/lib/money";

type BookingRow = {
  id: string;
  reference: string;
  status: string;
  paymentStatus: string;
  startTime: string;
  endTime: string;
  priceTotal: number;
  paidAmount: number;
  setup: { name: string; type: string };
  customer: { name?: string | null; email?: string | null; phone?: string | null };
};

export function BookingManager({ initialBookings }: { initialBookings: BookingRow[] }) {
  const [bookings, setBookings] = useState(initialBookings);

  async function update(id: string, status: string) {
    const response = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    const data = await response.json();
    if (!response.ok) {
      toast.error(data.error || "Unable to update booking.");
      return;
    }
    setBookings((current) => current.map((booking) => (booking.id === id ? { ...booking, status } : booking)));
    toast.success("Booking updated.");
  }

  return (
    <div className="grid gap-4">
      {bookings.map((booking) => (
        <Card key={booking.id}>
          <CardContent className="grid gap-4 p-5 xl:grid-cols-[1fr_220px_180px_auto] xl:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-white">{booking.reference}</h3>
                <Badge variant={booking.status === "CONFIRMED" ? "success" : booking.status === "PENDING" ? "warning" : "muted"}>
                  {booking.status}
                </Badge>
                <Badge variant="outline">{booking.paymentStatus}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {getSetupDisplayName(booking.setup)} · {booking.customer.name || booking.customer.email || booking.customer.phone}
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>{new Date(booking.startTime).toLocaleString()}</p>
              <p>to {new Date(booking.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
            </div>
            <div className="text-sm">
              <p className="font-bold text-white">{formatINR(booking.priceTotal)}</p>
              <p className="text-muted-foreground">Paid {formatINR(booking.paidAmount)}</p>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="outline" onClick={() => update(booking.id, "CONFIRMED")} aria-label="Confirm booking">
                <CheckCircle2 />
              </Button>
              <Button size="icon" variant="destructive" onClick={() => update(booking.id, "CANCELLED")} aria-label="Cancel booking">
                <XCircle />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      {bookings.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">No bookings yet.</CardContent>
        </Card>
      ) : null}
    </div>
  );
}
