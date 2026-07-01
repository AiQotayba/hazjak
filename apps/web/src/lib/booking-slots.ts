import { estimateBookingPrice, formatDate, formatHHMM12 } from "@hazjak/utils";

export const BOOKING_SLOT_MINUTES = 90;
const DAY_START_HOUR = 8;
const DAY_END_HOUR = 24;

export interface TimeSlotOption {
  value: string;
  label: string;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatClock(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${pad(h)}:${pad(m)}`;
}

/** Fixed 90-minute slots from 08:00 through the day. */
export function getBookingTimeSlots(): TimeSlotOption[] {
  const slots: TimeSlotOption[] = [];
  let start = DAY_START_HOUR * 60;
  const lastStart = DAY_END_HOUR * 60 - BOOKING_SLOT_MINUTES;

  while (start <= lastStart) {
    const end = start + BOOKING_SLOT_MINUTES;
    const value = formatClock(start);
    const endValue = formatClock(end);
    slots.push({
      value,
      label: `${formatHHMM12(value)} – ${formatHHMM12(endValue)}`,
    });
    start += BOOKING_SLOT_MINUTES;
  }

  return slots;
}

export function localDateInputValue(date: Date = new Date()) {
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  return `${y}-${m}-${d}`;
}

export function buildBookingRange(dateStr: string, timeStart: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [h, min] = timeStart.split(":").map(Number);
  const start = new Date(y, m - 1, d, h, min, 0, 0);
  const end = new Date(start.getTime() + BOOKING_SLOT_MINUTES * 60 * 1000);
  return { start, end };
}

export function isBookingSlotPast(dateStr: string, timeStart: string, now = new Date()) {
  const { start } = buildBookingRange(dateStr, timeStart);
  return start < now;
}

export function applyPastSlotAvailability<
  T extends { value: string; available: boolean; reason?: string },
>(slots: T[], dateStr: string, now = new Date()): T[] {
  return slots.map((slot) => {
    if (isBookingSlotPast(dateStr, slot.value, now)) {
      return { ...slot, available: false, reason: "past" };
    }
    return slot;
  });
}

export function parseDateKey(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** e.g. 05/25/2026 */
export function formatDateShortDisplay(dateStr: string) {
  const d = parseDateKey(dateStr);
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}`;
}

export function formatBookingDate(dateStr: string) {
  return formatDate(parseDateKey(dateStr), {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getEstimatedPrice(
  morningPrice: number,
  eveningPrice: number,
  dateStr: string,
  timeStart: string
) {
  const { start } = buildBookingRange(dateStr, timeStart);
  return estimateBookingPrice(morningPrice, eveningPrice, start);
}
