import { PhoneOff, CalendarX, MapPin } from "lucide-react";
import { Section, SectionHeading } from "./section";

const problems = [
  {
    icon: PhoneOff,
    stat: "4+ مكالمات",
    pain: "تتصل بملاعب حلب أو إدلب لتسأل عن الموعد",
    consequence: "تضيع وقتك قبل ما تعرف مين فاضي",
  },
  {
    icon: CalendarX,
    stat: "حجز مزدوج",
    pain: "اتفقت شفهياً ووصلت الملعب محجوز",
    consequence: "المباراة تتأجل والفريق يزعل",
  },
  {
    icon: MapPin,
    stat: "مدينتان",
    pain: "ما في مكان واحد يجمع ملاعب حلب وإدلب",
    consequence: "كل أسبوع تبدأ البحث من الصفر",
  },
];

export function LandingProblem() {
  return (
    <Section id="problem">
      <SectionHeading
        eyebrow="المشكلة"
        title="حجز الملاعب لسا يدوي"
        description="في حلب وإدلب، كثير الفرق تعتمد على واتساب ومكالمات."
        centered
      />
      <div className="grid gap-5 md:grid-cols-3">
        {problems.map(({ icon: Icon, stat, pain, consequence }) => (
          <article
            key={pain}
            className="rounded-3xl bg-card p-6 shadow-soft hover:shadow-card transition-shadow"
          >
            <Icon className="h-6 w-6 text-primary mb-3" aria-hidden />
            <p className="text-2xl font-display font-bold text-primary">{stat}</p>
            <h3 className="mt-2 font-bold text-heading text-sm">{pain}</h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{consequence}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}
