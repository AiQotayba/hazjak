"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setVisible(true);
    setProgress(12);

    const step1 = window.setTimeout(() => setProgress(55), 80);
    const step2 = window.setTimeout(() => setProgress(88), 220);
    const step3 = window.setTimeout(() => {
      setProgress(100);
      window.setTimeout(() => setVisible(false), 180);
    }, 420);

    return () => {
      window.clearTimeout(step1);
      window.clearTimeout(step2);
      window.clearTimeout(step3);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 bg-primary/15"
      aria-hidden
    >
      <div
        className="h-full bg-primary transition-[width] duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
