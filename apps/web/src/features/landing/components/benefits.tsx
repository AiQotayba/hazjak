import { Section, SectionHeading } from "./section";

const benefits = [
  {
    before: "تسأل 4 ملاعب بالتليفون وتسمع «ما في فاضي»",
    after: "تفتح القائمة وتشوف المواعيد الفاضية فوراً",
    proof: "توفّر 40 دقيقة قبل كل مباراة",
  },
  {
    before: "حجز شفهي بدون تأكيد مكتوب",
    after: "طلب رسمي + إشعار عند القبول أو الرفض",
    proof: "صفر مفاجآت يوم المباراة",
  },
  {
    before: "عربون غامض وإلغاء بدون قواعد",
    after: "سياسة واضحة: إلغاء قبل 24 ساعة بدون خسارة العربون",
    proof: "تعرف شو تدفع قبل ما توافق",
  },
];

export function LandingBenefits() {
  return (
    <Section id="benefits" alt>
      <SectionHeading
        title="شو يتغيّر لما تحجز عبر بي بلاي؟"
        description="قبل وبعد — بدون وعود فاضية."
        centered
      />
      <div className="space-y-4 max-w-3xl mx-auto">
        {benefits.map((b) => (
          <article
            key={b.after}
            className="grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center rounded-3xl bg-card shadow-soft p-5 text-sm"
          >
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">قبل</p>
              <p className="text-muted-foreground line-through decoration-primary/30">
                {b.before}
              </p>
            </div>
            <span className="hidden md:inline text-primary font-bold text-lg" aria-hidden>
              →
            </span>
            <div>
              <p className="text-xs text-primary font-bold mb-0.5">بعد</p>
              <p className="font-bold text-heading">{b.after}</p>
              <p className="text-xs text-muted-foreground mt-1">{b.proof}</p>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
