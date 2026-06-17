"use client";

import { useMemo, useState } from "react";
import { MediaImage } from "@/components/ui/media-image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Moon,
  Play,
  Star,
  Sun,
  Timer,
  Trophy,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { SPORT_TYPE_LABELS } from "@hazjak/constants";
import { formatPrice } from "@hazjak/utils";
import { Button } from "@/components/ui/button";
import { BookingDialog } from "@/features/stadium/components/booking-dialog";
import { BOOKING_SLOT_MINUTES } from "@/lib/booking-slots";
import type { AuthUser } from "@hazjak/types";
import { cn } from "@/lib/utils";
import { getVideoEmbedUrl, type VideoEmbed } from "@/lib/video-embed";

type GalleryItem =
  | { type: "image"; src: string }
  | { type: "video"; embed: VideoEmbed };

export interface StadiumDetailData {
  id: string;
  name: string;
  slug: string;
  description: string;
  city: string;
  area: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  morningPrice: number;
  eveningPrice: number;
  depositAmount?: number | null;
  coverImage?: string | null;
  videoUrl?: string | null;
  sportType?: string;
  contactWhatsapp?: string | null;
  images: { imageUrl: string; sortOrder?: number }[];
  averageRating: number;
  reviews: {
    id: string;
    rating: number;
    comment?: string | null;
    ownerReply?: string | null;
    user: { firstName: string; lastName: string };
  }[];
  availabilitySlots: { id: string; startTime: string; endTime: string }[];
}

interface StadiumDetailViewProps {
  stadium: StadiumDetailData;
  token: string | null;
  user: AuthUser | null;
}

const enter = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4 },
});

function formatCount(value: number): string {
  return new Intl.NumberFormat("ar-SY", { numberingSystem: "latn" }).format(value);
}

