"use client";

import Image from "next/image";
import { Download, Share, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { APP_NAME_AR } from "@/lib/brand";
import { usePwaInstall } from "@/features/pwa/pwa-install-provider";

export function InstallAppDialog() {
  const { isOpen, mode, installing, closeDialog, install } = usePwaInstall();

  return (
    <Dialog open={isOpen} onOpenChange={(next) => !next && closeDialog()}>
      <DialogContent className="max-w-sm gap-0 overflow-hidden border-0 p-0" dir="rtl">
        <div className="relative bg-gradient-to-br from-primary/15 via-card to-secondary p-6 pb-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-card shadow-soft">
              <Image src="/logo.png" alt={APP_NAME_AR} fill className="object-cover" sizes="56px" />
            </div>
            <div>
              <DialogHeader className="space-y-1 p-0 text-start">
                <DialogTitle className="text-lg font-bold text-heading">
                  ثبّت تطبيق {APP_NAME_AR}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  وصول أسرع للحجز وتتبّع طلباتك من الشاشة الرئيسية
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>

          {mode === "ios" ? (
            <div className="space-y-2 rounded-2xl bg-card/80 p-3 text-sm text-muted-foreground">
              <p className="flex items-center gap-2 font-medium text-heading">
                <Share className="h-4 w-4 shrink-0 text-primary" />
                على iPhone / iPad
              </p>
              <ol className="list-inside list-decimal space-y-1 text-xs leading-relaxed">
                <li>اضغط زر المشاركة في المتصفح</li>
                <li>اختر «إضافة إلى الشاشة الرئيسية»</li>
                <li>اضغط «إضافة»</li>
              </ol>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-2xl bg-card/80 px-3 py-2.5 text-xs text-muted-foreground">
              <Smartphone className="h-4 w-4 shrink-0 text-primary" />
              <span>ثبّت التطبيق للوصول السريع دون فتح المتصفح كل مرة</span>
            </div>
          )}

          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-2xl border-0 bg-card/80"
              onClick={closeDialog}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              className="h-11 gap-2 rounded-2xl shadow-soft"
              onClick={() => void install()}
              disabled={installing}
            >
              <Download className="h-4 w-4" />
              {mode === "ios" ? "فهمت" : installing ? "جاري التثبيت..." : "تثبيت"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
