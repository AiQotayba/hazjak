import { prisma, type NotificationType } from "../db";
import { formatDate } from "@hazjak/utils";
import { sendWhatsAppMessageAsync } from "./whatsapp/whatsapp.service";
import {
  bookingCancelledOwnerWhatsAppMessage,
  bookingCancelledPlayerWhatsAppMessage,
  bookingConfirmedAfterDepositWhatsAppMessage,
  bookingConfirmedWhatsAppMessage,
} from "./whatsapp/messages";
import { ownerBookingsUrl } from "../utils/app-urls";

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
      title: "طلبك قيد المراجعة",
      message: `وصل طلب حجزك لملعب ${stadiumName}. صاحب الملعب سيرد عليك قريباً.`,
      type: "BOOKING_PENDING",
    },
    CONFIRMED: {
      title: "حجزك مؤكد",
      message: `تم تأكيد حجزك في ${stadiumName}. جهّز حذاءك — نراك في الموعد!`,
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
    COMPLETED: {
      title: "اكتمل الحجز",
      message: `شكراً لعبك في ${stadiumName}. نراك في المرة القادمة!`,
      type: "BOOKING_CONFIRMED",
    },
    EXPIRED: {
      title: "انتهت مهلة العربون",
      message: `انتهت مهلة دفع العربون لحجز ${stadiumName}. يمكنك إرسال طلب جديد.`,
      type: "BOOKING_CANCELLED",
    },
    NO_SHOW: {
      title: "لم تحضر للمباراة",
      message: `تم تسجيل عدم حضورك لحجز ${stadiumName}.`,
      type: "BOOKING_CANCELLED",
    },
  };
  const n = map[status];
  if (n) await createNotification(userId, n.title, n.message, n.type, bookingId);
}

/** إشعار اللاعب + واتساب عند تأكيد صاحب الملعب للحجز */
export async function notifyPlayerBookingConfirmed(input: {
  userId: string;
  phone: string;
  stadiumName: string;
  startTime: Date;
  totalPrice: number;
  depositPaidAt?: Date | null;
  depositAmount?: number | null;
  bookingId: string;
}) {
  const hadDepositReviewed =
    !!input.depositPaidAt &&
    input.depositAmount != null &&
    input.depositAmount > 0;

  if (hadDepositReviewed) {
    await createNotification(
      input.userId,
      "حجزك مؤكد",
      `صاحب الملعب راجع العربون وأكّد حجزك في ${input.stadiumName}. نراك في الموعد!`,
      "BOOKING_CONFIRMED",
      input.bookingId
    );
  } else {
    await notifyBookingStatus(input.userId, input.stadiumName, "CONFIRMED", input.bookingId);
  }

  const startLabel = formatDate(input.startTime, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const message = hadDepositReviewed
    ? bookingConfirmedAfterDepositWhatsAppMessage({
        stadiumName: input.stadiumName,
        startLabel,
        totalPrice: input.totalPrice,
        depositAmount: input.depositAmount!,
      })
    : bookingConfirmedWhatsAppMessage({
        stadiumName: input.stadiumName,
        startLabel,
        totalPrice: input.totalPrice,
      });

  sendWhatsAppMessageAsync(input.phone, message);
}

/** إشعار + واتساب عند إلغاء الحجز — اللاعب دائماً، وصاحب الملعب إذا ألغى اللاعب */
export async function notifyBookingCancelled(input: {
  bookingId: string;
  playerUserId: string;
  playerPhone: string;
  playerName: string;
  ownerUserId: string;
  ownerPhone: string | null;
  stadiumName: string;
  startTime: Date;
  cancelledByPlayer: boolean;
}) {
  const startLabel = formatDate(input.startTime, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  await createNotification(
    input.playerUserId,
    "تم إلغاء الحجز",
    input.cancelledByPlayer
      ? `ألغيت حجزك في ${input.stadiumName} (${startLabel}).`
      : `تم إلغاء حجزك في ${input.stadiumName} (${startLabel}).`,
    "BOOKING_CANCELLED",
    input.bookingId
  );

  sendWhatsAppMessageAsync(
    input.playerPhone,
    bookingCancelledPlayerWhatsAppMessage({
      stadiumName: input.stadiumName,
      startLabel,
      cancelledByPlayer: input.cancelledByPlayer,
    })
  );

  if (!input.cancelledByPlayer) return;

  await createNotification(
    input.ownerUserId,
    "إلغاء حجز من لاعب",
    `${input.playerName} ألغى حجزه في ${input.stadiumName} (${startLabel}).`,
    "BOOKING_CANCELLED",
    input.bookingId
  );

  if (input.ownerPhone) {
    sendWhatsAppMessageAsync(
      input.ownerPhone,
      bookingCancelledOwnerWhatsAppMessage({
        playerName: input.playerName,
        stadiumName: input.stadiumName,
        startLabel,
        bookingsUrl: ownerBookingsUrl(input.bookingId),
      })
    );
  }
}
