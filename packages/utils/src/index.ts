export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\u0600-\u06FF\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const AR_LATIN: Intl.NumberFormatOptions = { numberingSystem: "latn" };

/** Syrian pound (ل.س) — أرقام لاتينية دائماً */
export function formatPrice(amount: number, locale = "ar-SY"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "SYP",
    maximumFractionDigits: 0,
    ...AR_LATIN,
  }).format(amount);
}

export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" }
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("ar-SY", { ...options, ...AR_LATIN }).format(d);
}

export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("ar-SY", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    ...AR_LATIN,
  }).format(d);
}

/** Formats "HH:MM" (24h) for display in 12-hour Arabic locale. */
export function formatHHMM12(hhmm: string): string {
  const [h, min] = hhmm.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(min)) return hhmm;
  return formatTime(new Date(2000, 0, 1, h, min));
}

export function estimateBookingPrice(
  morningPrice: number,
  eveningPrice: number,
  start: Date
): number {
  return isMorningSlot(start) ? morningPrice : eveningPrice;
}

function toPageInt(value: number | undefined, fallback: number): number {
  if (value == null || !Number.isFinite(value) || value < 1) {
    return fallback;
  }
  return Math.floor(value);
}

/** Normalizes page/limit query params (NaN from Number(undefined) → defaults). */
export function getPagination(page?: number, limit?: number) {
  const p = toPageInt(page, 1);
  const l = Math.min(50, toPageInt(limit, 10));
  return { page: p, limit: l, skip: (p - 1) * l };
}

export function buildMeta(total: number, page: number, limit: number) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

type SortDirection = "asc" | "desc";

/** Builds a Prisma-safe orderBy from DataTable sort_field / sort_order query params. */
export function buildTableOrderBy<F extends string>(
  sortField: string | undefined,
  sortOrder: string | undefined,
  allowedFields: readonly F[],
  defaultOrder: Partial<Record<F, SortDirection>>
): Partial<Record<F, SortDirection>> {
  const direction: SortDirection | undefined =
    sortOrder === "asc" || sortOrder === "desc" ? sortOrder : undefined;

  if (sortField && allowedFields.includes(sortField as F) && direction) {
    return { [sortField]: direction } as Partial<Record<F, SortDirection>>;
  }

  return defaultOrder;
}

export function isMorningSlot(date: Date): boolean {
  const hour = date.getHours();
  return hour >= 6 && hour < 17;
}

export function omitPassword<T extends { password?: string }>(
  user: T
): Omit<T, "password"> {
  const { password: _, ...rest } = user;
  return rest;
}

export { normalizeMediaUrl, isApiUploadUrl, resolvePublicMediaUrl } from "./media-url";
export { normalizePhone, formatPhoneDisplay } from "./phone";
