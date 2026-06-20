"use client";

import { AppTabShell } from "@/components/layout/app-tab-shell";
import { ProfileSkeleton } from "@/components/layout/page-skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import { useRequireRole } from "@/features/auth";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { ready } = useRequireRole("USER");

  if (!ready) {
    return (
      <div className="flex min-h-dvh flex-col bg-background">
        <Skeleton className="h-14 w-full rounded-none" />
        <div className="page-container flex-1 py-8">
          <ProfileSkeleton />
        </div>
      </div>
    );
  }

  return <AppTabShell>{children}</AppTabShell>;
}