export function StadiumDetailView({ stadium, token, user }: StadiumDetailViewProps) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const mediaItems = useMemo(() => {
    const sorted = [...stadium.images].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    );
    const items: GalleryItem[] = [
      ...(stadium.coverImage ? [{ type: "image" as const, src: stadium.coverImage }] : []),
    ];
    if (stadium.videoUrl) {
      const embed = getVideoEmbedUrl(stadium.videoUrl);
      if (embed) items.push({ type: "video", embed });
    }
    items.push(...sorted.map((i) => ({ type: "image" as const, src: i.imageUrl })));
    return items;
  }, [stadium.coverImage, stadium.images, stadium.videoUrl]);

  const startPrice = Math.min(stadium.morningPrice, stadium.eveningPrice);
  const sportLabel = stadium.sportType ? SPORT_TYPE_LABELS[stadium.sportType] : null;
  const reviewCount = stadium.reviews.length;
  const locationShort = [stadium.area, stadium.city].filter(Boolean).join("، ");
  const locationLine = [stadium.city, stadium.area, stadium.address].filter(Boolean).join("، ");
  const mapQuery =
    stadium.latitude != null && stadium.longitude != null
      ? `${stadium.latitude},${stadium.longitude}`
      : encodeURIComponent(locationLine);
  const isFavorite = stadium.averageRating >= 4.5 && reviewCount >= 3;
  const initial = stadium.name.trim().charAt(0) || "ب";

  const features = buildFeatures(stadium, sportLabel);

  function goPrev() {
    setActiveIndex((i) => (i <= 0 ? mediaItems.length - 1 : i - 1));
  }

  function goNext() {
    setActiveIndex((i) => (i >= mediaItems.length - 1 ? 0 : i + 1));
  }

  const posterSrc =
    stadium.coverImage ??
    stadium.images.find((i) => i.imageUrl)?.imageUrl ??
    null;

  return (
    <div className="mx-auto max-w-6xl pb-24 lg:pb-12">
      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <motion.div {...enter(0.06)} className="space-y-4">
          <StadiumGallery
            items={mediaItems}
            name={stadium.name}
            initial={initial}
            posterSrc={posterSrc}
            activeIndex={activeIndex}
            onSelect={setActiveIndex}
            onPrev={goPrev}
            onNext={goNext}
          />
          <StadiumReviewsCard
            averageRating={stadium.averageRating}
            reviewCount={reviewCount}
            reviews={stadium.reviews}
          />
        </motion.div>

        <motion.div {...enter(0.12)} className="space-y-5 lg:sticky lg:top-24">
          <header className="space-y-4">
            <div className="space-y-2">
              <h1 className="font-display text-2xl md:text-3xl font-bold text-heading leading-tight">
                {stadium.name}
              </h1>
              {locationShort && (
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                  {locationShort}
                </p>
              )}
            </div>

            {stadium.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{stadium.description}</p>
            )}

            <div className="flex flex-wrap gap-2">
              {isFavorite && (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-heading">
                  <Trophy className="h-3 w-3 text-accent-gold shrink-0" aria-hidden />
                  مفضل
                </span>
              )}
              {sportLabel && <BadgeChip label={sportLabel} />}
              <BadgeChip icon={Timer} label={`${formatCount(BOOKING_SLOT_MINUTES)} د`} />
              {stadium.averageRating > 0 && (
                <BadgeChip
                  icon={Star}
                  label={`${stadium.averageRating.toFixed(1)} (${formatCount(reviewCount)})`}
                />
              )}
            </div>

            <PriceStrip
              startPrice={startPrice}
              morningPrice={stadium.morningPrice}
              eveningPrice={stadium.eveningPrice}
              depositAmount={stadium.depositAmount}
            />
          </header>

          <StadiumFeaturesGrid features={features} />

          <div className="hidden lg:grid gap-2 grid-cols-1">
            <Button
              size="lg"
              className="h-12 shadow-soft text-base gap-2"
              onClick={() => setBookingOpen(true)}
            >
              {token ? "اختر الموعد وأكمل الحجز" : "سجّل للحجز"}
            </Button>
          </div>
        </motion.div>
      </div>

      <motion.div {...enter(0.18)}>
        <StadiumMapSection locationLine={locationLine} mapQuery={mapQuery} />
      </motion.div>

      <BookingDialog
        stadium={{
          id: stadium.id,
          name: stadium.name,
          slug: stadium.slug,
          morningPrice: stadium.morningPrice,
          eveningPrice: stadium.eveningPrice,
          depositAmount: stadium.depositAmount,
        }}
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        token={token}
        user={user}
      />

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-card/95 p-4 backdrop-blur-md lg:hidden">
        <Button
          size="lg"
          className="h-12 w-full shadow-soft text-base"
          onClick={() => setBookingOpen(true)}
        >
          {token ? "اختيار الموعد والحجز" : "سجّل للحجز"}
        </Button>
      </div>
    </div>
  );
}

interface FeatureItem {
  icon: LucideIcon;
  label: string;
  value: string;
}

function buildFeatures(
  stadium: StadiumDetailData,
  sportLabel: string | null
): FeatureItem[] {
  return [
    { icon: Timer, label: "مدة الحجز", value: `${formatCount(BOOKING_SLOT_MINUTES)} دقيقة` },
    stadium.depositAmount != null && stadium.depositAmount > 0 ? { icon: Wallet, label: "العربون", value: formatPrice(stadium.depositAmount) } : null,
  ].filter(Boolean) as FeatureItem[];
}

function BadgeChip({
  label,
  icon: Icon,
  className,
}: {
  label: string;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-heading",
        className
      )}
    >
      {Icon && <Icon className="h-3 w-3 text-primary shrink-0" aria-hidden />}
      {label}
    </span>
  );
}

