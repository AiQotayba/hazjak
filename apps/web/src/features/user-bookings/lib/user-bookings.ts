import type { BookingListItemData } from "@/features/user-bookings/components/booking-list-item";

export const ARCHIVED_BOOKING_STATUSES = [
  "COMPLETED",
  "CANCELLED",
  "REJECTED",
  "EXPIRED",
  "NO_SHOW",
] as const;

export type DepositFields = {
  status: string;
  depositReferenceCode?: string | null;
  depositAmount?: number | null;
  depositPaidAt?: string | null;
};

export function isAwaitingDeposit(booking: DepositFields) {
  return (
    booking.status === "PENDING" &&
    !!booking.depositReferenceCode &&
    !booking.depositPaidAt
  );
}

export function isDepositPaidPendingOwner(booking: DepositFields) {
  return (
    booking.status === "PENDING" &&
    !!booking.depositReferenceCode &&
    !!booking.depositPaidAt
  );
}

/** حجز بانتظار رد الملعب (بدون عربون) */
export function isPendingOwnerReview(booking: DepositFields) {
  return booking.status === "PENDING" && !booking.depositReferenceCode;
}

export function getBookingStatusHint(booking: DepositFields): string | null {
  if (isAwaitingDeposit(booking)) return "ادفع العربون وأبلّغنا";
  if (isDepositPaidPendingOwner(booking)) return "بانتظار تأكيد الملعب";
  if (isPendingOwnerReview(booking)) return "بانتظار رد الملعب";
  return null;
}

export function getOwnerBookingDepositHint(booking: DepositFields): string | null {
  if (isAwaitingDeposit(booking)) return "بانتظار العربون";
  if (isDepositPaidPendingOwner(booking)) return "أكّد الحجز";
  if (isPendingOwnerReview(booking)) return "رد على الطلب";
  return null;
}

export function getBookingStatusLabel(
  status: string,
  booking?: DepositFields
): string {
  if (status === "PENDING" && booking) {
    if (isAwaitingDeposit(booking)) return "بانتظار العربون";
    if (isDepositPaidPendingOwner(booking)) return "بانتظار التأكيد";
    if (isPendingOwnerReview(booking)) return "بانتظار الرد";
  }
  const labels: Record<string, string> = {
    PENDING: "بانتظار الرد",
    CONFIRMED: "مؤكد",
    COMPLETED: "مكتمل",
    CANCELLED: "ملغى",
    REJECTED: "مرفوض",
    EXPIRED: "منتهي",
    NO_SHOW: "لم يحضر",
  };
  return labels[status] ?? status;
}

export function sortUpcomingBookings<T extends { startTime: string } & DepositFields>(
  bookings: T[]
): T[] {
  return bookings.slice().sort((a, b) => {
    const aDeposit = isAwaitingDeposit(a) ? 0 : isDepositPaidPendingOwner(a) ? 1 : 2;
    const bDeposit = isAwaitingDeposit(b) ? 0 : isDepositPaidPendingOwner(b) ? 1 : 2;
    if (aDeposit !== bDeposit) return aDeposit - bDeposit;
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });
}

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
