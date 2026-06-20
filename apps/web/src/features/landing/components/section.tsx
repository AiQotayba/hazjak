import { cn } from "@/lib/utils";

export function Section({
  id,
  className,
  children,
  alt = false,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
  alt?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn(
        "py-16 md:py-20",
        alt ? "bg-muted/40" : "bg-background",
        className
      )}
    >
      <div className="page-container">{children}</div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
  centered = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  centered?: boolean;
}) {
  return (
    <div
      className={cn(
        "mb-8 max-w-2xl",
        centered && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <span className="inline-block text-sm font-bold text-primary mb-2">
          {eyebrow}
        </span>
      )}
      <h2 className="font-display text-2xl md:text-3xl font-bold text-heading leading-tight">
        {title}
      </h2>
      {description && (
        <p className="mt-2 text-sm md:text-base text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
