"use client";

import { create } from "zustand";
import { CheckCircle2, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type SnackVariant = "success" | "error";

interface Snack {
  id: string;
  message: string;
  variant: SnackVariant;
}

interface SnackbarState {
  snack: Snack | null;
  show: (message: string, variant?: SnackVariant) => void;
  dismiss: () => void;
}

let hideTimer: ReturnType<typeof setTimeout> | undefined;

export const useSnackbar = create<SnackbarState>((set, get) => ({
  snack: null,
  show: (message, variant = "success") => {
    const id = String(Date.now());
    if (hideTimer) clearTimeout(hideTimer);
    set({ snack: { id, message, variant } });
    hideTimer = setTimeout(() => {
      if (get().snack?.id === id) set({ snack: null });
    }, 4500);
  },
  dismiss: () => {
    if (hideTimer) clearTimeout(hideTimer);
    set({ snack: null });
  },
}));

export function SnackbarHost() {
  const { snack, dismiss } = useSnackbar();
  if (!snack) return null;

  const Icon = snack.variant === "success" ? CheckCircle2 : XCircle;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 inset-x-4 z-[90] mx-auto max-w-md md:bottom-6"
    >
      <div
        className={cn(
          "flex items-start gap-3 rounded-xl border px-4 py-3 shadow-card backdrop-blur-md",
          snack.variant === "success"
            ? "border-primary/20 bg-card text-heading"
            : "border-destructive/20 bg-card text-heading"
        )}
      >
        <Icon
          className={cn(
            "h-5 w-5 shrink-0 mt-0.5",
            snack.variant === "success" ? "text-primary" : "text-destructive"
          )}
        />
        <p className="flex-1 text-sm font-medium leading-relaxed">{snack.message}</p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 text-muted-foreground hover:text-heading"
          aria-label="إغلاق"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
