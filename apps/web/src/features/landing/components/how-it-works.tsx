import Image from "next/image";
import { CalendarCheck, Send, Trophy } from "lucide-react";
import { Section, SectionHeading } from "./section";

const steps = [
  {
    icon: CalendarCheck,
    color: "bg-accent-gold/20 text-accent-gold",
    title: "اختر الملعب والموعد",
    description: "فلتر حسب المدينة والسعر. شوف التقويم قبل ما ترسل الطلب.",
  },
  {
    icon: Send,
    color: "bg-primary/15 text-primary",
    title: "أرسل طلب الحجز",
    description: "صاحب الملعب يستلم إشعاراً ويقبل أو يرفض — غالباً خلال ساعة.",
  },
  {
    icon: Trophy,
    color: "bg-accent-teal/30 text-teal-700",
    title: "العب بثقة",
    description: "بعد التأكيد: رقم التواصل والعربون في صفحة حجزك. تذكير قبل المباراة.",
  },
];

export function LandingHowItWorks({ compact = false }: { compact?: boolean }) {
  return (
    <Section id="how-it-works" alt className={compact ? "py-10 md:py-14" : undefined}>
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionHeading
            eyebrow="كيف يعمل"
            title="من البحث للملعب — بدون تعقيد"
            description="ثلاث خطوات بسيطة — مثل حجز رحلة، لكن لملعبك الأسبوعي."
          />
          <ol className="space-y-6">
            {steps.map((step) => (
              <li key={step.title} className="flex gap-4">
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${step.color}`}
                  aria-hidden
                >
                  <step.icon className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="font-bold text-heading">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-card">
            <Image
              src="https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=1200&auto=format"
              alt="ملعب كرة قدم"
              fill
              className="object-cover"
              sizes="400px"
            />
          </div>
          <div className="absolute -bottom-6 -end-4 rounded-2xl bg-card shadow-card border border-border p-4 w-[min(100%,220px)]">
            <p className="text-xs font-bold text-primary">حجز جاري</p>
            <p className="font-bold text-sm text-heading mt-0.5">ملعب الجامعة — إدلب</p>
            <p className="text-xs text-muted-foreground">بانتظار تأكيد المالك</p>
          </div>
        </div>
      </div>
    </Section>
  );
}
