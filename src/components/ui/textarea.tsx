import * as React from "react";
import { cn } from "@/shared/utils/cn";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "min-h-32 w-full resize-none rounded-2xl border border-femtrex-line bg-femtrex-elevated px-5 py-4 text-base text-white outline-none transition placeholder:text-femtrex-soft focus:border-femtrex-violet focus:ring-2 focus:ring-femtrex-violet/25",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export { Textarea };
