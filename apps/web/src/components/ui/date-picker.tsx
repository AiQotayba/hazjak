"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  formatBookingDate,
  formatDateShortDisplay,
  parseDateKey,
  localDateInputValue,
} from "@/lib/booking-slots";

export interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  minDate?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  minDate,
  disabled,
  id,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const min = minDate ? parseDateKey(minDate) : new Date();
  min.setHours(0, 0, 0, 0);

  const selected = value ? parseDateKey(value) : undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full h-11 justify-between rounded-2xl border-0 bg-secondary/60 shadow-none px-4 font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <span className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-primary shrink-0" />
              {value ? formatDateShortDisplay(value) : "اختر التاريخ"}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(day) => {
              if (day) {
                onChange(localDateInputValue(day));
                setOpen(false);
              }
            }}
            disabled={(date) => {
              const d = new Date(date);
              d.setHours(0, 0, 0, 0);
              return d < min;
            }}
          />
        </PopoverContent>
      </Popover>
      {value && (
        <p className="text-xs text-muted-foreground px-1">{formatBookingDate(value)}</p>
      )}
    </div>
  );
}
