"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export interface SegmentedControlOption<T extends string = string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: readonly SegmentedControlOption<T>[];
  className?: string;
  size?: "sm" | "md";
  "aria-label"?: string;
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  className,
  size = "sm",
  "aria-label": ariaLabel,
}: SegmentedControlProps<T>) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as T)} dir="rtl">
      <TabsList aria-label={ariaLabel} className={cn(className)} >
        {options.map((option) => (
          <TabsTrigger
            key={option.value}
            value={option.value}
            className={size === "md" ? "px-4 py-2 text-sm" : undefined}
          >
            {option.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
