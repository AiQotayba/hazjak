"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
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
  email: string;
  saveProfile: (e: React.FormEvent) => Promise<void>;
};

export function OwnerProfileSection({
  profile,
  setProfile,
  email,
  saveProfile,
}: OwnerProfileSectionProps) {
  return (
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

          <Field label="البريد">
            <Input
              className={cn(ownerInputClass, "opacity-70")}
              value={email}
              disabled
              dir="ltr"
            />
          </Field>

          <Field label="الهاتف">
            <Input
              className={ownerInputClass}
              value={profile.phone}
              onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
              dir="ltr"
            />
          </Field>

          <Button type="submit" className="rounded-2xl shadow-soft w-full sm:w-auto">
            حفظ الملف الشخصي
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
