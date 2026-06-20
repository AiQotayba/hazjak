"use client";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { cn } from "@/lib/utils";

/** غلاف موحّد: هيدر (مع قائمة الحساب بعد الدخول) + محتوى + فوتر */
export function AppTabShell({
  children,
  contentClassName,
  showFooter = true,
}: {
  children: React.ReactNode;
  contentClassName?: string;
  showFooter?: boolean;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />
      <main className={cn("page-container flex-1 py-6 md:py-8", contentClassName)}>{children}</main>
      {showFooter && <SiteFooter />}
    </div>
  );
}
