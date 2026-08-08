import { getApi, postApi } from "@/lib/api";

export interface MicroSessionData {
  id: string;
  uid: string;
  challenge_description: string;
  category: string;
  mentor_name: string;
  type: string;
  duration: string;
  status: string;
  createdAt: string;
  action_plan: string[];
}

export async function bookMicroSession(
  challengeDescription: string,
  category: string = "General Strategy",
  uid: string = "priya-demo"
): Promise<MicroSessionData> {
  try {
    return await postApi<MicroSessionData>("/micro-mentorship/book", {
      uid,
      challenge_description: challengeDescription,
      category
    });
  } catch (error) {
    console.warn("Backend offline for micro session booking, returning fallback session:", error);
    return {
      id: `session-${Date.now().toString().slice(-6)}`,
      uid,
      challenge_description: challengeDescription,
      category,
      mentor_name: "Kavitha Reddy",
      type: "Micro Mentorship (15 min)",
      duration: "15:00",
      status: "Active",
      createdAt: new Date().toISOString(),
      action_plan: [
        "1. Audit current documentation (Udyam, GST returns, 6-month bank statement).",
        "2. Prepare a 1-page executive summary highlighting revenue growth & repayment ability.",
        "3. Schedule follow-up consultation with MSME loan officer."
      ]
    };
  }
}

export async function generateActionPlan(sessionId: string): Promise<{ action_plan: string[]; session: any }> {
  try {
    return await postApi<{ action_plan: string[]; session: any }>(
      `/micro-mentorship/${sessionId}/action-plan`,
      {}
    );
  } catch (error) {
    console.warn("Backend offline for action plan generation, returning demo action plan:", error);
    return {
      session: { id: sessionId },
      action_plan: [
        "1. Complete identity and business verification on platform.",
        "2. Review target grant eligibility guidelines and deadline checklist.",
        "3. Submit revised project pitch to assigned mentor before deadline."
      ]
    };
  }
}

export async function fetchMicroSession(sessionId: string): Promise<MicroSessionData> {
  try {
    return await getApi<MicroSessionData>(`/micro-mentorship/${sessionId}`);
  } catch (error) {
    console.warn("Backend offline for fetching micro session, returning demo session:", error);
    return {
      id: sessionId,
      uid: "priya-demo",
      challenge_description: "General Business Consultation",
      category: "Mentorship",
      mentor_name: "Kavitha Reddy",
      type: "Micro Mentorship (15 min)",
      duration: "15:00",
      status: "Active",
      createdAt: new Date().toISOString(),
      action_plan: ["1. Review business roadmap", "2. Connect with industry mentor"]
    };
  }
}
