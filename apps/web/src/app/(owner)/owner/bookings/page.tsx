"use client";

import { useEffect, useState } from "react";
import { BOOKING_STATUS_FILTER_ALL, BOOKING_STATUS_FILTER_OPTIONS } from "@hazjak/constants";
import { formatPrice, formatDate, formatTime } from "@hazjak/utils";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import {
  OwnerBookingDetailDialog,
  OwnerBookingsCalendar,
} from "@/features/owner-bookings";
import { api } from "@/lib/api";
import { useAuthStore } from "@/features/auth/store/auth";

type BookingRow = {
  id: string;
  status: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  notes?: string | null;
  user: { firstName: string; lastName: string; email: string; phone?: string | null };
  stadium: { name: string };
};

const VIEW_OPTIONS = [
  { value: "calendar" as const, label: "تقويم" },
  { value: "list" as const, label: "قائمة" },
];

const STATUS_OPTIONS = BOOKING_STATUS_FILTER_OPTIONS.map((o) => ({
  value: o.value,
  label: o.label,
}));

export default function OwnerBookingsPage() {
  const { token } = useAuthStore();
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [filter, setFilter] = useState<string>(BOOKING_STATUS_FILTER_ALL);
  const [view, setView] = useState<"list" | "calendar">("calendar");
  const [loading, setLoading] = useState(true);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  function load() {
    const params = new URLSearchParams({ limit: view === "calendar" ? "100" : "30" });
    if (filter !== BOOKING_STATUS_FILTER_ALL) params.set("status", filter);
    setLoading(true);
    api<BookingRow[]>(`/bookings?${params}`, { token: token! })
      .then((r) => setBookings((r.data as BookingRow[]) ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, filter, view]);

  function openDetail(id: string) {
    setDetailId(id);
    setDetailOpen(true);
  }

  return (
    <>
      <PageHeader title="الحجوزات" description="اضغط على حجز لعرض التفاصيل" />

      <div className="flex flex-col gap-3 mb-6" >
        <SegmentedControl
          value={view}
          onChange={setView}
          options={VIEW_OPTIONS}
          aria-label="عرض الحجوزات"
          className="w-fit"
        />

        <SegmentedControl
          value={filter}
          onChange={setFilter}
          options={STATUS_OPTIONS}
          aria-label="فلتر الحالة"
          className="w-full sm:w-fit"
        />
      </div>

      {view === "calendar" ? (
        <OwnerBookingsCalendar
          bookings={bookings}
          loading={loading}
          onBookingClick={openDetail}
        />
      ) : loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState title="لا حجوزات" description="جرّب فلتراً آخر أو انتظر طلبات جديدة" />
      ) : (
        <ul className="space-y-3">
          {bookings.map((b) => (
            <li key={b.id}>
              <button
                type="button"
                className="w-full text-start"
                onClick={() => openDetail(b.id)}
              >
                <Card className="border-0 shadow-soft hover:shadow-card transition-shadow">
                  <CardContent className="p-4 flex flex-wrap justify-between gap-4">
                    <div className="min-w-0">
                      <StatusBadge status={b.status} />
                      <p className="font-bold text-heading mt-2">
                        {b.user.firstName} {b.user.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDate(b.startTime, { dateStyle: "medium" })} ·{" "}
                        {formatTime(b.startTime)} — {formatTime(b.endTime)}
                      </p>
                      <p className="text-sm font-bold text-primary mt-1">
                        {formatPrice(b.totalPrice)}
                      </p>
                    </div>
                    <span className="text-xs text-primary font-bold self-center">التفاصيل ←</span>
                  </CardContent>
                </Card>
              </button>
            </li>
          ))}
        </ul>
      )}

      <OwnerBookingDetailDialog
        bookingId={detailId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onUpdated={load}
      />
    </>
  );
}
