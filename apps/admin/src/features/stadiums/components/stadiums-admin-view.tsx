"use client";

import { useState } from "react";
import { MediaImage } from "@/components/ui/media-image";
import { useQueryClient } from "@tanstack/react-query";
import { MapPin, Plus } from "lucide-react";
import { formatPrice } from "@hazjak/utils";
import { AdminPageHero } from "@/features/shell/components/admin-page-hero";
import { DataTable, type TableColumn } from "@/features/shared/components/data-table";
import { StadiumFormSheet } from "@/components/stadiums/stadium-form-sheet";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";
import { useRequireAdmin } from "@/hooks/use-require-admin";
import { StadiumStatusBadge } from "./stadium-status-badge";
import { StadiumDetailDialog } from "./stadium-detail-dialog";
import type { AdminStadiumRecord } from "../types";

type FormMode = { mode: "create" } | { mode: "edit"; stadium: AdminStadiumRecord };

const columns: TableColumn<AdminStadiumRecord>[] = [
  {
    key: "coverImage",
    label: "الصورة",
    width: "w-20",
    render: (_, row) => (
      <div className="relative h-12 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
        {row.coverImage ? (
          <MediaImage src={row.coverImage} alt="" fill className="object-cover" sizes="64px" />
        ) : (
          <span className="flex h-full items-center justify-center text-lg opacity-40">⚽</span>
        )}
      </div>
    ),
  },
  {
    key: "name",
    label: "الملعب",
    sortable: true,
    render: (_, row) => (
      <div className="min-w-0">
        <p className="font-bold truncate">{row.name}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
          <MapPin className="h-3 w-3 shrink-0" />
          {row.city} — {row.area}
        </p>
      </div>
    ),
  },
  {
    key: "owner",
    label: "المالك",
    render: (_, row) => (
      <span className="text-sm">
        {row.owner.firstName} {row.owner.lastName}
      </span>
    ),
  },
  {
    key: "morningPrice",
    label: "الأسعار",
    render: (_, row) => (
      <span className="text-xs whitespace-nowrap">
        {formatPrice(row.morningPrice)} / {formatPrice(row.eveningPrice)}
      </span>
    ),
  },
  {
    key: "isActive",
    label: "الحالة",
    render: (_, row) => (
      <StadiumStatusBadge isActive={row.isActive} isSuspended={row.isSuspended} />
    ),
  },
];

export function StadiumsAdminView() {
  const { token } = useRequireAdmin();
  const queryClient = useQueryClient();
  const [viewStadium, setViewStadium] = useState<AdminStadiumRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [form, setForm] = useState<FormMode | null>(null);

  async function patchStadium(
    id: string,
    data: Partial<Pick<AdminStadiumRecord, "isActive" | "isSuspended">>
  ) {
    const res = await apiClient.patch(`/stadiums/${id}`, data, { showSuccessToast: true });
    if (!res.isError) {
      queryClient.invalidateQueries({ queryKey: ["table-data", "/stadiums/admin/all"] });
      if (viewStadium?.id === id) {
        setViewStadium((s) => (s ? { ...s, ...data } : s));
      }
    }
  }

  function openDetail(row: AdminStadiumRecord) {
    setViewStadium(row);
    setDetailOpen(true);
  }

  return (
    <div className="max-w-6xl mx-auto">
      <AdminPageHero
        title="الملاعب"
        description="مراجعة بيانات الملاعب، التفعيل، الإيقاف، والحذف من لوحة واحدة."
        perks={[
          { icon: MapPin, label: "بحث بالاسم والمدينة" },
          { icon: Plus, label: "إضافة ملعب جديد" },
        ]}
        action={
          <Button variant="brand" size="sm" onClick={() => setForm({ mode: "create" })}>
            <Plus className="h-4 w-4" />
            إضافة ملعب
          </Button>
        }
      />

      <DataTable<AdminStadiumRecord>
        apiEndpoint="/stadiums/admin/all"
        columns={columns}
        searchPlaceholder="بحث: ملعب الأمل، غزة، الشجاعية..."
        emptyMessage="لا توجد ملاعب"
        addLabel="إضافة ملعب"
        onAdd={() => setForm({ mode: "create" })}
        deleteDescription={(row) => `حذف «${row.name}» نهائياً؟`}
        actions={{
          onView: openDetail,
          onEdit: (row) => setForm({ mode: "edit", stadium: row }),
        }}
      />

      <StadiumDetailDialog
        stadium={viewStadium}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={() => {
          if (viewStadium) {
            setDetailOpen(false);
            setForm({ mode: "edit", stadium: viewStadium });
          }
        }}
        onPatch={(data) => viewStadium && patchStadium(viewStadium.id, data)}
      />

      <StadiumFormSheet
        open={form !== null}
        mode={form?.mode ?? "create"}
        stadium={form?.mode === "edit" ? form.stadium : null}
        token={token}
        onClose={() => setForm(null)}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ["table-data", "/stadiums/admin/all"] });
          setForm(null);
        }}
      />
    </div>
  );
}
