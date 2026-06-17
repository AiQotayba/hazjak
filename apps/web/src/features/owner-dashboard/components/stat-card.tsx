import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  description,
  value,
  href,
  icon: Icon,
  className,
}: {
  label: string;
  description?: string;
  value: React.ReactNode;
  href?: string;
  icon?: LucideIcon;
  className?: string;
}) {
  const inner = (
    <Card
      className={cn(
        "border-0 shadow-soft transition-all",
        href && "hover:shadow-card hover:bg-primary/[0.03] group",
        className
      )}
    >
      <CardContent className="p-4 flex items-center justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {Icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs font-bold text-heading">{label}</p>
            {/* {description && (
              <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{description}</p>
            )} */}
            <p className="text-lg md:text-xl font-bold text-primary mt-1.5 truncate">{value}</p>
          </div>
        </div>
        {/* {href && (
          <ChevronLeft
            className="h-5 w-5 shrink-0 text-muted-foreground/50 group-hover:text-primary transition-colors"
            aria-hidden
          />
        )} */}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
        {inner}
      </Link>
    );
  }

  return inner;
}
