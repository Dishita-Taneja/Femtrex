import { GoogleGenerativeAI } from "@google/generative-ai";

export function getGeminiModel() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return null;
  }

  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
}
