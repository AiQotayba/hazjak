"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { formatDate, formatPrice, formatTime } from "@hazjak/utils";
import { Banknote, CalendarCheck, ClipboardList, Clock, Percent, Plus } from "lucide-react";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/features/owner-dashboard/components/stat-card";
import { OwnerBookingDetailDialog } from "@/features/owner-bookings";
import { getBookingPlayerLabel, getBookingPlayerPhone } from "@/features/owner-bookings/lib/manual-booking";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/features/auth/store/auth";

type OwnerBooking = {
  id: string;
  status: string;
  stadium: { name: string };
  user: { firstName: string; lastName: string; phone: string };
  startTime: string;
  endTime?: string;
  totalPrice?: number;
  notes?: string | null;
  guestName?: string | null;
  guestPhone?: string | null;
};

const STAT_ITEMS = [
  {
    label: "إجمالي الحجوزات",
    description: "كل الحجوزات على ملعبك",
    key: "totalBookings",
    href: "/owner/bookings",
    icon: ClipboardList,
  },
  {
    label: "بانتظار الموافقة",
    description: "طلبات تحتاج تأكيدك",
    key: "pendingBookings",
    href: "/owner/bookings?status=PENDING",
    icon: CalendarCheck,
  },
  {
    label: "الإيرادات (ل.س)",
    description: "يُحتسب بعد انتهاء وقت اللعب",
    key: "revenue",
    format: true,
    href: "/owner/bookings?status=CONFIRMED",
    icon: Banknote,
  },
  {
    label: "إيرادات متوقعة",
    description: "حجوزات مؤكدة لم ينتهِ وقتها بعد",
    key: "upcomingRevenue",
    format: true,
    href: "/owner/bookings?status=CONFIRMED",
    icon: Clock,
  },
  {
    label: "نسبة الإلغاء",
    description: "نسبة الحجوزات الملغاة",
    key: "cancellationRate",
    suffix: "%",
    href: "/owner/bookings?status=CANCELLED",
    icon: Percent,
  },
] as const;

