import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/shared/utils/cn";

const badgeVariants = cva("inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium", {
  variants: {
    variant: {
      violet: "border-femtrex-violet/40 bg-femtrex-violet/15 text-[#b987ff]",
      pink: "border-femtrex-pink/40 bg-femtrex-pink/15 text-[#ff7fc2]",
      mint: "border-femtrex-mint/40 bg-femtrex-mint/15 text-femtrex-mint",
      amber: "border-femtrex-amber/40 bg-femtrex-amber/15 text-femtrex-amber",
      blue: "border-femtrex-blue/40 bg-femtrex-blue/15 text-[#83a1ff]"
    }
  },
  defaultVariants: { variant: "violet" }
});

export function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
