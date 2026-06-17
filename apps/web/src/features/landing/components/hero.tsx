"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Bell, MapPin, Play, ShieldCheck } from "lucide-react";
import { APP_CITIES, APP_TAGLINE_AR } from "@hazjak/constants";
import { APP_NAME_AR } from "@/lib/brand";
import { Button } from "@/components/ui/button";

const perks = [
  { icon: ShieldCheck, label: "إلغاء قبل 24 ساعة" },
  { icon: Bell, label: "إشعار عند القبول" },
  { icon: MapPin, label: "حلب وإدلب" },
];

const enter = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.45 },
});

export function LandingHero({ browseHref = "/stadiums" }: { browseHref?: string }) {
  const cities = APP_CITIES.join(" و");

  return (
    <section className="relative overflow-hidden bg-section-alt border-b border-border/40">
      <motion.div
        className="pointer-events-none absolute -start-24 top-10 h-72 w-72 rounded-full bg-primary/15 blur-3xl"
        animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.75, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute end-0 bottom-0 h-96 w-96 rounded-full bg-accent-gold/10 blur-3xl"
        animate={{ scale: [1, 1.12, 1], x: [0, -12, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-6xl w-full px-4 pt-12 pb-16 md:pt-16 md:pb-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="text-center lg:text-start order-2 lg:order-1">
            <motion.p
              {...enter(0.06)}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-primary mb-4"
            >
              <MapPin className="h-4 w-4" />
              {cities}
            </motion.p>

            <motion.h1
              {...enter(0.12)}
              className="font-display text-3xl md:text-5xl font-bold text-heading leading-tight"
            >
              احجز ملعبك في{" "}
              <span className="relative inline-block text-primary">
                {cities}
                <span
                  className="absolute -bottom-1 start-0 end-0 h-2.5 bg-primary/20 rounded-full -z-10"
                  aria-hidden
                />
              </span>
            </motion.h1>

            <motion.p {...enter(0.16)} className="mt-2 text-lg font-medium text-primary">
              {APP_TAGLINE_AR}
            </motion.p>

            <motion.p
              {...enter(0.2)}
              className="mt-4 text-sm md:text-base text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed"
            >
              {APP_NAME_AR} يعرض ملاعب حلب وإدلب في مكان واحد: شوف الموعد الفاضي، أرسل طلب
              حجز، واستلم تأكيد من صاحب الملعب.
            </motion.p>

            <motion.div
              {...enter(0.24)}
              className="mt-8 flex flex-wrap justify-center lg:justify-start gap-3"
            >
              <Button size="lg" className="shadow-soft" asChild>
                <Link href={browseHref}>تصفح الملاعب</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-card gap-2 shadow-soft"
                asChild
              >
                <Link href="/#how-it-works">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Play className="h-3.5 w-3.5 fill-current ms-0.5" />
                  </span>
                  كيف يعمل؟
                </Link>
              </Button>
            </motion.div>

            <motion.ul {...enter(0.3)} className="mt-6 flex flex-wrap justify-center lg:justify-start gap-2">
              {perks.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-card/90 px-3 py-1.5 text-xs font-bold text-heading shadow-soft backdrop-blur-sm"
                >
                  <Icon className="h-3.5 w-3.5 text-primary" aria-hidden />
                  {label}
                </li>
              ))}
            </motion.ul>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="relative order-1 lg:order-2 flex justify-center"
          >
            <CardPreview />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function CardPreview() {
  return (
    <div className="relative w-full max-w-md">
      <div className="relative aspect-[9/6] rounded-3xl overflow-hidden shadow-soft">
        <Image
          src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format"
          alt="لاعبون في ملعب كرة قدم"
          fill
          className="object-cover"
          sizes="(max-width:768px) 90vw, 420px"
          priority
        />
      </div>
      <div className="absolute -bottom-4 -start-4 md:-start-8 rounded-2xl bg-card shadow-soft p-4 min-w-[200px]">
        <p className="text-xs font-bold text-primary mb-1">حجز مؤكد</p>
        <p className="font-bold text-sm text-heading">ملعب الشهباء — حلب</p>
        <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">الجمعة 19:00–20:00</p>
        <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full w-3/5 rounded-full bg-primary" />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">تم التأكيد · 60%</p>
      </div>
    </div>
  );
}
