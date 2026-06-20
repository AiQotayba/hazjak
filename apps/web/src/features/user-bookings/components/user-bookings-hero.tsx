"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { formatUpcomingBookingsLabel } from "@/features/user-bookings/lib/user-bookings";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";

interface UserBookingsHeroProps {
  firstName?: string;
  upcomingCount: number;
}

export function UserBookingsHero({ firstName, upcomingCount }: UserBookingsHeroProps) {
  return (
    <PageHeader
      title={firstName ? `أهلاً، ${firstName}` : "حجوزاتي"}
      description={formatUpcomingBookingsLabel(upcomingCount)}
      action={
        <Button size="sm" className="rounded-full gap-1.5" asChild>
          <Link href="/user/stadiums">
            <Plus className="h-4 w-4" />
            حجز جديد
          </Link>
        </Button>
      }
    />
  );
}
