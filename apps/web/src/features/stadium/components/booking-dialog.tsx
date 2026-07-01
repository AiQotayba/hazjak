"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock, LogIn, Timer, TimerIcon, Wallet } from "lucide-react";
import { formatHHMM12, formatPrice } from "@hazjak/utils";
import type { AuthUser } from "@hazjak/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useSnackbar } from "@/components/ui/snackbar";
import {
  applyPastSlotAvailability,
  BOOKING_SLOT_MINUTES,
  buildBookingRange,
  formatBookingDate,
  getBookingTimeSlots,
  getEstimatedPrice,
  localDateInputValue,
} from "@/lib/booking-slots";
import { getSlotColorClasses, SLOT_LEGEND, type SlotReason } from "@/lib/slot-colors";
import { cn } from "@/lib/utils";

const FALLBACK_SLOTS = getBookingTimeSlots();

type BookingStep = 1 | 2;

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
  const showSnack = useSnackbar((s) => s.show);
  const minDate = useMemo(() => localDateInputValue(), []);

  const [date, setDate] = useState(minDate);
  const [timeSlot, setTimeSlot] = useState(FALLBACK_SLOTS[4]?.value ?? FALLBACK_SLOTS[0]?.value ?? "16:00");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [slotError, setSlotError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [daySlots, setDaySlots] = useState<DaySlot[]>(FALLBACK_SLOTS.map((s) => ({ ...s, available: true })));
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [dayBlocked, setDayBlocked] = useState(false);
  const [step, setStep] = useState<BookingStep>(1);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!open) return;
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, [open, date]);

  const effectiveDaySlots = useMemo(
    () => applyPastSlotAvailability(daySlots, date, now),
    [daySlots, date, now]
  );

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
          const slots = applyPastSlotAvailability(res.data.slots, date);
          const firstAvailable = slots.find((s) => s.available);
          if (firstAvailable) setTimeSlot(firstAvailable.value);
        }
      })
      .finally(() => setLoadingSlots(false));
  }, [open, stadium.id, date]);

  useEffect(() => {
    const selected = effectiveDaySlots.find((s) => s.value === timeSlot);
    if (selected?.available) return;
    const firstAvailable = effectiveDaySlots.find((s) => s.available);
    if (firstAvailable) setTimeSlot(firstAvailable.value);
  }, [effectiveDaySlots, timeSlot]);

  const estimatedPrice = useMemo(
    () => getEstimatedPrice(stadium.morningPrice, stadium.eveningPrice, date, timeSlot),
    [stadium.morningPrice, stadium.eveningPrice, date, timeSlot]
  );

  const selectedSlot = effectiveDaySlots.find((s) => s.value === timeSlot);
  const selectedSlotLabel = selectedSlot?.label ?? formatHHMM12(timeSlot);

  function validateSlotSelection(): string | null {
    if (!date || !timeSlot) return "اختر التاريخ والتوقيت";
    if (!selectedSlot?.available) return "هذا الموعد غير متاح — اختر وقتاً آخر";
    if (dayBlocked) return "الملعب مغلق في هذا اليوم — اختر تاريخاً آخر";

    const { start } = buildBookingRange(date, timeSlot);
    if (start < new Date()) return "لا يمكن الحجز في وقت ماضٍ";

    return null;
  }

  function handleContinue() {
    setSlotError("");
    const validationError = validateSlotSelection();
    if (validationError) {
      setSlotError(validationError);
      return;
    }
    setSubmitError("");
    setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");

    if (!token || !user) {
      router.push(`/login?next=/stadiums/${encodeURIComponent(stadium.slug)}`);
      return;
    }

    if (!user.isPhoneVerified) {
      router.push("/verify-email");
      return;
    }

    const validationError = validateSlotSelection();
    if (validationError) {
      setSlotError(validationError);
      setStep(1);
      return;
    }

    const { start, end } = buildBookingRange(date, timeSlot);
    setSubmitting(true);
    const res = await api<{ id: string }>("/bookings", {
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

    if (res.success && res.data?.id) {
      onOpenChange(false);
      showSnack(res.message ?? "تم إرسال طلب الحجز");
      window.setTimeout(() => {
        router.push(`/user/bookings?booking=${res.data!.id}`);
      }, 1400);
      return;
    }

    showSnack(res.message ?? "تعذّر إرسال الطلب", "error");
    setSubmitError(res.message ?? "تعذّر إرسال الطلب");
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setSlotError("");
      setSubmitError("");
      setStep(1);
    }
    onOpenChange(next);
  }

  function handleBack() {
    setSubmitError("");
    setStep(1);
  }

  const stepTitle = step === 1 ? "اختيار الموعد" : "تأكيد التفاصيل";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="flex w-[calc(100%-2rem)] max-h-[min(calc(100dvh-2rem),720px)] flex-col gap-0 overflow-hidden border-0 bg-transparent p-3 shadow-none sm:max-w-lg"
        dir="rtl"
      >
        <div className="flex min-h-0 max-h-[min(calc(100dvh-2rem-1.5rem),696px)] flex-col overflow-hidden rounded-2xl bg-card shadow-card">
          {!token || !user ? (
            <>
              <DialogHeader className="shrink-0 space-y-1 border-b border-border/50 p-5 pb-4 text-start">
                <DialogTitle className="text-xl font-bold text-heading">تفاصيل الحجز</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  {stadium.name}
                </DialogDescription>
              </DialogHeader>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">
                <LoginPrompt
                  onLogin={() =>
                    router.push(`/login?next=/stadiums/${encodeURIComponent(stadium.slug)}`)
                  }
                />
              </div>
            </>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col">
              <DialogHeader className="shrink-0 space-y-2 border-b border-border/50 p-5 pb-4 text-start">
                <div className="space-y-1">
                  <DialogTitle className="text-xl font-bold text-heading">{stepTitle}</DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    {stadium.name}
                  </DialogDescription>
                </div>
                <BookingStepIndicator step={step} />
              </DialogHeader>

              {step === 1 ? (
                <>
                  <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                    <div className="space-y-4 p-5">
                      <div>
                        <Label htmlFor="booking-date" className="mb-1.5 block text-xs text-muted-foreground">
                          التاريخ
                        </Label>
                        <DatePicker
                          id="booking-date"
                          value={date}
                          onChange={(value) => {
                            setSlotError("");
                            setDate(value);
                          }}
                          minDate={minDate}
                        />
                      </div>

                      <div className="space-y-2 rounded-2xl bg-secondary/30 px-4 py-3">
                        <Label className="text-xs font-bold text-heading">
                          اختيار الموعد ({formatCount(BOOKING_SLOT_MINUTES)} د)
                        </Label>

                        {loadingSlots ? (
                          <BookingSlotsSkeleton />
                        ) : (
                          <div
                            className="grid grid-cols-2 gap-1.5 p-0.5 sm:grid-cols-3 lg:grid-cols-4"
                            role="listbox"
                            aria-label="توقيت الحجز"
                          >
                            {effectiveDaySlots.map((slot) => {
                              const isSelected = timeSlot === slot.value;
                              const isBookable = slot.available && !dayBlocked;
                              return (
                                <button
                                  key={slot.value}
                                  type="button"
                                  role="option"
                                  aria-selected={isSelected}
                                  disabled={!isBookable}
                                  onClick={() => {
                                    if (!isBookable) return;
                                    setSlotError("");
                                    setTimeSlot(slot.value);
                                  }}
                                  className={cn(
                                    "flex items-center justify-start gap-1 rounded-lg border px-2 py-2.5 text-start text-[11px] font-medium leading-tight transition-all",
                                    getSlotColorClasses(
                                      {
                                        available: slot.available,
                                        reason: slot.reason as SlotReason | undefined,
                                      },
                                      isSelected
                                    )
                                  )}
                                >
                                  <TimerIcon
                                    className={cn("mx-1 h-3 w-3", isSelected ? "text-primary" : "")}
                                    aria-hidden
                                  />
                                  {slot.label}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        <div className="flex flex-wrap gap-3 pt-0.5">
                          {SLOT_LEGEND.map((item) => (
                            <span
                              key={item.key}
                              className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground"
                            >
                              <span className={cn("h-2 w-2 shrink-0 rounded-full", item.className)} />
                              {item.label}
                            </span>
                          ))}
                        </div>
                      </div>

                      {dayBlocked && (
                        <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                          الملعب مغلق في هذا اليوم — اختر تاريخاً آخر
                        </p>
                      )}

                      {slotError && (
                        <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                          {slotError}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 border-t border-border/60 bg-card px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-12 w-full rounded-xl text-base font-bold"
                      disabled={loadingSlots || dayBlocked || !selectedSlot?.available}
                      onClick={handleContinue}
                    >
                      متابعة
                    </Button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                  <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                    <div className="space-y-4 p-5">
                      <SelectedSlotSummary date={date} slotLabel={selectedSlotLabel} />

                      <div className="space-y-1.5">
                        <Label htmlFor="booking-notes" className="text-xs text-muted-foreground">
                          ملاحظات (مباراة ودية، عدد اللاعبين...)
                        </Label>
                        <textarea
                          id="booking-notes"
                          className="min-h-[88px] w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-heading placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="مثال: مباراة ودية 7 ضد 7"
                          maxLength={500}
                        />
                      </div>

                      <PriceSummary
                        estimatedPrice={estimatedPrice}
                        depositAmount={stadium.depositAmount}
                        durationLabel={`${formatCount(BOOKING_SLOT_MINUTES)} دقيقة`}
                        slotLabel={selectedSlotLabel}
                      />

                      {submitError && (
                        <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                          {submitError}
                        </p>
                      )}
                    </div>
                  </div>

                  <DialogFooter className="shrink-0 border-t border-border/60 bg-card px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                    <div className="flex w-full items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 shrink-0 rounded-xl px-4 text-base font-semibold"
                        onClick={handleBack}
                        disabled={submitting}
                      >
                        السابق
                      </Button>
                      <Button
                        type="submit"
                        className="h-12 min-h-12 flex-1 rounded-xl text-base font-bold shadow-soft"
                        disabled={submitting}
                      >
                        {submitting ? "جاري الإرسال..." : "تأكيد الطلب"}
                      </Button>
                    </div>
                  </DialogFooter>
                </form>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BookingStepIndicator({ step }: { step: BookingStep }) {
  return (
    <div className="flex items-center gap-2" aria-label={`الخطوة ${formatCount(step)} من ٢`}>
      <span
        className={cn(
          "h-1.5 flex-1 rounded-full transition-colors",
          step >= 1 ? "bg-primary" : "bg-muted"
        )}
      />
      <span
        className={cn(
          "h-1.5 flex-1 rounded-full transition-colors",
          step >= 2 ? "bg-primary" : "bg-muted"
        )}
      />
    </div>
  );
}

function SelectedSlotSummary({ date, slotLabel }: { date: string; slotLabel: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-secondary/30 px-4 py-3 space-y-2">
      <p className="text-xs font-bold text-heading">الموعد المختار</p>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5 text-primary" aria-hidden />
          {formatBookingDate(date)}
        </span>
        <span className="inline-flex items-center gap-1.5" dir="ltr">
          <Clock className="h-3.5 w-3.5 text-primary" aria-hidden />
          {slotLabel}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Timer className="h-3.5 w-3.5 text-primary" aria-hidden />
          {formatCount(BOOKING_SLOT_MINUTES)} دقيقة
        </span>
      </div>
    </div>
  );
}

function BookingSlotsSkeleton() {
  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 p-1"
      aria-busy="true"
      aria-label="جاري تحميل المواعيد"
    >
      {FALLBACK_SLOTS.map((slot) => (
        <Skeleton key={slot.value} className="h-11 w-full rounded-lg" />
      ))}
    </div>
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
