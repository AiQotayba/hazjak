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

    <div className={cn("mb-6 flex flex-wrap items-start justify-between gap-3", className)}>

      <div>

        <h1 className="font-display text-xl md:text-2xl font-bold text-heading">{title}</h1>

        {description && (

          <p className="mt-1 text-sm text-muted-foreground">{description}</p>

        )}

      </div>

      {action}

    </div>

  );

}

