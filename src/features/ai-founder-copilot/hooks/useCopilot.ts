"use client";

import { useState } from "react";
import { askCopilot } from "@/features/ai-founder-copilot/services/copilotService";
import { useCopilotStore } from "@/store";

export function useCopilot(uid: string = "priya-demo") {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { messages, addMessage, streaming, setStreaming } = useCopilotStore();

  async function send(value = input) {
    const content = value.trim();
    if (!content || streaming) return;
    setInput("");
    setError(null);

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    addMessage({ id: crypto.randomUUID(), role: "user", content, createdAt: nowStr });
    setStreaming(true);

    try {
      const { answer, tools_called } = await askCopilot(content, uid);
      addMessage({
        id: crypto.randomUUID(),
        role: "assistant",
        content: answer,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tools_called: tools_called || []
      });
    } catch (err: any) {
      setError(err?.message || "Failed to reach AI Copilot. Please check backend connection.");
    } finally {
      setStreaming(false);
    }
  }

  return { input, setInput, messages, streaming, error, send };
}
