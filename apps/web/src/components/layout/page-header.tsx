import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}
export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-6 flex flex-wrap items-start justify-between gap-3", className)}>
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-heading">{title}</h1>
        {description && (
          <p className="mt-1.5 text-sm md:text-base text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

