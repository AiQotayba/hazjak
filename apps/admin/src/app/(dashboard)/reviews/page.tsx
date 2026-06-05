"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { useRequireAdmin } from "@/hooks/use-require-admin";

export default function AdminReviewsPage() {
  useRequireAdmin();
  return (
    <div className="max-w-4xl">
      <PageHeader title="التقييمات" description="مراجعة وحذف التقييمات" />
      <Card>
        <p className="text-sm text-text-muted">قائمة التقييمات — قريباً</p>
      </Card>
    </div>
  );
}
