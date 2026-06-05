"use client";
import { useEffect, useState } from "react";
import { LogOut, Mail, Pencil, Phone, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
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
import { UserProfileHero } from "@/features/user-profile/components/user-profile-hero";
import type { BookingListItemData } from "@/features/user-bookings/components/booking-list-item";
import { api } from "@/lib/api";
import { computeBookingStats, type BookingStats } from "@/features/user-bookings/lib/user-bookings";
import { useAuthStore } from "@/features/auth/store/auth";
import type { PaginationMeta } from "@beeplay/types";

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

  const rows = [
    { label: "الاسم الكامل", value: `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim(), icon: UserRound },
    { label: "البريد الإلكتروني", value: user?.email, icon: Mail },
    { label: "رقم الهاتف", value: user?.phone || "—", icon: Phone },
  ];

  function handleLogout() {
    logout();
    setLogoutOpen(false);
    router.replace("/login");
  }

  return (
    <>
      <UserProfileHero user={user} />
      <ProfileBookingStats stats={stats} loading={statsLoading} />

      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="text-sm font-bold text-heading">بيانات الحساب</h2>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 shadow-soft border-0 h-8 text-xs"
          onClick={() => setEditOpen(true)}
        >
          <Pencil className="h-3.5 w-3.5" />
          تعديل
        </Button>
      </div>

      {savedMsg && (
        <p className="text-sm text-primary font-medium mb-3 rounded-xl bg-primary/10 px-3 py-2">
          {savedMsg}
        </p>
      )}

      <Card className="border-0 shadow-card">
        <CardContent className="p-4 space-y-2">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-3 text-sm rounded-xl bg-secondary/60 px-3 py-2.5"
            >
              <span className="flex items-center gap-2 text-muted-foreground shrink-0">
                <row.icon className="h-4 w-4 text-primary" />
                {row.label}
              </span>
              <span className="font-medium text-heading text-end break-all">{row.value}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <EditProfileDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={() => {
          setSavedMsg("تم تحديث الملف الشخصي");
          setTimeout(() => setSavedMsg(""), 3000);
        }}
      />

      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full mt-6 gap-2 text-destructive shadow-soft border-0 bg-destructive/5"
          >
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>تسجيل الخروج</DialogTitle>
            <DialogDescription>
              هل تريد تسجيل الخروج من حسابك؟ ستحتاج لتسجيل الدخول مجدداً للوصول إلى حجوزاتك.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2 flex flex-row *:w-full">
            <Button variant="outline" onClick={() => setLogoutOpen(false)}>
              إلغاء
            </Button>
            <Button variant="destructive" className="gap-2" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              تأكيد الخروج
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
