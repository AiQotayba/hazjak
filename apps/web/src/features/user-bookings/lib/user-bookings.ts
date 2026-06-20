import type { BookingListItemData } from "@/features/user-bookings/components/booking-list-item";

export const ARCHIVED_BOOKING_STATUSES = [
  "COMPLETED",
  "CANCELLED",
  "REJECTED",
  "EXPIRED",
  "NO_SHOW",
] as const;

export interface BookingStats {
  total: number;
  upcoming: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  totalSpent: number;
  nextBooking: BookingListItemData | null;
  recentBookings: BookingListItemData[];
}

export function formatUpcomingBookingsLabel(count: number): string {
  if (count === 0) return "لا حجوزات قادمة";
  if (count === 1) return "حجز قادم واحد";
  if (count === 2) return "حجزان قادمان";
  if (count >= 3 && count <= 10) return `${count} حجوزات قادمة`;
  return `${count} حجزًا قادمًا`;
}

export function computeBookingStats(
  bookings: BookingListItemData[],
  totalFromMeta?: number
): BookingStats {
  const now = Date.now();
  const isArchived = (status: string) =>
    (ARCHIVED_BOOKING_STATUSES as readonly string[]).includes(status);
  const upcomingList = bookings.filter((b) => !isArchived(b.status));
  const nextBooking =
    upcomingList
      .filter((b) => new Date(b.startTime).getTime() >= now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0] ??
    upcomingList.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0] ??
    null;

  return {
    total: totalFromMeta ?? bookings.length,
    upcoming: upcomingList.length,
    pending: bookings.filter((b) => b.status === "PENDING").length,
    confirmed: bookings.filter((b) => b.status === "CONFIRMED").length,
    completed: bookings.filter((b) => b.status === "COMPLETED").length,
    cancelled: bookings.filter((b) =>
      ["CANCELLED", "REJECTED", "EXPIRED", "NO_SHOW"].includes(b.status)
    ).length,
    totalSpent: bookings
      .filter((b) => b.status === "COMPLETED")
      .reduce((sum, b) => sum + (b.totalPrice ?? 0), 0),
    nextBooking,
    recentBookings: bookings
      .slice()
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 3),
  };
}
