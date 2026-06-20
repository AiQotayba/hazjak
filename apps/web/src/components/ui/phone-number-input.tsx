import { forwardRef } from "react";
import PhoneInputWithCountry, { type Value } from "react-phone-number-input";
import { cn } from "@/lib/utils";

interface PhoneNumberInputProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
  id?: string;
  defaultCountry?: "SY" | "DE" | "SA" | "AE" | "JO" | "LB" | "IQ" | "EG";
}

export const PhoneNumberInput = forwardRef<HTMLInputElement, PhoneNumberInputProps>(
  ({ value, onChange, className, disabled, id, defaultCountry = "SY" }, ref) => (
    <div dir="ltr" className={cn("phone-input-root", className)}>
      <PhoneInputWithCountry
        id={id}
        international
        defaultCountry={defaultCountry}
        value={value as Value | undefined}
        onChange={(v) => onChange?.(v ?? "")}
        disabled={disabled}
        inputRef={ref}
        className="PhoneInput"
      />
    </div>
  )
);
PhoneNumberInput.displayName = "PhoneNumberInput";
