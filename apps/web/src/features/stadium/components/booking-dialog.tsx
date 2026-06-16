"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, LogIn, Timer, Wallet } from "lucide-react";
import { formatPrice } from "@hazjak/utils";
import type { AuthUser } from "@hazjak/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import {
  BOOKING_SLOT_MINUTES,
  buildBookingRange,
  getBookingTimeSlots,
  getEstimatedPrice,
  localDateInputValue,
} from "@/lib/booking-slots";
import { getSlotColorClasses, SLOT_LEGEND, type SlotReason } from "@/lib/slot-colors";
import { cn } from "@/lib/utils";

const FALLBACK_SLOTS = getBookingTimeSlots();

interface DaySlot {
  value: string;
  label: string;
  available: boolean;
  reason?: string;
}

function formatCount(value: number): string {
  return new Intl.NumberFormat("ar-SY", { numberingSystem: "latn" }).format(value);
}

export interface BookingDialogStadium {
  id: string;
  name: string;
  slug: string;
  morningPrice: number;
  eveningPrice: number;
  depositAmount?: number | null;
}

interface BookingDialogProps {
  stadium: BookingDialogStadium;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: string | null;
  user: AuthUser | null;
}

export function BookingDialog({
  stadium,
  open,
  onOpenChange,
  token,
  user,
}: BookingDialogProps) {
  const router = useRouter();
  const minDate = useMemo(() => localDateInputValue(), []);

  const [date, setDate] = useState(minDate);
  const [timeSlot, setTimeSlot] = useState(FALLBACK_SLOTS[4]?.value ?? FALLBACK_SLOTS[0]?.value ?? "16:00");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [daySlots, setDaySlots] = useState<DaySlot[]>(FALLBACK_SLOTS.map((s) => ({ ...s, available: true })));
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [dayBlocked, setDayBlocked] = useState(false);

  useEffect(() => {
    if (!open || !stadium.id || !date) return;

    setLoadingSlots(true);
    api<{ date: string; dayBlocked: boolean; slots: DaySlot[] }>(
      `/stadiums/${stadium.id}/booking-slots?date=${date}`
    )
      .then((res) => {
        if (res.success && res.data?.slots) {
          setDaySlots(res.data.slots);
          setDayBlocked(res.data.dayBlocked);
          const firstAvailable = res.data.slots.find((s) => s.available);
          if (firstAvailable) setTimeSlot(firstAvailable.value);
        }
      })
      .finally(() => setLoadingSlots(false));
  }, [open, stadium.id, date]);

  const estimatedPrice = useMemo(
    () => getEstimatedPrice(stadium.morningPrice, stadium.eveningPrice, date, timeSlot),
    [stadium.morningPrice, stadium.eveningPrice, date, timeSlot]
  );

  const selectedSlot = daySlots.find((s) => s.value === timeSlot);
  const selectedSlotLabel = selectedSlot?.label ?? timeSlot;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!token || !user) {
      router.push(`/login?next=/stadiums/${encodeURIComponent(stadium.slug)}`);
      return;
    }

    if (!user.isEmailVerified) {
      router.push("/verify-email");
      return;
    }

    if (!date || !timeSlot) {
      setError("اختر التاريخ والتوقيت");
      return;
    }

    if (!selectedSlot?.available) {
      setError("هذا الموعد غير متاح — اختر وقتاً آخر");
      return;
    }

    const { start, end } = buildBookingRange(date, timeSlot);
    if (start < new Date()) {
      setError("لا يمكن الحجز في وقت ماضٍ");
      return;
    }

    setSubmitting(true);
    const res = await api("/bookings", {
      method: "POST",
      token,
      body: JSON.stringify({
        stadiumId: stadium.id,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        notes: notes.trim() || undefined,
      }),
    });
    setSubmitting(false);

    if (res.success) {
      onOpenChange(false);
      router.push("/user/bookings");
      return;
    }

    setError(res.message ?? "تعذّر إرسال الطلب");
  }

  function handleOpenChange(next: boolean) {
    if (!next) setError("");
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="w-[calc(100%-2rem)] sm:max-w-lg max-h-[min(calc(100dvh-2rem),720px)] p-3 gap-0 overflow-y-auto border-0 bg-transparent shadow-none"
        dir="rtl"
      >
        <div className="overflow-hidden rounded-3xl bg-card shadow-card">
          <div className="p-5 space-y-5">
            <DialogHeader className="text-start space-y-1 p-0">
              <DialogTitle className="text-xl font-bold text-heading">تفاصيل الحجز</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {stadium.name}
              </DialogDescription>
            </DialogHeader>

            {!token || !user ? (
              <LoginPrompt
                onLogin={() =>
                  router.push(`/login?next=/stadiums/${encodeURIComponent(stadium.slug)}`)
                }
              />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="booking-date" className="text-xs text-muted-foreground mb-1.5 block">
                    التاريخ
                  </Label>
                  <DatePicker
                    id="booking-date"
                    value={date}
                    onChange={setDate}
                    minDate={minDate}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    التوقيت ({formatCount(BOOKING_SLOT_MINUTES)} د)
                  </Label>

                  {loadingSlots ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">جاري تحميل المواعيد...</p>
                  ) : (
                    <div
                      className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto p-1"
                      role="listbox"
                      aria-label="توقيت الحجز"
                    >
                      {daySlots.map((slot) => {
                        const isSelected = timeSlot === slot.value;
                        return (
                          <button
                            key={slot.value}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            disabled={!slot.available || dayBlocked}
                            onClick={() => slot.available && setTimeSlot(slot.value)}
                            className={cn(
                              "rounded-xl border px-2 py-2 text-[11px] font-medium transition-all text-center leading-tight",
                              getSlotColorClasses(
                                { available: slot.available, reason: slot.reason as SlotReason | undefined },
                                isSelected
                              )
                            )}
                          >
                            {slot.label}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 pt-1">
                    {SLOT_LEGEND.map((item) => (
                      <span key={item.key} className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <span className={cn("h-2 w-2 rounded-full shrink-0", item.className)} />
                        {item.label}
                      </span>
                    ))}
                  </div>
                </div>

                {dayBlocked && (
                  <p className="text-sm text-destructive rounded-2xl bg-destructive/10 px-3 py-2">
                    الملعب مغلق في هذا اليوم — اختر تاريخاً آخر
                  </p>
                )}

                <div className="space-y-1.5">
                  <textarea
                    id="booking-notes"
                    className="w-full min-h-[80px] rounded-2xl border-0 bg-secondary/60 px-4 py-3 text-sm text-heading placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="مباراة ودية، عدد اللاعبين..."
                    maxLength={500}
                  />
                </div>

                <PriceSummary
                  estimatedPrice={estimatedPrice}
                  depositAmount={stadium.depositAmount}
                  durationLabel={`${formatCount(BOOKING_SLOT_MINUTES)} دقيقة`}
                  slotLabel={selectedSlotLabel}
                />

                {error && (
                  <p className="text-sm text-destructive rounded-2xl bg-destructive/10 px-3 py-2">
                    {error}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-2xl h-11 border-0 bg-secondary hover:bg-secondary/80"
                    onClick={() => onOpenChange(false)}
                    disabled={submitting}
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-2xl h-11 shadow-soft"
                    disabled={submitting || dayBlocked || !selectedSlot?.available}
                  >
                    {submitting ? "جاري الإرسال..." : "تأكيد الطلب"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LoginPrompt({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-secondary/70 px-4 py-4 text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
          <LogIn className="h-5 w-5 text-primary" aria-hidden />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          سجّل دخولك لإكمال الحجز — بياناتك تُرفق تلقائياً مع الطلب.
        </p>
      </div>
      <Button className="w-full rounded-2xl h-11 shadow-soft gap-2" onClick={onLogin}>
        <LogIn className="h-4 w-4" />
        تسجيل الدخول
      </Button>
    </div>
  );
}

function PriceSummary({
  estimatedPrice,
  depositAmount,
  durationLabel,
  slotLabel,
}: {
  estimatedPrice: number;
  depositAmount?: number | null;
  durationLabel: string;
  slotLabel: string;
}) {
  return (
    <div className="rounded-2xl bg-gradient-to-l from-primary/10 via-accent/30 to-secondary px-4 py-3 space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">المبلغ التقديري</p>
          <p className="text-2xl font-bold text-primary leading-none mt-1">
            {formatPrice(estimatedPrice)}
          </p>
        </div>
        {depositAmount != null && depositAmount > 0 && (
          <div className="text-end shrink-0">
            <p className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
              <Wallet className="h-3 w-3" aria-hidden />
              العربون
            </p>
            <p className="text-sm font-bold text-heading mt-0.5">{formatPrice(depositAmount)}</p>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Timer className="h-3 w-3 text-primary" aria-hidden />
          {durationLabel}
        </span>
        <span className="inline-flex items-center gap-1" dir="ltr">
          <Clock className="h-3 w-3 text-primary" aria-hidden />
          {slotLabel}
        </span>
      </div>
      <p className="text-[10px] text-muted-foreground leading-relaxed">
        السعر النهائي يُحسب صباحي/مسائي حسب وقت بداية الحجز
      </p>
    </div>
  );
}
