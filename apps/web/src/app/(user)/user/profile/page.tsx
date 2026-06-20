"use client";

import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EditProfileDialog } from "@/features/user-profile/components/edit-profile-dialog";
import { ProfileBookingStats } from "@/features/user-profile/components/profile-booking-stats";
import { ProfileQuickLinks } from "@/features/user-profile/components/profile-quick-links";
import { ProfileRecentBookings } from "@/features/user-profile/components/profile-recent-bookings";
import { UserProfileHero } from "@/features/user-profile/components/user-profile-hero";
import type { BookingListItemData } from "@/features/user-bookings/components/booking-list-item";
import { api } from "@/lib/api";
import { computeBookingStats, type BookingStats } from "@/features/user-bookings/lib/user-bookings";
import { useAuthStore } from "@/features/auth/store/auth";
import type { PaginationMeta } from "@hazjak/types";

export default function UserProfilePage() {
  const { user, token, logout } = useAuthStore();
  const router = useRouter();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    setStatsLoading(true);
    api<BookingListItemData[]>("/bookings?limit=100", { token })
      .then((res) => {
        const list = (res.data as BookingListItemData[]) ?? [];
        const meta = res.meta as PaginationMeta | undefined;
        setStats(computeBookingStats(list, meta?.total));
      })
      .finally(() => setStatsLoading(false));
  }, [token, router]);

  function handleLogout() {
    logout();
    setLogoutOpen(false);
    router.replace("/login");
  }

  return (
    <>
      <div className="lg:grid lg:grid-cols-[minmax(260px,300px)_1fr] lg:items-start lg:gap-8">
        {/* يمين — كارد الملف ثابت بدون scroll */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <UserProfileHero user={user} onEdit={() => setEditOpen(true)} />
        </aside>

        {/* يسار — المحتوى التكميلي مع scroll */}
        <div className="mt-6 space-y-6 lg:mt-0 lg:min-h-0 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto lg:pe-1">
          {savedMsg && (
            <p className="text-sm font-medium text-primary rounded-lg bg-primary/10 px-3 py-2">
              {savedMsg}
            </p>
          )}

          <ProfileQuickLinks upcomingCount={stats?.upcoming} />
          <ProfileBookingStats stats={stats} loading={statsLoading} />
          <ProfileRecentBookings bookings={stats?.recentBookings ?? []} loading={statsLoading} />

        </div>
      </div>

      <EditProfileDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={() => {
          setSavedMsg("حدّثت ملفك الشخصي");
          setTimeout(() => setSavedMsg(""), 3000);
        }}
      />
    </>
  );
}
