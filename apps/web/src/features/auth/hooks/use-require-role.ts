"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@hazjak/types";
import { useAuthStore } from "@/features/auth/store/auth";

export function useRequireRole(role: Role, loginPath = "/login") {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const ready = !!token && user?.role === role && user.isPhoneVerified;

  useEffect(() => {
    if (!token || user?.role !== role) {
      router.replace(loginPath);
      return;
    }
    if (!user.isPhoneVerified) {
      router.replace("/verify-email");
    }
  }, [token, user, role, router, loginPath]);

  return { token: token!, user: user!, ready };
}
