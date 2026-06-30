"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { BOOKING_STATUS_FILTER_ALL, BOOKING_STATUS_FILTER_OPTIONS } from "@hazjak/constants";
import { formatPrice, formatDate, formatTime } from "@hazjak/utils";
import { getOwnerBookingDepositHint } from "@/features/user-bookings/lib/user-bookings";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import {
  OwnerBookingDetailDialog,
  OwnerBookingsCalendar,
  CreateOwnerManualBookingDialog,
  getBookingPlayerLabel,
  isManualBooking,
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
  guestName?: string | null;
  guestPhone?: string | null;
  depositAmount?: number | null;
  depositReferenceCode?: string | null;
  depositPaidAt?: string | null;
  user: { firstName: string; lastName: string; phone: string };
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("booking");
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [filter, setFilter] = useState<string>(BOOKING_STATUS_FILTER_ALL);
  const [view, setView] = useState<"list" | "calendar">("calendar");
  const [loading, setLoading] = useState(true);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

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
    const next = new URLSearchParams(searchParams.toString());
    next.set("booking", id);
    router.replace(`/owner/bookings?${next.toString()}`, { scroll: false });
  }

  function closeDetail(open: boolean) {
    setDetailOpen(open);
    if (open) return;
    setDetailId(null);
    const next = new URLSearchParams(searchParams.toString());
    next.delete("booking");
    const qs = next.toString();
    router.replace(qs ? `/owner/bookings?${qs}` : "/owner/bookings", { scroll: false });
  }

  useEffect(() => {
    if (!bookingId) return;
    setDetailId(bookingId);
    setDetailOpen(true);
  }, [bookingId]);

  useEffect(() => {
    if (searchParams.get("create") === "1") {
      setCreateOpen(true);
      const next = new URLSearchParams(searchParams.toString());
      next.delete("create");
      const qs = next.toString();
      router.replace(qs ? `/owner/bookings?${qs}` : "/owner/bookings", { scroll: false });
    }
  }, [searchParams, router]);

  return (
    <>
      <PageHeader
        title="الحجوزات"
        description="اضغط على حجز لعرض التفاصيل، أو أضف حجزاً يدوياً"
      />

      <div className="flex flex-col gap-3 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <SegmentedControl
            value={view}
            onChange={setView}
            options={VIEW_OPTIONS}
            aria-label="عرض الحجوزات"
            className="w-full sm:w-fit"
          />

          <Button
            type="button"
            className="rounded-xl h-11 gap-2 w-full sm:w-auto shrink-0"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
            إضافة حجز
          </Button>
        </div>

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
        <EmptyState
          title="لا حجوزات"
          description="أضف حجزاً يدوياً أو جرّب فلتراً آخر"
          actionLabel="إضافة حجز"
          onAction={() => setCreateOpen(true)}
        />
      ) : (
        <ul className="space-y-3">
          {bookings.map((b) => {
            const depositHint = getOwnerBookingDepositHint(b);
            return (
            <li key={b.id}>
              <button
                type="button"
                className="w-full text-start"
                onClick={() => openDetail(b.id)}
              >
                <Card className="border-0 shadow-soft hover:shadow-card transition-shadow">
                  <CardContent className="p-4 flex flex-wrap justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge
                          status={b.status}
                          endTime={b.endTime}
                          depositReferenceCode={b.depositReferenceCode}
                          depositPaidAt={b.depositPaidAt}
                        />
                        {depositHint && (
                          <span className="text-[10px] font-bold rounded-md bg-accent-gold/20 text-heading px-2 py-0.5">
                            {depositHint}
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-heading mt-2">
                        {getBookingPlayerLabel(b)}
                        {isManualBooking(b) && (
                          <span className="ms-1.5 text-[10px] font-bold text-muted-foreground">
                            (يدوي)
                          </span>
                        )}
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
            );
          })}
        </ul>
      )}

      <CreateOwnerManualBookingDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={load}
      />

      <OwnerBookingDetailDialog
        bookingId={detailId}
        open={detailOpen}
        onOpenChange={closeDetail}
        onUpdated={load}
      />
    </>
  );
}
