"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, User, CalendarDays, MapPin } from "lucide-react";
import { APP_NAME_AR } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function UserMobileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-dvh flex-col bg-background max-w-lg mx-auto w-full shadow-card md:shadow-none md:max-w-lg">
      <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md shadow-soft px-4 pt-safe pb-3">
        <div className="flex items-center justify-between gap-3 h-12">
          <Link href="/user/bookings" className="font-display text-lg font-bold text-heading shrink-0">
            {APP_NAME_AR}
          </Link>
          <div className="flex items-center gap-1">

            <Link
              href="/user/bookings"
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                pathname === "/user/bookings"
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              )}
              aria-label="الإشعارات"
            >
              <CalendarDays className="h-5 w-5" />
            </Link>
            <Link
              href="/user/notifications"
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                pathname === "/user/notifications"
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              )}
              aria-label="الملعبات"
            >
              <Bell className="h-5 w-5" />
            </Link>
            <Link
              href="/user/profile"
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                pathname === "/user/profile"
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              )}
              aria-label="الملف الشخصي"
            >
              <User className="h-5 w-5" />
            </Link>
          </div>
        </div>

      </header>

      <main className="flex-1 px-4 py-4 pb-8">{children}</main>
    </div>
  );
}

function Item() {
  return (
    <>
    </>
  )
}