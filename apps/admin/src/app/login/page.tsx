"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { APP_NAME_AR } from "@hazjak/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { AuthTokens } from "@hazjak/types";

export default function AdminLoginPage() {
  const { token, user, setAuth } = useAuthStore();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && user?.role === "ADMIN") {
      router.replace("/");
    }
  }, [token, user, router]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api<AuthTokens>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ phone, password }),
      });
      if (!res.success || !res.data) {
        setError(res.message || "فشل تسجيل الدخول");
        return;
      }
      if (res.data.user.role !== "ADMIN") {
        setError("حساب الإدارة فقط");
        return;
      }
      setAuth(res.data.accessToken, res.data.user);
      router.replace("/");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-[var(--radius-card)] bg-bg-surface p-8 shadow-[var(--shadow-elevated)]">
        <h1 className="text-xl font-bold text-center mb-1">{APP_NAME_AR}</h1>
        <p className="text-sm text-text-muted text-center mb-8">لوحة الإدارة</p>
        <form onSubmit={login} className="space-y-4">
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="رقم الهاتف"
            required
            autoComplete="tel"
            dir="ltr"
            className="text-start"
          />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="كلمة المرور"
            required
            autoComplete="current-password"
          />
          {error && <p className="text-negative text-sm text-center">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "جاري الدخول..." : "دخول"}
          </Button>
        </form>
      </div>
    </div>
  );
}
