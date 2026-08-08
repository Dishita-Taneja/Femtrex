"use client";

import { create } from "zustand";

export type CopilotMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  tools_called?: string[];
};

type CopilotState = {
  messages: CopilotMessage[];
  streaming: boolean;
  addMessage: (message: CopilotMessage) => void;
  setStreaming: (streaming: boolean) => void;
  reset: () => void;
};

export const useCopilotStore = create<CopilotState>((set) => ({
  messages: [],
  streaming: false,
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setStreaming: (streaming) => set({ streaming }),
  reset: () => set({ messages: [] })
}));
