import { BookingManager } from "@/components/admin/booking-manager";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const bookings = await prisma.booking.findMany({
    include: {
      setup: true,
      customer: { select: { name: true, email: true, phone: true } }
    },
    orderBy: { startTime: "desc" },
    take: 100
  });

  return (
    <BookingManager
      initialBookings={bookings.map((booking) => ({
        id: booking.id,
        reference: booking.reference,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        startTime: booking.startTime.toISOString(),
        endTime: booking.endTime.toISOString(),
        priceTotal: Number(booking.priceTotal),
        paidAmount: Number(booking.paidAmount),
        setup: { name: booking.setup.name, type: booking.setup.type },
        customer: booking.customer
      }))}
    />
  );
}
