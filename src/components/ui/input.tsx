import * as React from "react";
import { cn } from "@/shared/utils/cn";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-14 w-full rounded-2xl border border-femtrex-line bg-femtrex-elevated px-5 text-base text-white outline-none transition placeholder:text-femtrex-soft focus:border-femtrex-violet focus:ring-2 focus:ring-femtrex-violet/25",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
