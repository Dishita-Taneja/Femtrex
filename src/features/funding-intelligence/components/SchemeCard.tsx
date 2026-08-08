import { ArrowRight, Calendar, IndianRupee, Tag, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Scheme } from "@/shared/types/domain";

export function SchemeCard({ scheme }: { scheme: Scheme }) {
  const badge = scheme.type === "Loan" ? "blue" : scheme.type === "Accelerator" ? "pink" : "mint";

  return (
    <article className="relative rounded-[24px] border border-femtrex-line bg-femtrex-panel p-5 transition hover:-translate-y-1 hover:border-femtrex-violet">
      {scheme.closingSoon && <span className="absolute -top-3 left-5 rounded-full bg-femtrex-amber px-3 py-1 text-sm font-medium text-white">Closing Soon</span>}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-xl font-semibold leading-snug text-white">{scheme.name}</h3>
        <Badge variant={badge}>{scheme.type}</Badge>
      </div>
      <p className="mt-5 line-clamp-2 text-femtrex-soft">{scheme.description}</p>
      <div className="mt-5 grid gap-3 text-sm text-femtrex-soft sm:grid-cols-2">
        <span className="flex items-center gap-2 text-white"><IndianRupee className="size-4 text-femtrex-violet" /> {scheme.amount}</span>
        <span className="flex items-center gap-2"><Calendar className="size-4 text-femtrex-pink" /> {scheme.deadline}</span>
        <span className="flex items-center gap-2"><Tag className="size-4" /> {scheme.sector}</span>
        <span className="flex items-center gap-2 text-femtrex-mint"><TrendingUp className="size-4" /> {scheme.match}% match</span>
      </div>
      <div className="mt-5 flex items-center gap-4">
        <Progress value={scheme.match} className="flex-1" />
        <ArrowRight className="size-5 text-femtrex-soft" />
      </div>
    </article>
  );
}
