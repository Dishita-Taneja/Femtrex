import type { LucideIcon } from "lucide-react";
import { GlassCard } from "@/shared/components/GlassCard";

export function MetricCard({
  icon: Icon,
  label,
  value,
  delta
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  delta: string;
}) {
  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between">
        <Icon className="size-5 text-femtrex-pink" />
        <span className="text-xs text-femtrex-mint">{delta}</span>
      </div>
      <p className="mt-5 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-sm text-femtrex-soft">{label}</p>
    </GlassCard>
  );
}
