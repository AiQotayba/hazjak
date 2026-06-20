import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { cn } from "@/lib/utils";

export function AppShell({
  children,
  className,
  showFooter = true,
}: {
  children: React.ReactNode;
  className?: string;
  showFooter?: boolean;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />
      <main className={cn("page-container flex-1 py-6 md:py-8", className)}>{children}</main>
      {showFooter && <SiteFooter />}
    </div>
  );
}
