"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownUp, MapPin, Search, X } from "lucide-react";
import { APP_CITIES } from "@hazjak/constants";
import { StadiumCard } from "@/features/stadium/components/stadium-card";
import {
  DEFAULT_SORT,
  SORT_OPTIONS,
  sortToApi,
} from "@/features/stadium/components/stadiums-filters";
import { useStadiumsQuery } from "@/features/stadium/hooks/use-stadiums-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MS = 400;

function CityChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition-all",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-soft"
          : "border-border/60 bg-background text-muted-foreground hover:border-primary/30 hover:text-heading"
      )}
    >
      {label}
    </button>
  );
}

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
  const hasActiveFilters = !!(search || city || sort !== DEFAULT_SORT);

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

  return (
    <section id="stadiums" className="bg-background pb-12 md:pb-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="relative z-10 -mt-8 md:-mt-10">
          <div className="rounded-3xl border border-border/50 bg-card p-4 shadow-card md:p-5">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="h-12 rounded-2xl border-border/60 bg-background ps-11 text-base shadow-none"
                    placeholder="ابحث باسم الملعب أو الحي..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    aria-label="بحث الملاعب"
                  />
                </div>

                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger
                    className="h-12 w-full rounded-2xl border-border/60 bg-background shadow-none sm:w-48"
                    aria-label="الترتيب"
                    dir="rtl"
                  >
                    <ArrowDownUp className="h-4 w-4 shrink-0 text-primary" />
                    <SelectValue placeholder="الترتيب" />
                  </SelectTrigger>
                  <SelectContent align="start" className="text-start">
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground ps-1">المدينة</span>
                <CityChip label="الكل" active={!city} onClick={() => setCity("")} />
                {APP_CITIES.map((c) => (
                  <CityChip key={c} label={c} active={city === c} onClick={() => setCity(c)} />
                ))}
                {hasActiveFilters && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="me-auto h-8 gap-1 rounded-full text-xs text-primary"
                    onClick={clearFilters}
                  >
                    <X className="h-3.5 w-3.5" />
                    مسح
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-heading md:text-2xl">
              الملاعب المتاحة
            </h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              {isLoading && total === 0 ? (
                <Skeleton className="inline-block h-4 w-32" />
              ) : (
                <>
                  <span className="font-bold text-heading">{total}</span>
                  ملعب
                  {city ? ` في ${city}` : ` في ${APP_CITIES.join(" و")}`}
                </>
              )}
            </p>
          </div>
          <Link
            href={stadiumsHref}
            className="text-sm font-bold text-primary hover:underline"
          >
            عرض الكل →
          </Link>
        </div>

        <div className="mt-6">
          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[22rem] rounded-3xl" />
              ))}
            </div>
          ) : stadiums.length === 0 ? (
            <EmptyState
              title="لا توجد ملاعب"
              description="جرّب مدينة أخرى أو عدّل كلمات البحث"
              actionLabel="عرض كل الملاعب"
              actionHref="/stadiums"
            />
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {stadiums.map((stadium) => (
                  <StadiumCard key={stadium.id} {...stadium} />
                ))}
              </div>

              {(hasMore || stadiums.length > 0) && (
                <div className="mt-10 flex flex-col items-center gap-3">
                  {hasMore && (
                    <Button
                      type="button"
                      size="lg"
                      variant="outline"
                      className="min-w-[220px] rounded-full border-border/60"
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
        </div>
      </div>
    </section>
  );
}
