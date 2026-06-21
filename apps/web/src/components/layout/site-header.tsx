"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Search } from "lucide-react";
import { APP_NAME_AR } from "@/lib/brand";
import Image from "next/image";
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
  const isLocal = useIsLocalHost();

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
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image src="/logo.png" alt={APP_NAME_AR} width={36} height={36} className="h-9 w-9" />
            <span className="font-display text-lg font-bold text-primary hidden sm:inline">
              {APP_NAME_AR}
            </span>
          </Link>

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

          <div className="flex items-center gap-1.5 shrink-0">
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
                <Button variant="ghost" size="sm" className="rounded-full hidden sm:inline-flex" asChild>
                  <Link href="/login">دخول</Link>
                </Button>
                <Button size="sm" className="rounded-full" asChild>
                  <Link href="/register">إنشاء حساب</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

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
