"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/shared/utils/cn";

export function Progress({ value = 0, className, indicatorClassName }: { value?: number; className?: string; indicatorClassName?: string }) {
  return (
    <ProgressPrimitive.Root className={cn("relative h-2 w-full overflow-hidden rounded-full bg-white/7", className)}>
      <ProgressPrimitive.Indicator
        className={cn("h-full rounded-full bg-gradient-to-r from-femtrex-violet to-femtrex-pink transition-all", indicatorClassName)}
        style={{ transform: `translateX(-${100 - value}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}
