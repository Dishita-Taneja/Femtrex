import { Progress } from "@/components/ui/progress";

export function ProgressRow({
  label,
  value,
  note,
  color = "bg-femtrex-violet"
}: {
  label: string;
  value: number;
  note?: string;
  color?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4 text-sm text-femtrex-soft">
        <span>{label}</span>
        <span>{value} /100</span>
      </div>
      <Progress value={value} indicatorClassName={color} />
      {note && <p className="text-sm text-femtrex-violet">{note}</p>}
    </div>
  );
}
