import { Prisma } from "@prisma/client";

export function toDecimal(value: number | string | Prisma.Decimal) {
  return value instanceof Prisma.Decimal ? value : new Prisma.Decimal(value);
}

export function toNumber(value: number | string | Prisma.Decimal | null | undefined) {
  if (value === null || value === undefined) {
    return 0;
  }

  return Number(value);
}

export function formatINR(value: number | string | Prisma.Decimal | null | undefined) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(toNumber(value));
}

export function calculateSessionAmount(hourlyRate: Prisma.Decimal | number, minutes: number) {
  const amount = (toNumber(hourlyRate) / 60) * Math.max(minutes, 0);
  return toDecimal(Math.ceil(amount));
}

export function paise(amount: Prisma.Decimal | number | string) {
  return Math.round(toNumber(amount) * 100);
}
