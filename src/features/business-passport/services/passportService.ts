import { getApi, postApi } from "@/lib/api";

export interface PassportData {
  uid: string;
  overall_score: number;
  label: string;
  generated_at?: string;
  ai_scored?: boolean;
  startup_readiness: { score: number; reasoning: string };
  funding_readiness: { score: number; reasoning: string };
  compliance: { score: number; reasoning: string };
  financial_health: { score: number; reasoning: string };
  investor_readiness: { score: number; reasoning: string };
}

export const fallbackPassport: PassportData = {
  uid: "priya-demo",
  overall_score: 78,
  label: "Good",
  generated_at: new Date().toISOString(),
  ai_scored: true,
  startup_readiness: { score: 72, reasoning: "Solid business model with growing team and clear traction." },
  funding_readiness: { score: 58, reasoning: "Requires clear financial projections and updated pitch deck." },
  compliance: { score: 85, reasoning: "All registration, Udyam, and tax filings up to date." },
  financial_health: { score: 63, reasoning: "Positive operating cash flow with minor receivables delay." },
  investor_readiness: { score: 54, reasoning: "Data room and formal pitch deck need refinement." }
};

export async function fetchPassport(uid: string = "priya-demo"): Promise<PassportData> {
  try {
    return await getApi<PassportData>(`/passport/${uid}`);
  } catch (error) {
    console.warn("FastAPI backend unavailable for business passport, using fallback data:", error);
    return fallbackPassport;
  }
}

export async function generatePassport(payload: any): Promise<PassportData> {
  try {
    return await postApi<PassportData>("/passport/generate", payload);
  } catch (error) {
    console.warn("FastAPI backend unavailable for passport generation, using fallback calculation:", error);
    return fallbackPassport;
  }
}
