import {
  Calendar,
  CheckCircle2,
  BarChart3,
  MessageSquare,
  Banknote,
  Shield,
} from "lucide-react";

const items = [
  {
    icon: CheckCircle2,
    title: "قبول ورفض بنقرة",
    desc: "كل طلب يصلك مع اسم اللاعب والموعد. تقبل أو ترفض والإشعار يصله فوراً.",
  },
  {
    icon: Calendar,
    title: "تقويم بدون تعارض",
    desc: "المواعيد المحجوزة تظهر تلقائياً — ما عاد حجزين على نفس الساعة.",
  },
  {
    icon: Banknote,
    title: "سعر صباحي ومسائي",
    desc: "حدّد سعر الساعة الصباحية والمسائية والعربون من لوحتك.",
  },
  {
    icon: BarChart3,
    title: "إحصائيات واضحة",
    desc: "عدد الحجوزات، الإيرادات، ونسبة الإلغاء — صباحي مقابل مسائي.",
  },
  {
    icon: MessageSquare,
    title: "رد على التقييمات",
    desc: "شوف تقييمات اللاعبين ورد عليهم من نفس الحساب.",
  },
  {
    icon: Shield,
    title: "سياسة إلغاء موحّدة",
    desc: "اللاعب يلغي قبل 24 ساعة حسب قواعد المنصة — أقل جدال عند الملعب.",
  },
];

export function OwnerFeatures() {
  return (
    <section className="py-16 md:py-20 bg-section-alt">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="font-display text-2xl font-bold text-heading mb-1 text-center md:text-start">
          كل اللي تحتاجه كصاحب ملعب
        </h2>
        <p className="text-sm text-muted-foreground mb-8 text-center md:text-start">
          مصمّم لفرق كرة القدم في حلب وإدلب.
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ icon: Icon, title, desc }) => (
            <article
              key={title}
              className="rounded-3xl bg-card p-6 text-start shadow-soft hover:shadow-card transition-shadow"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold text-heading text-sm">{title}</h3>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
