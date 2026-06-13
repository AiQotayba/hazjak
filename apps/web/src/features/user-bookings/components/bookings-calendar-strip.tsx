"use client";

import { useMemo } from "react";
import { formatDate } from "@hazjak/utils";
import { cn } from "@/lib/utils";

export interface CalendarBookingDay {
  id: string;
  startTime: string;
  status: string;
}

interface BookingsCalendarStripProps {
  bookings: CalendarBookingDay[];
  selectedDate: string | null;
  onSelectDate: (dateKey: string | null) => void;
}

function dateKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function BookingsCalendarStrip({
  bookings,
  selectedDate,
  onSelectDate,
}: BookingsCalendarStripProps) {
  const days = useMemo(() => {
    const map = new Map<
      string,
      { key: string; label: string; weekday: string; count: number; hasPending: boolean }
    >();

    for (let i = -2; i <= 12; i++) {
      const d = new Date();
      d.setHours(12, 0, 0, 0);
      d.setDate(d.getDate() + i);
      const key = dateKey(d.toISOString());
      map.set(key, {
        key,
        label: String(d.getDate()),
        weekday: formatDate(d, { weekday: "short" }),
        count: 0,
        hasPending: false,
      });
    }

    for (const b of bookings) {
      const key = dateKey(b.startTime);
      const entry = map.get(key);
      if (entry) {
        entry.count += 1;
        if (b.status === "PENDING" || b.status === "CONFIRMED") entry.hasPending = true;
      } else {
        const d = new Date(b.startTime);
        map.set(key, {
          key,
          label: String(d.getDate()),
          weekday: formatDate(d, { weekday: "short" }),
          count: 1,
          hasPending: b.status === "PENDING" || b.status === "CONFIRMED",
        });
      }
    }

    return Array.from(map.values());
  }, [bookings]);

  return (
    <div className="mb-5 -mx-1">
      <div className="flex items-center justify-between mb-2 px-1">
        <p className="text-sm font-bold text-heading">جدول الحجوزات</p>
        {selectedDate && (
          <button
            type="button"
            className="text-xs text-primary font-bold"
            onClick={() => onSelectDate(null)}
          >
            عرض الكل
          </button>
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {days.map((day) => {
          const isSelected = selectedDate === day.key;
          const isToday = day.key === dateKey(new Date().toISOString());
          return (
            <button
              key={day.key}
              type="button"
              onClick={() => onSelectDate(isSelected ? null : day.key)}
              className={cn(
                "flex shrink-0 flex-col items-center min-w-[52px] rounded-2xl px-2 py-2 transition-all shadow-soft",
                isSelected
                  ? "bg-primary text-primary-foreground shadow-card"
                  : "bg-card",
                isToday && !isSelected && "ring-2 ring-primary/30"
              )}
            >
              <span className="text-[10px] opacity-80">{day.weekday}</span>
              <span className="text-lg font-bold leading-none mt-0.5">{day.label}</span>
              {day.count > 0 && (
                <span
                  className={cn(
                    "mt-1 text-[10px] font-bold rounded-full px-1.5",
                    isSelected
                      ? "bg-primary-foreground/20"
                      : day.hasPending
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {day.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
