import { systemPrompt } from "@/lib/ai/promptTemplates";

export type ChainInput = {
  question: string;
  context?: string[];
};

export function buildFounderChainPrompt(input: ChainInput) {
  const context = input.context?.length ? input.context.join("\n") : "No retrieved documents yet.";

  return `${systemPrompt}

Retrieved context:
${context}

Founder question:
${input.question}`;
}
