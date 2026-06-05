"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LayoutList, Search } from "lucide-react";
import {
  BOOKING_STATUS_FILTER_ALL,
  BOOKING_STATUS_FILTER_OPTIONS,
} from "@beeplay/constants";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BOOKING_STATUS_ICONS,
  bookingStatusSelectValue,
  bookingStatusToApi,
} from "@/lib/booking-status-icons";

const SEARCH_DEBOUNCE_MS = 400;

function replaceBookingsParams(
  router: ReturnType<typeof useRouter>,
  pathname: string,
  current: URLSearchParams,
  updates: { status?: string; search?: string }
) {
  const next = new URLSearchParams(current.toString());

  if (updates.status !== undefined) {
    if (updates.status) next.set("status", updates.status);
    else next.delete("status");
  }

  if (updates.search !== undefined) {
    const q = updates.search.trim();
    if (q) next.set("search", q);
    else next.delete("search");
  }

  const qs = next.toString();
  router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
}

export function BookingsFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const status = searchParams.get("status") ?? "";
  const searchFromUrl = searchParams.get("search") ?? "";
  const [searchInput, setSearchInput] = useState(searchFromUrl);

  useEffect(() => {
    setSearchInput(searchFromUrl);
  }, [searchFromUrl]);

  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed === searchFromUrl.trim()) return;

    const timer = window.setTimeout(() => {
      replaceBookingsParams(router, pathname, searchParams, { search: searchInput });
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [searchInput, searchFromUrl, router, pathname, searchParams]);

  const handleStatusChange = useCallback(
    (value: string) => {
      replaceBookingsParams(router, pathname, searchParams, {
        status: bookingStatusToApi(value),
      });
    },
    [router, pathname, searchParams]
  );

  const selectValue = bookingStatusSelectValue(status);

  return (
    <div className="flex flex-row gap-2 mb-4">
      <div className="relative min-w-0 flex-1">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          className="ps-9 h-10 rounded-2xl bg-card shadow-soft border-0"
          placeholder="بحث باسم الملعب..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      <Select value={selectValue} onValueChange={handleStatusChange}>
        <SelectTrigger
          className="w-[9.5rem] sm:w-44 h-10 border-0"
          aria-label="فلتر الحالة"
          dir="rtl"
        >
          <SelectValue placeholder="الحالة" />
        </SelectTrigger>
        <SelectContent align="start" dir="">
          {BOOKING_STATUS_FILTER_OPTIONS.map((f) => {
            const Icon = BOOKING_STATUS_ICONS[f.value] ?? LayoutList;
            return (
              <SelectItem key={f.value} value={f.value}>
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  {f.label}
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
