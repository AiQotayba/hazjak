import { Skeleton } from "@/components/ui/skeleton";

export function BookingDetailSkeleton({ withImage = true }: { withImage?: boolean }) {
  return (
    <>
      {withImage && <Skeleton className="h-36 w-full rounded-none" />}
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <div className="space-y-3 pt-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-4 w-4 shrink-0 rounded" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-full max-w-[200px]" />
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Skeleton className="h-10 rounded-full" />
          <Skeleton className="h-10 rounded-full" />
        </div>
      </div>
    </>
  );
}
