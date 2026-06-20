"use client";

import Link from "next/link";
import { ChevronLeft, Clock } from "lucide-react";
import { formatDate, formatPrice, formatTime } from "@hazjak/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/features/user-bookings/components/StatusBadge";
import type { BookingListItemData } from "@/features/user-bookings/components/booking-list-item";

interface ProfileRecentBookingsProps {
  bookings: BookingListItemData[];
  loading: boolean;
}

export function ProfileRecentBookings({ bookings, loading }: ProfileRecentBookingsProps) {
  if (loading) {
    return (
      <section className="space-y-3" aria-busy="true">
        <Skeleton className="h-4 w-24" />
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-16 rounded-2xl" />
        ))}
      </section>
    );
  }

  if (bookings.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 className="text-sm font-bold text-heading">آخر الحجوزات</h2>
        <Link
          href="/user/bookings"
          className="text-xs font-bold text-primary inline-flex items-center gap-0.5 hover:underline"
        >
          عرض الكل
          <ChevronLeft className="h-3.5 w-3.5" />
        </Link>
      </div>
      <ul className="space-y-2">
        {bookings.map((booking) => (
          <li key={booking.id}>
            <Link
              href={`/user/bookings?booking=${booking.id}`}
              className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-soft transition-all hover:shadow-card hover:ring-2 hover:ring-primary/15"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-display text-lg font-bold text-primary">
                {booking.stadium.name.trim().charAt(0) || "م"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-heading truncate">{booking.stadium.name}</p>
                  <StatusBadge status={booking.status} className="text-[9px] px-1.5 py-0 shrink-0" />
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 inline-flex items-center gap-1">
                  <Clock className="h-3 w-3 text-primary" />
                  {formatDate(booking.startTime)} · {formatTime(booking.startTime)}
                </p>
              </div>
              <p className="text-sm font-bold text-primary shrink-0">{formatPrice(booking.totalPrice)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
