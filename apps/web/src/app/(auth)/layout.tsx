import Link from "next/link";
import { CalendarDays, MapPin, ShieldCheck } from "lucide-react";
import { APP_TAGLINE_AR } from "@hazjak/constants";
import { APP_NAME_AR } from "@/lib/brand";

const highlights = [
  {
    icon: MapPin,
    title: "ملاعب موثّقة",
    description: "تصفّح الملاعب في مدينتك واحجز بثقة",
  },
  {
    icon: CalendarDays,
    title: "حجز فوري",
    description: "اختر الموعد وأكّد حجزك في دقائق",
  },
  {
    icon: ShieldCheck,
    title: "حساب آمن",
    description: "تابع حجوزاتك وإشعاراتك من مكان واحد",
  },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-background overflow-hidden">
      <div className="absolute inset-0 blob-orange pointer-events-none" aria-hidden />
      <div className="absolute top-1/4 -end-20 h-64 w-64 rounded-full bg-accent-gold/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -start-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <div className="relative flex flex-1 flex-col lg:flex-row">
        <aside className="hidden lg:flex lg:w-[42%] xl:w-[45%] flex-col justify-between p-10 xl:p-14 bg-gradient-to-br from-primary/10 via-secondary to-accent/30">
          <Link href="/" className="transition-opacity hover:opacity-90">
            <span className="font-display text-3xl font-bold text-heading block">{APP_NAME_AR}</span>
            <span className="text-sm text-muted-foreground mt-2 block max-w-xs">{APP_TAGLINE_AR}</span>
          </Link>

          <div className="space-y-5 my-10">
            {highlights.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-card shadow-soft">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-heading">{title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground"> 
            منصة حجز الملاعب الرياضية في سوريا
          </p>
        </aside>

        <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-10 lg:py-12">
          <Link
            href="/"
            className="relative mb-8 text-center transition-opacity hover:opacity-90 lg:hidden"
          >
            <span className="font-display text-2xl font-bold text-heading block">{APP_NAME_AR}</span>
            <span className="text-xs text-muted-foreground mt-1 block">{APP_TAGLINE_AR}</span>
          </Link>

          <div className="relative w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
