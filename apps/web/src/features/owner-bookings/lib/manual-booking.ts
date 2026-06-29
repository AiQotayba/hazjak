/** يستخرج اسم الضيف من ملاحظات الحجز اليدوي */
export function parseManualBookingGuest(notes?: string | null) {
  const match = notes?.match(/^\[حجز يدوي · ([^\]]+)\]/);
  if (!match) return null;
  const parts = match[1].split(" · ").map((s) => s.trim());
  return {
    name: parts[0] ?? "",
    phone: parts[1],
  };
}

export function isManualBooking(booking: { guestName?: string | null; notes?: string | null }) {
  if (booking.guestName?.trim()) return true;
  return !!booking.notes?.startsWith("[حجز يدوي ·");
}

export function getManualBookingExtraNotes(notes?: string | null) {
  if (!notes) return null;
  const extra = notes.replace(/^\[حجز يدوي ·[^\]]+\]\s*/, "").trim();
  return extra || null;
}

export function getBookingPlayerLabel(booking: {
  guestName?: string | null;
  guestPhone?: string | null;
  notes?: string | null;
  user: { firstName: string; lastName: string };
}) {
  if (booking.guestName?.trim()) return booking.guestName.trim();
  const guest = parseManualBookingGuest(booking.notes);
  if (guest?.name) return guest.name;
  return `${booking.user.firstName} ${booking.user.lastName}`.trim();
}

export function getBookingPlayerPhone(booking: {
  guestPhone?: string | null;
  notes?: string | null;
  user: { phone?: string };
}) {
  if (booking.guestPhone?.trim()) return booking.guestPhone.trim();
  const guest = parseManualBookingGuest(booking.notes);
  return guest?.phone ?? booking.user.phone;
}
