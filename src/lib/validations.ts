import { z } from "zod";

import {
  BookingSource,
  MembershipType,
  PaymentMethod,
  PaymentType,
  SetupStatus,
  SetupType,
  TournamentStatus
} from "@prisma/client";

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(160),
  phone: z.string().min(8).max(20).optional(),
  password: z.string().min(8).max(100)
});

export const setupCreateSchema = z.object({
  stationCode: z.string().min(2).max(24),
  name: z.string().min(2).max(80),
  type: z.nativeEnum(SetupType),
  hourlyPrice: z.coerce.number().min(1).max(100000),
  status: z.nativeEnum(SetupStatus).default("AVAILABLE"),
  floor: z.string().min(1).max(80).default("Main Floor"),
  displayOrder: z.coerce.number().int().min(0).default(0),
  bufferMinutes: z.coerce.number().int().min(0).max(60).default(10),
  isBookable: z.coerce.boolean().default(true),
  specs: z.record(z.string(), z.unknown()).optional()
});

export const setupUpdateSchema = setupCreateSchema.partial();

export const bookingCreateSchema = z.object({
  setupId: z.string().optional(),
  setupType: z.nativeEnum(SetupType),
  startTime: z.coerce.date(),
  durationMinutes: z.coerce.number().int().min(30).max(480),
  paymentIntent: z.enum(["TOKEN", "FULL"]).default("TOKEN"),
  source: z.nativeEnum(BookingSource).default("ONLINE"),
  notes: z.string().max(500).optional()
});

export const bookingUpdateSchema = z.object({
  status: z.enum(["CONFIRMED", "CANCELLED", "NO_SHOW", "COMPLETED"]).optional(),
  notes: z.string().max(500).optional()
});

export const sessionStartSchema = z.object({
  setupId: z.string(),
  bookingId: z.string().optional(),
  customerId: z.string().optional(),
  customerName: z.string().min(2).max(80).optional(),
  customerPhone: z.string().min(8).max(20).optional(),
  durationMinutes: z.coerce.number().int().min(15).max(720).default(60),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  paidAmount: z.coerce.number().min(0).default(0),
  notes: z.string().max(500).optional()
});

export const sessionActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("PAUSE") }),
  z.object({ action: z.literal("RESUME") }),
  z.object({
    action: z.literal("EXTEND"),
    minutes: z.coerce.number().int().min(5).max(240),
    paymentMethod: z.nativeEnum(PaymentMethod).optional(),
    paidAmount: z.coerce.number().min(0).default(0)
  }),
  z.object({
    action: z.literal("END"),
    paymentMethod: z.nativeEnum(PaymentMethod).optional(),
    paidAmount: z.coerce.number().min(0).default(0),
    notes: z.string().max(500).optional()
  }),
  z.object({ action: z.literal("FORCE_STOP"), notes: z.string().max(500).optional() }),
  z.object({ action: z.literal("SWITCH_SETUP"), targetSetupId: z.string() }),
  z.object({ action: z.literal("ADD_NOTE"), notes: z.string().min(1).max(500) })
]);

export const razorpayOrderSchema = z.object({
  bookingId: z.string().optional(),
  sessionId: z.string().optional(),
  membershipPlanId: z.string().optional(),
  amount: z.coerce.number().min(1),
  paymentType: z.nativeEnum(PaymentType),
  paymentMethod: z.nativeEnum(PaymentMethod).default("RAZORPAY")
});

export const membershipPlanSchema = z.object({
  name: z.string().min(2).max(80),
  type: z.nativeEnum(MembershipType),
  price: z.coerce.number().min(0),
  includedMinutes: z.coerce.number().int().min(0),
  discountPercent: z.coerce.number().int().min(0).max(90),
  priorityBooking: z.coerce.boolean().default(false),
  maxDailyMinutes: z.coerce.number().int().min(0).optional(),
  description: z.string().max(500).optional()
});

export const expenseSchema = z.object({
  title: z.string().min(2).max(120),
  category: z.string().min(2).max(80),
  amount: z.coerce.number().min(1),
  incurredAt: z.coerce.date().default(() => new Date()),
  notes: z.string().max(500).optional()
});

export const tournamentSchema = z.object({
  title: z.string().min(2).max(120),
  game: z.string().min(2).max(80),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date().optional(),
  entryFee: z.coerce.number().min(0),
  prizePool: z.coerce.number().min(0),
  maxPlayers: z.coerce.number().int().min(2).max(512),
  status: z.nativeEnum(TournamentStatus).default("UPCOMING"),
  description: z.string().max(1000).optional(),
  rules: z.string().max(2000).optional()
});
