"use client";

import { useEffect } from "react";
import { Activity, Clock3, Gamepad2, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useCafeStore } from "@/store/cafe-store";

export function LiveSetupCounter() {
  const { setups, fetchAvailability, subscribeAvailability } = useCafeStore();

  useEffect(() => {
    fetchAvailability();
    return subscribeAvailability();
  }, [fetchAvailability, subscribeAvailability]);

  const available = setups.filter((setup) => setup.displayStatus === "AVAILABLE").length;
  const active = setups.filter((setup) =>
    ["ACTIVE", "ENDING_SOON", "EXPIRED"].includes(setup.displayStatus)
  ).length;
  const occupancy = setups.length > 0 ? Math.round((active / setups.length) * 100) : 0;

  return (
    <Card className="rounded-lg bg-ink-950/64">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>Live Lounge Pulse</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              Availability syncs across booking and admin screens.
            </p>
          </div>
          <Badge variant="success" className="gap-1">
            <Sparkles className="size-3" />
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-md border border-neon-green/20 bg-neon-green/10 p-4">
            <p className="text-xs text-muted-foreground">Free</p>
            <p className="mt-2 text-3xl font-black text-neon-green">{available}</p>
          </div>
          <div className="rounded-md border border-neon-blue/20 bg-neon-blue/10 p-4">
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="mt-2 text-3xl font-black text-neon-cyan">{active}</p>
          </div>
          <div className="rounded-md border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="mt-2 text-3xl font-black text-white">{setups.length}</p>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Activity className="size-4 text-neon-cyan" />
              Occupancy
            </span>
            <span className="font-semibold text-white">{occupancy}%</span>
          </div>
          <Progress value={occupancy} />
        </div>

        <div className="grid gap-3">
          {setups.slice(0, 4).map((setup) => (
            <div
              key={setup.id}
              className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/[0.03] p-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-md bg-neon-blue/10 text-neon-cyan">
                  <Gamepad2 className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{setup.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{setup.availabilityLabel}</p>
                </div>
              </div>
              <Clock3 className="size-4 shrink-0 text-muted-foreground" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
