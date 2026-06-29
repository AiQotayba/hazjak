type RevenueBooking = {
  status: string;
  endTime: Date;
  totalPrice: number;
};

const REVENUE_STATUSES = new Set(["CONFIRMED", "COMPLETED"]);

/** Revenue counts only after the booking slot ends (play finished at stadium). */
export function isRevenueEligible(
  booking: Pick<RevenueBooking, "status" | "endTime">,
  now: Date = new Date()
): boolean {
  return REVENUE_STATUSES.has(booking.status) && booking.endTime.getTime() <= now.getTime();
}

export function isConfirmedBooking(status: string): boolean {
  return REVENUE_STATUSES.has(status);
}

/** مؤكد ولم ينتهِ وقت الحجز بعد */
export function isUpcomingConfirmedBooking(
  booking: Pick<RevenueBooking, "status" | "endTime">,
  now: Date = new Date()
): boolean {
  return booking.status === "CONFIRMED" && booking.endTime.getTime() > now.getTime();
}

/** معلّق ولم ينتهِ وقت الحجز بعد */
export function isActivePendingBooking(
  booking: Pick<RevenueBooking, "status" | "endTime">,
  now: Date = new Date()
): boolean {
  return booking.status === "PENDING" && booking.endTime.getTime() > now.getTime();
}

export function sumEligibleRevenue(
  bookings: RevenueBooking[],
  now: Date = new Date()
): number {
  return bookings
    .filter((b) => isRevenueEligible(b, now))
    .reduce((sum, b) => sum + b.totalPrice, 0);
}

/** Confirmed bookings whose play time has not ended yet. */
export function sumUpcomingRevenue(
  bookings: RevenueBooking[],
  now: Date = new Date()
): number {
  return bookings
    .filter((b) => b.status === "CONFIRMED" && b.endTime.getTime() > now.getTime())
    .reduce((sum, b) => sum + b.totalPrice, 0);
}
