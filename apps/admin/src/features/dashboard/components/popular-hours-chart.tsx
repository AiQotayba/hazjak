"use client";

interface PopularHoursChartProps {
  hours: { hour: number; count: number }[];
}

export function PopularHoursChart({ hours }: PopularHoursChartProps) {
  if (hours.length === 0) {
    return <p className="text-sm text-muted-foreground py-8 text-center">لا توجد بيانات بعد</p>;
  }

  const sorted = [...hours].sort((a, b) => a.hour - b.hour);
  const max = Math.max(...sorted.map((h) => h.count), 1);

  return (
    <div className="flex items-end justify-between gap-2 h-36 pt-2">
      {sorted.map(({ hour, count }) => (
        <div key={hour} className="flex flex-col items-center gap-1.5 flex-1">
          <span className="text-[10px] font-bold text-brand">{count > 0 ? count : ""}</span>
          <div
            className="w-full max-w-[28px] rounded-t-md bg-[var(--accent-orange)]/80 transition-all"
            style={{ height: `${(count / max) * 100}%`, minHeight: count > 0 ? "8px" : "2px" }}
          />
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
            {hour}:00
          </span>
        </div>
      ))}
    </div>
  );
}
