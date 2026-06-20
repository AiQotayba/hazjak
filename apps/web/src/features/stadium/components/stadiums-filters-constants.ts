import { APP_CITIES } from "@hazjak/constants";

export const SEARCH_DEBOUNCE_MS = 400;
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

export { APP_CITIES };
