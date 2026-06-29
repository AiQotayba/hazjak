"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, Search, UserPlus } from "lucide-react";
import { APP_COUNTRY_AR } from "@hazjak/constants";
import { APP_NAME_AR } from "@/lib/brand";
import Image from "next/image";
import { useAuthStore } from "@/features/auth/store/auth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InstallAppButton } from "@/features/pwa/components/install-app-button";
import {
  isNavLinkActive,
  ownerAccountNav,
  publicNav,
  stadiumsHrefForRole,
  userAccountNav,
} from "@/components/layout/app-nav";
import { cn } from "@/lib/utils";

function useIsLocalHost() {
  const [isLocal, setIsLocal] = useState(false);

  useEffect(() => {
    const { hostname } = window.location;
    setIsLocal(
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "[::1]" ||
      hostname.endsWith(".local")
    );
  }, []);

  return isLocal;
}

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, logout } = useAuthStore();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isLocal = useIsLocalHost();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const stadiumsHref = stadiumsHrefForRole(user?.role);
  const accountNav =
    user?.role === "STADIUM_OWNER"
      ? ownerAccountNav
      : user?.role === "USER"
        ? userAccountNav
        : null;

  function handleLogout() {
    logout();
    setLogoutOpen(false);
    router.replace("/login");
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="page-container flex h-14 items-center justify-between gap-3">
          <div className="flex items-center gap-6 sm:gap-4">
            {!accountNav && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full h-9 w-9 md:hidden"
                onClick={() => setMenuOpen(true)}
                aria-label="فتح القائمة"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}

            <Link href="/" className="flex items-center gap-2 shrink-0">
              <Image src="/logo.png" alt={APP_NAME_AR} width={36} height={36} className="h-9 w-9" />
              <div className="hidden sm:block leading-tight">
                <span className="font-display text-lg font-bold text-primary">{APP_NAME_AR}</span>
                <p className="text-[10px] font-medium text-muted-foreground">{APP_COUNTRY_AR}</p>
              </div>
            </Link>
          </div>

          {!accountNav && (
            <nav className="hidden md:flex flex-1 items-center justify-center gap-5">
              {publicNav.map((item) => {
                const active = isNavLinkActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "text-sm transition-colors pb-0.5 border-b-2",
                      active
                        ? "text-primary font-semibold border-primary"
                        : "text-muted-foreground border-transparent hover:text-heading"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {accountNav && (
            <nav
              className="flex flex-1 items-center gap-1 overflow-x-auto scrollbar-none px-1"
              aria-label="قائمة الحساب"
            >
              {accountNav.map(({ href, icon: Icon, label }) => {
                const active = isNavLinkActive(pathname, href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-heading"
                    )}
                  >
                    {Icon && <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                    {label}
                  </Link>
                );
              })}
            </nav>
          )}

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-9 w-9 text-primary hover:bg-accent"
              asChild
            >
              <Link href={stadiumsHref} aria-label="بحث الملاعب">
                <Search className="h-4 w-4" />
              </Link>
            </Button>

            <InstallAppButton />

            {token && user ? (
              isLocal ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-9 w-9 text-muted-foreground hover:text-destructive"
                  onClick={() => setLogoutOpen(true)}
                  aria-label="تسجيل الخروج"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              ) : null
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full h-9 px-2.5 sm:px-3 text-xs sm:text-sm"
                  asChild
                >
                  <Link href="/login">تسجيل دخول</Link>
                </Button>
                <Button
                  size="sm"
                  className="rounded-full h-9 px-2.5 sm:px-3 text-xs sm:text-sm hidden md:inline-flex"
                  asChild
                >
                  <Link href="/register">إنشاء حساب</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {!accountNav && (
        <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
          <DialogContent
            dir="rtl"
            className={cn(
              "fixed inset-y-0 start-0 end-auto top-0 z-50 flex h-full w-[min(100vw-1rem,18rem)] max-w-none flex-col gap-0",
              "translate-x-0 translate-y-0 rounded-none rounded-es-3xl border-0 bg-card p-0 shadow-card",
              "data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
              "data-[state=closed]:zoom-out-100 data-[state=open]:zoom-in-100"
            )}
          >
            <DialogTitle className="sr-only">قائمة الموقع</DialogTitle>
            <div className="px-4 py-4 border-b border-border/60">
              <Link href="/" className="inline-flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                <Image src="/logo.png" alt={APP_NAME_AR} width={36} height={36} className="h-9 w-9" />
                <div className="leading-tight">
                  <span className="font-display text-base font-bold text-primary">{APP_NAME_AR}</span>
                  <p className="text-[10px] font-medium text-muted-foreground">{APP_COUNTRY_AR}</p>
                </div>
              </Link>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 space-y-1" aria-label="تصفح الموقع">
              {publicNav.map((item) => {
                const active = isNavLinkActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary font-bold"
                        : "text-muted-foreground hover:bg-muted hover:text-heading"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {!token && (
              <>
                <Separator />
                <div className="p-3">
                  <Button className="w-full rounded-xl gap-2 h-11" asChild>
                    <Link href="/register" onClick={() => setMenuOpen(false)}>
                      <UserPlus className="h-4 w-4" />
                      إنشاء حساب
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent className="max-w-sm rounded-xl">
          <DialogHeader>
            <DialogTitle>تسجيل الخروج</DialogTitle>
            <DialogDescription>هل تريد تسجيل الخروج من حسابك؟</DialogDescription>
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
