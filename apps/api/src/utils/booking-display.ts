type BookingUser = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
};

type BookingWithUser = {
  notes?: string | null;
  guestName?: string | null;
  guestPhone?: string | null;
  user: BookingUser;
};

/** يستخرج اسم الضيف من ملاحظات الحجز اليدوي (حجوزات قديمة) */
export function parseManualGuestFromNotes(notes?: string | null) {
  const match = notes?.match(/^\[حجز يدوي · ([^\]]+)\]/);
  if (!match) return null;
  const parts = match[1].split(" · ").map((s) => s.trim());
  return {
    name: parts[0] ?? "",
    phone: parts[1],
  };
}

export function resolveBookingGuest(booking: Pick<BookingWithUser, "guestName" | "guestPhone" | "notes">) {
  const fromNotes = parseManualGuestFromNotes(booking.notes);
  const name = booking.guestName?.trim() || fromNotes?.name;
  if (!name) return null;
  return {
    name,
    phone: booking.guestPhone?.trim() || fromNotes?.phone,
  };
}

/** يعرض الضيف بدل صاحب الملعب في واجهة المالك */
export function mapBookingGuestAsUser<T extends BookingWithUser>(booking: T): T {
  const guest = resolveBookingGuest(booking);
  if (!guest) return booking;

  return {
    ...booking,
    user: {
      ...booking.user,
      firstName: guest.name,
      lastName: "",
      phone: guest.phone ?? booking.user.phone,
    },
  };
}

export function getManualBookingExtraNotes(notes?: string | null) {
  if (!notes) return null;
  const extra = notes.replace(/^\[حجز يدوي ·[^\]]+\]\s*/, "").trim();
  return extra || null;
}
