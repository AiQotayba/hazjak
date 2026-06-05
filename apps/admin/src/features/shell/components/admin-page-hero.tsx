"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdminHeroPerk {
  icon?: LucideIcon;
  label: string;
}

interface AdminPageHeroProps {
  title: string;
  description?: string;
  perks?: AdminHeroPerk[];
  action?: React.ReactNode;
  className?: string;
}

export function AdminPageHero({
  title,
  description,
  perks,
  action,
  className,
}: AdminPageHeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/50 bg-card shadow-[var(--shadow-soft)] mb-6",
        className
      )}
    >
      <div
        className="pointer-events-none absolute -start-16 top-0 h-40 w-40 rounded-full bg-brand/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -end-12 bottom-0 h-32 w-32 rounded-full bg-primary/10 blur-3xl"
        aria-hidden
      />

      <div className="relative flex flex-wrap items-start justify-between gap-4 p-5 md:p-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl md:text-2xl font-bold text-heading">{title}</h1>
          {description && (
            <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
          {perks && perks.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {perks.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-heading"
                >
                  {Icon && <Icon className="h-3.5 w-3.5 text-primary" aria-hidden />}
                  {label}
                </li>
              ))}
            </ul>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </section>
  );
}
