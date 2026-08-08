import { getApi } from "@/lib/api";

export interface DashboardBackendData {
  readiness: number;
  passportLabel: string;
  highMatchSchemes: number;
  urgentSchemes: any[];
  matchedSchemes: any[];
  matchedMentors: any[];
}

export async function fetchDashboardData(uid: string = "priya-demo"): Promise<DashboardBackendData> {
  try {
    const [passportRes, schemesRes, mentorsRes] = await Promise.allSettled([
      getApi<any>(`/passport/${uid}`),
      getApi<any[]>(`/schemes/match?uid=${uid}`),
      getApi<any>(`/mentors/match?uid=${uid}`)
    ]);

    const passport = passportRes.status === "fulfilled" ? passportRes.value : null;
    const schemes = schemesRes.status === "fulfilled" ? schemesRes.value : [];
    const mentorsData = mentorsRes.status === "fulfilled" ? mentorsRes.value : {};

    const readiness = passport?.overall_score ?? 78;
    const passportLabel = passport?.label ?? "Good";

    const matchedSchemes = Array.isArray(schemes) ? schemes : [];
    const highMatchSchemes = matchedSchemes.filter((s) => (s.match_percent ?? s.match ?? 0) >= 80).length;
    const urgentSchemes = matchedSchemes.filter((s) => s.closingSoon || s.deadline?.includes("Days"));

    const matchedMentors = mentorsData?.top_matches ?? [];

    return {
      readiness,
      passportLabel,
      highMatchSchemes: highMatchSchemes || matchedSchemes.length,
      urgentSchemes: urgentSchemes.length ? urgentSchemes : matchedSchemes.slice(0, 2),
      matchedSchemes,
      matchedMentors
    };
  } catch (error) {
    console.error("Failed to fetch dashboard data from backend:", error);
    return {
      readiness: 78,
      passportLabel: "Good",
      highMatchSchemes: 4,
      urgentSchemes: [],
      matchedSchemes: [],
      matchedMentors: []
    };
  }
}
