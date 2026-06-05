"use client";

import { AdminShell } from "@/components/layout/admin-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { useRequireAdmin } from "@/hooks/use-require-admin";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { ready } = useRequireAdmin();

  if (!ready) {
    return (
      <div className="flex min-h-dvh bg-bg-base">
        <aside className="hidden w-56 shrink-0 border-e border-white/10 p-4 md:block space-y-2">
          <Skeleton className="h-8 w-28 mb-4" />
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-xl" />
          ))}
        </aside>
        <main className="flex-1 p-6 md:p-8 space-y-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-72 w-full rounded-2xl" />
        </main>
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
