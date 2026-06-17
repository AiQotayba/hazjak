"use client";

import { PageHeader } from "@/components/layout/page-header";
import { OwnerProfileSection, useOwnerStadium } from "@/features/owner-stadium";

export default function OwnerProfilePage() {
  const { user, profile, setProfile, saveProfile, msg } = useOwnerStadium();

  return (
    <>
      <PageHeader title="حسابي" description="بياناتك الشخصية وتسجيل الدخول" />

      {msg && (
        <p className="text-sm text-primary font-bold mb-4 rounded-2xl bg-primary/10 px-4 py-2">
          {msg}
        </p>
      )}

      <OwnerProfileSection
        profile={profile}
        setProfile={setProfile}
        email={user?.email ?? ""}
        saveProfile={saveProfile}
      />
    </>
  );
}
