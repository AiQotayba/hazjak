import { env } from "@hazjak/config";

function webBase() {
  return env.webUrl.replace(/\/+$/, "");
}

/** لوحة حجوزات صاحب الملعب */
export function ownerBookingsUrl(bookingId?: string) {
  const base = `${webBase()}/owner/bookings`;
  return bookingId ? `${base}?booking=${bookingId}` : base;
}

/** حجوزات اللاعب */
export function userBookingsUrl(bookingId?: string) {
  const base = `${webBase()}/user/bookings`;
  return bookingId ? `${base}?booking=${bookingId}` : base;
}
