"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createStadiumSchema } from "@hazjak/validation";
import { APP_CITIES, SPORT_TYPE_OPTIONS } from "@hazjak/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/features/auth/store/auth";

const registerStadiumFormSchema = createStadiumSchema.extend({
  morningPrice: z.coerce.number().positive("سعر الصباح مطلوب"),
  eveningPrice: z.coerce.number().positive("سعر المساء مطلوب"),
  depositAmount: z
    .union([z.coerce.number().nonnegative(), z.literal("")])
    .optional()
    .transform((v) => (v === "" || v === undefined ? undefined : v)),
  latitude: z
    .union([z.coerce.number(), z.literal("")])
    .optional()
    .transform((v) => (v === "" || v === undefined ? undefined : v)),
  longitude: z
    .union([z.coerce.number(), z.literal("")])
    .optional()
    .transform((v) => (v === "" || v === undefined ? undefined : v)),
});

type RegisterStadiumFormValues = z.input<typeof registerStadiumFormSchema>;

const inputClass = "border-0 bg-secondary/60 shadow-none rounded-2xl h-11";

function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function RegisterStadiumForm() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterStadiumFormValues>({
    resolver: zodResolver(registerStadiumFormSchema),
    defaultValues: {
      city: APP_CITIES[0],
      sportType: "FOOTBALL",
      morningPrice: "" as unknown as number,
      eveningPrice: "" as unknown as number,
    },
  });

  const city = watch("city");
  const sportType = watch("sportType");

  async function onSubmit(values: RegisterStadiumFormValues) {
    if (!token) return;
    setError("");
    const parsed = registerStadiumFormSchema.parse(values);
    const res = await api<{ id: string }>("/stadiums", {
      method: "POST",
      token,
      body: JSON.stringify(parsed),
    });
    if (!res.success) {
      setError(res.message);
      return;
    }
    router.push("/owner/settings");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-4">
      <Card className="border-0 shadow-soft overflow-hidden">
        <CardContent className="p-5 space-y-4">
          <CardTitle className="text-base font-bold text-heading">معلومات الملعب</CardTitle>

          <Field label="اسم الملعب" error={errors.name?.message}>
            <Input className={inputClass} placeholder="مثال: ملعب الأمل" {...register("name")} />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="نوع الملعب" error={errors.sportType?.message}>
              <Select
                value={typeof sportType === "string" ? sportType : "FOOTBALL"}
                onValueChange={(v) => setValue("sportType", v as RegisterStadiumFormValues["sportType"])}
              >
                <SelectTrigger className={inputClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start">
                  {SPORT_TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="المدينة" error={errors.city?.message}>
              <Select value={city} onValueChange={(v) => setValue("city", v)}>
                <SelectTrigger className={inputClass}>
                  <SelectValue placeholder="اختر المدينة" />
                </SelectTrigger>
                <SelectContent align="start">
                  {APP_CITIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="الوصف" error={errors.description?.message}>
            <textarea
              className="w-full min-h-[88px] rounded-2xl border-0 bg-secondary/60 px-4 py-3 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="وصف الملعب، المساحة، الإضاءة، التكييف..."
              {...register("description")}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="المنطقة / الحي" error={errors.area?.message}>
              <Input className={inputClass} placeholder="حي الشجاعية" {...register("area")} />
            </Field>
            <Field label="العنوان التفصيلي" error={errors.address?.message}>
              <Input className={inputClass} placeholder="شارع..." {...register("address")} />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="خط العرض (اختياري)" error={errors.latitude?.message}>
              <Input
                type="number"
                step="any"
                className={inputClass}
                dir="ltr"
                placeholder="33.5138"
                {...register("latitude")}
              />
            </Field>
            <Field label="خط الطول (اختياري)" error={errors.longitude?.message}>
              <Input
                type="number"
                step="any"
                className={inputClass}
                dir="ltr"
                placeholder="36.2765"
                {...register("longitude")}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-soft overflow-hidden">
        <CardContent className="p-5 space-y-4">
          <CardTitle className="text-base font-bold text-heading">التسعير والتواصل</CardTitle>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="سعر الصباح (ل.س)" error={errors.morningPrice?.message}>
              <Input
                type="number"
                min={1}
                className={cn(inputClass, "tabular-nums")}
                dir="ltr"
                {...register("morningPrice")}
              />
            </Field>
            <Field label="سعر المساء (ل.س)" error={errors.eveningPrice?.message}>
              <Input
                type="number"
                min={1}
                className={cn(inputClass, "tabular-nums")}
                dir="ltr"
                {...register("eveningPrice")}
              />
            </Field>
            <Field label="العربون (اختياري)" error={errors.depositAmount?.message}>
              <Input
                type="number"
                min={0}
                className={cn(inputClass, "tabular-nums")}
                dir="ltr"
                {...register("depositAmount")}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="هاتف التواصل" error={errors.contactPhone?.message}>
              <Input
                className={inputClass}
                dir="ltr"
                placeholder="+963..."
                {...register("contactPhone")}
              />
            </Field>
            <Field label="واتساب (اختياري)" error={errors.contactWhatsapp?.message}>
              <Input
                className={inputClass}
                dir="ltr"
                placeholder="+963..."
                {...register("contactWhatsapp")}
              />
            </Field>
          </div>

          <Field label="صورة الغلاف (رابط — اختياري)" error={errors.coverImage?.message}>
            <Input
              className={inputClass}
              dir="ltr"
              placeholder="https://..."
              {...register("coverImage")}
            />
          </Field>
        </CardContent>
      </Card>

      {error && (
        <p className="rounded-2xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
          {error}
        </p>
      )}

      <Button
        type="submit"
        className="w-full rounded-2xl h-11 shadow-soft sm:w-auto"
        disabled={isSubmitting}
      >
        {isSubmitting ? "جاري التسجيل..." : "تسجيل الملعب"}
      </Button>
    </form>
  );
}
