import { prisma, type NotificationType } from "../db";

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: NotificationType,
  bookingId?: string
) {
  return prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      ...(bookingId != null ? { bookingId } : {}),
    },
  });
}

export async function notifyBookingStatus(
  userId: string,
  stadiumName: string,
  status: string,
  bookingId?: string
) {
  const map: Record<string, { title: string; message: string; type: NotificationType }> = {
    PENDING: {
      title: "حجز قيد الانتظار",
      message: `تم إرسال طلب حجزك لملعب ${stadiumName}. بانتظار تأكيد الملعب.`,
      type: "BOOKING_PENDING",
    },
    CONFIRMED: {
      title: "تم تأكيد الحجز",
      message: `تم تأكيد حجزك في ${stadiumName}. نراك في الموعد!`,
      type: "BOOKING_CONFIRMED",
    },
    REJECTED: {
      title: "تم رفض الحجز",
      message: `عذراً، تم رفض حجزك في ${stadiumName}.`,
      type: "BOOKING_REJECTED",
    },
    CANCELLED: {
      title: "تم إلغاء الحجز",
      message: `تم إلغاء حجزك في ${stadiumName}.`,
      type: "BOOKING_CANCELLED",
    },
  };
  const n = map[status];
  if (n) await createNotification(userId, n.title, n.message, n.type, bookingId);
}
