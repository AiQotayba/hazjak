"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@hazjak/utils";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { useAuthStore } from "@/features/auth/store/auth";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  bookingId?: string | null;
  isRead: boolean;
  createdAt: string;
}

const OWNER_BOOKING_TYPES = new Set(["BOOKING_PENDING", "DEPOSIT_REMINDER"]);

function isOwnerBookingNotification(n: Notification) {
  return OWNER_BOOKING_TYPES.has(n.type) || !!n.bookingId;
}

export default function OwnerNotificationsPage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    api<{ notifications: Notification[] }>("/notifications", { token })
      .then((res) => setItems(res.data?.notifications ?? []))
      .finally(() => setLoading(false));
  }, [token, router]);

  async function handleNotificationClick(n: Notification) {
    if (!token) return;

    if (!n.isRead) {
      await api(`/notifications/${n.id}/read`, { method: "PATCH", token });
      setItems((prev) => prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item)));
    }

    if (isOwnerBookingNotification(n)) {
      const params = new URLSearchParams();
      if (n.bookingId) params.set("booking", n.bookingId);
      const qs = params.toString();
      router.push(qs ? `/owner/bookings?${qs}` : "/owner/bookings");
    }
  }

  return (
    <>
      <PageHeader title="الإشعارات" description="تنبيهات الحجوزات والملعب" />
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState title="لا إشعارات" description="ستصلك تنبيهات عند طلبات الحجز الجديدة" />
      ) : (
        <ul className="space-y-3 max-w-lg">
          {items.map((n) => {
            const navigable = isOwnerBookingNotification(n);

            return (
              <li key={n.id}>
                <Card
                  className={cn(
                    "border-0 shadow-soft",
                    !n.isRead && "ring-2 ring-primary/25",
                    navigable && "cursor-pointer hover:shadow-card transition-shadow"
                  )}
                  onClick={navigable ? () => handleNotificationClick(n) : undefined}
                  onKeyDown={
                    navigable
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleNotificationClick(n);
                          }
                        }
                      : undefined
                  }
                  role={navigable ? "button" : undefined}
                  tabIndex={navigable ? 0 : undefined}
                >
                  <CardContent className="p-4">
                    <p className="font-bold text-sm text-heading">{n.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDate(n.createdAt, { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
