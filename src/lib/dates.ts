import { addMinutes, differenceInMinutes, format, isBefore, startOfDay, subDays } from "date-fns";

export function minutesFromNow(date: Date) {
  return Math.max(0, differenceInMinutes(date, new Date()));
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
  return format(date, "h:mm a");
}

export function formatDateTime(date: Date) {
  return format(date, "dd MMM yyyy, h:mm a");
}

export function dateRangeDays(days: number) {
  const today = startOfDay(new Date());
  return Array.from({ length: days }, (_, index) => subDays(today, days - index - 1));
}
