import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function PageHeaderSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("mb-6 space-y-2", className)}>
      <Skeleton className="h-8 w-48 max-w-full" />
      <Skeleton className="h-4 w-72 max-w-full" />
    </div>
  );
}

export function StadiumsBrowseSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)} aria-busy="true" aria-label="جاري التحميل">
      <PageHeaderSkeleton />
      <Skeleton className="h-14 w-full rounded-full" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-72 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function ListCardsSkeleton({
  count = 4,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)} aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-20 rounded-xl" />
      ))}
    </div>
  );
}

export function DashboardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)} aria-busy="true" aria-label="جاري التحميل">
      <PageHeaderSkeleton />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}

export function ProfileSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)} aria-busy="true">
      <Skeleton className="h-28 w-full rounded-xl" />
      <Skeleton className="h-10 w-full rounded-xl" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
    </div>
  );
}
