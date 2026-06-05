"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import { loginSchema, type LoginInput } from "@beeplay/validation";
import { APP_MOTTO_AR } from "@beeplay/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { api } from "@/lib/api";
import { useAuthStore } from "@/features/auth/store/auth";
import type { AuthUser } from "@beeplay/types";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setError("");
    const res = await api<{ accessToken: string; user: AuthUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!res.success || !res.data) {
      setError(res.message);
      return;
    }
    setAuth(res.data.accessToken, res.data.user);
    const role = res.data.user.role;
    if (role === "STADIUM_OWNER") router.push("/owner");
    else if (role === "ADMIN") router.push(process.env.NEXT_PUBLIC_ADMIN_URL ?? "/");
    else router.push("/user/bookings");
  }

  return (
    <div className="rounded-3xl bg-card p-6 sm:p-8 shadow-card">
      <div className="mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 mb-4">
          <LogIn className="h-6 w-6 text-primary" />
        </div>
        <h1 className="font-display text-2xl font-bold text-heading">مرحباً بعودتك</h1>
        <p className="text-sm text-muted-foreground mt-1.5">{APP_MOTTO_AR}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            className="rounded-2xl border-0 shadow-soft bg-secondary/80 h-11"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">كلمة المرور</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary font-medium hover:underline"
            >
              نسيتها؟
            </Link>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            className="rounded-2xl border-0 shadow-soft bg-secondary/80 h-11"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>
        {error && (
          <p className="text-sm text-destructive text-center rounded-xl bg-destructive/10 py-2.5 px-3">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full rounded-2xl h-11 shadow-soft gap-2" disabled={isSubmitting}>
          {isSubmitting ? "جاري الدخول..." : "تسجيل الدخول"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        ليس لديك حساب؟{" "}
        <Link href="/register" className="text-primary font-bold hover:underline">
          إنشاء حساب
        </Link>
      </p>
    </div>
  );
}
