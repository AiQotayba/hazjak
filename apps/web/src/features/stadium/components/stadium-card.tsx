import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, Timer, Trophy } from "lucide-react";
import { SPORT_TYPE_LABELS } from "@hazjak/constants";
import { formatPrice } from "@hazjak/utils";
import { BOOKING_SLOT_MINUTES } from "@/lib/booking-slots";
import { cn } from "@/lib/utils";

export interface StadiumCardProps {
  id: string;
  slug: string;
  name: string;
  city: string;
  area: string;
  morningPrice: number; 
  eveningPrice: number;
  coverImage?: string | null;
  averageRating?: number;
  reviewCount?: number;
  sportType?: string;
  description?: string;
}

export function StadiumCard({
  slug,
  name,
  city,
  area,
  morningPrice,
  eveningPrice,
  coverImage,
  averageRating = 0,
  reviewCount = 0,
  sportType,
  description,
}: StadiumCardProps) {
  const sportLabel = sportType ? SPORT_TYPE_LABELS[sportType] : null;
  const startPrice = Math.min(morningPrice, eveningPrice);
  const location = [city, area].filter(Boolean).join("، ");
  const initial = name.trim().charAt(0) || "ب";
  const isFavorite = averageRating >= 4.5 && reviewCount >= 3;

  return (
    <Link href={`/stadiums/${slug}`} aria-label={name} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-3xl bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
        <div className="relative aspect-[9/6] overflow-hidden bg-muted">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              sizes="(max-width:768px) 100vw, 33vw"
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-[#fff4e6] via-secondary to-[#fde8e3]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-5xl font-bold text-primary/25">{initial}</span>
              </div>
            </>
          )}

          <div
            className="absolute inset-0 bg-gradient-to-t from-heading/75 via-heading/20 to-transparent"
            aria-hidden
          />

          <div className="absolute top-3 start-3 flex flex-wrap gap-1.5">
            {isFavorite && (
              <span className="inline-flex items-center gap-1 rounded-full bg-card/95 px-2.5 py-1 text-[10px] font-bold text-heading shadow-soft backdrop-blur-sm">
                <Trophy className="h-3 w-3 text-accent-gold" />
                مفضل
              </span>
            )}
            {sportLabel && (
              <span className="rounded-full bg-card/95 px-2.5 py-1 text-[10px] font-bold text-heading shadow-soft backdrop-blur-sm">
                {sportLabel}
              </span>
            )}
          </div>

          {averageRating > 0 && (
            <span className="absolute top-3 end-3 inline-flex items-center gap-1 rounded-full bg-card/95 px-2.5 py-1 text-xs font-bold shadow-soft backdrop-blur-sm">
              <Star className="h-3 w-3 fill-accent-gold text-accent-gold" />
              {averageRating}
            </span>
          )}

          <div className="absolute bottom-0 inset-x-0 p-4 pt-8">
            <h3 className="font-display text-lg font-bold text-white line-clamp-1 leading-tight">
              {name}
            </h3>
            {location && (
              <p className="mt-1 flex items-center gap-1 text-xs text-white/85 line-clamp-1">
                <MapPin className="h-3 w-3 shrink-0" aria-hidden />
                {location}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          {description && (
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{description}</p>
          )}

          <div className="flex flex-wrap gap-2">
            <BadgeChip label={`ابتداءً ${formatPrice(startPrice)}`} />
            <BadgeChip icon={Timer} label={`${BOOKING_SLOT_MINUTES} د`} />
            {reviewCount > 0 && (
              <BadgeChip label={`${reviewCount} تقييم`} />
            )}
          </div>

          <span
            className={cn(
              "mt-auto block w-full rounded-full py-2.5 text-center text-sm font-bold transition-colors",
              "bg-primary text-primary-foreground shadow-soft group-hover:bg-primary/90"
            )}
          >
            احجز الآن
          </span>
        </div>
      </article>
    </Link>
  );
}

function BadgeChip({
  label,
  icon: Icon,
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-heading">
      {Icon && <Icon className="h-3 w-3 text-primary shrink-0" aria-hidden />}
      {label}
    </span>
  );
}
