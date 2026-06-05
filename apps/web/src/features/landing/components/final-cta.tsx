import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Section } from "./section";
import { APP_CITIES } from "@beeplay/constants";

export function LandingFinalCta() {
  return (
    <Section className="py-12 md:py-16">
      <div className="relative rounded-3xl bg-section-alt px-6 py-10 md:px-12 md:py-14 overflow-hidden shadow-soft">
        <div
          className="pointer-events-none absolute -end-20 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-2xl"
          aria-hidden
        />
        <div className="relative max-w-xl mx-auto text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-heading">
            جاهز تحجز في {APP_CITIES.join(" أو ")}؟
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            تصفح مجاناً — وألغِ قبل 24 ساعة بدون خسارة العربون.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="بريدك للتنبيهات (اختياري)"
              className="h-11 rounded-full bg-background border-border flex-1"
            />
            <Button type="button" size="lg" className="shrink-0 rounded-full shadow-soft" asChild>
              <Link href="/stadiums">ابدأ الحجز</Link>
            </Button>
          </div>
          <Button variant="link" className="mt-3" asChild>
            <Link href="/register/owner">صاحب ملعب؟ سجّل مجاناً</Link>
          </Button>
        </div>
      </div>
    </Section>
  );
}
