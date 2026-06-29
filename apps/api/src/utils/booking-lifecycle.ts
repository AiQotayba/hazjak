import { prisma } from "../db";
import { BOOKING_EXPIRATION_MIN } from "@hazjak/constants";

const TERMINAL = new Set(["COMPLETED", "CANCELLED", "REJECTED", "EXPIRED", "NO_SHOW"]);

type BookingLike = {
  status: string;
  depositAmount?: number | null;
  depositReferenceCode?: string | null;
  depositPaidAt?: Date | null;
};

export function stadiumRequiresDeposit(booking: Pick<BookingLike, "depositAmount">) {
  return booking.depositAmount != null && booking.depositAmount > 0;
}

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

  if (from === "PENDING" && nextStatus === "CONFIRMED") {
    if (stadiumRequiresDeposit(booking) && !booking.depositPaidAt) {
      throw new Error("لا يمكن تأكيد الحجز — يجب دفع العربون وتأكيده من اللاعب أولاً");
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

/** يُحوّل الحجوزات التي انتهى وقتها — مؤكد → مكتمل، معلّق → منتهي */
export async function finalizePastBookings(now = new Date()) {
  const [completed, expired] = await Promise.all([
    prisma.booking.updateMany({
      where: {
        status: "CONFIRMED",
        endTime: { lte: now },
      },
      data: { status: "COMPLETED" },
    }),
    prisma.booking.updateMany({
      where: {
        status: "PENDING",
        endTime: { lte: now },
      },
      data: { status: "EXPIRED" },
    }),
  ]);

  return { completed: completed.count, expired: expired.count };
}

export async function runBookingLifecycleJobs(now = new Date()) {
  await expireStaleDepositBookings();
  await finalizePastBookings(now);
}
