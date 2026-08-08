"use client";

import { Rocket, Shield, Sparkles, TrendingUp, Users, RefreshCw, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressRow } from "@/shared/components/ProgressRow";
import { ScoreRing } from "@/shared/components/ScoreRing";
import { SectionHeading } from "@/shared/components/SectionHeading";
import { verificationTimeline } from "@/features/business-passport/constants/passport";
import { usePassport } from "@/features/business-passport/hooks/usePassport";
import { cn } from "@/shared/utils/cn";

export function BusinessPassportPage() {
  const { passport, loading, error, selectedDimension, setSelectedDimension, refetch, recalculate } = usePassport("priya-demo");

  const overall = passport?.overall_score ?? 78;
  const label = passport?.label ?? "Good";

  const dimensionsList = [
    { key: "startup_readiness", label: "Startup Readiness", data: passport?.startup_readiness, color: "violet", icon: Rocket },
    { key: "funding_readiness", label: "Funding Readiness", data: passport?.funding_readiness, color: "mint", icon: TrendingUp },
    { key: "compliance", label: "Compliance Score", data: passport?.compliance, color: "blue", icon: Shield },
    { key: "financial_health", label: "Financial Health", data: passport?.financial_health, color: "amber", icon: TrendingUp },
    { key: "investor_readiness", label: "Investor Readiness", data: passport?.investor_readiness, color: "pink", icon: Users },
  ];

  const activeDim = dimensionsList.find((d) => d.key === selectedDimension) || dimensionsList[0];

  return (
    <section className="p-6 lg:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <SectionHeading title="Business Passport" subtitle="AI-scored readiness across 5 critical dimensions powered by FastAPI." />
        <div className="flex items-center gap-3">
          <Badge variant="mint">● {passport?.ai_scored ? "AI Gemini Scored" : "Live FastAPI Verified"}</Badge>
          <Button variant="outline" size="sm" onClick={() => refetch()} title="Refresh Passport">
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {error && (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-femtrex-violet/40 bg-femtrex-violet/10 p-4 text-femtrex-soft">
          <div className="flex items-center gap-3">
            <Sparkles className="size-5 text-femtrex-violet shrink-0" />
            <div>
              <p className="text-sm font-medium text-white">Business Passport Not Generated</p>
              <p className="text-xs text-femtrex-soft mt-0.5">
                {error.includes("not been generated")
                  ? error
                  : "No passport found for this account. Generate your 5-dimensional score now using your profile."}
              </p>
            </div>
          </div>
          <Button size="sm" variant="gradient" onClick={() => recalculate()} disabled={loading} className="shrink-0">
            <Sparkles className={`mr-2 size-3.5 ${loading ? "animate-spin" : ""}`} /> Generate Passport Now
          </Button>
        </div>
      )}


      {loading && !passport ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-[24px] border border-femtrex-line bg-femtrex-panel p-16 text-femtrex-soft">
          <Loader2 className="size-8 animate-spin text-femtrex-violet mb-4" />
          <p className="text-lg font-medium text-white">Loading live credibility score from backend...</p>
        </div>
      ) : (
        <>
          <div className="mt-8 rounded-[24px] border border-femtrex-line bg-femtrex-panel p-8">
            <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
              <ScoreRing score={overall} size={184} color="violet" />
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl font-semibold text-white">Overall Credibility</h2>
                  <Badge variant={overall >= 80 ? "mint" : overall >= 60 ? "amber" : "pink"}>{label}</Badge>
                </div>
                <p className="mt-4 max-w-3xl text-lg leading-8 text-femtrex-soft">
                  {passport?.compliance?.reasoning || "Active business profile with strong compliance and funding potential."}
                </p>
                <div className="mt-8 grid gap-4 xl:grid-cols-2">
                  {dimensionsList.map((dim) => (
                    <ProgressRow
                      key={dim.key}
                      label={dim.label}
                      value={dim.data?.score ?? 50}
                      color={barColor(dim.color as "violet" | "pink" | "blue" | "mint" | "amber")}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <h2 className="mt-12 text-2xl font-semibold text-white">Dimension Breakdown</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {dimensionsList.map((dim) => {
              const Icon = dim.icon;
              const score = dim.data?.score ?? 50;
              const statusStr = score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Developing";
              return (
                <button
                  key={dim.key}
                  onClick={() => setSelectedDimension(dim.key)}
                  className={cn(
                    "rounded-[24px] border border-femtrex-line bg-femtrex-panel p-6 text-center transition hover:border-femtrex-violet",
                    selectedDimension === dim.key && "border-femtrex-blue bg-white/[0.03]"
                  )}
                >
                  <ScoreRing score={score} color={dim.color as "violet" | "pink" | "mint" | "amber" | "blue"} className="mx-auto" />
                  <Icon className="mx-auto mt-5 size-5 text-femtrex-violet" />
                  <p className="mt-3 font-semibold text-white">{dim.label}</p>
                  <p className={cn("mt-2 text-sm", statusColor(statusStr))}>{statusStr}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-10 rounded-[24px] border border-femtrex-line bg-femtrex-panel p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold text-white">{activeDim.label}</h3>
                <p className="mt-2 text-femtrex-soft max-w-2xl">{activeDim.data?.reasoning || "Evaluation based on founder metrics."}</p>
              </div>
              <span className="text-4xl font-light text-femtrex-violet">{activeDim.data?.score ?? 50}</span>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="flex items-center gap-3 text-2xl font-semibold text-white">
                <Sparkles className="size-5 text-femtrex-pink" /> AI Passport Evaluation
              </h2>
              <p className="text-femtrex-soft">Recalculate 5-dimensional scores using Gemini AI engine</p>
            </div>
            <Button variant="gradient" size="lg" onClick={recalculate} disabled={loading}>
              <Sparkles className={`size-5 ${loading ? "animate-spin" : ""}`} /> Recalculate AI Passport
            </Button>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
            <div className="rounded-[24px] border border-femtrex-line bg-femtrex-panel p-8">
              <h3 className="font-semibold text-white text-lg">Analyst Findings for {activeDim.label}</h3>
              <p className="mt-4 text-femtrex-soft leading-relaxed font-light">
                {activeDim.data?.reasoning}
              </p>
              <div className="mt-6 rounded-xl border border-femtrex-line/60 bg-white/[0.02] p-4">
                <p className="text-sm text-femtrex-mint font-medium">Recommended Next Step:</p>
                <p className="mt-1 text-sm text-femtrex-soft">
                  Maintain active Udyam & GST registrations and upload vendor machinery quotations before scheme submission.
                </p>
              </div>
            </div>

            <div className="rounded-[24px] border border-femtrex-line bg-femtrex-panel p-6">
              <h3 className="font-semibold text-white">Verification Timeline</h3>
              <div className="mt-5 space-y-4">
                {verificationTimeline.map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <span className="mt-1 size-3 rounded-full bg-femtrex-mint" />
                    <div>
                      <p className="text-white">{item.title}</p>
                      <p className="text-sm text-femtrex-soft">{item.status} · {item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function barColor(color: string) {
  return {
    violet: "bg-femtrex-violet",
    pink: "bg-femtrex-pink",
    mint: "bg-femtrex-mint",
    amber: "bg-femtrex-amber",
    blue: "bg-femtrex-blue"
  }[color] ?? "bg-femtrex-violet";
}

function statusColor(status: string) {
  return status === "Excellent" ? "text-femtrex-mint" : status === "Needs Work" ? "text-red-400" : "text-femtrex-amber";
}
