import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

const statusMap: Record<string, string> = {
  PENDING: "bg-warning/20 text-warning",
  CONFIRMED: "bg-brand/20 text-brand",
  COMPLETED: "bg-info/20 text-info",
  CANCELLED: "bg-negative/20 text-negative",
  REJECTED: "bg-negative/20 text-negative",
  EXPIRED: "bg-text-subtle/20 text-text-muted",
  NO_SHOW: "bg-text-subtle/20 text-text-muted",
};

const statusLabel: Record<string, string> = {
  PENDING: "قيد الانتظار",
  CONFIRMED: "مؤكد",
  COMPLETED: "مكتمل",
  CANCELLED: "ملغى",
  REJECTED: "مرفوض",
  EXPIRED: "منتهي",
  NO_SHOW: "لم يحضر",
};

export function StatusBadge({
  status,
  className,
}: { status: string } & HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        statusMap[status] ?? "bg-bg-elevated text-text-muted",
        className
      )}
    >
      {statusLabel[status] ?? status}
    </span>
  );
}
