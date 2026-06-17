"use client";

import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { StadiumManagementTabs, useOwnerStadium } from "@/features/owner-stadium";

export default function OwnerStadiumPage() {
  const {
    token,
    stadium,
    setStadium,
    loading,
    saving,
    saveStadium,
    uploadingImage,
    addImage,
    moveImage,
    removeImage,
    msg,
  } = useOwnerStadium();

  if (loading) {
    return (
      <>
        <PageHeader title="الملعب" description="بيانات المنشأة والصور والتسعير" />
        <Skeleton className="h-10 w-full max-w-md rounded-xl mb-4" />
        <Skeleton className="h-96 w-full max-w-2xl rounded-2xl" />
      </>
    );
  }

  if (!stadium) {
    return (
      <>
        <PageHeader title="الملعب" description="بيانات المنشأة والصور والتسعير" />
        <EmptyState
          title="لا يوجد ملعب"
          description="سجّل ملعبك الآن لبدء استقبال الحجوزات"
          actionLabel="تسجيل ملعب جديد"
          actionHref="/owner/stadium/new"
        />
      </>
    );
  }

  return (
    <>
      <PageHeader title="الملعب" description="بيانات المنشأة والصور والتسعير" />

      {msg && (
        <p className="text-sm text-primary font-bold mb-4 rounded-2xl bg-primary/10 px-4 py-2">
          {msg}
        </p>
      )}

      <StadiumManagementTabs
        stadium={stadium}
        setStadium={setStadium}
        saving={saving}
        saveStadium={saveStadium}
        token={token}
        uploadingImage={uploadingImage}
        addImage={addImage}
        moveImage={moveImage}
        removeImage={removeImage}
      />
    </>
  );
}
