"use client";

import Image from "next/image";
import { LogOut, Mail, Pencil, Phone, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AuthUser } from "@hazjak/types";
import { cn } from "@/lib/utils";
import { DialogDescription, DialogContent, Dialog, DialogHeader, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { useAuthStore } from "@/features/auth/store/auth";

interface UserProfileHeroProps {
  user: AuthUser | null;
  onEdit?: () => void;
}

export function UserProfileHero({ user, onEdit }: UserProfileHeroProps) {
  const [logoutOpen, setLogoutOpen] = useState(false);
  const { logout } = useAuthStore();
  const initials =
    `${user?.firstName?.charAt(0) ?? ""}${user?.lastName?.charAt(0) ?? ""}`.trim() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "?";

  const fullName = user ? `${user.firstName} ${user.lastName}` : "الملف الشخصي";

  return (
    <div className="surface-card flex flex-col items-center p-6 text-center">
      <div
        className={cn(
          "relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full",
          "bg-muted text-primary font-display text-3xl font-bold ring-2 ring-border"
        )}
      >
        {user?.avatar ? (
          <Image src={user.avatar} alt="" fill className="object-cover" sizes="96px" unoptimized />
        ) : (
          initials
        )}
      </div>

      <h1 className="font-display mt-4 text-xl font-bold text-heading">{fullName}</h1>

      <div className="mt-5 w-full space-y-3">
        <ProfileField icon={Mail} label="البريد الإلكتروني" value={user?.email ?? "—"} ltr />
        <ProfileField
          icon={Phone}
          label="رقم الهاتف"
          value={user?.phone || "غير مضاف"}
          ltr={!!user?.phone}
        />
      </div>

      {user?.isEmailVerified && (
        <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
          <ShieldCheck className="h-3.5 w-3.5" />
          بريد موثّق
        </p>
      )}
      <div className="flex flex-col w-full gap-2">
        {onEdit && (
          <Button className="mt-5 w-full rounded-full gap-2 shadow-soft" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
            تعديل الملف الشخصي
          </Button>
        )}
        <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full gap-2 border-0 bg-destructive/5 text-destructive shadow-soft"
            >
              <LogOut className="h-4 w-4" />
              تسجيل الخروج
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm sm:max-w-md">
            <DialogHeader>
              <DialogTitle>تسجيل الخروج</DialogTitle>
              <DialogDescription>
                هل تريد تسجيل الخروج؟ ستحتاج تسجيل الدخول مرة أخرى للوصول إلى حجوزاتك.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-row gap-2 *:w-full sm:*:w-auto">
              <Button variant="outline" onClick={() => setLogoutOpen(false)}>
                إلغاء
              </Button>
              <Button variant="destructive" className="gap-2" onClick={() => logout()}>
                <LogOut className="h-4 w-4" />
                تأكيد الخروج
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function ProfileField({
  icon: Icon,
  label,
  value,
  ltr,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  ltr?: boolean;
}) {
  return (
    <div className="w-full rounded-xl bg-muted/40 px-4 py-3 text-start">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <div className="mt-0.5 flex items-center justify-start gap-2">
        <Icon className="h-4 w-4 shrink-0 text-primary" />
        <span
          className={cn("min-w-0 truncate text-sm font-medium text-heading", ltr && "tabular-nums")}
          dir={ltr ? "ltr" : undefined}
        >
          {value}
        </span>
      </div>
    </div>
  );
}
