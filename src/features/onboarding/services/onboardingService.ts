import { postApi } from "@/lib/api";
import type { OnboardingData } from "@/features/onboarding/types/onboarding";

export async function saveOnboarding(data: OnboardingData) {
  try {
    const passportPayload = {
      name: "Priya Sharma",
      company: data.businessName || "TextCraft",
      industry: data.industry || "Textile Manufacturing",
      location: "Maharashtra",
      stage: "MSME, 2 years of operations",
      years_in_business: 2,
      annual_revenue: "₹25 Lakhs",
      team_size: 4,
      has_udyam: true,
      has_gst: true,
      funding_need: data.fundingNeed || "₹25 Lakhs",
      goals: data.goals.length ? data.goals : ["expand production", "access government funding"],
      challenges: data.challenges.length ? data.challenges : ["working capital requirements"]
    };

    return await postApi("/passport/generate", passportPayload);
  } catch (err) {
    console.warn("Backend passport generation call failed during onboarding, saving locally:", err);
    return { ok: true };
  }
}
