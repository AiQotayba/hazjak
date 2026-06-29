"use client";

import { useEffect, useMemo, useState } from "react";
import { formatPrice } from "@hazjak/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { PhoneNumberInput } from "@/components/ui/phone-number-input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { useSnackbar } from "@/components/ui/snackbar";
import { useAuthStore } from "@/features/auth/store/auth";
import type { OwnerStadiumData } from "@/features/owner-stadium/types";
import { ownerInputClass } from "@/features/owner-stadium/types";
import {
  BOOKING_SLOT_MINUTES,
  buildBookingRange,
  getBookingTimeSlots,
  getEstimatedPrice,
  localDateInputValue,
} from "@/lib/booking-slots";
import { getSlotColorClasses, SLOT_LEGEND, type SlotReason } from "@/lib/slot-colors";
import { cn } from "@/lib/utils";

interface DaySlot {
  value: string;
  label: string;
  available: boolean;
  reason?: string;
}

const FALLBACK_SLOTS = getBookingTimeSlots();

function formatCount(value: number): string {
  return new Intl.NumberFormat("ar-SY", { numberingSystem: "latn" }).format(value);
}

interface CreateOwnerManualBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

export function CreateOwnerManualBookingDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateOwnerManualBookingDialogProps) {
  const { token } = useAuthStore();
  const showSnack = useSnackbar((s) => s.show);
  const minDate = useMemo(() => localDateInputValue(), []);

  const [stadium, setStadium] = useState<OwnerStadiumData | null>(null);
  const [loadingStadium, setLoadingStadium] = useState(false);
  const [date, setDate] = useState(minDate);
  const [timeSlot, setTimeSlot] = useState(
    FALLBACK_SLOTS[4]?.value ?? FALLBACK_SLOTS[0]?.value ?? "16:00"
  );
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [daySlots, setDaySlots] = useState<DaySlot[]>(
    FALLBACK_SLOTS.map((s) => ({ ...s, available: true }))
  );
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [dayBlocked, setDayBlocked] = useState(false);

  useEffect(() => {
    if (!open || !token) return;
    setLoadingStadium(true);
    api<OwnerStadiumData[]>("/stadiums/mine", { token })
      .then((res) => setStadium(res.data?.[0] ?? null))
      .finally(() => setLoadingStadium(false));
  }, [open, token]);

  useEffect(() => {
    if (!open || !stadium?.id || !date) return;

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
  }, [open, stadium?.id, date]);

  useEffect(() => {
    if (!open) {
      setGuestName("");
      setGuestPhone("");
      setNotes("");
      setError("");
      setDate(minDate);
    }
  }, [open, minDate]);

  const estimatedPrice = useMemo(() => {
    if (!stadium) return 0;
    return getEstimatedPrice(stadium.morningPrice, stadium.eveningPrice, date, timeSlot);
  }, [stadium, date, timeSlot]);

  const selectedSlot = daySlots.find((s) => s.value === timeSlot);
  const canSubmit =
    !!stadium &&
    guestName.trim().length >= 2 &&
    !!selectedSlot?.available &&
    !dayBlocked &&
    !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stadium || !token) return;
    setError("");

    if (!selectedSlot?.available || dayBlocked) {
      setError("اختر موعداً متاحاً");
      return;
    }

    const { start, end } = buildBookingRange(date, timeSlot);
    if (start < new Date()) {
      setError("لا يمكن الحجز في وقت ماضٍ");
      return;
    }

    setSubmitting(true);
    const res = await api("/bookings/manual", {
      method: "POST",
      token,
      body: JSON.stringify({
        stadiumId: stadium.id,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        guestName: guestName.trim(),
        guestPhone: guestPhone.trim() || undefined,
        notes: notes.trim() || undefined,
        status: "CONFIRMED",
      }),
    });
    setSubmitting(false);

    if (res.success) {
      showSnack(res.message ?? "تم إضافة الحجز");
      onOpenChange(false);
      onCreated?.();
      return;
    }

    setError(res.message ?? "تعذّر إضافة الحجز");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[min(90dvh,640px)] overflow-y-auto" dir="rtl">
        <DialogTitle className="sr-only">إضافة حجز يدوي</DialogTitle>
        <DialogHeader className="text-start space-y-1">
          <p className="font-display text-lg font-bold text-heading">إضافة حجز</p>
          <DialogDescription>
            سجّل حجزاً مباشرةً (هاتف، واتساب، أو زيارة) — يُحجب الموعد فوراً
          </DialogDescription>
        </DialogHeader>

        {loadingStadium ? (
          <div className="space-y-3 py-4">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        ) : !stadium ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            لا يوجد ملعب مرتبط بحسابك. سجّل ملعبك أولاً من صفحة الملعب.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div className="rounded-xl bg-secondary/50 px-3 py-2 text-xs text-muted-foreground">
              {stadium.name} · {formatPrice(estimatedPrice)} تقريباً للموعد المختار
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="manual-date" className="text-xs text-muted-foreground">
                التاريخ
              </Label>
              <DatePicker id="manual-date" value={date} onChange={setDate} minDate={minDate} />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-heading">
                الموعد ({formatCount(BOOKING_SLOT_MINUTES)} د)
              </Label>
              {loadingSlots ? (
                <Skeleton className="h-28 w-full rounded-lg" />
              ) : (
                <div
                  className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto p-0.5"
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
                          "rounded-lg border px-2 py-2 text-[11px] font-medium transition-all text-center leading-tight",
                          getSlotColorClasses(
                            {
                              available: slot.available,
                              reason: slot.reason as SlotReason | undefined,
                            },
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
              <div className="flex flex-wrap gap-2">
                {SLOT_LEGEND.map((item) => (
                  <span
                    key={item.key}
                    className="inline-flex items-center gap-1 text-[10px] text-muted-foreground"
                  >
                    <span className={cn("h-2 w-2 rounded-full shrink-0", item.className)} />
                    {item.label}
                  </span>
                ))}
              </div>
            </div>

            {dayBlocked && (
              <p className="text-sm text-destructive rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2">
                الملعب مغلق في هذا اليوم
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="guest-name" className="text-xs text-muted-foreground">
                  اسم اللاعب / الضيف
                </Label>
                <Input
                  id="guest-name"
                  className={ownerInputClass}
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="مثال: أحمد محمد"
                  required
                  minLength={2}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="guest-phone" className="text-xs text-muted-foreground">
                  رقم الهاتف (اختياري)
                </Label>
                <PhoneNumberInput
                  id="guest-phone"
                  value={guestPhone}
                  onChange={setGuestPhone}
                  className={ownerInputClass}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="manual-notes" className="text-xs text-muted-foreground">
                ملاحظات (اختياري)
              </Label>
              <textarea
                id="manual-notes"
                className="w-full min-h-[72px] rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-heading placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثال: حجز هاتفي — دفع نقداً"
                maxLength={500}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2">
                {error}
              </p>
            )}

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl h-11"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                إلغاء
              </Button>
              <Button type="submit" className="rounded-xl h-11" disabled={!canSubmit}>
                {submitting ? "جاري الحفظ..." : "تأكيد الحجز"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
