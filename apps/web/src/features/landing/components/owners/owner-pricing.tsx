import Link from "next/link";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const planFeatures = [
  "لوحة تحكم كاملة لإدارة الملعب",
  "قبول ورفض الحجوزات فوراً",
  "تقويم أسبوعي بدون تعارض",
  "إحصائيات الحجوزات والإيرادات",
  "صفحة ملعب عامة للاعبين",
  // "رد على تقييمات اللاعبين", 
];

function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="mt-6 space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/12">
            <Check className="h-3 w-3 text-primary" aria-hidden />
          </span>
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function OwnerPricing() {
  return (
    <section className="py-16 md:py-20 bg-background border-y border-border/40">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-10 text-center md:text-start">
          <h2 className="font-display text-2xl font-bold text-heading">التسعير</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-lg">
            نفس الميزات في الباقتين حالياً — المجانية متاحة لشهرين بدون بطاقة ائتمان.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto md:mx-0">
          <Card className="relative border-0 shadow-soft rounded-3xl overflow-hidden ring-2 ring-primary/25">
            <div className="absolute top-4 inset-s-4">
              <Badge variant="success">متاح الآن</Badge>
            </div>
            <CardContent className="p-6 pt-14">
              <p className="text-sm font-bold text-primary">الباقة المجانية</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-4xl font-bold text-heading tabular-nums">
                  مجاني
                </span>
                <span className="text-sm text-muted-foreground">لشهرين</span>
              </div>
              <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                كل الميزات متاحة مجاناً لمدة شهرين — إدارة الحجوزات، التقويم، والإحصائيات
                بدون أي تكلفة.
              </p>

              <FeatureList items={planFeatures} />

              <Button className="mt-8 w-full rounded-2xl shadow-soft gap-2" asChild>
                <Link href="/register/owner">
                  ابدأ مجاناً
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="relative border-0 shadow-soft rounded-3xl overflow-hidden opacity-95">
            <div className="absolute top-4 inset-s-4">
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3 w-3" aria-hidden />
                قريباً
              </Badge>
            </div>
            <CardContent className="p-6 pt-14">
              <p className="text-sm font-bold text-muted-foreground">الباقة المدفوعة</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-4xl font-bold text-heading">مدفوع</span>
                <span className="text-sm text-muted-foreground">قريباً</span>
              </div>
              <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                نفس الميزات الحالية — مع إضافات قادمة قريباً للملاعب الأكثر نشاطاً.
              </p>

              <FeatureList items={planFeatures} />

              <p className="mt-4 rounded-2xl bg-secondary/60 px-3 py-2 text-xs text-muted-foreground text-center">
                ميزات أكثر قريباً
              </p>

              <Button
                variant="outline"
                className="mt-4 w-full rounded-2xl border-0 bg-secondary/80"
                disabled
              >
                متاح قريباً
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
