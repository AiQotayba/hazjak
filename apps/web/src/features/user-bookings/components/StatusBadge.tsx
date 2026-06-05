"use client";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import {
  Hourglass,
  ShieldCheck,
  CheckCheck,
  CircleX,
  ShieldX,
  CalendarX2,
  UserX,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

const statusLabel: Record<string, string> = {
  PENDING: "قيد الانتظار",
  CONFIRMED: "مؤكد",
  COMPLETED: "مكتمل",
  CANCELLED: "ملغى",
  REJECTED: "مرفوض",
  EXPIRED: "منتهي",
  NO_SHOW: "لم يحضر",
};

const statusVariant: Record<string, BadgeProps["variant"]> = {
  PENDING: "warning",
  CONFIRMED: "success",
  COMPLETED: "default",
  CANCELLED: "destructive",
  REJECTED: "destructive",
  EXPIRED: "secondary",
  NO_SHOW: "secondary",
};

/** أيقونات تعبّر عن معنى كل حالة بدقة */
const statusIcon: Record<string, LucideIcon> = {
  PENDING: Hourglass,
  CONFIRMED: ShieldCheck,
  COMPLETED: CheckCheck,
  CANCELLED: CircleX,
  REJECTED: ShieldX,
  EXPIRED: CalendarX2,
  NO_SHOW: UserX,
};

export function StatusBadge({
  status,
  className,
  icon = true,
}: {
  status: string;
  className?: string;
  icon?: boolean;
}) {
  const Icon = statusIcon[status] ?? HelpCircle;
  return (
    <Badge variant={statusVariant[status] ?? "outline"} className={className}>
      {icon && <Icon className="h-3 w-3 shrink-0 opacity-90" aria-hidden />}
      {statusLabel[status] ?? status}
    </Badge>
  );
}
