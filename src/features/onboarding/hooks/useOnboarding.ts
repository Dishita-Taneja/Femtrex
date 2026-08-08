"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { onboardingSteps } from "@/features/onboarding/constants/steps";
import { saveOnboarding } from "@/features/onboarding/services/onboardingService";
import { useUserStore } from "@/store";

export function useOnboarding() {
  const router = useRouter();
  const completeOnboarding = useUserStore((state) => state.completeOnboarding);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<Record<string, string[]>>({});

  function toggle(id: string, value: string) {
    setSelected((current) => {
      const values = current[id] ?? [];
      return {
        ...current,
        [id]: values.includes(value) ? values.filter((item) => item !== value) : [...values, value]
      };
    });
  }

  async function next() {
    if (step < onboardingSteps.length - 1) {
      setStep(step + 1);
      return;
    }

    await saveOnboarding({
      businessName: "TextCraft",
      industry: selected.profile?.[0] ?? "Textile Manufacturing",
      challenges: selected.challenges ?? [],
      goals: selected.goals ?? [],
      fundingNeed: selected.funding?.[0] ?? "₹25 Lakhs"
    });
    completeOnboarding();
    router.push("/dashboard");
  }

  return { step, selected, toggle, next, back: () => setStep(Math.max(0, step - 1)) };
}
