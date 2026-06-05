"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/features/auth/store/auth";
import type { BookingListItemData } from "@/features/user-bookings/components/booking-list-item";
import type { PaginationMeta } from "@beeplay/types";

export interface UserBookingsFilters {
  status?: string;
  search?: string;
}

export function buildUserBookingsQueryString(filters: UserBookingsFilters) {
  const params = new URLSearchParams({ limit: "50" });
  if (filters.status) params.set("status", filters.status);
  const q = filters.search?.trim();
  if (q) params.set("search", q);
  return params.toString();
}

export async function fetchUserBookings(token: string, filters: UserBookingsFilters) {
  const qs = buildUserBookingsQueryString(filters);
  const res = await api<BookingListItemData[]>(`/bookings?${qs}`, { token });
  if (!res.success) {
    throw new Error(res.message || "تعذّر تحميل الحجوزات");
  }
  return {
    bookings: (res.data as BookingListItemData[]) ?? [],
    meta: res.meta as PaginationMeta | undefined,
  };
}

export function useUserBookingsQuery(filters: UserBookingsFilters) {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["user-bookings", filters],
    queryFn: () => fetchUserBookings(token!, filters),
    enabled: !!token,
  });
}

export function useUserBookingsUpcomingCount() {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: ["user-bookings", "upcoming-count"],
    queryFn: async () => {
      const res = await fetchUserBookings(token!, {});
      return res.bookings.filter(
        (b) => !["COMPLETED", "CANCELLED", "REJECTED", "EXPIRED", "NO_SHOW"].includes(b.status)
      ).length;
    },
    enabled: !!token,
    staleTime: 60_000,
  });
}
