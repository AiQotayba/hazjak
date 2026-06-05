"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { useRequireAdmin } from "@/hooks/use-require-admin";

type Settings = {
  id: string;
  cancellationPolicy: string | null;
  allowInstantBooking: boolean;
  bookingExpirationMin: number;
};

export default function AdminSettingsPage() {
  const { token } = useRequireAdmin();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api<Settings>("/settings", { token }).then((r) => setSettings(r.data ?? null));
  }, [token]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setMessage("");
    const res = await api<Settings>("/settings", {
      method: "PATCH",
      token,
      body: JSON.stringify({
        cancellationPolicy: settings.cancellationPolicy,
        allowInstantBooking: settings.allowInstantBooking,
        bookingExpirationMin: settings.bookingExpirationMin,
      }),
    });
    setSaving(false);
    if (res.success) {
      setSettings(res.data ?? settings);
      setMessage("تم حفظ الإعدادات");
    } else {
      setMessage(res.message || "فشل الحفظ");
    }
  }

  if (!settings) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">الإعدادات</h1>
      <p className="text-sm text-text-muted mb-6">إعدادات المنصة العامة</p>

      <Card>
        <form onSubmit={save} className="space-y-6">
          <div>
            <CardTitle>سياسة الإلغاء</CardTitle>
            <CardDescription className="mb-3">
              النص المعروض للمستخدمين عند الحجز
            </CardDescription>
            <textarea
              value={settings.cancellationPolicy ?? ""}
              onChange={(e) =>
                setSettings({ ...settings, cancellationPolicy: e.target.value })
              }
              rows={5}
              className="w-full rounded-[var(--radius-card)] bg-bg-elevated p-4 text-sm border border-white/10 focus:outline-none focus:ring-1 focus:ring-brand"
              placeholder="سياسة الإلغاء..."
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.allowInstantBooking}
              onChange={(e) =>
                setSettings({ ...settings, allowInstantBooking: e.target.checked })
              }
              className="h-4 w-4 accent-brand"
            />
            <span className="text-sm font-medium">السماح بالحجز الفوري</span>
          </label>

          <div>
            <label className="text-sm font-medium block mb-2">
              انتهاء طلب الحجز (دقائق)
            </label>
            <input
              type="number"
              min={5}
              max={120}
              value={settings.bookingExpirationMin}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  bookingExpirationMin: Number(e.target.value),
                })
              }
              className="h-11 w-32 rounded-[var(--radius-pill)] bg-bg-elevated px-4 text-sm border border-white/10"
            />
          </div>

          {message && (
            <p
              className={`text-sm ${message.includes("تم") ? "text-brand" : "text-negative"}`}
            >
              {message}
            </p>
          )}

          <Button type="submit" disabled={saving}>
            {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
