"use client";

import { SlidersHorizontal, TriangleAlert, RefreshCw, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { SectionHeading } from "@/shared/components/SectionHeading";
import { schemeTypes, sectors } from "@/features/funding-intelligence/constants/filters";
import { useSchemeFilters } from "@/features/funding-intelligence/hooks/useSchemeFilters";
import { SchemeCard } from "@/features/funding-intelligence/components/SchemeCard";
import type { FundingFilters } from "@/features/funding-intelligence/types/funding";

export function FundingPage() {
  const { filters, results, loading, error, patch, refetch } = useSchemeFilters("priya-demo");

  const highMatchCount = results.filter((s) => (s.match || 0) >= 85).length;
  const closingSoonCount = results.filter((s) => s.closingSoon).length;
  const womenOnlyCount = results.filter((s) => s.womenOnly).length;

  return (
    <div className="grid min-h-[calc(100vh-78px)] lg:grid-cols-[320px_1fr]">
      <aside className="border-b border-femtrex-line p-6 lg:border-b-0 lg:border-r">
        <FilterGroup title="Scheme Type" items={schemeTypes} active={filters.type} onSelect={(type) => patch({ type: filters.type === type ? undefined : type })} />
        <FilterGroup
          title="Status"
          items={["Open", "Closing Soon"]}
          active={filters.status}
          onSelect={(status) => patch({ status: filters.status === status ? undefined : (status as FundingFilters["status"]) })}
        />
        <div className="border-t border-femtrex-line py-8">
          <p className="mb-5 text-sm uppercase tracking-[0.28em] text-femtrex-soft">Women-only schemes</p>
          <label className="flex items-center gap-4 text-femtrex-soft cursor-pointer">
            <Switch checked={filters.womenOnly} onCheckedChange={(womenOnly) => patch({ womenOnly })} />
            Show only women-only schemes
          </label>
        </div>
        <FilterGroup title="Sector" items={sectors} active={filters.sector} onSelect={(sector) => patch({ sector: filters.sector === sector ? undefined : sector })} />
      </aside>

      <section className="p-6 lg:p-8">
        <div className="flex flex-col gap-5 border-b border-femtrex-line pb-6 xl:flex-row xl:items-center xl:justify-between">
          <SectionHeading title="Funding Intelligence" subtitle="AI scheme matcher, similarity search, and eligibility scoring powered by FastAPI & ChromaDB." />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" size="icon" onClick={() => refetch()} title="Refresh Matches">
              <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Input value={filters.query} onChange={(event) => patch({ query: event.target.value })} placeholder="Search schemes, sectors, tags..." className="w-full sm:w-[480px]" />
          </div>
        </div>

        {error && (
          <div className="mt-6 flex items-center justify-between rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            <div className="flex items-center gap-3">
              <AlertTriangle className="size-5 text-red-400" />
              <p className="text-sm font-medium">{error}</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => refetch()} className="border-red-500/40 text-red-300 hover:bg-red-500/20">
              <RefreshCw className="mr-2 size-3" /> Retry
            </Button>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-6 border-b border-femtrex-line py-4 text-sm text-femtrex-soft">
          <span className="text-femtrex-mint">{highMatchCount} high-match schemes</span>
          <span className="text-femtrex-amber">{closingSoonCount} closing soon</span>
          <span className="text-femtrex-pink">{womenOnlyCount} women-only schemes</span>
          <span className="ml-auto text-lg text-white">{results.length} schemes found</span>
        </div>

        {closingSoonCount > 0 && (
          <div className="mt-6 rounded-[24px] border border-femtrex-amber/40 bg-femtrex-amber/10 p-5 text-femtrex-amber">
            <TriangleAlert className="mr-3 inline size-5" />
            {closingSoonCount} schemes are closing within the next 30 days - prepare your documents now.
          </div>
        )}

        {loading ? (
          <div className="mt-12 flex flex-col items-center justify-center rounded-[24px] border border-femtrex-line bg-femtrex-panel p-16 text-femtrex-soft">
            <Loader2 className="size-8 animate-spin text-femtrex-violet mb-4" />
            <p className="text-lg font-medium text-white">Running AI similarity match across government schemes...</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 xl:grid-cols-2 2xl:grid-cols-3">
            {results.map((scheme) => <SchemeCard key={scheme.id} scheme={scheme} />)}
          </div>
        )}
      </section>
    </div>
  );
}

function FilterGroup({ title, items, active, onSelect }: { title: string; items: string[]; active?: string; onSelect: (value: string) => void }) {
  return (
    <div className="border-t border-femtrex-line py-8 first:border-t-0 first:pt-0">
      <p className="mb-5 text-sm uppercase tracking-[0.28em] text-femtrex-soft">{title}</p>
      <div className="space-y-4">
        {items.map((item) => (
          <button key={item} onClick={() => onSelect(item)} className="flex items-center gap-3 text-femtrex-soft hover:text-white">
            <span className={`size-5 rounded-full border ${active === item ? "border-femtrex-violet bg-femtrex-violet" : "border-femtrex-line"}`} />
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
