import { Skeleton } from "@/components/ui/skeleton";

export default function UserLoading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="جاري التحميل">
      <Skeleton className="h-28 w-full rounded-2xl" />
      <Skeleton className="h-10 w-full rounded-lg" />
      <Skeleton className="h-36 w-full rounded-2xl" />
      <Skeleton className="h-36 w-full rounded-2xl" />
    </div>
  );
}
