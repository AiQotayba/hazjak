import "@fontsource/tajawal/400.css";
import "@fontsource/tajawal/700.css";
import { Providers } from "./providers";
import "./globals.css";

export const metadata = {
  title: "حجزك | لوحة الإدارة",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-dvh antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
