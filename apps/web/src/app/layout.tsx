import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import { APP_CITIES } from "@hazjak/constants";
import { APP_NAME_AR } from "@/lib/brand";
import { citiesLabel, ogImage } from "@/lib/seo";
import { Providers } from "./providers";
import "./globals.css";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-tajawal",
});

const defaultDescription = `منصة حجز ملاعب كرة القدم في ${citiesLabel}. تصفّح الملاعب، أرسل طلب حجز، واستلم تأكيداً من صاحب الملعب.`;

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME_AR} — احجز ملعبك في ${APP_CITIES.join(" و")}`,
    template: `%s | ${APP_NAME_AR}`,
  },
  description: defaultDescription,
  applicationName: APP_NAME_AR,
  metadataBase: new URL(process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000"),
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  openGraph: {
    siteName: APP_NAME_AR,
    locale: "ar_SY",
    type: "website",
    images: [{ url: ogImage, width: 512, height: 512, alt: APP_NAME_AR }],
  },
  twitter: { card: "summary_large_image" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className={tajawal.variable} suppressHydrationWarning>
      <body className="min-h-dvh bg-background text-foreground font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
