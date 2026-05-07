"use client";

import { useEffect } from "react";
import { Activity, Banknote, CalendarDays, Gamepad2, MonitorCheck, Percent } from "lucide-react";

import { AnalyticsCharts } from "@/components/admin/analytics-charts";
import { MetricCard } from "@/components/admin/metric-card";
import { SetupControlCard } from "@/components/admin/setup-control-card";
import { formatINR } from "@/lib/money";
import { useCafeStore } from "@/store/cafe-store";
import type { DashboardSummary } from "@/types";

export function AdminDashboard({ initialSummary }: { initialSummary: DashboardSummary }) {
  const { dashboard, setups, fetchAvailability, subscribeAdmin } = useCafeStore();
  const summary = dashboard ?? initialSummary;

  useEffect(() => {
    useCafeStore.setState({ dashboard: initialSummary });
    fetchAvailability();
    return subscribeAdmin();
  }, [fetchAvailability, initialSummary, subscribeAdmin]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total setups" value={summary.totalSetups} icon={Gamepad2} />
        <MetricCard title="Active setups" value={summary.activeSetups} icon={MonitorCheck} tone="blue" />
        <MetricCard title="Free setups" value={summary.freeSetups} icon={Activity} tone="green" />
        <MetricCard title="Occupancy" value={`${summary.occupancyPercent}%`} icon={Percent} tone="amber" />
        <MetricCard title="Daily earnings" value={formatINR(summary.dailyEarnings)} icon={Banknote} tone="green" />
        <MetricCard title="Weekly earnings" value={formatINR(summary.weeklyEarnings)} icon={CalendarDays} />
        <MetricCard title="Monthly earnings" value={formatINR(summary.monthlyEarnings)} icon={Banknote} />
        <MetricCard
          title="Peak hour"
          value={summary.peakUsageHour === null ? "N/A" : `${summary.peakUsageHour}:00`}
          icon={Activity}
          tone="amber"
        />
      </div>

      <AnalyticsCharts summary={summary} />

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Live setup control</h2>
            <p className="text-sm text-muted-foreground">Timers, current amount, queues, and quick extensions.</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {setups.map((setup) => (
            <SetupControlCard key={setup.id} setup={setup} />
          ))}
        </div>
      </section>
    </div>
  );
}
