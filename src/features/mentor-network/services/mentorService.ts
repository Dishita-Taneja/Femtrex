import { getApi, postApi } from "@/lib/api";
import type { MentorFilter } from "@/features/mentor-network/types/mentor";
import { mentors as fallbackMentors } from "@/shared/constants/demo-data";

export async function matchMentors(filters: MentorFilter, uid: string = "priya-demo"): Promise<any[]> {
  let topMatches: any[] = [];
  try {
    const response = await getApi<any>(`/mentors/match?uid=${uid}`);
    topMatches = response?.top_matches ?? [];
  } catch (error) {
    console.warn("FastAPI backend unavailable for mentor matching, using demo mentors fallback:", error);
    topMatches = fallbackMentors;
  }

  const query = filters.query ? filters.query.toLowerCase().trim() : "";

  return topMatches.filter((m: any) => {
    const name = m.name || "";
    const role = m.role || "";
    const expList = Array.isArray(m.expertise) ? m.expertise.join(" ") : "";
    const matchesQuery = !query || `${name} ${role} ${expList}`.toLowerCase().includes(query);
    const matchesExp = !filters.expertise || m.expertise?.includes(filters.expertise);
    return matchesQuery && matchesExp;
  });
}

export async function bookMentorSession(mentorId: string, agenda: string[], notes?: string) {
  try {
    return await postApi(`/mentors/${mentorId}/book`, {
      agenda,
      notes: notes || "Booking mentor session via platform."
    });
  } catch (error) {
    console.warn("Backend booking service offline, returning demo confirmation:", error);
    return {
      status: "confirmed",
      booking_id: `MOCK-${Date.now().toString().slice(-6)}`,
      mentor_id: mentorId
    };
  }
}
