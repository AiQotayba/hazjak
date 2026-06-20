import { CalendarDays, MapPin, ShieldCheck } from "lucide-react";
import { AuthBrand } from "@/features/auth/components/auth-brand";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

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
    <div className="flex min-h-dvh flex-col bg-background">
      <SiteHeader />
      <div className="flex flex-1 flex-col lg:flex-row">
        <aside className="hidden lg:flex lg:w-[40%] xl:w-[42%] flex-col justify-between border-e border-border p-10 xl:p-14 bg-gradient-to-b from-accent/50 to-muted/20">
          <AuthBrand size="lg" showMotto showTagline />

          <div className="space-y-5 my-10">
            {highlights.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-heading">{title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">منصة حجز الملاعب الرياضية في سوريا</p>
        </aside>

        <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 lg:py-12">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
