import type { BookingStatus, PaymentStatus, SetupStatus, SetupType, SessionStatus } from "@prisma/client";

export type AvailabilitySetup = {
  id: string;
  stationCode: string;
  name: string;
  type: SetupType;
  hourlyPrice: number;
  status: SetupStatus;
  displayStatus: "AVAILABLE" | "ACTIVE" | "ENDING_SOON" | "EXPIRED" | "RESERVED" | "MAINTENANCE";
  availabilityLabel: string;
  remainingMinutes: number | null;
  availableAt: string | null;
  currentCustomer: string | null;
  activeSessionId: string | null;
  currentAmount: number;
  queue: Array<{
    id: string;
    reference: string;
    status: BookingStatus;
    startsAt: string;
    endsAt: string;
    customerName: string | null;
  }>;
};

export type DashboardSummary = {
  totalSetups: number;
  activeSetups: number;
  freeSetups: number;
  occupancyPercent: number;
  dailyEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  peakUsageHour: number | null;
  activeSessions: Array<{
    id: string;
    setupName: string;
    setupType: SetupType;
    customerName: string | null;
    status: SessionStatus;
    endsAt: string;
    remainingMinutes: number;
    currentAmount: number;
  }>;
  revenueTrend: Array<{ date: string; revenue: number; bookings: number }>;
  occupancyTrend: Array<{ date: string; occupancy: number }>;
  setupUsage: Array<{ name: string; minutes: number; revenue: number }>;
};

export type PaymentLifecycleStatus = PaymentStatus | "NOT_REQUIRED";
