"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MediaImage } from "@/components/ui/media-image";
import { CalendarDays, Clock, ExternalLink, FileText, MapPin, MessageCircle, Phone, Wallet } from "lucide-react";
import { BOOKING_EXPIRATION_MIN } from "@hazjak/constants";
import { formatDate, formatPrice, formatTime } from "@hazjak/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmAlert } from "@/components/ui/confirm-alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { useAuthStore } from "@/features/auth/store/auth";
import { useSnackbar } from "@/components/ui/snackbar";
import { StatusBadge } from "./StatusBadge";
import { ConfirmDepositButton } from "./confirm-deposit-button";
import {
  canCancelBooking,
  isAwaitingDeposit,
  isBookingTimeEnded,
  showCancelBookingAction,
} from "@/features/user-bookings/lib/user-bookings";

export interface BookingSummary {
  id: string;
  status: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  notes?: string | null;
  depositAmount?: number | null;
  depositReferenceCode?: string | null;
  depositPaidAt?: string | null;
  stadium: {
    name: string;
    slug: string;
    city?: string;
    area?: string;
    address?: string;
    coverImage?: string | null;
    contactPhone?: string;
    contactWhatsapp?: string;
    shamCashId?: string | null;
    shamCashQrImage?: string | null;
  };
}

interface BookingDetailDialogProps {
  bookingId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancelled?: () => void;
  onUpdated?: () => void;
}

