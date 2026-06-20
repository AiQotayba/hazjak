"use client";
import Link from "next/link";
import {
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  CircleDollarSign,
  Clock,
  MapPin,
  XCircle,
} from "lucide-react";
import { formatDate, formatPrice, formatTime } from "@hazjak/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { BookingStats } from "@/features/user-bookings/lib/user-bookings";
import { cn } from "@/lib/utils";

interface ProfileBookingStatsProps {
  stats: BookingStats | null;
  loading: boolean;
}

export function ProfileBookingStats({ stats, loading }: ProfileBookingStatsProps) {
  if (loading) {
    return (
      <section className="mb-4 space-y-3" aria-busy="true">
        <Skeleton className="h-4 w-28" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[72px] rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-20 rounded-2xl" />
      </section>
    );
  }

  if (!stats) return null;

  const tiles = [
    {
      label: "إجمالي الحجوزات",
      value: stats.total,
      icon: CalendarDays,
      accent: "text-primary bg-primary/10",
    },
    {
      label: "قادمة",
      value: stats.upcoming,
      icon: CalendarClock,
      accent: "text-primary bg-primary/10",
    },
    {
      label: "مكتملة",
      value: stats.completed,
      icon: CalendarCheck,
      accent: "text-accent-gold bg-accent-gold/15",
    },
    {
      label: "ملغاة",
      value: stats.cancelled,
      icon: XCircle,
      accent: "text-muted-foreground bg-muted",
    },
  ];

  return (
    <section className="mb-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <h2 className="text-sm font-bold text-heading">إحصائيات الحجوزات</h2>
        <Link
          href="/user/bookings"
          className="text-xs font-bold text-primary inline-flex items-center gap-0.5 hover:underline"
        >
          عرض الكل
          <ChevronLeft className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {tiles.map((tile) => (
          <StatTile key={tile.label} {...tile} />
        ))}
      </div>
      {(stats.pending > 0 || stats.confirmed > 0 || stats.totalSpent > 0) && (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {stats.pending > 0 && (
            <li className="text-[10px] font-medium rounded-full bg-accent px-2 py-0.5 text-accent-foreground">
              {stats.pending} بانتظار التأكيد
            </li>
          )}
          {stats.confirmed > 0 && (
            <li className="text-[10px] font-medium rounded-full bg-primary/15 px-2 py-0.5 text-primary">
              {stats.confirmed} مؤكدة
            </li>
          )}
          {stats.totalSpent > 0 && (
            <li className="text-[10px] font-medium rounded-full bg-section-alt px-2 py-0.5 text-muted-foreground inline-flex items-center gap-1">
              <CircleDollarSign className="h-3 w-3 text-primary" />
              أنفقت {formatPrice(stats.totalSpent)} على مباريات مكتملة
            </li>
          )}
        </ul>
      )}
      {stats.nextBooking ? (
        <Link
          href={`/user/bookings?booking=${stats.nextBooking.id}`}
          className="mt-3 block rounded-2xl border border-primary/15 bg-gradient-to-l from-primary/10 to-section-alt p-4 shadow-soft transition-all hover:shadow-card hover:border-primary/30"
        >
          <p className="text-[10px] font-bold text-primary mb-1.5">أقرب حجز لك</p>
          <p className="text-base font-bold text-heading truncate">{stats.nextBooking.stadium.name}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3 text-primary" />
              {formatDate(stats.nextBooking.startTime)} · {formatTime(stats.nextBooking.startTime)}
            </span>
            {(stats.nextBooking.stadium.area || stats.nextBooking.stadium.city) && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3 text-primary" />
                {[stats.nextBooking.stadium.area, stats.nextBooking.stadium.city].filter(Boolean).join("، ")}
              </span>
            )}
          </p>
        </Link>
      ) : stats.total === 0 ? (
        <p className="mt-3 text-center text-xs text-muted-foreground rounded-2xl bg-section-alt py-4 px-3">
          لم تحجز بعد، اكتشف الملاعب وابدأ أول مباراة لك
        </p>
      ) : null}
    </section>
  );
}

function StatTile({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}) {
  return (
    <div className="rounded-2xl bg-card p-3 md:p-4 shadow-soft border border-border/40 transition-all hover:shadow-card hover:border-primary/15">
      <div className={cn("inline-flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-xl mb-2", accent)}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="font-display text-2xl font-bold text-heading leading-none">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
