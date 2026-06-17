"use client";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { OwnerAvailabilityTab, useOwnerStadium } from "@/features/owner-stadium";

export default function OwnerSettingsPage() {
  const { token, stadium, loading, msg } = useOwnerStadium();

  if (loading) {
    return (
      <>
        <PageHeader title="المواعيد" description="أوقات التوفر والحجز" />
        <Skeleton className="h-96 w-full max-w-2xl rounded-2xl" />
      </>
    );
  }

  if (!stadium) {
    return (
      <>
        <PageHeader title="المواعيد" description="أوقات التوفر والحجز" />
        <EmptyState
          title="لا يوجد ملعب"
          description="سجّل ملعبك أولاً لإدارة المواعيد"
          actionLabel="تسجيل ملعب جديد"
          actionHref="/owner/stadium/new"
        />
      </>
    );
  }

  return (
    <>
      <PageHeader title="المواعيد" description="أوقات التوفر والحجز" />

      {msg && (
        <p className="text-sm text-primary font-bold mb-4 rounded-2xl bg-primary/10 px-4 py-2">
          {msg}
        </p>
      )}

      {token && <OwnerAvailabilityTab stadiumId={stadium.id} token={token} />}
    </>
  );
}
