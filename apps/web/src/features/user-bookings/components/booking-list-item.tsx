"use client";

import Image from "next/image";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { formatDate, formatPrice, formatTime } from "@beeplay/utils";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";

export interface BookingListItemData {
  id: string;
  status: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  stadium: {
    name: string;
    coverImage?: string | null;
    city?: string;
    area?: string;
  };
}

interface BookingListItemProps {
  booking: BookingListItemData;
  onPress: () => void;
}

const ARCHIVED_STATUSES = ["COMPLETED", "CANCELLED", "REJECTED", "EXPIRED", "NO_SHOW"];

function StadiumImage({
  name,
  coverImage,
  archived,
}: {
  name: string;
  coverImage?: string | null;
  archived: boolean;
}) {
  const initial = name.trim().charAt(0) || "ب";

  return (
    <div
      className={cn(
        "relative aspect-[9/6] w-full overflow-hidden rounded-lg bg-muted",
        archived && "grayscale-[0.55] contrast-[0.95]"
      )}
    >
      {coverImage ? (
        <Image
          src={coverImage}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          sizes="(max-width:640px) 160px, 192px"
        />
      ) : (
        <>
          <div
            className="absolute inset-0 bg-gradient-to-br from-[#fff4e6] via-secondary to-[#fde8e3]"
            aria-hidden
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-3xl font-bold text-primary/30">{initial}</span>
          </div>
        </>
      )}
    </div>
  );
}

function AmenityChip({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground whitespace-nowrap">
      <Icon className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
      {label}
    </span>
  );
}

export function BookingListItem({ booking, onPress }: BookingListItemProps) {
  const isArchived = ARCHIVED_STATUSES.includes(booking.status);
  const start = new Date(booking.startTime);
  const end = new Date(booking.endTime);
  const timeLabel = `${formatTime(start)} – ${formatTime(end)}`;
  const dateLabel = formatDate(start, { weekday: "short", day: "numeric", month: "short" });
  const location = [booking.stadium.area, booking.stadium.city].filter(Boolean).join("، ");

  return (
    <button
      type="button"
      onClick={onPress}
      className={cn(
        "group flex w-full items-start gap-3 rounded-2xl bg-card p-3 text-start transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
        "active:scale-[0.99]",
        "items-center",
        isArchived
          ? "opacity-85 shadow-none"
          : "shadow-soft hover:shadow-card hover:ring-2 hover:ring-primary/20"
      )}
    >
      {/* صورة الملعب — يمين في RTL */}
      <div className="relative w-40 shrink-0 sm:w-48">
        <StadiumImage
          name={booking.stadium.name}
          coverImage={booking.stadium.coverImage}
          archived={isArchived}
        />
        <div className="absolute bottom-2 start-2">
          <StatusBadge
            status={booking.status}
            className="text-[10px] px-2 py-0.5 shadow-soft bg-card/95 backdrop-blur-sm"
          />
        </div>
      </div>

      {/* التفاصيل */}
      <div className="flex min-w-0 flex-1 flex-col py-0.5">
        <div className="min-w-0 space-y-1.5">
          <h3 className="font-display text-sm sm:text-base font-bold text-heading line-clamp-2 leading-snug">
            {booking.stadium.name}
          </h3>
          {location && (
            <p className="flex items-center gap-1 text-xs text-muted-foreground line-clamp-1">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/70" aria-hidden />
              {location}
            </p>
          )}
          <div className="flex flex-col items-start gap-x-3 gap-y-1 pt-0.5">
            <AmenityChip icon={CalendarDays} label={dateLabel} />
            <AmenityChip icon={Clock} label={timeLabel} />
          </div>
        </div>

        <div className="mt-auto pt-2 self-end text-start">
          {!isArchived ? (
            <>
              <p className="text-lg p-2 sm:text-xl font-bold text-primary leading-none">
                {formatPrice(booking.totalPrice)}
              </p>
              {/* <p className="text-[10px] text-muted-foreground mt-1">إجمالي الحجز</p> */}
            </>
          ) : (
            <p className="text-xs text-muted-foreground">حجز سابق</p>
          )}
        </div>
      </div>
    </button>
  );
}
