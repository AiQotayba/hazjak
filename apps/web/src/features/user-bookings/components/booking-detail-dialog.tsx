"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MediaImage } from "@/components/ui/media-image";
import { CalendarDays, Clock, ExternalLink, FileText, MapPin, MessageCircle, Phone, Wallet } from "lucide-react";
import { formatDate, formatPrice, formatTime } from "@hazjak/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { useAuthStore } from "@/features/auth/store/auth";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";

export interface BookingSummary {
  id: string;
  status: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  notes?: string | null;
  depositAmount?: number | null;
  stadium: {
    name: string;
    slug: string;
    city?: string;
    area?: string;
    address?: string;
    coverImage?: string | null;
    contactPhone?: string;
    contactWhatsapp?: string;
  };
}

interface BookingDetailDialogProps {
  bookingId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancelled?: () => void;
}

const CANCELLABLE = ["PENDING", "CONFIRMED"];

export function BookingDetailDialog({
  bookingId,
  open,
  onOpenChange,
  onCancelled,
}: BookingDetailDialogProps) {
  const { token } = useAuthStore();
  const [booking, setBooking] = useState<BookingSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!open || !bookingId || !token) {
      setBooking(null);
      return;
    }
    setLoading(true);
    api<BookingSummary>(`/bookings/${bookingId}`, { token })
      .then((res) => setBooking(res.data ?? null))
      .finally(() => setLoading(false));
  }, [open, bookingId, token]);

  async function cancelBooking() {
    if (!booking || !token || !confirm("إلغاء هذا الحجز؟")) return;
    setActionLoading(true);
    await api(`/bookings/${booking.id}/status`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ status: "CANCELLED" }),
    });
    setActionLoading(false);
    onCancelled?.();
    onOpenChange(false);
  }

  const showContact =
    booking &&
    (booking.status === "CONFIRMED" || booking.status === "COMPLETED") &&
    (booking.stadium.contactPhone || booking.stadium.contactWhatsapp);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[calc(100%-0.5rem)] sm:max-w-md max-h-[min(calc(100dvh-2rem),720px)] p-3 gap-0 overflow-y-auto border-0 bg-transparent shadow-none"
        dir="rtl"
      >
        <div className="overflow-hidden rounded-3xl bg-card shadow-card">
          {loading ? (
            <BookingDetailSkeleton />
          ) : !booking ? (
            <div className="p-10 text-center text-sm text-muted-foreground">تعذّر تحميل التفاصيل</div>
          ) : (
            <BookingDetailBody
              booking={booking}
              showContact={!!showContact}
              actionLoading={actionLoading}
              onCancel={cancelBooking}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BookingDetailSkeleton() {
  return (
    <div className="space-y-0">
      <Skeleton className="aspect-[9/6] w-full rounded-none" />
      <div className="p-5 space-y-4">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-16 rounded-2xl" />
          <Skeleton className="h-16 rounded-2xl" />
        </div>
        <Skeleton className="h-12 rounded-2xl" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-10 rounded-xl" />
          <Skeleton className="h-10 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function BookingDetailBody({
  booking,
  showContact,
  actionLoading,
  onCancel,
}: {
  booking: BookingSummary;
  showContact: boolean;
  actionLoading: boolean;
  onCancel: () => void;
}) {
  const start = new Date(booking.startTime);
  const end = new Date(booking.endTime);
  const dateLabel = formatDate(start, { weekday: "long", day: "numeric", month: "long" });
  const timeLabel = `${formatTime(start)} – ${formatTime(end)}`;
  const locationLine = [booking.stadium.area, booking.stadium.city].filter(Boolean).join("، ");
  const canCancel = CANCELLABLE.includes(booking.status);
  const initial = booking.stadium.name.trim().charAt(0) || "ب";

  return (
    <>
      <div className="relative aspect-[9/6] bg-muted">
        {booking.stadium.coverImage ? (
          <MediaImage
            src={booking.stadium.coverImage}
            alt={booking.stadium.name}
            fill
            className="object-cover"
            sizes="(max-width:448px) 100vw, 448px"
            priority
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-[#fff4e6] via-secondary to-[#fde8e3]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-5xl font-bold text-primary/25">{initial}</span>
            </div>
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-heading/50 via-transparent to-transparent" />
        <div className="absolute bottom-3 start-3">
          <StatusBadge
            status={booking.status}
            className="text-[11px] px-2.5 py-1 shadow-soft bg-card/95 backdrop-blur-sm"
          />
        </div>
      </div>

      <div className="p-5 space-y-4">
        <DialogHeader className="text-start space-y-2 p-0">
          <DialogTitle className="text-xl font-bold text-heading leading-snug">
            {booking.stadium.name}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-1">
              {locationLine && (
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                  {locationLine} <span className="text-xs text-muted-foreground">•</span> 
                  {booking.stadium.address && (
                    <p className="text-xs text-muted-foreground pe-5">{booking.stadium.address}</p>
                  )}
                </p>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2">
          <InfoTile icon={CalendarDays} label="التاريخ" value={dateLabel} />
          <InfoTile icon={Clock} label="الوقت" value={timeLabel} dir="ltr" />
        </div>

        <div className="rounded-2xl bg-gradient-to-l from-primary/10 via-accent/30 to-secondary px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">إجمالي الحجز</p>
            <p className="text-2xl font-bold text-primary leading-none mt-1">
              {formatPrice(booking.totalPrice)}
            </p>
          </div>
          {booking.depositAmount != null && booking.depositAmount > 0 && (
            <div className="text-end shrink-0">
              <p className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
                <Wallet className="h-3 w-3" aria-hidden />
                العربون
              </p>
              <p className="text-sm font-bold text-heading mt-0.5">
                {formatPrice(booking.depositAmount)}
              </p>
            </div>
          )}
        </div>

        {booking.notes && (
          <div className="rounded-2xl bg-secondary/70 px-4 py-3">
            <p className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 mb-1">
              <FileText className="h-3.5 w-3.5" aria-hidden />
              ملاحظتك
            </p>
            <p className="text-sm text-heading leading-relaxed">{booking.notes}</p>
          </div>
        )}

        {showContact && (
          <div className="space-y-2 flex flex-row gap-2">
            {booking.stadium.contactWhatsapp && (
              <Button
                size="lg"
                className="w-full rounded-2xl h-11 gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-soft"
                asChild
              >
                <a
                  href={`https://wa.me/${booking.stadium.contactWhatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4" />
                  تواصل واتساب
                </a>
              </Button>
            )}
          </div>
        )}

        <div className={cn("grid gap-2", canCancel ? "grid-cols-2" : "grid-cols-1")}>
          {canCancel && (
            <Button
              variant="destructive"
              className="rounded-2xl h-11"
              disabled={actionLoading}
              onClick={onCancel}
            >
              {actionLoading ? "جاري الإلغاء..." : "إلغاء الحجز"}
            </Button>
          )}
          <Button
            variant="outline"
            className="rounded-2xl h-11 gap-1.5 border-0 bg-secondary hover:bg-secondary/80"
            asChild
          >
            <Link href={`/stadiums/${booking.stadium.slug}`}>
              <ExternalLink className="h-4 w-4" />
              صفحة الملعب
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
  dir,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-2xl bg-secondary/70 px-3 py-2.5 min-w-0">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        <Icon className="h-4 w-4 text-primary" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="text-xs font-bold text-heading mt-0.5 leading-snug" dir={dir}>
          {value}
        </p>
      </div>
    </div>
  );
}
