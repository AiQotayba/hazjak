import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Section } from "./section";

export function LandingMidCta() {
  return (
    <Section className="py-12">
      <div className="rounded-3xl bg-card shadow-soft px-6 py-8 text-center">
        <p className="font-display text-xl font-bold text-heading">
          مباراة الأسبوع الجاي محتاجة ملعب؟
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          حساب مجاني — بدون بطاقة للتصفح.
        </p>
        <Button className="mt-5 rounded-full shadow-soft" size="lg" asChild>
          <Link href="/stadiums">شوف المواعيد الفاضية</Link>
        </Button>
      </div>
    </Section>
  );
}
