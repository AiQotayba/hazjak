"use client";

import { AppTabShell } from "@/components/layout/app-tab-shell";
import { DashboardSkeleton } from "@/components/layout/page-skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import { useRequireRole } from "@/features/auth/hooks/use-require-role";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const { ready } = useRequireRole("STADIUM_OWNER");

  if (!ready) {
    return (
      <div className="flex min-h-dvh flex-col bg-background">
        <Skeleton className="h-14 w-full rounded-none" />
        <div className="page-container flex-1 py-8">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  return <AppTabShell>{children}</AppTabShell>;
}
