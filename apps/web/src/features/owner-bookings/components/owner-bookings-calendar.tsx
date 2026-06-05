"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import { arSA } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatTime } from "@beeplay/utils";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type CalendarRangeMode = "day" | "three" | "week" | "month";

const MODE_OPTIONS = [
  { value: "day" as const, label: "يوم" },
  { value: "three" as const, label: "3 أيام" },
  { value: "week" as const, label: "أسبوع" },
  { value: "month" as const, label: "شهر" },
];

const MONTH_MAX_EVENTS = 3;

export interface OwnerCalendarBooking {
  id: string;
  status: string;
  startTime: string;
  endTime: string;
  user: { firstName: string; lastName: string };
}

const EVENT_STYLES: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-800 dark:text-amber-300",
  CONFIRMED: "bg-primary/15 text-primary",
  COMPLETED: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300",
  CANCELLED: "bg-muted text-muted-foreground",
  REJECTED: "bg-destructive/10 text-destructive",
  EXPIRED: "bg-secondary text-muted-foreground",
  NO_SHOW: "bg-secondary text-muted-foreground",
};

function dayKey(d: Date) {
  return format(d, "yyyy-MM-dd");
}

function formatDayNum(d: Date) {
  return new Intl.NumberFormat("ar-SY", { numberingSystem: "latn" }).format(d.getDate());
}

function getVisibleDays(mode: CalendarRangeMode, anchor: Date) {
  const a = startOfDay(anchor);

  switch (mode) {
    case "day":
      return [a];
    case "three":
      return [0, 1, 2].map((i) => addDays(a, i));
    case "week":
      return eachDayOfInterval({
        start: startOfWeek(a, { locale: arSA }),
        end: endOfWeek(a, { locale: arSA }),
      });
    case "month":
      return eachDayOfInterval({
        start: startOfWeek(startOfMonth(a), { locale: arSA }),
        end: endOfWeek(endOfMonth(a), { locale: arSA }),
      });
  }
}

function getPeriodLabels(mode: CalendarRangeMode, anchor: Date) {
  const a = startOfDay(anchor);

  switch (mode) {
    case "day":
      return {
        title: format(a, "EEEE d MMMM yyyy", { locale: arSA }),
        subtitle: isToday(a) ? "اليوم" : format(a, "d MMM yyyy", { locale: arSA }),
      };
    case "three": {
      const end = addDays(a, 2);
      return {
        title: `${format(a, "d MMM", { locale: arSA })} – ${format(end, "d MMM yyyy", { locale: arSA })}`,
        subtitle: "3 أيام",
      };
    }
    case "week": {
      const start = startOfWeek(a, { locale: arSA });
      const end = endOfWeek(a, { locale: arSA });
      return {
        title: `${format(start, "d MMM", { locale: arSA })} – ${format(end, "d MMM yyyy", { locale: arSA })}`,
        subtitle: "أسبوع",
      };
    }
    case "month":
      return {
        title: format(startOfMonth(a), "MMMM yyyy", { locale: arSA }),
        subtitle: `${format(startOfMonth(a), "d MMM", { locale: arSA })} – ${format(endOfMonth(a), "d MMM yyyy", { locale: arSA })}`,
      };
  }
}

interface OwnerBookingsCalendarProps {
  bookings: OwnerCalendarBooking[];
  loading?: boolean;
  onBookingClick: (id: string) => void;
}

