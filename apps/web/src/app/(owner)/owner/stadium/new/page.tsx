"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { RegisterStadiumForm } from "@/features/owner-stadium/components/register-stadium-form";
import { api } from "@/lib/api";
import { useAuthStore } from "@/features/auth/store/auth";

export default function RegisterStadiumPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!token) return;
    api<{ id: string }[]>("/stadiums/mine", { token }).then((res) => {
      if (res.data?.length) {
        router.replace("/owner/settings");
        return;
      }
      setChecking(false);
    });
  }, [token, router]);

  if (checking) {
    return (
      <>
        <PageHeader title="تسجيل ملعب جديد" />
        <div className="max-w-2xl space-y-4">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="تسجيل ملعب جديد"
        description="أدخل بيانات ملعبك لبدء استقبال الحجوزات"
      />
      <RegisterStadiumForm />
    </>
  );
}
