"use client";

import Image from "next/image";
import { MapPin } from "lucide-react";
import { formatPrice } from "@hazjak/utils";
import { cn } from "@/lib/utils";

export type AdminStadiumRecord = {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  city: string;
  area: string;
  morningPrice: number;
  eveningPrice: number;
  depositAmount: number | null;
  contactPhone: string | null;
  contactWhatsapp: string | null;
  coverImage: string | null;
  isActive: boolean;
  isSuspended: boolean;
  owner: { id: string; firstName: string; lastName: string; email: string };
  _count: { bookings: number; reviews: number };
};

interface StadiumAdminCardProps {
  stadium: AdminStadiumRecord;
  selected: boolean;
  onSelect: () => void;
}

export function StadiumAdminCard({ stadium, selected, onSelect }: StadiumAdminCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full text-start rounded-[var(--radius-card)] border bg-bg-card shadow-[var(--shadow-card)] overflow-hidden transition-all hover:border-brand/40",
        selected ? "border-brand ring-2 ring-brand/20" : "border-border"
      )}
    >
      <div className="flex gap-0 sm:gap-4 flex-col sm:flex-row">
        <div className="relative h-32 sm:h-auto sm:w-36 shrink-0 bg-bg-elevated">
          {stadium.coverImage ? (
            <Image
              src={stadium.coverImage}
              alt={stadium.name}
              fill
              className="object-cover"
              sizes="144px"
            />
          ) : (
            <span className="flex h-full min-h-[8rem] items-center justify-center text-3xl opacity-30">
              ⚽
            </span>
          )}
        </div>
        <div className="flex-1 p-4 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="font-bold text-base truncate">{stadium.name}</h3>
            <StadiumStatusBadge isActive={stadium.isActive} isSuspended={stadium.isSuspended} />
          </div>
          <p className="mt-1 flex items-center gap-1 text-xs text-text-muted truncate">
            <MapPin className="h-3 w-3 shrink-0 text-brand" />
            {stadium.city} — {stadium.area}
          </p>
          <p className="mt-2 text-xs text-text-muted line-clamp-2">{stadium.description}</p>
          <div className="mt-3 flex flex-wrap gap-3 text-xs">
            <span>
              صباح <strong className="text-brand">{formatPrice(stadium.morningPrice)}</strong>
            </span>
            <span>
              مساء <strong className="text-brand">{formatPrice(stadium.eveningPrice)}</strong>
            </span>
            <span className="text-text-subtle">
              {stadium._count.bookings} حجز · {stadium._count.reviews} تقييم
            </span>
          </div>
          <p className="mt-1 text-[10px] text-text-subtle truncate">
            {stadium.owner.firstName} {stadium.owner.lastName} · {stadium.owner.email}
          </p>
        </div>
      </div>
    </button>
  );
}

function StadiumStatusBadge({
  isActive,
  isSuspended,
}: {
  isActive: boolean;
  isSuspended: boolean;
}) {
  if (isSuspended) {
    return (
      <span className="rounded-full bg-negative/15 text-negative px-2.5 py-0.5 text-[10px] font-bold">
        موقوف
      </span>
    );
  }
  if (!isActive) {
    return (
      <span className="rounded-full bg-text-subtle/20 text-text-muted px-2.5 py-0.5 text-[10px] font-bold">
        مخفي
      </span>
    );
  }
  return (
    <span className="rounded-full bg-brand/15 text-brand px-2.5 py-0.5 text-[10px] font-bold">
      نشط
    </span>
  );
}
