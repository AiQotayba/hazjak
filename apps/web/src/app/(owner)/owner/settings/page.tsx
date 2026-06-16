"use client";

import { useEffect, useState } from "react";
import { MediaImage } from "@/components/ui/media-image";
import {
  ExternalLink,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  ImageIcon,
  MapPin,
  Phone,
  Play,
  User,
  Wallet,
} from "lucide-react";
import { APP_CITIES, SPORT_TYPE_OPTIONS } from "@hazjak/constants";
import { formatPrice } from "@hazjak/utils";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/features/auth/store/auth";
import { OwnerAvailabilityTab } from "@/features/owner-stadium/components/owner-availability-tab";
import { ImageUpload } from "@/components/ui/image-upload";
import Link from "next/link";
import Image from "next/image";

type StadiumData = {
  id: string;
  slug: string;
  name: string;
  description: string;
  city: string;
  area: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  morningPrice: number;
  eveningPrice: number;
  depositAmount: number | null;
  contactPhone: string | null;
  contactWhatsapp: string | null;
  shamCashId: string | null;
  shamCashQrImage: string | null;
  coverImage: string | null;
  videoUrl: string | null;
  sportType?: string;
  isActive?: boolean;
  isSuspended?: boolean;
  images?: { id: string; imageUrl: string; sortOrder?: number }[];
};

const inputClass = "border-0 bg-secondary/60 shadow-none rounded-2xl h-11";

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

function SaveButton({ saving, label }: { saving: boolean; label: string }) {
  return (
    <Button type="submit" className="rounded-2xl shadow-soft w-full sm:w-auto" disabled={saving}>
      {saving ? "جاري الحفظ..." : label}
    </Button>
  );
}

