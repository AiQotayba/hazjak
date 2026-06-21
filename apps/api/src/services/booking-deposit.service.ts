import { prisma } from "../db";
import { BOOKING_EXPIRATION_MIN } from "@hazjak/constants";
import { createNotification } from "./notification.service";
import {
  sendDepositInstructionsWhatsApp,
} from "./whatsapp/whatsapp.service";
import { depositWhatsAppMessage } from "./whatsapp/messages";
import { generateDepositReferenceCode } from "../utils/booking-slots";

type DepositStadium = {
  name: string;
  shamCashId?: string | null;
  shamCashQrImage?: string | null;
};

type DepositUser = {
  phone: string;
};

/** يفعّل طلب العربون ويرسل الإشعارات (واتساب) */
export async function activateDepositRequest(input: {
  bookingId: string;
  userId: string;
  depositAmount: number;
  referenceCode?: string | null;
  stadium: DepositStadium;
  user: DepositUser;
}) {
  const depositReferenceCode =
    input.referenceCode?.trim() || generateDepositReferenceCode();

  const updated = await prisma.booking.update({
    where: { id: input.bookingId },
    data: {
      status: "PENDING",
      depositAmount: input.depositAmount,
      depositReferenceCode,
      depositRequestedAt: new Date(),
      depositPaidAt: null,
    },
  });

  await createNotification(
    input.userId,
    "ادفع العربون لإتمام الحجز",
    `ملعب ${input.stadium.name} محجوز مؤقتاً. ادفع العربون خلال ${BOOKING_EXPIRATION_MIN} دقيقة عبر شام كاش.`,
    "DEPOSIT_REMINDER",
    input.bookingId
  );

  const waMsg = depositWhatsAppMessage({
    stadiumName: input.stadium.name,
    depositAmount: input.depositAmount,
    referenceCode: depositReferenceCode,
    shamCashId: input.stadium.shamCashId,
  });
  await sendDepositInstructionsWhatsApp(
    input.user.phone,
    waMsg,
    input.stadium.shamCashQrImage
  );

  return { ...updated, depositReferenceCode };
}
