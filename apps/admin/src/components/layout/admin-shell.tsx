"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  MapPin,
  ClipboardList,
  MessageSquare,
  Bell,
  BarChart3,
  Settings,
  LogOut,
  Plus,
} from "lucide-react";
import { APP_NAME_AR } from "@hazjak/constants";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import { AdminTopBar } from "@/features/shell/components/admin-top-bar";
const nav = [
  { href: "/", icon: LayoutDashboard, label: "نظرة عامة" },
  { href: "/stadiums", icon: MapPin, label: "الملاعب" },
  { href: "/bookings", icon: ClipboardList, label: "الحجوزات" },
  { href: "/users", icon: Users, label: "المستخدمون" },
  { href: "/reviews", icon: MessageSquare, label: "التقييمات" },
  { href: "/reports", icon: BarChart3, label: "التقارير" },
  { href: "/notifications", icon: Bell, label: "الإشعارات" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <div className="flex min-h-dvh bg-background">
      <aside className="hidden w-60 shrink-0 flex-col bg-card border-e border-border/60 md:flex">
        <div className="px-5 pt-6 pb-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white font-bold text-sm">
              ب
            </div>
            <div>
              <p className="text-base font-bold text-heading leading-tight">{APP_NAME_AR}</p>
              <p className="text-[10px] text-muted-foreground">لوحة الإدارة</p>
            </div>
          </Link>
        </div>

        <div className="px-4 mb-4">
          <Link
            href="/stadiums"
            className="inline-flex w-full items-center justify-center gap-2 h-11 rounded-[var(--radius-pill)] bg-brand text-white font-bold text-sm hover:bg-brand-hover shadow-md shadow-brand/20 transition-colors"
          >
            <Plus className="h-4 w-4" />
            إضافة ملعب
          </Link>
        </div>

        <nav className="flex-1 space-y-0.5 px-3">
          {nav.map(({ href, icon: Icon, label }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand/10 text-brand"
                    : "text-muted-foreground hover:bg-secondary hover:text-heading"
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                    active ? "bg-brand text-white" : "bg-secondary text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-border/60 p-3 space-y-1">
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              pathname.startsWith("/settings")
                ? "bg-brand/10 text-brand"
                : "text-muted-foreground hover:bg-secondary"
            )}
          >
            <Settings className="h-4 w-4" />
            الإعدادات
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
            خروج
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col  h-screen overflow-y-scroll">
        <header className="flex items-center justify-between border-b border-border/60 bg-card px-4 py-2.5 md:hidden">
          <Link href="/" className="text-sm font-bold text-brand">
            {APP_NAME_AR}
          </Link>
          <button type="button" onClick={handleLogout} className="text-xs text-muted-foreground">
            خروج
          </button>
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b border-border/60 px-2 py-2 md:hidden">
          {nav.map(({ href, label }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-bold",
                  active ? "bg-brand text-white" : "text-muted-foreground bg-secondary"
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:block">
          <AdminTopBar />
        </div>

        <main className="flex-1 overflow-auto px-4 py-5 md:px-6 md:py-6">{children}</main>
      </div>
    </div>
  );
}
