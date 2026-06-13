export const API_VERSION = "v1";
export const API_PREFIX = `/api/${API_VERSION}`;

export const ROLES = {
  ADMIN: "ADMIN",
  STADIUM_OWNER: "STADIUM_OWNER",
  USER: "USER",
} as const;

export const BOOKING_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "REJECTED",
  "EXPIRED",
  "NO_SHOW",
] as const;

export const PAYMENT_STATUSES = [
  "PENDING",
  "PARTIALLY_PAID",
  "PAID",
  "FAILED",
  "REFUNDED",
] as const;

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 50;

export const BOOKING_EXPIRATION_MIN = 15;
export const CANCELLATION_HOURS = 24;
export const MATCH_REMINDER_HOURS = 24;
export const MATCH_REMINDER_HOURS_BEFORE = 2;

export const APP_NAME_AR = "Hazjak";
export const APP_TAGLINE_AR = "ملعبك الجاي — احجزه بضغطة";
export const APP_MOTTO_AR = "العب أكثر، ابحث أقل";
export const APP_CITIES = ["حلب", "إدلب"] as const;

/** قيمة فارغة للفلتر = «الكل» (لا تُرسل للـ API) */
export const BOOKING_STATUS_FILTER_ALL = "all" as const;

export const BOOKING_STATUS_FILTER_OPTIONS = [
  { value: BOOKING_STATUS_FILTER_ALL, label: "كل الحالات" },
  { value: "PENDING", label: "قيد الانتظار" },
  { value: "CONFIRMED", label: "مؤكد" },
  { value: "COMPLETED", label: "مكتمل" },
  { value: "CANCELLED", label: "ملغى" },
  { value: "REJECTED", label: "مرفوض" },
  { value: "EXPIRED", label: "منتهي" },
  { value: "NO_SHOW", label: "لم يحضر" },
] as const;

export const SPORT_TYPE_OPTIONS = [
  { value: "FOOTBALL", label: "كرة قدم" },
  { value: "FUTSAL", label: "خماسيات / فوتسال" },
  { value: "BASKETBALL", label: "كرة سلة" },
  { value: "BASEBALL", label: "بيسبول" },
  { value: "OTHER", label: "أخرى" },
] as const;

export const SPORT_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  SPORT_TYPE_OPTIONS.map((o) => [o.value, o.label])
);
