"use client";

import { useEffect, useMemo, useState } from "react";
import { Monitor, Search } from "lucide-react";

import { CountdownText } from "@/components/common/countdown";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { SETUP_TYPE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useCafeStore } from "@/store/cafe-store";

function statusClass(status: string) {
  if (status === "AVAILABLE") {
    return "border-neon-green/35 bg-neon-green/10 text-neon-green";
  }
  if (status === "ACTIVE") {
    return "border-neon-blue/35 bg-neon-blue/10 text-neon-cyan";
  }
  if (status === "ENDING_SOON") {
    return "border-neon-amber/40 bg-neon-amber/10 text-neon-amber";
  }
  if (status === "EXPIRED") {
    return "border-neon-red/40 bg-neon-red/10 text-neon-red";
  }
  return "border-white/10 bg-white/5 text-muted-foreground";
}

export function AvailabilityBoard({ compact = false }: { compact?: boolean }) {
  const { setups, fetchAvailability, subscribeAvailability, loadingAvailability } = useCafeStore();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("ALL");

  useEffect(() => {
    fetchAvailability();
    return subscribeAvailability();
  }, [fetchAvailability, subscribeAvailability]);

  const filtered = useMemo(
    () =>
      setups.filter((setup) => {
        const matchesQuery =
          setup.name.toLowerCase().includes(query.toLowerCase()) ||
          setup.stationCode.toLowerCase().includes(query.toLowerCase());
        const matchesType = type === "ALL" || setup.type === type;
        return matchesQuery && matchesType;
      }),
    [query, setups, type]
  );

  return (
    <div className="space-y-5">
      {!compact ? (
        <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search setup, station, or console"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="Setup type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All setups</SelectItem>
              <SelectItem value="PS5">PS5</SelectItem>
              <SelectItem value="PS4">PS4</SelectItem>
              <SelectItem value="GAMING_PC">Gaming PC</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {loadingAvailability && setups.length === 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="h-44 animate-pulse" />
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((setup) => (
          <Card key={setup.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <CardTitle className="truncate">{setup.name}</CardTitle>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {setup.stationCode} · {SETUP_TYPE_LABELS[setup.type]}
                  </p>
                </div>
                <span
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-md border",
                    statusClass(setup.displayStatus)
                  )}
                >
                  <Monitor className="size-5" />
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={cn("rounded-md border p-3", statusClass(setup.displayStatus))}>
                <div className="flex items-center justify-between gap-3">
                  <Badge variant="muted">{setup.displayStatus.replace("_", " ")}</Badge>
                  <span className="text-sm font-bold">
                    {setup.activeSessionId ? (
                      <CountdownText endsAt={setup.availableAt} />
                    ) : (
                      setup.availabilityLabel
                    )}
                  </span>
                </div>
                {setup.activeSessionId ? (
                  <p className="mt-2 text-xs opacity-90">{setup.availabilityLabel}</p>
                ) : null}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Hourly rate</span>
                <span className="font-bold text-white">₹{setup.hourlyPrice}/hr</span>
              </div>
              {setup.currentCustomer ? (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="max-w-36 truncate font-semibold text-white">{setup.currentCustomer}</span>
                </div>
              ) : null}
              {setup.queue.length > 0 ? (
                <div className="rounded-md border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Queue</p>
                  <div className="mt-2 space-y-1">
                    {setup.queue.slice(0, 2).map((booking) => (
                      <p key={booking.id} className="truncate text-xs text-muted-foreground">
                        {new Date(booking.startsAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}{" "}
                        · {booking.customerName || booking.reference}
                      </p>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No setups match your filters.
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
