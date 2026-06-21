"use client";

import { MediaImage } from "@/components/ui/media-image";
import { MapPin, Phone, X } from "lucide-react";
import { formatPrice } from "@hazjak/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { AdminStadiumRecord } from "./stadium-admin-card";

interface StadiumDetailPanelProps {
  stadium: AdminStadiumRecord;
  onClose: () => void;
  onEdit: () => void;
  onPatch: (data: Partial<Pick<AdminStadiumRecord, "isActive" | "isSuspended">>) => void;
}

export function StadiumDetailPanel({ stadium, onClose, onEdit, onPatch }: StadiumDetailPanelProps) {
  return (
    <Card className="sticky top-4 overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-bg-elevated">
        <h2 className="font-bold text-sm">تفاصيل الملعب</h2>
        <button type="button" onClick={onClose} className="text-text-muted hover:text-text-base" aria-label="إغلاق">
          <X className="h-4 w-4" />
        </button>
      </div>

      {stadium.coverImage && (
        <div className="relative h-40 bg-bg-elevated">
          <MediaImage src={stadium.coverImage} alt={stadium.name} fill className="object-cover" sizes="400px" />
        </div>
      )}

      <div className="p-4 space-y-4 max-h-[calc(100dvh-12rem)] overflow-y-auto text-sm">
        <div>
          <h3 className="text-lg font-bold">{stadium.name}</h3>
          <p className="text-xs text-text-subtle mt-0.5 font-mono" dir="ltr">
            {stadium.slug}
          </p>
        </div>

        <p className="flex items-start gap-2 text-text-muted">
          <MapPin className="h-4 w-4 shrink-0 text-brand" />
          {stadium.area}، {stadium.city} — {stadium.address}
        </p>

        <p className="text-text-muted leading-relaxed">{stadium.description}</p>

        <dl className="grid grid-cols-2 gap-3">
          <Meta label="صباحي" value={formatPrice(stadium.morningPrice)} />
          <Meta label="مسائي" value={formatPrice(stadium.eveningPrice)} />
          <Meta label="العربون" value={formatPrice(stadium.depositAmount ?? 0)} />
          <Meta label="الحجوزات" value={String(stadium._count.bookings)} />
          <Meta label="التقييمات" value={String(stadium._count.reviews)} />
          <Meta
            label="الحالة"
            value={
              stadium.isSuspended ? "موقوف" : stadium.isActive ? "نشط" : "غير نشط"
            }
          />
        </dl>

        <div className="rounded-lg bg-bg-elevated p-3 space-y-1">
          <p className="text-xs text-text-subtle">المالك</p>
          <p className="font-bold">
            {stadium.owner.firstName} {stadium.owner.lastName}
          </p>
          <p className="text-xs text-text-muted">{stadium.owner.phone}</p>
        </div>

        {stadium.contactPhone && (
          <p className="flex items-center gap-2 text-text-muted">
            <Phone className="h-4 w-4 text-brand" />
            <span dir="ltr">{stadium.contactPhone}</span>
          </p>
        )}

        <p className="text-[10px] text-text-subtle font-mono break-all" dir="ltr">
          ID: {stadium.id}
        </p>

        <div className="flex flex-col gap-2 pt-2 border-t border-border">
          <Button size="sm" variant="brand" onClick={onEdit}>
            تعديل الملعب
          </Button>
          <Button
            size="sm"
            variant={stadium.isActive ? "brand" : "danger"}
            onClick={() => onPatch({ isActive: !stadium.isActive, isSuspended: false })}
          >
            {stadium.isActive ? "إيقاف الملعب" : "نشر الإيقاف"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-bg-elevated px-3 py-2">
      <dt className="text-[10px] text-text-subtle">{label}</dt>
      <dd className="font-bold text-sm mt-0.5">{value}</dd>
    </div>
  );
}
