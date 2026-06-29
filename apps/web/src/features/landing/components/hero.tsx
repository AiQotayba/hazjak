"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Bell, CalendarCheck, MapPin, ShieldCheck } from "lucide-react";
import { APP_COUNTRY_AR, APP_MOTTO_AR, APP_TAGLINE_AR } from "@hazjak/constants";
import { Button } from "@/components/ui/button";

const trustPoints = [
  { icon: ShieldCheck, text: "إلغاء مجاني قبل 24 ساعة" },
  { icon: Bell, text: "إشعار عند قبول الحجز" },
  { icon: CalendarCheck, text: "مواعيد وأسعار واضحة" },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.45 },
});

export function LandingHero({ browseHref = "/stadiums" }: { browseHref?: string }) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-0 blob-orange opacity-70" />
      <div aria-hidden className="pointer-events-none absolute -start-24 top-1/3 h-72 w-72 rounded-full bg-primary/8 blur-3xl" />

      <div className="page-container relative py-12 md:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="text-center lg:text-start">
            <motion.p
              {...fadeUp(0.05)}
              className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground"
            >
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              {APP_COUNTRY_AR}
            </motion.p>

            <motion.h1
              {...fadeUp(0.1)}
              className="font-display text-3xl font-bold leading-tight text-heading md:text-4xl xl:text-5xl"
            >
              {APP_TAGLINE_AR}
            </motion.h1>

            <motion.p
              {...fadeUp(0.15)}
              className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg"
            >
              {APP_MOTTO_AR}. تصفّح المواعيد الفاضية، أرسل طلب حجز، واستلم تأكيداً من صاحب
              الملعب.
            </motion.p>

            <motion.div
              {...fadeUp(0.2)}
              className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
            >
              <Button size="lg" className="rounded-full gap-2 shadow-soft" asChild>
                <Link href={browseHref}>
                  تصفّح الملاعب
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full" asChild>
                <Link href="/#how-it-works">كيف يعمل؟</Link>
              </Button>
            </motion.div>

            <motion.ul
              {...fadeUp(0.25)}
              className="mt-8 flex flex-wrap justify-center gap-2 lg:justify-start"
            >
              {trustPoints.map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-heading shadow-soft"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                  {text}
                </li>
              ))}
            </motion.ul>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.12, duration: 0.5 }}
            className="relative mx-auto w-full max-w-md lg:max-w-none"
          >
            <HeroVisual location={APP_COUNTRY_AR} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function HeroVisual({ location }: { location: string }) {
  return (
    <div className="relative">
      <div className="overflow-hidden rounded-3xl bg-primary p-1 shadow-card">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.35rem]">
          <Image
            src="https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=1200&auto=format"
            alt={`ملعب كرة قدم في ${location}`}
            fill
            className="object-cover"
            sizes="(max-width:1024px) 90vw, 520px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
          <p className="absolute bottom-4 start-4 end-4 text-sm font-medium text-primary-foreground">
            ملاعب موثّقة في {location}
          </p>
        </div>
      </div>

      <div className="absolute -bottom-5 start-4 surface-card p-4 sm:start-6 sm:p-5">
        <p className="text-xs font-semibold text-primary">طلب حجز</p>
        <p className="mt-0.5 font-bold text-heading">ملعب الشهباء</p>
        <p className="mt-1 text-xs text-muted-foreground">الجمعة · 7:00 – 8:00 م</p>
        <span className="mt-2 inline-flex rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-semibold text-accent-foreground">
          بانتظار التأكيد
        </span>
      </div>

      <div className="absolute -top-3 -end-3 hidden rounded-2xl bg-card px-3 py-2 shadow-soft border border-border sm:block">
        <p className="text-[10px] text-muted-foreground">خطوة واحدة</p>
        <p className="text-xs font-bold text-heading">اختر · احجز · العب</p>
      </div>
    </div>
  );
}
