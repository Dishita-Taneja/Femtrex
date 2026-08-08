import { schemes } from "@/shared/constants/demo-data";
import { getGeminiModel } from "@/lib/ai/aiClient";
import { fundingPrompt } from "@/lib/ai/promptTemplates";

export async function completeChat(message: string) {
  const model = getGeminiModel();
  if (!model) {
    const top = schemes.slice(0, 3).map((scheme) => `- ${scheme.name}: ${scheme.amount}, ${scheme.match}% match`).join("\n");
    return `Great question, Priya. Based on your Business Passport profile, you qualify for 3 active MSME schemes.\n\n${top}\n\nNext action: prepare your Udyam certificate, vendor quotation, and a one-page use-of-funds note before applying.`;
  }

  const result = await model.generateContent(fundingPrompt(message));
  return result.response.text();
}
