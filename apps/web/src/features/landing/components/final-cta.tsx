import Link from "next/link";
import { APP_COUNTRY_AR } from "@hazjak/constants";
import { Button } from "@/components/ui/button";
import { Section } from "./section";

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
            جاهز تحجز في {APP_COUNTRY_AR}؟
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            تصفّح مجاناً — حساب بسيط لإرسال طلب الحجز.
          </p>
          <div className="mt-6 flex justify-center">
            <Button type="button" size="lg" className="rounded-full shadow-soft" asChild>
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
