export const CAFE_NAME = process.env.CAFE_NAME || "Neon Nexus Gaming Cafe";

export const DEFAULT_SESSION_BUFFER_MINUTES = Number(
  process.env.DEFAULT_SESSION_BUFFER_MINUTES || 10
);

export const BOOKING_HOLD_MINUTES = 15;

export const SESSION_ENDING_ALERT_MINUTES = 10;

export const BOOKING_TOKEN_MINIMUM_INR = 100;

export const SETUP_TYPE_LABELS = {
  PS5: "PlayStation 5",
  PS4: "PlayStation 4",
  GAMING_PC: "Gaming PC"
} as const;

export const STATUS_LABELS = {
  AVAILABLE: "Available",
  ACTIVE: "Active",
  RESERVED: "Reserved",
  MAINTENANCE: "Maintenance",
  EXPIRED: "Expired"
} as const;
