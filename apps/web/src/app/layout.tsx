import type { Metadata, Viewport } from "next";
import { Tajawal } from "next/font/google";
import { APP_COUNTRY_AR } from "@hazjak/constants";
import { APP_NAME_AR } from "@/lib/brand";
import { ogImage } from "@/lib/seo";
import { Providers } from "./providers";
import "./globals.css";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-tajawal",
});

const defaultDescription = `منصة حجز ملاعب كرة القدم في ${APP_COUNTRY_AR}. تصفّح الملاعب، أرسل طلب حجز، واستلم تأكيداً من صاحب الملعب.`;

export const viewport: Viewport = {
  themeColor: "#16a34a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME_AR} — احجز ملعبك في ${APP_COUNTRY_AR}`,
    template: `%s | ${APP_NAME_AR}`,
  },
  description: defaultDescription,
  applicationName: APP_NAME_AR,
  appleWebApp: {
    capable: true,
    title: APP_NAME_AR,
    statusBarStyle: "default",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000"),
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
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
