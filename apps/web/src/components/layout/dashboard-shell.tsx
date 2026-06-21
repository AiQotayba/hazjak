"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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
import { ConfirmAlert } from "@/components/ui/confirm-alert";

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
              "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
              active
                ? "bg-primary/10 text-primary font-bold border-e-4 border-primary"
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

function UserFooter({
  onLogout,
  profileHref = "/owner/profile",
}: {
  onLogout: () => void;
  profileHref?: string;
}) {
  const { user } = useAuthStore();

  return (
    <div className="p-4">
      <Link
        href={profileHref}
        className="flex items-center gap-3 rounded-2xl bg-section-alt p-3 hover:bg-muted transition-colors"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary ring-2 ring-primary/20">
          {user?.firstName?.charAt(0) ?? "?"}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-heading">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="truncate text-xs text-muted-foreground">{user?.phone}</p>
        </div>
      </Link>
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
  profileHref = "/owner/profile",
}: {
  title: string;
  nav: NavItem[];
  children: React.ReactNode;
  contentClassName?: string;
  profileHref?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutAlertOpen, setLogoutAlertOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  function handleLogout() {
    logout();
    router.replace("/login");
    setLogoutAlertOpen(false);
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-section-alt p-0 md:p-3 md:ps-0">
      <aside className="hidden w-60 shrink-0 flex-col rounded-3xl border border-border/60 bg-card shadow-soft md:m-3 md:me-0 md:flex md:h-[calc(100dvh-1.5rem)]">
        <div className="px-5 py-5">
          <Link href="/" className="inline-flex items-center hover:opacity-90 transition-opacity">
            <Image
              src="/logo.png"
              alt={APP_NAME_AR}
              width={120}
              height={36}
              className="h-9 w-auto"
              priority
            />
          </Link>
          <p className="text-xs text-muted-foreground mt-1.5">{title}</p>
        </div>
        <Separator />
        <SidebarNav nav={nav} pathname={pathname} />
        <Separator />
        <UserFooter onLogout={() => setLogoutAlertOpen(true)} profileHref={profileHref} />
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
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
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/logo.png"
                alt={APP_NAME_AR}
                width={96}
                height={28}
                className="h-7 w-auto"
              />
            </Link>
            <p className="text-[10px] text-muted-foreground truncate mt-0.5">{title}</p>
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
                className="inline-flex items-center"
                onClick={() => setMenuOpen(false)}
              >
                <Image
                  src="/logo.png"
                  alt={APP_NAME_AR}
                  width={120}
                  height={36}
                  className="h-9 w-auto"
                />
              </Link>
              <p className="text-xs text-muted-foreground mt-1.5">{title}</p>
            </div>
            <Separator />
            <SidebarNav nav={nav} pathname={pathname} onNavigate={() => setMenuOpen(false)} />
            <Separator />
            <UserFooter onLogout={() => setLogoutAlertOpen(true)} profileHref={profileHref} />
          </DialogContent>
        </Dialog>

        <ConfirmAlert
          open={logoutAlertOpen}
          onOpenChange={setLogoutAlertOpen}
          title="تسجيل الخروج"
          description="هل تريد تسجيل الخروج من حسابك؟"
          confirmLabel="خروج"
          onConfirm={handleLogout}
        />

        <main className="min-h-0 flex-1 overflow-y-auto bg-card md:m-3 md:rounded-3xl md:border md:border-border/60 md:shadow-soft">
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
