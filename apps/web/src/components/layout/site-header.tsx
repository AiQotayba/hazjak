"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LogOut, User } from "lucide-react";
import { APP_NAME_AR } from "@beeplay/constants";
import { useAuthStore } from "@/features/auth/store/auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "الرئيسية" },
  { href: "/stadiums", label: "الملاعب" },
  { href: "/owners", label: "لأصحاب الملاعب" },
  { href: "/#faq", label: "أسئلة" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, logout } = useAuthStore();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const dashboardHref =
    user?.role === "STADIUM_OWNER"
      ? "/owner"
      : user?.role === "ADMIN"
        ? process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3001"
        : "/user/bookings";

  function handleLogout() {
    logout();
    setLogoutOpen(false);
    router.replace("/login");
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="font-display text-xl font-bold text-heading">
              {APP_NAME_AR}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {nav.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : item.href.startsWith("/#")
                    ? false
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm transition-colors",
                    active
                      ? "text-primary font-bold"
                      : "text-muted-foreground hover:text-heading"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {token && user ? (
              <>
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/user/notifications" aria-label="الإشعارات">
                    <Bell className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={dashboardHref}>
                    <User className="h-3.5 w-3.5" />
                    {user.firstName}
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLogoutOpen(true)}
                  aria-label="خروج"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">دخول</Link>
                </Button>
                <Button size="sm" className="shadow-soft" asChild>
                  <Link href="/register">إنشاء حساب</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>تسجيل الخروج</DialogTitle>
            <DialogDescription>
              هل تريد تسجيل الخروج من حسابك؟
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
