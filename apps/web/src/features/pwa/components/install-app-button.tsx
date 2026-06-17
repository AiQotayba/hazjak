"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePwaInstall } from "@/features/pwa/pwa-install-provider";

export function InstallAppButton() {
  const { canInstall, openDialog } = usePwaInstall();

  if (!canInstall) return null;

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="gap-1.5"
      onClick={openDialog}
      aria-label="تثبيت التطبيق"
    >
      <Download className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">تثبيت</span>
    </Button>
  );
}
