"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@hazjak/utils";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { useRequireAdmin } from "@/hooks/use-require-admin";
import { api } from "@/lib/api";

type AdminNotification = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string };
};

export default function AdminNotificationsPage() {
  const { token } = useRequireAdmin();
  const [items, setItems] = useState<AdminNotification[]>([]);

  useEffect(() => {
    api<{ notifications: AdminNotification[] }>("/notifications/admin/all", { token }).then(
      (r) => setItems(r.data?.notifications ?? [])
    );
  }, [token]);

  return (
    <div className="max-w-3xl">
      <PageHeader title="الإشعارات" description="آخر إشعارات المستخدمين على المنصة" />
      <ul className="space-y-3">
        {items.length === 0 ? (
          <Card className="p-6 text-sm text-text-muted text-center">لا إشعارات بعد</Card>
        ) : (
          items.map((n) => (
            <Card key={n.id} className="p-4">
              <p className="font-bold text-sm">{n.title}</p>
              <p className="text-xs text-text-muted mt-1">
                {n.user.firstName} {n.user.lastName} · {n.user.email}
              </p>
              <p className="text-sm text-text-muted mt-2">{n.message}</p>
              <p className="text-[10px] text-text-subtle mt-2">
                {formatDate(n.createdAt, { dateStyle: "medium", timeStyle: "short" })}
              </p>
            </Card>
          ))
        )}
      </ul>
    </div>
  );
}