function PriceStrip({
  startPrice,
  morningPrice,
  eveningPrice,
  depositAmount,
}: {
  startPrice: number;
  morningPrice: number;
  eveningPrice: number;
  depositAmount?: number | null;
}) {
  return (
    <div className="rounded-2xl bg-gradient-to-l from-primary/10 via-accent/30 to-secondary px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">ابتداءً</p>
          <p className="text-2xl font-bold text-primary leading-none mt-1">
            {formatPrice(startPrice)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            / {formatCount(BOOKING_SLOT_MINUTES)} د · صباحي {formatPrice(morningPrice)} · مسائي{" "}
            {formatPrice(eveningPrice)}
          </p>
        </div>
        {depositAmount != null && depositAmount > 0 && (
          <div className="text-end shrink-0">
            <p className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
              <Wallet className="h-3 w-3" aria-hidden />
              العربون
            </p>
            <p className="text-sm font-bold text-heading mt-0.5">{formatPrice(depositAmount)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-2xl bg-secondary/70 px-3 py-2.5 min-w-0">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        <Icon className="h-4 w-4 text-primary" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="text-xs font-bold text-heading mt-0.5 leading-snug">{value}</p>
      </div>
    </div>
  );
}

function StadiumFeaturesGrid({ features }: { features: FeatureItem[] }) {
  return (
    <section>
      <h2 className="text-sm font-bold text-heading mb-3">المميزات</h2>
      <div className="grid grid-cols-2 gap-2">
        {features.map(({ icon, label, value }) => (
          <InfoTile key={label} icon={icon} label={label} value={value} />
        ))}
      </div>
    </section>
  );
}

function StadiumGallery({
  items,
  name,
  initial,
  posterSrc,
  activeIndex,
  onSelect,
  onPrev,
  onNext,
}: {
  items: GalleryItem[];
  name: string;
  initial: string;
  posterSrc: string | null;
  activeIndex: number;
  onSelect: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const current = items[activeIndex];
  const visibleThumbs = 4;
  const extraCount = Math.max(0, items.length - visibleThumbs);
  const hasMultiple = items.length > 1;

  return (
    <div className="space-y-3">
      <div className="relative aspect-[9/6] overflow-hidden rounded-3xl bg-muted shadow-soft">
        {current?.type === "video" ? (
          <GalleryVideoPlayer name={name} embed={current.embed} />
        ) : current?.type === "image" ? (
          <MediaImage
            src={current.src}
            alt={name}
            fill
            className="object-cover"
            priority={activeIndex === 0}
            sizes="(max-width:1024px) 100vw, 50vw"
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-[#fff4e6] via-secondary to-[#fde8e3]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-6xl font-bold text-primary/25">{initial}</span>
            </div>
          </>
        )}

        {current?.type === "image" && (
          <div
            className="absolute inset-0 bg-gradient-to-t from-heading/40 via-transparent to-transparent pointer-events-none"
            aria-hidden
          />
        )}

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={onPrev}
              className="absolute top-1/2 start-3 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-card/95 shadow-soft text-heading hover:bg-card transition-colors backdrop-blur-sm"
              aria-label="السابق"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={onNext}
              className="absolute top-1/2 end-3 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-card/95 shadow-soft text-heading hover:bg-card transition-colors backdrop-blur-sm"
              aria-label="التالي"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="absolute bottom-3 start-3 z-10 rounded-full bg-heading/70 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
              {formatCount(activeIndex + 1)} / {formatCount(items.length)}
            </span>
          </>
        )}
      </div>

      {hasMultiple && (
        <div className="grid grid-cols-4 gap-2">
          {items.slice(0, visibleThumbs).map((item, i) => {
            const isLastVisible = i === visibleThumbs - 1 && extraCount > 0;
            const thumbIndex = isLastVisible ? visibleThumbs : i;
            const isActive = isLastVisible ? activeIndex >= visibleThumbs : activeIndex === i;

            return (
              <button
                key={`${item.type}-${i}`}
                type="button"
                onClick={() => onSelect(thumbIndex)}
                className={cn(
                  "relative aspect-[9/6] overflow-hidden rounded-xl transition-all",
                  isActive ? "ring-2 ring-primary opacity-100" : "opacity-70 hover:opacity-100"
                )}
              >
                {item.type === "image" ? (
                  <MediaImage src={item.src} alt={`${name} ${i + 1}`} fill className="object-cover" sizes="120px" />
                ) : (
                  <GalleryVideoThumb posterSrc={posterSrc} name={name} />
                )}
                {isLastVisible && (
                  <span className="absolute inset-0 flex items-center justify-center bg-heading/50 text-xs font-bold text-white">
                    +{formatCount(extraCount)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function GalleryVideoPlayer({ name, embed }: { name: string; embed: VideoEmbed }) {
  if (embed.type === "video") {
    return (
      <video
        src={embed.src}
        controls
        className="absolute inset-0 h-full w-full object-cover"
        title={`فيديو ${name}`}
      />
    );
  }

  return (
    <iframe
      src={embed.src}
      title={`فيديو ${name}`}
      className="absolute inset-0 h-full w-full border-0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  );
}

function GalleryVideoThumb({ posterSrc, name }: { posterSrc: string | null; name: string }) {
  return (
    <>
      {posterSrc ? (
        <MediaImage src={posterSrc} alt={`فيديو ${name}`} fill className="object-cover" sizes="120px" />
      ) : (
        <div className="absolute inset-0 bg-heading/80" />
      )}
      <span className="absolute inset-0 flex items-center justify-center bg-heading/30">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-card/95 shadow-soft">
          <Play className="h-4 w-4 text-primary ms-0.5" aria-hidden />
        </span>
      </span>
    </>
  );
}

function StadiumReviewsCard({
  averageRating,
  reviewCount,
  reviews,
}: {
  averageRating: number;
  reviewCount: number;
  reviews: StadiumDetailData["reviews"];
}) {
  return (
    <article className="rounded-3xl bg-card p-5 shadow-soft">
      <h2 className="text-sm font-bold text-heading mb-4">تقييمات العملاء</h2>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
          <span className="text-xl font-bold text-primary">
            {reviewCount > 0 ? averageRating.toFixed(1) : "—"}
          </span>
        </div>
        <div>
          {reviewCount > 0 ? (
            <>
              <div className="flex items-center gap-0.5 text-accent-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < Math.round(averageRating) ? "fill-accent-gold" : "opacity-30"
                    )}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatCount(reviewCount)} تقييم
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">لا توجد تقييمات بعد — كن أول من يقيّم</p>
          )}
        </div>
      </div>

      {reviews.length > 0 && (
        <ul className="space-y-2 max-h-52 overflow-y-auto">
          {reviews.slice(0, 4).map((r) => (
            <li key={r.id} className="rounded-2xl bg-secondary/60 px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-heading">
                  {r.user.firstName} {r.user.lastName}
                </span>
                <div className="flex items-center gap-0.5 shrink-0">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-3 w-3",
                        i < r.rating ? "fill-accent-gold text-accent-gold" : "text-muted-foreground/30"
                      )}
                    />
                  ))}
                </div>
              </div>
              {r.comment && (
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-3">
                  {r.comment}
                </p>
              )}
              {r.ownerReply && (
                <p className="text-[11px] text-primary mt-2 ps-2 border-s-2 border-primary/30 leading-relaxed">
                  رد المالك: {r.ownerReply}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function StadiumMapSection({
  locationLine,
  mapQuery,
}: {
  locationLine: string;
  mapQuery: string;
}) {
  return (
    <section className="mt-10 rounded-3xl bg-card shadow-soft overflow-hidden">
      <div className="px-5 py-4">
        <h2 className="font-display text-base font-bold text-heading flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          الموقع
        </h2>
        <p className="text-sm text-muted-foreground mt-1">{locationLine}</p>
      </div>
      <div className="relative aspect-[16/7] min-h-[220px] bg-muted">
        <iframe
          title="موقع الملعب على الخريطة"
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://maps.google.com/maps?q=${mapQuery}&z=15&output=embed&hl=ar`}
        />
      </div>
    </section>
  );
}
