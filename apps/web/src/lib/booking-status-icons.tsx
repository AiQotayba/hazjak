import {
  LayoutList,
  Hourglass,
  ShieldCheck,
  CheckCheck,
  CircleX,
  ShieldX,
  CalendarX2,
  UserX,
  type LucideIcon,
} from "lucide-react";
import { BOOKING_STATUS_FILTER_ALL } from "@beeplay/constants";

export const BOOKING_STATUS_ICONS: Record<string, LucideIcon> = {
  [BOOKING_STATUS_FILTER_ALL]: LayoutList,
  PENDING: Hourglass,
  CONFIRMED: ShieldCheck,
  COMPLETED: CheckCheck,
  CANCELLED: CircleX,
  REJECTED: ShieldX,
  EXPIRED: CalendarX2,
  NO_SHOW: UserX,
};

export function bookingStatusSelectValue(apiStatus: string) {
  return apiStatus || BOOKING_STATUS_FILTER_ALL;
}

export function bookingStatusToApi(selectValue: string) {
  return selectValue === BOOKING_STATUS_FILTER_ALL ? "" : selectValue;
}
