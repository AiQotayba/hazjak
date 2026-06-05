import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex flex-wrap items-start justify-between gap-2", className)}>
      <div>
        <h1 className="text-xl font-bold">{title}</h1>
        {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
      </div>
      {action}
    </div>
  );
}
