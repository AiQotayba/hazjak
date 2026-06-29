"use client";

import { useEffect, useState } from "react";
import { MediaImage } from "@/components/ui/media-image";
import { CalendarDays, MapPin, Phone, User } from "lucide-react";
import { BOOKING_EXPIRATION_MIN } from "@hazjak/constants";
import { formatDate, formatPrice } from "@hazjak/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ConfirmAlert } from "@/components/ui/confirm-alert";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useRequireAdmin } from "@/hooks/use-require-admin";
import { toast } from "sonner";

export const STATUS_LABELS: Record<string, string> = {
  PENDING: "بانتظار التأكيد",
  CONFIRMED: "مؤكد",
  COMPLETED: "مكتمل",
  CANCELLED: "ملغى",
  REJECTED: "مرفوض",
  EXPIRED: "منتهي",
  NO_SHOW: "لم يحضر",
};

export type AdminBookingRow = {
  id: string;
  status: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  notes?: string | null;
  depositAmount?: number | null;
  depositReferenceCode?: string | null;
  depositRequestedAt?: string | null;
  depositPaidAt?: string | null;
  stadium: {
    name: string;
    city: string;
    coverImage?: string | null;
    depositAmount?: number | null;
  };
  user: { firstName: string; lastName: string; phone: string };
};

interface BookingDetailDialogProps {
  bookingId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange?: () => void;
}

function isAwaitingDeposit(b: AdminBookingRow) {
  return (
    b.status === "PENDING" &&
    !!b.depositReferenceCode &&
    (b.depositAmount ?? 0) > 0 &&
    !b.depositPaidAt
  );
}

function isDepositPaidPendingConfirm(b: AdminBookingRow) {
  return b.status === "PENDING" && !!b.depositReferenceCode && !!b.depositPaidAt;
}

type PendingStatusAction = {
  body: Record<string, unknown>;
  successMessage: string;
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
};

