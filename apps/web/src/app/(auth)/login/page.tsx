"use client";

import { Suspense } from "react";
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
import { AuthFormShell, authInputClass } from "@/features/auth/components/auth-form-shell";
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
    <AuthFormShell
      icon={LogIn}
      title="مرحباً بعودتك"
      description={APP_MOTTO_AR}
      footer={
        <p className="mt-6 text-center text-sm text-muted-foreground">
          ليس لديك حساب؟{" "}
          <Link href="/register" className="font-bold text-primary hover:underline">
            إنشاء حساب
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">البريد الإلكتروني</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            className={authInputClass}
            dir="ltr"
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
              className="text-xs font-medium text-primary hover:underline"
            >
              نسيتها؟
            </Link>
          </div>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            className={authInputClass}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>
        {loginError && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2.5 text-center text-sm text-destructive">
            {loginError}
          </p>
        )}
        <Button type="submit" className="h-11 w-full gap-2 shadow-soft" disabled={isLoggingIn}>
          {isLoggingIn ? "جاري الدخول..." : "تسجيل الدخول"}
        </Button>
      </form>
    </AuthFormShell>
  );
}