export function OwnerBookingsCalendar({
  bookings,
  loading,
  onBookingClick,
}: OwnerBookingsCalendarProps) {
  const [mode, setMode] = useState<CalendarRangeMode>("week");
  const [anchor, setAnchor] = useState(() => startOfDay(new Date()));

  const visibleDays = useMemo(() => getVisibleDays(mode, anchor), [mode, anchor]);
  const { title, subtitle } = useMemo(() => getPeriodLabels(mode, anchor), [mode, anchor]);

  const weekdayLabels = useMemo(() => {
    const weekStart = startOfWeek(anchor, { locale: arSA });
    return Array.from({ length: 7 }, (_, i) =>
      format(addDays(weekStart, i), "EEEEEE", { locale: arSA })
    );
  }, [anchor]);

  const bookingsByDay = useMemo(() => {
    const map = new Map<string, OwnerCalendarBooking[]>();
    for (const b of bookings) {
      const key = b.startTime.slice(0, 10);
      const list = map.get(key) ?? [];
      list.push(b);
      map.set(key, list.sort((a, b) => a.startTime.localeCompare(b.startTime)));
    }
    return map;
  }, [bookings]);

  function goPrev() {
    setAnchor((a) => {
      switch (mode) {
        case "day":
          return subDays(a, 1);
        case "three":
          return subDays(a, 3);
        case "week":
          return subWeeks(a, 1);
        case "month":
          return subMonths(startOfMonth(a), 1);
      }
    });
  }

  function goNext() {
    setAnchor((a) => {
      switch (mode) {
        case "day":
          return addDays(a, 1);
        case "three":
          return addDays(a, 3);
        case "week":
          return addWeeks(a, 1);
        case "month":
          return addMonths(startOfMonth(a), 1);
      }
    });
  }

  function goToday() {
    setAnchor(mode === "month" ? startOfMonth(new Date()) : startOfDay(new Date()));
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-border/40 bg-card shadow-soft overflow-hidden">
        <div className="p-4 border-b border-border/40 space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-6 w-full max-w-sm" />
        </div>
        <Skeleton className="h-[360px] w-full rounded-none" />
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border/40 bg-card shadow-soft overflow-hidden">
      <div className="p-4 border-b border-border/40 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-base sm:text-lg font-bold text-heading leading-snug">
              {title}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          </div>
          <CalendarNav onPrev={goPrev} onToday={goToday} onNext={goNext} />
        </div>

        <SegmentedControl
          value={mode}
          onChange={setMode}
          options={MODE_OPTIONS}
          aria-label="نطاق التقويم"
          className="w-full sm:w-fit"
        />
      </div>

      {mode === "month" ? (
        <MonthGrid
          month={startOfMonth(anchor)}
          days={visibleDays}
          weekdayLabels={weekdayLabels}
          bookingsByDay={bookingsByDay}
          onBookingClick={onBookingClick}
        />
      ) : mode === "day" ? (
        <DayPanel
          day={visibleDays[0]}
          bookings={bookingsByDay.get(dayKey(visibleDays[0])) ?? []}
          onBookingClick={onBookingClick}
        />
      ) : (
        <RangeGrid
          mode={mode}
          days={visibleDays}
          bookingsByDay={bookingsByDay}
          onBookingClick={onBookingClick}
        />
      )}
    </div>
  );
}

function addWeeks(d: Date, weeks: number) {
  return addDays(d, weeks * 7);
}

function CalendarNav({
  onPrev,
  onToday,
  onNext,
}: {
  onPrev: () => void;
  onToday: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center gap-1 shrink-0">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-8 rounded-lg border-0 bg-secondary/60 shadow-none"
        onClick={onPrev}
        aria-label="السابق"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 rounded-lg border-0 bg-secondary/60 shadow-none text-xs font-bold px-3"
        onClick={onToday}
      >
        اليوم
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-8 rounded-lg border-0 bg-secondary/60 shadow-none"
        onClick={onNext}
        aria-label="التالي"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
    </div>
  );
}

function BookingEventPill({
  booking,
  compact,
  onClick,
}: {
  booking: OwnerCalendarBooking;
  compact?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-start rounded-md transition-opacity hover:opacity-80",
        compact ? "px-1.5 py-0.5 text-[10px] font-medium truncate" : "px-3 py-2 text-xs font-medium",
        EVENT_STYLES[booking.status] ?? "bg-secondary text-heading"
      )}
    >
      <span className="opacity-80" dir="ltr">
        {formatTime(booking.startTime)}
      </span>
      {!compact && " — "}
      {compact ? " " : null}
      {booking.user.firstName} {booking.user.lastName}
    </button>
  );
}

