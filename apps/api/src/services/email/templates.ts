import { APP_TAGLINE_AR } from "@hazjak/constants";
import { env } from "@hazjak/config";
import { formatDate, formatPrice, formatTime } from "@hazjak/utils";

/** الاسم الظاهر في الواجهة (apps/web) */
const BRAND = "حجزك";

const COLORS = {
  primary: "#df6951",
  heading: "#181e4b",
  muted: "#5e6282",
  bg: "#f8f9ff",
  card: "#ffffff",
  border: "#e5e7f0",
  accent: "#fff4e6",
} as const;

function rtlTd(extraStyle = "") {
  return `dir="rtl" align="right" style="direction:rtl;text-align:right;${extraStyle}"`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function absoluteImageUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const base =
    process.env.API_PUBLIC_URL?.replace(/\/$/, "") ?? `http://localhost:${env.apiPort}`;
  return trimmed.startsWith("/") ? `${base}${trimmed}` : `${base}/${trimmed}`;
}

function emailLayout(input: {
  title: string;
  intro?: string;
  bodyHtml: string;
  cta?: { label: string; href: string };
  footnote?: string;
}) {
  const ctaBlock = input.cta
    ? `
        <tr>
          <td ${rtlTd("padding:8px 28px 28px;text-align:center")}>
            <a href="${input.cta.href}" style="display:inline-block;background:${COLORS.primary};color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:999px">
              ${escapeHtml(input.cta.label)}
            </a>
          </td>
        </tr>`
    : "";

  const footnoteBlock = input.footnote
    ? `<p style="margin:0;font-size:12px;color:${COLORS.muted};line-height:1.6;text-align:center">${input.footnote}</p>`
    : `<p style="margin:0;font-size:12px;color:${COLORS.muted};line-height:1.6;text-align:center">${escapeHtml(APP_TAGLINE_AR)}</p>`;

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="Content-Language" content="ar" />
  <title>${escapeHtml(input.title)}</title>
  <style>
    body, table, td, p, h1, span, strong, a, div {
      direction: rtl;
      text-align: right;
    }
  </style>
</head>
<body dir="rtl" style="margin:0;padding:0;background:${COLORS.bg};font-family:'Tajawal',Tahoma,Arial,sans-serif;color:${COLORS.heading};direction:rtl;text-align:right">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" dir="rtl" style="background:${COLORS.bg};direction:rtl">
    <tr>
      <td align="center" dir="rtl" style="padding:32px 16px;direction:rtl">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" dir="rtl" style="max-width:520px;background:${COLORS.card};border:1px solid ${COLORS.border};border-radius:16px;overflow:hidden;box-shadow:0 15px 40px rgba(94,98,130,0.08);direction:rtl">
          <tr>
            <td dir="rtl" align="center" style="padding:24px 28px 8px;text-align:center;border-bottom:1px solid ${COLORS.border};direction:rtl">
              <p style="margin:0;font-size:22px;font-weight:800;color:${COLORS.primary};letter-spacing:-0.02em">${BRAND}</p>
              <p style="margin:6px 0 0;font-size:12px;color:${COLORS.muted};text-align:center">${escapeHtml(APP_TAGLINE_AR)}</p>
            </td>
          </tr>
          <tr>
            <td ${rtlTd("padding:24px 28px 8px")}>
              <h1 style="margin:0 0 12px;font-size:18px;font-weight:700;color:${COLORS.heading};line-height:1.4;text-align:right">${escapeHtml(input.title)}</h1>
              ${input.intro ? `<p style="margin:0 0 16px;font-size:14px;color:${COLORS.muted};line-height:1.7;text-align:right">${input.intro}</p>` : ""}
              ${input.bodyHtml}
            </td>
          </tr>
          ${ctaBlock}
          <tr>
            <td dir="rtl" style="padding:16px 28px 24px;border-top:1px solid ${COLORS.border};background:${COLORS.bg};direction:rtl">
              ${footnoteBlock}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function infoRow(label: string, value: string) {
  return `
    <tr>
      <td ${rtlTd(`padding:10px 0;border-bottom:1px solid ${COLORS.border};font-size:14px;line-height:1.6`)}>
        <span style="display:block;font-size:12px;color:${COLORS.muted};margin-bottom:2px;text-align:right">${escapeHtml(label)}</span>
        <strong style="color:${COLORS.heading};text-align:right;display:block">${value}</strong>
      </td>
    </tr>`;
}

function infoTable(rows: string) {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" dir="rtl" style="margin:8px 0 0;direction:rtl">
      ${rows}
    </table>`;
}

function otpBlock(otp: string) {
  return `
    <div dir="rtl" style="margin:16px 0;padding:20px;background:${COLORS.accent};border-radius:12px;text-align:center;direction:rtl">
      <p style="margin:0 0 8px;font-size:13px;color:${COLORS.muted};text-align:center">رمز التحقق</p>
      <p style="margin:0;font-size:32px;font-weight:800;color:${COLORS.primary};letter-spacing:6px;font-family:monospace;direction:ltr;text-align:center">${escapeHtml(otp)}</p>
    </div>
    <p style="margin:12px 0 0;font-size:13px;color:${COLORS.muted};line-height:1.6;text-align:right">صالح لمدة 15 دقيقة. لا تشارك هذا الرمز مع أحد.</p>`;
}

function shamCashQrBlock(imageUrl: string) {
  const src = escapeHtml(absoluteImageUrl(imageUrl));
  return `
    <tr>
      <td ${rtlTd(`padding:14px 0;border-bottom:1px solid ${COLORS.border};font-size:14px;line-height:1.6`)}>
        <span style="display:block;font-size:12px;color:${COLORS.muted};margin-bottom:8px;text-align:right">باركود شام كاش</span>
        <img
          src="${src}"
          alt="باركود شام كاش"
          width="160"
          height="160"
          style="display:block;max-width:160px;height:auto;border-radius:12px;border:1px solid ${COLORS.border};background:${COLORS.bg};margin-right:0;margin-left:auto"
        />
      </td>
    </tr>`;
}

export function verificationOtpEmail(otp: string) {
  return {
    subject: `${BRAND} — رمز التحقق`,
    text: `رمز التحقق الخاص بك في ${BRAND}: ${otp}\nصالح لمدة 15 دقيقة.`,
    html: emailLayout({
      title: "تأكيد بريدك الإلكتروني",
      intro: "استخدم الرمز التالي لإكمال التسجيل:",
      bodyHtml: otpBlock(otp),
    }),
  };
}

export function passwordResetOtpEmail(otp: string) {
  return {
    subject: `${BRAND} — إعادة تعيين كلمة المرور`,
    text: `رمز إعادة التعيين في ${BRAND}: ${otp}\nصالح لمدة 15 دقيقة.`,
    html: emailLayout({
      title: "إعادة تعيين كلمة المرور",
      intro: "طلبت إعادة تعيين كلمة المرور. استخدم الرمز التالي:",
      bodyHtml: otpBlock(otp),
    }),
  };
}

export function bookingConfirmedEmail(input: {
  stadiumName: string;
  startTime: Date;
  endTime: Date;
  totalPrice: number;
}) {
  const when = `${formatDate(input.startTime)} — ${formatTime(input.startTime)}`;
  const stadium = escapeHtml(input.stadiumName);
  const price = escapeHtml(formatPrice(input.totalPrice));

  return {
    subject: `${BRAND} — تم تأكيد حجزك`,
    text: `تم تأكيد حجزك في ${input.stadiumName} يوم ${when}. المبلغ: ${formatPrice(input.totalPrice)}`,
    html: emailLayout({
      title: "تم تأكيد حجزك",
      intro: "صاحب الملعب قبل طلبك. تفاصيل الحجز:",
      bodyHtml: infoTable(
        infoRow("الملعب", stadium) +
          infoRow("الموعد", escapeHtml(when)) +
          infoRow("المبلغ", price)
      ),
      cta: { label: "عرض حجوزاتي", href: `${env.webUrl}/user/bookings` },
    }),
  };
}

export function bookingRejectedEmail(stadiumName: string) {
  const stadium = escapeHtml(stadiumName);

  return {
    subject: `${BRAND} — تم رفض طلب الحجز`,
    text: `عذراً، تم رفض طلب حجزك في ${stadiumName}.`,
    html: emailLayout({
      title: "تم رفض طلب الحجز",
      intro: `عذراً، لم يتم قبول طلبك في <strong style="color:${COLORS.heading}">${stadium}</strong>.`,
      bodyHtml: `<p style="margin:0;font-size:14px;color:${COLORS.muted};line-height:1.7;text-align:right">يمكنك اختيار ملعب أو موعد آخر والمحاولة من جديد.</p>`,
      cta: { label: "تصفح الملاعب", href: `${env.webUrl}/stadiums` },
    }),
  };
}

export function depositRequestEmail(input: {
  stadiumName: string;
  depositAmount: number;
  referenceCode: string;
  shamCashId?: string | null;
  shamCashQrImage?: string | null;
}) {
  const stadium = escapeHtml(input.stadiumName);
  const amount = escapeHtml(formatPrice(input.depositAmount));
  const code = escapeHtml(input.referenceCode);
  const shamRow = input.shamCashId
    ? infoRow("حساب شام كاش", escapeHtml(input.shamCashId))
    : "";
  const qrRow =
    input.shamCashQrImage?.trim()
      ? shamCashQrBlock(input.shamCashQrImage)
      : "";

  const qrTextNote = input.shamCashQrImage?.trim()
    ? "\nستجد باركود شام كاش مرفقاً في نسخة HTML من الرسالة."
    : "";

  return {
    subject: `${BRAND} — طلب دفع العربون`,
    text: `لتأكيد حجزك في ${input.stadiumName}: ادفع ${formatPrice(input.depositAmount)} عبر شام كاش.${input.shamCashId ? ` الحساب: ${input.shamCashId}.` : ""} ضع الكود ${input.referenceCode} في ملاحظة التحويل.${qrTextNote}`,
    html: emailLayout({
      title: "طلب دفع العربون",
      intro: `لتأكيد حجزك في <strong style="color:${COLORS.heading}">${stadium}</strong>:`,
      bodyHtml:
        infoTable(
          infoRow("المبلغ", amount) +
            shamRow +
            qrRow +
            `<tr>
              <td ${rtlTd("padding:14px 0;font-size:14px;line-height:1.6")}>
                <span style="display:block;font-size:12px;color:${COLORS.muted};margin-bottom:6px;text-align:right">كود ملاحظة التحويل</span>
                <span style="display:inline-block;background:${COLORS.accent};color:${COLORS.primary};font-size:20px;font-weight:800;padding:10px 18px;border-radius:12px;letter-spacing:2px;font-family:monospace;direction:ltr">${code}</span>
              </td>
            </tr>`
        ) +
        `<p style="margin:16px 0 0;font-size:13px;color:${COLORS.muted};line-height:1.6;text-align:right">ضع الكود في <strong>ملاحظة التحويل</strong> عند الدفع عبر شام كاش. بدونه قد يتأخر تأكيد الدفع.</p>`,
    }),
  };
}