export default function OwnerDashboardPage() {
  const { token, user } = useAuthStore();
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [pending, setPending] = useState<OwnerBooking[]>([]);
  const [confirmed, setConfirmed] = useState<OwnerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const load = useCallback(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([
      api<Record<string, number>>("/analytics/dashboard", { token }),
      api<OwnerBooking[]>("/bookings?status=PENDING&limit=5", { token }),
      api<OwnerBooking[]>("/bookings?status=CONFIRMED&limit=5", { token }),
    ])
      .then(([statsRes, pendingRes, confirmedRes]) => {
        setStats(statsRes.data ?? null);
        setPending(pendingRes.data ?? []);
        const now = Date.now();
        setConfirmed(
          (confirmedRes.data ?? []).filter(
            (b) => b.endTime && new Date(b.endTime).getTime() > now
          )
        );
      })
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  function openDetail(id: string) {
    setDetailId(id);
    setDetailOpen(true);
  }

  return (
    <>
      <PageHeader
        title="لوحة التحكم"
        description={`أهلاً ${user?.firstName ?? ""} — راجع الطلبات وأكّد الحجوزات`}
        action={
          <div className="flex flex-wrap gap-2">
            <Button size="sm" className="rounded-full gap-1.5" asChild>
              <Link href="/owner/bookings?create=1">
                <Plus className="h-4 w-4" />
                إضافة حجز
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/owner/stadium">الملعب</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/owner/profile">حسابي</Link>
            </Button>
          </div>
        }
      />

      <section className="mb-6 overflow-hidden rounded-2xl border border-border bg-accent/50 p-5 shadow-soft">
        <p className="text-sm text-muted-foreground max-w-lg">
          من صفحة تفاصيل الحجز يمكنك القبول، الرفض، أو طلب عربون عبر شام كاش.
        </p>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {loading
          ? [1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-[5.5rem] rounded-2xl" />)
          : STAT_ITEMS.map((item) => (
              <StatCard
                key={item.key}
                label={item.label}
                description={item.description}
                href={item.href}
                icon={item.icon}
                value={
                  stats
                    ? "format" in item && item.format
                      ? formatPrice(stats[item.key] as number)
                      : `${stats[item.key] ?? 0}${"suffix" in item ? item.suffix : ""}`
                    : "—"
                }
              />
            ))}
      </div>

      <BookingSection
        title="طلبات بانتظار الموافقة"
        count={stats?.pendingBookings}
        loading={loading}
        bookings={pending}
        emptyTitle="لا طلبات حالياً"
        emptyDescription="ستظهر الطلبات الجديدة هنا فور وصولها"
        emptyActionLabel="كل الحجوزات"
        emptyHref="/owner/bookings"
        listHref="/owner/bookings?status=PENDING"
        onOpenDetail={openDetail}
      />

      <BookingSection
        title="حجوزات مؤكدة"
        count={stats?.confirmedBookings}
        loading={loading}
        bookings={confirmed}
        emptyTitle="لا حجوزات مؤكدة قريبة"
        emptyDescription="الحجوزات المؤكدة تظهر هنا"
        emptyActionLabel="كل الحجوزات"
        emptyHref="/owner/bookings?status=CONFIRMED"
        listHref="/owner/bookings?status=CONFIRMED"
        className="mt-4"
        onOpenDetail={openDetail}
      />

      <OwnerBookingDetailDialog
        bookingId={detailId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onUpdated={load}
      />
    </>
  );
}

function BookingSection({
  title,
  count,
  loading,
  bookings,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  emptyHref,
  listHref,
  onOpenDetail,
  className,
}: {
  title: string;
  count?: number;
  loading: boolean;
  bookings: OwnerBooking[];
  emptyTitle: string;
  emptyDescription: string;
  emptyActionLabel: string;
  emptyHref: string;
  listHref: string;
  onOpenDetail?: (id: string) => void;
  className?: string;
}) {
  return (
    <Card className={cn("border-0 shadow-soft", className)}>
      <CardContent className="p-4 md:p-5">
        <div className="flex items-center justify-between gap-2 mb-4">
          <CardTitle className="font-display text-heading text-base flex items-center gap-2">
            {title}
            {count != null && count > 0 && (
              <span className="inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-primary/15 px-1.5 text-[10px] font-bold text-primary">
                {count}
              </span>
            )}
          </CardTitle>
          <Link
            href={listHref}
            className="text-xs text-primary font-bold hover:underline shrink-0"
          >
            عرض الكل ←
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-[4.5rem] rounded-2xl" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            actionLabel={emptyActionLabel}
            actionHref={emptyHref}
          />
        ) : (
          <ul className="space-y-2">
            {bookings.map((b) => (
              <li
                key={b.id}
                className="rounded-2xl bg-secondary/60 p-3 sm:p-4 flex flex-wrap items-start justify-between gap-3"
              >
                <div className="text-start min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge
                      status={b.status}
                      endTime={b.endTime}
                      className="text-[10px]"
                    />
                  </div>
                  <p className="font-bold text-heading text-sm">{b.stadium.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {getBookingPlayerLabel(b)}
                    {(() => {
                      const phone = getBookingPlayerPhone(b);
                      return phone ? (
                        <span dir="ltr" className="inline-block ms-1">
                          · {phone}
                        </span>
                      ) : null;
                    })()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(b.startTime, { dateStyle: "medium" })}
                    {b.endTime && (
                      <>
                        {" · "}
                        <span dir="ltr">
                          {formatTime(b.startTime)} — {formatTime(b.endTime)}
                        </span>
                      </>
                    )}
                  </p>
                  {b.totalPrice != null && (
                    <p className="text-xs font-bold text-primary mt-1">
                      {formatPrice(b.totalPrice)}
                    </p>
                  )}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 rounded-xl"
                  onClick={() => onOpenDetail?.(b.id)}
                >
                  تفاصيل
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
