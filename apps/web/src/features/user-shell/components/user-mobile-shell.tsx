"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { CalendarDays, MapPin, User } from "lucide-react";
import { APP_NAME_AR } from "@/lib/brand";
import { cn } from "@/lib/utils";

const bottomNav = [
  { href: "/user/bookings", label: "حجوزاتي", icon: CalendarDays },
  { href: "/stadiums", label: "الملاعب", icon: MapPin },
  { href: "/user/profile", label: "حسابي", icon: User },
] as const;

export function UserMobileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-dvh flex-col bg-background max-w-lg mx-auto w-full shadow-card md:shadow-none">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-card/95 backdrop-blur-md px-4 pt-safe">
        <div className="flex h-14 items-center gap-2">
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <Image src="/logo.png" alt={APP_NAME_AR} width={32} height={32} className="h-8 w-8 shrink-0" />
            <span className="font-display text-lg font-bold text-heading truncate">{APP_NAME_AR}</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 pb-24">{children}</main>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-lg border-t border-border/60 bg-card/95 backdrop-blur-md px-2 pb-safe"
        aria-label="التنقل الرئيسي"
      >
        <div className="grid grid-cols-3 gap-1 py-2">
          {bottomNav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-lg py-2 text-[11px] font-bold transition-colors",
                  active ? "bg-primary/12 text-primary" : "text-muted-foreground hover:text-heading"
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
