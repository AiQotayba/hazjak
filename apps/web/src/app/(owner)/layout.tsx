"use client";

import {
  LayoutDashboard,
  CalendarClock,
  ClipboardList,
  MapPin,
  User,
} from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { useRequireRole } from "@/features/auth/hooks/use-require-role";

const nav = [
  { href: "/owner", icon: LayoutDashboard, label: "الرئيسية" },
  { href: "/owner/bookings", icon: ClipboardList, label: "الحجوزات" },
  { href: "/owner/stadium", icon: MapPin, label: "الملعب" },
  { href: "/owner/settings", icon: CalendarClock, label: "المواعيد" },
  { href: "/owner/profile", icon: User, label: "حسابي" },
];

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const { ready } = useRequireRole("STADIUM_OWNER");

  if (!ready) {
    return (
      <div className="flex h-dvh overflow-hidden bg-section-alt">
        <aside className="hidden w-56 shrink-0 border-e border-border bg-card p-4 md:block space-y-2">
          <Skeleton className="h-8 w-24 mb-4" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-xl" />
          ))}
        </aside>
        <main className="flex-1 p-6 md:p-8 space-y-4 max-w-5xl overflow-y-auto">
          <Skeleton className="h-8 w-36" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-48 w-full rounded-2xl" />
        </main>
      </div>
    );
  }

  return (
    <DashboardShell title="إدارة الملعب" nav={nav} contentClassName="max-w-5xl">
      {children}
    </DashboardShell>
  );
}
