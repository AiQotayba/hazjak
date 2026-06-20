"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { StadiumCard } from "@/features/stadium/components/stadium-card";
import { StadiumsFilters, parseStadiumsSearchParams } from "@/features/stadium/components/stadiums-filters";
import { useStadiumsQuery } from "@/features/stadium/hooks/use-stadiums-query";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/layout/page-header";

interface StadiumsBrowseProps {
  title?: string;
  description?: string;
  showHeader?: boolean;
  basePath?: string;
}

export function StadiumsBrowse({
  title = "اكتشف الملاعب",
  description = "تصفّح الملاعب المتاحة واحجز موعدك بسهولة",
  showHeader = true,
  basePath = "/stadiums",
}: StadiumsBrowseProps) {
  const searchParams = useSearchParams();
  const filters = parseStadiumsSearchParams(searchParams);

  const { data, isLoading, isFetching } = useStadiumsQuery(filters);
  const stadiums = data?.stadiums ?? [];
  const total = data?.total ?? 0;
  const loading = isLoading || isFetching;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {showHeader && <PageHeader title={title} description={description} />}

      <StadiumsFilters total={!isLoading ? total : undefined} isFetching={isFetching && !isLoading} />

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : stadiums.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="لا توجد ملاعب"
            description="جرّب مدينة أخرى أو عدّل كلمات البحث"
            actionLabel="مسح الفلاتر"
            actionHref={basePath}
          />
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-4">
            {stadiums.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.3), duration: 0.3 }}
              >
                <StadiumCard {...s} />
              </motion.div>
            ))}
          </div>
        </>
      )}

      {!isLoading && stadiums.length > 0 && loading && (
        <p className="text-center text-xs text-muted-foreground mt-4">جاري تحديث النتائج...</p>
      )}
    </motion.div>
  );
}
