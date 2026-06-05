import { cn } from "@/lib/utils";

export function MarketingPageShell({
  title,
  description,
  children,
  className,
  hero = true,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  hero?: boolean;
}) {
  return (
    <div className={cn("min-h-[50vh]", className)}>
      {hero && (
        <div className="relative overflow-hidden bg-section-alt border-b border-border">
          <div
            className="pointer-events-none absolute -start-16 top-0 h-48 w-48 rounded-full blob-orange blur-2xl"
            aria-hidden
          />
          <div className="relative mx-auto max-w-6xl px-4 py-10 md:py-14">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-heading">{title}</h1>
            {description && (
              <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-xl">
                {description}
              </p>
            )}
          </div>
        </div>
      )}
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">{children}</div>
    </div>
  );
}
