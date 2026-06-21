"use client";

import { useCallback, useState } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/features/auth/store/auth";
import { useSnackbar } from "@/components/ui/snackbar";

export function useConfirmBookingDeposit(onSuccess?: () => void) {
  const showSnack = useSnackbar((s) => s.show);
  const token = useAuthStore((s) => s.token);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const confirmDeposit = useCallback(
    async (bookingId: string) => {
      if (!token) {
        showSnack("سجّل دخولك أولاً", "error");
        return false;
      }
      setConfirmingId(bookingId);
      const res = await api(`/bookings/${bookingId}/confirm-deposit`, {
        method: "POST",
        token,
      });
      setConfirmingId(null);

      if (res.success) {
        showSnack("تم استلام إبلاغك — صاحب الملعب سيراجع التحويل ويؤكد الحجز");
        onSuccess?.();
        return true;
      }

      showSnack(res.message ?? "تعذّر إرسال الإبلاغ", "error");
      return false;
    },
    [onSuccess, showSnack, token]
  );

  return { confirmDeposit, confirmingId, isConfirming: (id: string) => confirmingId === id };
}
