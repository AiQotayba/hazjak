import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function BookingListItemSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("rounded-2xl bg-card p-3 shadow-soft", className)}
      aria-hidden
    >
      <div className="flex items-center gap-3">
        <Skeleton className="aspect-[9/6] w-40 shrink-0 sm:w-48 rounded-lg" />
        <div className="flex min-w-0 flex-1 flex-col gap-2 py-0.5">
          <Skeleton className="h-4 w-[80%] max-w-48" />
          <Skeleton className="h-3 w-[65%] max-w-36" />
          <div className="space-y-1.5 pt-0.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="h-6 w-16 self-end mt-1" />
        </div>
      </div>
    </div>
  );
}

export function UserBookingsPageSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="جاري تحميل الحجوزات">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 min-w-0 flex-1">
          <Skeleton className="h-8 w-40 max-w-full" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-9 w-24 shrink-0 rounded-full" />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Skeleton className="h-10 w-full sm:flex-1 rounded-xl" />
        <Skeleton className="h-10 w-full sm:w-40 rounded-xl" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <BookingListItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
