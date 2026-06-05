import { Clock, MapPin, Sparkles } from "lucide-react";
import { APP_CITIES } from "@beeplay/constants";

const items = [
  {
    icon: Clock,
    title: "أقل من ساعة",
    desc: "متوسط وقت الرد على طلب الحجز",
  },
  {
    icon: Sparkles,
    title: "مجاني لشهرين",
    desc: "التسجيل مجاني",
  },
  {
    icon: MapPin,
    title: APP_CITIES.join(" · "),
    desc: "اللاعب يبحث حسب المدينة ويرسل طلباً واضحاً",
  },
];

export function OwnerValueStrip() {
  return (
    <section className="py-8 md:py-10">
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
