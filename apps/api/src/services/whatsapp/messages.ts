import { BOOKING_EXPIRATION_MIN } from "@hazjak/constants";

import { formatPrice } from "@hazjak/utils";



export function depositWhatsAppMessage(input: {
  stadiumName: string;
  depositAmount: number;
  referenceCode: string;
  shamCashId?: string | null;
}) {
  const lines = [
    `تم حجز ${input.stadiumName} مؤقتاً.`,
    ``,
    `ادفع العربون (${formatPrice(input.depositAmount)}) عبر شام كاش خلال ${BOOKING_EXPIRATION_MIN} دقيقة لإتمام الحجز.`,
    `كود التحويل: ${input.referenceCode}`,
    input.shamCashId ? `حساب شام كاش: ${input.shamCashId}` : "",
    ``,
    `بعد الدفع، افتح حجزك في التطبيق واضغط «أبلغنا بدفع العربون».`,
  ].filter((line) => line !== undefined);

  return lines.join("\n");
}



export function bookingConfirmedWhatsAppMessage(input: {

  stadiumName: string;

  startLabel: string;

  totalPrice: number;

}) {

  return [

    `تم تأكيد حجزك في ${input.stadiumName}!`,

    `الموعد: ${input.startLabel}`,

    `الإجمالي: ${formatPrice(input.totalPrice)}`,

    `جهّز حذاءك — نراك في الملعب.`,

  ].join("\n");

}



export function otpWhatsAppMessage(otp: string, purpose: "verify" | "reset") {

  if (purpose === "reset") {

    return `رمز استعادة كلمة المرور في حجزك: ${otp}\nصالح لمدة 15 دقيقة — لا تشاركه مع أحد.`;

  }

  return `رمز تأكيد حسابك في حجزك: ${otp}\nصالح لمدة 15 دقيقة — لا تشاركه مع أحد.`;

}



export function depositPaidOwnerWhatsAppMessage(input: {

  playerName: string;

  stadiumName: string;

  referenceCode: string;

}) {

  return [

    `وصل تأكيد دفع العربون`,

    `${input.playerName} أكّد دفع العربون لحجز ${input.stadiumName}.`,

    `كود التحويل: ${input.referenceCode}`,

    `راجع التحويل في شام كاش ثم أكّد الحجز من لوحتك.`,

  ].join("\n");

}


