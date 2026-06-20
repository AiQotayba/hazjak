"use client";

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
import { ALL_CITIES, DEFAULT_SORT, SORT_OPTIONS } from "./stadiums-filters-constants";

export type StadiumsFiltersBarProps = {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  city: string;
  onCityChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
  total?: number;
  isFetching?: boolean;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  searchFromUrl?: string;
  cityFromUrl?: string;
  className?: string;
};

/** شريط فلاتر الملاعب الموحّد — يُستخدم في الصفحة الرئيسية ومع URL في التصفح الكامل */
export function StadiumsFiltersBar({
  searchInput,
  onSearchInputChange,
  city,
  onCityChange,
  sort,
  onSortChange,
  total,
  isFetching,
  hasActiveFilters,
  onClearFilters,
  searchFromUrl = "",
  cityFromUrl = "",
  className,
}: StadiumsFiltersBarProps) {
  const displaySearch = searchFromUrl || searchInput.trim();

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-2 shadow-soft sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-11 rounded-xl border-0 bg-background ps-9 shadow-none focus-visible:ring-1"
            placeholder="ابحث باسم الملعب أو الحي..."
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            aria-label="بحث الملاعب"
          />
        </div>

        <Select value={city || ALL_CITIES} onValueChange={onCityChange}>
          <SelectTrigger
            className="h-11 rounded-xl border-0 bg-background shadow-none sm:w-40"
            aria-label="المدينة"
            dir="rtl"
          >
            <MapPin className="h-4 w-4 shrink-0 text-primary" />
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

        <Select value={sort} onValueChange={onSortChange}>
          <SelectTrigger
            className="h-11 rounded-xl border-0 bg-background shadow-none sm:w-44"
            aria-label="الترتيب"
            dir="rtl"
          >
            <ArrowDownUp className="h-4 w-4 shrink-0 text-primary" />
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

      <div className="flex min-h-6 items-center justify-between gap-2 px-1">
        <p className="text-xs text-muted-foreground">
          {isFetching ? (
            "جاري التحديث..."
          ) : total != null ? (
            <>
              <span className="font-bold text-heading">{total}</span> ملعب
              {displaySearch && <> يطابق «{displaySearch}»</>}
              {(cityFromUrl || city) && <> في {cityFromUrl || city}</>}
            </>
          ) : null}
        </p>
        {hasActiveFilters && onClearFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs text-primary"
            onClick={onClearFilters}
          >
            <X className="h-3.5 w-3.5" />
            مسح الفلاتر
          </Button>
        )}
      </div>
    </div>
  );
}
