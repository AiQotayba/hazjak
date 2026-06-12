"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, type LucideIcon } from "lucide-react";
import { APP_NAME_AR } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/features/auth/store/auth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

export type NavItem = { href: string; label: string; icon: LucideIcon };

function isNavActive(pathname: string, href: string) {
  if (href === "/owner") return pathname === "/owner";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarNav({
  nav,
  pathname,
  onNavigate,
}: {
  nav: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 space-y-1 p-3">
      {nav.map(({ href, icon: Icon, label }) => {
        const active = isNavActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary/12 text-primary font-bold"
                : "text-muted-foreground hover:bg-muted hover:text-heading"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function UserFooter({ onLogout }: { onLogout: () => void }) {
  const { user } = useAuthStore();

  return (
    <div className="p-4">
      <p className="truncate text-sm font-bold text-heading">
        {user?.firstName} {user?.lastName}
      </p>
      <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
      <Button
        variant="ghost"
        size="sm"
        className="mt-3 w-full justify-start gap-2 px-2 text-muted-foreground"
        onClick={onLogout}
      >
        <LogOut className="h-3.5 w-3.5" />
        خروج
      </Button>
    </div>
  );
}

export function DashboardShell({
  title,
  nav,
  children,
  contentClassName,
}: {
  title: string;
  nav: NavItem[];
  children: React.ReactNode;
  contentClassName?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  function handleLogout() {
    if (!confirm("تسجيل الخروج من حسابك؟")) return;
    logout();
    router.replace("/login");
  }

  return (
    <div className="flex min-h-dvh bg-section-alt">
      <aside className="hidden w-56 shrink-0 flex-col border-e border-border bg-card shadow-soft md:flex">
        <div className="px-4 py-4">
          <Link
            href="/"
            className="font-display text-lg font-bold text-heading hover:text-primary transition-colors"
          >
            {APP_NAME_AR}
          </Link>
          <p className="text-xs text-muted-foreground mt-0.5">{title}</p>
        </div>
        <Separator />
        <SidebarNav nav={nav} pathname={pathname} />
        <Separator />
        <UserFooter onLogout={handleLogout} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-border bg-card px-3 py-3 md:hidden shadow-soft">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 rounded-xl"
            onClick={() => setMenuOpen(true)}
            aria-label="فتح القائمة"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <Link href="/" className="font-display text-sm font-bold text-heading block truncate">
              {APP_NAME_AR}
            </Link>
            <p className="text-[10px] text-muted-foreground truncate">{title}</p>
          </div>
        </header>

        <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
          <DialogContent
            dir="rtl"
            className={cn(
              "fixed inset-y-0 start-0 end-auto top-0 z-50 flex h-full w-[min(100vw-1rem,17.5rem)] max-w-none flex-col gap-0",
              "translate-x-0 translate-y-0 rounded-none rounded-es-3xl border-0 bg-card p-0 shadow-card",
              "data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
              "data-[state=closed]:zoom-out-100 data-[state=open]:zoom-in-100"
            )}
          >
            <DialogTitle className="sr-only">قائمة التنقل</DialogTitle>
            <div className="px-4 py-4">
              <Link
                href="/"
                className="font-display text-lg font-bold text-heading"
                onClick={() => setMenuOpen(false)}
              >
                {APP_NAME_AR}
              </Link>
              <p className="text-xs text-muted-foreground mt-0.5">{title}</p>
            </div>
            <Separator />
            <SidebarNav nav={nav} pathname={pathname} onNavigate={() => setMenuOpen(false)} />
            <Separator />
            <UserFooter onLogout={handleLogout} />
          </DialogContent>
        </Dialog>

        <main className="flex-1 overflow-auto bg-background md:rounded-ss-3xl md:border-s md:border-t border-border">
          <div
            className={cn(
              "mx-auto w-full px-4 py-6 md:px-8 md:py-8",
              contentClassName ?? "max-w-3xl"
            )}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
