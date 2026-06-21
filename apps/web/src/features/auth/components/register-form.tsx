"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, UserPlus } from "lucide-react";
import { registerSchema, type RegisterInput } from "@hazjak/validation";
import { APP_MOTTO_AR } from "@hazjak/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { PhoneNumberInput } from "@/components/ui/phone-number-input";
import {
  AuthError,
  AuthFormShell,
  authInputClass,
} from "@/features/auth/components/auth-form-shell";
import { api } from "@/lib/api";
import { useAuthStore } from "@/features/auth/store/auth";
import type { AuthUser } from "@hazjak/types";

const VARIANTS = {
  player: {
    icon: UserPlus,
    title: "إنشاء حساب",
    description: APP_MOTTO_AR,
    submitLabel: "تسجيل",
    role: undefined as undefined,
  },
  owner: {
    icon: Building2,
    title: "سجّل كصاحب ملعب",
    description: "أنشئ حسابك ثم أضف بيانات ملعبك ",
    submitLabel: "متابعة التسجيل",
    role: "STADIUM_OWNER" as const,
  },
} as const;

type RegisterFormProps = {
  variant: keyof typeof VARIANTS;
};

export function RegisterForm({ variant }: RegisterFormProps) {
  const { icon, title, description, submitLabel, role } = VARIANTS[variant];
  const router = useRouter();
  const setVerificationPending = useAuthStore((s) => s.setVerificationPending);
  const [error, setError] = useState("");

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterInput) {
    setError("");
    const payload = {
      ...data,
      role: role === "STADIUM_OWNER" ? ("STADIUM_OWNER" as const) : undefined,
    };
    const res = await api<{ verificationToken: string; user: AuthUser }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!res.success || !res.data) {
      setError(res.message);
      return;
    }
    setVerificationPending(res.data.verificationToken, res.data.user);
    router.push("/verify-email");
  }

  const footer =
    variant === "owner" ? (
      <p className="mt-6 text-center text-sm text-muted-foreground">
        لديك حساب؟{" "}
        <Link href="/login" className="font-bold text-primary hover:underline">
          دخول
        </Link>
        {" · "}
        <Link href="/register" className="font-bold text-primary hover:underline">
          تسجيل كلاعب
        </Link>
      </p>
    ) : (
      <p className="mt-6 text-center text-sm text-muted-foreground">
        لديك حساب؟{" "}
        <Link href="/login" className="font-bold text-primary hover:underline">
          دخول
        </Link>
      </p>
    );

  return (
    <AuthFormShell icon={icon} title={title} description={description} footer={footer}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="firstName">الاسم الأول</Label>
            <Input
              id="firstName"
              autoComplete="given-name"
              className={authInputClass}
              {...register("firstName")}
            />
            {errors.firstName && (
              <p className="text-xs text-destructive">{errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">اسم العائلة</Label>
            <Input
              id="lastName"
              autoComplete="family-name"
              className={authInputClass}
              {...register("lastName")}
            />
            {errors.lastName && (
              <p className="text-xs text-destructive">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">رقم الهاتف (واتساب)</Label>
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

        <div className="space-y-2">
          <Label htmlFor="password">كلمة المرور</Label>
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
          {isSubmitting ? "جاري التسجيل..." : submitLabel}
        </Button>
      </form>
    </AuthFormShell>
  );
}
