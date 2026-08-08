import { cn } from "@/shared/utils/cn";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  className
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {eyebrow && <p className="text-sm font-medium uppercase tracking-[0.28em] text-femtrex-pink">{eyebrow}</p>}
      <h1 className="text-3xl font-semibold text-white md:text-4xl">{title}</h1>
      {subtitle && <p className="max-w-3xl text-base text-femtrex-soft md:text-lg">{subtitle}</p>}
    </div>
  );
}
