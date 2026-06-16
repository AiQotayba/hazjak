"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  ClipboardList,
  MapPin,
  TrendingDown,
  Users,
  Wallet,
} from "lucide-react";
import { formatPrice } from "@hazjak/utils";
import { Card, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminStatCard } from "@/features/shell/components/admin-stat-card";
import { MorningEveningChart } from "./morning-evening-chart";
import { PopularHoursChart } from "./popular-hours-chart";
import { api } from "@/lib/api";
import { useRequireAdmin } from "@/hooks/use-require-admin";

type DashboardStats = {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  revenue: number;
  morningBookings: number;
  eveningBookings: number;
  cancellationRate: number;
  popularHours: { hour: number; count: number }[];
  totalUsers?: number;
  totalStadiums?: number;
};

type PendingBooking = {
  id: string;
  status: string;
  startTime: string;
  totalPrice: number;
  stadium: { name: string };
  user: { firstName: string; lastName: string };
};

export function DashboardOverview() {
  const { token } = useRequireAdmin();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pending, setPending] = useState<PendingBooking[]>([]);

  useEffect(() => {
    api<DashboardStats>("/analytics/dashboard", { token }).then((r) =>
      setStats(r.data ?? null)
    );
    api<PendingBooking[]>("/bookings?status=PENDING&limit=6", { token }).then((r) =>
      setPending(r.data ?? [])
    );
  }, [token]);

  async function updateStatus(id: string, status: string) {
    await api(`/bookings/${id}/status`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ status }),
    });
    setPending((p) => p.filter((b) => b.id !== id));
    if (stats) {
      setStats({
        ...stats,
        pendingBookings: Math.max(0, stats.pendingBookings - 1),
        ...(status === "CONFIRMED" && {
          confirmedBookings: stats.confirmedBookings + 1,
        }),
      });
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="إجمالي الحجوزات"
          value={stats?.totalBookings ?? "—"}
          icon={CalendarCheck}
          accent="brand"
          href="/bookings"
        />
        <AdminStatCard
          label="الملاعب المسجّلة"
          value={stats?.totalStadiums ?? "—"}
          icon={MapPin}
          accent="teal"
          href="/stadiums"
        />
        <AdminStatCard
          label="الإيرادات (بعد انتهاء اللعب)"
          value={stats ? formatPrice(stats.revenue) : "—"}
          icon={Wallet}
          accent="orange"
          href="/reports"
        />
        <AdminStatCard
          label="قيد الانتظار"
          value={stats?.pendingBookings ?? "—"}
          icon={ClipboardList}
          accent="pink"
          href="/bookings?status=PENDING"
        />
      </div>

      <Card className="border-border/50 shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between gap-4 mb-5">
          <CardTitle>حجوزات بانتظار الموافقة</CardTitle>
          <Link href="/bookings?status=PENDING" className="text-sm text-brand font-bold hover:underline">
            عرض الكل
          </Link>
        </div>
        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">لا توجد طلبات حالياً</p>
        ) : (
          <ul className="divide-y divide-border/60">
            {pending.map((b) => (
              <li
                key={b.id}
                className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand font-bold text-sm">
                    {b.stadium.name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold truncate">{b.stadium.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {b.user.firstName} {b.user.lastName} ·{" "}
                      {new Date(b.startTime).toLocaleString("ar-PS")} ·{" "}
                      {formatPrice(b.totalPrice)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={b.status} />
                  <Button size="sm" onClick={() => updateStatus(b.id, "CONFIRMED")}>
                    قبول
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => updateStatus(b.id, "REJECTED")}
                  >
                    رفض
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/50 shadow-[var(--shadow-soft)]">
          <div className="flex items-center justify-between gap-3 mb-5">
            <CardTitle>حجوزات صباحي مقابل مسائي</CardTitle>
            <span className="text-xs text-muted-foreground rounded-full bg-secondary px-3 py-1">
              مؤكّدة ومكتملة
            </span>
          </div>
          {stats ? (
            <MorningEveningChart
              morning={stats.morningBookings}
              evening={stats.eveningBookings}
            />
          ) : (
            <div className="h-40 animate-pulse rounded-xl bg-secondary" />
          )}
        </Card>

        <Card className="border-border/50 shadow-[var(--shadow-soft)]">
          <CardTitle className="mb-4">نسبة الإلغاء</CardTitle>
          {stats ? (
            <div className="flex flex-col items-center justify-center py-4">
              <div
                className="relative h-28 w-28 rounded-full"
                style={{
                  background: `conic-gradient(var(--accent-pink) 0% ${stats.cancellationRate}%, var(--color-border) ${stats.cancellationRate}% 100%)`,
                }}
              >
                <div className="absolute inset-3 rounded-full bg-card flex flex-col items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-[var(--accent-pink)] mb-0.5" />
                  <span className="text-xl font-bold">{stats.cancellationRate}%</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                من إجمالي {stats.totalBookings} حجز
              </p>
            </div>
          ) : (
            <div className="h-40 animate-pulse rounded-xl bg-secondary" />
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-border/50 shadow-[var(--shadow-soft)]">
          <CardTitle className="mb-2">أكثر الساعات حجزاً</CardTitle>
          {stats ? (
            <PopularHoursChart hours={stats.popularHours} />
          ) : (
            <div className="h-36 animate-pulse rounded-xl bg-secondary" />
          )}
        </Card>

        <div className="rounded-2xl bg-brand p-5 text-white shadow-[var(--shadow-soft)] flex flex-col">
          <p className="text-sm opacity-80">ملخّص المنصة</p>
          <p className="text-4xl font-bold mt-2">{stats?.totalUsers ?? "—"}</p>
          <p className="text-sm opacity-90 mt-1">مستخدم مسجّل</p>
          <div className="mt-auto pt-6 flex items-end justify-between gap-2">
            <div>
              <p className="text-2xl font-bold">{stats?.confirmedBookings ?? "—"}</p>
              <p className="text-xs opacity-80">حجز مؤكّد</p>
            </div>
            <Link
              href="/users"
              className="text-xs font-bold bg-white/20 hover:bg-white/30 rounded-full px-3 py-1.5 transition-colors"
            >
              عرض الكل
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
