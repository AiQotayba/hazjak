"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Building2, CalendarCheck, ClipboardList, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const perks = [
  { icon: Zap, label: "قبول الطلبات بنقرة" },
  { icon: CalendarCheck, label: "تقويم أسبوعي" },
  { icon: ClipboardList, label: "إحصائيات فورية" },
];

const enter = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.45 },
});

export function OwnerHero() {
  return (
    <section className="relative overflow-hidden bg-section-alt border-b border-border/40">
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

      <div className="relative mx-auto max-w-6xl px-4 py-12 md:py-20">

        <div className="max-w-2xl"> 
          <motion.h1
            {...enter(0.12)}
            className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-heading leading-tight"
          >
            ملعبك مشغول بالواتساب؟{" "}
            <span className="relative inline-block text-primary">
              خلّي الحجز يشتغل لحاله
              <span
                className="absolute -bottom-1 start-0 end-0 h-2.5 bg-primary/20 rounded-full -z-10"
                aria-hidden
              />
            </span>
          </motion.h1>

          <motion.p
            {...enter(0.18)}
            className="mt-4 text-base text-muted-foreground leading-relaxed max-w-xl"
          >
            لوحة واحدة لقبول الطلبات، إدارة التقويم، وتحديد أسعار الصباح والمساء — بدون
            رسائل متكررة «في فاضي الساعة 8؟»
          </motion.p>

          <motion.div {...enter(0.24)} className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" className="rounded-full shadow-soft" asChild>
              <Link href="/register/owner">سجّل ملعبك مجاناً</Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full border-0 bg-secondary" asChild>
              <Link href="/login">عندي حساب</Link>
            </Button>
          </motion.div>

          <motion.ul {...enter(0.3)} className="mt-6 flex flex-wrap gap-2">
            {perks.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1.5 text-xs font-bold text-heading shadow-soft backdrop-blur-sm"
              >
                <Icon className="h-3.5 w-3.5 text-primary" aria-hidden />
                {label}
              </li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
