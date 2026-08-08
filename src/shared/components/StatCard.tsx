import { GlassCard } from "@/shared/components/GlassCard";

export function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <GlassCard className="p-5">
      <p className="text-3xl font-light text-[#d887ff]">{value}</p>
      <p className="mt-2 text-sm text-femtrex-soft">{label}</p>
    </GlassCard>
  );
}
