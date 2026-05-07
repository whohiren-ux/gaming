"use client";

import { create } from "zustand";

import { getPusherClient } from "@/lib/pusher-client";
import { REALTIME_CHANNELS, REALTIME_EVENTS } from "@/lib/realtime-events";
import type { AvailabilitySetup, DashboardSummary } from "@/types";

type CafeStore = {
  setups: AvailabilitySetup[];
  dashboard: DashboardSummary | null;
  loadingAvailability: boolean;
  fetchAvailability: () => Promise<void>;
  fetchDashboard: () => Promise<void>;
  subscribeAvailability: () => () => void;
  subscribeAdmin: () => () => void;
};

export const useCafeStore = create<CafeStore>((set, get) => ({
  setups: [],
  dashboard: null,
  loadingAvailability: false,
  async fetchAvailability() {
    set({ loadingAvailability: true });
    try {
      const response = await fetch("/api/setups", { cache: "no-store" });
      const data = (await response.json()) as { setups: AvailabilitySetup[] };
      set({ setups: data.setups ?? [] });
    } finally {
      set({ loadingAvailability: false });
    }
  },
  async fetchDashboard() {
    const response = await fetch("/api/analytics/summary", { cache: "no-store" });
    if (!response.ok) {
      return;
    }
    const data = (await response.json()) as { analytics: DashboardSummary };
    set({ dashboard: data.analytics });
  },
  subscribeAvailability() {
    const client = getPusherClient();
    if (!client) {
      const interval = window.setInterval(() => get().fetchAvailability(), 15_000);
      return () => window.clearInterval(interval);
    }

    const channel = client.subscribe(REALTIME_CHANNELS.availability);
    const refresh = () => get().fetchAvailability();

    channel.bind(REALTIME_EVENTS.availabilityChanged, refresh);
    channel.bind(REALTIME_EVENTS.sessionChanged, refresh);
    channel.bind(REALTIME_EVENTS.bookingChanged, refresh);

    return () => {
      channel.unbind(REALTIME_EVENTS.availabilityChanged, refresh);
      channel.unbind(REALTIME_EVENTS.sessionChanged, refresh);
      channel.unbind(REALTIME_EVENTS.bookingChanged, refresh);
      client.unsubscribe(REALTIME_CHANNELS.availability);
    };
  },
  subscribeAdmin() {
    const client = getPusherClient();
    const refresh = () => {
      get().fetchDashboard();
      get().fetchAvailability();
    };

    if (!client) {
      const interval = window.setInterval(refresh, 15_000);
      return () => window.clearInterval(interval);
    }

    const channel = client.subscribe(REALTIME_CHANNELS.admin);
    channel.bind(REALTIME_EVENTS.sessionChanged, refresh);
    channel.bind(REALTIME_EVENTS.bookingChanged, refresh);
    channel.bind(REALTIME_EVENTS.paymentChanged, refresh);
    channel.bind(REALTIME_EVENTS.analyticsChanged, refresh);

    return () => {
      channel.unbind(REALTIME_EVENTS.sessionChanged, refresh);
      channel.unbind(REALTIME_EVENTS.bookingChanged, refresh);
      channel.unbind(REALTIME_EVENTS.paymentChanged, refresh);
      channel.unbind(REALTIME_EVENTS.analyticsChanged, refresh);
      client.unsubscribe(REALTIME_CHANNELS.admin);
    };
  }
}));