export function BookingDetailDialog({
  bookingId,
  open,
  onOpenChange,
  onCancelled,
  onUpdated,
}: BookingDetailDialogProps) {
  const { token } = useAuthStore();
  const showSnack = useSnackbar((s) => s.show);
  const [booking, setBooking] = useState<BookingSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [cancelAlertOpen, setCancelAlertOpen] = useState(false);

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
    if (!booking || !token) return;
    setActionLoading(true);
    const res = await api(`/bookings/${booking.id}/status`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ status: "CANCELLED" }),
    });
    setActionLoading(false);
    setCancelAlertOpen(false);
    if (res.success) {
      showSnack(res.message ?? "تم إلغاء الحجز");
      onCancelled?.();
      onOpenChange(false);
      return;
    }
    showSnack(res.message ?? "تعذّر إلغاء الحجز", "error");
  }

  async function handleDepositConfirmed() {
    if (!bookingId || !token) return;
    const res = await api<BookingSummary>(`/bookings/${bookingId}`, { token });
    if (res.data) setBooking(res.data);
    onUpdated?.();
  }

  const awaitingDeposit = booking ? isAwaitingDeposit(booking) : false;

  const showContact =
    booking &&
    !isBookingTimeEnded(booking) &&
    (booking.status === "CONFIRMED" || booking.status === "COMPLETED") &&
    (booking.stadium.contactPhone || booking.stadium.contactWhatsapp);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[calc(100%-0.5rem)] sm:max-w-md md:max-w-lg max-h-[min(calc(100dvh-2rem),720px)] p-3 gap-0 overflow-y-auto border-0 bg-transparent shadow-none"
        dir="rtl"
      >
        <DialogTitle className="sr-only">
          {booking ? `حجز ${booking.stadium.name}` : "تفاصيل الحجز"}
        </DialogTitle>
        <div className="flex max-h-[min(calc(100dvh-2rem),720px)] min-h-0 flex-1 flex-col overflow-hidden rounded-3xl bg-card shadow-card">
          {loading ? (
            <BookingDetailSkeleton />
          ) : !booking ? (
            <div className="p-10 text-center text-sm text-muted-foreground">تعذّر تحميل التفاصيل</div>
          ) : (
            <BookingDetailBody
              booking={booking}
              showContact={!!showContact}
              actionLoading={actionLoading}
              awaitingDeposit={awaitingDeposit}
              onCancel={() => setCancelAlertOpen(true)}
              onDepositConfirmed={handleDepositConfirmed}
            />
          )}
        </div>
      </DialogContent>
      <ConfirmAlert
        open={cancelAlertOpen}
        onOpenChange={setCancelAlertOpen}
        title="إلغاء الحجز"
        description="هل تريد إلغاء هذا الحجز؟ لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="إلغاء الحجز"
        destructive
        loading={actionLoading}
        onConfirm={cancelBooking}
      />
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
  awaitingDeposit,
  onCancel,
  onDepositConfirmed,
}: {
  booking: BookingSummary;
  showContact: boolean;
  actionLoading: boolean;
  awaitingDeposit: boolean;
  onCancel: () => void;
  onDepositConfirmed: () => void;
}) {
  const start = new Date(booking.startTime);
  const end = new Date(booking.endTime);
  const dateLabel = formatDate(start, { weekday: "long", day: "numeric", month: "long" });
  const timeLabel = `${formatTime(start)} – ${formatTime(end)}`;
  const locationLine = [booking.stadium.area, booking.stadium.city].filter(Boolean).join("، ");
  const timeEnded = isBookingTimeEnded(booking);
  const showCancel = showCancelBookingAction(booking);
  const cancelEnabled = canCancelBooking(booking);
  const initial = booking.stadium.name.trim().charAt(0) || "ب";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
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
            endTime={booking.endTime}
            depositReferenceCode={booking.depositReferenceCode}
            depositPaidAt={booking.depositPaidAt}
            className="text-[11px] px-2.5 py-1 shadow-soft bg-card/95 backdrop-blur-sm"
          />
        </div>
      </div>

      <div className="p-5 space-y-4">
        <DialogHeader className="text-start space-y-2 p-0">
          <p className="text-xl font-bold text-heading leading-snug">
            {booking.stadium.name}
          </p>
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

        {awaitingDeposit && (
            <div className="rounded-lg border border-accent-gold/40 bg-accent/50 px-4 py-3 space-y-3">
              <p className="text-sm font-bold text-heading">خطوة أخيرة — ادفع العربون</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                تم حجز الملعب مؤقتاً. ادفع العربون
                {(booking.depositAmount ?? 0) > 0
                  ? ` (${formatPrice(booking.depositAmount!)})`
                  : ""}{" "}
                عبر شام كاش خلال {BOOKING_EXPIRATION_MIN} دقيقة لإتمام الحجز. ضع الكود{" "}
                <span className="font-bold text-heading">{booking.depositReferenceCode}</span> في
                ملاحظة التحويل.
              </p>
              {booking.stadium.shamCashId && (
                <div className="rounded-lg bg-card/80 px-3 py-2 text-xs">
                  <p className="text-muted-foreground">حساب شام كاش</p>
                  <p className="font-bold text-heading mt-0.5 tabular-nums" dir="ltr">
                    {booking.stadium.shamCashId}
                  </p>
                </div>
              )}
              {booking.stadium.shamCashQrImage && (
                <div className="relative mx-auto aspect-square w-full max-w-[200px] overflow-hidden rounded-xl border border-border bg-white">
                  <MediaImage
                    src={booking.stadium.shamCashQrImage}
                    alt="رمز QR لشام كاش"
                    fill
                    className="object-contain p-2"
                    sizes="200px"
                  />
                </div>
              )}
              <ConfirmDepositButton
                bookingId={booking.id}
                onSuccess={onDepositConfirmed}
                className="h-10 rounded-xl"
              />
            </div>
          )}

        {timeEnded && booking.status !== "COMPLETED" && (
          <p className="rounded-lg border border-border bg-secondary/50 px-4 py-3 text-xs text-muted-foreground leading-relaxed">
            انتهى وقت هذا الحجز.
          </p>
        )}

        {booking.status === "PENDING" &&
          booking.depositReferenceCode &&
          booking.depositPaidAt && (
            <p className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-muted-foreground leading-relaxed">
              تم تسجيل تأكيدك. صاحب الملعب سيراجع التحويل ويؤكد الحجز قريباً.
            </p>
          )}

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

        <Button
          variant="outline"
          className="w-full rounded-2xl h-11 gap-1.5 border-0 bg-secondary hover:bg-secondary/80"
          asChild
        >
          <Link href={`/stadiums/${booking.stadium.slug}`}>
            <ExternalLink className="h-4 w-4" />
            صفحة الملعب
          </Link>
        </Button>
      </div>
      </div>

      {showCancel && (
        <div className="shrink-0 border-t border-border/60 bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button
            variant="destructive"
            className="w-full rounded-2xl h-12 text-base font-bold"
            disabled={actionLoading || !cancelEnabled}
            onClick={onCancel}
          >
            {actionLoading ? "جاري الإلغاء..." : "إلغاء الحجز"}
          </Button>
          {!cancelEnabled && timeEnded && (
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              انتهى وقت الحجز — لا يمكن الإلغاء
            </p>
          )}
        </div>
      )}
    </div>
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
