import { APP_NAME_AR } from "@/lib/brand";
import { Section, SectionHeading } from "./section";

export function LandingSolution() {
  return (
    <Section id="solution">
      <SectionHeading
        eyebrow="الحل"
        title={`${APP_NAME_AR} — حجز واضح من أول نقرة`}
        description="منصة واحدة تربطك بملاعب المنطقة: مواعيد محدثة، طلب حجز، وتأكيد من صاحب الملعب."
      />
      <div className="rounded-3xl bg-section-alt p-6 md:p-8 shadow-soft">
        <ul className="space-y-4 text-sm md:text-base">
          {[
            "شوف كل الملاعب في مدينتك مع السعر الصباحي والمسائي",
            "اختر الساعة اللي تناسبك وأرسل طلب — صاحب الملعب يوافق أو يرفض، غالباً خلال ساعة",
            "بعد التأكيد: تفاصيل التواصل والعربون واضحة في حسابك",
          ].map((point) => (
            <li key={point} className="flex gap-3 items-start">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold"
                aria-hidden
              >
                ✓
              </span>
              <span className="text-muted-foreground leading-relaxed">{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
