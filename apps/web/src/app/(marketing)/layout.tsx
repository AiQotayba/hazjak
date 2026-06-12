import type { Metadata } from "next";
import { APP_NAME_AR } from "@/lib/brand";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export const metadata: Metadata = {
  keywords: ["حجز ملاعب", "حلب", "إدلب", "كرة قدم", APP_NAME_AR],
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
