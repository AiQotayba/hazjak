"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

export function useRequireAdmin() {
  const { token, user } = useAuthStore();
  const router = useRouter();
  const ready = !!token && user?.role === "ADMIN";

  useEffect(() => {
    if (!token || user?.role !== "ADMIN") {
      router.replace("/login");
    }
  }, [token, user, router]);

  return { token: token!, user: user!, ready };
}
