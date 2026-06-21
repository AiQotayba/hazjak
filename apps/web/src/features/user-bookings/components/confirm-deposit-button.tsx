"use client";

import { useState } from "react";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmAlert } from "@/components/ui/confirm-alert";
import { cn } from "@/lib/utils";
import { useConfirmBookingDeposit } from "@/features/user-bookings/hooks/use-confirm-booking-deposit";

interface ConfirmDepositButtonProps {
  bookingId: string;
  onSuccess?: () => void;
  className?: string;
}

export function ConfirmDepositButton({
  bookingId,
  onSuccess,
  className,
}: ConfirmDepositButtonProps) {
  const [alertOpen, setAlertOpen] = useState(false);
  const { confirmDeposit, isConfirming } = useConfirmBookingDeposit(onSuccess);

  async function handleConfirm() {
    const ok = await confirmDeposit(bookingId);
    if (ok) setAlertOpen(false);
  }

  return (
    <>
      <Button
        type="button"
        className={cn("w-full font-bold shadow-soft", className)}
        disabled={isConfirming(bookingId)}
        onClick={() => setAlertOpen(true)}
      >
        <Wallet className="h-4 w-4 ms-2" aria-hidden />
        {isConfirming(bookingId) ? "جاري الإرسال..." : "أبلغنا بدفع العربون"}
      </Button>

      <ConfirmAlert
        open={alertOpen}
        onOpenChange={setAlertOpen}
        title="تأكيد دفع العربون"
        description="هل أكملت تحويل العربون عبر شام كاش؟ سيُبلّغ صاحب الملعب لمراجعة التحويل وتأكيد حجزك."
        confirmLabel="نعم، أبلغ صاحب الملعب"
        loading={isConfirming(bookingId)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
