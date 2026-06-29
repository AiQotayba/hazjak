"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/layout/page-header";
import { StadiumCard } from "@/features/stadium/components/stadium-card";
import {
  ALL_CITIES,
  DEFAULT_SORT,
  SORT_OPTIONS,
  sortToApi,
} from "@/features/stadium/components/stadiums-filters-constants";
import { useStadiumsQuery } from "@/features/stadium/hooks/use-stadiums-query";
import { StadiumsFiltersBar } from "@/features/stadium/components/stadiums-filters-bar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";

const PAGE_SIZE = 8;
const SEARCH_DEBOUNCE_MS = 400;

export function LandingStadiumsSection() {
  const [city, setCity] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState(DEFAULT_SORT);
  const [limit, setLimit] = useState(PAGE_SIZE);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setLimit(PAGE_SIZE);
  }, [city, search, sort]);

  const { sortBy, order } = useMemo(() => sortToApi(sort), [sort]);

  const { data, isLoading, isFetching } = useStadiumsQuery({
    search,
    city,
    sortBy,
    order,
    limit,
  });

  const stadiums = data?.stadiums ?? [];
  const total = data?.total ?? 0;
  const hasMore = stadiums.length < total;

  const stadiumsHref = useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (city) params.set("city", city);
    if (sort !== DEFAULT_SORT) {
      params.set("sortBy", sortBy);
      params.set("order", order);
    }
    const qs = params.toString();
    return qs ? `/stadiums?${qs}` : "/stadiums";
  }, [city, order, search, sort, sortBy]);

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setCity("");
    setSort(DEFAULT_SORT);
  }

  const hasActiveFilters = !!(search || city || sort !== DEFAULT_SORT);

  return (
    <section id="stadiums" className="border-t border-border bg-muted/30 py-10 md:py-14">
      <div className="page-container">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <PageHeader
            title="الملاعب المتاحة"
            description="تصفّح الملاعب واحجز موعدك"
            action={
              <Button variant="outline" className="rounded-full" asChild>
                <Link href={stadiumsHref}>عرض الكل</Link>
              </Button>
            }
          />

          <StadiumsFiltersBar
            searchInput={searchInput}
            onSearchInputChange={setSearchInput}
            city={city}
            onCityChange={(value) => setCity(value === ALL_CITIES ? "" : value)}
            sort={sort}
            onSortChange={setSort}
            total={!isLoading ? total : undefined}
            isFetching={isFetching && !isLoading}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />

          {isLoading ? (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-xl" />
              ))}
            </div>
          ) : stadiums.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                title="لا توجد ملاعب"
                description="جرّب بحثاً آخر أو عدّل كلمات البحث"
                actionLabel="عرض كل الملاعب"
                actionHref="/stadiums"
              />
            </div>
          ) : (
            <>
              <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stadiums.map((stadium, i) => (
                  <motion.div
                    key={stadium.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.25), duration: 0.3 }}
                  >
                    <StadiumCard {...stadium} />
                  </motion.div>
                ))}
              </div>

              {(hasMore || stadiums.length > 0) && (
                <div className="mt-8 flex flex-col items-center gap-2">
                  {hasMore && (
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => setLimit((current) => current + PAGE_SIZE)}
                      disabled={isFetching}
                    >
                      {isFetching ? "جاري التحميل..." : "عرض المزيد"}
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground">
                    عرض {stadiums.length} من {total}
                  </p>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}
