"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import { loginSchema, type LoginInput } from "@hazjak/validation";
import { APP_MOTTO_AR } from "@hazjak/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { useAuthStore } from "@/features/auth/store/auth";
import { redirectAfterLogin, useRedirectIfAuthenticated } from "@/features/auth";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const loginError = useAuthStore((s) => s.loginError);
  const isLoggingIn = useAuthStore((s) => s.isLoggingIn);
  const clearLoginError = useAuthStore((s) => s.clearLoginError);
  const { hydrated, isAuthenticated } = useRedirectIfAuthenticated();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  if (!hydrated || isAuthenticated) {
    return null;
  }

  async function onSubmit(data: LoginInput) {
    clearLoginError();
    const result = await login(data);

    if (result.ok === false && result.reason === "verify") {
      router.push("/verify-email");
      return;
    }

    if (result.ok === false) return;

    redirectAfterLogin(router, result.user.role, searchParams.get("next"));
  }

  return (
    <div className="rounded-2xl bg-card p-6 sm:p-8 shadow-card">
      <div className="mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/12 mb-4">
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
            className="h-11"
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
            className="h-11"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>
        {loginError && (
          <p className="text-sm text-destructive text-center rounded-lg bg-destructive/10 py-2.5 px-3">
            {loginError}
          </p>
        )}
        <Button type="submit" className="w-full h-11 shadow-soft gap-2" disabled={isLoggingIn}>
          {isLoggingIn ? "جاري الدخول..." : "تسجيل الدخول"}
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
