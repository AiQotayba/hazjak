"use client";

import { useEffect, useState } from "react";
import { Clock, Banknote, FileText, User } from "lucide-react";
import { formatDate, formatPrice, formatTime } from "@beeplay/utils";
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

export type OwnerBookingDetail = {
  id: string;
  status: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  notes?: string | null;
  depositAmount?: number | null;
  user: { firstName: string; lastName: string; email?: string; phone?: string | null };
  stadium: { name: string };
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

  async function setStatus(status: string) {
    if (!booking || !token) return;
    setActionLoading(true);
    await api(`/bookings/${booking.id}/status`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ status }),
    });
    setActionLoading(false);
    onUpdated?.();
    onOpenChange(false);
  }

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
              {booking.notes && <Row icon={FileText} label="ملاحظات" value={booking.notes} />}
            </dl>

            <div className="grid grid-cols-2 gap-2 pt-2">
              {booking.status === "PENDING" && (
                <>
                  <Button disabled={actionLoading} onClick={() => setStatus("CONFIRMED")}>
                    قبول
                  </Button>
                  <Button variant="destructive" disabled={actionLoading} onClick={() => setStatus("REJECTED")}>
                    رفض
                  </Button>
                </>
              )}
              {booking.status === "CONFIRMED" && (
                <Button className="col-span-2" variant="outline" disabled={actionLoading} onClick={() => setStatus("COMPLETED")}>
                  إتمام الحجز
                </Button>
              )}
              {!["PENDING", "CONFIRMED"].includes(booking.status) && (
                <Button className="col-span-2" variant="ghost" onClick={() => onOpenChange(false)}>
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
