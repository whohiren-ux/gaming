import { addDays, format, startOfDay, subDays } from "date-fns";

import { getSetupDisplayName } from "@/lib/constants";
import { dateRangeDays, minutesBetween } from "@/lib/dates";
import { toNumber } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import type { DashboardSummary } from "@/types";

function dayBounds(date: Date) {
  const start = startOfDay(date);
  const end = addDays(start, 1);
  return { start, end };
}

async function sumPaidPayments(start: Date, end: Date) {
  const result = await prisma.payment.aggregate({
    where: {
      status: "PAID",
      createdAt: { gte: start, lt: end }
    },
    _sum: { amount: true }
  });

  return toNumber(result._sum.amount);
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const now = new Date();
  const today = dayBounds(now);
  const weekStart = subDays(today.start, 6);
  const monthStart = subDays(today.start, 29);

  const [
    totalSetups,
    activeSetups,
    dailyEarnings,
    weeklyEarnings,
    monthlyEarnings,
    activeSessions,
    allRecentSessions
  ] = await Promise.all([
    prisma.setup.count(),
    prisma.setup.count({ where: { status: { in: ["ACTIVE", "EXPIRED"] } } }),
    sumPaidPayments(today.start, today.end),
    sumPaidPayments(weekStart, today.end),
    sumPaidPayments(monthStart, today.end),
    prisma.setupSession.findMany({
      where: { status: { in: ["ACTIVE", "PAUSED", "EXPIRED"] } },
      include: {
        setup: true,
        customer: { select: { name: true, phone: true } }
      },
      orderBy: { endsAt: "asc" }
    }),
    prisma.setupSession.findMany({
      where: {
        startedAt: { gte: monthStart, lt: today.end },
        status: { in: ["ACTIVE", "PAUSED", "COMPLETED", "EXPIRED"] }
      },
      include: { setup: true }
    })
  ]);

  const freeSetups = Math.max(0, totalSetups - activeSetups);
  const occupancyPercent = totalSetups > 0 ? Math.round((activeSetups / totalSetups) * 100) : 0;

  const hourBuckets = new Map<number, number>();
  for (const session of allRecentSessions) {
    const hour = session.startedAt.getHours();
    hourBuckets.set(hour, (hourBuckets.get(hour) ?? 0) + minutesBetween(session.startedAt, session.endedAt ?? now));
  }
  const peakUsageHour =
    [...hourBuckets.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const revenueTrend = await Promise.all(
    dateRangeDays(14).map(async (date) => {
      const bounds = dayBounds(date);
      const [revenue, bookings] = await Promise.all([
        sumPaidPayments(bounds.start, bounds.end),
        prisma.booking.count({
          where: { createdAt: { gte: bounds.start, lt: bounds.end } }
        })
      ]);

      return {
        date: format(date, "dd MMM"),
        revenue,
        bookings
      };
    })
  );

  const occupancyTrend = dateRangeDays(14).map((date) => {
    const daySessions = allRecentSessions.filter(
      (session) => session.startedAt >= date && session.startedAt < addDays(date, 1)
    );
    const activeMinutes = daySessions.reduce(
      (sum, session) => sum + minutesBetween(session.startedAt, session.endedAt ?? now),
      0
    );
    const possibleMinutes = Math.max(totalSetups, 1) * 24 * 60;

    return {
      date: format(date, "dd MMM"),
      occupancy: Math.round((activeMinutes / possibleMinutes) * 100)
    };
  });

  const setupUsageMap = new Map<string, { name: string; minutes: number; revenue: number }>();
  for (const session of allRecentSessions) {
    const current = setupUsageMap.get(session.setupId) ?? {
      name: getSetupDisplayName(session.setup),
      minutes: 0,
      revenue: 0
    };
    current.minutes += minutesBetween(session.startedAt, session.endedAt ?? now);
    current.revenue += toNumber(session.billedAmount);
    setupUsageMap.set(session.setupId, current);
  }

  return {
    totalSetups,
    activeSetups,
    freeSetups,
    occupancyPercent,
    dailyEarnings,
    weeklyEarnings,
    monthlyEarnings,
    peakUsageHour,
    activeSessions: activeSessions.map((session) => ({
      id: session.id,
      setupName: getSetupDisplayName(session.setup),
      setupType: session.setup.type,
      customerName: session.customer?.name || session.customer?.phone || null,
      status: session.status,
      endsAt: session.endsAt.toISOString(),
      remainingMinutes: Math.max(0, Math.ceil((session.endsAt.getTime() - now.getTime()) / 60_000)),
      currentAmount: toNumber(session.billedAmount)
    })),
    revenueTrend,
    occupancyTrend,
    setupUsage: [...setupUsageMap.values()].sort((a, b) => b.minutes - a.minutes).slice(0, 8)
  };
}

export async function getAnalyticsDeepDive() {
  const summary = await getDashboardSummary();
  const [bookings, completedBookings] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "COMPLETED" } })
  ]);

  return {
    ...summary,
    bookingConversionRate: bookings > 0 ? Math.round((completedBookings / bookings) * 100) : 0,
    bookingsToday: summary.revenueTrend.at(-1)?.bookings ?? 0
  };
}

export async function buildRevenueCsv() {
  const payments = await prisma.payment.findMany({
    where: { status: "PAID" },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      booking: { select: { reference: true } },
      setupSession: {
        include: { setup: { select: { name: true, type: true } } }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 500
  });

  const header = [
    "Invoice",
    "Date",
    "Customer",
    "Method",
    "Type",
    "Amount",
    "Booking",
    "Setup"
  ];
  const rows = payments.map((payment) => [
    payment.invoiceNumber,
    payment.createdAt.toISOString(),
    payment.user?.name || payment.user?.email || payment.user?.phone || "",
    payment.method,
    payment.type,
    toNumber(payment.amount).toString(),
    payment.booking?.reference || "",
    payment.setupSession?.setup ? getSetupDisplayName(payment.setupSession.setup) : ""
  ]);

  return [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
}
