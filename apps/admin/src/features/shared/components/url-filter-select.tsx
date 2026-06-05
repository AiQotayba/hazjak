"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UrlFilterSelectProps {
  param: string;
  placeholder: string;
  options: { value: string; label: string }[];
  className?: string;
}

export function UrlFilterSelect({
  param,
  placeholder,
  options,
  className,
}: UrlFilterSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const value = searchParams?.get(param) || "";

  function onChange(next: string) {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (!next || next === "__all__") params.delete(param);
    else params.set(param, next);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <Select value={value || "__all__"} onValueChange={onChange}>
      <SelectTrigger className={className ?? "w-40 h-10"}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__all__">{placeholder}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
