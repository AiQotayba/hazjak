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
  isRead: boolean;
  createdAt: string;
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
          {items.map((n) => (
            <Card
              key={n.id}
              className={cn("border-0 shadow-soft", !n.isRead && "ring-2 ring-primary/25")}
            >
              <CardContent className="p-4">
                <p className="font-bold text-sm text-heading">{n.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {formatDate(n.createdAt, { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </CardContent>
            </Card>
          ))}
        </ul>
      )}
    </>
  );
}
