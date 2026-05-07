import { BookingConsole } from "@/components/booking/booking-console";
import { Badge } from "@/components/ui/badge";

export default function BookingPage() {
  return (
    <main className="container py-12">
      <Badge variant="outline">Book Online</Badge>
      <h1 className="mt-4 text-4xl font-black tracking-normal text-white">Reserve a gaming setup</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        The booking engine checks active sessions, confirmed reservations, and cafe buffer rules before holding a slot.
      </p>
      <div className="mt-8">
        <BookingConsole />
      </div>
    </main>
  );
}
