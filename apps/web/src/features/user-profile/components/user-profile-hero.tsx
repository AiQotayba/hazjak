"use client";

import Link from "next/link";
import { Bell, Plus, ShieldCheck, Sparkles } from "lucide-react";
import { APP_MOTTO_AR, APP_TAGLINE_AR } from "@beeplay/constants";
import { Button } from "@/components/ui/button";
import type { AuthUser } from "@beeplay/types";
import { cn } from "@/lib/utils";

interface UserProfileHeroProps {
  user: AuthUser | null;
}

export function UserProfileHero({ user }: UserProfileHeroProps) {
  const initials =
    `${user?.firstName?.charAt(0) ?? ""}${user?.lastName?.charAt(0) ?? ""}`.trim() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "?";

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/12 via-secondary to-accent/40 p-5 mb-4 shadow-soft">
      <div className="pointer-events-none absolute -top-10 -end-10 h-32 w-32 rounded-full bg-primary/15 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-8 -start-6 h-24 w-24 rounded-full bg-accent-gold/20 blur-xl" />

      <div className="relative flex items-start gap-4">
        <div
          className={cn(
            "flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl",
            "bg-card text-primary font-display text-xl font-bold shadow-card ring-2 ring-primary/20"
          )}
        >
          {user?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar} alt="" className="h-full w-full rounded-2xl object-cover" />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-primary" />
            {APP_MOTTO_AR}
          </p>
          <h1 className="font-display text-2xl font-bold text-heading mt-1">
            {user ? `أهلاً، ${user.firstName}` : "الملف الشخصي"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{APP_TAGLINE_AR}</p>
          {user?.isEmailVerified && (
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-card/80 px-2 py-0.5 text-[10px] font-bold text-primary">
              <ShieldCheck className="h-3 w-3" />
              بريد موثّق
            </span>
          )}
        </div>
      </div>

      <div className="relative mt-4 flex flex-wrap items-center gap-2">
        <Button size="sm" className="rounded-full h-9 gap-1.5 shadow-soft" asChild>
          <Link href="/stadiums">
            <Plus className="h-4 w-4" />
            حجز جديد
          </Link>
        </Button>
        <Button size="sm" variant="secondary" className="rounded-full h-9 gap-1.5 shadow-soft" asChild>
          <Link href="/user/bookings">حجوزاتي</Link>
        </Button>
        <Button size="sm" variant="outline" className="rounded-full h-9 gap-1.5 border-0 bg-card/80 ms-auto" asChild>
          <Link href="/user/notifications">
            <Bell className="h-4 w-4" />
            الإشعارات
          </Link>
        </Button>
      </div>
    </section>
  );
}