function DayPanel({
  day,
  bookings,
  onBookingClick,
}: {
  day: Date;
  bookings: OwnerCalendarBooking[];
  onBookingClick: (id: string) => void;
}) {
  const today = isToday(day);

  return (
    <div className="p-4 min-h-[280px]">
      <div className="flex items-center gap-2 mb-4">
        <span
          className={cn(
            "inline-flex size-8 items-center justify-center rounded-full text-sm font-bold",
            today ? "bg-heading text-white" : "bg-secondary text-heading"
          )}
        >
          {formatDayNum(day)}
        </span>
        <span className="text-sm font-bold text-heading">
          {format(day, "EEEE", { locale: arSA })}
        </span>
      </div>

      {bookings.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10">لا حجوزات في هذا اليوم</p>
      ) : (
        <ul className="space-y-2">
          {bookings.map((b) => (
            <li key={b.id}>
              <BookingEventPill
                booking={b}
                onClick={() => onBookingClick(b.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RangeGrid({
  mode,
  days,
  bookingsByDay,
  onBookingClick,
}: {
  mode: "three" | "week";
  days: Date[];
  bookingsByDay: Map<string, OwnerCalendarBooking[]>;
  onBookingClick: (id: string) => void;
}) {
  const isWeek = mode === "week";

  const grid = (
    <>
      {days.map((day) => {
        const key = dayKey(day);
        const dayBookings = bookingsByDay.get(key) ?? [];
        const today = isToday(day);

        return (
          <div
            key={key}
            className={cn(
              "border-e border-border/30 p-2 flex flex-col gap-1",
              isWeek
                ? "w-[calc((100vw-2.5rem)/3)] sm:w-auto shrink-0 snap-start sm:shrink"
                : "min-w-0"
            )}
          >
            <div className="text-center mb-1 pb-1 border-b border-border/30">
              <p className="text-[10px] font-bold text-muted-foreground">
                {format(day, "EEEEEE", { locale: arSA })}
              </p>
              <span
                className={cn(
                  "inline-flex size-7 items-center justify-center rounded-full text-xs font-bold mt-0.5",
                  today ? "bg-heading text-white" : "text-heading"
                )}
              >
                {formatDayNum(day)}
              </span>
            </div>

            <div className="flex flex-col gap-1 flex-1 overflow-y-auto max-h-[280px]">
              {dayBookings.length === 0 ? (
                <p className="text-[10px] text-muted-foreground text-center py-4">—</p>
              ) : (
                dayBookings.map((b) => (
                  <BookingEventPill
                    key={b.id}
                    booking={b}
                    compact
                    onClick={() => onBookingClick(b.id)}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </>
  );

  if (isWeek) {
    return (
      <div className="overflow-x-auto snap-x snap-mandatory sm:overflow-visible min-h-[320px]">
        <div className="flex sm:grid sm:grid-cols-7 min-w-0 sm:min-h-[320px]">
          {grid}
        </div>
      </div>
    );
  }

  return <div className="grid grid-cols-3 min-h-[320px]">{grid}</div>;
}

function MonthGrid({
  month,
  days,
  weekdayLabels,
  bookingsByDay,
  onBookingClick,
}: {
  month: Date;
  days: Date[];
  weekdayLabels: string[];
  bookingsByDay: Map<string, OwnerCalendarBooking[]>;
  onBookingClick: (id: string) => void;
}) {
  return (
    <>
      <div className="grid grid-cols-7 border-b border-border/40 bg-section-alt/50">
        {weekdayLabels.map((label) => (
          <div
            key={label}
            className="py-2 text-center text-[11px] font-bold text-muted-foreground"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-fr min-h-[380px]">
        {days.map((day) => {
          const key = dayKey(day);
          const dayBookings = bookingsByDay.get(key) ?? [];
          const inMonth = isSameMonth(day, month);
          const today = isToday(day);
          const hidden = Math.max(0, dayBookings.length - MONTH_MAX_EVENTS);

          return (
            <div
              key={key}
              className={cn(
                "min-h-[72px] sm:min-h-[88px] border-e border-b border-border/30 p-1 sm:p-1.5 flex flex-col gap-0.5",
                !inMonth && "bg-muted/20"
              )}
            >
              <span
                className={cn(
                  "inline-flex size-5 sm:size-6 items-center justify-center rounded-full text-[10px] sm:text-[11px] font-bold self-start",
                  today && "bg-heading text-white",
                  !today && inMonth && "text-heading",
                  !inMonth && "text-muted-foreground/50"
                )}
              >
                {formatDayNum(day)}
              </span>

              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                {dayBookings.slice(0, MONTH_MAX_EVENTS).map((b) => (
                  <BookingEventPill
                    key={b.id}
                    booking={b}
                    compact
                    onClick={() => onBookingClick(b.id)}
                  />
                ))}
                {hidden > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const first = dayBookings[MONTH_MAX_EVENTS];
                      if (first) onBookingClick(first.id);
                    }}
                    className="text-[10px] font-bold text-primary text-start px-1 hover:underline"
                  >
                    +{hidden}...
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
