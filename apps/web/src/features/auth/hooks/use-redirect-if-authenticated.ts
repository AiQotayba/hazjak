"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/auth";
import { redirectAfterLogin } from "@/features/auth/lib/post-login-redirect";

/** Sends authenticated users away from guest-only pages (login, register, …). */
export function useRedirectIfAuthenticated() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const [hydrated, setHydrated] = useState(() => useAuthStore.persist.hasHydrated());

  useEffect(() => {
    if (hydrated) return;
    return useAuthStore.persist.onFinishHydration(() => setHydrated(true));
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated || !token || !user) return;

    if (!user.isEmailVerified) {
      router.replace("/verify-email");
      return;
    }

    redirectAfterLogin(router, user.role, searchParams.get("next"));
  }, [hydrated, token, user, router, searchParams]);

  return { hydrated, isAuthenticated: hydrated && !!token && !!user };
}
