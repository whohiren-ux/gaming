import { AvailabilityBoard } from "@/components/booking/availability-board";
import { Badge } from "@/components/ui/badge";

export default function AvailabilityPage() {
  return (
    <main className="container py-12">
      <Badge variant="outline">Live Availability</Badge>
      <h1 className="mt-4 text-4xl font-black tracking-normal text-white">Setup status board</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Occupied stations show live remaining time, booked windows, and upcoming queues.
      </p>
      <div className="mt-8">
        <AvailabilityBoard />
      </div>
    </main>
  );
}
