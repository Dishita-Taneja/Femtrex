"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, IndianRupee, RefreshCw, AlertTriangle, Loader2, Shield, Sparkles, Users, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/shared/components/DashboardCard";
import { MetricCard } from "@/shared/components/MetricCard";
import { ProgressRow } from "@/shared/components/ProgressRow";
import { SectionHeading } from "@/shared/components/SectionHeading";
import { useDashboard } from "@/features/dashboard/hooks/useDashboard";

export function DashboardPage() {
  const { data, loading, error, refetch } = useDashboard("priya-demo");

  const readiness = data?.readiness ?? 78;
  const highMatchSchemes = data?.highMatchSchemes ?? 4;
  const urgentList = data?.urgentSchemes ?? [];
  const matchedSchemes = data?.matchedSchemes ?? [];

  const dynamicMetrics = [
    { icon: Shield, label: "Business Credibility Score", value: `${readiness}/100`, delta: data?.passportLabel || "Good" },
    { icon: Sparkles, label: "Active AI Scheme Matches", value: `${highMatchSchemes}`, delta: "Live ChromaDB Match" },
    { icon: Users, label: "Available Mentor Sessions", value: `${data?.matchedMentors?.length || 5}`, delta: "Instant Booking" },
    { icon: Target, label: "AI Action Items Pending", value: "3", delta: "15-Min Execution" }
  ];

  return (
    <section className="p-6 lg:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeading title="Growth Analytics" subtitle="Your command center for live funding intelligence, passport score, mentors, and AI execution." />
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => refetch()} title="Refresh Data">
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button asChild variant="gradient">
            <Link href="/ai-founder-copilot">Ask AI Copilot <ArrowRight className="size-4" /></Link>
          </Button>
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

      {loading ? (
        <div className="mt-8 flex items-center justify-center rounded-[24px] border border-femtrex-line bg-femtrex-panel p-12 text-femtrex-soft">
          <Loader2 className="mr-3 size-6 animate-spin text-femtrex-violet" />
          <span>Loading live analytics from backend...</span>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {dynamicMetrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_380px]">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-[24px] border border-femtrex-line bg-femtrex-panel p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">Top Scheme Matches</h3>
                  <Link href="/funding-intelligence" className="text-sm text-femtrex-violet hover:underline">View all</Link>
                </div>
                <div className="mt-4 space-y-3">
                  {matchedSchemes.slice(0, 3).map((scheme: any) => (
                    <div key={scheme.id || scheme.name} className="rounded-xl border border-femtrex-line/50 bg-white/[0.02] p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-white text-sm">{scheme.name}</span>
                        <span className="rounded-full bg-femtrex-violet/20 px-2 py-0.5 text-xs text-femtrex-violet">
                          {scheme.match_percent || scheme.match}% match
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-femtrex-soft line-clamp-1">{scheme.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-femtrex-line bg-femtrex-panel p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">Matched Mentors</h3>
                  <Link href="/mentor-network" className="text-sm text-femtrex-violet hover:underline">View all</Link>
                </div>
                <div className="mt-4 space-y-3">
                  {(data?.matchedMentors || []).slice(0, 3).map((mentor: any) => (
                    <div key={mentor.id} className="rounded-xl border border-femtrex-line/50 bg-white/[0.02] p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-white text-sm">{mentor.name}</span>
                        <span className="text-xs text-femtrex-pink">{mentor.rating} ★</span>
                      </div>
                      <p className="mt-1 text-xs text-femtrex-soft line-clamp-1">{mentor.role}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className="space-y-5">
              <div className="rounded-[24px] border border-femtrex-line bg-femtrex-panel p-6">
                <h3 className="text-xl font-semibold text-white">Platform Health</h3>
                <div className="mt-5 space-y-4">
                  <ProgressRow label="Overall readiness score" value={readiness} />
                  <ProgressRow label="Funding match quality" value={92} color="bg-femtrex-mint" />
                  <ProgressRow label="Investor deck completeness" value={76} color="bg-femtrex-blue" />
                </div>
              </div>

              <div className="rounded-[24px] border border-femtrex-line bg-femtrex-panel p-6">
                <h3 className="text-xl font-semibold text-white">Urgent Applications</h3>
                <div className="mt-5 space-y-4">
                  {urgentList.slice(0, 3).map((scheme: any) => (
                    <div key={scheme.id || scheme.name} className="rounded-2xl bg-white/[0.03] p-4">
                      <p className="font-medium text-white">{scheme.name}</p>
                      <div className="mt-3 flex items-center justify-between text-sm text-femtrex-soft">
                        <span className="flex items-center gap-2"><IndianRupee className="size-4" /> {scheme.amount}</span>
                        <span className="flex items-center gap-2"><CalendarDays className="size-4" /> {scheme.deadline || "Rolling"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </>
      )}
    </section>
  );
}
