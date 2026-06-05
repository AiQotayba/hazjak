"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { StadiumCard } from "@/features/stadium/components/stadium-card";
import { StadiumsFilters, parseStadiumsSearchParams } from "@/features/stadium/components/stadiums-filters";
import { StadiumsHero } from "@/features/stadium/components/stadiums-hero";
import { useStadiumsQuery } from "@/features/stadium/hooks/use-stadiums-query";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";

function StadiumsContent() {
  const searchParams = useSearchParams();
  const filters = parseStadiumsSearchParams(searchParams);

  const { data, isLoading, isFetching } = useStadiumsQuery(filters);
  const stadiums = data?.stadiums ?? [];
  const total = data?.total ?? 0;
  const loading = isLoading || isFetching;

  return (
    <>
      <StadiumsHero total={!isLoading ? total : undefined} />

      <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
        <StadiumsFilters total={!isLoading ? total : undefined} isFetching={isFetching && !isLoading} />

        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-3xl" />
            ))}
          </div>
        ) : stadiums.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="لا توجد ملاعب"
              description="جرّب مدينة أخرى أو عدّل كلمات البحث"
              actionLabel="مسح الفلاتر"
              actionHref="/stadiums"
            />
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-6">
            {stadiums.map((s) => (
              <StadiumCard key={s.id} {...s} />
            ))}
          </div>
        )}

        {!isLoading && stadiums.length > 0 && loading && (
          <p className="text-center text-xs text-muted-foreground mt-4">جاري تحديث النتائج...</p>
        )}
      </div>
    </>
  );
}

export default function StadiumsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh]">
          <Skeleton className="h-48 w-full rounded-none" />
          <div className="mx-auto max-w-6xl px-4 py-8 space-y-4">
            <Skeleton className="h-14 rounded-3xl" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-3xl" />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <StadiumsContent />
    </Suspense>
  );
}
