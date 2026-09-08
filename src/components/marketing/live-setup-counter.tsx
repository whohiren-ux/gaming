"use client";

import { useEffect } from "react";
import { Activity, Clock3, Gamepad2, Zap } from "lucide-react";

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
    <div className="space-y-5">
      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-[#00ff88]/20 bg-[#00ff88]/5 p-4 text-center">
          <p className="text-[0.65rem] font-medium uppercase tracking-wider text-[#00ff88]/60">Free</p>
          <p className="mt-2 text-3xl font-black text-[#00ff88]">{available}</p>
        </div>
        <div className="rounded-xl border border-[#0066ff]/20 bg-[#0066ff]/5 p-4 text-center">
          <p className="text-[0.65rem] font-medium uppercase tracking-wider text-[#00d4ff]/60">Active</p>
          <p className="mt-2 text-3xl font-black text-[#00d4ff]">{active}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
          <p className="text-[0.65rem] font-medium uppercase tracking-wider text-white/40">Total</p>
          <p className="mt-2 text-3xl font-black text-white">{setups.length}</p>
        </div>
      </div>

      {/* Occupancy bar */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="flex items-center gap-2 text-xs font-medium text-white/50">
            <Activity className="size-3.5 text-[#00d4ff]" />
            Occupancy
          </span>
          <span className="text-sm font-bold text-white">{occupancy}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#0066ff] to-[#00d4ff] transition-all duration-500"
            style={{ width: `${occupancy}%` }}
          />
        </div>
      </div>

      {/* Setup list */}
      <div className="grid gap-2.5">
        {setups.slice(0, 4).map((setup) => (
          <div
            key={setup.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition-all hover:border-[#0066ff]/20 hover:bg-[#0066ff]/5"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#0066ff]/10 text-[#00d4ff]">
                <Gamepad2 className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{setup.name}</p>
                <p className="truncate text-xs text-white/30">{setup.availabilityLabel}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {setup.displayStatus === "AVAILABLE" && (
                <span className="flex items-center gap-1 rounded-full bg-[#00ff88]/10 px-2 py-0.5 text-[0.6rem] font-bold text-[#00ff88]">
                  <Zap className="size-2.5" />
                  FREE
                </span>
              )}
              {setup.displayStatus === "ACTIVE" && (
                <span className="flex items-center gap-1 rounded-full bg-[#0066ff]/10 px-2 py-0.5 text-[0.6rem] font-bold text-[#00d4ff]">
                  <Clock3 className="size-2.5" />
                  LIVE
                </span>
              )}
              {setup.displayStatus === "ENDING_SOON" && (
                <span className="flex items-center gap-1 rounded-full bg-[#ff0033]/10 px-2 py-0.5 text-[0.6rem] font-bold text-[#ff0033]">
                  <Clock3 className="size-2.5" />
                  ENDING
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
