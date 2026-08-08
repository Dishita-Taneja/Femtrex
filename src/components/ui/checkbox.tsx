"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/shared/utils/cn";

export function Checkbox({ className, ...props }: React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn("flex size-5 items-center justify-center rounded-md border border-femtrex-line bg-femtrex-elevated data-[state=checked]:border-femtrex-violet data-[state=checked]:bg-femtrex-violet", className)}
      {...props}
    >
      <CheckboxPrimitive.Indicator>
        <Check className="size-4 text-white" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
