"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@hazjak/utils";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useRequireAdmin } from "@/hooks/use-require-admin";

export default function AdminReportsPage() {
  const { token } = useRequireAdmin();
  const [stats, setStats] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    api<Record<string, number>>("/analytics/dashboard", { token }).then((r) =>
      setStats(r.data ?? null)
    );
  }, [token]);

  return (
    <div className="max-w-4xl">
      <PageHeader title="التقارير" description="إحصائيات المنصة" />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
        {[
          { label: "المستخدمون", key: "totalUsers" },
          { label: "الملاعب", key: "totalStadiums" },
          { label: "الحجوزات", key: "totalBookings" },
          { label: "مؤكدة", key: "confirmedBookings" },
          { label: "قيد الانتظار", key: "pendingBookings" },
          { label: "الإيرادات", key: "revenue", money: true },
          { label: "إلغاء %", key: "cancellationRate", suffix: "%" },
        ].map(({ label, key, money, suffix }) => (
          <Card key={key} className="p-3">
            <p className="text-xs text-text-muted">{label}</p>
            <p className="text-lg font-bold text-brand mt-0.5">
              {stats
                ? money
                  ? formatPrice(stats[key] as number)
                  : `${stats[key] ?? 0}${suffix ?? ""}`
                : "—"}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
