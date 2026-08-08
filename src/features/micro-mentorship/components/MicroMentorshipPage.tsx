"use client";

import { useState } from "react";
import { CheckCircle2, Clock, Play, Square, Sparkles, Loader2, Plus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/shared/components/SectionHeading";
import { useSessionTimer } from "@/features/micro-mentorship/hooks/useSessionTimer";
import { bookMicroSession, generateActionPlan, type MicroSessionData } from "@/features/micro-mentorship/services/sessionService";

export function MicroMentorshipPage() {
  const timer = useSessionTimer();

  const [challenge, setChallenge] = useState<string>("Need collateral guidance and bank interview preparation for Stand-Up India scheme.");
  const [category, setCategory] = useState<string>("Government Schemes & Loans");
  const [session, setSession] = useState<MicroSessionData | null>(null);
  const [actionPlan, setActionPlan] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [planLoading, setPlanLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleBook = async () => {
    if (!challenge.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const created = await bookMicroSession(challenge, category, "priya-demo");
      setSession(created);
      timer.setRunning(true);
    } catch (err: any) {
      setError(err?.message || "Failed to book micro mentorship session.");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    if (!session) return;
    setPlanLoading(true);
    setError(null);
    try {
      const result = await generateActionPlan(session.id);
      setActionPlan(result.action_plan);
    } catch (err: any) {
      setError(err?.message || "Failed to generate AI action plan.");
    } finally {
      setPlanLoading(false);
    }
  };

  const currentPlan = actionPlan.length > 0
    ? actionPlan
    : session?.action_plan && session.action_plan.length > 0
      ? session.action_plan
      : [
          "1. Book micro-mentorship session above.",
          "2. Click 'Generate AI Action Plan' to retrieve numbered execution steps from Gemini."
        ];

  return (
    <section className="p-6 lg:p-8">
      <SectionHeading title="Micro Mentorship" subtitle="15 minute tactical sessions with live AI action plan generation & Firestore persistence." />

      {error && (
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
          <div className="flex items-center gap-3">
            <AlertTriangle className="size-5 text-red-400" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Booking card */}
      {!session && (
        <div className="mt-8 rounded-[24px] border border-femtrex-line bg-femtrex-panel p-8">
          <h3 className="text-xl font-semibold text-white">Book 15-Minute Tactical Session</h3>
          <p className="mt-2 text-femtrex-soft">State your immediate business challenge to pair with an advisor and receive a 7-day execution plan.</p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-femtrex-soft mb-2">Category</label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Government Schemes, Manufacturing Export, Pricing Strategy"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-femtrex-soft mb-2">Challenge Description</label>
              <Input
                value={challenge}
                onChange={(e) => setChallenge(e.target.value)}
                placeholder="Describe your current bottleneck..."
              />
            </div>
            <Button variant="gradient" size="lg" onClick={handleBook} disabled={loading}>
              {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Plus className="mr-2 size-4" />}
              Book Confirmed Session (15 min)
            </Button>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="rounded-[24px] border border-femtrex-line bg-femtrex-panel p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">
                Session with {session?.mentor_name || "Kavitha Reddy"}
              </h2>
              <p className="text-femtrex-soft mt-1">{session?.challenge_description || challenge}</p>
              {session && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="rounded-full bg-femtrex-mint/20 px-3 py-1 text-xs text-femtrex-mint font-medium">
                    Status: {session.status}
                  </span>
                  <span className="rounded-full bg-femtrex-violet/20 px-3 py-1 text-xs text-femtrex-violet font-medium">
                    Type: {session.type} ({session.duration})
                  </span>
                </div>
              )}
            </div>
            <div className="rounded-[24px] border border-femtrex-line bg-white/[0.03] px-6 py-4 text-4xl font-light text-femtrex-violet">
              {timer.time}
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-femtrex-line bg-white/[0.03] p-5">
              <p className="text-sm text-femtrex-soft">01</p>
              <p className="mt-2 font-semibold text-white">Review challenge context & eligibility status</p>
            </div>
            <div className="rounded-2xl border border-femtrex-line bg-white/[0.03] p-5">
              <p className="text-sm text-femtrex-soft">02</p>
              <p className="mt-2 font-semibold text-white">Identify top 3 tactical execution steps</p>
            </div>
            <div className="rounded-2xl border border-femtrex-line bg-white/[0.03] p-5">
              <p className="text-sm text-femtrex-soft">03</p>
              <p className="mt-2 font-semibold text-white">Refine pitch story & document checklist</p>
            </div>
            <div className="rounded-2xl border border-femtrex-line bg-white/[0.03] p-5">
              <p className="text-sm text-femtrex-soft">04</p>
              <p className="mt-2 font-semibold text-white">Generate AI Action Plan into Business Passport</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="gradient" onClick={() => timer.setRunning(true)}>
              <Play className="size-4" /> Start Timer
            </Button>
            <Button variant="outline" onClick={() => timer.setRunning(false)}>
              <Square className="size-4" /> Pause
            </Button>

            {session && (
              <Button variant="outline" className="border-femtrex-violet text-femtrex-violet hover:bg-femtrex-violet/10" onClick={handleGeneratePlan} disabled={planLoading}>
                {planLoading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Sparkles className="mr-2 size-4" />}
                Generate Gemini Action Plan
              </Button>
            )}
          </div>
        </div>

        <aside className="rounded-[24px] border border-femtrex-line bg-femtrex-panel p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-3 text-xl font-semibold text-white">
                <Clock className="size-5 text-femtrex-pink" /> Concrete Action Steps
              </h3>
              {session && (
                <Button size="sm" variant="gradient" onClick={handleGeneratePlan} disabled={planLoading}>
                  {planLoading ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}
                </Button>
              )}
            </div>

            <div className="mt-6 space-y-4">
              {currentPlan.map((step, index) => (
                <label key={index} className="flex items-start gap-3 rounded-2xl bg-white/[0.03] p-4 text-femtrex-soft cursor-pointer hover:bg-white/[0.05]">
                  <Checkbox defaultChecked={index === 0} className="mt-1" />
                  <span className="text-sm text-white leading-relaxed">{step}</span>
                </label>
              ))}
            </div>
          </div>

          <Button className="mt-6 w-full" variant="outline">
            <CheckCircle2 className="size-4" /> Save Session Notes to Firestore
          </Button>
        </aside>
      </div>
    </section>
  );
}
