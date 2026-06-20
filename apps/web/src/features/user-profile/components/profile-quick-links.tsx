"use client";

import Link from "next/link";
import { Bell, CalendarDays, MapPin, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  {
    href: "/user/stadiums",
    label: "حجز جديد",
    description: "تصفح الملاعب واحجز",
    icon: Plus,
    accent: "bg-primary text-primary-foreground",
  },
  {
    href: "/user/bookings",
    label: "حجوزاتي",
    description: "تابع حجوزاتك",
    icon: CalendarDays,
    accent: "bg-primary/12 text-primary",
  },
  {
    href: "/user/stadiums",
    label: "الملاعب",
    description: "اكتشف ملاعب جديدة",
    icon: MapPin,
    accent: "bg-accent-gold/20 text-heading",
  },
  {
    href: "/user/notifications",
    label: "الإشعارات",
    description: "تحديثات حجوزاتك",
    icon: Bell,
    accent: "bg-secondary text-heading",
  },
] as const;

interface ProfileQuickLinksProps {
  upcomingCount?: number;
}

export function ProfileQuickLinks({ upcomingCount = 0 }: ProfileQuickLinksProps) {
  return (
    <section>
      <h2 className="text-sm font-bold text-heading mb-3">وصول سريع</h2>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {links.map((item) => {
          const Icon = item.icon;
          const showBadge = item.href === "/user/bookings" && upcomingCount > 0;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "group relative flex flex-col gap-3 rounded-2xl border border-border/50 bg-card p-4 shadow-soft",
                "transition-all hover:shadow-card hover:border-primary/25 hover:-translate-y-0.5"
              )}
            >
              {showBadge && (
                <span className="absolute top-3 end-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {upcomingCount}
                </span>
              )}
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", item.accent)}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-heading">{item.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{item.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
