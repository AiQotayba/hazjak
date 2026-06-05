"use client";

import { cn } from "@/lib/utils";

interface MorningEveningChartProps {
  morning: number;
  evening: number;
  className?: string;
}

export function MorningEveningChart({ morning, evening, className }: MorningEveningChartProps) {
  const total = morning + evening || 1;
  const morningPct = Math.round((morning / total) * 100);
  const eveningPct = 100 - morningPct;
  const max = Math.max(morning, evening, 1);

  const bars = [
    { label: "صباحي", value: morning, pct: morningPct, color: "bg-brand" },
    { label: "مسائي", value: evening, pct: eveningPct, color: "bg-[var(--accent-teal)]" },
  ];

  return (
    <div className={cn("flex flex-col lg:flex-row gap-6", className)}>
      <div className="flex-1 flex items-end justify-around gap-3 h-40 pt-4">
        {bars.map((b) => (
          <div key={b.label} className="flex flex-col items-center gap-2 flex-1 max-w-[80px]">
            <div className="relative w-full flex items-end justify-center h-32">
              <div
                className={cn("w-10 rounded-t-lg transition-all", b.color)}
                style={{ height: `${(b.value / max) * 100}%`, minHeight: b.value > 0 ? "12px" : "4px" }}
              />
            </div>
            <span className="text-xs text-muted-foreground font-medium">{b.label}</span>
            <span className="text-sm font-bold">{b.value}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center gap-3 lg:w-36">
        <div
          className="relative h-24 w-24 rounded-full"
          style={{
            background: `conic-gradient(var(--color-brand) 0% ${morningPct}%, var(--accent-teal) ${morningPct}% 100%)`,
          }}
        >
          <div className="absolute inset-3 rounded-full bg-card flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-heading">{morningPct}%</span>
            <span className="text-[10px] text-muted-foreground">صباحي</span>
          </div>
        </div>
        <div className="flex gap-3 text-xs">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-brand" />
            صباحي
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[var(--accent-teal)]" />
            مسائي {eveningPct}%
          </span>
        </div>
      </div>
    </div>
  );
}
