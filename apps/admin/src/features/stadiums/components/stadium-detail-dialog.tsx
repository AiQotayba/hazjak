"use client";

import { MediaImage } from "@/components/ui/media-image";
import { MapPin, Phone } from "lucide-react";
import { formatPrice } from "@hazjak/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StadiumStatusBadge } from "./stadium-status-badge";
import type { AdminStadiumRecord } from "../types";

interface StadiumDetailDialogProps {
  stadium: AdminStadiumRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onPatch: (data: Partial<Pick<AdminStadiumRecord, "isActive" | "isSuspended">>) => void;
}

export function StadiumDetailDialog({
  stadium,
  open,
  onOpenChange,
  onEdit,
  onPatch,
}: StadiumDetailDialogProps) {
  if (!stadium) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        {stadium.coverImage && (
          <div className="relative h-44 bg-muted">
            <MediaImage
              src={stadium.coverImage}
              alt={stadium.name}
              fill
              className="object-cover"
              sizes="512px"
            />
            <div className="absolute start-4 top-4">
              <StadiumStatusBadge
                isActive={stadium.isActive}
                isSuspended={stadium.isSuspended}
              />
            </div>
          </div>
        )}

        <div className="p-6 space-y-4">
          <DialogHeader className="text-start p-0">
            <DialogTitle className="text-xl">{stadium.name}</DialogTitle>
            <p className="text-xs text-muted-foreground font-mono" dir="ltr">
              {stadium.slug}
            </p>
          </DialogHeader>

          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0 text-primary" />
            {stadium.area}، {stadium.city} — {stadium.address}
          </p>

          <p className="text-sm text-muted-foreground leading-relaxed">{stadium.description}</p>

          <dl className="grid grid-cols-2 gap-2 text-sm">
            <Meta label="صباحي" value={formatPrice(stadium.morningPrice)} />
            <Meta label="مسائي" value={formatPrice(stadium.eveningPrice)} />
            <Meta label="العربون" value={formatPrice(stadium.depositAmount ?? 0)} />
            <Meta label="الحجوزات" value={String(stadium._count.bookings)} />
          </dl>

          <div className="rounded-xl bg-secondary p-3">
            <p className="text-xs text-muted-foreground">المالك</p>
            <p className="font-bold">
              {stadium.owner.firstName} {stadium.owner.lastName}
            </p>
            <p className="text-xs text-muted-foreground">{stadium.owner.email}</p>
          </div>

          {stadium.contactPhone && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4 text-primary" />
              <span dir="ltr">{stadium.contactPhone}</span>
            </p>
          )}

          <div className="flex flex-col gap-2 pt-2 border-t border-border">
            <Button variant="brand" size="sm" onClick={onEdit}>
              تعديل الملعب
            </Button>
            <Button
              size="sm"
              variant={stadium.isSuspended ? "brand" : "danger"}
              onClick={() => onPatch({ isSuspended: !stadium.isSuspended })}
            >
              {stadium.isSuspended ? "رفع الإيقاف" : "إيقاف الملعب"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onPatch({ isActive: !stadium.isActive })}
            >
              {stadium.isActive ? "إخفاء من التطبيق" : "تفعيل الظهور"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2">
      <dt className="text-[10px] text-muted-foreground">{label}</dt>
      <dd className="font-bold mt-0.5">{value}</dd>
    </div>
  );
}
