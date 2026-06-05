import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    n: 1,
    color: "bg-accent-gold/25 text-accent-gold",
    title: "أنشئ حساب صاحب ملعب",
    desc: "دقيقة واحدة — أضف اسم الملعب ومدينته (حلب أو إدلب).",
  },
  {
    n: 2,
    color: "bg-primary/15 text-primary",
    title: "حدّد الأسعار والمواعيد",
    desc: "سعر الصباح والمساء، والعربون إن وجد.",
  },
  {
    n: 3,
    color: "bg-accent-teal/40 text-teal-800",
    title: "استقبل الحجوزات",
    desc: "اللاعبون يطلبون من التطبيق — أنت توافق من لوحة التحكم.",
  },
];

export function OwnerSteps() {
  return (
    <section className="py-16 md:py-20 bg-background border-y border-border">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="font-display text-2xl font-bold text-heading mb-8 text-center md:text-start">
          ثلاث خطوات وتبدأ
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((s) => (
            <Card key={s.n} className="border-0 shadow-soft rounded-3xl">
              <CardContent className="p-6">
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold ${s.color}`}
                >
                  {s.n}
                </span>
                <h3 className="mt-4 font-bold text-heading">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
