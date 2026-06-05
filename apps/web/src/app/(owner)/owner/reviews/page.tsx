"use client";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default function OwnerReviewsPage() {
  return (
    <>
      <PageHeader title="التقييمات" description="عرض والرد على تقييمات الملعب" />
      <EmptyState
        title="قريباً"
        description="سيتم عرض التقييمات والرد عليها من هذه الصفحة"
        actionLabel="الحجوزات"
        actionHref="/owner/bookings"
      />
    </>
  );
}
