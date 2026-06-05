"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingsFilters } from "@/features/user-bookings/components/bookings-filters";
import { BookingListItem } from "@/features/user-bookings/components/booking-list-item";
import { BookingDetailDialog } from "@/features/user-bookings/components/booking-detail-dialog";
import { UserBookingsHero } from "@/features/user-bookings/components/user-bookings-hero";
import { ARCHIVED_BOOKING_STATUSES } from "@/features/user-bookings/lib/user-bookings";
import {
  useUserBookingsQuery,
  useUserBookingsUpcomingCount,
} from "@/features/user-bookings/hooks/use-user-bookings-query";
import { useAuthStore } from "@/features/auth/store/auth";

function UserBookingsContent() {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const status = searchParams.get("status") ?? "";
  const search = searchParams.get("search") ?? "";
  const bookingId = searchParams.get("booking");

  const { data, isLoading, isFetching } = useUserBookingsQuery({ status, search });
  const { data: upcomingCount = 0 } = useUserBookingsUpcomingCount();

  useEffect(() => {
    if (!token) router.push("/login");
  }, [token, router]);

  const bookings = data?.bookings ?? [];
  const loading = isLoading || isFetching;

  const isArchived = (s: string) =>
    (ARCHIVED_BOOKING_STATUSES as readonly string[]).includes(s);
  const upcoming = bookings.filter((b) => !isArchived(b.status));
  const past = bookings.filter((b) => isArchived(b.status));

  function openDetail(id: string) {
    const next = new URLSearchParams(searchParams.toString());
    next.set("booking", id);
    router.replace(`/user/bookings?${next.toString()}`, { scroll: false });
  }

  function handleDetailOpenChange(open: boolean) {
    if (open || !bookingId) return;
    const next = new URLSearchParams(searchParams.toString());
    next.delete("booking");
    const qs = next.toString();
    router.replace(qs ? `/user/bookings?${qs}` : "/user/bookings", { scroll: false });
  }

  function handleCancelled() {
    queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
  }

  return (
    <>
      <UserBookingsHero firstName={user?.firstName} upcomingCount={upcomingCount} />
      <BookingsFilters />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[168px] rounded-2xl" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState
          title="لا توجد حجوزات"
          description="جرّب فلتراً آخر أو احجز ملعبك القادم"
          actionLabel="تصفح الملاعب"
          actionHref="/stadiums"
        />
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <section>
              <p className="text-xs font-bold text-primary mb-2">قادمة</p>
              <ul className="space-y-3">
                {upcoming.map((b) => (
                  <li key={b.id}>
                    <BookingListItem booking={b} onPress={() => openDetail(b.id)} />
                  </li>
                ))}
              </ul>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <p className="text-xs font-bold text-muted-foreground mb-2">سابقة</p>
              <ul className="space-y-3">
                {past.map((b) => (
                  <li key={b.id}>
                    <BookingListItem booking={b} onPress={() => openDetail(b.id)} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      <BookingDetailDialog
        bookingId={bookingId}
        open={!!bookingId}
        onOpenChange={handleDetailOpenChange}
        onCancelled={handleCancelled}
      />
    </>
  );
}

export default function UserBookingsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-3">
          <Skeleton className="h-28 rounded-3xl" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[168px] rounded-2xl" />
          ))}
        </div>
      }
    >
      <UserBookingsContent />
    </Suspense>
  );
}
