import { Clock, MapPin, Wallet } from "lucide-react";
import { APP_COUNTRY_AR } from "@hazjak/constants";

const items = [
  {
    icon: MapPin,
    title: APP_COUNTRY_AR,
    desc: "ملاعب موثّقة في مدينتك — ابحث بالحي والسعر",
  },
  {
    icon: Clock,
    title: "أقل من ساعة",
    desc: "متوسط وقت رد صاحب الملعب على طلب الحجز",
  },
  {
    icon: Wallet,
    title: "عربون واضح",
    desc: "تعرف المبلغ قبل الإرسال — إلغاء قبل 24 ساعة",
  },
];

export function LandingValueStrip() {
  return (
    <section className="py-8 md:py-10 bg-background">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-3 sm:grid-cols-3">
          {items.map(({ icon: Icon, title, desc }) => (
            <article
              key={title}
              className="rounded-3xl bg-card p-5 shadow-soft flex items-start gap-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="h-5 w-5 text-primary" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="font-display text-lg font-bold text-heading leading-tight">{title}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
