"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/shared/utils/cn";

export function SearchBar({
  value,
  onChange,
  placeholder = "Search or ask anything...",
  className
}: {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={cn("relative block", className)}>
      <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-femtrex-soft" />
      <Input
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        className="h-12 rounded-2xl pl-12 pr-16"
      />
      <span className="absolute right-4 top-1/2 -translate-y-1/2 rounded-xl border border-femtrex-line px-2 py-1 text-xs text-femtrex-soft">
        ⌘ K
      </span>
    </label>
  );
}
