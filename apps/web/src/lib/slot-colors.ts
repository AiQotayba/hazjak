export type SlotReason = "booked" | "blocked" | "outside_hours" | "past";

export interface SlotColorState {
  available: boolean;
  reason?: SlotReason;
}

/** Slot colors: available=green, booked=red, past=gray, permanent/unavailable=black */
export function getSlotColorClasses(slot: SlotColorState, selected = false): string {
  if (slot.available) {
    return selected
      ? "bg-emerald-600 text-white ring-2 ring-emerald-600 ring-offset-2"
      : "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25";
  }

  switch (slot.reason) {
    case "booked":
      return "bg-red-500/15 text-red-800 dark:text-red-300 border-red-500/30 cursor-not-allowed opacity-90";
    case "past":
      return "bg-muted text-muted-foreground border-border/40 cursor-not-allowed opacity-70";
    case "blocked":
    case "outside_hours":
    default:
      return "bg-heading text-white/90 border-heading cursor-not-allowed opacity-80";
  }
}

export const SLOT_LEGEND = [
  { key: "available", label: "متاح", className: "bg-emerald-500" },
  { key: "booked", label: "محجوز", className: "bg-red-500" },
  { key: "past", label: "انتهى", className: "bg-muted-foreground/50" },
  { key: "unavailable", label: "غير متاح", className: "bg-heading" },
] as const;
