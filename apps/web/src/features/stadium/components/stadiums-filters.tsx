"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowDownUp, MapPin, Search, X } from "lucide-react";
import { APP_CITIES } from "@hazjak/constants";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SEARCH_DEBOUNCE_MS = 400;
export const ALL_CITIES = "all";
export const DEFAULT_SORT = "newest";

export const SORT_OPTIONS = [
  { value: "newest", sortBy: "createdAt", order: "desc", label: "الأحدث" },
  { value: "price-asc", sortBy: "price", order: "asc", label: "السعر: الأقل" },
  { value: "price-desc", sortBy: "price", order: "desc", label: "السعر: الأعلى" },
  { value: "name-asc", sortBy: "name", order: "asc", label: "الاسم" },
] as const;

export function sortToApi(value: string) {
  const opt = SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0];
  return { sortBy: opt.sortBy, order: opt.order };
}

function apiToSort(sortBy?: string, order?: string) {
  const match = SORT_OPTIONS.find((o) => o.sortBy === sortBy && o.order === order);
  return match?.value ?? DEFAULT_SORT;
}

function replaceStadiumParams(
  router: ReturnType<typeof useRouter>,
  pathname: string,
  current: URLSearchParams,
  updates: { search?: string; city?: string; sort?: string }
) {
  const next = new URLSearchParams(current.toString());

  if (updates.search !== undefined) {
    const q = updates.search.trim();
    if (q) next.set("search", q);
    else next.delete("search");
  }

  if (updates.city !== undefined) {
    if (updates.city && updates.city !== ALL_CITIES) next.set("city", updates.city);
    else next.delete("city");
  }

  if (updates.sort !== undefined) {
    const { sortBy, order } = sortToApi(updates.sort || DEFAULT_SORT);
    if (updates.sort === DEFAULT_SORT) {
      next.delete("sortBy");
      next.delete("order");
    } else {
      next.set("sortBy", sortBy);
      next.set("order", order);
    }
  }

  const qs = next.toString();
  router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
}

interface StadiumsFiltersProps {
  total?: number;
  isFetching?: boolean;
  className?: string;
}

export function StadiumsFilters({ total, isFetching, className }: StadiumsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const cityFromUrl = searchParams.get("city") ?? "";
  const searchFromUrl = searchParams.get("search") ?? "";
  const sortFromUrl = apiToSort(
    searchParams.get("sortBy") ?? undefined,
    searchParams.get("order") ?? undefined
  );

  const [searchInput, setSearchInput] = useState(searchFromUrl);

  useEffect(() => {
    setSearchInput(searchFromUrl);
  }, [searchFromUrl]);

  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed === searchFromUrl.trim()) return;

    const timer = window.setTimeout(() => {
      replaceStadiumParams(router, pathname, searchParams, { search: searchInput });
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [searchInput, searchFromUrl, router, pathname, searchParams]);

  const handleCityChange = useCallback(
    (value: string) => {
      replaceStadiumParams(router, pathname, searchParams, { city: value });
    },
    [router, pathname, searchParams]
  );

  const handleSortChange = useCallback(
    (value: string) => {
      replaceStadiumParams(router, pathname, searchParams, { sort: value });
    },
    [router, pathname, searchParams]
  );

  const hasActiveFilters = !!(searchFromUrl || cityFromUrl || sortFromUrl !== DEFAULT_SORT);

  function clearFilters() {
    setSearchInput("");
    router.replace(pathname, { scroll: false });
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-col sm:flex-row gap-2 p-3 rounded-3xl bg-card shadow-soft">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            className="ps-9 h-11 rounded-2xl border-0 bg-secondary/60 shadow-none"
            placeholder="ابحث باسم الملعب أو الحي..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="بحث الملاعب"
          />
        </div>

        <Select value={cityFromUrl || ALL_CITIES} onValueChange={handleCityChange}>
          <SelectTrigger className="sm:w-40 h-11 border-0 bg-secondary/60 shadow-none" aria-label="المدينة" dir="rtl">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <SelectValue placeholder="كل المدن" />
          </SelectTrigger>
          <SelectContent align="start" dir="rtl" className="text-start">
            <SelectItem value={ALL_CITIES}>كل المدن</SelectItem>
            {APP_CITIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortFromUrl} onValueChange={handleSortChange}>
          <SelectTrigger className="sm:w-44 h-11 border-0 bg-secondary/60 shadow-none" aria-label="الترتيب" dir="rtl" >
            <ArrowDownUp className="h-4 w-4 text-primary shrink-0" />
            <SelectValue placeholder="الترتيب" />
          </SelectTrigger>
          <SelectContent align="start" className="text-start">
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between gap-2 px-1 min-h-6">
        <p className="text-xs text-muted-foreground">
          {isFetching ? (
            "جاري التحديث..."
          ) : total != null ? (
            <>
              <span className="font-bold text-heading">{total}</span> ملعب
              {searchFromUrl && <> يطابق «{searchFromUrl}»</>}
              {cityFromUrl && <> في {cityFromUrl}</>}
            </>
          ) : null}
        </p>
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs text-primary px-2"
            onClick={clearFilters}
          >
            <X className="h-3.5 w-3.5" />
            مسح الفلاتر
          </Button>
        )}
      </div>
    </div>
  );
}

export function parseStadiumsSearchParams(searchParams: URLSearchParams) {
  return {
    search: searchParams.get("search") ?? "",
    city: searchParams.get("city") ?? "",
    sortBy: searchParams.get("sortBy") ?? "createdAt",
    order: searchParams.get("order") ?? "desc",
  };
}
