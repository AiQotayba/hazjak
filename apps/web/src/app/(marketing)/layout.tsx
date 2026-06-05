import type { Metadata } from "next";
import { APP_NAME_AR, APP_CITIES } from "@beeplay/constants";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

const siteUrl = process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000";
const cities = APP_CITIES.join(" و");

const title = `${APP_NAME_AR} — احجز ملعبك في ${cities}`;
const description = `منصة حجز ملاعب كرة القدم في ${cities}. تصفح الملاعب، أرسل طلب حجز، واستلم تأكيداً من صاحب الملعب.`;

export const metadata: Metadata = {
  title,
  description,
  keywords: ["حجز ملاعب", "حلب", "إدلب", "كرة قدم", APP_NAME_AR],
  openGraph: { title, description, url: siteUrl, locale: "ar_SY", type: "website" },
  alternates: { canonical: siteUrl },
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
