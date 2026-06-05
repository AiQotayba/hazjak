import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const accentStyles = {
  brand: "bg-brand/12 text-brand",
  teal: "bg-[var(--accent-teal)]/12 text-[var(--accent-teal)]",
  orange: "bg-[var(--accent-orange)]/12 text-[var(--accent-orange)]",
  pink: "bg-[var(--accent-pink)]/12 text-[var(--accent-pink)]",
  info: "bg-info/12 text-info",
} as const;

export function AdminStatCard({
  label,
  value,
  icon: Icon,
  accent = "brand",
  href,
  className,
}: {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  accent?: keyof typeof accentStyles;
  href?: string;
  className?: string;
}) {
  const inner = (
    <div
      className={cn(
        "rounded-2xl bg-card p-5 shadow-[var(--shadow-soft)] border border-border/50 h-full",
        href && "hover:shadow-[var(--shadow-card)] transition-shadow",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-4">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl",
            accentStyles[accent]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <button
          type="button"
          className="text-muted-foreground/40 hover:text-muted-foreground p-1 -m-1"
          aria-label="المزيد"
          tabIndex={-1}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
      <p className="text-2xl font-bold text-heading tracking-tight">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 rounded-2xl">
        {inner}
      </Link>
    );
  }
  return inner;
}
