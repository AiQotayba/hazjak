import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-tajawal",
});

export const metadata: Metadata = {
  title: "بي بلاي | احجز ملعبك بضغطة",
  description:
    "منصة حجز ملاعب كرة القدم — تصفح، احجز، وتابع تأكيد صاحب الملعب.",
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
