"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Camera, Loader2, Trash2, UserRound } from "lucide-react";
import { updateProfileSchema } from "@hazjak/validation";
import type { AuthUser } from "@hazjak/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneNumberInput } from "@/components/ui/phone-number-input";
import { Label } from "@/components/ui/label";
import { api, apiUpload } from "@/lib/api";
import { useAuthStore } from "@/features/auth/store/auth";
import { cn } from "@/lib/utils";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ACCEPT_IMAGE = "image/jpeg,image/png,image/webp,image/gif";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

function profileInitials(user: AuthUser | null) {
  const a = user?.firstName?.charAt(0) ?? "";
  const b = user?.lastName?.charAt(0) ?? "";
  const combined = `${a}${b}`.trim();
  return combined || user?.phone?.slice(-1) || "?";
}

export function EditProfileDialog({ open, onOpenChange, onSaved }: EditProfileDialogProps) {
  const { token, user, setAuth } = useAuthStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });

  useEffect(() => {
    if (open && user) {
      setForm({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        phone: user.phone ?? "",
      });
      setAvatarPreview(user.avatar ?? null);
      setError("");
      setFieldErrors({});
    }
  }, [open, user]);

  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  async function handleAvatarPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !token) return;

    if (!ACCEPT_IMAGE.split(",").includes(file.type)) {
      setError("يُسمح فقط بصور JPG أو PNG أو WebP أو GIF");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setError("حجم الصورة 2 ميجابايت كحد أقصى");
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setAvatarPreview(localPreview);
    setUploadingAvatar(true);
    setError("");

    const formData = new FormData();
    formData.append("avatar", file);

    const res = await apiUpload<AuthUser>("/users/profile/avatar", formData, { token });
    setUploadingAvatar(false);

    if (!res.success || !res.data) {
      setError(res.message || "تعذّر رفع الصورة");
      setAvatarPreview(user?.avatar ?? null);
      URL.revokeObjectURL(localPreview);
      return;
    }

    URL.revokeObjectURL(localPreview);
    setAvatarPreview(res.data.avatar ?? null);
    setAuth(token, res.data);
  }

  async function handleRemoveAvatar() {
    if (!token || uploadingAvatar) return;
    setUploadingAvatar(true);
    setError("");
    const res = await api<AuthUser>("/users/profile", {
      method: "PATCH",
      token,
      body: JSON.stringify({ avatar: null }),
    });
    setUploadingAvatar(false);
    if (!res.success || !res.data) {
      setError(res.message || "تعذّر حذف الصورة");
      return;
    }
    setAvatarPreview(null);
    setAuth(token, res.data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: form.phone.trim() || undefined,
    };
    const parsed = updateProfileSchema.safeParse(payload);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.errors.forEach((err) => {
        const key = err.path[0]?.toString() ?? "form";
        errors[key] = err.message;
      });
      setFieldErrors(errors);
      return;
    }
    setSaving(true);
    setError("");
    setFieldErrors({});
    const res = await api<AuthUser>("/users/profile", {
      method: "PATCH",
      token,
      body: JSON.stringify(parsed.data),
    });
    setSaving(false);
    if (!res.success || !res.data) {
      setError(res.message || "تعذّر حفظ التعديلات");
      if (res.errors) {
        const mapped: Record<string, string> = {};
        Object.entries(res.errors).forEach(([k, v]) => {
          mapped[k] = v[0] ?? "";
        });
        setFieldErrors(mapped);
      }
      return;
    }
    setAuth(token, res.data);
    onOpenChange(false);
    onSaved?.();
  }

  const showImage = avatarPreview && !uploadingAvatar;
  const busy = saving || uploadingAvatar;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm sm:max-w-md">
        <DialogHeader>
          <DialogTitle>تعديل الملف الشخصي</DialogTitle>
          <DialogDescription>
            حدّث صورتك واسمك ورقم هاتفك.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div
                className={cn(
                  "relative h-24 w-24 overflow-hidden rounded-2xl bg-primary/15 ring-2 ring-primary/25",
                  uploadingAvatar && "opacity-60"
                )}
              >
                {showImage ? (
                  <Image
                    src={avatarPreview}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="96px"
                    unoptimized={avatarPreview.startsWith("blob:")}
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-primary font-display text-2xl font-bold">
                    {uploadingAvatar ? (
                      <Loader2 className="h-8 w-8 animate-spin" />
                    ) : (
                      profileInitials(user)
                    )}
                  </span>
                )}
              </div>
              {!uploadingAvatar && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -end-1 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft"
                  aria-label="تغيير الصورة"
                >
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept={ACCEPT_IMAGE}
              className="sr-only"
              onChange={handleAvatarPick}
              disabled={busy}
            />
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5 border-0 shadow-soft"
                onClick={() => fileRef.current?.click()}
                disabled={busy}
              >
                <UserRound className="h-3.5 w-3.5" />
                {avatarPreview ? "تغيير الصورة" : "إضافة صورة"}
              </Button>
              {avatarPreview && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs gap-1.5 text-destructive hover:text-destructive"
                  onClick={handleRemoveAvatar}
                  disabled={busy}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  حذف الصورة
                </Button>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground text-center">JPG أو PNG · حتى 2 ميجابايت</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">الاسم الأول</Label>
              <Input
                id="firstName"
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                autoComplete="given-name"
                disabled={busy}
              />
              {fieldErrors.firstName && (
                <p className="text-xs text-destructive">{fieldErrors.firstName}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">اسم العائلة</Label>
              <Input
                id="lastName"
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                autoComplete="family-name"
                disabled={busy}
              />
              {fieldErrors.lastName && (
                <p className="text-xs text-destructive">{fieldErrors.lastName}</p>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">رقم الهاتف</Label>
            <PhoneNumberInput
              id="phone"
              value={form.phone}
              onChange={(phone) => setForm((f) => ({ ...f, phone }))}
              disabled={busy}
              className="rounded-xl border border-border bg-background px-2 focus-within:ring-2 focus-within:ring-ring"
            />
            {fieldErrors.phone && <p className="text-xs text-destructive">{fieldErrors.phone}</p>}
          </div>
          {error && <p className="text-sm text-destructive text-center">{error}</p>}
          <DialogFooter className="gap-2 sm:gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
              إلغاء
            </Button>
            <Button type="submit" disabled={busy}>
              {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
