"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import { verifyOtpSchema } from "@beeplay/validation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AuthError,
  AuthFormShell,
  AuthSuccess,
  authInputClass,
} from "@/features/auth/components/auth-form-shell";
import { api } from "@/lib/api";
import { useAuthStore } from "@/features/auth/store/auth";

type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

export default function VerifyEmailPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerifyOtpInput>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      email: user?.email ?? "",
    },
  });

  async function onSubmit(data: VerifyOtpInput) {
    setError("");
    const res = await api("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!res.success) {
      setError(res.message);
      return;
    }
    setDone(true);
    const role = user?.role;
    setTimeout(() => {
      if (role === "STADIUM_OWNER") router.push("/owner/stadium/new");
      else router.push("/user/bookings");
    }, 1200);
  }

  return (
    <AuthFormShell
      icon={MailCheck}
      title="تحقق من بريدك"
      description={
        user?.email
          ? `أدخل رمز التحقق المكوّن من 6 أرقام المرسل إلى ${user.email}`
          : "أدخل رمز التحقق المرسل إلى بريدك"
      }
      footer={
        !user && (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link href="/login" className="font-bold text-primary hover:underline">
              تسجيل الدخول
            </Link>
          </p>
        )
      }
    >
      {done ? (
        <AuthSuccess message="تم التحقق بنجاح — جاري التحويل..." />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!user?.email && (
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                className={authInputClass}
                dir="ltr"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
          )}

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

          {error && <AuthError message={error} />}

          <Button
            type="submit"
            className="h-11 w-full rounded-2xl shadow-soft"
            disabled={isSubmitting || !user?.email}
          >
            {isSubmitting ? "جاري التحقق..." : "تحقق"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            في التطوير: راجع سجل الخادم للرمز
          </p>
        </form>
      )}
    </AuthFormShell>
  );
}
