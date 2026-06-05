"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { StadiumDetailView, type StadiumDetailData } from "@/features/stadium/components/stadium-detail-view";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { useAuthStore } from "@/features/auth/store/auth";

export default function StadiumPage() {
  const { slug } = useParams<{ slug: string }>();
  const { token, user } = useAuthStore();
  const [stadium, setStadium] = useState<StadiumDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<StadiumDetailData>(`/stadiums/${slug}`)
      .then((res) => {
        if (res.data) setStadium(res.data as StadiumDetailData);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-4 space-y-6" dir="rtl">
        <Skeleton className="h-4 w-24" />
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-3">
            <Skeleton className="aspect-[9/6] rounded-3xl" />
            <Skeleton className="h-36 rounded-3xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4 rounded-xl" />
            <Skeleton className="h-6 w-1/3 rounded-lg" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-12 rounded-2xl" />
          </div>
        </div>
        <Skeleton className="h-56 rounded-3xl" />
      </div>
    );
  }

  if (!stadium) {
    return (
      <p className="text-center py-24 text-muted-foreground font-medium px-4">الملعب غير موجود</p>
    );
  }

  return (
    <div className="px-4 pt-4 md:pt-8 pb-6">
      <StadiumDetailView stadium={stadium} token={token} user={user} />
    </div>
  );
}
