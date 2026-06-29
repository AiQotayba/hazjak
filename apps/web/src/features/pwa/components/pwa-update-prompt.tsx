"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PwaUpdatePrompt() {
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    function onUpdateFound(registration: ServiceWorkerRegistration) {
      const worker = registration.installing;
      if (!worker) return;

      worker.addEventListener("statechange", () => {
        if (worker.state === "installed" && navigator.serviceWorker.controller) {
          setUpdateReady(true);
        }
      });
    }

    void navigator.serviceWorker.ready.then((registration) => {
      if (registration.waiting && navigator.serviceWorker.controller) {
        setUpdateReady(true);
      }
      registration.addEventListener("updatefound", () => onUpdateFound(registration));
    });
  }, []);

  if (!updateReady) return null;

  return (
    <div
      className="fixed inset-x-4 bottom-20 z-50 mx-auto max-w-lg rounded-2xl border border-border/60 bg-card p-3 shadow-card md:bottom-6"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <p className="flex-1 text-sm font-medium text-heading">يتوفر تحديث جديد للتطبيق</p>
        <Button
          type="button"
          size="sm"
          className="gap-1.5 rounded-xl"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          تحديث
        </Button>
      </div>
    </div>
  );
}
