"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { BookingsFilters } from "@/features/user-bookings/components/bookings-filters";
import { BookingListItem } from "@/features/user-bookings/components/booking-list-item";
import { UserBookingsPageSkeleton } from "@/features/user-bookings/components/booking-list-item-skeleton";
import { BookingDetailDialog } from "@/features/user-bookings/components/booking-detail-dialog";
import { UserBookingsHero } from "@/features/user-bookings/components/user-bookings-hero";
import { isAwaitingDeposit, isBookingArchived, sortUpcomingBookings } from "@/features/user-bookings/lib/user-bookings";
import { useUserBookingsQuery, useUserBookingsUpcomingCount } from "@/features/user-bookings/hooks/use-user-bookings-query";
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

  const isArchived = (b: (typeof bookings)[number]) => isBookingArchived(b);
  const upcoming = sortUpcomingBookings(bookings.filter((b) => !isArchived(b)));
  const past = bookings.filter((b) => isArchived(b));

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

  function handleBookingsChange() {
    queryClient.invalidateQueries({ queryKey: ["user-bookings"] });
  }

  const depositDueCount = upcoming.filter((b) => isAwaitingDeposit(b)).length;
  const [pastExpanded, setPastExpanded] = useState(false);
  const hasUpcoming = upcoming.length > 0;
  const hasPast = past.length > 0;
  const pastCollapsed = hasUpcoming && hasPast && !pastExpanded;

  useEffect(() => {
    if (!hasUpcoming) setPastExpanded(true);
    else setPastExpanded(false);
  }, [hasUpcoming]);

  return (
    <>
      <UserBookingsHero firstName={user?.firstName} upcomingCount={upcomingCount} />
      {depositDueCount > 0 && (
        <p className="mb-4 rounded-2xl border border-accent-gold/40 bg-accent/40 px-4 py-3 text-sm text-heading leading-relaxed">
          لديك {depositDueCount === 1 ? "حجز يحتاج" : `${depositDueCount} حجوزات تحتاج`} دفع
          العربون. ستجد تعليمات شام كاش على واتساب — بعد الدفع اضغط «أبلغنا بدفع العربون».
        </p>
      )}
      <BookingsFilters />

      {loading ? (
        <UserBookingsPageSkeleton />
      ) : bookings.length === 0 ? (
        <EmptyState
          title="لا حجوزات بعد"
          description="جرّب تصفية أخرى أو احجز ملعبك التالي"
          actionLabel="تصفح الملاعب"
          actionHref="/stadiums"
        />
      ) : (
        <div className="space-y-6">
          {hasUpcoming ? (
            <section>
              <p className="text-xs font-bold text-primary mb-2">قادمة</p>
              <ul className="space-y-3 xl:grid xl:grid-cols-2 xl:gap-4 xl:space-y-0">
                {upcoming.map((b) => (
                  <li key={b.id}>
                    <BookingListItem
                      booking={b}
                      onPress={() => openDetail(b.id)}
                      onDepositConfirmed={handleBookingsChange}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <section className="rounded-2xl border border-dashed border-primary/25 bg-gradient-to-br from-primary/8 via-card to-secondary/40 p-6 text-center shadow-soft">
              <p className="font-display text-base font-bold text-heading">لا حجوزات قادمة</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                تصفّح الملاعب واحجز موعدك القادم
              </p>
              <Button size="sm" className="rounded-full gap-1.5" asChild>
                <Link href="/user/stadiums">
                  <Plus className="h-4 w-4" />
                  احجز ملعب
                </Link>
              </Button>
            </section>
          )}

          {hasPast && pastCollapsed && (
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-2xl h-11 gap-2 border-0 bg-secondary/80 text-heading font-bold shadow-none"
              onClick={() => setPastExpanded(true)}
            >
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
              عرض الحجوزات السابقة ({past.length})
            </Button>
          )}

          {hasPast && !pastCollapsed && (
            <section>
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-xs font-bold text-muted-foreground">سابقة</p>
                {hasUpcoming && (
                  <button
                    type="button"
                    onClick={() => setPastExpanded(false)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground hover:text-heading transition-colors"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                    إخفاء
                  </button>
                )}
              </div>
              <ul className="space-y-3 xl:grid xl:grid-cols-2 xl:gap-4 xl:space-y-0">
                {past.map((b) => (
                  <li key={b.id}>
                    <BookingListItem
                      booking={b}
                      onPress={() => openDetail(b.id)}
                      onDepositConfirmed={handleBookingsChange}
                    />
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
        onCancelled={handleBookingsChange}
        onUpdated={handleBookingsChange}
      />
    </>
  );
}

export default function UserBookingsPage() {
  return (
    <Suspense fallback={<UserBookingsPageSkeleton />}>
      <UserBookingsContent />
    </Suspense>
  );
}
