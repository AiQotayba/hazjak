"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole } from "lucide-react";
import { resetPasswordSchema } from "@hazjak/validation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import {
  AuthError,
  AuthFormShell,
  AuthSuccess,
  authInputClass,
} from "@/features/auth/components/auth-form-shell";
import { api } from "@/lib/api";

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: searchParams.get("email") ?? "",
    },
  });

  async function onSubmit(data: ResetPasswordInput) {
    setError("");
    const res = await api("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!res.success) {
      setError(res.message);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  return (
    <AuthFormShell
      icon={LockKeyhole}
      title="إعادة تعيين كلمة المرور"
      description="أدخل رمز التحقق وكلمة المرور الجديدة"
      footer={
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-bold text-primary hover:underline">
            العودة لتسجيل الدخول
          </Link>
        </p>
      }
    >
      {done ? (
        <AuthSuccess message="تم تحديث كلمة المرور — جاري تحويلك لتسجيل الدخول..." />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              className={authInputClass}
              dir="ltr"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="otp">رمز التحقق</Label>
            <Input
              id="otp"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              className={`${authInputClass} text-center tracking-[0.4em] tabular-nums`}
              dir="ltr"
              {...register("otp")}
            />
            {errors.otp && (
              <p className="text-xs text-destructive">{errors.otp.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور الجديدة</Label>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              className={authInputClass}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          {error && <AuthError message={error} />}

          <Button
            type="submit"
            className="h-11 w-full rounded-2xl shadow-soft"
            disabled={isSubmitting}
          >
            {isSubmitting ? "جاري الحفظ..." : "حفظ كلمة المرور"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            لم يصلك الرمز؟{" "}
            <Link href="/forgot-password" className="font-bold text-primary hover:underline">
              إعادة الإرسال
            </Link>
          </p>
        </form>
      )}
    </AuthFormShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
