"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export interface StadiumListItem {
  id: string;
  slug: string;
  name: string;
  city: string;
  area: string;
  description?: string;
  morningPrice: number;
  eveningPrice: number;
  coverImage?: string | null;
  averageRating?: number;
  reviewCount?: number;
  sportType?: string;
}

export interface StadiumsFilters {
  search?: string;
  city?: string;
  sortBy?: string;
  order?: string;
}

export function buildStadiumsParams(filters: StadiumsFilters) {
  const params: Record<string, string | number> = { limit: 20 };

  const q = filters.search?.trim();
  if (q) params.search = q;
  if (filters.city) params.city = filters.city;
  if (filters.sortBy) params.sortBy = filters.sortBy;
  if (filters.order) params.order = filters.order;

  return params;
}

export async function fetchStadiums(filters: StadiumsFilters) {
  const res = await apiClient.get<StadiumListItem[]>("/stadiums", {
    params: buildStadiumsParams(filters),
    showErrorToast: false,
  });

  if (res.isError) {
    throw new Error(res.message || "تعذّر تحميل الملاعب");
  }

  return {
    stadiums: res.data ?? [],
    total: (res.meta as { total?: number } | undefined)?.total ?? res.data?.length ?? 0,
  };
}

export function useStadiumsQuery(filters: StadiumsFilters) {
  return useQuery({
    queryKey: ["stadiums", filters],
    queryFn: () => fetchStadiums(filters),
  });
}
