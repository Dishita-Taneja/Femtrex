import { cn } from "@/shared/utils/cn";

const colors = {
  violet: "#8b3cff",
  pink: "#ef4ca6",
  mint: "#10d39b",
  amber: "#ffb21a",
  blue: "#5d6df6"
};

export function ScoreRing({
  score,
  color = "violet",
  size = 96,
  className
}: {
  score: number;
  color?: keyof typeof colors;
  size?: number;
  className?: string;
}) {
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;

  return (
    <div className={cn("relative grid place-items-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(139,60,255,.22)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors[color]}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (score / 100) * circumference}
        />
      </svg>
      <span className="absolute text-2xl font-medium" style={{ color: colors[color] }}>
        {score}
      </span>
    </div>
  );
}
