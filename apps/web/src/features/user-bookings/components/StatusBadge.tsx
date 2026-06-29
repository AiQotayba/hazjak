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
  Wallet,
  type LucideIcon,
} from "lucide-react";
import {
  getBookingStatusLabel,
  isAwaitingDeposit,
  isDepositPaidPendingOwner,
  isBookingTimeEnded,
  type DepositFields,
} from "@/features/user-bookings/lib/user-bookings";

const statusVariant: Record<string, BadgeProps["variant"]> = {
  PENDING: "warning",
  CONFIRMED: "success",
  COMPLETED: "default",
  CANCELLED: "destructive",
  REJECTED: "destructive",
  EXPIRED: "secondary",
  NO_SHOW: "secondary",
};

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
  endTime,
  depositReferenceCode,
  depositPaidAt,
}: {
  status: string;
  className?: string;
  icon?: boolean;
  endTime?: string;
  depositReferenceCode?: string | null;
  depositPaidAt?: string | null;
}) {
  const depositCtx: DepositFields | undefined =
    depositReferenceCode !== undefined || depositPaidAt !== undefined || endTime !== undefined
      ? { status, endTime, depositReferenceCode, depositPaidAt }
      : undefined;

  const label = getBookingStatusLabel(status, depositCtx);
  const ended = depositCtx && isBookingTimeEnded(depositCtx);
  const Icon =
    ended
      ? CalendarX2
      : status === "PENDING" && depositCtx && isAwaitingDeposit(depositCtx)
      ? Wallet
      : statusIcon[status] ?? HelpCircle;

  const variant =
    ended
      ? "secondary"
      : status === "PENDING" && depositCtx && isDepositPaidPendingOwner(depositCtx)
      ? "success"
      : statusVariant[status] ?? "outline";

  return (
    <Badge variant={variant} className={className}>
      {icon && <Icon className="h-3 w-3 shrink-0 opacity-90" aria-hidden />}
      {label}
    </Badge>
  );
}
