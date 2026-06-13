"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
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

export default function NotificationsPage() {
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

    if (n.bookingId) {
      router.push(`/user/bookings?booking=${n.bookingId}`);
    }
  }

  return (
    <>
      <h1 className="font-display text-xl font-bold text-heading mb-4">الإشعارات</h1>
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState title="لا إشعارات" description="ستصلك إشعارات عند تحديث حجوزاتك" />
      ) : (
        <ul className="space-y-3">
          {items.map((n) => {
            const navigable = !!n.bookingId;
            return (
              <li key={n.id}>
                <Card
                  className={cn(
                    "border-0 shadow-soft overflow-hidden transition-colors",
                    !n.isRead && "ring-2 ring-primary/25",
                    navigable && "cursor-pointer hover:bg-secondary/40 active:scale-[0.99]"
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
                  <CardContent className="p-4 flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm text-heading">{n.title}</p>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDate(n.createdAt, { dateStyle: "medium", timeStyle: "short" })}
                      </p>
                    </div>
                    {navigable && (
                      <ChevronLeft className="h-5 w-5 shrink-0 text-primary mt-0.5" aria-hidden />
                    )}
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
