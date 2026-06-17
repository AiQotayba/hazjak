"use client";

import { useEffect, useState } from "react";
import { Clock, Banknote, FileText, User, Wallet } from "lucide-react";
import { BOOKING_EXPIRATION_MIN } from "@hazjak/constants";
import { formatDate, formatPrice, formatTime } from "@hazjak/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useAuthStore } from "@/features/auth/store/auth";
import { useSnackbar } from "@/components/ui/snackbar";

export type OwnerBookingDetail = {
  id: string;
  status: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  notes?: string | null;
  depositAmount?: number | null;
  depositReferenceCode?: string | null;
  user: { firstName: string; lastName: string; email?: string; phone?: string | null };
  stadium: { name: string; depositAmount?: number | null; contactWhatsapp?: string | null };
};

interface OwnerBookingDetailDialogProps {
  bookingId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: () => void;
}

export function OwnerBookingDetailDialog({
  bookingId,
  open,
  onOpenChange,
  onUpdated,
}: OwnerBookingDetailDialogProps) {
  const { token } = useAuthStore();
  const showSnack = useSnackbar((s) => s.show);
  const [booking, setBooking] = useState<OwnerBookingDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!open || !bookingId || !token) {
      setBooking(null);
      return;
    }
    setLoading(true);
    api<OwnerBookingDetail>(`/bookings/${bookingId}`, { token })
      .then((res) => setBooking(res.data ?? null))
      .finally(() => setLoading(false));
  }, [open, bookingId, token]);

  async function patchStatus(body: Record<string, unknown>, successMessage: string) {
    if (!booking || !token) return;
    setActionLoading(true);
    const res = await api(`/bookings/${booking.id}/status`, {
      method: "PATCH",
      token,
      body: JSON.stringify(body),
    });
    setActionLoading(false);
    if (res.success) {
      showSnack(successMessage);
      onUpdated?.();
      onOpenChange(false);
      return;
    }
    showSnack(res.message ?? "تعذّر تحديث الحجز", "error");
  }

  const stadiumDeposit = booking?.stadium.depositAmount ?? 0;
  const awaitingDeposit =
    booking?.status === "PENDING" &&
    !!booking.depositReferenceCode &&
    (booking.depositAmount ?? 0) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">جاري التحميل...</p>
        ) : !booking ? (
          <p className="py-8 text-center text-sm text-muted-foreground">تعذّر تحميل التفاصيل</p>
        ) : (
          <div className="space-y-4">
            <DialogHeader className="text-start space-y-2">
              <div className="flex items-start justify-between gap-2">
                <DialogTitle className="text-heading">{booking.stadium.name}</DialogTitle>
                <StatusBadge status={booking.status} />
              </div>
            </DialogHeader>

            <dl className="space-y-3 text-sm">
              <Row
                icon={User}
                label="اللاعب"
                value={`${booking.user.firstName} ${booking.user.lastName}${booking.user.phone ? ` · ${booking.user.phone}` : ""}`}
              />
              <Row
                icon={Clock}
                label="الموعد"
                value={`${formatDate(booking.startTime, { dateStyle: "medium" })} · ${formatTime(booking.startTime)} — ${formatTime(booking.endTime)}`}
              />
              <Row icon={Banknote} label="المبلغ" value={formatPrice(booking.totalPrice)} />
              {booking.depositAmount != null && booking.depositAmount > 0 && (
                <Row icon={Wallet} label="العربون" value={formatPrice(booking.depositAmount)} />
              )}
              {booking.depositReferenceCode && (
                <Row icon={FileText} label="كود التحويل" value={booking.depositReferenceCode} />
              )}
              {booking.notes && <Row icon={FileText} label="ملاحظات" value={booking.notes} />}
            </dl>

            {awaitingDeposit && (
              <p className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-muted-foreground leading-relaxed">
                بانتظار دفع العربون عبر شام كاش خلال {BOOKING_EXPIRATION_MIN} دقيقة. بعد استلام
                التحويل اضغط «تأكيد الحجز».
              </p>
            )}

            <div className="grid gap-2 pt-2">
              {booking.status === "PENDING" && !awaitingDeposit && (
                <>
                  <Button
                    disabled={actionLoading}
                    onClick={() => patchStatus({ status: "CONFIRMED" }, "تم قبول الحجز")}
                  >
                    قبول الحجز
                  </Button>
                  {stadiumDeposit > 0 && (
                    <Button
                      variant="secondary"
                      disabled={actionLoading}
                      onClick={() =>
                        patchStatus(
                          { status: "PENDING", requireDeposit: true },
                          "تم طلب العربون — أُرسلت التعليمات للاعب"
                        )
                      }
                    >
                      قبول مع طلب عربون ({formatPrice(stadiumDeposit)})
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    disabled={actionLoading}
                    onClick={() => patchStatus({ status: "REJECTED" }, "تم رفض الحجز")}
                  >
                    رفض
                  </Button>
                </>
              )}
              {booking.status === "PENDING" && awaitingDeposit && (
                <>
                  <Button
                    disabled={actionLoading}
                    onClick={() => patchStatus({ status: "CONFIRMED" }, "تم تأكيد الحجز بعد العربون")}
                  >
                    تأكيد بعد استلام العربون
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={actionLoading}
                    onClick={() => patchStatus({ status: "REJECTED" }, "تم رفض الحجز")}
                  >
                    رفض
                  </Button>
                </>
              )}
              {booking.status === "CONFIRMED" && (
                <Button
                  variant="outline"
                  disabled={actionLoading}
                  onClick={() => patchStatus({ status: "COMPLETED" }, "تم إتمام الحجز")}
                >
                  وضع علامة مكتمل
                </Button>
              )}
              {!["PENDING", "CONFIRMED"].includes(booking.status) && (
                <Button variant="ghost" onClick={() => onOpenChange(false)}>
                  إغلاق
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <Icon className="h-4 w-4 shrink-0 text-primary mt-0.5" />
      <div>
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="font-medium text-heading mt-0.5">{value}</dd>
      </div>
    </div>
  );
}
