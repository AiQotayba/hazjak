import { prisma } from "../db";
import { BOOKING_EXPIRATION_MIN } from "@hazjak/constants";

const TERMINAL = new Set(["COMPLETED", "CANCELLED", "REJECTED", "EXPIRED", "NO_SHOW"]);

type BookingLike = {
  status: string;
  depositReferenceCode?: string | null;
  depositPaidAt?: Date | null;
};

export function isAwaitingDeposit(booking: BookingLike) {
  return (
    booking.status === "PENDING" &&
    !!booking.depositReferenceCode &&
    !booking.depositPaidAt
  );
}

export function assertStatusTransition(
  booking: BookingLike,
  nextStatus: string,
  opts?: { requireDeposit?: boolean }
) {
  if (TERMINAL.has(booking.status)) {
    throw new Error("لا يمكن تعديل حجز منتهٍ");
  }

  if (opts?.requireDeposit) {
    if (booking.status !== "PENDING") throw new Error("لا يمكن طلب عربون لهذا الحجز");
    return;
  }

  const from = booking.status;
  const allowed: Record<string, string[]> = {
    PENDING: ["CONFIRMED", "REJECTED", "CANCELLED", "EXPIRED"],
    CONFIRMED: ["COMPLETED", "CANCELLED", "NO_SHOW"],
  };

  const nextAllowed = allowed[from];
  if (!nextAllowed?.includes(nextStatus)) {
    throw new Error("انتقال حالة غير مسموح");
  }

  if (from === "PENDING" && nextStatus === "CONFIRMED" && isAwaitingDeposit(booking)) {
    if (!booking.depositPaidAt) {
      throw new Error("لا يمكن تأكيد الحجز — اللاعب لم يؤكّد دفع العربون بعد");
    }
  }
}

/** ينتهي الحجز تلقائياً إذا لم يُدفع العربون خلال المهلة */
export async function expireStaleDepositBookings() {
  const cutoff = new Date(Date.now() - BOOKING_EXPIRATION_MIN * 60 * 1000);

  const result = await prisma.booking.updateMany({
    where: {
      status: "PENDING",
      depositReferenceCode: { not: null },
      depositRequestedAt: { lte: cutoff },
      depositPaidAt: null,
    },
    data: { status: "EXPIRED" },
  });

  return result.count;
}
