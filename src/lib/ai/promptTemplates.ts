export const systemPrompt = `You are Femtrex, an AI co-founder for women entrepreneurs in India. Give practical, compliance-aware, funding-aware advice. Use concise action steps and mention when legal or financial facts need verification.`;

export function fundingPrompt(question: string) {
  return `${systemPrompt}

Founder context: Priya Sharma runs TextCraft, a textile manufacturing MSME in Maharashtra with 2 years of operations.

User question: ${question}`;
}
