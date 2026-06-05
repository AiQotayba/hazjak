"use client";

import Link from "next/link";
import { Plus, CalendarDays } from "lucide-react";
import { APP_MOTTO_AR, APP_TAGLINE_AR } from "@beeplay/constants";
import { Button } from "@/components/ui/button";

interface UserBookingsHeroProps {
  firstName?: string;
  upcomingCount: number;
}

export function UserBookingsHero({ firstName, upcomingCount }: UserBookingsHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/12 via-secondary to-accent/40 p-5 mb-4 shadow-soft">
      <div className="absolute -top-10 -end-10 h-32 w-32 rounded-full bg-primary/15 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -start-6 h-24 w-24 rounded-full bg-accent-gold/20 blur-xl pointer-events-none" />

      <p className="text-xs text-muted-foreground relative">{APP_MOTTO_AR}</p>
      <h1 className="font-display text-2xl font-bold text-heading mt-1 relative">
        {firstName ? `أهلاً، ${firstName}` : "حجوزاتي"}
      </h1>
      <p className="text-sm text-muted-foreground mt-1 relative">{APP_TAGLINE_AR}</p>

      <div className="mt-4 flex flex-wrap items-center gap-3 relative">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-card/80 backdrop-blur-sm px-3 py-1.5 text-xs font-bold text-heading shadow-soft">
          <CalendarDays className="h-3.5 w-3.5 text-primary" />
          {upcomingCount} حجز قادم
        </span>
        <Button size="sm" className="rounded-full h-9 gap-1.5 shadow-soft ms-auto" asChild>
          <Link href="/stadiums">
            <Plus className="h-4 w-4" />
            حجز جديد
          </Link>
        </Button>
      </div>
    </section>
  );
}
