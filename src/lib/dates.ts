import { addMinutes, differenceInMinutes, isBefore, startOfDay, subDays } from "date-fns";
import { format, toZonedTime, fromZonedTime } from "date-fns-tz";

const TZ = "Asia/Kolkata";

export function nowIST(): Date {
  return toZonedTime(new Date(), TZ);
}

export function minutesFromNow(date: Date) {
  return Math.max(0, Math.ceil((date.getTime() - Date.now()) / 60_000));
}

export function minutesBetween(start: Date, end: Date) {
  return Math.max(0, differenceInMinutes(end, start));
}

export function addMinutesSafe(date: Date, minutes: number) {
  return addMinutes(date, minutes);
}

export function isPastDate(date: Date) {
  return isBefore(date, new Date());
}

export function formatClock(date: Date) {
  return format(toZonedTime(date, TZ), "h:mm a", { timeZone: TZ });
}

export function formatDateTime(date: Date) {
  return format(toZonedTime(date, TZ), "dd MMM yyyy, h:mm a", { timeZone: TZ });
}

export function formatDateTimeLocalInput(date: Date) {
  return format(toZonedTime(date, TZ), "yyyy-MM-dd'T'HH:mm", { timeZone: TZ });
}

export function dateRangeDays(days: number) {
  const today = startOfDay(toZonedTime(new Date(), TZ));
  return Array.from({ length: days }, (_, index) => subDays(today, days - index - 1));
}

