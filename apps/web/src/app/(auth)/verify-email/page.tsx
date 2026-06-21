"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MessageCircle } from "lucide-react";
import { verifyOtpSchema } from "@hazjak/validation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneNumberInput } from "@/components/ui/phone-number-input";
import { formatPhoneDisplay } from "@hazjak/utils";
import {
  AuthError,
  AuthFormShell,
  AuthSuccess,
  authInputClass,
} from "@/features/auth/components/auth-form-shell";
import { api } from "@/lib/api";
import { useAuthStore } from "@/features/auth/store/auth";
import type { AuthUser } from "@hazjak/types";

type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

export default function VerifyEmailPage() {
  const router = useRouter();
  const pendingUser = useAuthStore((s) => s.pendingUser);
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerifyOtpInput>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      phone: pendingUser?.phone ?? "",
    },
  });

  async function onSubmit(data: VerifyOtpInput) {
    setError("");
    const res = await api<{ accessToken: string; user: AuthUser }>("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!res.success || !res.data) {
      setError(res.message);
      return;
    }
    setAuth(res.data.accessToken, res.data.user);
    setDone(true);
    const role = res.data.user.role;
    setTimeout(() => {
      if (role === "STADIUM_OWNER") router.push("/owner/stadium/new");
      else router.push("/user/bookings");
    }, 1200);
  }

  const phone = pendingUser?.phone;

  return (
    <AuthFormShell
      icon={MessageCircle}
      title="تحقق من واتساب"
      description={
        phone
          ? `أدخل رمز التحقق المكوّن من 6 أرقام المرسل إلى ${formatPhoneDisplay(phone)}`
          : "أدخل رقم هاتفك ورمز التحقق المرسل عبر واتساب"
      }
      footer={
        !pendingUser && (
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
          {!phone && (
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <PhoneNumberInput
                    id="phone"
                    value={field.value}
                    onChange={field.onChange}
                    className={authInputClass}
                  />
                )}
              />
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone.message}</p>
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
            disabled={isSubmitting}
          >
            {isSubmitting ? "جاري التحقق..." : "تحقق"}
          </Button>
        </form>
      )}
    </AuthFormShell>
  );
}
