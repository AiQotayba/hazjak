"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ALL_CITIES,
  DEFAULT_SORT,
  SORT_OPTIONS,
  sortToApi,
} from "@/features/stadium/components/stadiums-filters";
import { StadiumsFiltersBar } from "@/features/stadium/components/stadiums-filters-bar";

const SEARCH_DEBOUNCE_MS = 400;

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
      replaceStadiumParams(router, pathname, searchParams, {
        city: value === ALL_CITIES ? "" : value,
      });
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
    <StadiumsFiltersBar
      className={className}
      searchInput={searchInput}
      onSearchInputChange={setSearchInput}
      city={cityFromUrl}
      onCityChange={handleCityChange}
      sort={sortFromUrl}
      onSortChange={handleSortChange}
      total={total}
      isFetching={isFetching}
      hasActiveFilters={hasActiveFilters}
      onClearFilters={clearFilters}
      searchFromUrl={searchFromUrl}
      cityFromUrl={cityFromUrl}
    />
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

// Re-export constants for consumers
export {
  ALL_CITIES,
  DEFAULT_SORT,
  SEARCH_DEBOUNCE_MS,
  SORT_OPTIONS,
  sortToApi,
} from "./stadiums-filters-constants";
