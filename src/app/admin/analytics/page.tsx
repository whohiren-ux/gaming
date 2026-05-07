import { AnalyticsCharts } from "@/components/admin/analytics-charts";
import { MetricCard } from "@/components/admin/metric-card";
import { getAnalyticsDeepDive } from "@/lib/analytics-service";
import { formatINR } from "@/lib/money";
import { Activity, Banknote, CalendarCheck, Percent } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const analytics = await getAnalyticsDeepDive();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Daily revenue" value={formatINR(analytics.dailyEarnings)} icon={Banknote} tone="green" />
        <MetricCard title="Monthly revenue" value={formatINR(analytics.monthlyEarnings)} icon={Banknote} />
        <MetricCard title="Conversion" value={`${analytics.bookingConversionRate}%`} icon={Percent} tone="amber" />
        <MetricCard title="Bookings today" value={analytics.bookingsToday} icon={CalendarCheck} />
      </div>
      <AnalyticsCharts summary={analytics} />
      <MetricCard
        title="Current occupancy"
        value={`${analytics.occupancyPercent}%`}
        icon={Activity}
        caption="Based on active or expired setups right now"
      />
    </div>
  );
}
