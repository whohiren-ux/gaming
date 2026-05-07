/* eslint-disable @next/next/no-img-element */

import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatINR } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const [bookings, memberships, notifications] = await Promise.all([
    prisma.booking.findMany({
      where: { customerId: session.user.id },
      include: { setup: true },
      orderBy: { startTime: "desc" },
      take: 20
    }),
    prisma.membership.findMany({
      where: { userId: session.user.id },
      include: { plan: true },
      orderBy: { endsAt: "desc" }
    }),
    prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20
    })
  ]);

  return (
    <main className="container py-12">
      <Badge variant="outline">Account</Badge>
      <h1 className="mt-4 text-4xl font-black tracking-normal text-white">Your bookings and memberships</h1>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="grid gap-4 p-5 sm:grid-cols-[1fr_96px] sm:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-white">{booking.reference}</h3>
                    <Badge variant={booking.status === "CONFIRMED" ? "success" : "warning"}>{booking.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {booking.setup.name} · {booking.startTime.toLocaleString()} · {formatINR(booking.priceTotal)}
                  </p>
                </div>
                <img
                  src={`/api/bookings/${booking.id}/qr`}
                  alt={`${booking.reference} QR code`}
                  width={96}
                  height={96}
                  className="rounded-md bg-white p-1"
                />
              </CardContent>
            </Card>
          ))}
          {bookings.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">No bookings yet.</CardContent></Card>
          ) : null}
        </div>
        <div className="grid gap-4 self-start">
          <Card>
            <CardHeader><CardTitle>Memberships</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {memberships.map((membership) => (
                <div key={membership.id} className="rounded-md border border-white/10 bg-white/[0.03] p-3">
                  <p className="font-semibold text-white">{membership.plan.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {Math.floor(membership.remainingMinutes / 60)}h left · expires {membership.endsAt.toLocaleDateString()}
                  </p>
                </div>
              ))}
              {memberships.length === 0 ? <p className="text-sm text-muted-foreground">No active membership.</p> : null}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Notifications</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {notifications.map((notification) => (
                <div key={notification.id} className="rounded-md border border-white/10 bg-white/[0.03] p-3">
                  <p className="font-semibold text-white">{notification.title}</p>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                </div>
              ))}
              {notifications.length === 0 ? <p className="text-sm text-muted-foreground">No notifications yet.</p> : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
