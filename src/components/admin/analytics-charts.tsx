"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardSummary } from "@/types";

export function AnalyticsCharts({ summary }: { summary: DashboardSummary }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Revenue trend</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={summary.revenueTrend}>
              <defs>
                <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF2D3F" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#FF2D3F" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,.08)" vertical={false} />
              <XAxis dataKey="date" stroke="#8ba3b8" fontSize={12} />
              <YAxis stroke="#8ba3b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "#120407",
                  border: "1px solid rgba(255,45,63,.28)",
                  borderRadius: 8
                }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#FF2D3F" fill="url(#revenue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Most used setups</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summary.setupUsage}>
              <CartesianGrid stroke="rgba(255,255,255,.08)" vertical={false} />
              <XAxis dataKey="name" stroke="#8ba3b8" fontSize={11} interval={0} tickLine={false} />
              <YAxis stroke="#8ba3b8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "#120407",
                  border: "1px solid rgba(255,45,63,.28)",
                  borderRadius: 8
                }}
              />
              <Bar dataKey="minutes" fill="#2BFF88" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
