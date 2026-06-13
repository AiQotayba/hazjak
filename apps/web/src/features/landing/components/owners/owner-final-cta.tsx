import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { APP_CITIES } from "@hazjak/constants";
import { Button } from "@/components/ui/button";

export function OwnerFinalCta() {
  return (
    <section className="py-16 md:py-20 bg-section-alt border-t border-border/40">
      <div className="mx-auto max-w-6xl px-4">
        <div className="rounded-3xl bg-gradient-to-l from-primary/10 via-accent/30 to-secondary px-6 py-10 md:py-12 text-center shadow-soft">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-heading">
            جاهز تضيف ملعبك؟
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            أنشئ حساباً، أضف بيانات الملعب والأسعار، وابدأ استقبال الطلبات من اللاعبين في{" "}
            {APP_CITIES.join(" و")}.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" className="rounded-full shadow-soft gap-2" asChild>
              <Link href="/register/owner">
                ابدأ الآن
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full border-0 bg-card" asChild>
              <Link href="/login">تسجيل الدخول</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
