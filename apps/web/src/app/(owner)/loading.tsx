import { Skeleton } from "@/components/ui/skeleton";

export default function OwnerLoading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="جاري التحميل">
      <Skeleton className="h-16 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-48 w-full rounded-2xl" />
    </div>
  );
}
