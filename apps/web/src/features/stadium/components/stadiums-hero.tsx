"use client";

import { motion } from "framer-motion";
import { CalendarCheck, MapPin, Sparkles, Zap } from "lucide-react";
import { APP_CITIES, APP_MOTTO_AR } from "@hazjak/constants";
import { cn } from "@/lib/utils";

const perks = [
  { icon: Zap, label: "حجز خلال دقائق" },
  { icon: CalendarCheck, label: "مواعيد محدثة" },
  { icon: Sparkles, label: "أسعار واضحة" },
];

const enter = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.45 },
});

interface StadiumsHeroProps {
  total?: number;
  className?: string;
}

export function StadiumsHero({ total, className }: StadiumsHeroProps) {
  const cities = APP_CITIES.join(" و");

  return (
    <section
      className={cn(
        "relative overflow-hidden bg-section-alt border-b border-border/40",
        className
      )}
    >
      <motion.div
        className="pointer-events-none absolute -start-20 top-0 h-56 w-56 rounded-full bg-primary/15 blur-3xl"
        animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.75, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute -end-16 bottom-0 h-48 w-48 rounded-full bg-accent-gold/15 blur-3xl"
        animate={{ scale: [1, 1.12, 1], x: [0, 12, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 py-12 md:py-16">
        {/* <motion.p
          {...enter(0)}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-primary mb-3"
        >
          <MapPin className="h-4 w-4" />
          {cities}
        </motion.p> */}

        <motion.h1
          {...enter(0.08)}
          className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-heading leading-tight max-w-2xl"
        >
          ملعبك الجاي —{" "}
          <span className="relative inline-block">
            اختره بثقة
            <span
              className="absolute -bottom-1 start-0 end-0 h-2.5 bg-primary/20 rounded-full -z-10"
              aria-hidden
            />
          </span>
        </motion.h1>

        <motion.p
          {...enter(0.16)}
          className="mt-3 text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed"
        >
          {APP_MOTTO_AR}. تصفّح الملاعب، قارن الأسعار، وأرسل طلب حجز — وصاحب الملعب يؤكّد
          لك الموعد.
        </motion.p>

        <motion.ul
          {...enter(0.24)}
          className="mt-6 flex flex-wrap gap-2"
        >
          {perks.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1.5 text-xs font-bold text-heading shadow-soft backdrop-blur-sm"
            >
              <Icon className="h-3.5 w-3.5 text-primary" aria-hidden />
              {label}
            </li>
          ))}
          {total != null && total > 0 && (
            <li className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
              {total} ملعب متاح الآن
            </li>
          )}
        </motion.ul>
      </div>
    </section>
  );
}
