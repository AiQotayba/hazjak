"use client";
import { UserMobileShell } from "@/features/user-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { useRequireRole } from "@/features/auth";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { ready } = useRequireRole("USER");
  if (!ready) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col bg-background">
        <div className="flex h-14 items-center justify-between px-4 shadow-soft">
          <Skeleton className="h-6 w-20" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
        <div className="flex-1 space-y-3 p-4">
          <Skeleton className="h-36 w-full rounded-3xl" />
          <Skeleton className="h-10 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      </div>
    );
  }
  return <UserMobileShell>{children}</UserMobileShell>;
}