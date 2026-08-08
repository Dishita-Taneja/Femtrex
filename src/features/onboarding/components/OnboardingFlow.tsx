"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BrandMark } from "@/shared/components/BrandMark";
import { GlassCard } from "@/shared/components/GlassCard";
import { onboardingSteps } from "@/features/onboarding/constants/steps";
import { useOnboarding } from "@/features/onboarding/hooks/useOnboarding";
import { cn } from "@/shared/utils/cn";

export function OnboardingFlow() {
  const { step, selected, toggle, next, back } = useOnboarding();
  const current = onboardingSteps[step];
  const progress = ((step + 1) / onboardingSteps.length) * 100;

  return (
    <main className="min-h-screen bg-femtrex-navy p-6">
      <div className="mx-auto max-w-5xl">
        <BrandMark />
        <div className="mt-12">
          <Progress value={progress} />
          <p className="mt-4 text-sm text-femtrex-soft">Step {step + 1} of {onboardingSteps.length}</p>
        </div>
        <GlassCard className="mt-8 p-8 md:p-10">
          <h1 className="text-3xl font-semibold text-white">{current.title}</h1>
          <p className="mt-3 text-femtrex-soft">Choose everything that applies. Femtrex uses this to personalize funding, mentor, and passport recommendations.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {current.options.map((option) => {
              const active = selected[current.id]?.includes(option);
              return (
                <button
                  key={option}
                  className={cn("rounded-[24px] border border-femtrex-line bg-white/[0.03] p-5 text-left text-lg text-white transition hover:border-femtrex-violet", active && "border-femtrex-pink bg-femtrex-pink/10")}
                  onClick={() => toggle(current.id, option)}
                >
                  {option}
                </button>
              );
            })}
          </div>
          <div className="mt-10 flex justify-between">
            <Button variant="outline" onClick={back} disabled={step === 0}>
              <ArrowLeft className="size-4" /> Back
            </Button>
            <Button variant="gradient" onClick={next}>
              {step === onboardingSteps.length - 1 ? "Finish setup" : "Continue"} <ArrowRight className="size-4" />
            </Button>
          </div>
        </GlassCard>
      </div>
    </main>
  );
}
