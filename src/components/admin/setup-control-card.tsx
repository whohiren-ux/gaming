"use client";

import { toast } from "sonner";
import { Clock3, Square, TimerReset } from "lucide-react";

import { CountdownText } from "@/components/common/countdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCafeStore } from "@/store/cafe-store";
import type { AvailabilitySetup } from "@/types";

export function SetupControlCard({ setup }: { setup: AvailabilitySetup }) {
  const { fetchAvailability, fetchDashboard } = useCafeStore();

  async function sessionAction(action: string, payload: Record<string, unknown> = {}) {
    if (!setup.activeSessionId) {
      return;
    }

    const response = await fetch(`/api/sessions/${setup.activeSessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...payload })
    });
    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error || "Session action failed.");
      return;
    }

    toast.success("Session updated.");
    fetchAvailability();
    fetchDashboard();
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="truncate">{setup.name}</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">{setup.type.replace("_", " ")}</p>
          </div>
          <Badge
            variant={
              setup.displayStatus === "AVAILABLE"
                ? "success"
                : setup.displayStatus === "ENDING_SOON"
                  ? "warning"
                  : setup.displayStatus === "EXPIRED"
                    ? "destructive"
                    : "outline"
            }
          >
            {setup.displayStatus.replace("_", " ")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase text-muted-foreground">Timer</p>
          <p className="mt-2 text-3xl font-black text-white">
            {setup.activeSessionId ? <CountdownText endsAt={setup.availableAt} /> : "Free"}
          </p>
          <p className="mt-2 truncate text-sm text-muted-foreground">{setup.availabilityLabel}</p>
        </div>

        {setup.activeSessionId ? (
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" size="sm" onClick={() => sessionAction("EXTEND", { minutes: 15 })}>
              <TimerReset />
              15m
            </Button>
            <Button variant="outline" size="sm" onClick={() => sessionAction("EXTEND", { minutes: 30 })}>
              <Clock3 />
              30m
            </Button>
            <Button variant="destructive" size="sm" onClick={() => sessionAction("END")}>
              <Square />
              End
            </Button>
          </div>
        ) : (
          <div className="rounded-md border border-neon-green/20 bg-neon-green/10 p-3 text-sm text-neon-green">
            Ready for online booking or walk-in start.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
