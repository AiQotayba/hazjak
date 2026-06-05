import * as React from "react";

import { cn } from "@/lib/utils";



export const nativeSelectClassName =

  "h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";



export const NativeSelect = React.forwardRef<

  HTMLSelectElement,

  React.ComponentProps<"select">

>(({ className, ...props }, ref) => (

  <select ref={ref} className={cn(nativeSelectClassName, className)} {...props} />

));

NativeSelect.displayName = "NativeSelect";

