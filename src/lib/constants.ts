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
  GAMING_PC: "Racing Wheel"
} as const;

type SetupDisplayInput = {
  type?: string | null;
  name?: string | null;
  stationCode?: string | null;
};

export function getSetupTypeLabel(type: string) {
  return SETUP_TYPE_LABELS[type as keyof typeof SETUP_TYPE_LABELS] ?? type.replaceAll("_", " ");
}

export function getSetupDisplayName(setup: SetupDisplayInput) {
  const name = setup.name ?? "";

  if (setup.type !== "GAMING_PC") {
    return name;
  }

  return name
    .replace(/^RTX Battle Station/i, "Racing Wheel")
    .replace(/^Gaming PC/i, "Racing Wheel");
}

export function getSetupDisplayCode(setup: SetupDisplayInput) {
  const stationCode = setup.stationCode ?? "";

  if (setup.type === "GAMING_PC") {
    return stationCode.replace(/^PC-/i, "RW-");
  }

  return stationCode;
}

export const STATUS_LABELS = {
  AVAILABLE: "Available",
  ACTIVE: "Active",
  RESERVED: "Reserved",
  MAINTENANCE: "Maintenance",
  EXPIRED: "Expired"
} as const;
