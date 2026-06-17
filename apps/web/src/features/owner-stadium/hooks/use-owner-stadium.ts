"use client";

import { useEffect, useState } from "react";
import type { AuthUser } from "@hazjak/types";
import { api } from "@/lib/api";
import { useAuthStore } from "@/features/auth/store/auth";
import type { OwnerStadiumData } from "../types";

export function useOwnerStadium() {
  const { token, user, setAuth } = useAuthStore();
  const [stadium, setStadium] = useState<OwnerStadiumData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    phone: user?.phone ?? "",
  });

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api<OwnerStadiumData[]>("/stadiums/mine", { token })
      .then((r) => setStadium(r.data?.[0] ?? null))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!user) return;
    setProfile({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      phone: user.phone ?? "",
    });
  }, [user]);

  function stadiumPayload(s: OwnerStadiumData) {
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

  async function reloadStadium() {
    if (!token) return;
    const res = await api<OwnerStadiumData[]>("/stadiums/mine", { token });
    const s = res.data?.[0];
    if (s) setStadium(s);
  }

  async function saveStadium(successMsg: string) {
    if (!stadium || !token) return;
    setSaving(true);
    const res = await api(`/stadiums/${stadium.id}`, {
      method: "PATCH",
      token,
      body: JSON.stringify(stadiumPayload(stadium)),
    });
    setSaving(false);
    if (res.success) setMsg(successMsg);
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    const res = await api<AuthUser>("/users/profile", {
      method: "PATCH",
      token,
      body: JSON.stringify(profile),
    });
    if (res.success && res.data) {
      setAuth(token, res.data);
      setMsg("تم حفظ الملف الشخصي");
    }
  }

  async function addImage(imageUrl: string) {
    if (!stadium || !token || !imageUrl.trim()) return;
    setUploadingImage(true);
    await api(`/stadiums/${stadium.id}/images`, {
      method: "POST",
      token,
      body: JSON.stringify({ imageUrl: imageUrl.trim() }),
    });
    await reloadStadium();
    setUploadingImage(false);
    setMsg("تمت إضافة الصورة");
  }

  async function moveImage(imageId: string, direction: "up" | "down") {
    if (!stadium?.images?.length || !token) return;
    const sorted = [...stadium.images].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    );
    const index = sorted.findIndex((i) => i.id === imageId);
    if (index < 0) return;
    const swap = direction === "up" ? index - 1 : index + 1;
    if (swap < 0 || swap >= sorted.length) return;
    const reordered = [...sorted];
    [reordered[index], reordered[swap]] = [reordered[swap], reordered[index]];

    const res = await api(`/stadiums/${stadium.id}/images/reorder`, {
      method: "POST",
      token,
      body: JSON.stringify({ imageIds: reordered.map((i) => i.id) }),
    });
    if (res.success && res.data) {
      setStadium((s) => s && { ...s, images: res.data as OwnerStadiumData["images"] });
      setMsg("تم تحديث ترتيب الصور");
    }
  }

  async function removeImage(imageId: string) {
    if (!stadium || !token) return;
    await api(`/stadiums/${stadium.id}/images/${imageId}`, {
      method: "DELETE",
      token,
    });
    setStadium((s) =>
      s ? { ...s, images: s.images?.filter((i) => i.id !== imageId) } : s
    );
    setMsg("تم حذف الصورة");
  }

  return {
    token,
    user,
    stadium,
    setStadium,
    loading,
    uploadingImage,
    msg,
    setMsg,
    saving,
    profile,
    setProfile,
    saveStadium,
    saveProfile,
    addImage,
    moveImage,
    removeImage,
  };
}