function StadiumHeader({ stadium }: { stadium: StadiumData }) {
  return (
    <>
      {stadium.coverImage && (
        <div className="relative aspect-[9/6] bg-muted">
          <MediaImage
            src={stadium.coverImage}
            alt={stadium.name}
            fill
            className="object-cover"
            sizes="(max-width:672px) 100vw, 672px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-heading/60 to-transparent" />
          <div className="absolute bottom-3 start-3 end-3">
            <p className="font-display text-lg font-bold text-white">{stadium.name}</p>
            <p className="text-xs text-white/85 flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3" />
              {[stadium.area, stadium.city].filter(Boolean).join("، ")}
            </p>
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2 px-5 pt-4">
        <Badge variant={stadium.isActive ? "success" : "secondary"}>
          {stadium.isActive ? "نشط" : "غير نشط"}
        </Badge>
        {stadium.isSuspended && <Badge variant="destructive">موقوف</Badge>}
        <Link
          href={`/stadiums/${stadium.slug}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-primary ms-auto hover:underline"
          target="_blank"
        >
          صفحة الملعب
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </>
  );
}

export default function OwnerSettingsPage() {
  const { token, user, setAuth } = useAuthStore();
  const [profile, setProfile] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    phone: user?.phone ?? "",
  });
  const [stadium, setStadium] = useState<StadiumData | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    api<StadiumData[]>("/stadiums/mine", { token }).then((r) => {
      const s = r.data?.[0];
      if (s) setStadium(s);
    });
  }, [token]);

  useEffect(() => {
    if (!user) return;
    setProfile({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      phone: user.phone ?? "",
    });
  }, [user]);

  function stadiumPayload(s: StadiumData) {
    return {
      name: s.name,
      description: s.description,
      city: s.city,
      area: s.area,
      address: s.address,
      latitude: s.latitude ?? undefined,
      longitude: s.longitude ?? undefined,
      morningPrice: Number(s.morningPrice),
      eveningPrice: Number(s.eveningPrice),
      depositAmount: s.depositAmount != null ? Number(s.depositAmount) : undefined,
      contactPhone: s.contactPhone || undefined,
      contactWhatsapp: s.contactWhatsapp || undefined,
      shamCashId: s.shamCashId || undefined,
      shamCashQrImage: s.shamCashQrImage || undefined,
      coverImage: s.coverImage || undefined,
      videoUrl: s.videoUrl || undefined,
      sportType: s.sportType,
    };
  }

  async function saveStadium(successMsg: string) {
    if (!stadium) return;
    setSaving(true);
    const res = await api(`/stadiums/${stadium.id}`, {
      method: "PATCH",
      token: token!,
      body: JSON.stringify(stadiumPayload(stadium)),
    });
    setSaving(false);
    if (res.success) setMsg(successMsg);
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    const res = await api<typeof user>("/users/profile", {
      method: "PATCH",
      token: token!,
      body: JSON.stringify(profile),
    });
    if (res.success && res.data && token) {
      setAuth(token, res.data);
      setMsg("تم حفظ الملف الشخصي");
    }
  }

  async function addImage(imageUrl: string) {
    if (!stadium || !imageUrl.trim()) return;
    setUploadingImage(true);
    await api(`/stadiums/${stadium.id}/images`, {
      method: "POST",
      token: token!,
      body: JSON.stringify({ imageUrl: imageUrl.trim() }),
    });
    const res = await api<StadiumData[]>("/stadiums/mine", { token: token! });
    const s = res.data?.[0];
    if (s) setStadium(s);
    setUploadingImage(false);
    setMsg("تمت إضافة الصورة");
  }

  async function moveImage(imageId: string, direction: "up" | "down") {
    if (!stadium?.images?.length) return;
    const sorted = [...stadium.images].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    );
    const index = sorted.findIndex((i) => i.id === imageId);
    if (index < 0) return;
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= sorted.length) return;

    const reordered = [...sorted];
    [reordered[index], reordered[swapIndex]] = [reordered[swapIndex], reordered[index]];

    const res = await api(`/stadiums/${stadium.id}/images/reorder`, {
      method: "POST",
      token: token!,
      body: JSON.stringify({ imageIds: reordered.map((i) => i.id) }),
    });
    if (res.success && res.data) {
      setStadium((s) => s && { ...s, images: res.data as StadiumData["images"] });
      setMsg("تم تحديث ترتيب الصور");
    }
  }

  async function removeImage(imageId: string) {
    if (!stadium) return;
    await api(`/stadiums/${stadium.id}/images/${imageId}`, {
      method: "DELETE",
      token: token!,
    });
    setStadium((s) =>
      s ? { ...s, images: s.images?.filter((i) => i.id !== imageId) } : s
    );
    setMsg("تم حذف الصورة");
  }

  if (!stadium) {
    return (
      <>
        <PageHeader title="إعدادات الملعب" description="بيانات المنشأة وحسابك الشخصي" />
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
      <PageHeader title="إعدادات الملعب" description="بيانات المنشأة وحسابك الشخصي" />

      {msg && (
        <p className="text-sm text-primary font-bold mb-4 rounded-2xl bg-primary/10 px-4 py-2">
          {msg}
        </p>
      )}

      <Tabs defaultValue="general" className="max-w-2xl" dir="rtl">
        <TabsList className="w-full mb-4 grid grid-cols-2 sm:inline-flex sm:w-fit">
          <TabsTrigger value="general" className="gap-1.5 text-xs sm:text-sm">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            عام
          </TabsTrigger>
          <TabsTrigger value="pricing" className="gap-1.5 text-xs sm:text-sm">
            <Wallet className="h-3.5 w-3.5 shrink-0" />
            التسعير والتواصل
          </TabsTrigger>
          <TabsTrigger value="availability" className="gap-1.5 text-xs sm:text-sm">
            <CalendarClock className="h-3.5 w-3.5 shrink-0" />
            المواعيد
          </TabsTrigger>
          <TabsTrigger value="images" className="gap-1.5 text-xs sm:text-sm">
            <ImageIcon className="h-3.5 w-3.5 shrink-0" />
            الصور
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-1.5 text-xs sm:text-sm">
            <User className="h-3.5 w-3.5 shrink-0" />
            حسابي
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="border-0 shadow-soft overflow-hidden">
            <StadiumHeader stadium={stadium} />
            <CardContent className="p-5 space-y-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveStadium("تم حفظ المعلومات العامة");
                }}
                className="space-y-4"
              >
                <Field label="اسم الملعب">
                  <Input
                    className={inputClass}
                    value={stadium.name}
                    onChange={(e) =>
                      setStadium((s) => s && { ...s, name: e.target.value })
                    }
                  />
                </Field>
                <div className="flex flex-wrap items-center w-full justify-between *:w-[45%] gap-2">

                  <Field label="الرابط (slug)">
                    <Input
                      className={cn(inputClass, "opacity-70")}
                      value={stadium.slug}
                      disabled
                      dir="ltr"
                    />
                  </Field>

                  <Field label="نوع الملعب">
                    <Select
                      dir="rtl"
                      value={stadium.sportType ?? "FOOTBALL"}
                      onValueChange={(v) => setStadium((s) => s && { ...s, sportType: v })}
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
                </div>

                <Field label="الوصف">
                  <textarea
                    className="w-full min-h-[88px] rounded-2xl border-0 bg-secondary/60 px-4 py-3 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={stadium.description}
                    onChange={(e) =>
                      setStadium((s) => s && { ...s, description: e.target.value })
                    }
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="المدينة">
                    <Select
                      value={stadium.city}
                      onValueChange={(v) => setStadium((s) => s && { ...s, city: v })}
                    >
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
                  <Field label="المنطقة / الحي">
                    <Input
                      className={inputClass}
                      value={stadium.area}
                      onChange={(e) =>
                        setStadium((s) => s && { ...s, area: e.target.value })
                      }
                    />
                  </Field>
                </div>

                <Field label="العنوان التفصيلي">
                  <Input
                    className={inputClass}
                    value={stadium.address}
                    onChange={(e) =>
                      setStadium((s) => s && { ...s, address: e.target.value })
                    }
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="خط العرض (اختياري)">
                    <Input
                      type="number"
                      step="any"
                      className={inputClass}
                      value={stadium.latitude ?? ""}
                      onChange={(e) =>
                        setStadium((s) =>
                          s && {
                            ...s,
                            latitude: e.target.value ? Number(e.target.value) : null,
                          }
                        )
                      }
                      dir="ltr"
                      placeholder="33.5138"
                    />
                  </Field>
                  <Field label="خط الطول (اختياري)">
                    <Input
                      type="number"
                      step="any"
                      className={inputClass}
                      value={stadium.longitude ?? ""}
                      onChange={(e) =>
                        setStadium((s) =>
                          s && {
                            ...s,
                            longitude: e.target.value ? Number(e.target.value) : null,
                          }
                        )
                      }
                      dir="ltr"
                      placeholder="36.2765"
                    />
                  </Field>
                </div>

                <SaveButton saving={saving} label="حفظ المعلومات" />
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing">
          <Card className="border-0 shadow-soft">
            <CardContent className="p-5 space-y-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveStadium("تم حفظ التسعير والتواصل");
                }}
                className="space-y-4"
              >
                <p className="text-sm font-bold text-heading flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-primary" />
                  التسعير
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Field label="صباحي (ل.س)">
                    <Input
                      type="number"
                      className={inputClass}
                      value={stadium.morningPrice}
                      onChange={(e) =>
                        setStadium((s) => s && { ...s, morningPrice: Number(e.target.value) })
                      }
                    />
                  </Field>
                  <Field label="مسائي (ل.س)">
                    <Input
                      type="number"
                      className={inputClass}
                      value={stadium.eveningPrice}
                      onChange={(e) =>
                        setStadium((s) => s && { ...s, eveningPrice: Number(e.target.value) })
                      }
                    />
                  </Field>
                  <Field label="العربون (ل.س)">
                    <Input
                      type="number"
                      className={inputClass}
                      value={stadium.depositAmount ?? ""}
                      onChange={(e) =>
                        setStadium((s) =>
                          s && {
                            ...s,
                            depositAmount: e.target.value ? Number(e.target.value) : null,
                          }
                        )
                      }
                    />
                  </Field>
                </div>

                {stadium.depositAmount != null && stadium.depositAmount > 0 && (
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Wallet className="h-3 w-3 text-primary" />
                    العربون عند التأكيد: {formatPrice(stadium.depositAmount)}
                  </p>
                )}

                <p className="text-sm font-bold text-heading flex items-center gap-2 pt-2 border-t border-border/40">
                  <Phone className="h-4 w-4 text-primary" />
                  التواصل
                </p>
                <p className="text-[11px] text-muted-foreground -mt-2">
                  يظهر للعميل بعد تأكيد الحجز فقط
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="هاتف">
                    <Input
                      className={inputClass}
                      value={stadium.contactPhone ?? ""}
                      onChange={(e) =>
                        setStadium((s) => s && { ...s, contactPhone: e.target.value })
                      }
                      dir="ltr"
                      placeholder="+970..."
                    />
                  </Field>
                  <Field label="واتساب">
                    <Input
                      className={inputClass}
                      value={stadium.contactWhatsapp ?? ""}
                      onChange={(e) =>
                        setStadium((s) => s && { ...s, contactWhatsapp: e.target.value })
                      }
                      dir="ltr"
                      placeholder="+970..."
                    />
                  </Field>
                </div>

                <p className="text-sm font-bold text-heading flex items-center gap-2 pt-2 border-t border-border/40">
                  <Wallet className="h-4 w-4 text-primary" />
                  شام كاش
                </p>
                <p className="text-[11px] text-muted-foreground -mt-2">
                  يُرسل للاعب مع كود العربون عند طلب الحجز
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="معرّف شام كاش">
                    <Input
                      className={inputClass}
                      value={stadium.shamCashId ?? ""}
                      onChange={(e) =>
                        setStadium((s) => s && { ...s, shamCashId: e.target.value })
                      }
                      dir="ltr"
                      placeholder="رقم الحساب أو المعرف"
                    />
                  </Field>
                  <Field label="صورة باركود شام كاش">
                    <ImageUpload
                      value={stadium.shamCashQrImage ?? ""}
                      onChange={(url) =>
                        setStadium((s) => s && { ...s, shamCashQrImage: url || null })
                      }
                      token={token ?? undefined}
                      previewFit="contain"
                      showUrlInput
                      inputClassName={inputClass}
                      disabled={saving}
                    />
                  </Field>
                </div>

                <SaveButton saving={saving} label="حفظ التسعير والتواصل" />
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability">
          {token && <OwnerAvailabilityTab stadiumId={stadium.id} token={token} />}
        </TabsContent>

        <TabsContent value="images">
          <Card className="border-0 shadow-soft">
            <CardContent className="p-5 space-y-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveStadium("تم حفظ صورة الغلاف والفيديو");
                }}
                className="space-y-4"
              >
                <p className="text-sm font-bold text-heading flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  صورة الغلاف
                </p>

                <ImageUpload
                  value={stadium.coverImage ?? ""}
                  onChange={(url) =>
                    setStadium((s) => s && { ...s, coverImage: url || null })
                  }
                  token={token ?? undefined}
                  inputClassName={inputClass}
                  disabled={saving}
                />

                <p className="text-sm font-bold text-heading flex items-center gap-2 pt-2 border-t border-border/40">
                  <Play className="h-4 w-4 text-primary" />
                  فيديو الملعب
                </p>
                <p className="text-[11px] text-muted-foreground -mt-2">
                  رابط YouTube أو Vimeo أو ملف فيديو مباشر
                </p>
                <Field label="رابط الفيديو">
                  <Input
                    className={inputClass}
                    value={stadium.videoUrl ?? ""}
                    onChange={(e) =>
                      setStadium((s) => s && { ...s, videoUrl: e.target.value || null })
                    }
                    dir="ltr"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </Field>

                <SaveButton saving={saving} label="حفظ الغلاف والفيديو" />
              </form>

              <div className="pt-4 border-t border-border/40 space-y-3">
                <p className="text-sm font-bold text-heading">معرض الصور</p>
                <p className="text-[11px] text-muted-foreground">
                  ارفع الصور ورتّبها — الترتيب يظهر في صفحة الملعب
                </p>

                <ImageUpload
                  value=""
                  onChange={(url) => {
                    if (url) void addImage(url);
                  }}
                  token={token ?? undefined}
                  disabled={uploadingImage}
                />

                {stadium.images && stadium.images.length > 0 ? (
                  <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[...stadium.images]
                      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
                      .map((img, index, arr) => (
                      <li
                        key={img.id}
                        className="relative aspect-[9/6] rounded-xl overflow-hidden bg-muted group"
                      >
                        <Image
                          src={img.imageUrl}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="160px"
                          unoptimized
                        />
                        <div className="absolute inset-x-0 top-0 flex justify-between p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex flex-col gap-0.5">
                            <button
                              type="button"
                              disabled={index === 0}
                              className="flex h-6 w-6 items-center justify-center rounded-md bg-heading/70 text-white disabled:opacity-30"
                              onClick={() => moveImage(img.id, "up")}
                              aria-label="تحريك لأعلى"
                            >
                              <ChevronUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={index === arr.length - 1}
                              className="flex h-6 w-6 items-center justify-center rounded-md bg-heading/70 text-white disabled:opacity-30"
                              onClick={() => moveImage(img.id, "down")}
                              aria-label="تحريك لأسفل"
                            >
                              <ChevronDown className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <button
                            type="button"
                            className="flex h-6 items-center rounded-md bg-destructive/90 px-2 text-[10px] font-bold text-white"
                            onClick={() => removeImage(img.id)}
                          >
                            حذف
                          </button>
                        </div>
                        <span className="absolute bottom-1 start-1 rounded bg-heading/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {index + 1}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">لا صور إضافية بعد</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card className="border-0 shadow-soft max-w-lg">
            <CardContent className="p-5 space-y-4">
              <p className="text-sm text-muted-foreground">
                بيانات تسجيل الدخول — منفصلة عن إعدادات الملعب.
              </p>
              <form onSubmit={saveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="الاسم الأول">
                    <Input
                      className={inputClass}
                      value={profile.firstName}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, firstName: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="اسم العائلة">
                    <Input
                      className={inputClass}
                      value={profile.lastName}
                      onChange={(e) =>
                        setProfile((p) => ({ ...p, lastName: e.target.value }))
                      }
                    />
                  </Field>
                </div>

                <Field label="البريد">
                  <Input
                    className={cn(inputClass, "opacity-70")}
                    value={user?.email ?? ""}
                    disabled
                    dir="ltr"
                  />
                </Field>

                <Field label="الهاتف">
                  <Input
                    className={inputClass}
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
        </TabsContent>
      </Tabs>
    </>
  );
}
