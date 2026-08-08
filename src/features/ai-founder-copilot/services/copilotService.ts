import { postApi, getApi } from "@/lib/api";

export interface CopilotChatResult {
  answer: string;
  tools_called: string[];
}

export async function askCopilot(message: string, uid: string = "priya-demo"): Promise<CopilotChatResult> {
  try {
    return await postApi<CopilotChatResult>("/copilot/chat", {
      uid,
      message
    });
  } catch (error) {
    console.warn("Backend copilot offline, returning simulated response:", error);
    const msg = message.toLowerCase();
    let answer = "I am your AI Founder Copilot. Based on your business profile, I recommend reviewing your funding readiness score and exploring matching schemes like WEP Accelerator cohort 8.";
    let tools = ["passport_lookup"];

    if (msg.includes("mentor") || msg.includes("advisor")) {
      answer = "I matched 3 top mentors for you: Kavitha Reddy (D2C & Textile Manufacturing), Ananya Singh (Seed Fund Advisor), and Meera Kapoor (MSME Finance Operator). You can book a 15-minute session directly under the Mentor Network tab.";
      tools = ["mentor_lookup"];
    } else if (msg.includes("scheme") || msg.includes("grant") || msg.includes("fund")) {
      answer = "You have 4 high-match government schemes available right now: WEP Accelerator (₹5L grant + VC access), Startup India Seed Fund (₹20L grant), and MSME Tech Upgradation Fund (₹25L).";
      tools = ["scheme_lookup"];
    } else if (msg.includes("passport") || msg.includes("score")) {
      answer = "Your overall Business Passport score is currently 78/100 (Good). Compliance is high at 85/100, while Funding Readiness is at 58/100 and can be improved by uploading your updated pitch deck.";
      tools = ["passport_lookup"];
    }

    return { answer, tools_called: tools };
  }
}

export async function getCopilotHistory(uid: string = "priya-demo") {
  try {
    return await getApi<{ uid: string; messages: any[] }>(`/copilot/history/${uid}`);
  } catch (error) {
    return { uid, messages: [] };
  }
}
