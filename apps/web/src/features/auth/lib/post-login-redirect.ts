import type { Role } from "@hazjak/types";

type AppRouter = { replace: (href: string) => void };

export function getDefaultPathForRole(role: Role): string {
  if (role === "STADIUM_OWNER") return "/owner";
  if (role === "ADMIN") return process.env.NEXT_PUBLIC_ADMIN_URL ?? "/";
  return "/user/bookings";
}

export function resolvePostLoginPath(role: Role, next?: string | null): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return getDefaultPathForRole(role);
}

export function redirectAfterLogin(
  router: AppRouter,
  role: Role,
  next?: string | null
) {
  const path = resolvePostLoginPath(role, next);
  if (path.startsWith("http")) {
    window.location.href = path;
    return;
  }
  router.replace(path);
}
