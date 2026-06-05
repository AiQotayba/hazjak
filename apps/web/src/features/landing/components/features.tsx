"use client";

import {
  MapPin,
  Filter,
  Bell,
  CreditCard,
  Star,
  Building2,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Section, SectionHeading } from "./section";

const features = [
  {
    icon: MapPin,
    title: "ملاعب حسب المنطقة",
    description: "حلب، إدلب، والأحياء — ابحث بالمدينة والسعر الصباحي/المسائي.",
  },
  {
    icon: Filter,
    title: "فلترة بالسعر والتقييم",
    description: "قارن بين الملاعب قبل ما تختار. ما تحتاج تسأل «كم الساعة؟»",
  },
  {
    icon: Bell,
    title: "إشعارات الحجز",
    description: "قبول، رفض، تذكير قبل 24 ساعة وساعتين من الموعد المؤكد.",
  },
  {
    icon: CreditCard,
    title: "عربون واضح",
    description: "المبلغ يظهر قبل الإرسال. إلغاء قبل 24 ساعة حسب سياسة المنصة.",
  },
  {
    icon: Star,
    title: "تقييمات بعد المباراة",
    description: "قيّم الملعب بعد ما تلعب — يساعد الفرق الثانية تختار أحسن.",
  },
  {
    icon: Building2,
    title: "لوحة لأصحاب الملاعب",
    description: "قبول الطلبات، إدارة التقويم، وإحصائيات الحجوزات من مكان واحد.",
  },
];

export function LandingFeatures() {
  const [active, setActive] = useState(0);

  return (
    <Section id="features">
      <SectionHeading
        eyebrow="الخدمات"
        title="كل اللي تحتاجه للحجز"
        description="ميزات مبنية لفرق كرة القدم في حلب وإدلب."
        centered
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.slice(0, 4).map(({ icon: Icon, title, description }, i) => (
          <article
            key={title}
            onMouseEnter={() => setActive(i)}
            className={cn(
              "relative rounded-3xl p-6 text-center transition-all duration-300 cursor-default",
              active === i
                ? "bg-card shadow-card scale-[1.02]"
                : "bg-transparent hover:bg-card/60"
            )}
          >
            <div
              className={cn(
                "mx-auto flex h-14 w-14 items-center justify-center rounded-2xl mb-4 transition-colors",
                active === i ? "bg-primary/15" : "bg-muted"
              )}
            >
              <Icon
                className={cn(
                  "h-7 w-7",
                  active === i ? "text-primary" : "text-muted-foreground"
                )}
                aria-hidden
              />
            </div>
            <h3 className="font-bold text-heading text-sm">{title}</h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              {description}
            </p>
          </article>
        ))}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 max-w-3xl mx-auto">
        {features.slice(4).map(({ icon: Icon, title, description }) => (
          <article
            key={title}
            className="flex gap-3 rounded-xl bg-section-alt p-4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Icon className="h-5 w-5 text-primary" aria-hidden />
            </div>
            <div>
              <h3 className="font-bold text-sm text-heading">{title}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}
