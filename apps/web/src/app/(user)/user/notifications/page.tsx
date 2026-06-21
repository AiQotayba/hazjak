"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageShell } from "@/components/layout/page-shell";
import { ListCardsSkeleton } from "@/components/layout/page-skeletons";
import { ConfirmDepositButton } from "@/features/user-bookings/components/confirm-deposit-button";
import { formatDate } from "@hazjak/utils";
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

function isDepositNotification(n: Notification) {
  return n.type === "DEPOSIT_REMINDER" && !!n.bookingId;
}

export default function NotificationsPage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  function loadNotifications() {
    if (!token) return;
    api<{ notifications: Notification[] }>("/notifications", { token })
      .then((res) => setItems(res.data?.notifications ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleNotificationClick(n: Notification) {
    if (!token) return;

    if (!n.isRead) {
      await api(`/notifications/${n.id}/read`, { method: "PATCH", token });
      setItems((prev) => prev.map((item) => (item.id === n.id ? { ...item, isRead: true } : item)));
    }

    if (n.bookingId) {
      router.push(`/user/bookings?booking=${n.bookingId}`);
    }
  }

  return (
    <PageShell title="الإشعارات" description="سننبهك عند تحديث حجوزاتك">
      {loading ? (
        <ListCardsSkeleton count={4} />
      ) : items.length === 0 ? (
        <EmptyState title="لا إشعارات" description="سننبهك عند تحديث حجوزاتك" />
      ) : (
        <ul className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
          {items.map((n, i) => {
            const depositAction = isDepositNotification(n);
            const navigable = !!n.bookingId && !depositAction;

            return (
              <motion.li
                key={n.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.2), duration: 0.3 }}
              >
                <Card
                  className={cn(
                    "surface-card overflow-hidden transition-colors",
                    !n.isRead && "ring-2 ring-primary/25",
                    navigable && "cursor-pointer hover:bg-accent/50 active:scale-[0.99]"
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
                  <CardContent className="flex flex-col gap-3 p-4">
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-heading">{n.title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{n.message}</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {formatDate(n.createdAt, { dateStyle: "medium", timeStyle: "short" })}
                        </p>
                      </div>
                      {navigable && (
                        <ChevronLeft className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                      )}
                    </div>

                    {depositAction && n.bookingId && (
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <ConfirmDepositButton
                          bookingId={n.bookingId}
                          onSuccess={loadNotifications}
                          className="h-10 rounded-xl sm:flex-1"
                        />
                        <button
                          type="button"
                          className="text-xs font-bold text-primary hover:underline text-center py-2"
                          onClick={() => handleNotificationClick(n)}
                        >
                          تفاصيل الحجز
                        </button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.li>
            );
          })}
        </ul>
      )}
    </PageShell>
  );
}