export function BookingDetailDialog({
  bookingId,
  open,
  onOpenChange,
  onStatusChange,
}: BookingDetailDialogProps) {
  const { token } = useRequireAdmin();
  const [booking, setBooking] = useState<AdminBookingRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingStatusAction | null>(null);

  useEffect(() => {
    if (!open || !bookingId) {
      setBooking(null);
      return;
    }
    setLoading(true);
    api<AdminBookingRow>(`/bookings/${bookingId}`, { token })
      .then((res) => setBooking(res.data ?? null))
      .finally(() => setLoading(false));
  }, [open, bookingId, token]);

  async function patchStatus(body: Record<string, unknown>, successMessage: string) {
    if (!booking) return;
    setActionLoading(true);
    const res = await api(`/bookings/${booking.id}/status`, {
      method: "PATCH",
      token,
      body: JSON.stringify(body),
    });
    setActionLoading(false);
    if (res.success) {
      toast.success(successMessage);
      if (res.data) setBooking({ ...booking, ...(res.data as AdminBookingRow) });
      onStatusChange?.();
      onOpenChange(false);
      return;
    }
    toast.error(res.message ?? "تعذّر تحديث الحجز");
  }

  async function executePendingAction() {
    if (!pendingAction) return;
    await patchStatus(pendingAction.body, pendingAction.successMessage);
    setPendingAction(null);
  }

  function requestStatusAction(action: PendingStatusAction) {
    setPendingAction(action);
  }

  const stadiumDeposit = booking?.stadium.depositAmount ?? 0;
  const awaitingDeposit = booking ? isAwaitingDeposit(booking) : false;
  const depositPaidAwaitingConfirm = booking ? isDepositPaidPendingConfirm(booking) : false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {loading ? (
          <div className="space-y-3 py-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : booking ? (
          <>
            {booking.stadium.coverImage && (
              <div className="relative -mx-6 -mt-6 mb-4 h-36 bg-muted">
                <MediaImage
                  src={booking.stadium.coverImage}
                  alt={booking.stadium.name}
                  fill
                  className="object-cover"
                  sizes="400px"
                />
              </div>
            )}
            <DialogHeader className="text-start">
              <div className="flex items-center justify-between gap-2">
                <DialogTitle>{booking.stadium.name}</DialogTitle>
                <StatusBadge status={booking.status} />
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {booking.stadium.city}
              </p>
            </DialogHeader>

            <dl className="space-y-3 text-sm">
              <Row
                icon={User}
                label="المستخدم"
                value={`${booking.user.firstName} ${booking.user.lastName}`}
                sub={booking.user.phone}
              />
              {booking.user.phone && (
                <Row icon={Phone} label="الهاتف" value={booking.user.phone} ltr />
              )}
              <Row
                icon={CalendarDays}
                label="الموعد"
                value={formatDate(booking.startTime, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
                sub={formatDate(booking.endTime, { timeStyle: "short" })}
              />
              <div className="flex justify-between rounded-xl bg-secondary px-4 py-3">
                <span className="text-muted-foreground">المبلغ</span>
                <span className="font-bold text-primary">{formatPrice(booking.totalPrice)}</span>
              </div>
              {booking.depositAmount != null && booking.depositAmount > 0 && (
                <div className="flex justify-between rounded-xl bg-secondary px-4 py-3">
                  <span className="text-muted-foreground">العربون</span>
                  <span className="font-bold">{formatPrice(booking.depositAmount)}</span>
                </div>
              )}
              {booking.depositReferenceCode && (
                <div className="rounded-xl border border-border px-4 py-3 text-sm">
                  <p className="text-xs text-muted-foreground">كود التحويل</p>
                  <p className="font-mono font-medium mt-0.5">{booking.depositReferenceCode}</p>
                </div>
              )}
              {booking.depositPaidAt && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
                  <p className="text-xs text-muted-foreground">تأكيد دفع العربون</p>
                  <p className="font-medium mt-0.5">
                    {formatDate(booking.depositPaidAt, { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
              )}
              {booking.notes && (
                <p className="text-muted-foreground text-xs rounded-lg border border-border p-3">
                  {booking.notes}
                </p>
              )}
            </dl>

            {awaitingDeposit && (
              <p className="text-xs text-muted-foreground rounded-lg border border-border px-3 py-2">
                بانتظار دفع العربون من اللاعب خلال {BOOKING_EXPIRATION_MIN} دقيقة.
              </p>
            )}
            {depositPaidAwaitingConfirm && (
              <p className="text-xs text-heading rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
                اللاعب أكّد دفع العربون — يمكنك تأكيد الحجز بعد مراجعة التحويل.
              </p>
            )}

            {booking.status === "PENDING" && !awaitingDeposit && !depositPaidAwaitingConfirm && (
              <div className="flex flex-col gap-2 pt-2">
                {stadiumDeposit <= 0 && (
                  <Button
                    size="sm"
                    disabled={actionLoading}
                    onClick={() =>
                      requestStatusAction({
                        body: { status: "CONFIRMED" },
                        successMessage: "تم قبول الحجز",
                        title: "قبول الحجز",
                        description: "هل تريد قبول هذا الحجز؟",
                        confirmLabel: "قبول",
                      })
                    }
                  >
                    قبول الحجز
                  </Button>
                )}
                {stadiumDeposit > 0 && (
                  <Button
                    size="sm"
                    disabled={actionLoading}
                    onClick={() =>
                      requestStatusAction({
                        body: { status: "PENDING", requireDeposit: true },
                        successMessage: "أُرسلت تعليمات العربون للاعب",
                        title: "طلب عربون",
                        description: `سيتم إرسال تعليمات دفع العربون (${formatPrice(stadiumDeposit)}) للاعب عبر واتساب.`,
                        confirmLabel: "إرسال التعليمات",
                      })
                    }
                  >
                    طلب عربون ({formatPrice(stadiumDeposit)})
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="danger"
                  disabled={actionLoading}
                  onClick={() =>
                    requestStatusAction({
                      body: { status: "REJECTED" },
                      successMessage: "تم رفض الحجز",
                      title: "رفض الحجز",
                      description: "هل تريد رفض هذا الحجز؟",
                      confirmLabel: "رفض",
                      destructive: true,
                    })
                  }
                >
                  رفض
                </Button>
              </div>
            )}

            {awaitingDeposit && (
              <div className="pt-2">
                <Button
                  size="sm"
                  variant="danger"
                  disabled={actionLoading}
                  onClick={() =>
                    requestStatusAction({
                      body: { status: "REJECTED" },
                      successMessage: "تم رفض الحجز",
                      title: "رفض الحجز",
                      description: "هل تريد رفض هذا الحجز؟",
                      confirmLabel: "رفض",
                      destructive: true,
                    })
                  }
                >
                  رفض
                </Button>
              </div>
            )}

            {depositPaidAwaitingConfirm && (
              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1"
                  size="sm"
                  disabled={actionLoading}
                  onClick={() =>
                    requestStatusAction({
                      body: { status: "CONFIRMED" },
                      successMessage: "تم تأكيد الحجز",
                      title: "تأكيد الحجز",
                      description: "هل راجعت تحويل العربون وتريد تأكيد الحجز؟",
                      confirmLabel: "تأكيد",
                    })
                  }
                >
                  تأكيد الحجز
                </Button>
                <Button
                  className="flex-1"
                  variant="danger"
                  size="sm"
                  disabled={actionLoading}
                  onClick={() =>
                    requestStatusAction({
                      body: { status: "REJECTED" },
                      successMessage: "تم رفض الحجز",
                      title: "رفض الحجز",
                      description: "هل تريد رفض هذا الحجز بعد مراجعة التحويل؟",
                      confirmLabel: "رفض",
                      destructive: true,
                    })
                  }
                >
                  رفض
                </Button>
              </div>
            )}

            {booking.status === "CONFIRMED" && (
              <div className="pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={actionLoading}
                  onClick={() =>
                    requestStatusAction({
                      body: { status: "COMPLETED" },
                      successMessage: "تم إتمام الحجز",
                      title: "إتمام الحجز",
                      description: "هل تريد وضع علامة مكتمل على هذا الحجز؟",
                      confirmLabel: "مكتمل",
                    })
                  }
                >
                  وضع علامة مكتمل
                </Button>
              </div>
            )}
          </>
        ) : (
          <p className="py-8 text-center text-muted-foreground text-sm">تعذّر تحميل الحجز</p>
        )}
      </DialogContent>
      <ConfirmAlert
        open={!!pendingAction}
        onOpenChange={(open) => !open && setPendingAction(null)}
        title={pendingAction?.title ?? ""}
        description={pendingAction?.description ?? ""}
        confirmLabel={pendingAction?.confirmLabel}
        destructive={pendingAction?.destructive}
        loading={actionLoading}
        onConfirm={executePendingAction}
      />
    </Dialog>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  sub,
  ltr,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  ltr?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <Icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        {ltr ? (
          <a href={`tel:${value}`} className="font-medium tabular-nums" dir="ltr">
            {value}
          </a>
        ) : (
          <p className="font-medium">{value}</p>
        )}
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}
