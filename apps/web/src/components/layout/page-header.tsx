import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}
export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-heading">{title}</h1>
        {description && (
          <p className="mt-1.5 text-sm md:text-base text-muted-foreground">{description}</p>
        )}
      </div>
      {action ? (
        <div className="flex w-full shrink-0 sm:w-auto [&_button]:w-full sm:[&_button]:w-auto [&_a]:w-full sm:[&_a]:w-auto">
          {action}
        </div>
      ) : null}
    </div>
  );
}

