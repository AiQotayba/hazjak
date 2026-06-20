import type { LucideIcon } from "lucide-react";
import {
  Bell,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  MapPin,
  User,
} from "lucide-react";

export type NavLink = { href: string; label: string; icon?: LucideIcon };

export const publicNav: NavLink[] = [
  { href: "/", label: "الرئيسية" },
  { href: "/stadiums", label: "الملاعب" },
  { href: "/owners", label: "لأصحاب الملاعب" },
  { href: "/#faq", label: "أسئلة" },
];

export const userAccountNav: NavLink[] = [
  { href: "/user/bookings", label: "حجوزاتي", icon: CalendarDays },
  { href: "/user/stadiums", label: "الملاعب", icon: MapPin },
  { href: "/user/profile", label: "حسابي", icon: User },
  { href: "/user/notifications", label: "الإشعارات", icon: Bell },
];

export const ownerAccountNav: NavLink[] = [
  { href: "/owner", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/owner/bookings", label: "الحجوزات", icon: ClipboardList },
  { href: "/owner/stadium", label: "الملعب", icon: MapPin },
  { href: "/owner/settings", label: "المواعيد", icon: CalendarClock },
  { href: "/owner/profile", label: "حسابي", icon: User },
  { href: "/owner/notifications", label: "الإشعارات", icon: Bell },
];

export function isNavLinkActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href.startsWith("/#")) return false;
  if (href === "/owner") return pathname === "/owner";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function stadiumsHrefForRole(role?: string) {
  return role === "USER" ? "/user/stadiums" : "/stadiums";
}
