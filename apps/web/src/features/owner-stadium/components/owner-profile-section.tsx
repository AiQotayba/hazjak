"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneNumberInput } from "@/components/ui/phone-number-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmAlert } from "@/components/ui/confirm-alert";
import { useAuthStore } from "@/features/auth/store/auth";
import { ownerInputClass } from "../types";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

type OwnerProfile = {
  firstName: string;
  lastName: string;
  phone: string;
};

type OwnerProfileSectionProps = {
  profile: OwnerProfile;
  setProfile: React.Dispatch<React.SetStateAction<OwnerProfile>>;
  saveProfile: (e: React.FormEvent) => Promise<void>;
};

export function OwnerProfileSection({
  profile,
  setProfile,
  saveProfile,
}: OwnerProfileSectionProps) {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [logoutOpen, setLogoutOpen] = useState(false);

  function handleLogout() {
    logout();
    setLogoutOpen(false);
    router.replace("/login");
  }

  return (
    <>
    <Card className="border-0 shadow-soft max-w-lg">
      <CardContent className="p-5 space-y-4">
        <p className="text-sm text-muted-foreground">
          بيانات تسجيل الدخول — منفصلة عن إعدادات الملعب.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void saveProfile(e);
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="الاسم الأول">
              <Input
                className={ownerInputClass}
                value={profile.firstName}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, firstName: e.target.value }))
                }
              />
            </Field>
            <Field label="اسم العائلة">
              <Input
                className={ownerInputClass}
                value={profile.lastName}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, lastName: e.target.value }))
                }
              />
            </Field>
          </div>

          <Field label="رقم الهاتف (واتساب)">
            <PhoneNumberInput
              value={profile.phone}
              onChange={(phone) => setProfile((p) => ({ ...p, phone }))}
              className={ownerInputClass}
            />
          </Field>

          <Button type="submit" className="rounded-2xl shadow-soft w-full sm:w-auto">
            حفظ الملف الشخصي
          </Button>
        </form>

        <Button
          type="button"
          variant="outline"
          className="w-full gap-2 rounded-2xl border-0 bg-destructive/5 text-destructive shadow-soft"
          onClick={() => setLogoutOpen(true)}
        >
          <LogOut className="h-4 w-4" />
          تسجيل الخروج
        </Button>
      </CardContent>
    </Card>

    <ConfirmAlert
      open={logoutOpen}
      onOpenChange={setLogoutOpen}
      title="تسجيل الخروج"
      description="هل تريد تسجيل الخروج؟ ستحتاج تسجيل الدخول مرة أخرى للوصول إلى لوحة الملعب."
      confirmLabel="تأكيد الخروج"
      destructive
      onConfirm={handleLogout}
    />
    </>
  );
}
