"use client";

import Link from "next/link";
import { Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AuthUser } from "@hazjak/types";
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
    <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-primary/10 via-card to-secondary p-5 mb-4 shadow-soft">
      <div className="relative flex items-start gap-4">
        <div
          className={cn(
            "flex h-16 w-16 shrink-0 items-center justify-center rounded-xl",
            "bg-card text-primary font-display text-xl font-bold shadow-soft ring-2 ring-primary/15"
          )}
        >
          {user?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar} alt="" className="h-full w-full rounded-xl object-cover" />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-bold text-heading">
            {user ? `${user.firstName} ${user.lastName}` : "الملف الشخصي"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 break-all">{user?.email}</p>
          {user?.phone && (
            <p className="text-sm text-muted-foreground mt-0.5" dir="ltr">
              {user.phone}
            </p>
          )}
          {user?.isEmailVerified && (
            <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              <ShieldCheck className="h-3 w-3" />
              بريد موثّق
            </span>
          )}
        </div>
      </div>

      <div className="relative mt-4 flex flex-wrap gap-2">
        <Button size="sm" className="h-9 gap-1.5 shadow-soft" asChild>
          <Link href="/stadiums">
            <Plus className="h-4 w-4" />
            حجز جديد
          </Link>
        </Button>
        <Button size="sm" variant="outline" className="h-9" asChild>
          <Link href="/user/bookings">حجوزاتي</Link>
        </Button>
      </div>
    </section>
  );
}
