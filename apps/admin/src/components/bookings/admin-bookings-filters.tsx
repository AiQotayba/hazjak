"use client";

import { Search, ListFilter, LayoutList, Clock, CheckCircle2, BadgeCheck, XCircle, type LucideIcon } from "lucide-react";
import { BOOKING_STATUSES } from "@hazjak/constants";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "قيد الانتظار",
  CONFIRMED: "مؤكد",
  COMPLETED: "مكتمل",
  CANCELLED: "ملغى",
  REJECTED: "مرفوض",
  EXPIRED: "منتهي",
  NO_SHOW: "لم يحضر",
};

const STATUS_ICONS: Record<string, LucideIcon> = {
  "": LayoutList,
  PENDING: Clock,
  CONFIRMED: CheckCircle2,
  COMPLETED: BadgeCheck,
  CANCELLED: XCircle,
  REJECTED: XCircle,
  EXPIRED: Clock,
  NO_SHOW: XCircle,
};

interface AdminBookingsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
}

export function AdminBookingsFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
}: AdminBookingsFiltersProps) {
  const StatusIcon = STATUS_ICONS[status] ?? LayoutList;

  return (
    <div className="flex flex-row gap-2 mb-4">
      <div className="relative min-w-0 flex-1">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-subtle pointer-events-none" />
        <Input
          className="ps-9 h-11 border-0 shadow-[var(--shadow-card)]"
          placeholder="بحث: ملعب، مستخدم..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="relative shrink-0 w-40 sm:w-44">
        <StatusIcon className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand pointer-events-none z-10" />
        <ListFilter className="absolute end-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-subtle pointer-events-none z-10" />
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          aria-label="فلتر الحالة"
          className={cn(
            "h-11 w-full rounded-[var(--radius-pill)] bg-bg-elevated ps-9 pe-9 text-sm font-bold appearance-none",
            "border-0 shadow-[var(--shadow-card)] focus:outline-none focus:ring-2 focus:ring-brand/40"
          )}
        >
          <option value="">كل الحالات</option>
          {BOOKING_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s] ?? s}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
