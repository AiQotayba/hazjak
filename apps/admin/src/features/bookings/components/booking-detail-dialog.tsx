"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CalendarDays, MapPin, User } from "lucide-react";
import { formatDate, formatPrice } from "@beeplay/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useRequireAdmin } from "@/hooks/use-require-admin";

export const STATUS_LABELS: Record<string, string> = {
  PENDING: "قيد الانتظار",
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
  stadium: { name: string; city: string; coverImage?: string | null };
  user: { firstName: string; lastName: string; email: string; phone?: string | null };
};

interface BookingDetailDialogProps {
  bookingId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange?: () => void;
}

export function BookingDetailDialog({
  bookingId,
  open,
  onOpenChange,
  onStatusChange,
}: BookingDetailDialogProps) {
  const { token } = useRequireAdmin();
  const [booking, setBooking] = useState<AdminBookingRow | null>(null);
  const [loading, setLoading] = useState(false);

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

  async function updateStatus(status: string) {
    if (!booking) return;
    await api(`/bookings/${booking.id}/status`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ status }),
    });
    setBooking({ ...booking, status });
    onStatusChange?.();
  }

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
                <Image
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
                sub={booking.user.email}
              />
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
              {booking.notes && (
                <p className="text-muted-foreground text-xs rounded-lg border border-border p-3">
                  {booking.notes}
                </p>
              )}
            </dl>

            {booking.status === "PENDING" && (
              <div className="flex gap-2 pt-2">
                <Button className="flex-1" size="sm" onClick={() => updateStatus("CONFIRMED")}>
                  قبول
                </Button>
                <Button
                  className="flex-1"
                  variant="danger"
                  size="sm"
                  onClick={() => updateStatus("REJECTED")}
                >
                  رفض
                </Button>
              </div>
            )}
          </>
        ) : (
          <p className="py-8 text-center text-muted-foreground text-sm">تعذّر تحميل الحجز</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex gap-3">
      <Icon className="h-4 w-4 text-primary shrink-0 mt-0.5" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

