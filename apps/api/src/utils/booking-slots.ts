import { BOOKING_EXPIRATION_MIN } from "@hazjak/constants";
import { formatHHMM12 } from "@hazjak/utils";

export const BOOKING_SLOT_MINUTES = 90;
const DAY_START_HOUR = 8;
const DAY_END_HOUR = 24;

export interface TimeSlotOption {
  value: string;
  label: string;
}

export interface ComputedSlot extends TimeSlotOption {
  available: boolean;
  reason?: "booked" | "blocked" | "outside_hours" | "past";
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatClock(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${pad(h)}:${pad(m)}`;
}

export function getStandardTimeSlots(): TimeSlotOption[] {
  const slots: TimeSlotOption[] = [];
  let start = DAY_START_HOUR * 60;
  const lastStart = DAY_END_HOUR * 60 - BOOKING_SLOT_MINUTES;

  while (start <= lastStart) {
    const end = start + BOOKING_SLOT_MINUTES;
    const value = formatClock(start);
    const endValue = formatClock(end);
    slots.push({ value, label: `${formatHHMM12(value)} – ${formatHHMM12(endValue)}` });
    start += BOOKING_SLOT_MINUTES;
  }

  return slots;
}

export function localDateKey(date: Date, timeZone = "Asia/Damascus") {
  return date.toLocaleDateString("en-CA", { timeZone });
}

export function localTimeValue(date: Date, timeZone = "Asia/Damascus") {
  return date.toLocaleTimeString("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function buildRangeFromDateAndTime(dateStr: string, timeStart: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [h, min] = timeStart.split(":").map(Number);
  const start = new Date(y, m - 1, d, h, min, 0, 0);
  const end = new Date(start.getTime() + BOOKING_SLOT_MINUTES * 60 * 1000);
  return { start, end };
}

function rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart < bEnd && aEnd > bStart;
}

function isWithinAvailabilityWindow(
  slotStart: Date,
  slotEnd: Date,
  windows: { startTime: Date; endTime: Date; isAvailable: boolean }[]
) {
  return windows.some(
    (w) =>
      w.isAvailable &&
      slotStart >= w.startTime &&
      slotEnd <= w.endTime
  );
}

export function computeDaySlots(input: {
  dateStr: string;
  dayBlocked: boolean;
  bookedRanges: { startTime: Date; endTime: Date }[];
  availabilityWindows: { startTime: Date; endTime: Date; isAvailable: boolean }[];
  now?: Date;
}): ComputedSlot[] {
  const now = input.now ?? new Date();
  const hasCustomWindows = input.availabilityWindows.length > 0;

  if (input.dayBlocked) {
    return getStandardTimeSlots().map((slot) => ({
      ...slot,
      available: false,
      reason: "blocked" as const,
    }));
  }

  return getStandardTimeSlots().map((slot) => {
    const { start, end } = buildRangeFromDateAndTime(input.dateStr, slot.value);

    if (start < now) {
      return { ...slot, available: false, reason: "past" as const };
    }

    const booked = input.bookedRanges.some((b) =>
      rangesOverlap(start, end, b.startTime, b.endTime)
    );
    if (booked) {
      return { ...slot, available: false, reason: "booked" as const };
    }

    if (hasCustomWindows && !isWithinAvailabilityWindow(start, end, input.availabilityWindows)) {
      return { ...slot, available: false, reason: "outside_hours" as const };
    }

    return { ...slot, available: true };
  });
}

export function generateDepositReferenceCode() {
  const part = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BP-${part}`;
}

export { BOOKING_EXPIRATION_MIN };
