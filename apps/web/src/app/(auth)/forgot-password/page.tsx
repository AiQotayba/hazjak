"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { forgotPasswordSchema } from "@hazjak/validation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PhoneNumberInput } from "@/components/ui/phone-number-input";
import {
  AuthFormShell,
  AuthSuccess,
  authInputClass,
} from "@/features/auth/components/auth-form-shell";
import { api } from "@/lib/api";

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [phoneSent, setPhoneSent] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordInput) {
    const res = await api("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!res.success) return;
    setPhoneSent(data.phone);
    setSent(true);
  }

  return (
    <AuthFormShell
      icon={KeyRound}
      title="استعادة كلمة المرور"
      description="سنرسل رمز تحقق إلى واتساب إن كان الرقم مسجلاً لدينا"
      footer={
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-bold text-primary hover:underline">
            العودة لتسجيل الدخول
          </Link>
        </p>
      }
    >
      {sent ? (
        <div className="space-y-4">
          <AuthSuccess message="إذا كان الرقم مسجلاً، ستصلك رسالة واتساب برمز التحقق" />
          <p className="text-center text-sm text-muted-foreground">
            أدخل الرمز في صفحة إعادة التعيين
          </p>
          <Button className="h-11 w-full rounded-2xl shadow-soft" asChild>
            <Link href={`/reset-password?phone=${encodeURIComponent(phoneSent)}`}>
              إدخال الرمز وكلمة المرور
            </Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          <Button
            type="submit"
            className="h-11 w-full rounded-2xl shadow-soft"
            disabled={isSubmitting}
          >
            {isSubmitting ? "جاري الإرسال..." : "إرسال رمز التحقق"}
          </Button>
        </form>
      )}
    </AuthFormShell>
  );
}
